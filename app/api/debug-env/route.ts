export async function GET() {
  return Response.json({
    NODE_ENV: process.env.NODE_ENV,
    hasBackendKey: !!process.env.BACKEND_WALLET_PRIVATE_KEY
  });
}