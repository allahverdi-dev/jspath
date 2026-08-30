import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { canAccessContent, planHasFeature } from "./access.js";
import { resolveEntitlement, subscriptionGrantsPro } from "./entitlements.js";
import {
  FEATURE,
  createCheckoutUrl,
  createUpgradeAuthPath,
  safeApplicationPath,
} from "./plans.js";
import {
  createEventIdentity,
  isAllowedProduct,
  normalizeSubscription,
  parseAllowedProducts,
} from "../../../supabase/functions/_shared/gumroad.js";

const NOW = new Date("2026-08-30T12:00:00.000Z");
const active = {
  plan: "pro",
  status: "active",
  current_period_end: "2026-09-30T12:00:00.000Z",
  last_verified_at: "2026-08-30T11:00:00.000Z",
};

describe("entitlement resolution", () => {
  it("resolves unauthenticated users to Guest", () => {
    expect(
      resolveEntitlement({
        authenticated: false,
        subscriptions: [active],
        now: NOW,
      }).plan,
    ).toBe("guest");
  });

  it("resolves authenticated users without a subscription to Free", () => {
    expect(
      resolveEntitlement({ authenticated: true, subscriptions: [], now: NOW })
        .plan,
    ).toBe("free");
  });

  it("resolves active subscriptions to Pro", () => {
    expect(
      resolveEntitlement({
        authenticated: true,
        subscriptions: [active],
        now: NOW,
      }).plan,
    ).toBe("pro");
  });

  it("keeps canceled memberships Pro until the paid period ends", () => {
    expect(subscriptionGrantsPro({ ...active, status: "canceling" }, NOW)).toBe(
      true,
    );
  });

  it("fails closed for expired, refunded, or revoked memberships", () => {
    expect(subscriptionGrantsPro({ ...active, status: "expired" }, NOW)).toBe(
      false,
    );
    expect(subscriptionGrantsPro({ ...active, status: "refunded" }, NOW)).toBe(
      false,
    );
    expect(subscriptionGrantsPro({ ...active, status: "revoked" }, NOW)).toBe(
      false,
    );
    expect(
      subscriptionGrantsPro(
        { ...active, current_period_end: "2026-08-29T12:00:00.000Z" },
        NOW,
      ),
    ).toBe(false);
  });

  it("changes access without mutating learning progress", () => {
    const progress = Object.freeze({
      lessons: { first: { completedAt: "2026-01-01" } },
      xp: { total: 90 },
    });
    resolveEntitlement({
      authenticated: true,
      subscriptions: [{ ...active, status: "refunded" }],
      now: NOW,
    });
    expect(progress).toEqual({
      lessons: { first: { completedAt: "2026-01-01" } },
      xp: { total: 90 },
    });
  });
});

describe("central access catalog", () => {
  it("allows Pro features only to the centrally allocated plan", () => {
    expect(planHasFeature("free", FEATURE.PROJECTS)).toBe(false);
    expect(planHasFeature("pro", FEATURE.PROJECTS)).toBe(true);
    expect(canAccessContent({ kind: "project", id: "p1", plan: "free" })).toBe(
      false,
    );
    expect(canAccessContent({ kind: "project", id: "p1", plan: "pro" })).toBe(
      true,
    );
  });

  it("keeps existing stable-ID curriculum content free until explicitly tagged", () => {
    expect(
      canAccessContent({
        kind: "lesson",
        id: "lesson-existing",
        plan: "guest",
      }),
    ).toBe(true);
  });
});

describe("checkout intent", () => {
  it("routes guest upgrades through authentication", () => {
    expect(createUpgradeAuthPath("pro-annual")).toBe(
      "/signup?next=%2Fpricing%3Fcheckout%3Dpro-annual",
    );
    expect(
      safeApplicationPath(
        "/pricing?checkout=pro-annual",
        "/",
        "https://jspath.dev",
      ),
    ).toBe("/pricing?checkout=pro-annual");
    expect(
      safeApplicationPath("//evil.test/claim", "/", "https://jspath.dev"),
    ).toBe("/");
  });

  it("prefills identity as a hint without creating entitlement state", () => {
    const option = {
      checkoutUrl: "https://creator.gumroad.com/l/jspath",
      billingInterval: "monthly",
    };
    const checkout = new URL(
      createCheckoutUrl(option, {
        id: "user-123",
        email: "learner@example.com",
      }),
    );
    expect(checkout.searchParams.get("email")).toBe("learner@example.com");
    expect(checkout.searchParams.get("JSPath account ID")).toBe("user-123");
    expect(
      resolveEntitlement({ authenticated: true, subscriptions: [], now: NOW })
        .isPro,
    ).toBe(false);
  });
});

