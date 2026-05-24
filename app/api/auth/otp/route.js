import { createAdminClient } from '../../../../lib/supabase/server';

const rateLimit = new Map();

export async function POST(request) {
  const { phone, code } = await request.json();
  if (!phone) return Response.json({ error: 'Numéro requis' }, { status: 400 });

  const now = Date.now();
  const rl = rateLimit.get(phone) || { count: 0, reset: now + 600000 };
  if (now > rl.reset) { rl.count = 0; rl.reset = now + 600000; }
  if (rl.count >= 5) return Response.json({ error: 'Trop de tentatives. Réessayez dans 10 min.' }, { status: 429 });

  const supabase = createAdminClient();

  if (!code) {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(now + 600000).toISOString();
    await supabase.from('otp_codes').upsert({ phone, code: otp, expires_at: expiresAt }, { onConflict: 'phone' });

    if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_ACCOUNT_SID !== 'placeholder') {
      try {
        const { sendOTP } = await import('../../../../lib/twilio');
        await sendOTP(phone, otp);
      } catch(e) { console.error('SMS error:', e); }
    } else {
      console.log(`DEV MODE - OTP for ${phone}: ${otp}`);
    }

    rl.count++; rateLimit.set(phone, rl);
    return Response.json({ sent: true });
  }

  const { data } = await supabase.from('otp_codes').select()
    .eq('phone', phone).eq('code', code)
    .gt('expires_at', new Date().toISOString()).single();

  if (!data) return Response.json({ error: 'Code invalide ou expiré' }, { status: 401 });
  await supabase.from('otp_codes').delete().eq('phone', phone);
  return Response.json({ verified: true });
}
