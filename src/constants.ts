/**
 * x402 Core Constants
 * Network configurations, addresses, and mappings
 */

import type { Address } from "viem";
import type { NetworkName, CAIP2Network } from "./types";

/**
 * USDC Contract Addresses by Network
 */
export const USDC_ADDRESSES: Record<NetworkName, Address> = {
  ethereum: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
  avalanche: "0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E",
  "avalanche-fuji": "0x5425890298aed601595a70AB815c96711a31Bc65",
  base: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
  "base-sepolia": "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
  celo: "0xcebA9300f2b948710d2653dD7B07f33A8B32118C",
  "celo-sepolia": "0x2F25deB3848C207fc8E0c34035B3Ba7fC157602B",
};

/**
 * Chain IDs by Network
 */
export const CHAIN_IDS: Record<string, number> = {
  ethereum: 1,
  avalanche: 43114,
  "avalanche-fuji": 43113,
  base: 8453,
  "base-sepolia": 84532,
  celo: 42220,
  "celo-sepolia": 11142220,
  // CAIP-2 format support
  "eip155:1": 1,
  "eip155:43114": 43114,
  "eip155:43113": 43113,
  "eip155:8453": 8453,
  "eip155:84532": 84532,
  "eip155:42220": 42220,
  "eip155:11142220": 11142220,
};

/**
 * Network to CAIP-2 mapping
 */
export const NETWORK_TO_CAIP2: Record<NetworkName, CAIP2Network> = {
  ethereum: "eip155:1",
  avalanche: "eip155:43114",
  "avalanche-fuji": "eip155:43113",
  base: "eip155:8453",
  "base-sepolia": "eip155:84532",
  celo: "eip155:42220",
  "celo-sepolia": "eip155:11142220",
};

/**
 * CAIP-2 to Network mapping
 */
export const CAIP2_TO_NETWORK: Record<string, NetworkName> = {
  "eip155:1": "ethereum",
  "eip155:43114": "avalanche",
  "eip155:43113": "avalanche-fuji",
  "eip155:8453": "base",
  "eip155:84532": "base-sepolia",
  "eip155:42220": "celo",
  "eip155:11142220": "celo-sepolia",
};

/**
 * Default RPC URLs by Network
 */
export const DEFAULT_RPC_URLS: Record<NetworkName, string> = {
  ethereum: "https://eth.llamarpc.com",
  avalanche: "https://api.avax.network/ext/bc/C/rpc",
  "avalanche-fuji": "https://api.avax-test.network/ext/bc/C/rpc",
  base: "https://mainnet.base.org",
  "base-sepolia": "https://sepolia.base.org",
  celo: "https://forno.celo.org",
  "celo-sepolia": "https://forno.celo-sepolia.celo-testnet.org",
};

/**
 * Valid network names
 */
export const VALID_NETWORKS: NetworkName[] = [
  "ethereum",
  "base",
  "base-sepolia",
  "avalanche",
  "avalanche-fuji",
  "celo",
  "celo-sepolia",
];

/**
 * EIP-712 Domain Versions by Network
 * All Circle native USDC deployments use version "2"
 * Verified on-chain via contract.version() calls:
 * - Celo mainnet: verified returns "2"
 * - All other chains: use "2" per Circle USDC standard
 */
export const DOMAIN_VERSIONS: Record<string, string> = {
  ethereum: "2",
  avalanche: "2",
  "avalanche-fuji": "2",
  base: "2",
  "base-sepolia": "2",
  celo: "2", // Verified: contract.version() returns "2"
  "celo-sepolia": "2",
  // CAIP-2 format support
  "eip155:1": "2",
  "eip155:43114": "2",
  "eip155:43113": "2",
  "eip155:8453": "2",
  "eip155:84532": "2",
  "eip155:42220": "2", // Celo - verified on-chain
  "eip155:11142220": "2", // Celo Sepolia
};

/**
 * Get EIP-712 domain version for a network
 */
export function getDomainVersion(network: string): string {
  return DOMAIN_VERSIONS[network] || "2";
}

/**
 * EIP-712 Token Names by Network
 * Different USDC deployments use different token names in the EIP-712 domain:
 * - Most Circle native USDC: "USD Coin"
 * - Celo native USDC: "USDC" (verified on-chain via name())
 */
export const TOKEN_NAMES: Record<string, string> = {
  ethereum: "USD Coin",
  avalanche: "USD Coin",
  "avalanche-fuji": "USD Coin",
  base: "USD Coin",
  "base-sepolia": "USD Coin",
  celo: "USDC", // Celo native USDC returns "USDC" from name()
  "celo-sepolia": "USDC",
  // CAIP-2 format support
  "eip155:1": "USD Coin",
  "eip155:43114": "USD Coin",
  "eip155:43113": "USD Coin",
  "eip155:8453": "USD Coin",
  "eip155:84532": "USD Coin",
  "eip155:42220": "USDC", // Celo
  "eip155:11142220": "USDC", // Celo Sepolia
};

/**
 * Get EIP-712 token name for a network
 */
export function getTokenName(network: string): string {
  return TOKEN_NAMES[network] || "USD Coin";
}

/**
 * EIP-712 TransferWithAuthorization types
 */
export const TRANSFER_WITH_AUTHORIZATION_TYPES = {
  TransferWithAuthorization: [
    { name: "from", type: "address" },
    { name: "to", type: "address" },
    { name: "value", type: "uint256" },
    { name: "validAfter", type: "uint256" },
    { name: "validBefore", type: "uint256" },
    { name: "nonce", type: "bytes32" },
  ],
} as const;
