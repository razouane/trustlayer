import { createAdminClient } from '../../../lib/supabase/server';
export async function GET() {
  const supabase = createAdminClient();
  const { data: vendors } = await supabase.from('vendors').select('*, users(name, phone)').order('score', { ascending: false }).limit(100);
  return Response.json({ vendors });
}
