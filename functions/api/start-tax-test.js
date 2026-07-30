function stripeBody(params) {
  return new URLSearchParams(params).toString();
}

export async function onRequestGet(context) {
  const stripeKey = context.env.STRIPE_SECRET_KEY;
  const alabamaTaxRate = context.env.TAX_RATE_ALABAMA;

  if (!stripeKey?.startsWith("sk_test_")) {
    return new Response(
      "Stripe test secret key is not configured.",
      { status: 500 }
    );
  }

  if (!alabamaTaxRate?.startsWith("txr_")) {
    return new Response(
      "The Alabama test tax rate is not configured.",
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
          "Content-Type":
            "application/x-www-form-urlencoded",

          // Pin this integration so a future account-level
          // API upgrade does not silently change its behavior.
          "Stripe-Version": "2026-07-29.dahlia",
        },

        body: stripeBody({
          mode: "payment",

          // Hosted Stripe Checkout is the default, so there is
          // intentionally no ui_mode setting here.

          "line_items[0][price_data][currency]": "usd",
          "line_items[0][price_data][unit_amount]": "100",
          "line_items[0][price_data][product_data][name]":
            "Becoming Tax Test",
          "line_items[0][quantity]": "1",

          // Stripe compares the shipping address with the
          // Alabama location attached to this manual rate.
          "line_items[0][dynamic_tax_rates][0]":
            alabamaTaxRate,

          "shipping_address_collection[allowed_countries][0]":
            "US",

          success_url:
            "https://www.ajbeckettwrites.com/thank-you.html?session_id={CHECKOUT_SESSION_ID}",

          cancel_url:
            "https://www.ajbeckettwrites.com/becoming-order.html",

          "metadata[purpose]":
            "hosted_alabama_tax_test",
        }),
      }
    );

    const session = await response.json();

    if (!response.ok) {
      console.error(
        "Stripe hosted Checkout error:",
        JSON.stringify(session)
      );

      return Response.json(
        {
          ok: false,
          stripeStatus: response.status,
          error:
            session?.error?.message ||
            "Stripe could not create the tax-test session.",
          parameter: session?.error?.param || null,
          errorType: session?.error?.type || null,
        },
        { status: 400 }
      );
    }

    if (!session.url) {
      return Response.json(
        {
          ok: false,
          error:
            "Stripe created the session but did not return a hosted checkout URL.",
        },
        { status: 502 }
      );
    }

    return Response.redirect(session.url, 303);
  } catch (error) {
    console.error(
      "Hosted tax-test session failed:",
      error
    );

    return Response.json(
      {
        ok: false,
        error:
          "Unable to create the hosted tax-test session.",
      },
      { status: 502 }
    );
  }
}
