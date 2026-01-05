/**
 * x402 Core Types
 * Type definitions for x402 v2 payment protocol
 */

import type { Address } from "viem";

/**
 * Payment envelope containing authorization and signature
 */
export interface PaymentEnvelope {
  network: string;
  authorization: {
    from: string;
    to: string;
    value: string;
    nonce: string;
    validAfter?: string;
    validBefore: string;
  };
  signature: string;
}

/**
 * Payment requirements for a protected resource
 */
export interface PaymentRequirements {
  endpoint?: string;
  method?: string;
  price?: string;
  network: string;
  payTo: string;
  facilitator?: string;
  maxAmountRequired?: string;
  resource?: string;
  scheme?: string;
  asset?: string;
  tokenName?: string;
  tokenVersion?: string;
}

/**
 * Payment configuration for x402 middleware
 */
export interface PaymentConfig {
  payTo: `0x${string}`;
  facilitatorUrl: string;
  network: NetworkName;
  priceUsd: string;
}

/**
 * Result of payment verification
 */
export interface PaymentVerificationResult {
  isValid: boolean;
  payer?: string;
  invalidReason?: string;
  transactionHash?: string;
}

/**
 * Result of verifyX402Payment middleware
 */
export interface X402PaymentResult {
  isValid: boolean;
  response?: any;
  payer?: string;
  envelope?: PaymentEnvelope;
  paymentResponseHeader?: string;
}

/**
 * Supported network names
 */
export type NetworkName =
  | "base"
  | "base-sepolia"
  | "avalanche"
  | "avalanche-fuji"
  | "celo"
  | "celo-sepolia";

/**
 * CAIP-2 network identifier
 */
export type CAIP2Network =
  | "eip155:8453"
  | "eip155:84532"
  | "eip155:43114"
  | "eip155:43113"
  | "eip155:42220"
  | "eip155:11142220";

/**
 * Token information for EIP-712 domain
 */
export interface TokenInfo {
  address: Address;
  name: string;
  symbol: string;
  decimals: number;
  chainId: number;
}

/**
 * Settlement result from facilitator
 */
export interface SettlementResult {
  success: boolean;
  transactionHash?: string;
  error?: string;
}

/**
 * Payment route configuration (path → price in USD)
 */
export type PaymentRoutes = Record<string, number>;

/**
 * Options for x402 middleware
 */
export interface X402MiddlewareOptions {
  config: PaymentConfig;
  routes: PaymentRoutes;
  tokenDetector?: (address: Address, network: string) => Promise<TokenInfo | null>;
  logger?: {
    log: (...args: any[]) => void;
    error: (...args: any[]) => void;
  };
}
