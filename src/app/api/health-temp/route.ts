export async function GET() {
  return new Response("All is well.", {
    status: 200,
    headers: {
      "Cache-Control": "public, max-age=60, s-maxage=60",
    },
  });
}
