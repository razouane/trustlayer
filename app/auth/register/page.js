'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

const ROLES = [
  { id: 'vendor', icon: '◉', title: 'Vendeur', desc: 'Je vends des produits et veux sécuriser mes livraisons' },
  { id: 'client', icon: '◎', title: 'Client', desc: 'Je commande et veux être protégé' },
  { id: 'rider', icon: '◫', title: 'Livreur', desc: 'Je livre des commandes' },
];

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [role, setRole] = useState('');
  const [form, setForm] = useState({ name:'', phone:'', shop_name:'', city:'', category:'' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const u = (k,v) => setForm(p => ({...p,[k]:v}));

  const submit = async () => {
    if (!form.name) return setError('Nom requis');
    setLoading(true); setError('');
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, role, phone: '+216' + form.phone.replace(/\s/g,'') }),
      });
      if (!res.ok) throw new Error('Erreur inscription');
      router.push('/dashboard');
    } catch(e) { setError(e.message); }
    finally { setLoading(false); }
  };

  const page = { minHeight:'100vh', background:'#070C14', display:'flex', alignItems:'center', justifyContent:'center', padding:'20px', fontFamily:'DM Mono, monospace' };
  const card = { width:'100%', maxWidth:'380px' };
  const logoMain = { fontSize:'30px', fontWeight:'800', fontFamily:'Syne, sans-serif', textAlign:'center', marginBottom:'32px' };
  const title = { fontSize:'18px', fontWeight:'700', color:'#E8F0FF', marginBottom:'6px', fontFamily:'Syne, sans-serif' };
  const sub = { fontSize:'13px', color:'#6B7E99', marginBottom:'20px' };
  const roleCard = (selected) => ({ display:'flex', alignItems:'flex-start', gap:'12px', padding:'14px', marginBottom:'10px', borderRadius:'10px', cursor:'pointer', border:`1.5px solid ${selected ? '#E8500A' : 'rgba(255,255,255,0.07)'}`, background: selected ? 'rgba(232,80,10,0.1)' : 'rgba(14,22,34,1)' });
  const label = { display:'block', fontSize:'11px', color:'#6B7E99', marginBottom:'6px', letterSpacing:'0.06em', textTransform:'uppercase' };
  const input = { width:'100%', padding:'11px 14px', fontSize:'13px', color:'#E8F0FF', background:'rgba(7,12,20,0.9)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'8px', outline:'none', fontFamily:'DM Mono, monospace', marginBottom:'14px', boxSizing:'border-box' };
  const btn = { width:'100%', padding:'12px', background:'#E8500A', color:'#fff', border:'none', borderRadius:'8px', fontSize:'14px', fontWeight:'600', cursor:'pointer', fontFamily:'DM Mono, monospace', marginTop:'8px' };
  const btnOff = { width:'100%', padding:'12px', background:'rgba(232,80,10,0.2)', color:'rgba(232,80,10,0.5)', border:'none', borderRadius:'8px', fontSize:'14px', cursor:'not-allowed', fontFamily:'DM Mono, monospace', marginTop:'8px' };
  const row = { display:'flex', gap:'10px', marginTop:'8px' };
  const btnGhost = { flex:'1', padding:'11px', background:'transparent', color:'#6B7E99', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'8px', fontSize:'13px', cursor:'pointer', fontFamily:'DM Mono, monospace' };
  const errStyle = { color:'#F04848', fontSize:'12px', marginBottom:'8px' };

  return (
    <div style={page}>
      <div style={card}>
        <div style={logoMain}>
          <span style={{color:'#E8500A'}}>TRUST</span><span style={{color:'#E8F0FF'}}>LAYER</span>
        </div>

        {step === 0 && (
          <div>
            <div style={title}>Quel est votre rôle ?</div>
            <div style={sub}>Choisissez comment vous utilisez TrustLayer.</div>
            {ROLES.map(r => (
              <div key={r.id} style={roleCard(role===r.id)} onClick={() => setRole(r.id)}>
                <span style={{fontSize:'22px', color:'#E8500A', marginTop:'2px'}}>{r.icon}</span>
                <div>
                  <div style={{fontSize:'14px', fontWeight:'600', color:'#E8F0FF', marginBottom:'3px'}}>{r.title}</div>
                  <div style={{fontSize:'11px', color:'#6B7E99', lineHeight:'1.5'}}>{r.desc}</div>
                </div>
              </div>
            ))}
            <button onClick={() => role && setStep(1)} disabled={!role} style={role ? btn : btnOff}>
              Continuer →
            </button>
            <div style={{textAlign:'center', marginTop:'14px', fontSize:'13px', color:'#6B7E99'}}>
              Déjà inscrit ?{' '}
              <span style={{color:'#E8500A', cursor:'pointer', textDecoration:'underline'}} onClick={() => router.push('/auth/login')}>
                Se connecter
              </span>
            </div>
          </div>
        )}

        {step === 1 && (
          <div>
            <div style={title}>Vos informations</div>
            <div style={sub}>Ces données sont sécurisées et vérifiées.</div>
            <label style={label}>Nom complet</label>
            <input style={input} placeholder="Ex : Sarra Ben Ali" value={form.name} onChange={e => u('name', e.target.value)} />
            <label style={label}>Numéro de téléphone</label>
            <div style={{display:'flex', marginBottom:'14px'}}>
              <div style={{display:'flex', alignItems:'center', padding:'0 12px', fontSize:'14px', color:'#6B7E99', background:'rgba(7,12,20,0.9)', border:'1px solid rgba(255,255,255,0.07)', borderRight:'none', borderRadius:'8px 0 0 8px'}}>+216</div>
              <input type="tel" placeholder="XX XXX XXX" value={form.phone} onChange={e => u('phone', e.target.value)}
                style={{...input, marginBottom:'0', borderRadius:'0 8px 8px 0', border:'1px solid rgba(255,255,255,0.07)'}} />
            </div>
            {role === 'vendor' && <>
              <label style={label}>Nom de votre boutique</label>
              <input style={input} placeholder="Ex : Sarra Fashion" value={form.shop_name} onChange={e => u('shop_name', e.target.value)} />
              <label style={label}>Ville</label>
              <input style={input} placeholder="Ex : Tunis" value={form.city} onChange={e => u('city', e.target.value)} />
              <label style={label}>Catégorie de produits</label>
              <input style={input} placeholder="Ex : Mode, Électronique..." value={form.category} onChange={e => u('category', e.target.value)} />
            </>}
            {error && <div style={errStyle}>{error}</div>}
            <div style={row}>
              <button style={btnGhost} onClick={() => setStep(0)}>← Retour</button>
              <button style={btn} onClick={() => setStep(2)}>Suivant →</button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <div style={{textAlign:'center', paddingTop:'20px'}}>
              <div style={{fontSize:'48px', marginBottom:'12px'}}>🏅</div>
              <div style={title}>Confirmer l'inscription</div>
              <div style={{...sub, textAlign:'center', marginBottom:'20px'}}>Vous démarrez avec le badge Bronze et un score de 50/100.</div>
            </div>
            <div style={{background:'rgba(14,22,34,1)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'10px', padding:'16px', marginBottom:'16px'}}>
              {[['Nom', form.name], ['Rôle', ROLES.find(r=>r.id===role)?.title], ['Score initial','50 / 100'], ['Badge','Bronze ★']].map(([k,v]) => (
                <div key={k} style={{display:'flex', justifyContent:'space-between', padding:'8px 0', fontSize:'13px', borderBottom:'1px solid rgba(255,255,255,0.05)'}}>
                  <span style={{color:'#6B7E99'}}>{k}</span>
                  <span style={{color:'#E8F0FF', fontWeight:'500'}}>{v}</span>
                </div>
              ))}
            </div>
            {error && <div style={errStyle}>{error}</div>}
            <div style={row}>
              <button style={btnGhost} onClick={() => setStep(1)}>← Retour</button>
              <button style={loading ? btnOff : btn} onClick={submit} disabled={loading}>
                {loading ? 'Création...' : 'Créer mon compte →'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
