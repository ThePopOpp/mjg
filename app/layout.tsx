import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MJG Dashboard",
  description: "Admin dashboard for The Stewardship Blueprint and Created for More.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                var storedTheme = localStorage.getItem('theme');
                var preferredTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                var theme = storedTheme === 'dark' || storedTheme === 'light' ? storedTheme : preferredTheme;
                document.documentElement.dataset.theme = theme;
                document.documentElement.classList.toggle('dark', theme === 'dark');
              } catch {}
            `,
          }}
        />
        {children}
      </body>
    </html>
  );
}
