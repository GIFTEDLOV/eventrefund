"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { formatAddress, useWallet } from "@/lib/genlayer/wallet";
import { PillButton } from "@/components/er/Primitives";

const navigation = [
  { href: "/events", label: "Events" },
  { href: "/events/new", label: "Create event" },
  { href: "/verify", label: "Verify ticket" },
];

function Wordmark({ light = false }: { light?: boolean }) {
  return <Link href="/" className={`er-wordmark ${light ? "er-wordmark-light" : ""}`} aria-label="EventRefund home"><span className="er-wordmark-mark" aria-hidden="true">er</span><span>EventRefund</span></Link>;
}

function WalletControl() {
  const wallet = useWallet();
  const [error, setError] = useState("");
  async function connect() {
    setError("");
    try { await wallet.connectWallet(); } catch (e) { setError(e instanceof Error ? e.message : "Wallet connection failed"); }
  }
  const label = wallet.isLoading ? "Checking wallet…" : wallet.isConnected ? formatAddress(wallet.address) : "Connect wallet";
  return <div className="er-wallet-control">
    <button className="er-wallet-button" onClick={wallet.isConnected ? wallet.disconnectWallet : connect} disabled={wallet.isLoading} aria-label={wallet.isConnected ? "Disconnect wallet" : "Connect wallet"}>{label}</button>
    {wallet.isConnected && !wallet.isOnCorrectNetwork && <span className="er-wallet-note">Switch to Bradbury</span>}
    {error && <span className="er-wallet-error" role="status">{error}</span>}
  </div>;
}

function pageTitle(pathname: string) {
  if (pathname === "/events") return "Events";
  if (pathname === "/events/new") return "Create event";
  if (pathname.startsWith("/events/")) return "Event detail";
  if (pathname.startsWith("/tickets/")) return "Ticket detail";
  if (pathname === "/verify") return "Verify ticket";
  if (pathname.startsWith("/verify/")) return "Verification result";
  return "Workspace";
}

export function EventRefundShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  return <div className="er-product-shell">
    <aside className={`er-sidebar ${open ? "is-open" : ""}`}>
      <div className="er-sidebar-head"><Wordmark /><button className="er-mobile-close" onClick={() => setOpen(false)} aria-label="Close navigation">×</button></div>
      <p className="er-sidebar-label">Workspace</p>
      <nav className="er-sidebar-nav" aria-label="Workspace navigation">
        {navigation.map((item) => <Link key={item.href} href={item.href} onClick={() => setOpen(false)} className={pathname === item.href ? "is-active" : ""}>{item.label}<span aria-hidden="true">↗</span></Link>)}
      </nav>
      <div className="er-sidebar-footer"><p>Bradbury</p><span>Testnet · chain 4221</span></div>
    </aside>
    {open && <button className="er-sidebar-scrim" onClick={() => setOpen(false)} aria-label="Close navigation" />}
    <div className="er-product-main">
      <header className="er-product-topbar">
        <div className="er-topbar-inner"><button className="er-menu-button" onClick={() => setOpen(true)} aria-label="Open navigation">☰</button><div><p className="er-topbar-kicker">EventRefund</p><p className="er-topbar-title">{pageTitle(pathname)}</p></div><div className="er-topbar-actions"><span className="er-command-stub" aria-hidden="true">Search <kbd>⌘ K</kbd></span><WalletControl /></div></div>
      </header>
      <main className="er-product-content">{children}</main>
    </div>
  </div>;
}

export function MarketingNav() {
  return <header className="er-marketing-nav"><Wordmark light /><nav aria-label="Main navigation"><Link href="#how-it-works">How it works</Link><Link href="/events">Open workspace</Link></nav><PillButton href="/verify" variant="outline">Verify a ticket <span aria-hidden="true">↗</span></PillButton></header>;
}
