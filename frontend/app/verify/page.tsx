"use client";
import { useState } from "react";
import Link from "next/link";
import { EventRefundShell } from "@/components/EventRefundShell";
export default function VerifyPage() { const [id, setId] = useState(""); return <EventRefundShell><h1 className="text-4xl font-semibold">Verify refund authorization</h1><p className="mt-3 text-slate-400">Enter the registered ticket ID to read its permanent authorization from GenLayer.</p><form onSubmit={(e) => { e.preventDefault(); }} className="mt-8 flex max-w-xl gap-3"><input required value={id} onChange={(e) => setId(e.target.value)} placeholder="Ticket ID" className="min-w-0 flex-1 rounded-xl border border-white/15 bg-white/[.04] px-3 py-3"/><Link href={id ? `/verify/${encodeURIComponent(id)}` : "#"} className="rounded-xl bg-fuchsia-300 px-4 py-3 font-medium text-slate-950">Look up</Link></form></EventRefundShell>; }
