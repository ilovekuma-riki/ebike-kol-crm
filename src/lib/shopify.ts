const QUERY = `query Orders($cursor: String, $query: String!) { orders(first: 50, after: $cursor, query: $query, sortKey: UPDATED_AT) { pageInfo { hasNextPage endCursor } nodes { id name createdAt updatedAt displayFinancialStatus currencyCode totalPriceSet { shopMoney { amount } } totalDiscountsSet { shopMoney { amount } } netPaymentSet { shopMoney { amount } } totalRefundedSet { shopMoney { amount } } customer { defaultAddress { countryCodeV2 } } discountCodes landingPageUrl lineItems(first: 100) { nodes { id title variantTitle sku quantity originalTotalSet { shopMoney { amount } } discountedTotalSet { shopMoney { amount } } } } } } }`;

export type ShopifyConfig = { domain: string; token: string; apiVersion?: string };
export async function shopifyGraphql<T>(config: ShopifyConfig, query: string, variables: Record<string, unknown>, retries = 3): Promise<T> {
  const response = await fetch(`https://${config.domain}/admin/api/${config.apiVersion ?? process.env.SHOPIFY_API_VERSION ?? "2026-07"}/graphql.json`, { method: "POST", headers: { "Content-Type": "application/json", "X-Shopify-Access-Token": config.token }, body: JSON.stringify({ query, variables }), cache: "no-store" });
  if ((response.status === 429 || response.status >= 500) && retries > 0) { await new Promise((resolve) => setTimeout(resolve, (4 - retries) * 750)); return shopifyGraphql(config, query, variables, retries - 1); }
  if (!response.ok) throw new Error(`Shopify API ${response.status}: ${await response.text()}`);
  const payload = await response.json();
  if (payload.errors) throw new Error(payload.errors.map((e: { message: string }) => e.message).join("; "));
  return payload.data as T;
}

export async function fetchShopifyOrders(config: ShopifyConfig, updatedAfter: Date) {
  const nodes: unknown[] = []; let cursor: string | null = null;
  do {
    const data: { orders: { pageInfo: { hasNextPage: boolean; endCursor: string | null }; nodes: unknown[] } } = await shopifyGraphql(config, QUERY, { cursor, query: `updated_at:>=${updatedAfter.toISOString()}` });
    nodes.push(...data.orders.nodes); cursor = data.orders.pageInfo.hasNextPage ? data.orders.pageInfo.endCursor : null;
  } while (cursor);
  return nodes;
}
