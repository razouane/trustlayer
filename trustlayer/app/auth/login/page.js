'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState(['','','','','','']);
  const [step, setStep] = useState('phone');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const inputRefs = [];

  const setRef = (i) => (el) => { inputRefs[i] = el; };

  const handleOtpChange = (val, i) => {
    const next = [...otp];
    next[i] = val.slice(-1);
    setOtp(next);
    if (val && i < 5) inputRefs[i + 1]?.focus();
  };

  const sendOTP = async () => {
    if (phone.replace(/\s/g,'').length < 8) return setError('Numéro invalide');
    setLoading(true); setError('');
    try {
      const res = await fetch('/api/auth/otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: '+216' + phone.replace(/\s/g,'') }),
      });
      if (!res.ok) throw new Error('Erreur envoi SMS');
      setStep('otp');
    } catch(e) { setError(e.message); }
    finally { setLoading(false); }
  };

  const verifyOTP = async () => {
    const code = otp.join('');
    if (code.length < 6) return setError('Code incomplet');
    setLoading(true); setError('');
    try {
      const res = await fetch('/api/auth/otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: '+216' + phone.replace(/\s/g,''), code }),
      });
      if (!res.ok) throw new Error('Code invalide');
      router.push('/dashboard');
    } catch(e) { setError(e.message); }
    finally { setLoading(false); }
  };

  const page = { minHeight:'100vh', background:'#070C14', display:'flex', alignItems:'center', justifyContent:'center', padding:'20px', fontFamily:'DM Mono, monospace' };
  const card = { width:'100%', maxWidth:'380px' };
  const logoWrap = { textAlign:'center', marginBottom:'40px' };
  const logoMain = { fontSize:'36px', fontWeight:'800', fontFamily:'Syne, sans-serif' };
  const sub = { fontSize:'12px', color:'#6B7E99', marginTop:'4px' };
  const title = { fontSize:'20px', fontWeight:'700', color:'#E8F0FF', marginBottom:'6px', fontFamily:'Syne, sans-serif' };
  const subtitle = { fontSize:'13px', color:'#6B7E99', marginBottom:'24px', lineHeight:'1.6' };
  const label = { display:'block', fontSize:'11px', color:'#6B7E99', marginBottom:'6px', letterSpacing:'0.06em', textTransform:'uppercase' };
  const phoneRow = { display:'flex', marginBottom:'16px' };
  const prefix = { display:'flex', alignItems:'center', padding:'0 12px', fontSize:'14px', color:'#6B7E99', background:'rgba(7,12,20,0.9)', border:'1px solid rgba(255,255,255,0.07)', borderRight:'none', borderRadius:'8px 0 0 8px' };
  const phoneInput = { flex:'1', padding:'11px 14px', fontSize:'14px', color:'#E8F0FF', background:'rgba(7,12,20,0.9)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'0 8px 8px 0', outline:'none', fontFamily:'DM Mono, monospace' };
  const btn = { width:'100%', padding:'12px', background:'#E8500A', color:'#fff', border:'none', borderRadius:'8px', fontSize:'14px', fontWeight:'600', cursor:'pointer', fontFamily:'DM Mono, monospace', marginTop:'8px' };
  const btnOff = { width:'100%', padding:'12px', background:'rgba(232,80,10,0.2)', color:'rgba(232,80,10,0.5)', border:'none', borderRadius:'8px', fontSize:'14px', cursor:'not-allowed', fontFamily:'DM Mono, monospace', marginTop:'8px' };
  const errStyle = { color:'#F04848', fontSize:'12px', marginBottom:'8px', textAlign:'center' };
  const otpRow = { display:'flex', gap:'8px', justifyContent:'center', margin:'24px 0' };
  const linkRow = { textAlign:'center', marginTop:'16px', fontSize:'13px', color:'#6B7E99' };
  const backBtn = { background:'transparent', border:'none', color:'#6B7E99', fontSize:'13px', cursor:'pointer', width:'100%', textAlign:'center', marginTop:'12px', fontFamily:'DM Mono, monospace' };

  return (
    <div style={page}>
      <div style={card}>
        <div style={logoWrap}>
          <div style={logoMain}>
            <span style={{color:'#E8500A'}}>TRUST</span>
            <span style={{color:'#E8F0FF'}}>LAYER</span>
          </div>
          <div style={sub}>E-commerce sécurisé · Tunisie</div>
        </div>

        {step === 'phone' && (
          <div>
            <div style={title}>Connexion</div>
            <div style={subtitle}>Entrez votre numéro pour recevoir un code SMS.</div>
            <label style={label}>Numéro de téléphone</label>
            <div style={phoneRow}>
              <div style={prefix}>+216</div>
              <input type="tel" placeholder="XX XXX XXX" value={phone}
                onChange={e => setPhone(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendOTP()}
                style={phoneInput} />
            </div>
            {error && <div style={errStyle}>{error}</div>}
            <button onClick={sendOTP} disabled={loading} style={loading ? btnOff : btn}>
              {loading ? 'Envoi en cours...' : 'Envoyer le code SMS →'}
            </button>
            <div style={linkRow}>
              Pas de compte ?{' '}
              <span style={{color:'#E8500A', cursor:'pointer', textDecoration:'underline'}}
                onClick={() => router.push('/auth/register')}>
                S'inscrire
              </span>
            </div>
          </div>
        )}

        {step === 'otp' && (
          <div>
            <div style={title}>Code de vérification</div>
            <div style={subtitle}>Code envoyé au <strong style={{color:'#E8F0FF'}}>+216 {phone}</strong></div>
            <div style={otpRow}>
              {otp.map((d, i) => (
                <input key={i} ref={setRef(i)} maxLength={1} value={d}
                  onChange={e => handleOtpChange(e.target.value, i)}
                  style={{ width:'44px', height:'52px', textAlign:'center', fontSize:'22px', fontWeight:'700',
                    background:'rgba(7,12,20,0.9)', border:`1.5px solid ${d ? '#E8500A' : 'rgba(255,255,255,0.1)'}`,
                    borderRadius:'8px', color:'#E8F0FF', fontFamily:'Syne, sans-serif', outline:'none' }} />
              ))}
            </div>
            {error && <div style={errStyle}>{error}</div>}
            <button onClick={verifyOTP} disabled={loading || otp.join('').length < 6}
              style={loading || otp.join('').length < 6 ? btnOff : btn}>
              {loading ? 'Vérification...' : 'Confirmer →'}
            </button>
            <button style={backBtn} onClick={() => { setStep('phone'); setOtp(['','','','','','']); setError(''); }}>
              ← Changer de numéro
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
