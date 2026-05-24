import { createAdminClient } from '../../../../lib/supabase/server';
export async function GET(request, { params }) {
  const supabase = createAdminClient();
  const { data: order } = await supabase.from('orders').select('*, vendors(shop_name,score,badge,city,total_orders)').eq('id', params.id).single();
  if (!order) return Response.json({ error: 'Commande introuvable' }, { status: 404 });
  return Response.json({ order, vendor: order.vendors });
}
export async function PATCH(request, { params }) {
  const body = await request.json();
  const supabase = createAdminClient();
  const { data, error } = await supabase.from('orders').update(body).eq('id', params.id).select().single();
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ order: data });
}
