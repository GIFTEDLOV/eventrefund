"use client";

import { createClient } from "genlayer-js";
import { studionet, testnetBradbury } from "genlayer-js/chains";
import { ExecutionResult, TransactionStatus } from "genlayer-js/types";
import type { CalldataEncodable, TransactionHash } from "genlayer-js/types";

export type WriteStage = "precondition" | "broadcast" | "submitted" | "reviewing" | "finality" | "finalized";
const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "";

function chain() { return process.env.NEXT_PUBLIC_GENLAYER_NETWORK === "testnet-bradbury" ? testnetBradbury : studionet; }
export function contractAddress(): `0x${string}` { return CONTRACT_ADDRESS as `0x${string}`; }
export function endpoint() { return process.env.NEXT_PUBLIC_GENLAYER_RPC_URL || (process.env.NEXT_PUBLIC_GENLAYER_NETWORK === "testnet-bradbury" ? "https://bradbury.genlayer.com/api" : "https://studio.genlayer.com/api"); }
function makeClient(address?: string) { const config: Record<string, unknown> = { chain: chain(), endpoint: endpoint() }; if (address) { config.account = address as `0x${string}`; if (typeof window !== "undefined" && window.ethereum) config.provider = window.ethereum; } return createClient(config as never); }
export async function readMethod(functionName: string, args: CalldataEncodable[] = []) { if (!CONTRACT_ADDRESS) throw new Error("Set NEXT_PUBLIC_CONTRACT_ADDRESS first."); return makeClient().readContract({ address: contractAddress(), functionName, args }); }
function storageKey(key: string) { return `eventrefund:pending:${CONTRACT_ADDRESS}:${key}`; }
function pending(key: string): TransactionHash | null { if (typeof window === "undefined") return null; const value = window.localStorage.getItem(storageKey(key)); if (!value) return null; try { const parsed = JSON.parse(value) as { hash?: string }; return parsed.hash ? parsed.hash as TransactionHash : null; } catch { return null; } }
function save(key: string, hash: TransactionHash) { window.localStorage.setItem(storageKey(key), JSON.stringify({ key, hash })); }
function clear(key: string) { window.localStorage.removeItem(storageKey(key)); }
function succeeded(receipt: any, transaction: any) { const result = transaction?.txExecutionResultName ?? receipt?.txExecutionResultName; return result === ExecutionResult.FINISHED_WITH_RETURN || result === "FINISHED_WITH_RETURN"; }
function failure(receipt: any) { const result = String(receipt?.txExecutionResultName || receipt?.statusName || "unknown"); if (result.includes("TIMEOUT")) return "The assessment timed out. No decision was stored."; if (result.includes("DISAGREE") || result.includes("UNDETERMINED")) return "Validators did not reach agreement. No decision was stored."; return `The transaction completed without successful contract execution (${result}).`; }

export async function writeOnce<T>({ key, address, functionName, args, precondition, readState, verifyState, onStage }: { key: string; address: string; functionName: string; args: CalldataEncodable[]; precondition: () => Promise<void>; readState: () => Promise<T>; verifyState: (state: T) => boolean; onStage?: (stage: WriteStage, hash?: string) => void; }) {
  if (!CONTRACT_ADDRESS) throw new Error("Set NEXT_PUBLIC_CONTRACT_ADDRESS first.");
  const client = makeClient(address); let hash = pending(key); onStage?.("precondition", hash || undefined);
  if (!hash) { await precondition(); onStage?.("broadcast"); hash = (await client.writeContract({ address: contractAddress(), functionName, args, value: 0n })) as unknown as TransactionHash; save(key, hash); onStage?.("submitted", hash); } else onStage?.("submitted", hash);
  onStage?.("reviewing", hash); const receipt = await client.waitForTransactionReceipt({ hash, status: TransactionStatus.FINALIZED, retries: 120, interval: 5000 }); onStage?.("finality", hash); const transaction = await client.getTransaction({ hash }); if (!succeeded(receipt, transaction)) throw new Error(failure(receipt)); const state = await readState(); if (!verifyState(state)) throw new Error("Finalized transaction did not produce the expected stored state."); clear(key); onStage?.("finalized", hash); return { hash, receipt, state };
}
