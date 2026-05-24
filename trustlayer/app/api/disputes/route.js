import { createAdminClient } from '../../../lib/supabase/server';
export async function GET(request) {
  const supabase = createAdminClient();
  const userId = request.nextUrl.searchParams.get('user_id');
  const { data: disputes } = await supabase.from('disputes').select('*, orders(product_name,amount,id)').eq('claimant_id', userId).order('created_at', { ascending: false });
  return Response.json({ disputes });
}
export async function POST(request) {
  const { order_id, claimant_id, type, description } = await request.json();
  if (!order_id || !type || !description) return Response.json({ error: 'Champs requis manquants' }, { status: 400 });
  const supabase = createAdminClient();
  await supabase.from('orders').update({ status: 'disputed' }).eq('id', order_id);
  const { data: dispute, error } = await supabase.from('disputes').insert({ order_id, claimant_id, type, description, status: 'open' }).select().single();
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ dispute }, { status: 201 });
}
