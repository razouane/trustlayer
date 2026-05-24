'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function CreateOrderPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({ product_name:'', product_desc:'', amount:'', deposit_pct:'20' });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [vendorId, setVendorId] = useState('');

  useEffect(() => {
    const v = localStorage.getItem('tl_vendor');
    if (!v) { router.push('/auth/login'); return; }
    setVendorId(JSON.parse(v).id);
  }, []);

  const u = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const deposit = form.amount ? Math.round(parseFloat(form.amount) * parseInt(form.deposit_pct) / 100) : 0;

  const createOrder = async () => {
    setLoading(true); setError('');
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vendor_id: vendorId, product_name: form.product_name, product_desc: form.product_desc, amount: parseFloat(form.amount), deposit_pct: parseInt(form.deposit_pct) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setResult(data);
    } catch(e) { setError(e.message); }
    finally { setLoading(false); }
  };

  const copy = () => { navigator.clipboard?.writeText(result.orderUrl); setCopied(true); setTimeout(() => setCopied(false), 2000); };

  const pg = { minHeight:'100vh', background:'#070C14', fontFamily:'DM Mono, monospace', paddingBottom:80 };
  const header = { background:'rgba(14,22,34,0.97)', borderBottom:'1px solid rgba(255,255,255,0.07)', padding:'12px 16px', display:'flex', alignItems:'center', gap:12, position:'sticky', top:0, zIndex:50 };
  const main = { padding:'16px', maxWidth:480, margin:'0 auto' };
  const card = { background:'rgba(14,22,34,1)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:12, padding:16, marginBottom:12 };
  const label = { display:'block', fontSize:11, color:'#6B7E99', marginBottom:6, letterSpacing:'0.06em', textTransform:'uppercase' };
  const inp = { width:'100%', padding:'11px 14px', fontSize:13, color:'#E8F0FF', background:'rgba(7,12,20,0.9)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:8, outline:'none', fontFamily:'DM Mono, monospace', marginBottom:14, boxSizing:'border-box' };
  const btn = (off) => ({ width:'100%', padding:'12px', background: off ? 'rgba(232,80,10,0.2)' : '#E8500A', color: off ? 'rgba(232,80,10,0.5)' : '#fff', border:'none', borderRadius:8, fontSize:14, fontWeight:600, cursor: off ? 'not-allowed' : 'pointer', fontFamily:'DM Mono, monospace', marginTop:8 });
  const btnGhost = { flex:1, padding:'11px', background:'transparent', color:'#6B7E99', border:'1px solid rgba(255,255,255,0.07)', borderRadius:8, fontSize:13, cursor:'pointer', fontFamily:'DM Mono, monospace' };
  const stepDot = (i) => ({ height:8, borderRadius:4, transition:'all 0.3s ease', background: i < step ? '#0FC87A' : i === step ? '#E8500A' : 'rgba(255,255,255,0.1)', width: i === step ? 28 : 8 });

  if (result) return (
    <div style={pg}>
      <div style={header}>
        <div style={{ fontSize:15, fontWeight:700, color:'#E8F0FF', fontFamily:'Syne, sans-serif' }}>Commande créée !</div>
      </div>
      <div style={{ ...main, textAlign:'center', paddingTop:24 }}>
        <div style={{ fontSize:48, marginBottom:12 }}>🔗</div>
        <div style={{ fontSize:18, fontWeight:800, color:'#E8F0FF', fontFamily:'Syne, sans-serif', marginBottom:6 }}>Commande créée !</div>
        <div style={{ fontSize:13, color:'#6B7E99', marginBottom:24, lineHeight:1.6 }}>Partagez ce lien avec votre client pour sécuriser la transaction.</div>
        <div style={card}>
          <div style={{ fontSize:10, color:'#6B7E99', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:8 }}>Lien sécurisé (48h)</div>
          <div style={{ fontSize:11, color:'#E8500A', wordBreak:'break-all', marginBottom:12, lineHeight:1.6 }}>{result.orderUrl}</div>
          <button onClick={copy} style={{ ...btn(false), background: copied ? 'rgba(15,200,122,0.2)' : '#E8500A', color: copied ? '#0FC87A' : '#fff', marginTop:0 }}>
            {copied ? '✓ Copié !' : '📋 Copier le lien'}
          </button>
        </div>
        {result.qrDataUrl && (
          <div style={card}>
            <div style={{ fontSize:10, color:'#6B7E99', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:12 }}>QR Code livreur</div>
            <img src={result.qrDataUrl} alt="QR" style={{ width:180, height:180, borderRadius:8, display:'block', margin:'0 auto' }} />
            <div style={{ fontSize:11, color:'#6B7E99', marginTop:8 }}>À montrer au livreur à la remise</div>
          </div>
        )}
        <div style={{ display:'flex', gap:10 }}>
          <button style={btnGhost} onClick={() => { setResult(null); setStep(0); setForm({ product_name:'', product_desc:'', amount:'', deposit_pct:'20' }); }}>Nouvelle commande</button>
          <button style={{ ...btn(false), flex:1, marginTop:0 }} onClick={() => router.push('/orders')}>Mes commandes</button>
        </div>
      </div>
    </div>
  );

  return (
    <div style={pg}>
      <div style={header}>
        <button onClick={() => router.push('/orders')} style={{ background:'transparent', border:'none', color:'#6B7E99', fontSize:18, cursor:'pointer' }}>←</button>
        <div style={{ fontSize:15, fontWeight:700, color:'#E8F0FF', fontFamily:'Syne, sans-serif' }}>Nouvelle Commande</div>
      </div>
      <div style={main}>
        <div style={{ display:'flex', gap:6, marginBottom:24, alignItems:'center' }}>
          {['Produit','Paiement','Confirmer'].map((s,i) => (
            <div key={i} style={{ display:'flex', alignItems:'center', gap:6 }}>
              <div style={stepDot(i)} />
              <span style={{ fontSize:10, color: i===step ? '#E8F0FF' : '#6B7E99' }}>{s}</span>
              {i < 2 && <div style={{ width:16, height:1, background:'rgba(255,255,255,0.07)' }} />}
            </div>
          ))}
        </div>

        {step === 0 && (
          <div>
            <label style={label}>Nom du produit *</label>
            <input style={inp} placeholder="Ex : Robe d'été fleurie" value={form.product_name} onChange={e => u('product_name', e.target.value)} />
            <label style={label}>Description (optionnel)</label>
            <textarea style={{ ...inp, resize:'none', height:80 }} placeholder="Couleur, taille, caractéristiques..." value={form.product_desc} onChange={e => u('product_desc', e.target.value)} />
            <button style={btn(!form.product_name)} onClick={() => form.product_name && setStep(1)} disabled={!form.product_name}>Suivant →</button>
          </div>
        )}

        {step === 1 && (
          <div>
            <label style={label}>Prix total (TND) *</label>
            <input type="number" style={inp} placeholder="Ex : 85" value={form.amount} onChange={e => u('amount', e.target.value)} />
            <label style={label}>Pourcentage d'acompte</label>
            <div style={{ display:'flex', gap:8, marginBottom:14 }}>
              {['10','20','30','50'].map(pct => (
                <button key={pct} onClick={() => u('deposit_pct', pct)}
                  style={{ flex:1, padding:'10px 0', borderRadius:8, fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:'DM Mono, monospace', border:`1.5px solid ${form.deposit_pct===pct ? '#E8500A' : 'rgba(255,255,255,0.07)'}`, background: form.deposit_pct===pct ? 'rgba(232,80,10,0.12)' : 'transparent', color: form.deposit_pct===pct ? '#E8500A' : '#6B7E99' }}>
                  {pct}%
                </button>
              ))}
            </div>
            {form.amount && (
              <div style={{ background:'rgba(15,200,122,0.08)', border:'1px solid rgba(15,200,122,0.25)', borderRadius:8, padding:'12px 14px', marginBottom:14 }}>
                <div style={{ display:'flex', justifyContent:'space-between', fontSize:13, marginBottom:4 }}>
                  <span style={{ color:'#6B7E99' }}>Acompte maintenant</span>
                  <span style={{ color:'#0FC87A', fontWeight:700 }}>{deposit} TND</span>
                </div>
                <div style={{ display:'flex', justifyContent:'space-between', fontSize:12 }}>
                  <span style={{ color:'#6B7E99' }}>Reste à la livraison</span>
                  <span style={{ color:'#E8F0FF' }}>{(parseFloat(form.amount) - deposit).toFixed(3)} TND</span>
                </div>
              </div>
            )}
            <div style={{ display:'flex', gap:10 }}>
              <button style={btnGhost} onClick={() => setStep(0)}>← Retour</button>
              <button style={{ ...btn(!form.amount), flex:1 }} onClick={() => form.amount && setStep(2)} disabled={!form.amount}>Suivant →</button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <div style={{ background:'rgba(14,22,34,1)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:10, padding:16, marginBottom:16 }}>
              <div style={{ fontSize:11, color:'#6B7E99', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:12 }}>Récapitulatif</div>
              {[['Produit', form.product_name], ['Montant total', `${form.amount} TND`], ['Acompte', `${form.deposit_pct}% = ${deposit} TND`], ['Protection', 'Garantie TrustLayer ✓']].map(([k,v]) => (
                <div key={k} style={{ display:'flex', justifyContent:'space-between', padding:'7px 0', fontSize:13, borderBottom:'1px solid rgba(255,255,255,0.05)' }}>
                  <span style={{ color:'#6B7E99' }}>{k}</span>
                  <span style={{ color:'#E8F0FF' }}>{v}</span>
                </div>
              ))}
            </div>
            {error && <div style={{ color:'#F04848', fontSize:12, marginBottom:8 }}>{error}</div>}
            <div style={{ display:'flex', gap:10 }}>
              <button style={btnGhost} onClick={() => setStep(1)}>← Retour</button>
              <button style={{ ...btn(loading), flex:1 }} onClick={createOrder} disabled={loading}>
                {loading ? 'Création...' : '🔗 Générer le lien'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
