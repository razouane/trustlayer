import { createAdminClient } from '../../../../lib/supabase/server';
export async function POST(request) {
  const body = await request.json();
  const { orderId, status } = body;
  if (status !== 'completed') return Response.json({ received: true });
  const supabase = createAdminClient();
  await supabase.from('orders').update({ status: 'confirmed' }).eq('id', orderId);
  return Response.json({ received: true });
}
