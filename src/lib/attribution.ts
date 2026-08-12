export type AttributionOrder = { storeId: string; discountCode?: string | null; affiliateReferral?: string | null; utmCampaign?: string | null; netRevenue: number };
export type AttributionRules = { discounts: Record<string, { partnerId: string; collaborationId?: string }>; affiliates: Record<string, string>; campaigns: Record<string, string> };

export function attributeOrder(order: AttributionOrder, rules: AttributionRules) {
  const codeKey = `${order.storeId}:${order.discountCode?.trim().toUpperCase() ?? ""}`;
  const discount = rules.discounts[codeKey];
  if (discount) return { type: "discount_code", confidence: 1, revenue: order.netRevenue, ...discount, reason: `Store + Code: ${codeKey}` };
  const affiliate = order.affiliateReferral && rules.affiliates[order.affiliateReferral.toLowerCase()];
  if (affiliate) return { type: "affiliate", confidence: .9, revenue: order.netRevenue, partnerId: affiliate, reason: `Affiliate: ${order.affiliateReferral}` };
  const campaign = order.utmCampaign && rules.campaigns[order.utmCampaign.toLowerCase()];
  if (campaign) return { type: "utm", confidence: .75, revenue: order.netRevenue, partnerId: campaign, reason: `UTM: ${order.utmCampaign}` };
  return null;
}
