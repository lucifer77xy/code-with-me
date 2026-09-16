import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { SyncProvider } from "@/context/SyncContext";
import { Toaster } from "sonner";
import { BadgeUnlockModal } from "@/components/gamification/BadgeUnlockModal";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "CodeTogether | Joint Coding Tracker & Learning Portal",
  description: "Synchronized dual-tracker, pomodoro focus, performance analytics, weakpoint radar, and quizzes for couples learning to code together.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} min-h-screen bg-slate-950 text-slate-100 antialiased`}>
        <AuthProvider>
          <SyncProvider>
            {children}
            <BadgeUnlockModal />
            <Toaster
              theme="dark"
              position="top-right"
              toastOptions={{
                style: {
                  background: "#0f172a",
                  borderColor: "rgba(255, 255, 255, 0.15)",
                  color: "#fff",
                },
              }}
            />
          </SyncProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
