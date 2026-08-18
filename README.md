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

The representative live proof was completed on GenLayer Bradbury using the frozen contract source.

- Network: Bradbury (`chainId 4221`), RPC `https://rpc-bradbury.genlayer.com`
- Contract: `0x829a49A0B81fB344E407De254C82a36773832e93`
- Contract SHA-256: `a9b846001e31bdedca0fbf53b9b7ac2db5407bdb1940db4c7aa6f42195b8a2d8`
- Deployment transaction: `0x094d1719872cc25022485d467a7489676ab0ad8ce8a14988778f4beda57abccf`
- Event creation: `0x2c8cc38c01df518c3cc4a5c237908c04eacf0e6c8347f9e88132f8c925cf2f56` — FINALIZED, FINISHED_WITH_RETURN, 5/5 AGREE
- Event: `eventrefund-bradbury-20260818-marlow`
- Corrected ticket registration: `0x2154cf6df772c3523935f741f58b53edb22d99fb5019db53a9b4a8b8c18f6fca` — FINALIZED, FINISHED_WITH_RETURN
- Ticket: `eventrefund-marlow-ticket-001`
- Assessment: `0x4f09495a79b08d423b880a601502fe3721c1b22b8aeb62c6184bc76a11443b39` — FINALIZED, FINISHED_WITH_RETURN, 5/5 AGREE
- Assessment ID: `eventrefund-marlow-ticket-001#1`
- Actual verdict: `INCONCLUSIVE`
- Refund authorization: none (`{}`)
- Stored and independently reproduced result digest: `ba7de080a3018a28edadfa20cded9e80adaa6a8a545127cdf2dccf26b20d61bc` — exact match

This representative assessment demonstrates the fail-closed behavior: consensus produced `INCONCLUSIVE`, so the contract created no refund authorization. The result is reported as observed; it is not presented as a `REFUND_ELIGIBLE` proof.

The first ticket-registration attempt is preserved as provenance. Transaction `0x0f3aab993c9c659cd5a32500dd61dc66207b0b276bdc1d969361118b535978c7` finalized with `FINISHED_WITH_ERROR` and `UserError: INVALID_HOLDER_ADDRESS`; no ticket state was created. The Bradbury CLI `v0.40.0-clarke.4` coerced the hexadecimal holder argument into `CalldataAddress` even though `register_ticket` expects a string. The corrected direct GenLayerJS string transport succeeded. Public transaction-hash evidence is preserved under `artifacts/`.

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
- Only behaviors actually proven live may be described as Bradbury-proven; this checkout proves the representative Bradbury flow and its observed `INCONCLUSIVE` result.

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
- Live CLI: `genlayer 0.40.0-clarke.4`; Node `24.14.0`; Python Windows `3.14.3`; WSL Python `3.12.3`.
- Bradbury RPC: `https://rpc-bradbury.genlayer.com` (`chainId 4221`).
- `genlayer-js`: `1.1.8`, live proof commit `bf42f13a66a2bb762e5ef1065eb89789b9c45d4a`.
- Contract/source/deployable SHA-256: `a9b846001e31bdedca0fbf53b9b7ac2db5407bdb1940db4c7aa6f42195b8a2d8`.

The current linter’s semantic validation passed against its cached GenVM runner (`v0.6.0-rc2`).
