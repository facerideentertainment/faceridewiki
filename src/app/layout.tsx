
import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/lib/auth";
import { Toaster } from "@/components/ui/toaster";
import { MainLayout } from "@/components/layout/main-layout";
import { ClientFirebaseProvider } from "@/firebase/client-provider";

const roboto = Roboto({ 
  subsets: ["latin"],
  variable: '--font-body',
  weight: ['400', '500', '700']
});

export const metadata: Metadata = {
  title: "Face Ride Entertainment Wiki",
  description: "The Unofficial, Unauthorized, and Unbelievable Story",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${roboto.variable}`}>
        <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
        >
            <ClientFirebaseProvider>
              <AuthProvider>
                <MainLayout>{children}</MainLayout>
                <Toaster />
              </AuthProvider>
            </ClientFirebaseProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