describe("trusted Gumroad event normalization", () => {
  it("creates the same idempotency identity for duplicate provider events", async () => {
    const payload = {
      sale_id: "sale-1",
      subscription_id: "sub-1",
      product_id: "product-1",
    };
    expect(await createEventIdentity("sale", payload)).toEqual(
      await createEventIdentity("sale", payload),
    );
  });

  it("rejects purchases outside the server-side product and tier allowlist", () => {
    const allowed = parseAllowedProducts(
      '{"product-1":{"plan":"pro","variants":["JSPath Pro"]}}',
    );
    expect(
      isAllowedProduct(allowed, {
        product_id: "other-product",
        variants: "JSPath Pro",
      }),
    ).toBe(false);
    expect(
      isAllowedProduct(allowed, {
        product_id: "product-1",
        variants: "Wrong tier",
      }),
    ).toBe(false);
    expect(
      isAllowedProduct(allowed, {
        product_id: "product-1",
        variants: "JSPath Pro",
      }),
    ).toBe(true);
    expect(
      isAllowedProduct(allowed, {
        product_id: "product-1",
        variants: { Tier: "JSPath Pro" },
      }),
    ).toBe(true);

    expect(
      isAllowedProduct(allowed, {
        product_id: "product-1",
        variants: { Tier: "Wrong tier" },
      }),
    ).toBe(false);
  });

  it("maps refunds and disputes to non-entitled internal states", () => {
    const sale = {
      id: "sale-1",
      subscription_id: "sub-1",
      product_id: "product-1",
      email: "a@example.com",
    };
    expect(
      normalizeSubscription({ eventType: "refund", sale, now: NOW }).status,
    ).toBe("refunded");
    expect(
      normalizeSubscription({ eventType: "dispute", sale, now: NOW }).status,
    ).toBe("revoked");
    expect(
      normalizeSubscription({
        eventType: "dispute_won",
        sale: { ...sale, disputed: true, dispute_won: true },
        now: NOW,
      }).status,
    ).toBe("active");
  });

  it("keeps a failed renewal past due until Gumroad's effective membership end", () => {
    const record = normalizeSubscription({
      eventType: "subscription_updated",
      sale: {
        id: "sale-1",
        subscription_id: "sub-1",
        product_id: "product-1",
        email: "a@example.com",
        subscription_failed_at: "2026-09-02T12:00:00.000Z",
      },
      now: NOW,
    });
    expect(record.status).toBe("past_due");
    expect(record.current_period_end).toBe("2026-09-02T12:00:00.000Z");
    expect(
      normalizeSubscription({
        eventType: "subscription_updated",
        sale: {
          ...record,
          id: "sale-1",
          subscription_id: "sub-1",
          product_id: "product-1",
          email: "a@example.com",
          subscription_failed_at: "2026-09-02T12:00:00.000Z",
        },
        now: new Date("2026-09-03T12:00:00.000Z"),
      }).status,
    ).toBe("expired");
  });

  it("keeps client roles read-only in the billing migration", () => {
    const sql = readFileSync(
      resolve(
        process.cwd(),
        "supabase/migrations/202608300001_billing_subscriptions.sql",
      ),
      "utf8",
    );
    expect(sql).toContain(
      "grant select on table public.subscriptions to authenticated",
    );
    expect(sql).not.toMatch(/create policy[^;]+for (insert|update|delete)/i);
    expect(sql).toContain(
      "revoke all on table public.billing_events from anon, authenticated",
    );
  });

  it("keeps browser reconciliation authenticated and preflight-capable", () => {
    const source = readFileSync(
      resolve(process.cwd(), "supabase/functions/reconcile-gumroad/index.ts"),
      "utf8",
    );
    expect(source).toContain("request.method === 'OPTIONS'");
    expect(source).toContain("userClient.auth.getUser()");
    expect(source).toContain("jsonResponse");
  });

  it("normalizes Gumroad object variants to the tier name", () => {
    const record = normalizeSubscription({
      eventType: "sale",
      sale: {
        id: "sale-1",
        subscription_id: "sub-1",
        product_id: "product-1",
        email: "a@example.com",
        variants: { Tier: "Pro" },
      },
      now: NOW,
    });

    expect(record.provider_variant).toBe("Pro");
  });
});
