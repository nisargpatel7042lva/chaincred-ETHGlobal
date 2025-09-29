import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import { Providers } from "./providers"
import { Suspense } from "react"
import Link from "next/link"
import Image from "next/image"
import logo from "@/public/logo.png"

export const metadata: Metadata = {
  title: "ChainCred – Reputation Passport",
  description: "Get your trust score, verify with Self Protocol, and access gated Web3 features.",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <Providers>
          {/* Global Header Navigation */}
          <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container mx-auto max-w-6xl px-4 h-14 flex items-center justify-between">
              <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
                <Image src={logo} alt="ChainCred" width={28} height={28} className="rounded-full" />
                <span>ChainCred</span>
              </Link>
              <nav className="flex items-center gap-4 text-sm text-muted-foreground">
                <Link href="/" className="hover:text-foreground">Home</Link>
                <Link href="/verification" className="hover:text-foreground">Verification</Link>
              </nav>
            </div>
          </header>

          <Suspense>{children}</Suspense>

          {/* Global Footer */}
          <footer className="border-t mt-16">
            <div className="container mx-auto max-w-6xl px-4 py-8 text-sm text-muted-foreground flex flex-col md:flex-row items-center justify-between gap-3">
              <p>© {new Date().getFullYear()} ChainCred</p>
              <div className="flex items-center gap-4">
                <Link href="/api/docs" className="hover:text-foreground">API Docs</Link>
                <Link href="https://github.com" className="hover:text-foreground" target="_blank" rel="noreferrer">GitHub</Link>
              </div>
            </div>
          </footer>
        </Providers>
        <Analytics />
      </body>
    </html>
  )
}
