/**
 * x402 Payment Middleware
 * Payment verification and settlement for API routes
 */

import type {
  PaymentEnvelope,
  PaymentVerificationResult,
  X402PaymentResult,
  PaymentConfig,
  PaymentRoutes,
  TokenInfo,
  SettlementResult,
} from "./types";
import {
  toCAIP2Network,
  toLegacyNetwork,
  parsePriceToUSDC,
  getUSDCAddress,
  parsePaymentSignature,
} from "./utils";

export interface MiddlewareContext {
  config: PaymentConfig;
  routes: PaymentRoutes;
  tokenDetector?: (address: string, network: string) => Promise<TokenInfo | null>;
  createResponse?: (body: any, options: { status: number; headers?: Record<string, string> }) => any;
  getHeader?: (request: any, name: string) => string | null;
}

/**
 * Extract payment envelope from request headers
 */
export function extractPaymentEnvelope(
  request: any,
  getHeader?: (req: any, name: string) => string | null
): PaymentEnvelope | null {
  const headerGetter = getHeader || ((req, name) => {
    // Support Next.js, Express, and standard Request objects
    if (req.headers?.get) return req.headers.get(name);
    if (req.headers?.[name]) return req.headers[name];
    if (req.header) return req.header(name);
    return null;
  });

  // Try V2 header first (PAYMENT-SIGNATURE)
  let paymentHeader = headerGetter(request, "payment-signature");

  // Fallback to deprecated X-Payment for backward compatibility
  if (!paymentHeader) {
    paymentHeader = headerGetter(request, "x-payment");
  }

  if (!paymentHeader) {
    return null;
  }

  return parsePaymentSignature(paymentHeader);
}

/**
 * Verify payment with facilitator
 */
export async function verifyPayment(
  envelope: PaymentEnvelope,
  route: string,
  ctx: MiddlewareContext
): Promise<PaymentVerificationResult> {
  const routePrice = ctx.routes[route];
  if (routePrice === undefined) {
    return {
      isValid: false,
      invalidReason: `Route ${route} not configured for payment`,
    };
  }

  // Verify network matches
  const envelopeNetwork = toLegacyNetwork(envelope.network);
  const expectedNetwork = ctx.config.network;

  if (envelopeNetwork !== expectedNetwork) {
    return {
      isValid: false,
      invalidReason: `Network mismatch. Expected ${expectedNetwork}, got ${envelopeNetwork}`,
    };
  }

  // Verify recipient address
  if (envelope.authorization.to.toLowerCase() !== ctx.config.payTo.toLowerCase()) {
    return {
      isValid: false,
      invalidReason: `Recipient mismatch. Expected ${ctx.config.payTo}, got ${envelope.authorization.to}`,
    };
  }

  // Build verification request
  const priceString = `$${routePrice}`;
  const priceAmount = parsePriceToUSDC(priceString);
  const usdcAddress = getUSDCAddress(ctx.config.network);

  // Detect token info for EIP-712 domain
  let tokenName = "USD Coin";
  if (ctx.tokenDetector) {
    try {
      const tokenInfo = await ctx.tokenDetector(usdcAddress, ctx.config.network);
      if (tokenInfo?.name) {
        tokenName = tokenInfo.name;
      }
    } catch {
      // Use default token name
    }
  }

  // Call facilitator verify endpoint
  const verifyUrl = `${ctx.config.facilitatorUrl}/api/v2/x402/verify`;

  try {
    const response = await fetch(verifyUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        x402Version: 2,
        paymentRequirements: {
          scheme: "exact",
          network: toCAIP2Network(ctx.config.network),
          maxAmountRequired: priceAmount.toString(),
          resource: route,
          description: `Payment for ${route}`,
          mimeType: "application/json",
          payTo: ctx.config.payTo,
          maxTimeoutSeconds: 30,
          asset: usdcAddress,
          extra: { name: tokenName, version: "2" },
        },
        paymentPayload: {
          x402Version: 2,
          network: toCAIP2Network(envelope.network),
          scheme: "exact",
          payload: envelope,
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        isValid: false,
        invalidReason: errorData.invalidReason || `Verification failed: ${response.statusText}`,
      };
    }

    const result = await response.json();
    return {
      isValid: result.isValid || false,
      payer: result.payer,
      invalidReason: result.invalidReason,
    };
  } catch (error) {
    return {
      isValid: false,
      invalidReason: `Facilitator unavailable at ${ctx.config.facilitatorUrl}`,
    };
  }
}

/**
 * Settle payment with facilitator
 */
