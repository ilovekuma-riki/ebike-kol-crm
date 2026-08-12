export function deliverableProgress(required: number, published: number) {
  const safeRequired = Math.max(0, required);
  const safePublished = Math.max(0, published);
  return { required: safeRequired, published: safePublished, remaining: Math.max(0, safeRequired - safePublished), completion: safeRequired === 0 ? 0 : Math.min(100, Math.round((safePublished / safeRequired) * 100)) };
}

export function performanceMetrics(cost: number, revenue: number, orders: number) {
  return { roas: cost > 0 ? revenue / cost : null, cac: orders > 0 ? cost / orders : null };
}

export function calculatePartnerScore(input: { sales?: number; roas?: number; content: number; engagement: number; costEfficiency?: number; audienceFit: number; reliability: number; attributedOrders: number }) {
  if (input.attributedOrders < 3 || input.sales === undefined || input.roas === undefined || input.costEfficiency === undefined) return { total: null, grade: null, sufficient: false, message: "Insufficient Sales Data" };
  const total = input.sales * .3 + input.roas * .2 + input.content * .15 + input.engagement * .1 + input.costEfficiency * .1 + input.audienceFit * .1 + input.reliability * .05;
  const rounded = Math.round(total * 10) / 10;
  return { total: rounded, grade: rounded >= 90 ? "S" : rounded >= 80 ? "A" : rounded >= 70 ? "B" : rounded >= 60 ? "C" : "D", sufficient: true, message: null };
}
