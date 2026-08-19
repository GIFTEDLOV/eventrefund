"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { EventRefundShell } from "@/components/EventRefundShell";
import { PillButton } from "@/components/er/Primitives";
import { errorCopy, fixtureTicketId } from "@/lib/eventrefund/presentation";
import { readMethod } from "@/lib/eventrefund/client";
import type { TicketRecord } from "@/lib/eventrefund/types";

export default function VerifyPage() {
  const router = useRouter();
  const [id, setId] = useState("");
  const [knownTicket, setKnownTicket] = useState<TicketRecord | null>(null);
  const [error, setError] = useState("");
  useEffect(() => { readMethod("get_ticket", [fixtureTicketId]).then((ticket) => setKnownTicket(ticket as TicketRecord)).catch(() => undefined); }, []);
  function submit(event: React.FormEvent) { event.preventDefault(); if (id.trim()) router.push(`/verify/${encodeURIComponent(id.trim())}`); else setError("Enter a ticket ID to continue."); }
  return <EventRefundShell><div className="er-lookup"><p className="er-section-kicker">Public verification</p><h1>Read a ticket’s outcome.</h1><p>Enter a registered ticket ID to read its latest assessment and authorization state directly from the event record.</p><form className="er-lookup-form" onSubmit={submit}><label className="sr-only" htmlFor="ticket-lookup">Ticket ID</label><input id="ticket-lookup" className="er-input" value={id} onChange={(event) => setId(event.target.value)} placeholder="Ticket ID" /><PillButton type="submit">Verify ticket <span aria-hidden="true">↗</span></PillButton></form>{error && <p className="er-form-error" role="alert">{error}</p>}<div className="er-example">{knownTicket ? <><span>Existing Bradbury record</span><br /><Link href={`/verify/${encodeURIComponent(knownTicket.ticket_id)}`} className="er-link">{knownTicket.ticket_id} →</Link></> : <span>Enter a ticket ID to begin.</span>}</div></div></EventRefundShell>;
}
