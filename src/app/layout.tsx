import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Planify",
  description: "Planify: organize, execute e evolua com foco em produtividade real.",
  icons: {
    icon: "/planify-mark.svg",
    shortcut: "/planify-mark.svg",
    apple: "/planify-mark.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className="antialiased">{children}</body>
    </html>
  );
}
