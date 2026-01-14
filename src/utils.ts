/**
 * x402 Core Utilities
 * Helper functions for x402 payment processing
 */

import { parseUnits } from "viem";
import type { Address } from "viem";
import type { NetworkName, PaymentEnvelope } from "./types";
import {
  USDC_ADDRESSES,
  CHAIN_IDS,
  NETWORK_TO_CAIP2,
  CAIP2_TO_NETWORK,
  DEFAULT_RPC_URLS,
  getDomainVersion,
  getTokenName,
} from "./constants";

/**
 * Get USDC address for a network
 */
export function getUSDCAddress(network: string): Address {
  const legacyNetwork = toLegacyNetwork(network);
  return USDC_ADDRESSES[legacyNetwork as NetworkName] || USDC_ADDRESSES.avalanche;
}

/**
 * Get chain ID for a network
 */
export function getChainId(network: string): number {
  return CHAIN_IDS[network] || CHAIN_IDS.avalanche;
}

/**
 * Get RPC URL for a network (with environment variable override support)
 */
export function getRpcUrl(network: string, envOverrides?: Record<string, string | undefined>): string {
  const legacyNetwork = toLegacyNetwork(network);

  // Check for environment variable overrides
  if (envOverrides) {
    const envKey = `${legacyNetwork.toUpperCase().replace(/-/g, "_")}_RPC_URL`;
    if (envOverrides[envKey]) {
      return envOverrides[envKey]!;
    }
  }

  return DEFAULT_RPC_URLS[legacyNetwork as NetworkName] || DEFAULT_RPC_URLS.avalanche;
}

/**
 * Convert network name to CAIP-2 format for x402 V2
 * e.g., "base-sepolia" → "eip155:84532"
 */
export function toCAIP2Network(network: string): string {
  if (network.includes(":")) {
    return network;
  }
  return NETWORK_TO_CAIP2[network as NetworkName] || network;
}

/**
 * Convert CAIP-2 network format to legacy format
 * e.g., "eip155:43114" → "avalanche"
 */
export function toLegacyNetwork(network: string): string {
  if (!network.includes(":")) {
    return network;
  }
  return CAIP2_TO_NETWORK[network] || "avalanche";
}

/**
 * Parse USD price string to USDC amount (6 decimals)
 * e.g., "$0.05" → 50000n
 */
export function parsePriceToUSDC(price: string): bigint {
  const numericPrice = price.replace("$", "").trim();
  const amount = parseFloat(numericPrice);
  return parseUnits(amount.toString(), 6);
}

/**
 * Format USDC amount to USD string
 * e.g., 50000n → "$0.05"
 */
export function formatUSDCToPrice(amount: bigint): string {
  const value = Number(amount) / 1_000_000;
  return `$${value.toFixed(2)}`;
}

/**
 * Generate random nonce for payment (32 bytes)
 */
export function generateNonce(): `0x${string}` {
  const randomBytes = new Uint8Array(32);
  crypto.getRandomValues(randomBytes);
  return `0x${Array.from(randomBytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")}` as `0x${string}`;
}

/**
 * Create EIP-712 domain for token transferWithAuthorization
 * Uses network-specific version and token name
 * - Version: All Circle native USDC uses "2" (verified on-chain)
 * - Token name: Celo uses "USDC", others use "USD Coin"
 */
export function createEIP712Domain(
  network: string,
  tokenAddress?: Address,
  tokenName?: string,
  version?: string
) {
  const address = tokenAddress || getUSDCAddress(network);
  // Use network-specific token name (Celo = "USDC", others = "USD Coin")
  const name = tokenName || getTokenName(network);
  const domainVersion = version || getDomainVersion(network);

  return {
    name,
    version: domainVersion,
    chainId: getChainId(network),
    verifyingContract: address,
  };
}

/**
 * Format payment payload for x402 v2 PAYMENT-SIGNATURE header
 * Per spec: https://www.x402.org/writing/x402-v2-launch
 */
export function formatPaymentSignature(
  envelope: PaymentEnvelope,
  network: string,
  encodeBase64: boolean = true
): string {
  const paymentPayload = {
    x402Version: 2,
    scheme: "exact",
    network: toCAIP2Network(network),
    payload: envelope,
  };

  const jsonString = JSON.stringify(paymentPayload);

  if (encodeBase64) {
    return Buffer.from(jsonString).toString("base64");
  }
  return jsonString;
}

/**
 * Parse payment signature from header
 */
export function parsePaymentSignature(header: string): PaymentEnvelope | null {
  try {
    let parsed: any;

    // Try base64 first (V2 standard)
    try {
      const decoded = Buffer.from(header, "base64").toString("utf-8");
      parsed = JSON.parse(decoded);
    } catch {
      // Fallback to direct JSON
      parsed = JSON.parse(header);
    }

    // x402 v2 format: extract envelope from payload
    if (parsed.x402Version === 2 && parsed.payload) {
      return parsed.payload as PaymentEnvelope;
    }

    // V1 format or direct envelope
    return parsed as PaymentEnvelope;
  } catch {
    return null;
  }
}

/**
 * Validate network name
 */
export function isValidNetwork(network: string): network is NetworkName {
  return network in NETWORK_TO_CAIP2;
}

/**
 * Get valid before timestamp (default: 30 minutes from now)
 */
export function getValidBefore(minutes: number = 30): string {
  return String(Math.floor(Date.now() / 1000) + minutes * 60);
}

/**
 * Get valid after timestamp (default: now)
 */
export function getValidAfter(): string {
  return String(Math.floor(Date.now() / 1000));
}
