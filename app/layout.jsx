export const metadata = {
  title: "The Future of American Work | 00IA",
  description: "Explore how 321 US occupations will evolve by 2035. Live BLS wage data, AI-powered analysis, automation risk scores.",
  openGraph: {
    title: "The Future of American Work | 00IA",
    description: "Explore how 321 US occupations will evolve by 2035. Live BLS wage data, AI-powered analysis, automation risk scores.",
    url: "https://job-evolution-explorer.vercel.app",
    siteName: "00IA",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "The Future of American Work — 00IA",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "The Future of American Work | 00IA",
    description: "Explore how 321 US occupations will evolve by 2035.",
    images: ["/og-image.png"],
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0, background: "#020817" }}>{children}</body>
    </html>
  );
}
