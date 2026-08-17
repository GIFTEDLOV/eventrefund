"""Independent EventRefund result digest calculator."""
import hashlib
import json
import sys

def canonical_result(assessment_id: str, ticket_id: str, event_id: str, verdict: str) -> str:
    return json.dumps({"assessment_id": assessment_id, "event_id": event_id, "ticket_id": ticket_id, "verdict": verdict}, sort_keys=True, separators=(",", ":"))

def result_digest(assessment_id: str, ticket_id: str, event_id: str, verdict: str) -> str:
    return hashlib.sha256(canonical_result(assessment_id, ticket_id, event_id, verdict).encode()).hexdigest()

if __name__ == "__main__":
    if len(sys.argv) != 5:
        raise SystemExit("usage: canonical_digest.py assessment_id ticket_id event_id verdict")
    print(result_digest(*sys.argv[1:]))