export async function settlePayment(
  envelope: PaymentEnvelope,
  ctx: MiddlewareContext
): Promise<SettlementResult> {
  const settleUrl = `${ctx.config.facilitatorUrl}/api/v2/x402/settle`;
  const usdcAddress = getUSDCAddress(envelope.network);

  // Detect token info
  let tokenName = "USD Coin";
  if (ctx.tokenDetector) {
    try {
      const tokenInfo = await ctx.tokenDetector(usdcAddress, envelope.network);
      if (tokenInfo?.name) {
        tokenName = tokenInfo.name;
      }
    } catch {
      // Use default
    }
  }

  try {
    const response = await fetch(settleUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        x402Version: 2,
        paymentPayload: {
          x402Version: 2,
          network: toCAIP2Network(envelope.network),
          scheme: "exact",
          payload: envelope,
        },
        paymentRequirements: {
          scheme: "exact",
          network: toCAIP2Network(envelope.network),
          maxAmountRequired: envelope.authorization.value,
          resource: "",
          description: "Payment settlement",
          mimeType: "application/json",
          payTo: envelope.authorization.to,
          maxTimeoutSeconds: 30,
          asset: usdcAddress,
          extra: { name: tokenName, version: "2" },
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        error: errorData.errorReason || errorData.error || `Settlement failed: ${response.statusText}`,
      };
    }

    const result = await response.json();

    if (!result.success) {
      return {
        success: false,
        error: result.errorReason || result.error || "Settlement failed",
      };
    }

    // Extract transaction hash from various response formats
    const transactionHash =
      (typeof result.transaction === "string" ? result.transaction : undefined) ||
      result.transaction?.hash ||
      result.transaction?.transactionHash ||
      result.receipt?.settlement?.transaction ||
      result.transactionHash ||
      result.hash ||
      undefined;

    return { success: true, transactionHash };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Settlement failed",
    };
  }
}

/**
 * Create 402 Payment Required response
 */
export function create402Response(
  route: string,
  ctx: MiddlewareContext
): { body: any; status: number; headers: Record<string, string> } {
  const routePath = route.includes(" ") ? route.split(" ")[1] : route;
  const routePrice = ctx.routes[routePath];

  if (routePrice === undefined) {
    return {
      body: { error: "Route not configured for payment" },
      status: 500,
      headers: {},
    };
  }

  const priceAmount = parsePriceToUSDC(`$${routePrice}`);
  const usdcAddress = getUSDCAddress(ctx.config.network);

  const paymentRequirements = {
    scheme: "exact",
    network: toCAIP2Network(ctx.config.network),
    maxAmountRequired: priceAmount.toString(),
    resource: routePath,
    description: `Payment required for ${routePath}`,
    mimeType: "application/json",
    payTo: ctx.config.payTo,
    maxTimeoutSeconds: 30,
    asset: usdcAddress,
    extra: { name: "USD Coin", version: "2" },
  };

  const paymentRequiredHeader = Buffer.from(
    JSON.stringify({ x402Version: 2, accepts: [paymentRequirements] })
  ).toString("base64");

  return {
    body: {
      error: "Payment Required",
      message: "Please include PAYMENT-SIGNATURE header with signed payment envelope.",
    },
    status: 402,
    headers: { "PAYMENT-REQUIRED": paymentRequiredHeader },
  };
}

/**
 * Main middleware function to verify x402 payment
 */
export async function verifyX402Payment(
  request: any,
  route: string,
  ctx: MiddlewareContext
): Promise<X402PaymentResult> {
  const routePath = route.includes(" ") ? route.split(" ")[1] : route;
  const routePrice = ctx.routes[routePath];

  if (routePrice === undefined) {
    // Route not configured for payment, allow through
    return { isValid: true };
  }

  // Extract payment envelope
  const envelope = extractPaymentEnvelope(request, ctx.getHeader);
  if (!envelope) {
    const { body, status, headers } = create402Response(route, ctx);
    const response = ctx.createResponse
      ? ctx.createResponse(body, { status, headers })
      : { body, status, headers };
    return { isValid: false, response };
  }

  // Verify payment
  const verification = await verifyPayment(envelope, routePath, ctx);
  if (!verification.isValid) {
    const response = ctx.createResponse
      ? ctx.createResponse(
          { error: "Payment verification failed", reason: verification.invalidReason },
          { status: 402 }
        )
      : { error: "Payment verification failed", reason: verification.invalidReason, status: 402 };
    return { isValid: false, response };
  }

  // Settle payment
  const settlement = await settlePayment(envelope, ctx);
  if (!settlement.success) {
    let errorMessage = settlement.error || "Payment settlement failed";

    // Provide helpful error messages
    if (errorMessage.includes("sponsor wallet") || errorMessage.includes("No sponsor")) {
      errorMessage = "Payment settlement failed: No sponsor wallet configured.";
    } else if (errorMessage.includes("authorization is used or canceled")) {
      errorMessage = "Payment authorization failed. Please try signing a new payment.";
    }

    const response = ctx.createResponse
      ? ctx.createResponse(
          { error: "Payment settlement failed", reason: errorMessage, details: settlement.error },
          { status: 402 }
        )
      : { error: "Payment settlement failed", reason: errorMessage, status: 402 };
    return { isValid: false, response };
  }

  // Success - return payment response header
  const paymentResponse = {
    success: true,
    transactionHash: settlement.transactionHash,
    network: envelope.network,
  };
  const paymentResponseHeader = Buffer.from(JSON.stringify(paymentResponse)).toString("base64");

  return {
    isValid: true,
    payer: verification.payer,
    envelope,
    paymentResponseHeader,
  };
}
