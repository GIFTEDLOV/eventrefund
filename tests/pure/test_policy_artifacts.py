import hashlib
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).parents[2]
sys.path.insert(0, str(ROOT / "tools"))
from canonical_digest import canonical_result, result_digest  # noqa: E402

def test_canonical_digest_has_fixed_keys_and_no_timestamp():
    serialized = canonical_result("ticket-1#1", "ticket-1", "event-1", "REFUND_ELIGIBLE")
    assert serialized == '{"assessment_id":"ticket-1#1","event_id":"event-1","ticket_id":"ticket-1","verdict":"REFUND_ELIGIBLE"}'
    assert "timestamp" not in serialized
    assert result_digest("ticket-1#1", "ticket-1", "event-1", "REFUND_ELIGIBLE") == hashlib.sha256(serialized.encode()).hexdigest()

def test_digest_cli_matches_imported_calculator():
    expected = result_digest("a#1", "a", "e", "NOT_ELIGIBLE")
    actual = subprocess.check_output([sys.executable, str(ROOT / "tools" / "canonical_digest.py"), "a#1", "a", "e", "NOT_ELIGIBLE"], text=True).strip()
    assert actual == expected
