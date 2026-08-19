"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { EventRefundShell } from "@/components/EventRefundShell";
import { Panel, StatusPill, TechnicalDetails } from "@/components/er/Primitives";
import { errorCopy, verdictExplanation, verdictLabel } from "@/lib/eventrefund/presentation";
import { readMethod } from "@/lib/eventrefund/client";
import type { AssessmentRecord, EventRecord, TicketRecord } from "@/lib/eventrefund/types";

export default function VerifyAuthorizationPage() {
  const { id } = useParams<{ id: string }>();
  const ticketId = decodeURIComponent(id);
  const [ticket, setTicket] = useState<TicketRecord | null>(null);
  const [event, setEvent] = useState<EventRecord | null>(null);
  const [assessment, setAssessment] = useState<AssessmentRecord | null>(null);
  const [authorization, setAuthorization] = useState<Record<string, string> | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    async function read() {
      const next = await readMethod("get_ticket", [ticketId]) as TicketRecord;
      const [eventRecord, auth] = await Promise.all([readMethod("get_event", [next.event_id]) as Promise<EventRecord>, readMethod("get_refund_authorization", [ticketId]) as Promise<Record<string, string>>]);
      setTicket(next); setEvent(eventRecord); setAuthorization(auth || {});
      if (next.latest_assessment_id) setAssessment(await readMethod("get_assessment", [next.latest_assessment_id]) as AssessmentRecord);
    }
    read().catch((reason) => setError(errorCopy(reason)));
  }, [ticketId]);

  if (error) return <EventRefundShell><Link href="/verify" className="er-back">← Verify another ticket</Link><div className="er-outcome er-outcome-negative" style={{ marginTop: 42 }}><StatusPill tone="negative">Could not verify</StatusPill><h2>Verification unavailable</h2><p>{error}</p></div></EventRefundShell>;
  if (!ticket || !event || authorization === null) return <EventRefundShell><div className="er-empty"><p>Reading the ticket’s outcome…</p></div></EventRefundShell>;

  const hasAuthorization = Object.keys(authorization).length > 0;
  const inconclusive = assessment?.verdict === "INCONCLUSIVE";
  return <EventRefundShell><Link href="/verify" className="er-back">← Verify another ticket</Link><div className={`er-outcome ${hasAuthorization ? "er-outcome-positive" : inconclusive ? "er-outcome-warning" : ""}`} style={{ marginTop: 42 }}><StatusPill tone={hasAuthorization ? "positive" : inconclusive ? "warning" : "neutral"}>{hasAuthorization ? "Authorization found" : "No authorization"}</StatusPill><h2>{hasAuthorization ? "Refund authorized" : "Refund not authorized"}</h2><p>{hasAuthorization ? "The contract has stored a refund authorization for this ticket." : inconclusive ? "The latest assessment was inconclusive, so no refund authorization was issued." : "No refund authorization is stored for this ticket."}</p></div><div className="er-two-col" style={{ marginTop: 16 }}><Panel><div className="er-panel-title"><p className="er-eyebrow">Ticket</p><h3>{ticket.ticket_id}</h3></div><div className="er-list"><div className="er-list-row"><span>Event</span><span>{event.title}</span></div><div className="er-list-row"><span>Holder</span><span>{ticket.holder_address.slice(0, 8)}…{ticket.holder_address.slice(-6)}</span></div></div></Panel><Panel><div className="er-panel-title"><p className="er-eyebrow">Latest assessment</p><h3>{assessment ? verdictLabel(assessment.verdict) : "Not assessed"}</h3></div><p className="er-muted" style={{ marginTop: 16 }}>{verdictExplanation(assessment?.verdict)}</p><div className="er-list"><div className="er-list-row"><span>Authorization</span><span>{hasAuthorization ? "Stored" : "None"}</span></div></div></Panel></div><TechnicalDetails><p>Ticket ID: {ticket.ticket_id}</p><p>Event ID: {ticket.event_id}</p><p>Assessment ID: {assessment?.assessment_id || "none"}</p><p>Verdict: {assessment?.verdict || "none"}</p><p>Authorization: {hasAuthorization ? JSON.stringify(authorization) : "{}"}</p><p>Network: GenLayer Bradbury · chain 4221</p></TechnicalDetails></EventRefundShell>;
}
