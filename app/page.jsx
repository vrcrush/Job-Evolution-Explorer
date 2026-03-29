"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import OCCUPATIONS from "./data/occupations.js";

// ─── RESPONSIVE HOOK ─────────────────────────────────────────────────────────
function useWindowWidth() {
  const [width, setWidth] = useState(typeof window !== "undefined" ? window.innerWidth : 1200);
  useEffect(() => {
    const handle = () => setWidth(window.innerWidth);
    window.addEventListener("resize", handle);
    return () => window.removeEventListener("resize", handle);
  }, []);
  return width;
}

// ─── DATA ─────────────────────────────────────────────────────────────────────


const CATS = ["All", ...new Set(OCCUPATIONS.map(j => j.category))];
const riskColor = r => r < 20 ? "#4ade80" : r < 40 ? "#facc15" : r < 60 ? "#fb923c" : "#f87171";
const riskLabel = r => r < 20 ? "LOW" : r < 40 ? "MODERATE" : r < 60 ? "HIGH" : "CRITICAL";
const fmtW = w => w ? `$${Number(w).toLocaleString()}` : "—";
const fmtE = e => !e ? "—" : e >= 1e6 ? `${(e/1e6).toFixed(1)}M` : `${Math.round(e/1000)}K`;

// ─── BLS FETCH (batched — API allows max 50 series per call) ─────────────────
async function fetchBLSWages() {
  const ids = OCCUPATIONS.map(o => `OEUN0000000000000${o.soc6}04`);
  const BATCH = 50;
  const out = {};
  for (let i = 0; i < ids.length; i += BATCH) {
    const batch = ids.slice(i, i + BATCH);
    try {
      const res = await fetch("/api/bls", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ seriesid: batch }),
      });
      if (!res.ok) continue;
      const json = await res.json();
      if (json.status !== "REQUEST_SUCCEEDED") continue;
      for (const s of json.Results?.series || []) {
        const soc6 = s.seriesID.slice(17, 23);
        const val = parseFloat(s.data?.[0]?.value);
        if (!isNaN(val) && s.data?.[0]?.value !== "-") out[soc6] = Math.round(val);
      }
    } catch { continue; }
  }
  return out;
}

// ─── CLAUDE via server route ──────────────────────────────────────────────────
async function claudeJSON(system, userMsg) {
  const res = await fetch("/api/claude", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1000,
      system,
      messages: [{ role: "user", content: userMsg }],
    }),
  });
  const d = await res.json();
  const txt = (d.content?.[0]?.text || "{}").replace(/```json|```/g, "").trim();
  return JSON.parse(txt);
}

