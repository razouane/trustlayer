import { createAdminClient } from '../../../../lib/supabase/server';
export async function POST(request) {
  const body = await request.json();
  const { phone, name, role, shop_name, city, category } = body;
  if (!phone || !name || !role) return Response.json({ error: 'Champs requis manquants' }, { status: 400 });
  const supabase = createAdminClient();
  const { data: user, error } = await supabase.from('users').insert({ phone, name, role }).select().single();
  if (error) return Response.json({ error: error.message }, { status: 500 });
  if (role === 'vendor') {
    await supabase.from('vendors').insert({ user_id: user.id, shop_name: shop_name || name, city, category });
  } else if (role === 'client') {
    await supabase.from('clients').insert({ user_id: user.id });
  }
  return Response.json({ user }, { status: 201 });
}
