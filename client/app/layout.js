import { Nunito } from "next/font/google";
import "./globals.css";
import ThemeProvider from "./utils/Theme-Provider";
import ClientProvider from "./hoc/ClientProvider";
import AuthLoader from "./components/Auth/AuthLoader";
import { Toaster } from "react-hot-toast";

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
});

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${nunito.variable} antialiased min-h-screen  bg-white dark:bg-gray-900 duration-300 transition-colors`}>
        <ClientProvider>
          <ThemeProvider >
            <AuthLoader>
              {children}
            </AuthLoader>
          </ThemeProvider>
        </ClientProvider>
        <Toaster position="bottom-right" toastOptions={{ duration: 3500 }} />
      </body>
    </html>
  );
}