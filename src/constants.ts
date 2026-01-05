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
  avalanche: 43114,
  "avalanche-fuji": 43113,
  base: 8453,
  "base-sepolia": 84532,
  celo: 42220,
  "celo-sepolia": 11142220,
  // CAIP-2 format support
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
  "base",
  "base-sepolia",
  "avalanche",
  "avalanche-fuji",
  "celo",
  "celo-sepolia",
];

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
