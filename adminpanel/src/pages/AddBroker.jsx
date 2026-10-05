import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import Sidebar from '../components/Sidebar';

// ── Constants ────────────────────────────────────────────────
const STEPS = [
  { id: 0, label: 'Personal Info'        },
  { id: 1, label: 'Company Info'         },
  { id: 2, label: 'Professional Details' },
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

// ── AreasOfOperation ─────────────────────────────────────────
const AreasOfOperation = ({ selected = [], onChange, zones = {}, zoneKeys = [], loadingZones }) => {
  const [activeZone, setActiveZone] = useState(null);

  useEffect(() => {
    if (zoneKeys.length > 0 && !activeZone) setActiveZone(zoneKeys[0]);
  }, [zoneKeys]);

  const toggle = (loc) =>
    onChange(selected.includes(loc) ? selected.filter(l => l !== loc) : [...selected, loc]);

  const toggleZone = (zk) => {
    const locs  = zones[zk]?.locs ?? [];
    const allOn = locs.every(l => selected.includes(l));
    onChange(allOn ? selected.filter(l => !locs.includes(l)) : [...selected, ...locs.filter(l => !selected.includes(l))]);
  };

  const clearAll = () => onChange([]);

  if (loadingZones) return <div style={S.placeholder}>Loading localities…</div>;
  if (!activeZone || zoneKeys.length === 0) return <div style={S.placeholder}>No localities available.</div>;

  const activeLocs   = zones[activeZone]?.locs ?? [];
  const activeSelCnt = activeLocs.filter(l => selected.includes(l)).length;
  const allActive    = activeLocs.length > 0 && activeSelCnt === activeLocs.length;

  return (
    <div>
      {/* Zone tabs */}
      <div style={{ display:'flex', borderRadius:'10px 10px 0 0', border:'1.5px solid #e5e7eb', borderBottom:'none', background:'#f9fafb', overflow:'hidden' }}>
        {zoneKeys.map(zk => {
          const cnt = (zones[zk]?.locs ?? []).filter(l => selected.includes(l)).length;
          const on  = zk === activeZone;
          return (
            <button key={zk} type="button" onClick={() => setActiveZone(zk)} style={{
              flex:1, padding:'10px 6px 8px', border:'none',
              background: on ? '#fff' : 'transparent',
              borderBottom: on ? '2.5px solid #dc2626' : '2.5px solid transparent',
              cursor:'pointer', display:'flex', flexDirection:'column', alignItems:'center', gap:4,
            }}>
              <span style={{ fontSize:12, fontWeight: on ? 700 : 500, color: on ? '#dc2626' : '#6b7280', whiteSpace:'nowrap' }}>{zk}</span>
              {cnt > 0 && <span style={{ background:'#dc2626', color:'#fff', fontSize:10, fontWeight:700, borderRadius:99, padding:'1px 6px' }}>{cnt}</span>}
            </button>
          );
        })}
      </div>

      {/* Zone body */}
      <div style={{ border:'1.5px solid #e5e7eb', borderTop:'none', borderRadius:'0 0 10px 10px', overflow:'hidden' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 14px 8px', background:'#fff', borderBottom:'1px solid #f9fafb' }}>
          <div>
            <span style={{ fontSize:12, fontWeight:700, color:'#374151' }}>{zones[activeZone]?.label ?? activeZone}</span>
            <span style={{ fontSize:11, color:'#9ca3af' }}>&nbsp;·&nbsp;{activeSelCnt}/{activeLocs.length} selected</span>
          </div>
          <button type="button" onClick={() => toggleZone(activeZone)} style={S.selectAllBtn}>
            {allActive ? 'Deselect all' : 'Select all'}
          </button>
        </div>
        <div style={{ display:'flex', flexWrap:'wrap', gap:8, padding:'14px', background:'#fff' }}>
          {activeLocs.map(loc => {
            const on = selected.includes(loc);
            return (
              <button key={loc} type="button" onClick={() => toggle(loc)} style={{
                padding:'7px 14px', borderRadius:99, fontSize:13, fontWeight:600, cursor:'pointer',
                display:'inline-flex', alignItems:'center', gap:5, fontFamily:'inherit',
                border: on ? '1.5px solid #dc2626' : '1.5px solid #e5e7eb',
                background: on ? '#fef2f2' : '#fff', color: on ? '#dc2626' : '#4b5563',
              }}>
                {on && <span style={{ fontSize:10 }}>✓</span>}{loc}
              </button>
            );
          })}
        </div>
        {selected.length > 0 && (
          <div style={{ borderTop:'1px solid #f0f2f5', background:'#fef2f2', padding:'10px 14px 12px' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
              <span style={{ fontSize:11, fontWeight:700, color:'#dc2626', textTransform:'uppercase', letterSpacing:'0.4px' }}>
                {selected.length} {selected.length === 1 ? 'locality' : 'localities'} selected
              </span>
              <button type="button" onClick={clearAll} style={{ background:'none', border:'none', fontSize:11, fontWeight:700, color:'#dc2626', cursor:'pointer' }}>Clear all</button>
            </div>
            <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
              {selected.map(loc => (
                <span key={loc} style={{ display:'inline-flex', alignItems:'center', gap:4, padding:'3px 8px 3px 10px', background:'#dc2626', color:'#fff', borderRadius:99, fontSize:11, fontWeight:600 }}>
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

// ── Shared UI ────────────────────────────────────────────────
const Field = ({ label, required, children, style = {} }) => (
  <div style={{ display:'flex', flexDirection:'column', gap:6, ...style }}>
    <label style={S.label}>{label}{required && <span style={{ color:'#dc2626', marginLeft:3 }}>*</span>}</label>
    {children}
  </div>
);

const FocusInput = (props) => {
  const [f, setF] = useState(false);
  return <input style={{ ...S.input, ...(f ? S.inputFocus : {}) }} onFocus={() => setF(true)} onBlur={() => setF(false)} {...props} />;
};

const FocusTextarea = ({ rows = 4, ...props }) => {
  const [f, setF] = useState(false);
  return <textarea rows={rows} style={{ ...S.input, resize:'vertical', ...(f ? S.inputFocus : {}) }} onFocus={() => setF(true)} onBlur={() => setF(false)} {...props} />;
};

const TagSelector = ({ items, selected = [], onChange }) => (
  <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
    {items.map(item => {
      const on = selected.includes(item);
      return (
        <button key={item} type="button"
          onClick={() => onChange(on ? selected.filter(x => x !== item) : [...selected, item])}
          style={{ padding:'7px 18px', borderRadius:99, cursor:'pointer', fontFamily:'inherit',
            border: on ? '1.5px solid #dc2626' : '1.5px solid #e5e7eb',
            background: on ? '#fef2f2' : '#fff', color: on ? '#dc2626' : '#6b7280',
            fontSize:13, fontWeight:600, transition:'all .15s' }}>
          {item}
        </button>
      );
    })}
  </div>
);

const Card = ({ children, style = {} }) => (
  <div style={{ background:'#fff', borderRadius:14, border:'1px solid #f0f2f5', padding:'24px 28px', marginBottom:20, boxShadow:'0 1px 3px rgba(0,0,0,0.04)', ...style }}>
    {children}
  </div>
);

const CardHeader = ({ icon, title, desc }) => (
  <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:22 }}>
    <div style={{ width:38, height:38, borderRadius:10, background:'#fff5f5', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, flexShrink:0 }}>{icon}</div>
    <div>
      <div style={{ fontSize:15, fontWeight:700, color:'#111827' }}>{title}</div>
      {desc && <div style={{ fontSize:12, color:'#9ca3af', marginTop:2 }}>{desc}</div>}
    </div>
  </div>
);

const Toggle = ({ value, onChange, label, sub }) => (
  <div style={{ display:'flex', alignItems:'center', gap:12, cursor:'pointer' }} onClick={() => onChange(!value)}>
    <div style={{ width:44, height:24, borderRadius:99, background: value ? '#dc2626' : '#e5e7eb', position:'relative', transition:'background .2s', flexShrink:0 }}>
      <div style={{ position:'absolute', top:3, left: value ? 23 : 3, width:18, height:18, borderRadius:'50%', background:'#fff', boxShadow:'0 1px 3px rgba(0,0,0,0.2)', transition:'left .2s' }} />
    </div>
    <div>
      <div style={{ fontSize:14, fontWeight:600, color:'#374151' }}>{label}</div>
      <div style={{ fontSize:11, color:'#9ca3af' }}>{sub}</div>
    </div>
  </div>
);

// ── Top Step Bar ─────────────────────────────────────────────
const StepBar = ({ current, onGo }) => (
  <div style={{ display:'flex', alignItems:'center', marginBottom:32 }}>
    {STEPS.map((step, i) => {
      const done   = step.id < current;
      const active = step.id === current;
      return (
        <React.Fragment key={step.id}>
          <div onClick={() => step.id <= current && onGo(step.id)} style={{
            display:'flex', alignItems:'center', gap:10,
            cursor: step.id <= current ? 'pointer' : 'default',
            padding:'10px 20px 10px 14px', borderRadius:10,
            background: active ? '#fef2f2' : done ? '#f0fdf4' : '#f9fafb',
            border: active ? '1.5px solid #fecaca' : done ? '1.5px solid #bbf7d0' : '1.5px solid #e5e7eb',
          }}>
            <div style={{ width:30, height:30, borderRadius:'50%', flexShrink:0,
              display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, fontWeight:800,
              background: active ? '#dc2626' : done ? '#22c55e' : '#e5e7eb',
              color: (active || done) ? '#fff' : '#9ca3af' }}>
              {done ? '✓' : step.id + 1}
            </div>
            <div>
              <div style={{ fontSize:10, fontWeight:600, textTransform:'uppercase', letterSpacing:'0.4px',
                color: active ? '#dc2626' : done ? '#16a34a' : '#9ca3af' }}>Step {step.id + 1}</div>
              <div style={{ fontSize:13, fontWeight:700, color: active ? '#dc2626' : done ? '#15803d' : '#9ca3af' }}>{step.label}</div>
            </div>
          </div>
          {i < STEPS.length - 1 && (
            <div style={{ flex:1, height:2, minWidth:20, background: done ? '#22c55e' : '#e5e7eb', transition:'background .4s' }} />
          )}
        </React.Fragment>
      );
    })}
  </div>
);

// ── Toast ────────────────────────────────────────────────────
const Toast = ({ msg, type }) => (
  <div style={{ position:'fixed', bottom:32, right:32, zIndex:9999,
    background: type === 'success' ? '#16a34a' : '#dc2626',
    color:'#fff', padding:'14px 24px', borderRadius:12, fontSize:14, fontWeight:600,
    boxShadow:'0 8px 24px rgba(0,0,0,0.2)' }}>
    {type === 'success' ? '✓ ' : '✕ '}{msg}
  </div>
);

// ── Styles ───────────────────────────────────────────────────
const S = {
  input: { border:'1.5px solid #e5e7eb', borderRadius:10, padding:'11px 14px', fontSize:14,
    fontFamily:'inherit', background:'#fff', outline:'none', color:'#1f2937',
    transition:'border-color .2s, box-shadow .2s', width:'100%', boxSizing:'border-box' },
  inputFocus: { borderColor:'#dc2626', boxShadow:'0 0 0 3px rgba(220,38,38,0.1)' },
  label: { fontSize:11, fontWeight:700, color:'#6b7280', textTransform:'uppercase', letterSpacing:'0.5px' },
  placeholder: { border:'1.5px solid #e5e7eb', borderRadius:12, padding:24, textAlign:'center', color:'#9ca3af', fontSize:13 },
  selectAllBtn: { background:'none', border:'1px solid #e5e7eb', borderRadius:6, padding:'4px 10px', fontSize:11, fontWeight:600, color:'#6b7280', cursor:'pointer', fontFamily:'inherit' },
};

// ── Main ─────────────────────────────────────────────────────
const AddBroker = () => {
  const [step,         setStep]         = useState(0);
  const [saving,       setSaving]       = useState(false);
  const [toast,        setToast]        = useState(null);
  const [previewUrl,   setPreviewUrl]   = useState(null);
  const [zones,        setZones]        = useState({});
  const [zoneKeys,     setZoneKeys]     = useState([]);
  const [loadingZones, setLoadingZones] = useState(true);
  const fileRef = useRef();

  const [form, setForm] = useState({
    name:'', mobile_number:'', email:'',
    introduction:'', about:'', languages_spoken:[],
    agency_name:'', rera_no:'', city:'',
    year_experience:'', office_address:'',
    locality:[], area:'', service_offered:[],
    success_stories:'', testimonials:'',
    property_listings:'', deals_closed:'', happy_clients:'',
    profileImage: null, active: false, feature: false,
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
          const raw    = item.state;
          const states = Array.isArray(raw) ? raw : (typeof raw === 'string' ? raw.split(',') : []);
          states.forEach(s => { const loc = s.trim(); if (loc && !grouped[zoneName].locs.includes(loc)) grouped[zoneName].locs.push(loc); });
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

  const set    = (key, val) => setForm(prev => ({ ...prev, [key]: val }));
  const handle = e => set(e.target.name, e.target.type === 'checkbox' ? e.target.checked : e.target.value);

  const handleFile = e => {
    const f = e.target.files[0];
    if (!f) return;
    set('profileImage', f);
    setPreviewUrl(URL.createObjectURL(f));
  };

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleSubmit = async () => {
    if (!form.name || !form.mobile_number || !form.email) { showToast('Name, mobile and email are required.', 'error'); setStep(0); return; }
    if (!form.profileImage)                               { showToast('Please upload a profile photo.', 'error');       setStep(0); return; }
    if (form.service_offered.length === 0)                { showToast('Please select at least one service.', 'error');  setStep(1); return; }

    setSaving(true);
    const toArr = raw => JSON.stringify(raw.split(/[\n,]/).map(x => x.trim()).filter(Boolean));
    const data  = new FormData();

    Object.entries(form).forEach(([key, val]) => {
      if (key === 'profileImage') { if (val instanceof File) data.append('profileImage', val); }
      else if (['languages_spoken','service_offered','locality'].includes(key)) data.append(key, JSON.stringify(val));
      else if (['area','success_stories','testimonials'].includes(key)) data.append(key, toArr(val));
      else data.append(key, val ?? '');
    });

    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/addbroker`, data, { withCredentials: true });
      showToast('Broker added successfully!', 'success');
      setForm({ name:'', mobile_number:'', email:'', introduction:'', about:'', languages_spoken:[],
        agency_name:'', rera_no:'', city:'', year_experience:'', office_address:'',
        locality:[], area:'', service_offered:[], success_stories:'', testimonials:'',
        property_listings:'', deals_closed:'', happy_clients:'', profileImage:null, active:false, feature:false });
      setPreviewUrl(null);
      setStep(0);
    } catch (err) {
      showToast(err?.response?.data?.message || 'Failed to add broker.', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div >
      <Sidebar />

      <div className="yb-content">

        {/* Page Header */}
        <div className='bg-white p-4 border-bottom shadow-sm d-flex justify-content-between align-items-center'>
          <div>
            <h4 style={{ fontWeight:700, color:'#111827', margin:0, fontSize:20 }}>Add Broker</h4>
            <small style={{ color:'#9ca3af', fontSize:13 }}>Fill in all details to register a new broker</small>
          </div>
          <a href="/all-broker" className='btn btn-danger px-4 rounded-pill fw-bold'>
            👥 All Brokers
          </a>
        </div>

        {/* Form content */}
        <div style={{ flex:1, overflowY:'auto', padding:'32px 40px' }}>

          {/* Step bar at top */}
          <StepBar current={step} onGo={setStep} />

          {/* ══ STEP 0 — Personal Info ══ */}
          {step === 0 && (
            <>
              <div style={{ marginBottom:28 }}>
                <h2 style={{ fontSize:20, fontWeight:700, color:'#111827', margin:0 }}>Personal Information</h2>
                <p style={{ fontSize:13, color:'#9ca3af', margin:'6px 0 0' }}>Enter the broker's basic contact details, photo, bio and languages.</p>
              </div>

              <Card>
                <CardHeader icon="📸" title="Profile Photo" desc="Displayed on broker listings and public profile" />
                <div style={{ display:'flex', alignItems:'center', gap:24 }}>
                  <div onClick={() => fileRef.current?.click()} style={{ width:88, height:88, borderRadius:'50%', flexShrink:0,
                    background:'#f3f4f6', border:'3px dashed #e5e7eb', display:'flex', alignItems:'center',
                    justifyContent:'center', overflow:'hidden', cursor:'pointer' }}>
                    {previewUrl
                      ? <img src={previewUrl} alt="profile" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                      : <span style={{ fontSize:32 }}>👤</span>}
                  </div>
                  <div>
                    <div style={{ fontSize:14, fontWeight:600, color:'#374151' }}>Click photo to change</div>
                    <div style={{ fontSize:12, color:'#9ca3af', marginTop:2 }}>JPG or PNG, max 5MB. Square crop works best.</div>
                    <label style={{ display:'inline-flex', alignItems:'center', gap:6, marginTop:12,
                      padding:'8px 18px', border:'1.5px solid #e5e7eb', borderRadius:8,
                      fontSize:12, fontWeight:600, color:'#374151', cursor:'pointer', background:'#fff' }}>
                      📁 Browse Photo
                      <input type="file" hidden accept="image/*" ref={fileRef} onChange={handleFile} />
                    </label>
                  </div>
                </div>
              </Card>

              <Card>
                <CardHeader icon="✏️" title="Basic Details" desc="Name, contact info and broker introduction" />
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:18, marginBottom:18 }}>
                  <Field label="Full Name" required><FocusInput name="name" value={form.name} onChange={handle} placeholder="e.g. Ravi Sharma" /></Field>
                  <Field label="Mobile Number" required><FocusInput name="mobile_number" value={form.mobile_number} onChange={handle} placeholder="e.g. 9876543210" /></Field>
                </div>
                <Field label="Email Address" required style={{ marginBottom:18 }}>
                  <FocusInput name="email" type="email" value={form.email} onChange={handle} placeholder="e.g. ravi@example.com" />
                </Field>
                <Field label="Short Introduction" style={{ marginBottom:18 }}>
                  <FocusInput name="introduction" value={form.introduction} onChange={handle} placeholder="e.g. Senior property consultant with 8+ years in Chennai" />
                </Field>
                <Field label="About">
                  <FocusTextarea name="about" value={form.about} onChange={handle} rows={4} placeholder="Tell clients about expertise, approach, and what makes this broker different…" />
                </Field>
              </Card>

              <Card>
                <CardHeader icon="🌐" title="Languages Spoken" desc="Select all languages the broker speaks" />
                <TagSelector items={LANGUAGES} selected={form.languages_spoken} onChange={val => set('languages_spoken', val)} />
              </Card>

              <Card>
                <CardHeader icon="⚙️" title="Broker Status" desc="Control visibility and featured placement" />
                <div style={{ display:'flex', gap:40 }}>
                  <Toggle value={form.active}  onChange={v => set('active', v)}  label="Active"   sub="Broker visible to clients" />
                  <Toggle value={form.feature} onChange={v => set('feature', v)} label="Featured" sub="Show in featured section"  />
                </div>
              </Card>
            </>
          )}

          {/* ══ STEP 1 — Company Info ══ */}
          {step === 1 && (
            <>
              <div style={{ marginBottom:28 }}>
                <h2 style={{ fontSize:20, fontWeight:700, color:'#111827', margin:0 }}>Company Information</h2>
                <p style={{ fontSize:13, color:'#9ca3af', margin:'6px 0 0' }}>Agency details, areas of operation and services offered.</p>
              </div>

              <Card>
                <CardHeader icon="🏢" title="Agency Details" desc="Official firm information shown on profile" />
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:18, marginBottom:18 }}>
                  <Field label="Agency / Firm Name"><FocusInput name="agency_name" value={form.agency_name} onChange={handle} placeholder="e.g. Sharma Realty Pvt. Ltd." /></Field>
                  <Field label="RERA Registration No."><FocusInput name="rera_no" value={form.rera_no} onChange={handle} placeholder="e.g. TN-RERA-P12345" /></Field>
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:18, marginBottom:18 }}>
                  <Field label="City"><FocusInput name="city" value={form.city} onChange={handle} placeholder="e.g. Chennai" /></Field>
                  <Field label="Years of Experience"><FocusInput name="year_experience" type="number" value={form.year_experience} onChange={handle} placeholder="e.g. 8" min={0} /></Field>
                </div>
                <Field label="Office Address">
                  <FocusTextarea name="office_address" value={form.office_address} onChange={handle} rows={3} placeholder="Full office address with pincode…" />
                </Field>
              </Card>

              <Card>
                <CardHeader icon="📍" title="Areas of Operation" desc="Select zone then pick the localities served" />
                <div style={{ marginBottom:18 }}>
                  <label style={{ ...S.label, display:'block', marginBottom:10 }}>Localities</label>
                  <AreasOfOperation selected={form.locality} onChange={val => set('locality', val)} zones={zones} zoneKeys={zoneKeys} loadingZones={loadingZones} />
                </div>
                <Field label="Micro-Markets / Areas" style={{ marginTop:4 }}>
                  <FocusInput name="area" value={form.area} onChange={handle} placeholder="e.g. Sholinganallur IT corridor, Perungudi tech park" />
                </Field>
              </Card>

              <Card>
                <CardHeader icon="🏷️" title="Services Offered" desc="Select all that apply — clients search by service type" />
                <TagSelector items={SERVICES} selected={form.service_offered} onChange={val => set('service_offered', val)} />
              </Card>
            </>
          )}

          {/* ══ STEP 2 — Professional Details ══ */}
          {step === 2 && (
            <>
              <div style={{ marginBottom:28 }}>
                <h2 style={{ fontSize:20, fontWeight:700, color:'#111827', margin:0 }}>Professional Details</h2>
                <p style={{ fontSize:13, color:'#9ca3af', margin:'6px 0 0' }}>Build credibility with track record, testimonials and stats.</p>
              </div>

              <Card>
                <CardHeader icon="🏆" title="Success Stories" desc="One achievement per line — shown as bullets on profile" />
                <Field label="Key Achievements">
                  <FocusTextarea name="success_stories" value={form.success_stories} onChange={handle} rows={5}
                    placeholder={'Closed a ₹2.5 Cr deal in Adyar in under 30 days\nHelped 50+ families find dream homes in 2024'} />
                </Field>
              </Card>

              <Card>
                <CardHeader icon="⭐" title="Client Testimonials" desc="One quote per line — shown in a scrollable section" />
                <Field label="Testimonials">
                  <FocusTextarea name="testimonials" value={form.testimonials} onChange={handle} rows={5}
                    placeholder={'"Ravi helped us find our perfect 3BHK in just 2 weeks." — Priya K.'} />
                </Field>
              </Card>

              <Card>
                <CardHeader icon="📊" title="Stats & Figures" desc="Numbers shown prominently on public profile card" />
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:18 }}>
                  <Field label="Properties Listed"><FocusInput name="property_listings" type="number" value={form.property_listings} onChange={handle} placeholder="e.g. 24"  min={0} /></Field>
                  <Field label="Deals Closed">     <FocusInput name="deals_closed"      type="number" value={form.deals_closed}      onChange={handle} placeholder="e.g. 180" min={0} /></Field>
                  <Field label="Happy Clients">    <FocusInput name="happy_clients"     type="number" value={form.happy_clients}     onChange={handle} placeholder="e.g. 350" min={0} /></Field>
                </div>
              </Card>
            </>
          )}

          {/* Footer Actions */}
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', paddingTop:20, borderTop:'1px solid #f0f2f5' }}>
            {step > 0
              ? <button type="button" onClick={() => setStep(s => s - 1)} style={{ padding:'11px 24px', borderRadius:10, border:'1.5px solid #e5e7eb', background:'#fff', fontSize:14, fontWeight:600, color:'#374151', cursor:'pointer', fontFamily:'inherit' }}>← Back</button>
              : <div />}
            {step < 2
              ? <button type="button" onClick={() => setStep(s => s + 1)} style={{ padding:'11px 28px', borderRadius:10, border:'none', background:'#dc2626', fontSize:14, fontWeight:700, color:'#fff', cursor:'pointer', fontFamily:'inherit' }}>
                  Continue to {STEPS[step + 1].label} →
                </button>
              : <button type="button" onClick={handleSubmit} disabled={saving} style={{ padding:'11px 28px', borderRadius:10, border:'none', background: saving ? '#fca5a5' : '#dc2626', fontSize:14, fontWeight:700, color:'#fff', cursor: saving ? 'not-allowed' : 'pointer', fontFamily:'inherit', transition:'background .2s' }}>
                  {saving ? 'Adding Broker…' : 'Add Broker ✓'}
                </button>}
          </div>

        </div>
      </div>

      {toast && <Toast msg={toast.msg} type={toast.type} />}
    </div>
  );
};

export default AddBroker;