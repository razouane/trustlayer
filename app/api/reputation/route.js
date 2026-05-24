import { createAdminClient } from '../../../lib/supabase/server';
export async function GET(request) {
  const userId = request.nextUrl.searchParams.get('user_id');
  const supabase = createAdminClient();
  const { data: events } = await supabase.from('reputation_events').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(30);
  return Response.json({ events });
}
