export async function onRequestPost(context) {
  return Response.json({
    ok: true,
    routeWorking: true,
    stripeKeyPresent:
      typeof context.env.STRIPE_SECRET_KEY === "string"
  });
}
