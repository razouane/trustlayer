import { createAdminClient } from './supabase/server';

export function getBadge(score) {
  if (score >= 85) return 'gold';
  if (score >= 70) return 'silver';
  return 'bronze';
}

export async function updateScore(userId, delta, reason, orderId = null) {
  if (!delta) return;
  const supabase = createAdminClient();
  await supabase.from('reputation_events').insert({ user_id:userId, score_delta:delta, reason, order_id:orderId });
  const { data: vendor } = await supabase.from('vendors').select('id,score').eq('user_id', userId).single();
  if (vendor) {
    const newScore = Math.min(100, Math.max(0, vendor.score + delta));
    await supabase.from('vendors').update({ score:newScore, badge:getBadge(newScore) }).eq('id', vendor.id);
    return newScore;
  }
  const { data: client } = await supabase.from('clients').select('id,score').eq('user_id', userId).single();
  if (client) {
    const newScore = Math.min(100, Math.max(0, client.score + delta));
    await supabase.from('clients').update({ score:newScore }).eq('id', client.id);
    return newScore;
  }
}

export async function processDeliverySuccess(order) {
  const supabase = createAdminClient();
  const { data: vendor } = await supabase.from('vendors').select('user_id,total_orders').eq('id', order.vendor_id).single();
  if (vendor) {
    await updateScore(vendor.user_id, 3, 'Livraison confirmée', order.id);
    const newTotal = (vendor.total_orders||0) + 1;
    await supabase.from('vendors').update({ total_orders:newTotal }).eq('id', order.vendor_id);
    if (newTotal % 5 === 0) await updateScore(vendor.user_id, 5, 'Bonus 5 livraisons consécutives', order.id);
  }
  if (order.client_id) {
    const { data: client } = await supabase.from('clients').select('user_id,orders_completed').eq('id', order.client_id).single();
    if (client) {
      await updateScore(client.user_id, 2, 'Livraison acceptée', order.id);
      await supabase.from('clients').update({ orders_completed:(client.orders_completed||0)+1 }).eq('id', order.client_id);
    }
  }
}

export async function processRefusal(order) {
  const supabase = createAdminClient();
  if (!order.client_id) return;
  const { data: client } = await supabase.from('clients').select('user_id,orders_refused').eq('id', order.client_id).single();
  if (client) {
    await updateScore(client.user_id, -8, 'Refus de livraison', order.id);
    const newRefused = (client.orders_refused||0) + 1;
    await supabase.from('clients').update({ orders_refused:newRefused }).eq('id', order.client_id);
  }
}
