"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { EventRefundShell } from "@/components/EventRefundShell";
import { Panel, PillButton, StatusPill, TechnicalDetails, WriteProgress } from "@/components/er/Primitives";
import { errorCopy, eventTriggers, triggerLabel } from "@/lib/eventrefund/presentation";
import { readMethod, writeOnce } from "@/lib/eventrefund/client";
import type { EventRecord, TicketRecord } from "@/lib/eventrefund/types";
import { useWallet } from "@/lib/genlayer/wallet";

const stages: Record<string, string> = { precondition: "precondition", broadcast: "broadcast", submitted: "submitted", reviewing: "reviewing", finality: "finality", finalized: "finalized" };

export default function EventDetailPage() {
  const { id } = useParams<{ id: string }>();
  const eventId = decodeURIComponent(id);
  const wallet = useWallet();
  const [event, setEvent] = useState<EventRecord | null>(null);
  const [ticketId, setTicketId] = useState("");
  const [holder, setHolder] = useState("");
  const [registered, setRegistered] = useState<TicketRecord | null>(null);
  const [stage, setStage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => { readMethod("get_event", [eventId]).then((value) => setEvent(value as EventRecord)).catch((reason) => setError(errorCopy(reason))); }, [eventId]);

  async function register(eventForm: React.FormEvent) {
    eventForm.preventDefault();
    setError("");
    if (!wallet.address) { setError("Connect the organizer wallet first."); return; }
    if (!wallet.isOnCorrectNetwork) { setError("Switch to GenLayer Bradbury to continue."); return; }
    try {
      await writeOnce({
        key: `register-ticket:${ticketId}`,
        address: wallet.address,
        functionName: "register_ticket",
        args: [ticketId, eventId, holder],
        precondition: async () => { const existing = await readMethod("get_ticket", [ticketId]); if (existing && Object.keys(existing as object).length) throw new Error("That ticket ID is already registered."); },
        readState: () => readMethod("get_ticket", [ticketId]),
        verifyState: (state: any) => state?.ticket_id === ticketId && state?.event_id === eventId && state?.holder_address?.toLowerCase() === holder.toLowerCase() && state?.assessment_count === 0 && state?.refund_authorized === false && state?.latest_assessment_id === "",
        onStage: (current) => setStage(stages[current]),
      }).then(({ state }) => setRegistered(state as unknown as TicketRecord));
      setTicketId(""); setHolder("");
    } catch (reason) { setError(errorCopy(reason)); }
  }

  if (!event) return <EventRefundShell><div className="er-empty"><p>{error || "Reading the committed event…"}</p></div></EventRefundShell>;
  const triggers = eventTriggers(event);
  return <EventRefundShell><Link href="/events" className="er-back">← Events</Link><div className="er-detail-header"><div><p className="er-section-kicker">{event.event_id}</p><h1>{event.title}</h1><p>{event.original_schedule} · {event.original_venue}</p></div><div className="er-detail-status"><StatusPill>Committed baseline</StatusPill></div></div><div className="er-detail-grid"><div className="er-stat-card"><p className="er-stat-label">Original date</p><p className="er-stat-value">{event.original_schedule}</p></div><div className="er-stat-card"><p className="er-stat-label">Venue</p><p className="er-stat-value">{event.original_venue}</p></div><div className="er-stat-card"><p className="er-stat-label">Headline performer</p><p className="er-stat-value">{event.original_headliner || "Not specified"}</p></div></div><div className="er-two-col"><Panel><div className="er-panel-title"><p className="er-eyebrow">Committed baseline</p><h3>The record future assessments refer back to.</h3></div><div className="er-list"><div className="er-list-row"><span>Event title</span><span>{event.title}</span></div><div className="er-list-row"><span>Date / schedule</span><span>{event.original_schedule}</span></div><div className="er-list-row"><span>Venue</span><span>{event.original_venue}</span></div></div></Panel><Panel><div className="er-panel-title"><p className="er-eyebrow">Refund conditions</p><h3>Enabled triggers</h3></div><div className="er-condition-list">{triggers.length ? triggers.map((trigger) => <div className="er-condition" key={trigger}><span className="er-condition-mark" aria-hidden="true" /><span>{triggerLabel(trigger)}</span></div>) : <p className="er-muted">No refund conditions enabled.</p>}</div></Panel></div><div className="er-two-col"><Panel><div className="er-panel-title"><p className="er-eyebrow">Evidence sources</p><h3>Fixed when the event was created.</h3></div><div className="er-list"><div className="er-source"><p className="er-source-domain">{new URL(event.evidence_url_a).hostname}</p><p className="er-source-url">{event.evidence_url_a}</p><p className="er-source-fixed">Fixed / committed</p></div><div className="er-source"><p className="er-source-domain">{new URL(event.evidence_url_b).hostname}</p><p className="er-source-url">{event.evidence_url_b}</p><p className="er-source-fixed">Fixed / committed</p></div></div></Panel><Panel><div className="er-panel-title"><p className="er-eyebrow">Tickets</p><h3>Register a holder</h3></div><p className="er-muted">The organizer wallet signs a ticket registration. Existing ticket state is checked before a write.</p><form onSubmit={register} className="er-form" style={{ marginTop: 20 }}><div className="er-field"><label htmlFor="ticket-id">Ticket ID</label><input id="ticket-id" className="er-input" required value={ticketId} onChange={(e) => setTicketId(e.target.value)} placeholder="ticket-001" /></div><div className="er-field"><label htmlFor="holder-address">Holder address</label><input id="holder-address" className="er-input" required value={holder} onChange={(e) => setHolder(e.target.value)} placeholder="0x…" /></div><PillButton type="submit" disabled={!wallet.address || !wallet.isOnCorrectNetwork}>Register ticket <span aria-hidden="true">↗</span></PillButton></form><WriteProgress stage={stage} error={error} />{registered && <p style={{ marginTop: 15 }}><Link className="er-link" href={`/tickets/${encodeURIComponent(registered.ticket_id)}`}>Open {registered.ticket_id} →</Link></p>}</Panel></div><TechnicalDetails><p>Event ID: {event.event_id}</p><p>Organizer: {event.organizer_address}</p><p>Trigger enums: {triggers.join(", ") || "none"}</p></TechnicalDetails></EventRefundShell>;
}
