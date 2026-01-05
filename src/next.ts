/**
 * x402 Next.js Integration
 * Helper functions for Next.js API routes
 */

import type { PaymentConfig, PaymentRoutes, TokenInfo, X402PaymentResult } from "./types";
import { verifyX402Payment as baseVerifyX402Payment, type MiddlewareContext } from "./middleware";

/**
 * Next.js specific middleware context
 */
export interface NextX402Options {
  config: PaymentConfig;
  routes: PaymentRoutes;
  tokenDetector?: (address: string, network: string) => Promise<TokenInfo | null>;
}

/**
 * Create Next.js response helper
 */
function createNextResponse(body: any, options: { status: number; headers?: Record<string, string> }) {
  // Dynamic import to avoid bundling issues
  const { NextResponse } = require("next/server");
  return NextResponse.json(body, { status: options.status, headers: options.headers });
}

/**
 * Get header from Next.js request
 */
function getNextHeader(request: any, name: string): string | null {
  return request.headers?.get?.(name) || null;
}

/**
 * Verify x402 payment in Next.js API route
 *
 * @example
 * ```typescript
 * import { verifyX402Payment } from "@perkos/x402-core/next";
 *
 * export async function POST(request: NextRequest) {
 *   const result = await verifyX402Payment(request, "/api/ai/translate", {
 *     config: x402Config,
 *     routes: paymentRoutes,
 *   });
 *
 *   if (!result.isValid) {
 *     return result.response;
 *   }
 *
 *   // Process request...
 * }
 * ```
 */
export async function verifyX402Payment(
  request: any,
  route: string,
  options: NextX402Options
): Promise<X402PaymentResult> {
  const ctx: MiddlewareContext = {
    config: options.config,
    routes: options.routes,
    tokenDetector: options.tokenDetector,
    createResponse: createNextResponse,
    getHeader: getNextHeader,
  };

  return baseVerifyX402Payment(request, route, ctx);
}

/**
 * Create a configured middleware instance for Next.js
 */
export function createX402Middleware(options: NextX402Options) {
  return {
    verify: (request: any, route: string) => verifyX402Payment(request, route, options),
    options,
  };
}
