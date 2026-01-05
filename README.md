# @perkos/middleware-x402

x402 v2 payment protocol middleware and utilities for building vendor services with micropayments.

## Installation

```bash
npm install @perkos/middleware-x402
# or
pnpm add @perkos/middleware-x402
# or
yarn add @perkos/middleware-x402
```

## Features

- **x402 v2 Protocol Support**: Full implementation of the x402 v2 payment specification
- **Multi-Network Support**: Avalanche, Base, Celo (mainnet and testnets)
- **Payment Middleware**: Easy integration with Next.js API routes
- **EIP-712 Signatures**: TransferWithAuthorization support for USDC
- **Type-Safe**: Full TypeScript support with comprehensive types

## Quick Start

### Next.js Integration

```typescript
import { NextRequest, NextResponse } from "next/server";
import { verifyX402PaymentNext, type PaymentConfig, type PaymentRoutes } from "@perkos/middleware-x402";

// Configure your payment settings
const config: PaymentConfig = {
  payTo: "0xYourWalletAddress" as `0x${string}`,
  facilitatorUrl: "https://stack.perkos.xyz",
  network: "avalanche",
  priceUsd: "0.05",
};

// Define payment routes
const routes: PaymentRoutes = {
  "/api/ai/translate": 0.03,
  "/api/ai/analyze": 0.05,
  "/api/ai/generate": 0.15,
};

export async function POST(request: NextRequest) {
  // Verify payment
  const paymentResult = await verifyX402PaymentNext(request, "/api/ai/translate", {
    config,
    routes,
  });

  if (!paymentResult.isValid) {
    return paymentResult.response;
  }

  // Process request - payment verified!
  const result = await processRequest(request);

  // Return response with payment header
  const headers: Record<string, string> = {};
  if (paymentResult.paymentResponseHeader) {
    headers["PAYMENT-RESPONSE"] = paymentResult.paymentResponseHeader;
  }

  return NextResponse.json({ success: true, data: result }, { headers });
}
```

### Utilities

```typescript
import {
  getUSDCAddress,
  toCAIP2Network,
  parsePriceToUSDC,
  generateNonce,
  createEIP712Domain,
} from "@perkos/middleware-x402";

// Get USDC address for a network
const usdcAddress = getUSDCAddress("avalanche");
// => "0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E"

// Convert network to CAIP-2 format
const caip2 = toCAIP2Network("base-sepolia");
// => "eip155:84532"

// Parse USD price to USDC atomic units
const amount = parsePriceToUSDC("$0.05");
// => 50000n

// Generate payment nonce
const nonce = generateNonce();
// => "0x..."

// Create EIP-712 domain for signing
const domain = createEIP712Domain("avalanche");
// => { name: "USD Coin", version: "2", chainId: 43114, verifyingContract: "0x..." }
```

## API Reference

### Types

#### `PaymentConfig`
```typescript
interface PaymentConfig {
  payTo: `0x${string}`;      // Recipient wallet address
  facilitatorUrl: string;     // x402 facilitator URL
  network: NetworkName;       // Network name
  priceUsd: string;          // Default price in USD
}
```

#### `PaymentRoutes`
```typescript
type PaymentRoutes = Record<string, number>;
// Example: { "/api/endpoint": 0.05 }
```

#### `PaymentEnvelope`
```typescript
interface PaymentEnvelope {
  network: string;
  authorization: {
    from: string;
    to: string;
    value: string;
    nonce: string;
    validBefore: string;
  };
  signature: string;
}
```

### Constants

- `USDC_ADDRESSES` - USDC contract addresses by network
- `CHAIN_IDS` - Chain IDs by network
- `NETWORK_TO_CAIP2` - Network to CAIP-2 mapping
- `VALID_NETWORKS` - List of supported networks

### Functions

#### `verifyX402PaymentNext(request, route, options)`
Verify x402 payment in Next.js API route.

#### `getUSDCAddress(network)`
Get USDC contract address for a network.

#### `toCAIP2Network(network)`
Convert network name to CAIP-2 format.

#### `parsePriceToUSDC(price)`
Parse USD price string to USDC atomic units.

#### `generateNonce()`
Generate random 32-byte nonce for payment.

#### `createEIP712Domain(network, tokenAddress?, tokenName?)`
Create EIP-712 domain for TransferWithAuthorization.

## Supported Networks

| Network | Chain ID | CAIP-2 |
|---------|----------|--------|
| Avalanche | 43114 | eip155:43114 |
| Avalanche Fuji | 43113 | eip155:43113 |
| Base | 8453 | eip155:8453 |
| Base Sepolia | 84532 | eip155:84532 |
| Celo | 42220 | eip155:42220 |
| Celo Sepolia | 11142220 | eip155:11142220 |

## License

MIT
