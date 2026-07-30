export function onRequestGet(context) {
  const stripeKeyConfigured =
    typeof context.env.STRIPE_SECRET_KEY === "string" &&
    context.env.STRIPE_SECRET_KEY.startsWith("sk_test_");

  return Response.json({
    ok: true,
    service: "ajbeckett-checkout",
    stripeTestKeyConfigured: stripeKeyConfigured,
    timestamp: new Date().toISOString()
  });
}
