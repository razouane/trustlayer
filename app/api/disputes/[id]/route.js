import { createAdminClient } from '../../../../lib/supabase/server';
export async function GET(request, { params }) {
  const supabase = createAdminClient();
  const { data: dispute } = await supabase.from('disputes').select('*, orders(product_name,amount,id)').eq('id', params.id).single();
  if (!dispute) return Response.json({ error: 'Litige introuvable' }, { status: 404 });
  return Response.json({ dispute });
}
export async function PATCH(request, { params }) {
  const body = await request.json();
  const supabase = createAdminClient();
  const { data, error } = await supabase.from('disputes').update(body).eq('id', params.id).select().single();
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ dispute: data });
}
