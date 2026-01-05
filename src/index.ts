/**
 * @perkos/x402-core
 * x402 v2 payment protocol middleware and utilities for vendor services
 */

// Types
export type {
  PaymentEnvelope,
  PaymentRequirements,
  PaymentConfig,
  PaymentVerificationResult,
  X402PaymentResult,
  NetworkName,
  CAIP2Network,
  TokenInfo,
  SettlementResult,
  PaymentRoutes,
  X402MiddlewareOptions,
} from "./types";

// Constants
export {
  USDC_ADDRESSES,
  CHAIN_IDS,
  NETWORK_TO_CAIP2,
  CAIP2_TO_NETWORK,
  DEFAULT_RPC_URLS,
  VALID_NETWORKS,
  TRANSFER_WITH_AUTHORIZATION_TYPES,
} from "./constants";

// Utilities
export {
  getUSDCAddress,
  getChainId,
  getRpcUrl,
  toCAIP2Network,
  toLegacyNetwork,
  parsePriceToUSDC,
  formatUSDCToPrice,
  generateNonce,
  createEIP712Domain,
  formatPaymentSignature,
  parsePaymentSignature,
  isValidNetwork,
  getValidBefore,
  getValidAfter,
} from "./utils";

// Middleware
export {
  extractPaymentEnvelope,
  verifyPayment,
  settlePayment,
  create402Response,
  verifyX402Payment,
  type MiddlewareContext,
} from "./middleware";

// Next.js integration
export {
  verifyX402Payment as verifyX402PaymentNext,
  createX402Middleware,
  type NextX402Options,
} from "./next";