// ─── SHARE CARD (Canvas) — redesigned for LinkedIn scroll-stop ───────────────
function generateShareCard(job, analysis, wage, live) {
  const W = 1200, H = 630;
  const canvas = document.createElement("canvas");
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext("2d");

  // Polyfill roundRect for browsers that don't support it
  if (!ctx.roundRect) {
    ctx.roundRect = function(x, y, w, h, r) {
      if (w < 2*r) r = w/2;
      if (h < 2*r) r = h/2;
      this.beginPath();
      this.moveTo(x+r, y);
      this.arcTo(x+w, y, x+w, y+h, r);
      this.arcTo(x+w, y+h, x, y+h, r);
      this.arcTo(x, y+h, x, y, r);
      this.arcTo(x, y, x+w, y, r);
      this.closePath();
      return this;
    };
  }

  // ── Background ──
  ctx.fillStyle = "#020817";
  ctx.fillRect(0, 0, W, H);

  // Subtle dot grid
  ctx.fillStyle = "rgba(30,58,95,0.35)";
  for (let x = 0; x < W; x += 40) {
    for (let y = 0; y < H; y += 40) {
      ctx.beginPath(); ctx.arc(x, y, 1, 0, Math.PI * 2); ctx.fill();
    }
  }

  // Left color bar — risk color
  const rc = riskColor(job.automationRisk);
  const barGrad = ctx.createLinearGradient(0, 0, 0, H);
  barGrad.addColorStop(0, rc);
  barGrad.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = barGrad;
  ctx.fillRect(0, 0, 6, H);

  // Top-right glow behind the big number
  const glow = ctx.createRadialGradient(980, 200, 10, 980, 200, 320);
  glow.addColorStop(0, `${rc}22`);
  glow.addColorStop(1, "transparent");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, H);

  // ── LEFT COLUMN ──────────────────────────────────────────── x: 60–660
  // Category + SOC chip
  ctx.fillStyle = "rgba(56,189,248,0.1)";
  ctx.beginPath(); ctx.roundRect(60, 52, 320, 28, 5); ctx.fill();
  ctx.strokeStyle = "rgba(56,189,248,0.25)";
  ctx.lineWidth = 1;
  ctx.beginPath(); ctx.roundRect(60, 52, 320, 28, 5); ctx.stroke();
  ctx.font = "bold 11px monospace";
  ctx.fillStyle = "#38bdf8";
  ctx.fillText(`${job.category.toUpperCase()}  ·  BLS SOC ${job.soc}`, 76, 71);

  // Job title — large
  ctx.font = "bold 58px Georgia";
  ctx.fillStyle = "#ffffff";
  // Word-wrap title if long
  const words = job.title.split(" ");
  let line = "", lines = [], maxW = 580;
  for (const w of words) {
    const test = line ? `${line} ${w}` : w;
    if (ctx.measureText(test).width > maxW && line) { lines.push(line); line = w; }
    else line = test;
  }
  lines.push(line);
  lines.forEach((l, i) => ctx.fillText(l, 60, 148 + i * 66));

  const titleBottom = 148 + lines.length * 66;

  // Divider
  ctx.fillStyle = "rgba(56,189,248,0.2)";
  ctx.fillRect(60, titleBottom + 10, 560, 1);

  // Headline quote
  if (analysis?.headline) {
    ctx.font = "italic 19px Georgia";
    ctx.fillStyle = "#93c5fd";
    const hl = `"${analysis.headline}"`;
    // Word wrap headline
    const hWords = hl.split(" ");
    let hLine = "", hLines = [];
    for (const w of hWords) {
      const test = hLine ? `${hLine} ${w}` : w;
      if (ctx.measureText(test).width > 540 && hLine) { hLines.push(hLine); hLine = w; }
      else hLine = test;
    }
    hLines.push(hLine);
    hLines.slice(0, 3).forEach((l, i) => ctx.fillText(l, 60, titleBottom + 46 + i * 28));
  }

  // Survival strategy label + text
  const stratY = titleBottom + 160;
  ctx.font = "bold 10px monospace";
  ctx.fillStyle = "#4ade80";
  ctx.fillText("◈ SURVIVAL STRATEGY", 60, stratY);
  if (analysis?.survivalStrategy) {
    ctx.font = "14px Georgia";
    ctx.fillStyle = "#bbf7d0";
    const sWords = analysis.survivalStrategy.split(" ");
    let sLine = "", sLines = [];
    for (const w of sWords) {
      const test = sLine ? `${sLine} ${w}` : w;
      if (ctx.measureText(test).width > 540 && sLine) { sLines.push(sLine); sLine = w; }
      else sLine = test;
    }
    sLines.push(sLine);
    sLines.slice(0, 3).forEach((l, i) => ctx.fillText(l, 60, stratY + 22 + i * 22));
  }

  // ── RIGHT COLUMN ─────────────────────────────────────────── x: 720–1140

  // BIG automation risk number
  ctx.font = "bold 130px Georgia";
  ctx.fillStyle = rc;
  ctx.textAlign = "right";
  ctx.fillText(`${job.automationRisk}%`, 1140, 220);
  ctx.textAlign = "left";

  // Risk label
  ctx.font = "bold 14px monospace";
  ctx.fillStyle = rc;
  ctx.textAlign = "right";
  ctx.fillText("AUTOMATION RISK", 1140, 250);
  ctx.textAlign = "left";

  // Risk verdict sentence
  const verdicts = {
    LOW:      "This role is well-positioned for the future.",
    MODERATE: "Significant transformation ahead — adapt now.",
    HIGH:     "This job is running out of time.",
    CRITICAL: "Automation will fundamentally eliminate this role.",
  };
  const verdict = verdicts[riskLabel(job.automationRisk)];
  ctx.font = "italic 14px Georgia";
  ctx.fillStyle = "#94a3b8";
  ctx.textAlign = "right";
  // word wrap verdict
  const vWords = verdict.split(" ");
  let vLine = "", vLines = [];
  for (const w of vWords) {
    const test = vLine ? `${vLine} ${w}` : w;
    if (ctx.measureText(test).width > 390 && vLine) { vLines.push(vLine); vLine = w; }
    else vLine = test;
  }
  vLines.push(vLine);
  vLines.forEach((l, i) => ctx.fillText(l, 1140, 278 + i * 22));
  ctx.textAlign = "left";

  // Divider right
  ctx.fillStyle = "rgba(30,58,95,0.6)";
  ctx.fillRect(720, 320, 420, 1);

  // Stats — growth + wage stacked
  const statsR = [
    { label: "10-YR GROWTH",   val: `${job.projectedGrowth > 0 ? "+" : ""}${job.projectedGrowth}%`, color: job.projectedGrowth >= 0 ? "#38bdf8" : "#f87171" },
    { label: "MEDIAN WAGE",    val: fmtW(wage), color: "#f1f5f9" },
    { label: "U.S. WORKFORCE", val: job.emp >= 1e6 ? `${(job.emp/1e6).toFixed(1)}M` : `${Math.round(job.emp/1000)}K`, color: "#f1f5f9" },
  ];
  statsR.forEach((s, i) => {
    const sx = 720 + i * 145, sy = 340;
    ctx.font = "bold 9px monospace";
    ctx.fillStyle = "#64748b";
    ctx.fillText(s.label, sx, sy);
    ctx.font = "bold 26px Georgia";
    ctx.fillStyle = s.color;
    ctx.fillText(s.val, sx, sy + 34);
  });

  // ── BOTTOM BAR ───────────────────────────────────────────────────────────
  ctx.fillStyle = "rgba(15,39,68,0.8)";
  ctx.fillRect(0, 570, W, 60);

  // 00IA brand
  ctx.font = "bold 24px Georgia";
  ctx.fillStyle = "#38bdf8";
  ctx.fillText("00IA", 60, 607);

  ctx.font = "bold 11px monospace";
  ctx.fillStyle = "#475569";
  ctx.fillText("THOUGHTS, CODE, AND COGNITION  ·  00IA.COM", 120, 607);

  // CTA right
  ctx.font = "bold 12px monospace";
  ctx.fillStyle = "#f1f5f9";
  ctx.textAlign = "right";
  ctx.fillText("Is YOUR job future-proof? → 00ia.com", W - 60, 600);
  ctx.textAlign = "left";

  // BLS badge
  ctx.font = "10px monospace";
  ctx.fillStyle = live ? "#4ade80" : "#fb923c";
  ctx.textAlign = "right";
  ctx.fillText(live ? "⬤ LIVE BLS DATA" : "◯ BLS ESTIMATE", W - 60, 616);
  ctx.textAlign = "left";

  return canvas;
}

// ─── UI PIECES ────────────────────────────────────────────────────────────────
const GrowthBar = ({ v }) => (
  <div style={{ display:"flex", alignItems:"center", gap:8 }}>
    <div style={{ width:110, height:5, background:"#1e293b", borderRadius:3, position:"relative" }}>
      <div style={{ position:"absolute", height:"100%", borderRadius:3,
        width:`${(Math.min(Math.abs(v),55)/55)*100}%`,
        background: v >= 0 ? "#38bdf8" : "#f87171" }} />
    </div>
    <span style={{ fontFamily:"monospace", fontSize:11, fontWeight:700, color: v>=0?"#38bdf8":"#f87171" }}>
      {v>0?"+":""}{v}%
    </span>
  </div>
);

const Typewriter = ({ text }) => {
  const [out, setOut] = useState(""); const [done, setDone] = useState(false);
  useEffect(() => {
    setOut(""); setDone(false); let i=0;
    const t = setInterval(()=>{ i++; setOut(text.slice(0,i)); if(i>=text.length){clearInterval(t);setDone(true);}}, 14);
    return ()=>clearInterval(t);
  }, [text]);
  return <>{out}{!done&&<span style={{animation:"blink .8s infinite",color:"#38bdf8"}}>▍</span>}</>;
};

const SimilarCard = ({ job, wage, onClick }) => (
  <div onClick={() => onClick(job)} style={{
    background:"#0a1929", border:"1px solid #0f2744", borderRadius:8, padding:"12px 14px",
    cursor:"pointer", transition:"all .2s", flex:1, minWidth:0,
  }}
  onMouseEnter={e => { e.currentTarget.style.borderColor="#38bdf8"; e.currentTarget.style.background="rgba(56,189,248,.06)"; }}
  onMouseLeave={e => { e.currentTarget.style.borderColor="#0f2744"; e.currentTarget.style.background="#0a1929"; }}>
    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:8 }}>
      <div style={{ fontSize:12, fontWeight:600, color:"#f1f5f9", lineHeight:1.3, flex:1, paddingRight:8 }}>{job.title}</div>
      <div style={{ fontFamily:"monospace", fontSize:9, fontWeight:700, color:riskColor(job.automationRisk),
        background:`${riskColor(job.automationRisk)}15`, padding:"2px 6px", borderRadius:3, whiteSpace:"nowrap",
        border:`1px solid ${riskColor(job.automationRisk)}30`, flexShrink:0 }}>
        {job.automationRisk}%
      </div>
    </div>
    <GrowthBar v={job.projectedGrowth} />
    <div style={{ fontFamily:"monospace", fontSize:10, color:"#c9d5e3", marginTop:7 }}>{fmtW(wage)}/yr</div>
  </div>
);

