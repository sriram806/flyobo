import { Nunito } from "next/font/google";
import "./globals.css";
import ThemeProvider from "./utils/Theme-Provider";
import ClientProvider from "./hoc/ClientProvider";
import AuthLoader from "./components/Auth/AuthLoader";
import { Toaster } from "react-hot-toast";
import ThemeChecker from "./components/Debug/ThemeChecker";
import CssTest from "./components/Debug/CssTest";

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
});

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${nunito.variable} antialiased min-h-screen`}>
        <ClientProvider>
          <ThemeProvider >
            <AuthLoader>
              {children}
            </AuthLoader>
            {/* Debug overlay to inspect theme state at runtime */}
            <ThemeChecker />
          </ThemeProvider>
        </ClientProvider>
        <Toaster position="bottom-right" toastOptions={{ duration: 3500 }} />
      </body>
    </html>
  );
}