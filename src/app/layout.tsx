import type { Metadata } from "next";
import { Geist, Geist_Mono, DM_Sans } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import SyncUser from "@/components/SyncUser";
import { EntriesProvider } from "@/components/EntriesProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Our Songs OTW",
  description:
    "Track your weekly soundtrack. See what your friends picked. 52 weeks. 52 songs. Share your year.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${dmSans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <ClerkProvider>
          <EntriesProvider>
            <SyncUser />
            <Navbar />
            <main className="flex-1">{children}</main>
          </EntriesProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
