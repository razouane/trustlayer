import { createAdminClient } from '../../../../lib/supabase/server';
import { initiatePayment } from '../../../../lib/konnect';
export async function POST(request) {
  const { linkToken } = await request.json();
  const supabase = createAdminClient();
  const { data: order } = await supabase.from('orders').select('*').eq('link_token', linkToken).single();
  if (!order) return Response.json({ error: 'Commande introuvable' }, { status: 404 });
  try {
    const { payUrl, paymentRef } = await initiatePayment({ orderId: order.id, amount: order.deposit, description: `Acompte ${order.product_name}` });
    await supabase.from('orders').update({ payment_ref: paymentRef }).eq('id', order.id);
    return Response.json({ payUrl, deposit: order.deposit });
  } catch(e) { return Response.json({ error: e.message }, { status: 500 }); }
}
