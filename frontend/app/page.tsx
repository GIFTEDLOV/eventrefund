import Link from "next/link";
import { MarketingNav } from "@/components/EventRefundShell";
import { DataTable, Hairline, Muted, Panel, PillButton, Reveal, SerifHeading, StatusPill } from "@/components/er/Primitives";

const eventTitle = "The One on the River — Marlow Summer Triathlon";

export default function HomePage() {
  return <div className="er-marketing">
    <div className="er-announcement"><div className="er-announcement-inner">A clearer way to handle changing event terms <span aria-hidden="true">↗</span></div></div>
    <MarketingNav />
    <main className="er-marketing-main">
      <Reveal><section className="er-hero">
        <div>
          <p className="er-section-kicker">Event terms, made accountable</p>
          <SerifHeading as="h1" text="Refund decisions, *without* a single party deciding." />
          <p className="er-hero-copy">Organizers commit the event terms, refund triggers, and evidence in advance. When something changes, ticket holders can request a neutral assessment.</p>
          <div className="er-hero-actions"><PillButton href="/events">Open EventRefund <span aria-hidden="true">↗</span></PillButton><PillButton href="/verify" variant="outline">Verify a ticket</PillButton></div>
          <p className="er-hero-note">Built for clear commitments, readable outcomes, and no silent retries.</p>
        </div>
        <div className="er-hero-preview" aria-label="EventRefund product preview">
          <div className="er-preview-nav"><span>EVENTREFUND / WORKSPACE</span><span>BRADBURY · 4221</span></div>
          <div className="er-preview-body"><p className="er-eyebrow">Committed event</p><h2>{eventTitle}</h2><p className="er-widget-meta">Sunday 12 July 2026 · Higginson Park, Marlow</p><div className="er-preview-grid"><div className="er-preview-card"><span>Tickets registered</span><strong>1</strong></div><div className="er-preview-card"><span>Latest decision</span><strong>Inconclusive</strong></div></div></div>
          <div className="er-preview-status"><i /> No refund authorization issued</div>
        </div>
      </section></Reveal>

      <Reveal><section className="er-section" id="how-it-works">
        <div className="er-section-heading"><div><p className="er-section-kicker">How it works</p><SerifHeading text="A decision path everyone can read." /></div><p>EventRefund keeps the commitment, the evidence, and the final state close together.</p></div>
        <div className="er-how-list">
          <Reveal className="er-how-item"><div className="er-how-number">01 / 03</div><div className="er-how-copy"><h3>Commit the event</h3><p>The organizer fixes the baseline and the conditions that can activate a refund assessment.</p></div><div className="er-widget"><div className="er-widget-head"><span>EVENT BASELINE</span><StatusPill>Committed</StatusPill></div><p className="er-widget-title">{eventTitle}</p><p className="er-widget-meta">12 Jul 2026 · Higginson Park, Marlow</p><div className="er-evidence-list"><div className="er-evidence-row"><span>Trigger</span><span>Event cancelled</span></div><div className="er-evidence-row"><span>Evidence A</span><span>official site</span></div><div className="er-evidence-row"><span>Evidence B</span><span>venue source</span></div></div></div></Reveal>
          <Reveal className="er-how-item"><div className="er-how-number">02 / 03</div><div className="er-how-copy"><h3>Register tickets</h3><p>Each ticket keeps a simple link to its event, holder, assessment history, and authorization state.</p></div><div className="er-widget er-widget-dark"><div className="er-widget-head"><span>TICKET REGISTER</span><span>1 RECORD</span></div><table className="er-mini-table"><thead><tr><th>Ticket</th><th>Holder</th><th>Assessment</th><th>Auth.</th></tr></thead><tbody><tr><td>Marlow-001</td><td>0xe0f1…abde</td><td>1</td><td>None</td></tr></tbody></table></div></Reveal>
          <Reveal className="er-how-item"><div className="er-how-number">03 / 03</div><div className="er-how-copy"><h3>Reach a neutral decision</h3><p>Every outcome remains distinct. Inconclusive means the evidence did not support a final decision.</p></div><div className="er-widget"><div className="er-widget-head"><span>ASSESSMENT OUTCOMES</span><span>READABLE STATES</span></div><div className="er-decision-list"><div className="er-decision-row"><strong>Refund eligible</strong><span>Authorization issued</span></div><div className="er-decision-row"><strong>Not eligible</strong><span>No authorization</span></div><div className="er-decision-row is-current"><strong>Inconclusive</strong><span>No authorization</span></div></div></div></Reveal>
        </div>
      </section></Reveal>

      <Reveal><section className="er-section"><div className="er-section-heading"><div><p className="er-section-kicker">Designed for trust</p><SerifHeading text="Less noise. More state." /></div><p>The interface keeps technical proof available without making people interpret infrastructure jargon.</p></div><div className="er-feature-grid"><div className="er-feature"><p className="er-section-kicker">01</p><h3>Committed baselines</h3><p>Terms and evidence sources are fixed when the event is created.</p></div><div className="er-feature"><p className="er-section-kicker">02</p><h3>Neutral assessment</h3><p>Validators independently interpret the committed evidence path.</p></div><div className="er-feature"><p className="er-section-kicker">03</p><h3>Fail-closed outcomes</h3><p>No authorization is issued when the result is inconclusive.</p></div></div></section></Reveal>

      <Reveal><section className="er-final-cta"><div><p className="er-section-kicker">Start with the record</p><SerifHeading text="Open an event, or verify a ticket." /></div><div className="er-hero-actions"><PillButton href="/events">Open workspace</PillButton><PillButton href="/verify" variant="outline">Verify ticket</PillButton></div></section></Reveal>
      <footer className="er-footer"><div className="er-footer-grid"><span>EventRefund · neutral event decisions</span><span><Link href="/events">Workspace</Link> · <Link href="/verify">Verification</Link> · Bradbury testnet</span></div></footer>
    </main>
  </div>;
}
