"use client";
import { useState } from "react";
import OCCUPATIONS_DATA from "../data/occupations.js";
const OCCUPATIONS = [...OCCUPATIONS_DATA].map(o => o.title).sort();

const PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || "00ia2035";

export default function AdminPage() {
  const [pwd, setPwd]           = useState("");
  const [authed, setAuthed]     = useState(false);
  const [pwdError, setPwdError] = useState(false);

  const [recipientEmail, setRecipientEmail] = useState("");
  const [occupation, setOccupation]         = useState("");
  const [customOcc, setCustomOcc]           = useState("");
  const [extraContext, setExtraContext]      = useState("");

  const [loading, setLoading]   = useState(false);
  const [report, setReport]     = useState(null);
  const [copied, setCopied]     = useState(false);

  const handleLogin = () => {
    if (pwd === PASSWORD) { setAuthed(true); setPwdError(false); }
    else setPwdError(true);
  };

  const openAsPDF = () => {
    if (!report) return;
    const occ = customOcc || occupation;
    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${occ} — 2035 Outlook Report | 00IA</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: Georgia, serif; color: #1a1a2e; line-height: 1.8; padding: 60px; max-width: 800px; margin: 0 auto; }
    h1 { font-size: 28px; font-weight: 900; margin-bottom: 6px; color: #0f172a; }
    h2 { font-size: 16px; font-weight: 700; margin: 28px 0 10px; color: #0f172a; text-transform: uppercase; letter-spacing: 1px; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; }
    p { margin-bottom: 14px; font-size: 14px; color: #334155; }
    .header { border-bottom: 3px solid #0ea5e9; padding-bottom: 20px; margin-bottom: 32px; }
    .meta { font-family: monospace; font-size: 11px; color: #64748b; letter-spacing: 2px; margin-bottom: 8px; }
    .footer { margin-top: 48px; padding-top: 20px; border-top: 1px solid #e2e8f0; font-family: monospace; font-size: 10px; color: #94a3b8; display: flex; justify-content: space-between; }
    @media print { body { padding: 40px; } @page { margin: 1cm; } }
  </style>
</head>
<body>
  <div class="header">
    <div class="meta">00IA · THE FUTURE OF AMERICAN WORK · ${new Date().getFullYear()}</div>
    <h1>${occ}</h1>
    <div class="meta">2035 OUTLOOK REPORT${recipientEmail ? " · PREPARED FOR: " + recipientEmail : ""}</div>
  </div>
  ${report.split("\n").map(line => {
    if (line.startsWith("# ")) return \`<h1>\${line.slice(2)}</h1>\`;
    if (line.startsWith("## ")) return \`<h2>\${line.slice(3)}</h2>\`;
    if (line.trim() === "") return "";
    return \`<p>\${line}</p>\`;
  }).join("\n")}
  <div class="footer">
    <span>00IA.COM — THOUGHTS, CODE, AND COGNITION</span>
    <span>Generated ${new Date().toLocaleDateString("en-US", { year:"numeric", month:"long", day:"numeric" })}</span>
  </div>
  <script>window.onload = () => window.print();<\/script>
</body>
</html>`;
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank");
    setTimeout(() => URL.revokeObjectURL(url), 10000);
  };

  const generateReport = async () => {
    const occ = customOcc || occupation;
    if (!occ) return;
    setLoading(true); setReport(null);
    try {
      const res = await fetch("/api/claude", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-haiku-4-5-20251001",
          max_tokens: 4000,
          system: `You are a senior US labor market analyst writing a detailed professional report about the future of a specific occupation. Write in clear, authoritative prose. Structure the report with these exact sections using markdown headers:

# [Occupation Title]: 2035 Outlook Report

## Executive Summary
## The Role Today (BLS Data)
## What Changes by 2035
## Forces of Disruption
## Forces of Growth
## Skills Roadmap
## Salary Trajectory
## Similar Roles to Consider
## Your 12-Month Action Plan

Each section should be substantive — 3-5 sentences minimum. The tone is professional but direct, like a McKinsey brief written for a real person. End with an encouraging but honest closing line. Do not use bullet points — write in prose paragraphs.`,
          messages: [{
            role: "user",
            content: `Write a full 2035 outlook report for: ${occ}${extraContext ? `\n\nAdditional context: ${extraContext}` : ""}\n\nThis report is for: ${recipientEmail || "a subscriber"}`
          }]
        })
      });
      const d = await res.json();
      const text = d.content?.[0]?.text || "Report generation failed.";
      setReport(text);
    } catch (e) {
      setReport("Error generating report. Please try again.");
    }
    setLoading(false);
  };

  const copyReport = () => {
    if (!report) return;
    navigator.clipboard.writeText(report).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  const copyEmailDraft = () => {
    const occ = customOcc || occupation;
    const draft = `Subject: Your 2035 Career Report — ${occ}

Hi,

Thank you for your interest in the Future of American Work explorer at 00ia.com.

As requested, here is your personalized 2035 outlook report for ${occ}:

---

${report}

---

If you have any questions or would like to discuss how this applies to your specific situation, feel free to reply to this email.

Best,
Pablo
00IA — Thoughts, Code, and Cognition
00ia.com`;
    navigator.clipboard.writeText(draft).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  // ── Login screen ──────────────────────────────────────────────────────────
  if (!authed) return (
    <div style={{ background:"#020817", minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"Georgia,serif" }}>
      <div style={{ background:"#0a1929", border:"1px solid #1e3a5f", borderRadius:12, padding:"40px 48px", width:360 }}>
        <div style={{ fontFamily:"monospace", fontSize:10, color:"#38bdf8", letterSpacing:3, marginBottom:8 }}>◈ 00IA ADMIN</div>
        <div style={{ fontFamily:"'Playfair Display',serif", fontSize:24, fontWeight:900, color:"#f1f5f9", marginBottom:28 }}>Report Generator</div>
        <input
          type="password"
          value={pwd}
          onChange={e => setPwd(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleLogin()}
          placeholder="Password"
          style={{ width:"100%", background:"#020817", border:`1px solid ${pwdError ? "#f87171" : "#1e3a5f"}`, borderRadius:6,
            color:"#f1f5f9", padding:"10px 14px", fontFamily:"monospace", fontSize:13, outline:"none", boxSizing:"border-box", marginBottom:12 }}
        />
        {pwdError && <div style={{ fontFamily:"monospace", fontSize:11, color:"#f87171", marginBottom:10 }}>Incorrect password</div>}
        <button onClick={handleLogin} style={{
          width:"100%", background:"rgba(56,189,248,.15)", border:"1px solid rgba(56,189,248,.35)",
          color:"#38bdf8", padding:"11px", borderRadius:6, fontFamily:"monospace", fontSize:12,
          cursor:"pointer", letterSpacing:1
        }}>Enter</button>
      </div>
    </div>
  );

  // ── Main admin UI ─────────────────────────────────────────────────────────
  return (
    <div style={{ background:"#020817", minHeight:"100vh", color:"#f1f5f9", fontFamily:"Georgia,serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Playfair+Display:wght@700;900&display=swap');
        @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
        @keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        textarea:focus, input:focus, select:focus { outline: none; border-color: #38bdf8 !important; }
        ::selection { background: rgba(56,189,248,.3); }
        ::-webkit-scrollbar{width:5px}::-webkit-scrollbar-track{background:#0f172a}::-webkit-scrollbar-thumb{background:#1e3a5f;border-radius:3px}
      `}</style>

      {/* Header */}
      <header style={{ borderBottom:"1px solid #0f2744", padding:"20px 36px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <div>
          <div style={{ fontFamily:"'DM Mono',monospace", fontSize:10, color:"#38bdf8", letterSpacing:3, marginBottom:4 }}>◈ 00IA ADMIN</div>
          <div style={{ fontFamily:"'Playfair Display',serif", fontSize:26, fontWeight:900 }}>2035 Report Generator</div>
        </div>
        <a href="/" style={{ fontFamily:"monospace", fontSize:11, color:"#475569", textDecoration:"none" }}>← Back to Explorer</a>
      </header>

      <div style={{ maxWidth:900, margin:"0 auto", padding:"32px 36px", display:"grid", gridTemplateColumns:"1fr 1fr", gap:24 }}>

        {/* Left: inputs */}
        <div style={{ display:"flex", flexDirection:"column", gap:18 }}>
          <div style={{ background:"#0a1929", border:"1px solid #0f2744", borderRadius:10, padding:"22px 24px" }}>
            <div style={{ fontFamily:"monospace", fontSize:9, color:"#38bdf8", letterSpacing:3, marginBottom:16 }}>REPORT DETAILS</div>

            <div style={{ marginBottom:14 }}>
              <label style={{ fontFamily:"monospace", fontSize:10, color:"#64748b", letterSpacing:2, display:"block", marginBottom:6 }}>RECIPIENT EMAIL</label>
              <input type="email" value={recipientEmail} onChange={e => setRecipientEmail(e.target.value)}
                placeholder="subscriber@email.com"
                style={{ width:"100%", background:"#020817", border:"1px solid #1e3a5f", borderRadius:6,
                  color:"#f1f5f9", padding:"9px 12px", fontFamily:"monospace", fontSize:12, boxSizing:"border-box" }} />
            </div>

            <div style={{ marginBottom:14 }}>
              <label style={{ fontFamily:"monospace", fontSize:10, color:"#64748b", letterSpacing:2, display:"block", marginBottom:6 }}>OCCUPATION</label>
              <select value={occupation} onChange={e => setOccupation(e.target.value)}
                style={{ width:"100%", background:"#020817", border:"1px solid #1e3a5f", borderRadius:6,
                  color: occupation ? "#f1f5f9" : "#475569", padding:"9px 12px", fontFamily:"monospace", fontSize:12,
                  boxSizing:"border-box", cursor:"pointer" }}>
                <option value="">Select from list…</option>
                {OCCUPATIONS.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>

            <div style={{ marginBottom:14 }}>
              <label style={{ fontFamily:"monospace", fontSize:10, color:"#64748b", letterSpacing:2, display:"block", marginBottom:6 }}>OR TYPE CUSTOM OCCUPATION</label>
              <input value={customOcc} onChange={e => setCustomOcc(e.target.value)}
                placeholder="e.g. UX Researcher, HRIS Analyst…"
                style={{ width:"100%", background:"#020817", border:"1px solid #1e3a5f", borderRadius:6,
                  color:"#f1f5f9", padding:"9px 12px", fontFamily:"monospace", fontSize:12, boxSizing:"border-box" }} />
            </div>

            <div style={{ marginBottom:20 }}>
              <label style={{ fontFamily:"monospace", fontSize:10, color:"#64748b", letterSpacing:2, display:"block", marginBottom:6 }}>EXTRA CONTEXT (OPTIONAL)</label>
              <textarea value={extraContext} onChange={e => setExtraContext(e.target.value)}
                placeholder="e.g. subscriber is mid-career, works in healthcare sector, based in Texas…"
                rows={3}
                style={{ width:"100%", background:"#020817", border:"1px solid #1e3a5f", borderRadius:6,
                  color:"#f1f5f9", padding:"9px 12px", fontFamily:"monospace", fontSize:12,
                  boxSizing:"border-box", resize:"vertical", lineHeight:1.6 }} />
            </div>

            <button onClick={generateReport} disabled={loading || (!occupation && !customOcc)} style={{
              width:"100%", background: loading ? "rgba(56,189,248,.05)" : "rgba(56,189,248,.15)",
              border:"1px solid rgba(56,189,248,.35)", color:"#38bdf8", padding:"11px",
              borderRadius:6, fontFamily:"monospace", fontSize:12, cursor: loading || (!occupation && !customOcc) ? "default" : "pointer",
              letterSpacing:1, display:"flex", alignItems:"center", justifyContent:"center", gap:8, transition:"all .2s"
            }}>
              {loading
                ? <><div style={{ width:10, height:10, border:"1.5px solid #38bdf8", borderTopColor:"transparent", borderRadius:"50%", animation:"spin .7s linear infinite" }}/>Generating Report…</>
                : <>◈ Generate 2035 Report</>}
            </button>
          </div>

          {/* Instructions */}
          <div style={{ background:"#0a1929", border:"1px solid #0f2744", borderRadius:10, padding:"20px 24px" }}>
            <div style={{ fontFamily:"monospace", fontSize:9, color:"#38bdf8", letterSpacing:3, marginBottom:12 }}>HOW TO USE</div>
            {[
              { n:"1", text:"Check Formspree dashboard for new submissions" },
              { n:"2", text:"Enter the subscriber email and occupation here" },
              { n:"3", text:"Click Generate — takes ~10 seconds" },
              { n:"4", text:"Click the Copy Email Draft button — full email ready to send" },
              { n:"5", text:"Paste into Gmail/Outlook and hit send" },
            ].map(s => (
              <div key={s.n} style={{ display:"flex", gap:10, marginBottom:10, alignItems:"flex-start" }}>
                <div style={{ width:20, height:20, borderRadius:"50%", background:"rgba(56,189,248,.1)", border:"1px solid rgba(56,189,248,.2)",
                  display:"flex", alignItems:"center", justifyContent:"center", fontSize:10, color:"#38bdf8", flexShrink:0, fontWeight:700 }}>{s.n}</div>
                <div style={{ fontSize:12, color:"#94a3b8", lineHeight:1.6 }}>{s.text}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: report output */}
        <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
          {!report && !loading && (
            <div style={{ background:"#0a1929", border:"1px solid #0f2744", borderRadius:10, padding:"40px 24px",
              display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:12, opacity:.35, minHeight:300 }}>
              <div style={{ fontSize:36 }}>◈</div>
              <div style={{ fontFamily:"monospace", fontSize:11, color:"#38bdf8", letterSpacing:3 }}>REPORT WILL APPEAR HERE</div>
            </div>
          )}

          {loading && (
            <div style={{ background:"#0a1929", border:"1px solid #0f2744", borderRadius:10, padding:"40px 24px",
              display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:16, minHeight:300 }}>
              <div style={{ width:32, height:32, border:"3px solid #38bdf8", borderTopColor:"transparent", borderRadius:"50%", animation:"spin .8s linear infinite" }} />
              <div style={{ fontFamily:"monospace", fontSize:11, color:"#38bdf8", letterSpacing:2 }}>GENERATING REPORT…</div>
              <div style={{ fontFamily:"monospace", fontSize:10, color:"#334155" }}>This takes about 10 seconds</div>
            </div>
          )}

          {report && (
            <div style={{ animation:"fadeIn .4s ease" }}>
              {/* Action buttons */}
              <div style={{ display:"flex", gap:8, marginBottom:12, flexWrap:"wrap" }}>
                <button onClick={copyReport} style={{
                  flex:1, background:"rgba(56,189,248,.1)", border:"1px solid rgba(56,189,248,.3)",
                  color:"#38bdf8", padding:"9px", borderRadius:6, fontFamily:"monospace", fontSize:11,
                  cursor:"pointer", letterSpacing:1, minWidth:120
                }}>{copied ? "✓ Copied!" : "Copy Text"}</button>
                <button onClick={copyEmailDraft} style={{
                  flex:1, background:"rgba(74,222,128,.1)", border:"1px solid rgba(74,222,128,.3)",
                  color:"#4ade80", padding:"9px", borderRadius:6, fontFamily:"monospace", fontSize:11,
                  cursor:"pointer", letterSpacing:1, minWidth:120
                }}>📧 Email Draft</button>
                <button onClick={openAsPDF} style={{
                  flex:1, background:"rgba(251,146,60,.1)", border:"1px solid rgba(251,146,60,.3)",
                  color:"#fb923c", padding:"9px", borderRadius:6, fontFamily:"monospace", fontSize:11,
                  cursor:"pointer", letterSpacing:1, minWidth:120
                }}>📄 Download PDF</button>
              </div>

              {/* Recipient info */}
              {recipientEmail && (
                <div style={{ background:"#0a1929", border:"1px solid #0f2744", borderRadius:7, padding:"10px 14px", marginBottom:12,
                  fontFamily:"monospace", fontSize:11, color:"#64748b", display:"flex", justifyContent:"space-between" }}>
                  <span>TO: <span style={{ color:"#38bdf8" }}>{recipientEmail}</span></span>
                  <span>RE: <span style={{ color:"#94a3b8" }}>{customOcc || occupation}</span></span>
                </div>
              )}

              {/* Report content */}
              <div style={{ background:"#0a1929", border:"1px solid #0f2744", borderRadius:10, padding:"24px",
                fontSize:13, color:"#cbd5e1", lineHeight:1.9, whiteSpace:"pre-wrap", maxHeight:"60vh", overflowY:"auto" }}>
                {report}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
