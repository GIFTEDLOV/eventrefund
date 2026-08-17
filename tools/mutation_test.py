"""Deliberate critical-gate mutation checks for EventRefund."""
from pathlib import Path

CONTRACT = Path(__file__).parents[1] / "contracts" / "event_refund.py"

def gate_audit(source: str) -> bool:
    return all((
        "if ticket.holder_address != self._sender_address():" in source,
        'raise gl.vm.UserError("ONLY_TICKET_HOLDER")' in source,
        'raise gl.vm.UserError("REFUND_ALREADY_AUTHORIZED")' in source,
        'if not url.startswith("https://") or "#" in url:' in source,
        'if self._hostname(first) == self._hostname(second):' in source,
        'if not isinstance(value, dict) or set(value.keys()) != {"verdict"}:' in source,
        'return verdict if verdict in ALLOWED_VERDICTS else INCONCLUSIVE' in source,
        "gl.vm.run_nondet_unsafe(leader_fn, validator_fn)" in source,
        'return leader_verdict == validator_data.get("verdict")' in source,
        'if verdict == REFUND_ELIGIBLE:' in source,
        "self.refund_authorizations[ticket.ticket_id]" in source,
    ))

MUTATIONS = {
    "holder-authorization": ("if ticket.holder_address != self._sender_address():", "if False:"),
    "https-url-gate": ('if not url.startswith("https://") or "#" in url:', "if False:"),
    "strict-parser": ('if not isinstance(value, dict) or set(value.keys()) != {"verdict"}:', "if False:"),
    "independent-validator": ('return leader_verdict == validator_data.get("verdict")', "return True"),
    "authorization-certificate": ('if verdict == REFUND_ELIGIBLE:', "if False:"),
}

def main() -> int:
    source = CONTRACT.read_text(encoding="utf-8")
    assert gate_audit(source), "baseline EventRefund gate audit failed"
    killed = 0
    for name, (original, mutant) in MUTATIONS.items():
        mutated = source.replace(original, mutant, 1)
        assert mutated != source, f"mutation did not apply: {name}"
        assert not gate_audit(mutated), f"critical mutation survived: {name}"
        killed += 1
    print(f"killed {killed}/{len(MUTATIONS)} critical mutations")
    return 0

if __name__ == "__main__":
    raise SystemExit(main())
