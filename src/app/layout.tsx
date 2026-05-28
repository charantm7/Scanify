import "./style/globals.css";
import Script from "next/script";
import { ThemeProvider } from "../context/ThemeContext";
import { ToasterConfig } from "../components/shared/ToasterConfig";


export default async function RootLayout({ children }) {

  return (
    <html lang="en" suppressHydrationWarning data-scroll-behavior="smooth">
      <head>
        <Script
          id="theme-init"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const theme = localStorage.getItem('theme');
                  if (theme === 'dark') {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body>
        <ThemeProvider>
          <ToasterConfig />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
