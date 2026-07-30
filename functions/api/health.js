export async function onRequestGet(context) {
  const key = context.env.STRIPE_SECRET_KEY;

  if (!key?.startsWith("sk_test_")) {
    return Response.json(
      { ok: false, error: "Stripe test key is not configured." },
      { status: 500 }
    );
  }

  try {
    const stripeResponse = await fetch("https://api.stripe.com/v1/account", {
      headers: {
        Authorization: `Bearer ${key}`,
      },
    });

    const account = await stripeResponse.json();

    if (!stripeResponse.ok) {
      return Response.json(
        {
          ok: false,
          error: account?.error?.message || "Stripe request failed.",
        },
        { status: 502 }
      );
    }

    return Response.json({
      ok: true,
      service: "ajbeckett-checkout",
      stripeConnected: true,
      accountCountry: account.country,
      accountCurrency: account.default_currency,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return Response.json(
      {
        ok: false,
        error: "Unable to connect to Stripe.",
      },
      { status: 502 }
    );
  }
}
