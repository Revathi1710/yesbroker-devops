import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Header from './Header';
import Footer from './Footer';

/* ─── helpers ──────────────────────────────────────────────────────────────── */

// ✅ FIX 1: Fallback so API is never "undefined"
const API = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

const formatPrice = (price) => {
  if (!price && price !== 0) return '—';
  if (price >= 10000000) return `₹${(price / 10000000).toFixed(2)} Cr`;
  if (price >= 100000)   return `₹${(price / 100000).toFixed(2)} L`;
  return `₹${price.toLocaleString('en-IN')}`;
};

const BADGE = {
  Sell:       { label: 'For Sale',   bg: '#16a34a' },
  Rent:       { label: 'For Rent',   bg: '#2563eb' },
  PG:         { label: 'PG',         bg: '#7c3aed' },
  Commercial: { label: 'Commercial', bg: '#d97706' },
  Plot:       { label: 'Plot',       bg: '#0891b2' },
};

const Skeleton = ({ w = '100%', h = 20, r = 6, mb = 0 }) => (
  <div style={{
    width: w, height: h, borderRadius: r, marginBottom: mb,
    background: 'linear-gradient(90deg,#f0f0f0 25%,#e0e0e0 50%,#f0f0f0 75%)',
    backgroundSize: '200% 100%',
    animation: 'shimmer 1.4s infinite',
  }} />
);

