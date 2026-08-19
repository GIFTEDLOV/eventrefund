"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { EventRefundShell } from "@/components/EventRefundShell";
import { Panel, PillButton, StatusPill, TechnicalDetails, WriteProgress } from "@/components/er/Primitives";
import { errorCopy, verdictExplanation, verdictLabel } from "@/lib/eventrefund/presentation";
import { readMethod, writeOnce } from "@/lib/eventrefund/client";
import type { AssessmentRecord, EventRecord, TicketRecord } from "@/lib/eventrefund/types";
import { useWallet } from "@/lib/genlayer/wallet";

const stages: Record<string, string> = { precondition: "precondition", broadcast: "broadcast", submitted: "submitted", reviewing: "reviewing", finality: "finality", finalized: "finalized" };

export default function TicketPage() {
  const { id } = useParams<{ id: string }>();
  const ticketId = decodeURIComponent(id);
  const wallet = useWallet();
  const [ticket, setTicket] = useState<TicketRecord | null>(null);
  const [event, setEvent] = useState<EventRecord | null>(null);
  const [assessment, setAssessment] = useState<AssessmentRecord | null>(null);
  const [authorization, setAuthorization] = useState<Record<string, string>>({});
  const [stage, setStage] = useState("");
  const [error, setError] = useState("");

  async function refresh() {
    const next = await readMethod("get_ticket", [ticketId]) as TicketRecord;
    setTicket(next);
    const [eventRecord, auth] = await Promise.all([readMethod("get_event", [next.event_id]) as Promise<EventRecord>, readMethod("get_refund_authorization", [ticketId]) as Promise<Record<string, string>>]);
    setEvent(eventRecord); setAuthorization(auth || {});
    if (next.latest_assessment_id) setAssessment(await readMethod("get_assessment", [next.latest_assessment_id]) as AssessmentRecord);
  }

  useEffect(() => { refresh().catch((reason) => setError(errorCopy(reason))); }, [ticketId]);

  async function assess() {
    if (!wallet.address || !ticket) return;
    setError("");
    try {
      const previousCount = ticket.assessment_count;
      await writeOnce({
        key: `assess-ticket:${ticketId}:${previousCount + 1}`,
        address: wallet.address,
        functionName: "assess_ticket",
        args: [ticketId],
        precondition: async () => { const current = await readMethod("get_ticket", [ticketId]) as TicketRecord; if (current.holder_address.toLowerCase() !== wallet.address?.toLowerCase()) throw new Error("Only the registered holder can assess this ticket."); if (current.refund_authorized) throw new Error("Refund authorization already exists for this ticket."); },
        readState: () => readMethod("get_ticket", [ticketId]),
        verifyState: (state: any) => state?.assessment_count > previousCount && !!state?.latest_assessment_id,
        onStage: (current) => setStage(stages[current]),
      });
      await refresh();
    } catch (reason) { setError(errorCopy(reason)); }
  }

  if (!ticket) return <EventRefundShell><div className="er-empty"><p>{error || "Reading the ticket…"}</p></div></EventRefundShell>;
  const inconclusive = assessment?.verdict === "INCONCLUSIVE";
  const isEligible = assessment?.verdict === "REFUND_ELIGIBLE";
  const canAssess = !ticket.refund_authorized && Boolean(wallet.address) && wallet.address?.toLowerCase() === ticket.holder_address.toLowerCase() && wallet.isOnCorrectNetwork;
  return <EventRefundShell><Link href={event ? `/events/${encodeURIComponent(event.event_id)}` : "/events"} className="er-back">← Event</Link><div className="er-detail-header"><div><p className="er-section-kicker">Ticket {ticket.ticket_id}</p><h1>{ticket.refund_authorized ? "Refund authorized" : "Refund not authorized"}</h1><p>{inconclusive ? "The latest assessment was inconclusive, so no refund authorization was issued." : assessment ? verdictExplanation(assessment.verdict) : "This ticket has not been assessed yet."}</p></div><div className="er-detail-status"><StatusPill tone={ticket.refund_authorized ? "positive" : inconclusive ? "warning" : "neutral"}>{ticket.refund_authorized ? "Authorization issued" : inconclusive ? "Inconclusive" : assessment ? verdictLabel(assessment.verdict) : "Pending assessment"}</StatusPill></div></div><div className="er-detail-grid"><div className="er-stat-card"><p className="er-stat-label">Event</p><p className="er-stat-value">{event?.title || ticket.event_id}</p><p className="er-stat-detail">{event?.original_schedule || ""}</p></div><div className="er-stat-card"><p className="er-stat-label">Ticket holder</p><p className="er-stat-value">{ticket.holder_address.slice(0, 8)}…{ticket.holder_address.slice(-6)}</p></div><div className="er-stat-card"><p className="er-stat-label">Assessment count</p><p className="er-stat-value">{ticket.assessment_count}</p></div></div><div className="er-two-col"><Panel><div className="er-panel-title"><p className="er-eyebrow">Latest decision</p><h3>{assessment ? verdictLabel(assessment.verdict) : "Not assessed"}</h3></div><p className="er-muted" style={{ marginTop: 16 }}>{assessment ? verdictExplanation(assessment.verdict) : "The registered ticket has no stored assessment yet."}</p>{canAssess && <PillButton onClick={assess} style={{ marginTop: 22 }}>Request assessment <span aria-hidden="true">↗</span></PillButton>}{wallet.address && wallet.address.toLowerCase() !== ticket.holder_address.toLowerCase() && !ticket.refund_authorized && <p className="er-muted" style={{ marginTop: 18 }}>Connect the registered holder wallet to request an assessment.</p>}<WriteProgress stage={stage} error={error} /></Panel><Panel><div className="er-panel-title"><p className="er-eyebrow">Refund authorization</p><h3>{ticket.refund_authorized ? "Authorization stored" : "None"}</h3></div><p className="er-muted" style={{ marginTop: 16 }}>{ticket.refund_authorized ? "The contract has stored a permanent authorization for this ticket." : inconclusive ? "No authorization was issued because the latest assessment was inconclusive." : isEligible ? "No authorization read back yet." : "An authorization is only created after an eligible assessment completes successfully."}</p>{ticket.refund_authorized && <Link className="er-link" href={`/verify/${encodeURIComponent(ticket.ticket_id)}`} style={{ display: "inline-block", marginTop: 18 }}>Verify authorization →</Link>}</Panel></div><Panel style={{ marginTop: 16 }}><div className="er-panel-title"><p className="er-eyebrow">Assessment history</p><h3>{ticket.assessment_count ? `${ticket.assessment_count} stored assessment${ticket.assessment_count === 1 ? "" : "s"}` : "No stored assessments"}</h3></div>{assessment && <div className="er-list"><div className="er-list-row"><span>{assessment.assessment_id}</span><span>{verdictLabel(assessment.verdict)}</span></div></div>}</Panel><TechnicalDetails><p>Ticket ID: {ticket.ticket_id}</p><p>Event ID: {ticket.event_id}</p><p>Latest assessment ID: {ticket.latest_assessment_id || "none"}</p><p>Refund authorized: {String(ticket.refund_authorized)}</p>{assessment && <><p>Validator verdict: {assessment.verdict}</p><p>Result digest: {assessment.result_digest}</p></>}{authorization && Object.keys(authorization).length > 0 && <p>Authorization ID: {authorization.authorization_id}</p>}<p>Network: GenLayer Bradbury · chain 4221</p></TechnicalDetails></EventRefundShell>;
}