// ─── APP ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [mounted, setMounted]    = useState(false);
  const [wages, setWages]        = useState({});
  const [wageStatus, setWStatus] = useState("loading");
  const [selected, setSelected]  = useState(null);
  const [analysis, setAnalysis]  = useState(null);
  const [aiLoading, setAiLoad]   = useState(false);
  const [filter, setFilter]      = useState("All");
  const [search, setSearch]      = useState("");
  const [sortBy, setSort]        = useState("growth");
  const [mapping, setMapping]    = useState(false);
  const [mapHint, setMapHint]    = useState("");
  const [sharing, setSharing]    = useState(false);
  const [email, setEmail]        = useState("");
  const [emailStatus, setEmailStatus] = useState("idle"); // idle | submitting | done | error
  const [showModal, setShowModal] = useState(false);
  const detailRef = useRef(null);
  const windowWidth = useWindowWidth();

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    fetchBLSWages()
      .then(d => { setWages(d); setWStatus("live"); })
      .catch(() => setWStatus("fallback"));
  }, []);

  if (!mounted) return null;
  const isMobile = windowWidth < 768;

  const getWage = (occ) => {
    const live = wages[occ.soc6];
    return live ? { value: live, live: true } : { value: occ.seedWage, live: false };
  };

  const allWithWages = OCCUPATIONS.map(o => ({ ...o, ...getWage(o) }));

  const jobs = allWithWages
    .filter(j => (filter === "All" || j.category === filter) && j.title.toLowerCase().includes(search.toLowerCase()))
    .sort((a,b) =>
      sortBy === "growth" ? b.projectedGrowth - a.projectedGrowth :
      sortBy === "risk"   ? a.automationRisk  - b.automationRisk  :
                            (b.value||0)       - (a.value||0)
    );

  const noMatch = search.length > 2 && jobs.length === 0;

  const mapWithClaude = async () => {
    setMapping(true); setMapHint("");
    try {
      const occupationList = OCCUPATIONS.map(o => `${o.title} (${o.soc})`).join(", ");
      const result = await claudeJSON(
        `You map job titles to the closest BLS occupation. Reply ONLY with valid JSON: {"soc":"XX-XXXX","title":"matched title","reasoning":"brief"}`,
        `User typed: "${search}". Available occupations: ${occupationList}. Pick the single closest match.`
      );
      const match = OCCUPATIONS.find(o => o.soc === result.soc);
      if (match) {
        setSearch("");
        setMapHint(`Mapped "${search}" → ${match.title}`);
        analyze({ ...match, ...getWage(match) });
      }
    } catch { setMapHint("Couldn't map — try a different term"); }
    setMapping(false);
  };

  const analyze = async (job) => {
    setSelected(job); setAnalysis(null); setAiLoad(true);
    setTimeout(() => detailRef.current?.scrollIntoView({ behavior:"smooth" }), 50);
    const w = getWage(job);
    try {
      const result = await claudeJSON(
        `You are a US labor market futurist. Reply ONLY with valid JSON, no markdown:
{"headline":"sharp 10-word prediction","outlook":"2-3 sentence 2035 narrative","killedBy":["up to 3 specific threats"],"evolvedBy":["up to 3 uplifting forces"],"emergingSkills":["4 must-develop skills"],"survivalStrategy":"one concrete actionable sentence"}`,
        `Occupation: ${job.title} (SOC ${job.soc}) | Category: ${job.category}
BLS Wage: ${fmtW(w.value)} (${w.live ? "live BLS OEWS" : "BLS estimate"}) | Workforce: ${fmtE(job.emp)}
10-yr Growth: ${job.projectedGrowth}% | Automation Risk: ${job.automationRisk}/100`
      );
      setAnalysis(result);
    } catch { setAnalysis({ error: true }); }
    setAiLoad(false);
  };

  const similarRoles = selected ? allWithWages
    .filter(j => j.soc !== selected.soc)
    .map(j => ({ ...j, score: (j.category === selected.category ? 0 : 50) + Math.abs(j.automationRisk - selected.automationRisk) }))
    .sort((a,b) => a.score - b.score)
    .slice(0, 3) : [];

  const shareCard = () => {
    if (!selected || !analysis) return;
    setSharing(true);
    try {
      const w = getWage(selected);
      const canvas = generateShareCard(selected, analysis, w.value, w.live);
      canvas.toBlob(blob => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url; a.download = `00ia-${selected.title.replace(/\s+/g,"-").toLowerCase()}.png`;
        a.click(); URL.revokeObjectURL(url);
        setSharing(false);
        setShowModal("download");
      }, "image/png");
    } catch { setSharing(false); }
  };

  const shareLinkedIn = () => {
    if (!selected || !analysis) return;
    setSharing(true);
    try {
      const w = getWage(selected);
      const canvas = generateShareCard(selected, analysis, w.value, w.live);
      canvas.toBlob(blob => {
        // Download card
        const cardUrl = URL.createObjectURL(blob);
        const dl = document.createElement("a");
        dl.href = cardUrl;
        dl.download = `00ia-${selected.title.replace(/\s+/g,"-").toLowerCase()}.png`;
        document.body.appendChild(dl);
        dl.click();
        document.body.removeChild(dl);
        setTimeout(() => URL.revokeObjectURL(cardUrl), 1000);
        setSharing(false);
        setShowModal("linkedin");
      }, "image/png");
    } catch (e) { console.error(e); setSharing(false); }
  };



  return (
    <div style={{ background:"#020817", minHeight:"100vh", color:"#f1f5f9", fontFamily:"Georgia,serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=Playfair+Display:wght@700;900&display=swap');
        @keyframes blink  {0%,100%{opacity:1}50%{opacity:0}}
        @keyframes fadeIn {from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
        @keyframes pulse  {0%,100%{opacity:.45}50%{opacity:1}}
        @keyframes spin   {from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
        @keyframes scan   {0%{top:-4px}100%{top:100vh}}
        .jrow:hover{background:rgba(56,189,248,.07)!important;cursor:pointer}
        .jrow.on{background:rgba(56,189,248,.12)!important;border-left:3px solid #38bdf8!important}
        .catbtn:hover{background:rgba(56,189,248,.14)!important}
        .catbtn.on{background:rgba(56,189,248,.22)!important;color:#38bdf8!important;border-color:#38bdf8!important}
        .sbtn{background:none;border:none;cursor:pointer;font-family:'DM Mono',monospace;font-size:11px;letter-spacing:1px;padding:0 0 2px;transition:color .2s;color:#94a3b8}
        .sbtn:hover,.sbtn.on{color:#38bdf8!important}
        .sbtn.on{border-bottom:2px solid #38bdf8}
        input::placeholder{color:#475569}
        ::-webkit-scrollbar{width:5px}::-webkit-scrollbar-track{background:#0f172a}::-webkit-scrollbar-thumb{background:#1e3a5f;border-radius:3px}
      `}</style>

      <div style={{position:"fixed",inset:0,pointerEvents:"none",zIndex:99,overflow:"hidden",opacity:.022}}>
        <div style={{position:"absolute",width:"100%",height:3,background:"#38bdf8",animation:"scan 9s linear infinite"}}/>
      </div>

      {/* Instruction Modal */}
      {showModal && (
        <div onClick={() => setShowModal(false)} style={{
          position:"fixed",inset:0,zIndex:300,background:"rgba(2,8,23,.85)",
          display:"flex",alignItems:"center",justifyContent:"center",animation:"fadeIn .2s ease",
          backdropFilter:"blur(4px)",cursor:"pointer"
        }}>
          <div onClick={e => e.stopPropagation()} style={{
            background:"#0a1929",border:"1px solid #1e3a5f",borderRadius:12,
            padding:"32px 36px",maxWidth:480,width:"90%",cursor:"default",
            boxShadow:"0 24px 80px rgba(0,0,0,.8)",animation:"fadeIn .25s ease"
          }}>
            {/* Header */}
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:24}}>
              <div>
                <div style={{fontFamily:"monospace",fontSize:10,color:"#38bdf8",letterSpacing:3,marginBottom:6}}>
                  {showModal === "linkedin" ? "◈ SHARING TO LINKEDIN" : "◈ CARD DOWNLOADED"}
                </div>
                <div style={{fontFamily:"'Playfair Display',serif",fontSize:20,fontWeight:700,color:"#f1f5f9"}}>
                  {showModal === "linkedin" ? "Here's what just happened" : "Your card is ready"}
                </div>
              </div>
              <button onClick={() => setShowModal(false)} style={{
                background:"none",border:"none",color:"#475569",fontSize:20,cursor:"pointer",padding:"0 0 0 16px",lineHeight:1
              }}>✕</button>
            </div>

            <div style={{display:"flex",flexDirection:"column",gap:16,marginBottom:28}}>
              {(showModal === "linkedin" ? [
                { n:"1", icon:"↓", color:"#38bdf8", title:"Card downloaded", desc:`Your share card was saved to your Downloads folder as "00ia-${selected?.title?.replace(/\s+/g,"-").toLowerCase()}.png"` },
                { n:"2", icon:"📎", color:"#60a5fa", title:"Attach the image", desc:"In the LinkedIn composer, click the image icon and attach the downloaded card from your Downloads folder" },
                { n:"3", icon:"✓",  color:"#4ade80", title:"Review and post", desc:"Edit the pre-filled text as needed, then hit Post — the card stops the scroll" },
              ] : [
                { n:"1", icon:"↓", color:"#38bdf8", title:"Card downloaded", desc:`Your share card was saved to your Downloads folder as "00ia-${selected?.title?.replace(/\s+/g,"-").toLowerCase()}.png"` },
                { n:"2", icon:"↗", color:"#60a5fa", title:"Post it anywhere", desc:"Upload the PNG to LinkedIn, Twitter/X, or any platform. It's 1200×630 — the ideal size for social sharing" },
              ]).map(s => (
                <div key={s.n} style={{display:"flex",gap:14,alignItems:"flex-start"}}>
                  <div style={{
                    width:32,height:32,borderRadius:"50%",background:`${s.color}18`,
                    border:`1px solid ${s.color}40`,display:"flex",alignItems:"center",
                    justifyContent:"center",fontSize:14,color:s.color,flexShrink:0,fontWeight:700
                  }}>{s.icon}</div>
                  <div>
                    <div style={{fontSize:13,fontWeight:600,color:"#f1f5f9",marginBottom:3}}>{s.title}</div>
                    <div style={{fontSize:12,color:"#94a3b8",lineHeight:1.6}}>{s.desc}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* CTA */}
            {showModal === "linkedin" && selected && analysis && (
              <div style={{marginBottom:16}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                  <div style={{fontFamily:"monospace",fontSize:10,color:"#38bdf8",letterSpacing:2}}>✏ COPY THIS TEXT INTO YOUR POST</div>
                  <button onClick={() => {
                    const text = `Is your job future-proof?\n\n${selected.title} has a ${selected.automationRisk}% automation risk and ${selected.projectedGrowth > 0 ? "+" : ""}${selected.projectedGrowth}% projected 10-year growth over the next decade.\n\n"${analysis.headline}"\n\nExplore all 321 occupations → https://00ia.com\n\n#FutureOfWork #AI #CareerDevelopment #00IA`;
                    navigator.clipboard.writeText(text).then(() => {
                      document.getElementById("copy-btn").innerText = "✓ Copied!";
                      setTimeout(() => { const b = document.getElementById("copy-btn"); if(b) b.innerText = "Copy"; }, 2000);
                    });
                  }} id="copy-btn" style={{
                    background:"rgba(56,189,248,.1)",border:"1px solid rgba(56,189,248,.3)",
                    color:"#38bdf8",padding:"4px 12px",borderRadius:4,fontFamily:"monospace",
                    fontSize:10,cursor:"pointer",letterSpacing:1
                  }}>Copy</button>
                </div>
                <div style={{
                  background:"#030d1c",border:"1px solid #1e3a5f",borderRadius:7,
                  padding:"14px 16px",fontSize:12,color:"#cbd5e1",lineHeight:1.8,
                  fontFamily:"Georgia,serif",whiteSpace:"pre-wrap"
                }}>{`Is your job future-proof?\n\n${selected.title} has a ${selected.automationRisk}% automation risk and ${selected.projectedGrowth > 0 ? "+" : ""}${selected.projectedGrowth}% projected 10-year growth over the next decade.\n\n"${analysis.headline}"\n\nExplore all 321 occupations → https://00ia.com\n\n#FutureOfWork #AI #CareerDevelopment #00IA`}</div>
              </div>
            )}

            {showModal === "linkedin" && selected && analysis && (
              isMobile ? (
                // Mobile: copy button + instruction to open LinkedIn app
                <div style={{marginBottom:10}}>
                  <button onClick={() => {
                    const text = `Is your job future-proof?\n\n${selected.title} has a ${selected.automationRisk}% automation risk and ${selected.projectedGrowth > 0 ? "+" : ""}${selected.projectedGrowth}% projected 10-year growth over the next decade.\n\n"${analysis.headline}"\n\nExplore all 321 occupations → https://00ia.com\n\n#FutureOfWork #AI #CareerDevelopment #00IA`;
                    navigator.clipboard.writeText(text).then(() => {
                      document.getElementById("li-copy-btn").innerText = "✓ Text Copied!";
                      setTimeout(() => { const b = document.getElementById("li-copy-btn"); if(b) b.innerText = "📋 Copy Post Text"; }, 2500);
                    });
                  }} id="li-copy-btn" style={{
                    display:"block",width:"100%",background:"rgba(10,102,194,.15)",
                    border:"1px solid rgba(10,102,194,.4)",color:"#60a5fa",
                    padding:"10px",borderRadius:7,fontFamily:"monospace",fontSize:12,
                    cursor:"pointer",letterSpacing:1,textAlign:"center",marginBottom:8,
                    boxSizing:"border-box"
                  }}>📋 Copy Post Text</button>
                  <div style={{fontFamily:"monospace",fontSize:10,color:"#475569",textAlign:"center"}}>
                    Then open LinkedIn app → New Post → Paste → attach the downloaded image
                  </div>
                </div>
              ) : (
                // Desktop: direct link
                <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent("https://00ia.com")}`}
                  target="_blank" rel="noopener noreferrer"
                  onClick={() => setShowModal(false)}
                  style={{display:"block",width:"100%",background:"rgba(10,102,194,.15)",
                    border:"1px solid rgba(10,102,194,.4)",color:"#60a5fa",
                    padding:"10px",borderRadius:7,fontFamily:"monospace",fontSize:12,
                    cursor:"pointer",letterSpacing:1,textAlign:"center",
                    textDecoration:"none",marginBottom:10,boxSizing:"border-box"}}>
                  ↗ Open LinkedIn Post
                </a>
              )
            )}

            <button onClick={() => setShowModal(false)} style={{
              width:"100%",background:"rgba(56,189,248,.1)",border:"1px solid rgba(56,189,248,.3)",
              color:"#38bdf8",padding:"10px",borderRadius:7,fontFamily:"monospace",fontSize:12,
              cursor:"pointer",letterSpacing:1,transition:"all .2s"
            }}>Got it</button>
          </div>
        </div>
      )}

      <header style={{borderBottom:"1px solid #0f2744",padding: isMobile ? "14px 16px 12px" : "22px 30px 18px"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end",flexWrap:"wrap",gap:12}}>
          <div>
            <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:6,flexWrap:"wrap"}}>
              <div style={{fontFamily:"'DM Mono',monospace",fontSize:10,color:"#38bdf8",letterSpacing:4}}>
                U.S. BUREAU OF LABOR STATISTICS · OCCUPATIONAL PROJECTIONS 2024–2034
              </div>
              <a href="https://00ia.com" target="_blank" rel="noopener noreferrer"
                style={{fontFamily:"'DM Mono',monospace",fontSize:10,fontWeight:500,color:"#020817",
                  background:"#38bdf8",padding:"3px 10px",borderRadius:4,letterSpacing:2,
                  textDecoration:"none",whiteSpace:"nowrap",opacity:1,transition:"opacity .2s"}}
                onMouseEnter={e=>e.currentTarget.style.opacity=".75"}
                onMouseLeave={e=>e.currentTarget.style.opacity="1"}>
                00IA.COM ↗
              </a>
            </div>
            <h1 style={{fontFamily:"'Playfair Display',serif",fontSize:"clamp(22px,3vw,38px)",fontWeight:900,margin:0,lineHeight:1.1}}>
              The Future of <span style={{color:"#38bdf8"}}>American Work</span>
            </h1>
          </div>
          {!isMobile && <div style={{display:"flex",alignItems:"center",gap:8,background:"#0a1929",border:"1px solid #0f2744",borderRadius:7,padding:"8px 14px"}}>
            {wageStatus === "loading"  && <><div style={{width:7,height:7,border:"1.5px solid #38bdf8",borderTopColor:"transparent",borderRadius:"50%",animation:"spin .7s linear infinite"}}/><span style={{fontFamily:"monospace",fontSize:11,color:"#38bdf8"}}>Connecting to BLS API…</span></>}
            {wageStatus === "live"     && <><div style={{width:7,height:7,borderRadius:"50%",background:"#4ade80"}}/><span style={{fontFamily:"monospace",fontSize:11,color:"#4ade80"}}>Live · BLS OEWS 2024</span></>}
            {wageStatus === "fallback" && <><div style={{width:7,height:7,borderRadius:"50%",background:"#fb923c"}}/><span style={{fontFamily:"monospace",fontSize:11,color:"#fb923c"}}>BLS API unavailable · using published estimates</span></>}
            <div style={{width:1,height:20,background:"#0f2744",margin:"0 4px"}}/>
            <div style={{width:7,height:7,borderRadius:"50%",background:"#38bdf8"}}/>
            <span style={{fontFamily:"monospace",fontSize:11,color:"#a0aec0"}}>Projections · BLS EP Program</span>
          </div>}
        </div>
      </header>

      <div style={{display:"flex",flexDirection: isMobile ? "column" : "row",minHeight: isMobile ? "auto" : "calc(100vh - 110px)"}}>

        {/* LEFT PANEL */}
        <div style={{width: isMobile ? "100%" : "min(380px,42%)",borderRight: isMobile ? "none" : "1px solid #0f2744",borderBottom: isMobile ? "1px solid #0f2744" : "none",display:"flex",flexDirection:"column", maxHeight: isMobile ? "50vh" : "none"}}>
          <div style={{padding:"14px 18px",borderBottom:"1px solid #0f2744",background:"#030d1c"}}>
            <div style={{position:"relative",marginBottom:10}}>
              <input
                value={search}
                onChange={e => { setSearch(e.target.value); setMapHint(""); }}
                onKeyDown={e => e.key === "Enter" && noMatch && mapWithClaude()}
                placeholder="Search or type any job title…"
                style={{width:"100%",background:"#0f172a",border:"1px solid #1e3a5f",borderRadius:5,
                  color:"#f1f5f9",padding:"8px 12px",fontFamily:"monospace",fontSize:12,
                  outline:"none",boxSizing:"border-box"}}
              />
            </div>

            {noMatch && (
              <div style={{marginBottom:10,display:"flex",alignItems:"center",gap:8}}>
                <span style={{fontFamily:"monospace",fontSize:11,color:"#c9d5e3"}}>No preset match —</span>
                <button onClick={mapWithClaude} disabled={mapping} style={{
                  background:"rgba(56,189,248,.1)",border:"1px solid rgba(56,189,248,.3)",
                  color:"#38bdf8",padding:"4px 12px",borderRadius:4,fontFamily:"monospace",
                  fontSize:11,cursor:"pointer",display:"flex",alignItems:"center",gap:6}}>
                  {mapping
                    ? <><div style={{width:9,height:9,border:"1.5px solid #38bdf8",borderTopColor:"transparent",borderRadius:"50%",animation:"spin .7s linear infinite"}}/>Mapping…</>
                    : <>◈ Map with AI</>}
                </button>
              </div>
            )}
            {mapHint && (
              <div style={{fontFamily:"monospace",fontSize:10,color:"#4ade80",marginBottom:8,animation:"fadeIn .3s ease"}}>
                ✓ {mapHint}
              </div>
            )}

            <div style={{display:"flex",gap:5,flexWrap:"wrap",marginBottom:9}}>
              {CATS.map(c => (
                <button key={c} className={`catbtn${filter===c?" on":""}`} onClick={()=>setFilter(c)}
                  style={{background:"transparent",border:"1px solid #1e3a5f",color:"#a0aec0",
                    padding:"3px 8px",borderRadius:4,fontFamily:"monospace",fontSize:9,cursor:"pointer",transition:"all .2s"}}>
                  {c.toUpperCase()}
                </button>
              ))}
            </div>
            <div style={{display:"flex",gap:12,alignItems:"center",fontFamily:"monospace",fontSize:10,color:"#c9d5e3"}}>
              <span>SORT:</span>
              {[["growth","GROWTH"],["risk","SAFETY"],["wage","WAGE"]].map(([v,l])=>(
                <button key={v} className={`sbtn${sortBy===v?" on":""}`} onClick={()=>setSort(v)}>{l}</button>
              ))}
              <span style={{marginLeft:"auto",color:"#64748b"}}>{jobs.length} roles</span>
            </div>
          </div>

          <div style={{flex:1,overflowY:"auto"}}>
            {jobs.map(job => (
              <div key={job.soc} className={`jrow${selected?.soc===job.soc?" on":""}`}
                onClick={()=>analyze(job)}
                style={{padding:"11px 18px",borderBottom:"1px solid #0a1929",borderLeft:"3px solid transparent",transition:"all .2s"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:6}}>
                  <div>
                    <div style={{fontSize:13,fontWeight:600,color:"#f1f5f9",marginBottom:1}}>{job.title}</div>
                    <div style={{fontFamily:"monospace",fontSize:9,color:"#c9d5e3"}}>
                      {job.category.toUpperCase()} · <span style={{color:job.live?"#4ade80":"#64748b"}}>{fmtW(job.value)}</span>
                      {job.live && <span style={{color:"#4ade80",marginLeft:3}}>●</span>}
                    </div>
                  </div>
                  <div style={{fontFamily:"monospace",fontSize:9,fontWeight:700,color:riskColor(job.automationRisk),
                    background:`${riskColor(job.automationRisk)}15`,padding:"2px 7px",borderRadius:3,
                    border:`1px solid ${riskColor(job.automationRisk)}30`,whiteSpace:"nowrap"}}>
                    {riskLabel(job.automationRisk)}
                  </div>
                </div>
                <GrowthBar v={job.projectedGrowth}/>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div ref={detailRef} style={{flex:1,overflowY:"auto",padding: isMobile ? "16px" : "26px 30px"}}>
          {!selected ? (
            <div style={isMobile ? {
              display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",
              gap:14,opacity:.28,padding:"60px 20px"
            } : {
              position:"fixed",top:"50%",left:"60%",transform:"translate(-50%,-50%)",
              display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",
              gap:14,opacity:.28,pointerEvents:"none",zIndex:1
            }}>
              <div style={{fontSize:42}}>◈</div>
              <div style={{fontFamily:"monospace",fontSize:12,letterSpacing:4,color:"#38bdf8"}}>SELECT AN OCCUPATION</div>
              <div style={{fontSize:13,color:"#c9d5e3",textAlign:"center",maxWidth:260,lineHeight:1.7}}>
                Select any role — or type any job title to map it with AI
              </div>
            </div>
          ) : (()=>{
            const w = getWage(selected);
            return (
              <div style={{animation:"fadeIn .35s ease",maxWidth:660}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:6,flexWrap:"wrap",gap:8}}>
                  <div>
                    <div style={{fontFamily:"monospace",fontSize:10,color:"#38bdf8",letterSpacing:3,marginBottom:5}}>
                      {selected.category.toUpperCase()} · SOC {selected.soc}
                    </div>
                    <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:"clamp(22px,3vw,32px)",fontWeight:900,margin:0,lineHeight:1.1}}>
                      {selected.title}
                    </h2>
                  </div>
                  {analysis && !analysis.error && (
                    <div style={{display:"flex",flexDirection: isMobile ? "column" : "row",gap:8,flexWrap:"wrap",marginTop:4}}>
                      <button onClick={shareCard} disabled={sharing} style={{
                        background: sharing?"rgba(56,189,248,.05)":"rgba(56,189,248,.1)",
                        border:"1px solid rgba(56,189,248,.3)",color:"#38bdf8",
                        padding:"8px 14px",borderRadius:6,fontFamily:"monospace",fontSize:11,
                        cursor: sharing?"default":"pointer",display:"flex",alignItems:"center",gap:7,
                        transition:"all .2s",letterSpacing:1,whiteSpace:"nowrap"
                      }}>
                        {sharing
                          ? <><div style={{width:9,height:9,border:"1.5px solid #38bdf8",borderTopColor:"transparent",borderRadius:"50%",animation:"spin .7s linear infinite"}}/>Generating…</>
                          : <>↓ Download Card</>}
                      </button>
                      <button onClick={shareLinkedIn} disabled={sharing} style={{
                        background: sharing?"rgba(10,102,194,.05)":"rgba(10,102,194,.15)",
                        border:"1px solid rgba(10,102,194,.4)",color:"#60a5fa",
                        padding:"8px 14px",borderRadius:6,fontFamily:"monospace",fontSize:11,
                        cursor: sharing?"default":"pointer",display:"flex",alignItems:"center",gap:7,
                        transition:"all .2s",letterSpacing:1,whiteSpace:"nowrap"
                      }}>
                        {sharing
                          ? <><div style={{width:9,height:9,border:"1.5px solid #60a5fa",borderTopColor:"transparent",borderRadius:"50%",animation:"spin .7s linear infinite"}}/>Opening…</>
                          : <><svg width="13" height="13" viewBox="0 0 24 24" fill="#60a5fa"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg> Share on LinkedIn</>}
                      </button>
                    </div>
                  )}
                </div>

                <div style={{display:"grid",gridTemplateColumns: isMobile ? "repeat(2,1fr)" : "repeat(3,1fr)",gap:12,marginBottom:16}}>
                  {[
                    { label:"MEDIAN WAGE",    val:fmtW(w.value), sub: w.live ? "● LIVE BLS OEWS" : "◯ BLS ESTIMATE", subColor: w.live?"#4ade80":"#94a3b8" },
                    { label:"U.S. WORKFORCE", val:fmtE(selected.emp), sub:"workers · OES" },
                    { label:"10-YR GROWTH",   val:`${selected.projectedGrowth>0?"+":""}${selected.projectedGrowth}%`, sub:"BLS EP 2024–34", color:selected.projectedGrowth>=0?"#38bdf8":"#f87171" },
                  ].map(s=>(
                    <div key={s.label} style={{background:"#0a1929",border:"1px solid #0f2744",borderRadius:8,padding:"13px 15px"}}>
                      <div style={{fontFamily:"monospace",fontSize:9,color:"#a0aec0",letterSpacing:2,marginBottom:6}}>{s.label}</div>
                      <div style={{fontFamily:"'Playfair Display',serif",fontSize:22,fontWeight:700,lineHeight:1,color:s.color||"#f1f5f9"}}>{s.val}</div>
                      <div style={{fontFamily:"monospace",fontSize:9,color:s.subColor||"#94a3b8",marginTop:4}}>{s.sub}</div>
                    </div>
                  ))}
                </div>

                <div style={{background:"#0a1929",border:"1px solid #0f2744",borderRadius:8,padding:"14px 18px",marginBottom:24}}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:9}}>
                    <span style={{fontFamily:"monospace",fontSize:9,color:"#a0aec0",letterSpacing:2}}>AUTOMATION RISK INDEX</span>
                    <span style={{fontFamily:"monospace",fontSize:11,fontWeight:700,color:riskColor(selected.automationRisk)}}>
                      {selected.automationRisk}/100 · {riskLabel(selected.automationRisk)}
                    </span>
                  </div>
                  <div style={{height:7,background:"#1e293b",borderRadius:4,overflow:"hidden"}}>
                    <div style={{height:"100%",borderRadius:4,transition:"width 1s ease",
                      width:`${selected.automationRisk}%`,
                      background:`linear-gradient(90deg,#4ade80,${riskColor(selected.automationRisk)})`}}/>
                  </div>
                  <div style={{display:"flex",justifyContent:"space-between",fontFamily:"monospace",fontSize:9,color:"#c9d5e3",marginTop:5}}>
                    {["SAFE","MODERATE","HIGH","CRITICAL"].map(l=><span key={l}>{l}</span>)}
                  </div>
                </div>

                <div style={{borderTop:"1px solid #0f2744",paddingTop:22}}>
                  <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:18}}>
                    <span style={{fontFamily:"monospace",fontSize:10,color:"#38bdf8",letterSpacing:3}}>◈ AI FUTURE ANALYSIS</span>
                    <div style={{flex:1,height:1,background:"#0f2744"}}/>
                    <span style={{fontFamily:"monospace",fontSize:9,color:"#64748b"}}>CLAUDE HAIKU · {wageStatus.toUpperCase()} BLS</span>
                  </div>

                  {aiLoading && (
                    <div style={{display:"flex",flexDirection:"column",gap:9}}>
                      {[72,52,85,42].map((w,i)=>(
                        <div key={i} style={{height:12,background:"#0a1929",borderRadius:4,width:`${w}%`,
                          animation:`pulse 1.5s ease ${i*.17}s infinite`}}/>
                      ))}
                      <div style={{fontFamily:"monospace",fontSize:10,color:"#8b9eb8",marginTop:5,letterSpacing:2,animation:"pulse 1.5s infinite"}}>
                        PROCESSING BLS DATA…
                      </div>
                    </div>
                  )}

                  {analysis && !analysis.error && (
                    <div style={{animation:"fadeIn .5s ease"}}>
                      <div style={{background:"linear-gradient(135deg,#0c1f35,#0a1929)",border:"1px solid #1e3a5f",
                        borderLeft:"4px solid #38bdf8",borderRadius:8,padding:"16px 20px",marginBottom:20}}>
                        <div style={{fontFamily:"'Playfair Display',serif",fontSize:18,fontWeight:700,lineHeight:1.4,color:"#f1f5f9"}}>
                          <Typewriter text={`"${analysis.headline}"`}/>
                        </div>
                      </div>

                      <div style={{marginBottom:20}}>
                        <div style={{fontFamily:"monospace",fontSize:9,color:"#a0aec0",letterSpacing:2,marginBottom:9}}>OUTLOOK 2035</div>
                        <p style={{lineHeight:1.8,color:"#f1f5f9",fontSize:14,margin:0}}>{analysis.outlook}</p>
                      </div>

                      <div style={{display:"grid",gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",gap:12,marginBottom:18}}>
                        <div style={{background:"#100a0a",border:"1px solid #2a1515",borderRadius:8,padding:"14px 16px"}}>
                          <div style={{fontFamily:"monospace",fontSize:9,color:"#f87171",letterSpacing:2,marginBottom:9}}>⚠ DISRUPTED BY</div>
                          {analysis.killedBy?.map((k,i)=>(
                            <div key={i} style={{display:"flex",gap:7,marginBottom:6,alignItems:"flex-start"}}>
                              <span style={{color:"#f87171",flexShrink:0,marginTop:2}}>▸</span>
                              <span style={{fontSize:12,color:"#fecaca",lineHeight:1.5}}>{k}</span>
                            </div>
                          ))}
                        </div>
                        <div style={{background:"#050f1a",border:"1px solid #0c2a3d",borderRadius:8,padding:"14px 16px"}}>
                          <div style={{fontFamily:"monospace",fontSize:9,color:"#38bdf8",letterSpacing:2,marginBottom:9}}>↑ ELEVATED BY</div>
                          {analysis.evolvedBy?.map((e,i)=>(
                            <div key={i} style={{display:"flex",gap:7,marginBottom:6,alignItems:"flex-start"}}>
                              <span style={{color:"#38bdf8",flexShrink:0,marginTop:2}}>▸</span>
                              <span style={{fontSize:12,color:"#bae6fd",lineHeight:1.5}}>{e}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div style={{marginBottom:18}}>
                        <div style={{fontFamily:"monospace",fontSize:9,color:"#a0aec0",letterSpacing:2,marginBottom:10}}>CRITICAL SKILLS TO DEVELOP</div>
                        <div style={{display:"flex",flexWrap:"wrap",gap:7}}>
                          {analysis.emergingSkills?.map((s,i)=>(
                            <div key={i} style={{background:"rgba(56,189,248,.1)",border:"1px solid rgba(56,189,248,.25)",
                              borderRadius:5,padding:"5px 11px",fontSize:12,color:"#bae6fd",fontFamily:"monospace"}}>{s}</div>
                          ))}
                        </div>
                      </div>

                      <div style={{background:"linear-gradient(135deg,#0a1f12,#050f1a)",border:"1px solid #14532d",borderRadius:8,padding:"16px 20px",marginBottom:28}}>
                        <div style={{fontFamily:"monospace",fontSize:9,color:"#4ade80",letterSpacing:2,marginBottom:7}}>◈ SURVIVAL STRATEGY</div>
                        <p style={{margin:0,fontSize:14,color:"#bbf7d0",lineHeight:1.7,fontStyle:"italic"}}>
                          "{analysis.survivalStrategy}"
                        </p>
                      </div>

                      {/* ── Email Capture ── */}
                      {emailStatus !== "done" && (
                        <div style={{borderTop:"1px solid #0f2744",paddingTop:22,marginBottom:28}}>
                          <div style={{background:"linear-gradient(135deg,#0c1f35,#0a1929)",border:"1px solid #1e3a5f",borderRadius:10,padding:"22px 24px"}}>
                            <div style={{fontFamily:"monospace",fontSize:9,color:"#38bdf8",letterSpacing:3,marginBottom:8}}>◈ FREE 2035 REPORT</div>
                            <div style={{fontFamily:"'Playfair Display',serif",fontSize:17,fontWeight:700,color:"#f1f5f9",marginBottom:6}}>
                              Get the full outlook for {selected.title}
                            </div>
                            <div style={{fontSize:12,color:"#94a3b8",lineHeight:1.7,marginBottom:16}}>
                              A deeper breakdown of how this role evolves by 2035 — delivered to your inbox.
                            </div>
                            <div style={{display:"flex",gap:8,flexDirection: isMobile ? "column" : "row"}}>
                              <input
                                type="email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                onKeyDown={e => e.key === "Enter" && email && emailStatus === "idle" && submitEmail()}
                                placeholder="your@email.com"
                                style={{flex:1,background:"#020817",border:"1px solid #1e3a5f",borderRadius:6,
                                  color:"#f1f5f9",padding:"10px 14px",fontFamily:"monospace",fontSize:12,
                                  outline:"none",boxSizing:"border-box"}}
                              />
                              <button
                                onClick={() => {
                                  if (!email || emailStatus !== "idle") return;
                                  setEmailStatus("submitting");
                                  fetch("https://formspree.io/f/mlgwokra", {
                                    method: "POST",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify({
                                      email,
                                      occupation: selected.title,
                                      soc: selected.soc,
                                      automationRisk: selected.automationRisk,
                                      projectedGrowth: selected.projectedGrowth,
                                      source: "00ia-job-explorer"
                                    })
                                  })
                                  .then(r => r.ok ? setEmailStatus("done") : setEmailStatus("error"))
                                  .catch(() => setEmailStatus("error"));
                                }}
                                disabled={!email || emailStatus === "submitting"}
                                style={{background: emailStatus === "submitting" ? "rgba(56,189,248,.05)" : "rgba(56,189,248,.15)",
                                  border:"1px solid rgba(56,189,248,.35)",color:"#38bdf8",
                                  padding:"10px 20px",borderRadius:6,fontFamily:"monospace",fontSize:12,
                                  cursor: !email || emailStatus === "submitting" ? "default" : "pointer",
                                  whiteSpace:"nowrap",letterSpacing:1,display:"flex",alignItems:"center",gap:7,
                                  transition:"all .2s"}}>
                                {emailStatus === "submitting"
                                  ? <><div style={{width:9,height:9,border:"1.5px solid #38bdf8",borderTopColor:"transparent",borderRadius:"50%",animation:"spin .7s linear infinite"}}/>Sending…</>
                                  : <>→ Get My Report</>}
                              </button>
                            </div>
                            {emailStatus === "error" && (
                              <div style={{fontFamily:"monospace",fontSize:10,color:"#f87171",marginTop:8}}>
                                Something went wrong — please try again.
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {emailStatus === "done" && (
                        <div style={{borderTop:"1px solid #0f2744",paddingTop:22,marginBottom:28}}>
                          <div style={{background:"linear-gradient(135deg,#0a1f12,#050f1a)",border:"1px solid #14532d",borderRadius:10,padding:"22px 24px",textAlign:"center"}}>
                            <div style={{fontSize:24,marginBottom:8}}>✓</div>
                            <div style={{fontFamily:"'Playfair Display',serif",fontSize:16,fontWeight:700,color:"#f1f5f9",marginBottom:6}}>You're on the list</div>
                            <div style={{fontSize:12,color:"#86efac",lineHeight:1.7}}>Check your inbox — your 2035 report for {selected.title} is on its way.</div>
                          </div>
                        </div>
                      )}

                      {similarRoles.length > 0 && (
                        <div style={{borderTop:"1px solid #0f2744",paddingTop:22}}>
                          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:14}}>
                            <span style={{fontFamily:"monospace",fontSize:10,color:"#a0aec0",letterSpacing:3}}>EXPLORE SIMILAR ROLES</span>
                            <div style={{flex:1,height:1,background:"#0f2744"}}/>
                          </div>
                          <div style={{display:"flex",flexDirection: isMobile ? "column" : "row",gap:10}}>
                            {similarRoles.map(job => (
                              <SimilarCard key={job.soc} job={job} wage={job.value} onClick={j => { setMapHint(""); analyze(j); window.scrollTo({top:0,behavior:"smooth"}); }}/>
                            ))}
                          </div>
                          <div style={{fontFamily:"monospace",fontSize:9,color:"#c9d5e3",marginTop:10,textAlign:"center"}}>
                            Click any role to load its full analysis
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {analysis?.error && (
                    <div style={{color:"#f87171",fontFamily:"monospace",fontSize:12}}>Analysis failed — please try again.</div>
                  )}
                </div>

                <div style={{borderTop:"1px solid #0f2744",marginTop:28,paddingTop:16,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <a href="https://00ia.com" target="_blank" rel="noopener noreferrer"
                    style={{fontFamily:"'DM Mono',monospace",fontSize:13,fontWeight:700,color:"#38bdf8",textDecoration:"none",letterSpacing:2,transition:"opacity .2s"}}
                    onMouseEnter={e=>e.currentTarget.style.opacity=".7"}
                    onMouseLeave={e=>e.currentTarget.style.opacity="1"}>
                    00IA ↗
                  </a>
                  <span style={{fontFamily:"'Playfair Display',serif",fontSize:12,color:"#8b9eb8",lineHeight:1.6,textAlign:"right"}}>
                    THOUGHTS,<br/>CODE,<br/>AND COGNITION.
                  </span>
                </div>
                <div style={{marginTop:16,paddingTop:14,borderTop:"1px solid #0a1929",fontFamily:"monospace",fontSize:9,color:"#334155",lineHeight:1.8,letterSpacing:"0.5px"}}>
                  Data: BLS Employment Projections 2022–2032 · OEWS Wages 2024 · Automation risk scores are editorial estimates, not official BLS figures · AI analysis is for informational purposes only.
                </div>
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  );
}
