import { createAdminClient } from '../../../../../lib/supabase/server';
export async function GET(request, { params }) {
  const supabase = createAdminClient();
  const { data: order } = await supabase.from('orders').select('*, vendors(shop_name,score,badge,city,total_orders)').eq('link_token', params.token).single();
  if (!order) return Response.json({ error: 'Commande introuvable' }, { status: 404 });
  if (order.expires_at && new Date(order.expires_at) < new Date()) return Response.json({ error: 'Lien expiré' }, { status: 410 });
  const { secret_code, qr_code, ...safe } = order;
  return Response.json({ order: safe, vendor: order.vendors });
}