/* ─── Component ────────────────────────────────────────────────────────────── */
const PropertyDetails = () => {
  const { id }   = useParams();
  const navigate = useNavigate();

  const [property,    setProperty]    = useState(null);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState(null);
  const [activePhoto, setActivePhoto] = useState(0);
  const [lightbox,    setLightbox]    = useState(false);
  const [toast,       setToast]       = useState('');

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        setLoading(true);
        setError(null);
        // ✅ FIX 2: Correct URL — API base only, no frontend location mixed in
        // Result: GET http://localhost:5000/api/properties/propertyview/69f2ff2...
        const { data } = await axios.get(`${API}/api/propertyview/${id}`);
        setProperty(data.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load property.');
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchProperty();
  }, [id]);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const handleCall = () => {
    if (property?.broker?.mobile_number) window.open(`tel:${property.broker.mobile_number}`);
    showToast('✓ Connecting you with the broker…');
  };
  const handleView = () => {
 
    navigate(`/brokers/${property?.broker?.slug}`)


  };
  const handleWhatsApp = () => {
    const msg = encodeURIComponent(`Hi, I'm interested in this property: ${window.location.href}`);
    const num = property?.broker?.mobile_number?.replace(/\D/g, '');
    if (num) window.open(`https://wa.me/91${num}?text=${msg}`, '_blank');
    else showToast('Broker number not available.');
  };

  const handleShare = async () => {
    if (navigator.share) {
      try { await navigator.share({ title: 'YESBROKER Property', url: window.location.href }); } catch (_) {}
    } else {
      await navigator.clipboard.writeText(window.location.href);
      showToast('🔗 Link copied to clipboard!');
    }
  };

  const prevPhoto = (e) => { e.stopPropagation(); setActivePhoto(p => (p - 1 + (property.photos?.length || 1)) % (property.photos?.length || 1)); };
  const nextPhoto = (e) => { e.stopPropagation(); setActivePhoto(p => (p + 1) % (property.photos?.length || 1)); };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes shimmer  { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
        @keyframes fadeUp   { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:none} }
        @keyframes fadeIn   { from{opacity:0} to{opacity:1} }
        @keyframes slideUp  { from{opacity:0;transform:translate(-50%,12px)} to{opacity:1;transform:translate(-50%,0)} }
        .pd-wrap { max-width:1120px; margin:0 auto; padding:28px 16px 72px; animation:fadeUp .45s ease both; }
        .pd-crumb { display:flex; align-items:center; gap:6px; font-size:13px; color:#6b7280; margin-bottom:22px; flex-wrap:wrap; }
        .pd-crumb-link { cursor:pointer; transition:color .18s; }
        .pd-crumb-link:hover { color:#e02020; }
        .pd-hero { display:grid; grid-template-columns:1fr 340px; gap:24px; margin-bottom:32px; align-items:start; }
        @media(max-width:860px) { .pd-hero { grid-template-columns:1fr; } }
        .pd-gallery { display:flex; flex-direction:column; gap:10px; }
        .pd-main-img { width:100%; aspect-ratio:16/9; border-radius:16px; overflow:hidden; background:#e5e7eb; cursor:zoom-in; position:relative; }
        .pd-main-img img { width:100%; height:100%; object-fit:cover; transition:transform .4s ease; display:block; }
        .pd-main-img:hover img { transform:scale(1.04); }
        .pd-img-counter { position:absolute; bottom:12px; right:14px; background:rgba(0,0,0,.55); color:#fff; font-size:12px; padding:4px 10px; border-radius:20px; backdrop-filter:blur(4px); pointer-events:none; }
        .pd-thumbs { display:flex; gap:8px; overflow-x:auto; padding-bottom:4px; }
        .pd-thumbs::-webkit-scrollbar { height:3px; }
        .pd-thumbs::-webkit-scrollbar-thumb { background:#d1d5db; border-radius:2px; }
        .pd-thumb { flex-shrink:0; width:80px; height:60px; border-radius:9px; overflow:hidden; cursor:pointer; border:2.5px solid transparent; transition:border-color .2s,transform .15s; }
        .pd-thumb:hover { transform:scale(1.05); }
        .pd-thumb.on { border-color:#e02020; }
        .pd-thumb img { width:100%; height:100%; object-fit:cover; display:block; }
        .pd-no-img { width:100%; aspect-ratio:16/9; border-radius:16px; background:linear-gradient(135deg,#f3f4f6,#e5e7eb); display:flex; flex-direction:column; align-items:center; justify-content:center; color:#9ca3af; gap:10px; font-size:15px; }
        .pd-card { background:#fff; border-radius:18px; padding:26px; box-shadow:0 2px 20px rgba(0,0,0,.08); position:sticky; top:88px; }
        .pd-price { font-family:'DM Serif Display',serif; font-size:34px; color:#e02020; line-height:1.1; margin-bottom:3px; }
        .pd-price-sub { font-size:13px; color:#6b7280; margin-bottom:22px; }
        .pd-broker-box { display:flex; align-items:center; gap:12px; padding:14px; background:#f9fafb; border-radius:11px; margin-bottom:20px; }
        .pd-broker-av { width:46px; height:46px; border-radius:50%; background:linear-gradient(135deg,#e02020,#ff6565); display:flex; align-items:center; justify-content:center; color:#fff; font-weight:700; font-size:19px; flex-shrink:0; }
        .pd-broker-name { font-weight:600; font-size:15px; line-height:1.2; }
        .pd-broker-lbl { font-size:12px; color:#9ca3af; }
        .pd-btn { display:flex; align-items:center; justify-content:center; gap:8px; width:100%; padding:13px; border-radius:11px; font-size:15px; font-weight:600; cursor:pointer; border:none; transition:all .2s; margin-bottom:10px; font-family:inherit; }
        .pd-btn:last-child { margin-bottom:0; }
        .pd-btn-red { background:#e02020; color:#fff; }
         .pd-btn-blue { background:#0058ff; color:#fff; }
        .pd-btn-red:hover { background:#c91a1a; transform:translateY(-1px); box-shadow:0 5px 16px rgba(224,32,32,.3); }
        .pd-btn-wa { background:#25d366; color:#fff; }
        .pd-btn-wa:hover { background:#1cb854; transform:translateY(-1px); box-shadow:0 5px 16px rgba(37,211,102,.3); }
        .pd-btn-out { background:transparent; color:#374151; border:1.5px solid #d1d5db; }
        .pd-btn-out:hover { border-color:#e02020; color:#e02020; }
        .pd-badges { display:flex; align-items:center; gap:8px; flex-wrap:wrap; margin-bottom:10px; }
        .pd-badge { display:inline-flex; align-items:center; padding:4px 13px; border-radius:20px; font-size:12px; font-weight:600; color:#fff; letter-spacing:.3px; }
        .pd-status { display:inline-flex; align-items:center; gap:5px; padding:4px 12px; border-radius:20px; font-size:12px; font-weight:600; }
        .pd-status.active { background:#dcfce7; color:#16a34a; }
        .pd-status.sold { background:#fee2e2; color:#dc2626; }
        .pd-status.rented { background:#dbeafe; color:#2563eb; }
        .pd-title { font-family:'DM Serif Display',serif; font-size:27px; line-height:1.25; margin-bottom:10px; }
        .pd-location { display:flex; align-items:center; gap:6px; color:#6b7280; font-size:14px; flex-wrap:wrap; margin-bottom:26px; }
        .pd-loc-link { color:#e02020; cursor:pointer; }
        .pd-loc-link:hover { opacity:.75; }
        .pd-stats { display:grid; grid-template-columns:repeat(auto-fit,minmax(120px,1fr)); gap:12px; margin-bottom:30px; }
        .pd-stat { background:#fff; border-radius:13px; padding:18px 14px; box-shadow:0 1px 8px rgba(0,0,0,.06); text-align:center; }
        .pd-stat-icon { font-size:24px; margin-bottom:7px; }
        .pd-stat-val { font-weight:700; font-size:16px; margin-bottom:3px; word-break:break-word; }
        .pd-stat-lbl { font-size:11px; color:#9ca3af; text-transform:uppercase; letter-spacing:.5px; }
        .pd-sec { margin-bottom:30px; }
        .pd-sec-title { font-family:'DM Serif Display',serif; font-size:20px; margin-bottom:13px; }
        .pd-desc-text { font-size:15px; line-height:1.8; color:#374151; white-space:pre-line; }
        .pd-tags { display:flex; flex-wrap:wrap; gap:8px; }
        .pd-tag { background:#f3f4f6; border-radius:20px; padding:6px 15px; font-size:13px; color:#374151; cursor:pointer; transition:background .15s; }
        .pd-tag:hover { background:#fee2e2; color:#e02020; }
        .pd-lb { position:fixed; inset:0; background:rgba(0,0,0,.93); display:flex; align-items:center; justify-content:center; z-index:9999; animation:fadeIn .2s; }
        .pd-lb img { max-width:90vw; max-height:86vh; border-radius:10px; object-fit:contain; }
        .pd-lb-x { position:absolute; top:18px; right:22px; color:#fff; font-size:30px; cursor:pointer; opacity:.8; line-height:1; transition:opacity .2s; }
        .pd-lb-x:hover { opacity:1; }
        .pd-lb-arr { position:absolute; top:50%; transform:translateY(-50%); color:#fff; font-size:40px; cursor:pointer; opacity:.65; padding:0 18px; user-select:none; transition:opacity .2s; }
        .pd-lb-arr:hover { opacity:1; }
        .pd-toast { position:fixed; bottom:28px; left:50%; transform:translateX(-50%); background:#1a1a1a; color:#fff; padding:12px 26px; border-radius:30px; font-size:14px; font-weight:500; z-index:9998; animation:slideUp .3s ease; white-space:nowrap; box-shadow:0 4px 24px rgba(0,0,0,.25); }
        .pd-err { text-align:center; padding:80px 20px; }
        .pd-err-icon { font-size:52px; margin-bottom:14px; }
        .pd-err-title { font-family:'DM Serif Display',serif; font-size:28px; margin-bottom:10px; }
        .pd-err-sub { color:#6b7280; margin-bottom:28px; font-size:15px; }
        .pd-err-btn { display:inline-flex; align-items:center; gap:6px; padding:12px 30px; background:#e02020; color:#fff; border:none; border-radius:10px; font-size:15px; font-weight:600; cursor:pointer; font-family:inherit; }
        .pd-err-btn:hover { background:#c91a1a; }
      `}</style>

      <Header />

      {lightbox && property?.photos?.length > 0 && (
        <div className="pd-lb" onClick={() => setLightbox(false)}>
          <span className="pd-lb-x" onClick={() => setLightbox(false)}>✕</span>
          <span className="pd-lb-arr" style={{ left:0 }} onClick={prevPhoto}>‹</span>
          <img src={property.photos[activePhoto]} alt="Property" onClick={e => e.stopPropagation()} />
          <span className="pd-lb-arr" style={{ right:0 }} onClick={nextPhoto}>›</span>
        </div>
      )}

      {toast && <div className="pd-toast">{toast}</div>}

      <main className="pd-wrap">

        <nav className="pd-crumb">
          <span className="pd-crumb-link" onClick={() => navigate('/')}>Home</span>
          <span style={{ color:'#d1d5db' }}>/</span>
          {loading ? <Skeleton w={200} h={13} /> : property && (
            <>
              <span className="pd-crumb-link" onClick={() => navigate(`/${property.listingType?.toLowerCase()}`)}>
                {property.listingType}
              </span>
              <span style={{ color:'#d1d5db' }}>/</span>
              <span style={{ color:'#1a1a1a', fontWeight:500 }}>
                {property.propertyType} in {property.localities?.[0]}
              </span>
            </>
          )}
        </nav>

        {loading && (
          <div>
            <div className="pd-hero">
              <div>
                <Skeleton w="100%" h={360} r={16} mb={10} />
                <div style={{ display:'flex', gap:8 }}>
                  {[1,2,3].map(i => <Skeleton key={i} w={80} h={60} r={9} />)}
                </div>
              </div>
              <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                <Skeleton w="100%" h={180} r={18} />
                <Skeleton w="100%" h={46} r={11} />
                <Skeleton w="100%" h={46} r={11} />
                <Skeleton w="100%" h={46} r={11} />
              </div>
            </div>
            <div className="pd-stats">{[1,2,3,4].map(i => <Skeleton key={i} h={92} r={13} />)}</div>
          </div>
        )}

        {!loading && error && (
          <div className="pd-err">
            <div className="pd-err-icon">🏚️</div>
            <div className="pd-err-title">Property Not Found</div>
            <div className="pd-err-sub">{error}</div>
            <button className="pd-err-btn" onClick={() => navigate('/')}>← Back to Home</button>
          </div>
        )}

        {!loading && property && (() => {
          const photos      = property.photos?.filter(Boolean) || [];
          const badgeInfo   = BADGE[property.listingType] || { label: property.listingType, bg: '#6b7280' };
          const statusClass = property.status?.toLowerCase();
          const initial     = property.broker?.name?.[0]?.toUpperCase() || 'B';
          const listedDate  = property.createdAt
            ? new Date(property.createdAt).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })
            : '—';

          return (
            <>
              <div className="pd-hero">
                <div className="pd-gallery">
                  {photos.length > 0 ? (
                    <>
                      <div className="pd-main-img" onClick={() => setLightbox(true)}>
                        <img src={photos[activePhoto]} alt="Property" />
                        <span className="pd-img-counter">📷 {activePhoto + 1} / {photos.length}</span>
                      </div>
                      {photos.length > 1 && (
                        <div className="pd-thumbs">
                          {photos.map((url, i) => (
                            <div key={i} className={`pd-thumb${i === activePhoto ? ' on' : ''}`} onClick={() => setActivePhoto(i)}>
                              <img src={url} alt={`photo ${i+1}`} />
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="pd-no-img">
                      <span style={{ fontSize:52 }}>🏠</span>
                      <span>No photos available</span>
                    </div>
                  )}
                </div>

                <div>
                  <div className="pd-card">
                    <div className="pd-price">{formatPrice(property.price)}</div>
                    <div className="pd-price-sub">{property.size} sq.ft · {property.localities?.join(', ')}</div>
                    {property.broker && (
                      <div className="pd-broker-box">
                        <div className="pd-broker-av">{initial}</div>
                        <div>
                          <div className="pd-broker-name">{property.broker.name}</div>
                          <div className="pd-broker-lbl">{property.broker.mobile_number || 'Listed Broker'}</div>
                        </div>
                      </div>
                    )}
                    <button className="pd-btn pd-btn-red" onClick={handleCall}>📞 Contact Broker</button>
                    <button className="pd-btn pd-btn-wa" onClick={handleWhatsApp}>
                      <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                      </svg>
                      WhatsApp Broker
                    </button>
                                       <button className="pd-btn pd-btn-blue" onClick={handleView}>👀 View Broker</button>
                    <button className="pd-btn pd-btn-out" onClick={handleShare}>🔗 Share Property</button>
  
                  </div>
                </div>
              </div>

              <div>
                <div className="pd-badges">
                  <span className="pd-badge" style={{ background: badgeInfo.bg }}>{badgeInfo.label}</span>
                  <span className={`pd-status ${statusClass}`}>
                    {statusClass === 'active' ? '🟢' : statusClass === 'sold' ? '🔴' : '🔵'} {property.status}
                  </span>
                </div>
                <h1 className="pd-title">
                  {property.propertyType} for {property.listingType} in {property.localities?.[0]}
                </h1>
                <div className="pd-location">
                  <span>📍</span>
                  {property.localities?.map((loc, i) => (
                    <React.Fragment key={i}>
                      <span className="pd-loc-link"
                        onClick={() => navigate(`/${property.listingType?.toLowerCase()}?locality=${encodeURIComponent(loc)}`)}>
                        {loc}
                      </span>
                      {i < property.localities.length - 1 && <span style={{ color:'#d1d5db' }}>·</span>}
                    </React.Fragment>
                  ))}
                </div>
                <div className="pd-stats">
                  {[
                    { icon:'💰', val: formatPrice(property.price), lbl:'Price' },
                    { icon:'📐',  val: property.size ? `${property.size} (Sq.ft)` : '—',         lbl:'Size' },
                    { icon:'🏷️', val: property.propertyType,       lbl:'Type' },
                    { icon:'📅', val: listedDate,                  lbl:'Listed On' },
                  ].map(({ icon, val, lbl }) => (
                    <div className="pd-stat" key={lbl}>
                      <div className="pd-stat-icon">{icon}</div>
                      <div className="pd-stat-val">{val}</div>
                      <div className="pd-stat-lbl">{lbl}</div>
                    </div>
                  ))}
                </div>
                {property.description && (
                  <div className="pd-sec">
                    <h2 className="pd-sec-title">About this Property</h2>
                    <p className="pd-desc-text">{property.description}</p>
                  </div>
                )}
                {property.localities?.length > 0 && (
                  <div className="pd-sec">
                    <h2 className="pd-sec-title">Localities</h2>
                    <div className="pd-tags">
                      {property.localities.map((loc, i) => (
                        <span key={i} className="pd-tag"
                          onClick={() => navigate(`/${property.listingType?.toLowerCase()}?locality=${encodeURIComponent(loc)}`)}>
                          📍 {loc}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {photos.length > 1 && (
                  <div className="pd-sec">
                    <h2 className="pd-sec-title">All Photos</h2>
                    <div className="pd-tags">
                      {photos.map((_, i) => (
                        <span key={i} className="pd-tag"
                          onClick={() => { setActivePhoto(i); window.scrollTo({ top:0, behavior:'smooth' }); }}>
                          🖼️ Photo {i + 1}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </>
          );
        })()}
      </main>

      <Footer />
    </>
  );
};

export default PropertyDetails;