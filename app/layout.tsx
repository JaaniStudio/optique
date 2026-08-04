import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { AnnouncementBanner } from "@/components/announcement-banner";
import { ToastProvider, ToastViewport } from "@/components/ui/toast";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-display" });

export const metadata: Metadata = {
  title: "Chashmish — Eyewear from Karachi",
  description: "Premium sunglasses, eyeglasses & more. Shop online, pay via bank transfer.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${playfair.variable} font-sans bg-cream text-ink`}>
        <ToastProvider>
          <AnnouncementBanner />
          <Navbar />
          <main className="min-h-screen">{children}</main>
          <Footer />
          <ToastViewport />
        </ToastProvider>
      </body>
    </html>
  );
}
