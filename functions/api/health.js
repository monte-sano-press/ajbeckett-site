export function onRequestGet() {
  return Response.json({
    ok: true,
    service: "ajbeckett-checkout",
    timestamp: new Date().toISOString()
  });
}
