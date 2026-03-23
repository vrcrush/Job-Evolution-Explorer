export const metadata = {
  title: "The Future of American Work | 00IA",
  description: "Explore how US jobs will evolve by 2035. Powered by live BLS data and Claude AI.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0, background: "#020817" }}>{children}</body>
    </html>
  );
}
