import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Header from '../components/Header';
import BrokerSidebar from '../components/BrokerSidebar';

const STEPS = [
  { id: 0, label: 'Personal Info',        desc: 'Photo, bio & languages'   },
  { id: 1, label: 'Company Info',         desc: 'Agency, areas & services' },
  { id: 2, label: 'Professional Details', desc: 'Track record & stats'     },
];

const LANGUAGES = [
  'Hindi','English','Marathi','Tamil','Telugu',
  'Kannada','Malayalam','Gujarati','Bengali','Punjabi','Urdu',
];

const SERVICES = [
  'Buy','Sell','Rent','Commercial','Residential',
  'Plots','New Projects','NRI Services','Luxury',
];

const ZONE_ORDER = ['South', 'Central', 'West', 'North', 'East / OMR'];

/* ── AreasOfOperation ──────────────────────────────────────── */
const AreasOfOperation = ({ selected = [], onChange, zones = {}, zoneKeys = [], loadingZones }) => {
  const [activeZone, setActiveZone] = useState(null);

  useEffect(() => {
    if (zoneKeys.length > 0 && !activeZone) setActiveZone(zoneKeys[0]);
  }, [zoneKeys]);

  const toggle     = (loc) => onChange(selected.includes(loc) ? selected.filter(l => l !== loc) : [...selected, loc]);
  const toggleZone = (zk)  => {
    const locs  = zones[zk]?.locs ?? [];
    const allOn = locs.every(l => selected.includes(l));
    onChange(allOn ? selected.filter(l => !locs.includes(l)) : [...selected, ...locs.filter(l => !selected.includes(l))]);
  };
  const clearAll = () => onChange([]);

  if (loadingZones) return <div style={{ border:'1.5px solid #e5e7eb', borderRadius:12, padding:24, textAlign:'center', color:'#9ca3af', fontSize:13 }}>Loading localities…</div>;
  if (!activeZone || zoneKeys.length === 0) return <div style={{ border:'1.5px solid #e5e7eb', borderRadius:12, padding:24, textAlign:'center', color:'#9ca3af', fontSize:13 }}>No localities available.</div>;

  const activeLocs   = zones[activeZone]?.locs ?? [];
  const activeSelCnt = activeLocs.filter(l => selected.includes(l)).length;
  const allActive    = activeLocs.length > 0 && activeSelCnt === activeLocs.length;

  return (
    <div style={{ fontFamily:"'Segoe UI', system-ui, sans-serif" }}>
      {/* Zone tabs — scrollable on mobile */}
      <div style={{ display:'flex', borderRadius:'10px 10px 0 0', border:'1.5px solid #e5e7eb', borderBottom:'none', background:'#f9fafb', overflowX:'auto' }}>
        {zoneKeys.map(zk => {
          const cnt  = (zones[zk]?.locs ?? []).filter(l => selected.includes(l)).length;
          const isOn = zk === activeZone;
          return (
            <button key={zk} type="button" onClick={() => setActiveZone(zk)}
              style={{ flex:'1 0 auto', minWidth:72, padding:'10px 8px 8px', border:'none', background: isOn ? '#fff' : 'transparent', borderBottom: isOn ? '2.5px solid #ef4444' : '2.5px solid transparent', cursor:'pointer', display:'flex', flexDirection:'column', alignItems:'center', gap:4, transition:'all .15s' }}>
              <span style={{ fontSize:12, fontWeight: isOn ? 700 : 500, color: isOn ? '#ef4444' : '#6b7280', whiteSpace:'nowrap' }}>{zk}</span>
              {cnt > 0 && <span style={{ background:'#ef4444', color:'#fff', fontSize:10, fontWeight:700, borderRadius:99, padding:'1px 6px', lineHeight:1.5 }}>{cnt}</span>}
            </button>
          );
        })}
      </div>

      <div style={{ border:'1.5px solid #e5e7eb', borderTop:'none', borderRadius:'0 0 10px 10px', overflow:'hidden' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 14px 8px', borderBottom:'1px solid #f9fafb', background:'#fff' }}>
          <div>
            <span style={{ fontSize:12, fontWeight:700, color:'#374151' }}>{zones[activeZone]?.label ?? activeZone}</span>
            <span style={{ fontSize:11, color:'#9ca3af' }}>&nbsp;·&nbsp;{activeSelCnt}/{activeLocs.length} selected</span>
          </div>
          <button type="button" onClick={() => toggleZone(activeZone)}
            style={{ background:'none', border:'1px solid #e5e7eb', borderRadius:6, padding:'4px 10px', fontSize:11, fontWeight:600, color:'#6b7280', cursor:'pointer' }}>
            {allActive ? 'Deselect all' : 'Select all'}
          </button>
        </div>

        <div style={{ display:'flex', flexWrap:'wrap', gap:8, padding:'14px 14px 16px', background:'#fff' }}>
          {activeLocs.map(loc => {
            const on = selected.includes(loc);
            return (
              <button key={loc} type="button" onClick={() => toggle(loc)}
                style={{ padding:'7px 14px', borderRadius:99, fontSize:13, fontWeight:600, cursor:'pointer', display:'inline-flex', alignItems:'center', gap:5, transition:'all .15s', border: on ? '1.5px solid #ef4444' : '1.5px solid #e5e7eb', background: on ? '#fff1f1' : '#fff', color: on ? '#ef4444' : '#4b5563' }}>
                {on && <span style={{ fontSize:10, fontWeight:800 }}>✓</span>}
                {loc}
              </button>
            );
          })}
        </div>

        {selected.length > 0 && (
          <div style={{ borderTop:'1px solid #f0f2f5', background:'#fef2f2', padding:'10px 14px 12px' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
              <span style={{ fontSize:11, fontWeight:700, color:'#ef4444', textTransform:'uppercase', letterSpacing:'0.4px' }}>
                {selected.length} {selected.length === 1 ? 'locality' : 'localities'} selected
              </span>
              <button type="button" onClick={clearAll} style={{ background:'none', border:'none', fontSize:11, fontWeight:700, color:'#ef4444', cursor:'pointer' }}>Clear all</button>
            </div>
            <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
              {selected.map(loc => (
                <span key={loc} style={{ display:'inline-flex', alignItems:'center', gap:4, padding:'3px 8px 3px 10px', background:'#ef4444', color:'#fff', borderRadius:99, fontSize:11, fontWeight:600 }}>
                  {loc}
                  <button type="button" onClick={() => toggle(loc)} style={{ background:'none', border:'none', color:'rgba(255,255,255,0.8)', cursor:'pointer', fontSize:14, lineHeight:1, padding:'0 0 0 2px' }}>×</button>
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

/* ── Field ──────────────────────────────────────────────────── */
const Field = ({ label, required, children, style = {} }) => (
  <div style={{ display:'flex', flexDirection:'column', gap:6, ...style }}>
    <label style={{ fontSize:11, fontWeight:700, color:'#6b7280', textTransform:'uppercase', letterSpacing:'0.5px' }}>
      {label}{required && <span style={{ color:'#ef4444', marginLeft:3 }}>*</span>}
    </label>
    {children}
  </div>
);

const inputBase = { border:'1.5px solid #e5e7eb', borderRadius:10, padding:'11px 14px', fontSize:14, fontFamily:'inherit', background:'#fff', outline:'none', color:'#1f2937', transition:'border-color .2s, box-shadow .2s', width:'100%', boxSizing:'border-box' };
const readonlyBase = { ...inputBase, background:'#f9fafb', color:'#9ca3af', cursor:'not-allowed' };

const Input = ({ readonly, ...props }) => {
  const [focused, setFocused] = useState(false);
  return (
    <input readOnly={readonly}
      style={{ ...(readonly ? readonlyBase : inputBase), ...(focused && !readonly ? { borderColor:'#ef4444', boxShadow:'0 0 0 3px rgba(239,68,68,0.1)' } : {}) }}
      onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
      {...props}
    />
  );
};

const Textarea = ({ rows = 4, ...props }) => {
  const [focused, setFocused] = useState(false);
  return (
    <textarea rows={rows}
      style={{ ...inputBase, resize:'vertical', ...(focused ? { borderColor:'#ef4444', boxShadow:'0 0 0 3px rgba(239,68,68,0.1)' } : {}) }}
      onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
      {...props}
    />
  );
};

const TagSelector = ({ items, selected = [], onChange }) => (
  <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
    {items.map(item => {
      const active = selected.includes(item);
      return (
        <button key={item} type="button"
          onClick={() => onChange(active ? selected.filter(s => s !== item) : [...selected, item])}
          style={{ padding:'7px 18px', borderRadius:99, cursor:'pointer', border: active ? '1.5px solid #ef4444' : '1.5px solid #e5e7eb', background: active ? '#fff1f1' : '#fff', color: active ? '#ef4444' : '#6b7280', fontSize:13, fontWeight:600, fontFamily:'inherit', transition:'all .15s' }}>
          {item}
        </button>
      );
    })}
  </div>
);

const Card = ({ children, style = {} }) => (
  <div style={{ background:'#fff', borderRadius:14, border:'1px solid #f0f2f5', padding:'20px 20px', marginBottom:16, boxShadow:'0 1px 3px rgba(0,0,0,0.04)', boxSizing:'border-box', ...style }}>
    {children}
  </div>
);

const CardHeader = ({ icon, title, desc }) => (
  <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:20 }}>
    <div style={{ width:38, height:38, borderRadius:10, background:'#fff5f5', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, flexShrink:0 }}>{icon}</div>
    <div>
      <div style={{ fontSize:15, fontWeight:700, color:'#111827' }}>{title}</div>
      {desc && <div style={{ fontSize:12, color:'#9ca3af', marginTop:2 }}>{desc}</div>}
    </div>
  </div>
);

/* ── Desktop Step Nav (dark sidebar) ── */
const StepNav = ({ current, onGo }) => {
  const pct = Math.round(((current + 1) / 3) * 100);
  return (
    <div style={{ width:220, flexShrink:0, background:'#1c1c2e', padding:'28px 16px', display:'flex', flexDirection:'column', minHeight:'100%', overflowY:'auto' }}>
      <div style={{ fontSize:10, fontWeight:700, color:'rgba(255,255,255,0.3)', letterSpacing:'1px', textTransform:'uppercase', marginBottom:20, paddingLeft:10 }}>
        Complete Profile
      </div>
      {STEPS.map((s, i) => {
        const isActive = s.id === current;
        const isDone   = s.id < current;
        return (
          <div key={s.id}>
            <div onClick={() => s.id <= current && onGo(s.id)}
              style={{ display:'flex', alignItems:'center', gap:12, padding:'13px 14px', borderRadius:10, cursor: s.id <= current ? 'pointer' : 'default', background: isActive ? 'rgba(239,68,68,0.18)' : isDone ? 'rgba(255,255,255,0.04)' : 'transparent', transition:'background .2s' }}>
              <div style={{ width:30, height:30, borderRadius:'50%', flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:800, background: isActive ? '#ef4444' : isDone ? '#22c55e' : 'transparent', border: isActive ? '2px solid #ef4444' : isDone ? '2px solid #22c55e' : '2px solid rgba(255,255,255,0.15)', color:(isActive || isDone) ? '#fff' : 'rgba(255,255,255,0.3)' }}>
                {isDone ? '✓' : s.id + 1}
              </div>
              <div>
                <div style={{ fontSize:10, color:'rgba(255,255,255,0.3)', marginBottom:2 }}>Step {s.id + 1}</div>
                <div style={{ fontSize:13, fontWeight:600, color: isActive ? '#fff' : isDone ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.35)' }}>{s.label}</div>
                <div style={{ fontSize:11, marginTop:2, color: isActive ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.2)' }}>{s.desc}</div>
              </div>
            </div>
            {i < STEPS.length - 1 && (
              <div style={{ marginLeft:29, width:2, height:24, background: isDone ? '#22c55e' : 'rgba(255,255,255,0.08)', borderRadius:99, transition:'background .4s' }} />
            )}
          </div>
        );
      })}
      <div style={{ marginTop:'auto', paddingTop:28, borderTop:'1px solid rgba(255,255,255,0.07)' }}>
        <div style={{ display:'flex', justifyContent:'space-between', marginBottom:8 }}>
          <span style={{ fontSize:11, color:'rgba(255,255,255,0.35)' }}>Profile completion</span>
          <span style={{ fontSize:11, fontWeight:700, color:'#ef4444' }}>{pct}%</span>
        </div>
        <div style={{ height:4, background:'rgba(255,255,255,0.08)', borderRadius:99, overflow:'hidden' }}>
          <div style={{ height:'100%', width:`${pct}%`, background:'#ef4444', borderRadius:99, transition:'width .5s ease' }} />
        </div>
      </div>
    </div>
  );
};

/* ── Mobile Step Bar ── */
const MobileStepBar = ({ current, onGo }) => {
  const pct = Math.round(((current + 1) / 3) * 100);
  return (
    <div style={{ background:'#1c1c2e', padding:'14px 16px 16px' }}>
      <div style={{ display:'flex', gap:8, marginBottom:12 }}>
        {STEPS.map((s) => {
          const isActive = s.id === current;
          const isDone   = s.id < current;
          return (
            <button key={s.id} type="button"
              onClick={() => s.id <= current && onGo(s.id)}
              style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:6, background:'none', border:'none', cursor: s.id <= current ? 'pointer' : 'default', padding:'8px 4px', borderRadius:8, background: isActive ? 'rgba(239,68,68,0.18)' : 'transparent', transition:'background .2s' }}>
              <div style={{ width:26, height:26, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:800, background: isActive ? '#ef4444' : isDone ? '#22c55e' : 'transparent', border: isActive ? '2px solid #ef4444' : isDone ? '2px solid #22c55e' : '2px solid rgba(255,255,255,0.2)', color:(isActive || isDone) ? '#fff' : 'rgba(255,255,255,0.35)' }}>
                {isDone ? '✓' : s.id + 1}
              </div>
              <span style={{ fontSize:11, fontWeight:600, color: isActive ? '#fff' : isDone ? 'rgba(255,255,255,0.65)' : 'rgba(255,255,255,0.3)', textAlign:'center', lineHeight:1.3 }}>{s.label}</span>
            </button>
          );
        })}
      </div>
      <div style={{ display:'flex', alignItems:'center', gap:10 }}>
        <div style={{ flex:1, height:4, background:'rgba(255,255,255,0.08)', borderRadius:99, overflow:'hidden' }}>
          <div style={{ height:'100%', width:`${pct}%`, background:'#ef4444', borderRadius:99, transition:'width .5s ease' }} />
        </div>
        <span style={{ fontSize:11, fontWeight:700, color:'#ef4444', flexShrink:0 }}>{pct}%</span>
      </div>
    </div>
  );
};

/* ── Toast ──────────────────────────────────────────────────── */
const Toast = ({ msg, type }) => (
  <div style={{ position:'fixed', bottom:24, right:16, left:16, zIndex:9999, background: type === 'success' ? '#16a34a' : '#dc2626', color:'#fff', padding:'14px 20px', borderRadius:12, fontSize:14, fontWeight:600, fontFamily:'inherit', boxShadow:'0 8px 24px rgba(0,0,0,0.2)', animation:'slideUp .3s ease', maxWidth:480, margin:'0 auto', textAlign:'center' }}>
    {type === 'success' ? '✓ ' : '✕ '}{msg}
    <style>{`@keyframes slideUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}`}</style>
  </div>
);

/* ── Main ───────────────────────────────────────────────────── */
const ProfileDetails = () => {
  const [step,         setStep]         = useState(0);
  const [loading,      setLoading]      = useState(true);
  const [saving,       setSaving]       = useState(false);
  const [toast,        setToast]        = useState(null);
  const [previewUrl,   setPreviewUrl]   = useState(null);
  const [zones,        setZones]        = useState({});
  const [zoneKeys,     setZoneKeys]     = useState([]);
  const [loadingZones, setLoadingZones] = useState(true);
  const [isMobile,     setIsMobile]     = useState(window.innerWidth < 768);
  const [isTablet,     setIsTablet]     = useState(window.innerWidth < 1024);
  const fileRef = useRef();

  useEffect(() => {
    const onResize = () => {
      setIsMobile(window.innerWidth < 768);
      setIsTablet(window.innerWidth < 1024);
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const [form, setForm] = useState({
    name:'', mobile_number:'', email:'',
    introduction:'', about:'', languages_spoken:[],
    agency_name:'', rera_no:'', city:'',
    year_experience:'', office_address:'',
    locality:[], area:'', service_offered:[],
    success_stories:'', testimonials:'',
    property_listings:'', deals_closed:'', happy_clients:'',
    profileImage: null,
  });

  useEffect(() => {
    const fetchLocalities = async () => {
      try {
        const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/locality/all`, { withCredentials: true });
        const grouped = {};
        data.data.filter(item => item.active).forEach(item => {
          const zoneName = item.zone?.trim();
          if (!zoneName) return;
          if (!grouped[zoneName]) grouped[zoneName] = { label: zoneName, locs: [] };
          const rawState = item.state;
          if (Array.isArray(rawState)) {
            rawState.forEach(s => { const loc = s.trim(); if (loc && !grouped[zoneName].locs.includes(loc)) grouped[zoneName].locs.push(loc); });
          } else if (typeof rawState === 'string') {
            rawState.split(',').forEach(s => { const loc = s.trim(); if (loc && !grouped[zoneName].locs.includes(loc)) grouped[zoneName].locs.push(loc); });
          }
        });
        const ordered = [...ZONE_ORDER.filter(k => grouped[k]), ...Object.keys(grouped).filter(k => !ZONE_ORDER.includes(k))];
        setZones(grouped);
        setZoneKeys(ordered);
      } catch (err) {
        console.error('Locality fetch error:', err);
      } finally {
        setLoadingZones(false);
      }
    };
    fetchLocalities();
  }, []);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/brokerProfile`, { withCredentials: true });
        setForm(prev => ({
          ...prev,
          name:             data.name              || '',
          mobile_number:    data.mobile_number     || '',
          email:            data.email             || '',
          introduction:     data.introduction      || '',
          about:            data.about             || '',
          languages_spoken: data.languages_spoken  || [],
          service_offered:  data.service_offered   || [],
          agency_name:      data.agency_name       || '',
          rera_no:          data.rera_no            || '',
          city:             data.city              || '',
          year_experience:  data.year_experience   || '',
          office_address:   data.office_address    || '',
          locality: Array.isArray(data.locality) ? data.locality : [],
          area: Array.isArray(data.area) ? data.area.join(', ') : (data.area || ''),
          success_stories: Array.isArray(data.success_stories) ? data.success_stories.join('\n') : (data.success_stories || ''),
          testimonials: Array.isArray(data.testimonials) ? data.testimonials.join('\n') : (data.testimonials || ''),
          property_listings: data.property_listings || '',
          deals_closed:      data.deals_closed      || '',
          happy_clients:     data.happy_clients      || '',
        }));
        if (data.profileImage) setPreviewUrl(data.profileImage);
      } catch (err) {
        console.error('Profile fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const set    = (key, val) => setForm(prev => ({ ...prev, [key]: val }));
  const handle = e => set(e.target.name, e.target.value);

  const handleFile = e => {
    const f = e.target.files[0];
    if (!f) return;
    set('profileImage', f);
    setPreviewUrl(URL.createObjectURL(f));
  };

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleSubmit = async () => {
    setSaving(true);
    const data = new FormData();
    const toArr = raw => JSON.stringify(raw.split(/[\n,]/).map(s => s.trim()).filter(Boolean));
    Object.entries(form).forEach(([key, val]) => {
      if (key === 'profileImage') { if (val instanceof File) data.append('profileImage', val); }
      else if (['languages_spoken', 'service_offered', 'locality'].includes(key)) data.append(key, JSON.stringify(val));
      else if (['area', 'success_stories', 'testimonials'].includes(key)) data.append(key, toArr(val));
      else data.append(key, val ?? '');
    });
    try {
      await axios.put(`${import.meta.env.VITE_API_URL}/broker/update-profile`, data, { withCredentials: true });
      showToast('Profile updated successfully!', 'success');
    } catch (err) {
      showToast(err?.response?.data?.message || 'Update failed.', 'error');
    } finally {
      setSaving(false);
    }
  };

  /* Responsive grid: 2-col on desktop, 1-col on mobile */
  const twoGrid = { display:'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap:16, marginBottom:16 };
  const threeGrid = { display:'grid', gridTemplateColumns: isMobile ? '1fr' : isTablet ? '1fr 1fr' : '1fr 1fr 1fr', gap:16 };

  if (loading) return (
    <>
      <Header />
      <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'calc(100vh - 64px)', color:'#9ca3af', fontSize:15 }}>
        Loading profile…
      </div>
    </>
  );

  /* ── FORM STEPS ─────────────────────────────────────────── */
  const formContent = (
    <div style={{ flex:1, overflowY:'auto', padding: isMobile ? '20px 14px 100px' : '32px 36px 60px', background:'#f7f8fc', minWidth:0 }}>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; }
        input, textarea { box-sizing: border-box; }
      `}</style>

      {/* ══ STEP 0 ══ */}
      {step === 0 && (
        <>
          <div style={{ marginBottom:22 }}>
            <h2 style={{ fontSize: isMobile ? 18 : 22, fontWeight:700, color:'#111827', margin:0 }}>Personal Information</h2>
            <p style={{ fontSize:13, color:'#9ca3af', margin:'6px 0 0' }}>Your contact details are pre-filled from registration. Update your bio and languages.</p>
          </div>

          <Card>
            <CardHeader icon="📸" title="Profile Photo" desc="Displayed on your listings and public profile" />
            <div style={{ display:'flex', alignItems:'center', gap:20, flexWrap:'wrap' }}>
              <div onClick={() => fileRef.current?.click()}
                style={{ width:80, height:80, borderRadius:'50%', flexShrink:0, background:'#f3f4f6', border:'3px dashed #e5e7eb', display:'flex', alignItems:'center', justifyContent:'center', overflow:'hidden', cursor:'pointer' }}>
                {previewUrl ? <img src={previewUrl} alt="profile" style={{ width:'100%', height:'100%', objectFit:'cover' }} /> : <span style={{ fontSize:30 }}>👤</span>}
              </div>
              <div>
                <div style={{ fontSize:14, fontWeight:600, color:'#374151' }}>Click photo to change</div>
                <div style={{ fontSize:12, color:'#9ca3af', marginTop:2 }}>JPG or PNG, max 5MB. Square crop works best.</div>
                <label style={{ display:'inline-flex', alignItems:'center', gap:6, marginTop:10, padding:'8px 16px', border:'1.5px solid #e5e7eb', borderRadius:8, fontSize:12, fontWeight:600, color:'#374151', cursor:'pointer', background:'#fff' }}>
                  📁 Browse Photo
                  <input type="file" hidden accept="image/*" ref={fileRef} onChange={handleFile} />
                </label>
              </div>
            </div>
          </Card>

          <Card>
            <CardHeader icon="✏️" title="Basic Details" desc="Name, contact and intro — name/mobile/email are read-only" />
            <div style={twoGrid}>
              <Field label="Full Name"><Input readonly value={form.name} /></Field>
              <Field label="Mobile Number"><Input readonly value={form.mobile_number} /></Field>
            </div>
            <Field label="Email Address" style={{ marginBottom:16 }}><Input readonly value={form.email} /></Field>
            <Field label="Short Introduction" style={{ marginBottom:16 }}>
              <Input name="introduction" value={form.introduction} onChange={handle} placeholder="e.g. Senior property consultant with 8+ years in Chennai" />
            </Field>
            <Field label="About You">
              <Textarea name="about" value={form.about} onChange={handle} rows={4} placeholder="Tell clients about your expertise, approach, and what makes you different…" />
            </Field>
          </Card>

          <Card>
            <CardHeader icon="🌐" title="Languages Spoken" desc="Clients filter brokers by language — select all you speak" />
            <TagSelector items={LANGUAGES} selected={form.languages_spoken} onChange={val => set('languages_spoken', val)} />
          </Card>
        </>
      )}

      {/* ══ STEP 1 ══ */}
      {step === 1 && (
        <>
          <div style={{ marginBottom:22 }}>
            <h2 style={{ fontSize: isMobile ? 18 : 22, fontWeight:700, color:'#111827', margin:0 }}>Company Information</h2>
            <p style={{ fontSize:13, color:'#9ca3af', margin:'6px 0 0' }}>Help clients discover and trust your agency.</p>
          </div>

          <Card>
            <CardHeader icon="🏢" title="Agency Details" desc="Official firm information shown on your profile" />
            <div style={twoGrid}>
              <Field label="Agency / Firm Name">
                <Input name="agency_name" value={form.agency_name} onChange={handle} placeholder="e.g. Sharma Realty Pvt. Ltd." />
              </Field>
              <Field label="RERA Registration No.">
                <Input name="rera_no" value={form.rera_no} onChange={handle} placeholder="e.g. TN-RERA-P12345" />
              </Field>
            </div>
            <div style={{ ...twoGrid, marginTop:0 }}>
              <Field label="City">
                <Input name="city" value={form.city} onChange={handle} placeholder="e.g. Chennai" />
              </Field>
              <Field label="Years of Experience">
                <Input name="year_experience" type="number" value={form.year_experience} onChange={handle} placeholder="e.g. 8" min={0} />
              </Field>
            </div>
            <Field label="Office Address" style={{ marginTop: isMobile ? 0 : 0 }}>
              <Textarea name="office_address" value={form.office_address} onChange={handle} rows={3} placeholder="Full office address with pincode…" />
            </Field>
          </Card>

          <Card>
            <CardHeader icon="📍" title="Areas of Operation" desc="Select your zone, then pick the localities you serve" />
            <div style={{ marginBottom:16 }}>
              <label style={{ fontSize:11, fontWeight:700, color:'#6b7280', textTransform:'uppercase', letterSpacing:'0.5px', display:'block', marginBottom:10 }}>Localities</label>
              <AreasOfOperation selected={form.locality} onChange={val => set('locality', val)} zones={zones} zoneKeys={zoneKeys} loadingZones={loadingZones} />
            </div>
            <Field label="Micro-Markets / Areas">
              <Input name="area" value={form.area} onChange={handle} placeholder="e.g. Sholinganallur IT corridor, Perungudi tech park…" />
            </Field>
          </Card>

          <Card>
            <CardHeader icon="🏷️" title="Services Offered" desc="Select all that apply — clients search by service type" />
            <TagSelector items={SERVICES} selected={form.service_offered} onChange={val => set('service_offered', val)} />
          </Card>
        </>
      )}

      {/* ══ STEP 2 ══ */}
      {step === 2 && (
        <>
          <div style={{ marginBottom:22 }}>
            <h2 style={{ fontSize: isMobile ? 18 : 22, fontWeight:700, color:'#111827', margin:0 }}>Professional Details</h2>
            <p style={{ fontSize:13, color:'#9ca3af', margin:'6px 0 0' }}>Build credibility with your track record and client testimonials.</p>
          </div>

          <Card>
            <CardHeader icon="🏆" title="Success Stories" desc="One achievement per line — shown as bullets on your profile" />
            <Field label="Key Achievements">
              <Textarea name="success_stories" value={form.success_stories} onChange={handle} rows={5}
                placeholder={'Closed a ₹2.5 Cr deal in Adyar in under 30 days\nHelped 50+ families find dream homes in 2024'} />
            </Field>
          </Card>

          <Card>
            <CardHeader icon="⭐" title="Client Testimonials" desc="One quote per line — shown in a scrollable section" />
            <Field label="Testimonials">
              <Textarea name="testimonials" value={form.testimonials} onChange={handle} rows={5}
                placeholder={'"Ravi helped us find our perfect 3BHK in just 2 weeks." — Priya K.'} />
            </Field>
          </Card>

          <Card>
            <CardHeader icon="📊" title="Stats & Figures" desc="Numbers shown prominently on your public profile card" />
            <div style={threeGrid}>
              <Field label="Properties Listed">
                <Input name="property_listings" type="number" value={form.property_listings} onChange={handle} placeholder="e.g. 24" min={0} />
              </Field>
              <Field label="Deals Closed">
                <Input name="deals_closed" type="number" value={form.deals_closed} onChange={handle} placeholder="e.g. 180" min={0} />
              </Field>
              <Field label="Happy Clients">
                <Input name="happy_clients" type="number" value={form.happy_clients} onChange={handle} placeholder="e.g. 350" min={0} />
              </Field>
            </div>
          </Card>
        </>
      )}

      {/* ── Footer Actions ── */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', paddingTop:20, marginTop:4, borderTop:'1px solid #f0f2f5', gap:12 }}>
        {step > 0
          ? <button type="button" onClick={() => setStep(s => s - 1)}
              style={{ padding:'11px 20px', borderRadius:10, border:'1.5px solid #e5e7eb', background:'#fff', fontSize:14, fontWeight:600, color:'#374151', cursor:'pointer', fontFamily:'inherit', whiteSpace:'nowrap' }}>
              ← Back
            </button>
          : <div />
        }
        {step < 2
          ? <button type="button" onClick={() => setStep(s => s + 1)}
              style={{ padding:'11px 22px', borderRadius:10, border:'none', background:'#ef4444', fontSize:14, fontWeight:700, color:'#fff', cursor:'pointer', fontFamily:'inherit', whiteSpace:'nowrap' }}>
              Continue →
            </button>
          : <button type="button" onClick={handleSubmit} disabled={saving}
              style={{ padding:'11px 22px', borderRadius:10, border:'none', background: saving ? '#fca5a5' : '#ef4444', fontSize:14, fontWeight:700, color:'#fff', cursor: saving ? 'not-allowed' : 'pointer', fontFamily:'inherit', transition:'background .2s', whiteSpace:'nowrap' }}>
              {saving ? 'Saving…' : 'Save & Publish ✓'}
            </button>
        }
      </div>
    </div>
  );

  return (
    <div style={{ minHeight:'100vh', background:'#f7f8fc', fontFamily:"'Segoe UI', system-ui, sans-serif" }}>
      <Header />

      {isMobile ? (
        /* ── MOBILE layout ── */
           <div className="mainbodybroker">
  <BrokerSidebar />
  <main
    className="flex-grow-1  p-md-5"
    style={{ minWidth: 0, width: '100%', overflowX: 'hidden' }}
  >
          <MobileStepBar current={step} onGo={setStep} />
          <div style={{ flex:1, overflowY:'auto' }}>
            {formContent}
          </div></main>
        </div>
      ) : (
        /* ── DESKTOP layout ── */
        <div style={{ display:'flex', flexDirection:'row', height:'calc(100vh - 64px)', overflow:'hidden' }}>
          {/* BrokerSidebar */}
        
            <BrokerSidebar />
         
          {/* Step Nav */}
          <StepNav current={step} onGo={setStep} />
          {/* Form */}
          {formContent}
        </div>
      )}

      {toast && <Toast msg={toast.msg} type={toast.type} />}
    </div>
  );
};

export default ProfileDetails;