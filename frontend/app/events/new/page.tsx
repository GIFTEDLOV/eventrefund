"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { EventRefundShell } from "@/components/EventRefundShell";
import { Panel, PillButton, WriteProgress } from "@/components/er/Primitives";
import { errorCopy } from "@/lib/eventrefund/presentation";
import { readMethod, writeOnce } from "@/lib/eventrefund/client";
import { useWallet } from "@/lib/genlayer/wallet";

const stages: Record<string, string> = { precondition: "precondition", broadcast: "broadcast", submitted: "submitted", reviewing: "reviewing", finality: "finality", finalized: "finalized" };

export default function NewEventPage() {
  const wallet = useWallet();
  const router = useRouter();
  const [form, setForm] = useState({ eventId: "", title: "", schedule: "", venue: "", headliner: "", a: "", b: "" });
  const [triggers, setTriggers] = useState({ cancelled: true, date: false, venue: false, headliner: false });
  const [stage, setStage] = useState("");
  const [error, setError] = useState("");
  const update = (key: string, value: string) => setForm((current) => ({ ...current, [key]: value }));
  const selectedTriggers = [triggers.cancelled && "Event cancelled", triggers.date && "Date changed", triggers.venue && "Venue changed", triggers.headliner && "Headline performer changed"].filter(Boolean);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    if (!wallet.address) { setError("Connect the organizer wallet first."); return; }
    if (!wallet.isOnCorrectNetwork) { setError("Switch to GenLayer Bradbury to continue."); return; }
    try {
      const args = [form.eventId, form.title, form.schedule, form.venue, form.headliner, triggers.cancelled, triggers.date, triggers.venue, triggers.headliner, form.a, form.b];
      await writeOnce({
        key: `create-event:${form.eventId}`,
        address: wallet.address,
        functionName: "create_event",
        args,
        precondition: async () => { const existing = await readMethod("get_event", [form.eventId]); if (existing && Object.keys(existing as object).length) throw new Error("That event ID is already registered."); },
        readState: () => readMethod("get_event", [form.eventId]),
        verifyState: (state: any) => state?.event_id === form.eventId && state?.title === form.title,
        onStage: (current) => setStage(stages[current]),
      });
      router.push(`/events/${encodeURIComponent(form.eventId)}`);
    } catch (reason) { setError(errorCopy(reason)); }
  }

  return <EventRefundShell><div className="er-page-heading"><div><p className="er-section-kicker">Organizer workflow</p><h1>Commit a new event</h1></div><p>Terms and evidence are fixed when the transaction succeeds.</p></div><form onSubmit={submit} className="er-form"><Panel className="er-form-section"><p className="er-section-kicker">01 / Event basics</p><h2>Set the baseline people will refer back to.</h2><p>Use plain language. This record becomes the reference point for future assessments.</p><div className="er-form-grid"><div className="er-field"><label htmlFor="event-id">Event ID</label><input id="event-id" className="er-input" required value={form.eventId} onChange={(e) => update("eventId", e.target.value)} placeholder="your-event-2026" /><small>A unique identifier for this event.</small></div><div className="er-field"><label htmlFor="event-title">Event title</label><input id="event-title" className="er-input" required value={form.title} onChange={(e) => update("title", e.target.value)} placeholder="The One on the River" /></div><div className="er-field"><label htmlFor="schedule">Original date / schedule</label><input id="schedule" className="er-input" required value={form.schedule} onChange={(e) => update("schedule", e.target.value)} placeholder="Sunday 12 July 2026" /></div><div className="er-field"><label htmlFor="venue">Original venue</label><input id="venue" className="er-input" required value={form.venue} onChange={(e) => update("venue", e.target.value)} placeholder="Higginson Park, Marlow" /></div><div className="er-field er-field-full"><label htmlFor="headliner">Headline performer <span className="er-muted">(optional)</span></label><input id="headliner" className="er-input" value={form.headliner} onChange={(e) => update("headliner", e.target.value)} placeholder="Leave blank if not applicable" /></div></div></Panel>
    <Panel className="er-form-section"><p className="er-section-kicker">02 / Refund conditions</p><h2>Choose the changes that can open an assessment.</h2><p>Each selected condition is stored with the event and evaluated against the committed evidence.</p><div className="er-check-grid">{[["cancelled", "Event cancelled", "The event does not go ahead."], ["date", "Date changed", "The committed schedule changes."], ["venue", "Venue changed", "The committed venue changes."], ["headliner", "Headline performer changed", "The committed performer changes."]].map(([key, label, description]) => <label className="er-check" key={key}><input type="checkbox" checked={(triggers as Record<string, boolean>)[key]} onChange={(e) => setTriggers((current) => ({ ...current, [key]: e.target.checked }))} /><span><strong>{label}</strong><span>{description}</span></span></label>)}</div></Panel>
    <Panel className="er-form-section"><p className="er-section-kicker">03 / Evidence sources</p><h2>Fix the sources used for future assessments.</h2><p>These sources are fixed when the event is created and are used for future assessments. Use two HTTPS URLs on different hostnames.</p><div className="er-form-grid"><div className="er-field"><label htmlFor="evidence-a">Evidence source A</label><input id="evidence-a" className="er-input" type="url" required value={form.a} onChange={(e) => update("a", e.target.value)} placeholder="https://organizer.example/event" /></div><div className="er-field"><label htmlFor="evidence-b">Evidence source B</label><input id="evidence-b" className="er-input" type="url" required value={form.b} onChange={(e) => update("b", e.target.value)} placeholder="https://venue.example/calendar" /></div></div></Panel>
    <Panel className="er-form-section"><p className="er-section-kicker">04 / Review</p><h2>Ready to commit?</h2><div className="er-form-review"><div className="er-list"><div className="er-list-row"><span>Event</span><span>{form.title || "Untitled event"}</span></div><div className="er-list-row"><span>Schedule</span><span>{form.schedule || "Not set"}</span></div><div className="er-list-row"><span>Venue</span><span>{form.venue || "Not set"}</span></div><div className="er-list-row"><span>Conditions</span><span>{selectedTriggers.length ? selectedTriggers.join(", ") : "None selected"}</span></div></div></div><div className="er-form-actions"><PillButton type="submit" disabled={!wallet.address || !wallet.isOnCorrectNetwork || Boolean(stage && stage !== "finalized")}>Create event <span aria-hidden="true">↗</span></PillButton><span className="er-muted">Writes require your connected wallet.</span></div><WriteProgress stage={stage} error={error} /></Panel>
  </form></EventRefundShell>;
}
