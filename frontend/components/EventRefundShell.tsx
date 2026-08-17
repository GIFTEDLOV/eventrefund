"use client";

import Link from "next/link";
import { useWallet } from "@/lib/genlayer/wallet";
import { formatAddress } from "@/lib/genlayer/wallet";

export function EventRefundShell({ children }: { children: React.ReactNode }) { const wallet = useWallet(); return <div className="min-h-screen bg-[#080910] text-slate-100"><header className="border-b border-white/10 bg-[#0d0e18]/90 px-5 py-4"><div className="mx-auto flex max-w-6xl items-center justify-between gap-4"><Link href="/" className="text-lg font-semibold">Event<span className="text-fuchsia-300">Refund</span></Link><nav className="hidden gap-5 text-sm text-slate-300 sm:flex"><Link href="/events">Events</Link><Link href="/verify">Verify authorization</Link></nav><button className="rounded-full border border-fuchsia-300/40 px-3 py-2 text-xs" onClick={() => wallet.isConnected ? wallet.disconnectWallet() : wallet.connectWallet()}>{wallet.isConnected ? formatAddress(wallet.address) : "Connect wallet"}</button></div></header><main className="mx-auto max-w-6xl px-5 py-10">{children}</main></div>; }
export function TechnicalDetails({ children }: { children: React.ReactNode }) { return <details className="mt-6 rounded-xl border border-white/10 bg-white/[.03] p-4 text-xs text-slate-400"><summary className="cursor-pointer text-slate-300">Technical details</summary><div className="mt-3 break-words">{children}</div></details>; }
export function Stage({ value }: { value: string }) { return value ? <p className="rounded-lg border border-fuchsia-300/20 bg-fuchsia-300/10 px-3 py-2 text-sm text-fuchsia-100">{value}</p> : null; }
