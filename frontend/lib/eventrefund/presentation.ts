import type { AssessmentRecord, EventRecord } from "./types";

export const fixtureEventId = "eventrefund-bradbury-20260818-marlow";
export const fixtureTicketId = "eventrefund-marlow-ticket-001";

export function triggerLabel(trigger: string) {
  return {
    EVENT_CANCELLED: "Event cancelled",
    DATE_CHANGED: "Date changed",
    VENUE_CHANGED: "Venue changed",
    HEADLINER_CHANGED: "Headliner changed",
  }[trigger] || trigger.replaceAll("_", " ").toLowerCase();
}

export function eventTriggers(event: EventRecord) {
  return [
    event.trigger_event_cancelled && "EVENT_CANCELLED",
    event.trigger_date_changed && "DATE_CHANGED",
    event.trigger_venue_changed && "VENUE_CHANGED",
    event.trigger_headliner_changed && "HEADLINER_CHANGED",
  ].filter(Boolean) as string[];
}

export function verdictLabel(verdict?: AssessmentRecord["verdict"] | string) {
  if (verdict === "REFUND_ELIGIBLE") return "Refund eligible";
  if (verdict === "NOT_ELIGIBLE") return "Not eligible";
  if (verdict === "INCONCLUSIVE") return "Inconclusive";
  return verdict || "Not assessed";
}

export function verdictExplanation(verdict?: AssessmentRecord["verdict"] | string) {
  if (verdict === "REFUND_ELIGIBLE") return "The assessment found that the committed refund conditions were met.";
  if (verdict === "NOT_ELIGIBLE") return "The assessment found that the committed refund conditions were not met.";
  if (verdict === "INCONCLUSIVE") return "The evidence did not support a final eligibility decision.";
  return "No assessment has been stored for this ticket yet.";
}

export function errorCopy(error: unknown) {
  const message = error instanceof Error ? error.message : String(error || "");
  const upper = message.toUpperCase();
  if (upper.includes("TIMEOUT")) return "The evaluation could not complete in time. Your transaction has not been submitted again.";
  if (upper.includes("DISAGREE")) return "Validators did not reach the required agreement.";
  if (upper.includes("UNDETERMINED")) return "The network could not establish a final decision.";
  if (upper.includes("EVIDENCE") || upper.includes("SCHEMA")) return "The evidence could not be verified.";
  if (upper.includes("NETWORK") || upper.includes("CHAIN") || upper.includes("BRADBURY")) return "Switch to GenLayer Bradbury to continue.";
  if (upper.includes("FINISHED_WITH_ERROR") || upper.includes("CONTRACT OPERATION")) return "The transaction finalized, but the contract operation did not complete successfully.";
  return message || "Something went wrong. Review the technical details and try again only when the state is clear.";
}

export function formatDate(schedule: string) {
  return schedule || "Date not specified";
}

export function eventStatus(event: EventRecord) {
  return eventTriggers(event).length ? "Committed" : "Needs conditions";
}
