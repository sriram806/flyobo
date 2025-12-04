import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import ClientProvider from "@/hoc/ClientProvider";
import PageWrapper from "@/Components/SiteWraper";
import ThemeProvider from "@/Utils/Themes/ThemeProvider";
import AuthLoader from "@/Components/Auth/AuthLoader";
import AdminProtected from "@/hooks/adminProtected";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "FlyOBO Administration",
  description: "FlyOBO Administration Panel",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ClientProvider>
          <PageWrapper>
            <ThemeProvider attribute="class" enableSystem defaultTheme="system">
              <div className="min-h-screen relative">
                <AuthLoader>
                  <AdminProtected>
                    {children}
                  </AdminProtected>
                </AuthLoader>
              </div>
            </ThemeProvider>
            <Toaster position="bottom-right" toastOptions={{ duration: 3500 }} />
          </PageWrapper>
        </ClientProvider>
      </body>
    </html>
  );
}
