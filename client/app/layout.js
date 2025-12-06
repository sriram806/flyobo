import { Nunito } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import { GoogleAnalytics } from '@next/third-parties/google'
import ClientProvider from "@/Components/hoc/ClientProvider";
import ThemeProvider from "@/Components/utils/Theme-Provider";
import AuthLoader from "@/Components/Auth/AuthLoader";

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
            <AuthLoader >
              {children}
            </AuthLoader>
          </ThemeProvider>
        </ClientProvider>
        <Toaster position="bottom-right" toastOptions={{ duration: 3500 }} />
      </body>
      <GoogleAnalytics gaId="G-HJ1B29719N" />
    </html>
  );
}