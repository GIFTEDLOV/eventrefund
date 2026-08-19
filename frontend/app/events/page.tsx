"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { EventRefundShell } from "@/components/EventRefundShell";
import { DataTable, EmptyState, PillButton, StatusPill } from "@/components/er/Primitives";
import { errorCopy, eventStatus, eventTriggers, triggerLabel } from "@/lib/eventrefund/presentation";
import { readMethod } from "@/lib/eventrefund/client";
import type { EventRecord } from "@/lib/eventrefund/types";

export default function EventsPage() {
  const [events, setEvents] = useState<EventRecord[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    readMethod("get_event_ids")
      .then(async (ids) => setEvents(await Promise.all((ids as string[]).map((id) => readMethod("get_event", [id]) as Promise<EventRecord>))))
      .catch((reason) => setError(errorCopy(reason)));
  }, []);

  return <EventRefundShell><div className="er-page-heading"><div><p className="er-section-kicker">Registry</p><h1>Events</h1></div><PillButton href="/events/new">New event <span aria-hidden="true">↗</span></PillButton></div><p className="er-page-intro">Browse the event commitments available on GenLayer Bradbury. Open an event to inspect its baseline, evidence sources, and ticket register.</p>{error && <div className="er-form-error" role="alert">{error}</div>}{events.length ? <DataTable><thead><tr><th>Event</th><th>Date</th><th>Venue</th><th>Trigger</th><th>Tickets</th><th>Status</th></tr></thead><tbody>{events.map((event) => <tr key={event.event_id}><td><Link className="er-table-main" href={`/events/${encodeURIComponent(event.event_id)}`}>{event.title}<span className="er-table-sub">{event.event_id}</span></Link></td><td>{event.original_schedule}</td><td>{event.original_venue}</td><td>{eventTriggers(event).map(triggerLabel).join(", ") || "No trigger"}</td><td>—</td><td><StatusPill>{eventStatus(event)}</StatusPill></td></tr>)}</tbody></DataTable> : !error && <EmptyState title="Loading the event registry">Reading committed events from Bradbury…</EmptyState>}</EventRefundShell>;
}
