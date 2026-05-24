import { createAdminClient } from '../../../lib/supabase/server';
import { generateOrderQR, generateSecretCode, generateOrderId, generateLinkToken } from '../../../lib/qrcode';

export async function GET(request) {
  const supabase = createAdminClient();
  const vendorId = request.nextUrl.searchParams.get('vendor_id');
  const { data: orders } = await supabase.from('orders').select('*')
    .eq('vendor_id', vendorId).order('created_at', { ascending: false });
  return Response.json({ orders });
}

export async function POST(request) {
  const body = await request.json();
  const { vendor_id, product_name, product_desc, amount, deposit_pct } = body;
  if (!vendor_id || !product_name || !amount) return Response.json({ error: 'Champs requis manquants' }, { status: 400 });

  const supabase = createAdminClient();
  const orderId = generateOrderId();
  const linkToken = generateLinkToken();
  const deposit = parseFloat((amount * deposit_pct / 100).toFixed(3));
  const secretCode = generateSecretCode();
  const { qrDataUrl, token: qrToken } = await generateOrderQR(orderId);

  const { data: order, error } = await supabase.from('orders').insert({
    id: orderId, vendor_id, product_name, product_desc, amount, deposit, deposit_pct,
    status: 'pending', qr_code: qrToken, secret_code: secretCode, link_token: linkToken,
    expires_at: new Date(Date.now() + 48*3600000).toISOString(),
  }).select().single();

  if (error) return Response.json({ error: error.message }, { status: 500 });
  const orderUrl = `${process.env.NEXT_PUBLIC_APP_URL}/order/${linkToken}`;
  return Response.json({ order, orderUrl, qrDataUrl }, { status: 201 });
}
