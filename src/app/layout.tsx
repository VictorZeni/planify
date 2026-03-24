import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Planify",
  description: "Planify: organize, execute e evolua com foco em produtividade real.",
  icons: {
    icon: "/planify-logo.svg",
    shortcut: "/planify-logo.svg",
    apple: "/planify-logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className="antialiased">
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('planify-theme') || 'foco';
                  document.documentElement.setAttribute('data-theme', theme);
                } catch (e) {}
              })();
            `,
          }}
        />
        {children}
      </body>
    </html>
  );
}

