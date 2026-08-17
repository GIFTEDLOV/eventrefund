# EventRefund

## Product

EventRefund is a complete user-facing GenLayer application for neutral event-refund eligibility decisions. An organizer commits an event baseline, enables one or more of four supported refund triggers, and fixes exactly two public HTTPS evidence sources on different hostnames. A registered ticket holder can request an assessment using those same committed sources.

## Problem

Event cancellations and material event changes are often decided from scattered public notices. A centralized operator can misread the evidence, use a different source than the parties agreed, or silently change the rule after a ticket is registered. EventRefund makes the baseline, trigger set, evidence channels, assessment history, and final authorization queryable.

## Why GenLayer

The decision depends on public web evidence and language interpretation, not only deterministic on-chain data. GenLayer validators independently retrieve the committed text sources and independently evaluate the bounded question through the Equivalence Principle. The contract stores only the consensus-backed verdict and its deterministic result digest.

## How it works

1. The organizer creates an immutable event with `EVENT_CANCELLED`, `DATE_CHANGED`, `VENUE_CHANGED`, and/or `HEADLINER_CHANGED` enabled.
2. The organizer registers a unique ticket and holder address.
3. Only that holder requests an assessment. No claim-time evidence URL is accepted.
4. The leader and validators render the two precommitted URLs as readable text and independently derive a strict one-field verdict.
5. `NOT_ELIGIBLE` and `INCONCLUSIVE` remain point-in-time history and do not lock the ticket. A finalized `REFUND_ELIGIBLE` result permanently issues a refund authorization.

## Architecture

- `contracts/event_refund.py`: small immutable event/ticket state, assessment history, and permanent authorization certificate.
- `gl.vm.run_nondet_unsafe`: custom leader/validator equivalence. Validators re-fetch both sources and compare the independently derived verdict, never raw HTML/text and never only the leader’s enum.
- `frontend/`: Next.js app with real GenLayerJS reads, wallet writes, event/ticket/assessment workflows, and authorization verification.
- `tools/canonical_digest.py`: independent compact canonical digest calculator.
- `tools/mutation_test.py`: deliberate critical-gate mutation harness.

## Use

```shell
python -m venv .venv
.venv/Scripts/python.exe -m pip install -r requirements.txt
.venv/Scripts/genvm-lint.exe lint contracts/event_refund.py
.venv/Scripts/genvm-lint.exe validate contracts/event_refund.py
.venv/Scripts/python.exe -m pytest tests/pure -q
.venv/Scripts/python.exe tools/mutation_test.py
npm install --no-audit --no-fund --ignore-scripts
npm run build
```

For a live frontend, copy `frontend/.env.example` to `frontend/.env`, set `NEXT_PUBLIC_CONTRACT_ADDRESS` to a deployed EventRefund address, choose the RPC/network, then run `npm run dev`.

## Live proof

No Bradbury deployment or real-world REFUND_ELIGIBLE assessment is claimed in this checkout. No private key was requested or used. The release gate stopped before live deployment because the available environment did not provide an operational Studio/Bradbury account and the required genuinely public live fixture could not be established safely.

## Security/trust model

- Evidence URLs require HTTPS, bounded length, no fragments, no localhost, no IPv4 literals, and distinct hostnames; they are immutable after event creation.
- Retrieved pages are bounded readable text and are untrusted data. Page instructions cannot alter evaluator instructions.
- Model output must be exactly one JSON object with exactly one `verdict` key. Malformed, extra-key, missing-key, unknown, unavailable, timeout, failure, or disagreement paths fail closed to `INCONCLUSIVE` or leave no state change; they never become `NOT_ELIGIBLE`.
- Validators independently retrieve and interpret the same committed sources. The leader is not trusted.
- Writes use a client-side pending-hash record, broadcast once, reconcile the same hash, require finality and successful execution, then verify expected stored state.

## Limitations

- EventRefund provides an agreed evidence-based refund authorization, not a court judgment.
- It does not itself process the monetary refund in v1.
- Evidence URLs are agreed public sources; consensus does not cryptographically prove that every source statement is truthful.
- `NOT_ELIGIBLE` is a point-in-time assessment.
- Only behaviors actually proven live may be described as Bradbury-proven; none are claimed here.

## Developer/API detail

Contract API:

- `create_event(...)`
- `register_ticket(ticket_id, event_id, holder_address)`
- `assess_ticket(ticket_id)`
- `get_event(...)`, `get_ticket(...)`, `get_assessment(...)`, `get_refund_authorization(...)`
- `get_event_ids()`, `get_ticket_ids()`, `get_assessment_ids()`
- `contract_info()`

Selected pinned sources:

- Official boilerplate commit: `e685f1f12c4c357787d48390692a654baf576f03`
- `genlayer-js`: `1.1.8`, official main commit `1b7f50a3a3f2963ea857941b0fb386081dd5c326`
- `genlayer-py`: `0.18.0`, commit `a3dc35e04898e3889cbfa855bcaf7d2664675b8f`
- `genlayer-test`: `0.29.2`, commit `343e3a358f9e235a93b49c60721ce7676585ff07`
- `genvm-linter`: `0.10.0`, commit `fa4a4d4536b28fdc2730e13a983ba01b69ccc6f3`
- Installed CLI: `genlayer 0.39.1`; Node `24.14.0`; Python Windows `3.14.3`; WSL Python `3.12.3`.
- Contract/source/deployable SHA-256: `48b418d823ee8aaa7722c94631ca38c36399a3f27c05dbbaba314f3d376e1bc2`.

The current linter’s semantic validation passed against its cached GenVM runner (`v0.6.0-rc2`).
