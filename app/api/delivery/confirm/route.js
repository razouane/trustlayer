import { createAdminClient } from '../../../../lib/supabase/server';
import { verifyQRToken } from '../../../../lib/qrcode';
import { processDeliverySuccess, processRefusal } from '../../../../lib/reputation';
export async function POST(request) {
  const { orderId, secretCode, qrToken, action } = await request.json();
  if (qrToken) {
    const payload = verifyQRToken(qrToken);
    if (!payload || payload.orderId !== orderId) return Response.json({ error: 'QR invalide' }, { status: 401 });
  }
  const supabase = createAdminClient();
  const { data: order } = await supabase.from('orders').select('*').eq('id', orderId).single();
  if (!order) return Response.json({ error: 'Commande introuvable' }, { status: 404 });
  if (action === 'pickup') {
    await supabase.from('orders').update({ status: 'in_delivery' }).eq('id', orderId);
    return Response.json({ success: true, status: 'in_delivery' });
  }
  if (action === 'confirm') {
    if (order.secret_code !== secretCode) return Response.json({ error: 'Code incorrect' }, { status: 401 });
    await supabase.from('orders').update({ status: 'delivered' }).eq('id', orderId);
    await processDeliverySuccess(order);
    return Response.json({ success: true, status: 'delivered' });
  }
  if (action === 'refuse') {
    await supabase.from('orders').update({ status: 'refused' }).eq('id', orderId);
    await processRefusal(order);
    return Response.json({ success: true, status: 'refused' });
  }
  return Response.json({ error: 'Action invalide' }, { status: 400 });
}
