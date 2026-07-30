function stripeBody(params) {
  return new URLSearchParams(params).toString();
}

export async function onRequestPost(context) {
  const stripeKey = context.env.STRIPE_SECRET_KEY;

  if (!stripeKey?.startsWith("sk_test_")) {
    return Response.json(
      { ok: false, error: "Stripe test key is not configured." },
      { status: 500 }
    );
  }

  try {
    const response = await fetch(
      "https://api.stripe.com/v1/checkout/sessions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${stripeKey}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: stripeBody({
          mode: "payment",
          ui_mode: "elements",

          // Temporary $1 test item. We will replace this with the real
          // signed/standard Stripe prices after proving the checkout works.
          "line_items[0][price_data][currency]": "usd",
          "line_items[0][price_data][unit_amount]": "100",
          "line_items[0][price_data][product_data][name]":
            "Becoming Checkout Test",
          "line_items[0][quantity]": "1",

          "shipping_address_collection[allowed_countries][0]": "US",

          return_url:
            "https://www.ajbeckettwrites.com/thank-you.html?session_id={CHECKOUT_SESSION_ID}",
        }),
      }
    );

    const session = await response.json();

    if (!response.ok) {
  console.error("Stripe Checkout error:", JSON.stringify(session));

  return Response.json(
    {
      ok: false,
      stripeStatus: response.status,
      error:
        session?.error?.message ||
        "Stripe could not create the Checkout Session.",
      parameter: session?.error?.param || null,
      errorType: session?.error?.type || null
    },
    { status: 400 }
  );
}

    return Response.json({
      ok: true,
      clientSecret: session.client_secret,
      checkoutSessionId: session.id,
    });
  } catch (error) {
    return Response.json(
      {
        ok: false,
        error: "Unable to create the Checkout Session.",
      },
      { status: 502 }
    );
  }
}
