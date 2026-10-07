import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import Header from '../components/Header';
import {
  Phone, Mail, MapPin, Star, Award, Home, Clock,
  Globe, CheckCircle, Building2,
  MessageCircle, Share2, ShieldCheck, IndianRupee,
  Copy, Quote,
} from 'lucide-react';

const BRAND = {
  red: '#ef4444',
  redDark: '#dc2626',
  navy: '#0F172A',
  navy2: '#1E293B',
  bg: '#F8FAFC',
  border: '#E2E8F0',
  text: '#0F172A',
  muted: '#64748B',
  soft: '#F1F5F9',
};

const BrokerView = () => {
  const { slug } = useParams();
  const [broker, setBroker] = useState(null);
  const [properties, setProperties] = useState([]);
  const [stories, setStories] = useState([]);
  const [activeTab, setActiveTab] = useState('properties');
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 640);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [brokerRes, propsRes, storiesRes] = await Promise.all([
          axios.get(`${import.meta.env.VITE_API_URL}/brokers/${slug}`),
          axios.get(`${import.meta.env.VITE_API_URL}/brokers/${slug}/properties`),
          axios.get(`${import.meta.env.VITE_API_URL}/brokers/${slug}/success-stories`),
        ]);
        setBroker(brokerRes.data);
        setProperties(propsRes.data);
        setStories(storiesRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [slug]);

  if (loading) return <LoadingScreen />;
  if (!broker) return <NotFound />;

  const totalRevenue = stories.reduce((acc, c) => acc + (c.totalRevenue || 0), 0);
  const totalSold = stories.reduce((acc, c) => acc + (c.totalPropertiesSold || 0), 0);

  const pageUrl = typeof window !== 'undefined' ? window.location.href : '';
  const shareText = `Check out ${broker.name} on YesBroker — ${broker.year_experience}+ yrs experience. ${pageUrl}`;
  const waLink = `https://wa.me/?text=${encodeURIComponent(shareText)}`;

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(pageUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch (e) {}
  };

  const maxLocs = isMobile ? 3 : 5;
  const visibleLocs = broker.locality?.slice(0, maxLocs) || [];
  const extraLocs = (broker.locality?.length || 0) - maxLocs;

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", background: BRAND.bg, minHeight: '100vh', overflowX: 'hidden' }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;0,9..40,800&family=Playfair+Display:wght@700&display=swap" rel="stylesheet" />
      <Header />

      <style>{`
        *, *::before, *::after { box-sizing: border-box; }

        /* ── LAYOUT ── */
        .yb-main-grid { display: grid; grid-template-columns: 1fr 340px; gap: 28px; }
        .yb-stats-grid { display: grid; grid-template-columns: repeat(4,1fr); }
        .yb-props-grid { display: grid; gap: 16px; grid-template-columns: repeat(auto-fill,minmax(240px,1fr)); }
        .yb-testimonials-grid { display: grid; gap: 14px; grid-template-columns: repeat(auto-fill,minmax(260px,1fr)); }

        /* ── HERO ── */
        .yb-hero-pad { padding: 56px 0 44px; width: 100%; }
        .yb-hero-inner { max-width: 1200px; margin: 0 auto; padding: 0 20px; width: 100%; position: relative; z-index: 2; }
        .yb-avatar-wrap { width: 140px; height: 140px; border-radius: 50%; background: linear-gradient(135deg,#ef4444,#f59e0b); padding: 3px; flex-shrink: 0; }
        .yb-hero-name { font-size: clamp(24px,5vw,44px); word-break: break-word; }

        /* ── LOCATIONS ── */
        .yb-hero-locs { display: flex; flex-wrap: wrap; justify-content: center; gap: 8px 14px; width: 100%; max-width: 560px; margin: 0 auto; }
        .yb-loc-chip { display: inline-flex; align-items: center; gap: 4px; font-size: 13px; opacity: 0.85; white-space: nowrap; }

        /* ── TABS ── */
        .yb-tabs-row { display: flex; gap: 0; padding: 0 20px; border-bottom: 1px solid ${BRAND.border}; overflow-x: auto; -webkit-overflow-scrolling: touch; scrollbar-width: none; }
        .yb-tabs-row::-webkit-scrollbar { display: none; }

        /* ── ASIDE ── */
        .yb-aside { position: sticky; top: 70px; align-self: start; display: flex; flex-direction: column; gap: 16px; }
        .yb-aside-contact-mobile { display: none; }

        /* ── BUTTONS ── */
        .yb-btn-primary {
          background: ${BRAND.red}; color: #fff; padding: 12px 20px; border-radius: 50px;
          font-weight: 700; text-decoration: none; display: inline-flex; align-items: center; gap: 8px;
          box-shadow: 0 6px 16px rgba(239,68,68,0.32); transition: transform .15s, box-shadow .15s;
          border: none; cursor: pointer; font-size: 14px; white-space: nowrap;
        }
        .yb-btn-primary:hover { transform: translateY(-1px); box-shadow: 0 10px 20px rgba(239,68,68,0.42); }
        .yb-btn-ghost {
          background: rgba(255,255,255,0.1); color: #fff; padding: 12px 20px; border-radius: 50px;
          font-weight: 700; text-decoration: none; display: inline-flex; align-items: center; gap: 8px;
          border: 1px solid rgba(255,255,255,0.22); font-size: 14px; white-space: nowrap;
          transition: background .15s;
        }
        .yb-btn-ghost:hover { background: rgba(255,255,255,0.18); }

        /* ── SHARE BTN ── */
        .yb-share-btn {
          width: 36px; height: 36px; border-radius: 50%;
          display: inline-flex; align-items: center; justify-content: center;
          background: rgba(255,255,255,0.12); color: #fff; border: 1px solid rgba(255,255,255,0.22);
          cursor: pointer; transition: background .15s; flex-shrink: 0; text-decoration: none;
        }
        .yb-share-btn:hover { background: rgba(255,255,255,0.24); }

        /* ── MISC ── */
        .yb-card { background: #fff; border-radius: 18px; border: 1px solid ${BRAND.border}; box-shadow: 0 1px 2px rgba(15,23,42,0.04); }
        .yb-tab {
          padding: 14px 16px; background: none; border: none; cursor: pointer;
          font-size: 13px; font-weight: 700; color: #94A3B8;
          border-bottom: 3px solid transparent; text-transform: uppercase; letter-spacing: 0.5px;
          transition: color .15s, border-color .15s; white-space: nowrap; flex-shrink: 0;
        }
        .yb-tab.active { color: ${BRAND.red}; border-bottom-color: ${BRAND.red}; }
        .yb-chip { background: ${BRAND.soft}; color: ${BRAND.text}; padding: 6px 12px; border-radius: 999px; font-size: 12px; font-weight: 600; display: inline-flex; align-items: center; gap: 6px; }
        .yb-prop-card { transition: transform .2s, box-shadow .2s; overflow: hidden; }
        .yb-prop-card:hover { transform: translateY(-3px); box-shadow: 0 14px 30px rgba(15,23,42,0.08); }
        .yb-stat-item { border-right: 1px solid ${BRAND.soft}; }
        .yb-stat-item:last-child { border-right: none; }
        .yb-hero-cta { display: flex; gap: 10px; flex-wrap: wrap; justify-content: center; }

        /* ══════════════════════════════════════
           TABLET  ≤ 960px
        ══════════════════════════════════════ */
        @media (max-width: 960px) {
          .yb-main-grid { grid-template-columns: 1fr; }
          .yb-aside { position: static; }
          .yb-aside-desktop { display: none !important; }
          .yb-aside-contact-mobile { display: flex !important; }
        }

        /* ══════════════════════════════════════
           MOBILE  ≤ 640px
        ══════════════════════════════════════ */
        @media (max-width: 640px) {
          .yb-hero-pad { padding: 32px 0 24px !important; }
          .yb-hero-inner { padding: 0 16px !important; }
          .yb-avatar-wrap { width: 88px !important; height: 88px !important; }
          .yb-hero-name { font-size: 22px !important; line-height: 1.2; }
          .yb-loc-chip { font-size: 11px !important; }
          .yb-hero-cta { display: none !important; }

          .yb-stats-grid { grid-template-columns: repeat(2,1fr) !important; }
          .yb-stat-item { border-right: none !important; border-bottom: none !important; }
          .yb-stat-item:nth-child(1) { border-right: 1px solid ${BRAND.soft} !important; border-bottom: 1px solid ${BRAND.soft} !important; }
          .yb-stat-item:nth-child(2) { border-bottom: 1px solid ${BRAND.soft} !important; }
          .yb-stat-item:nth-child(3) { border-right: 1px solid ${BRAND.soft} !important; }
          .yb-stat-val { font-size: 17px !important; }
          .yb-stat-pad { padding: 16px 10px !important; }

          .yb-main-wrap { padding: 0 12px !important; margin-top: 16px !important; }
          .yb-bottom-space { padding-bottom: 80px !important; }
          .yb-card { border-radius: 14px !important; }
          .yb-props-grid { grid-template-columns: 1fr !important; }
          .yb-testimonials-grid { grid-template-columns: 1fr !important; }
          .yb-section-pad { padding: 16px !important; }
          .yb-tabs-inner-pad { padding: 14px !important; }
          .yb-tab { font-size: 11px !important; padding: 12px 12px !important; letter-spacing: 0.3px; }
          .yb-section-title { font-size: 17px !important; }
          .yb-story-card-inner { flex-direction: column !important; }
          .yb-story-icon { width: 40px !important; height: 40px !important; }
          .yb-aside { gap: 12px; }
          .yb-mobile-contact-bar { display: flex !important; }
        }

        /* ── MOBILE STICKY CONTACT BAR ── */
        .yb-mobile-contact-bar {
          display: none;
          position: fixed; bottom: 0; left: 0; right: 0;
          background: #fff; border-top: 1px solid ${BRAND.border};
          padding: 8px 12px; gap: 8px; z-index: 1000;
          box-shadow: 0 -4px 20px rgba(15,23,42,0.10);
        }
        .yb-mobile-contact-bar a {
          flex: 1; padding: 11px 6px; border-radius: 12px;
          font-weight: 700; font-size: 13px; text-decoration: none;
          display: flex; align-items: center; justify-content: center; gap: 5px;
        }
      `}</style>

      {/* ── HERO ── */}
      <div className="yb-hero-pad" style={{
        background: `radial-gradient(900px 360px at 80% -10%, rgba(239,68,68,0.18), transparent 60%), linear-gradient(135deg, ${BRAND.navy} 0%, ${BRAND.navy2} 100%)`,
        position: 'relative', color: '#fff', width: '100%',
      }}>
        <div style={{ position: 'absolute', top: -60, left: -60, width: 260, height: 260, borderRadius: '50%', background: 'rgba(239,68,68,0.05)', pointerEvents: 'none' }} />

        <div className="yb-hero-inner">
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 14 }}>

            {/* Share row — inline (never absolute, prevents overflow) */}
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
              <a href={waLink} target="_blank" rel="noreferrer" className="yb-share-btn" title="Share on WhatsApp">
                <MessageCircle size={15} />
              </a>
              <button onClick={copyLink} className="yb-share-btn" title="Copy link">
                {copied ? <CheckCircle size={15} /> : <Copy size={15} />}
              </button>
            </div>

            {/* Avatar */}
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <div className="yb-avatar-wrap">
                <img
                  src={broker.profileImage}
                  alt={broker.name}
                  style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover', border: `3px solid ${BRAND.navy}`, display: 'block' }}
                />
              </div>
              <div style={{ position: 'absolute', bottom: 4, right: 4, background: '#22c55e', padding: 5, borderRadius: '50%', border: `3px solid ${BRAND.navy}` }}>
                <ShieldCheck size={13} color="white" />
              </div>
            </div>

            {/* Verified badge */}
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: 'rgba(34,197,94,0.15)', color: '#86efac', padding: '4px 14px', borderRadius: 999, fontSize: 11, fontWeight: 700, letterSpacing: 0.5 }}>
              <CheckCircle size={11} /> VERIFIED BROKER
            </div>

            {/* Name */}
            <h1 className="yb-hero-name" style={{ fontFamily: "'Playfair Display', serif", margin: 0, lineHeight: 1.15, maxWidth: '100%' }}>
              {broker.name}
            </h1>

            {/* Location chips — capped to prevent overflow */}
            <div className="yb-hero-locs">
              {visibleLocs.map((loc, i) => (
                <span key={i} className="yb-loc-chip"><MapPin size={12} /> {loc}</span>
              ))}
              {extraLocs > 0 && <span className="yb-loc-chip" style={{ opacity: 0.65 }}>+{extraLocs} more</span>}
              <span className="yb-loc-chip"><Clock size={12} /> {broker.year_experience} Yrs Exp.</span>
            </div>

            {/* CTA — hidden on mobile, sticky bar handles it */}
            <div className="yb-hero-cta" style={{ marginTop: 4 }}>
              <a href={`tel:${broker.mobile_number}`} className="yb-btn-primary">
                <Phone size={15} /> Call Now
              </a>
              <a href={`https://wa.me/${(broker.mobile_number || '').replace(/\D/g, '')}`} target="_blank" rel="noreferrer" className="yb-btn-ghost">
                <MessageCircle size={15} /> WhatsApp
              </a>
              <a href={`mailto:${broker.email}`} className="yb-btn-ghost">
                <Mail size={15} /> Email
              </a>
            </div>

          </div>
        </div>
      </div>

      {/* ── STATS BAR ── */}
      <div style={{ background: '#fff', borderBottom: `1px solid ${BRAND.border}` }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px' }}>
          <div className="yb-stats-grid">
            <StatBox icon={<Building2 size={18} />}  label="Listings"        value={broker.property_listings || properties.length} />
            <StatBox icon={<Award size={18} />}       label="Properties Sold" value={totalSold} />
            <StatBox icon={<IndianRupee size={18} />} label="Total Revenue"   value={`₹${totalRevenue.toLocaleString('en-IN')}`} />
            <StatBox icon={<Globe size={18} />}       label="Languages"       value={broker.languages_spoken?.length || 0} last />
          </div>
        </div>
      </div>

      {/* ── MAIN CONTENT ── */}
      <div className="yb-main-wrap yb-bottom-space" style={{ maxWidth: 1200, margin: '28px auto 0', padding: '0 20px' }}>
        <div className="yb-main-grid">

          {/* LEFT COLUMN */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20, minWidth: 0 }}>

            {/* Profile */}
            <Section title="Professional Profile">
              {broker.introduction && (
                <p style={{ color: '#475569', lineHeight: 1.7, fontSize: 15, margin: '0 0 10px' }}>{broker.introduction}</p>
              )}
              {broker.about && (
                <p style={{ color: '#475569', lineHeight: 1.7, fontSize: 15, margin: 0 }}>{broker.about}</p>
              )}
              {broker.service_offered?.length > 0 && (
                <>
                  <div style={{ height: 1, background: BRAND.soft, margin: '16px 0' }} />
                  <div style={{ fontSize: 11, fontWeight: 700, color: BRAND.muted, letterSpacing: 0.7, marginBottom: 10 }}>SERVICES OFFERED</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {broker.service_offered.map((s, i) => (
                      <span key={i} className="yb-chip"><CheckCircle size={11} color={BRAND.red} /> {s}</span>
                    ))}
                  </div>
                </>
              )}
            </Section>

            {/* Tabs */}
            <div className="yb-card" style={{ padding: 0, overflow: 'hidden' }}>
              <div className="yb-tabs-row">
                {[
                  { id: 'properties',      label: 'Properties',      count: properties.length },
                  { id: 'success-stories', label: 'Success Stories',  count: stories.length },
                  { id: 'testimonials',    label: 'Testimonials',     count: broker.testimonials?.length || 0 },
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`yb-tab ${activeTab === tab.id ? 'active' : ''}`}
                  >
                    {tab.label}
                    <span style={{ marginLeft: 5, background: activeTab === tab.id ? BRAND.red : BRAND.soft, color: activeTab === tab.id ? '#fff' : BRAND.muted, fontSize: 10, padding: '2px 7px', borderRadius: 999, fontWeight: 700 }}>
                      {tab.count}
                    </span>
                  </button>
                ))}
              </div>

              <div className="yb-tabs-inner-pad" style={{ padding: 20 }}>
                {activeTab === 'properties' && (
                  properties.length === 0
                    ? <EmptyState icon={<Home size={26} />} title="No properties listed yet" />
                    : <div className="yb-props-grid">{properties.map(p => <PropertyCard key={p._id} property={p} />)}</div>
                )}
                {activeTab === 'success-stories' && (
                  stories.length === 0
                    ? <EmptyState icon={<Award size={26} />} title="No success stories yet" />
                    : <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>{stories.map(s => <StoryCard key={s._id} story={s} />)}</div>
                )}
                {activeTab === 'testimonials' && (
                  !broker.testimonials?.length
                    ? <EmptyState icon={<Quote size={26} />} title="No testimonials yet" />
                    : <div className="yb-testimonials-grid">{broker.testimonials.map((t, i) => <TestimonialCard key={i} text={t} />)}</div>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT — STICKY ASIDE (desktop only) */}
          <aside className="yb-aside yb-aside-desktop" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <QuickContactCard broker={broker} copied={copied} copyLink={copyLink} />
            {broker.area?.length > 0 && <ServiceAreasCard areas={broker.area} />}
            {broker.languages_spoken?.length > 0 && <LanguagesCard langs={broker.languages_spoken} />}
            <TrustBlock />
          </aside>

          {/* TABLET ASIDE — below left column (641–960px) */}
          <div className="yb-aside-contact-mobile" style={{ flexDirection: 'column', gap: 16 }}>
            <QuickContactCard broker={broker} copied={copied} copyLink={copyLink} />
            {broker.area?.length > 0 && <ServiceAreasCard areas={broker.area} />}
            {broker.languages_spoken?.length > 0 && <LanguagesCard langs={broker.languages_spoken} />}
            <TrustBlock />
          </div>

        </div>
      </div>

      {/* ── MOBILE STICKY CONTACT BAR ── */}
      <div className="yb-mobile-contact-bar">
        <a href={`tel:${broker.mobile_number}`} style={{ background: BRAND.red, color: '#fff' }}>
          <Phone size={15} /> Call
        </a>
        <a href={`https://wa.me/${(broker.mobile_number || '').replace(/\D/g, '')}`} target="_blank" rel="noreferrer" style={{ background: '#25D366', color: '#fff' }}>
          <MessageCircle size={15} /> WhatsApp
        </a>
        <a href={`mailto:${broker.email}`} style={{ background: BRAND.soft, color: BRAND.text, border: `1px solid ${BRAND.border}` }}>
          <Mail size={15} /> Email
        </a>
      </div>
    </div>
  );
};

/* ─── SUB-COMPONENTS ─────────────────────────────────── */

const QuickContactCard = ({ broker, copied, copyLink }) => {
  const waLink = `https://wa.me/${(broker.mobile_number || '').replace(/\D/g, '')}`;
  return (
    <div className="yb-card" style={{ padding: 20, width: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <img src={broker.profileImage} alt="" style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover', border: `2px solid ${BRAND.border}`, flexShrink: 0 }} />
        <div style={{ minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: 14, color: BRAND.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{broker.name}</div>
          <div style={{ fontSize: 12, color: BRAND.muted, display: 'flex', alignItems: 'center', gap: 4 }}>
            <Star size={11} color="#f59e0b" fill="#f59e0b" /> Trusted Broker
          </div>
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <a href={`tel:${broker.mobile_number}`} className="yb-btn-primary" style={{ justifyContent: 'center', width: '100%' }}>
          <Phone size={15} /> Call {broker.mobile_number}
        </a>
        <a href={waLink} target="_blank" rel="noreferrer" style={{ background: '#25D366', color: '#fff', padding: '11px 16px', borderRadius: 50, fontWeight: 700, textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontSize: 14 }}>
          <MessageCircle size={15} /> WhatsApp
        </a>
        <a href={`mailto:${broker.email}`} style={{ background: '#fff', color: BRAND.text, padding: '11px 16px', borderRadius: 50, fontWeight: 700, textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontSize: 14, border: `1px solid ${BRAND.border}` }}>
          <Mail size={15} /> Send Email
        </a>
      </div>
      <div style={{ height: 1, background: BRAND.soft, margin: '16px 0' }} />
      <button onClick={copyLink} style={{ width: '100%', padding: '9px 12px', borderRadius: 10, border: `1px dashed ${BRAND.border}`, background: BRAND.bg, color: BRAND.muted, fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, cursor: 'pointer' }}>
        {copied ? <><CheckCircle size={13} color="#22c55e" /> Link copied!</> : <><Share2 size={13} /> Share this profile</>}
      </button>
    </div>
  );
};

const ServiceAreasCard = ({ areas }) => (
  <div className="yb-card" style={{ padding: 20, width: '100%' }}>
    <h3 style={{ fontSize: 14, fontWeight: 700, margin: '0 0 12px', color: BRAND.text }}>Service Areas</h3>
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
      {areas.map((a, i) => (
        <span key={i} style={{ background: BRAND.bg, color: BRAND.muted, padding: '5px 10px', borderRadius: 6, fontSize: 12, border: `1px solid ${BRAND.border}`, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
          <MapPin size={10} /> {a}
        </span>
      ))}
    </div>
  </div>
);

const LanguagesCard = ({ langs }) => (
  <div className="yb-card" style={{ padding: 20, width: '100%' }}>
    <h3 style={{ fontSize: 14, fontWeight: 700, margin: '0 0 10px', color: BRAND.text }}>Languages Spoken</h3>
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
      {langs.map((l, i) => (
        <span key={i} className="yb-chip" style={{ background: '#FEF2F2', color: BRAND.redDark }}>
          <Globe size={11} /> {l}
        </span>
      ))}
    </div>
  </div>
);

const TrustBlock = () => (
  <div className="yb-card" style={{ padding: 20, background: `linear-gradient(135deg, ${BRAND.navy}, ${BRAND.navy2})`, color: '#fff', border: 'none', width: '100%' }}>
    <ShieldCheck size={24} color="#22c55e" />
    <h4 style={{ fontSize: 14, fontWeight: 700, margin: '10px 0 6px' }}>Verified by YesBroker</h4>
    <p style={{ fontSize: 12.5, color: '#cbd5e1', margin: 0, lineHeight: 1.55 }}>
      This broker's identity, license, and contact details have been verified by our team.
    </p>
  </div>
);

const StatBox = ({ icon, label, value, last }) => (
  <div className={`yb-stat-item yb-stat-pad${last ? ' last' : ''}`} style={{ padding: '20px 14px', textAlign: 'center' }}>
    <div style={{ color: BRAND.red, marginBottom: 6, display: 'flex', justifyContent: 'center' }}>{icon}</div>
    <div className="yb-stat-val" style={{ fontSize: 19, fontWeight: 700, color: BRAND.navy }}>{value}</div>
    <div style={{ fontSize: 10, color: '#94A3B8', textTransform: 'uppercase', fontWeight: 700, letterSpacing: 0.5, marginTop: 2 }}>{label}</div>
  </div>
);

const Section = ({ title, children }) => (
  <div className="yb-card yb-section-pad" style={{ padding: 22 }}>
    <h2 className="yb-section-title" style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, color: BRAND.navy, margin: '0 0 14px' }}>{title}</h2>
    {children}
  </div>
);

const PropertyCard = ({ property }) => (
  <div className="yb-prop-card yb-card" style={{ padding: 0, borderRadius: 14 }}>
    <div style={{ position: 'relative' }}>
      <img src={property.photos?.[0]} alt="" style={{ width: '100%', height: 160, objectFit: 'cover', display: 'block' }} />
      {property.status && (
        <span style={{ position: 'absolute', top: 8, left: 8, background: 'rgba(15,23,42,0.82)', color: '#fff', padding: '3px 9px', borderRadius: 999, fontSize: 11, fontWeight: 700 }}>{property.status}</span>
      )}
      {property.listingType && (
        <span style={{ position: 'absolute', top: 8, right: 8, background: property.listingType === 'Rent' ? '#7c3aed' : BRAND.red, color: '#fff', padding: '3px 9px', borderRadius: 999, fontSize: 11, fontWeight: 700 }}>{property.listingType}</span>
      )}
    </div>
    <div style={{ padding: 14 }}>
      <div style={{ fontSize: 17, fontWeight: 700, color: BRAND.navy }}>₹{property.price?.toLocaleString('en-IN')}</div>
      <div style={{ fontSize: 13, color: BRAND.muted, marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
        <MapPin size={12} /> {property.localities?.join(', ')}
      </div>
      <div style={{ marginTop: 10, paddingTop: 10, borderTop: `1px solid ${BRAND.soft}`, fontSize: 12, color: '#475569', display: 'flex', justifyContent: 'space-between' }}>
        <span>{property.size}</span>
        <span style={{ fontWeight: 600 }}>{property.propertyType}</span>
      </div>
    </div>
  </div>
);

const StoryCard = ({ story }) => (
  <div className="yb-card" style={{ padding: 16 }}>
    <div className="yb-story-card-inner" style={{ display: 'flex', gap: 14 }}>
      <div className="yb-story-icon" style={{ width: 52, height: 52, background: '#FEF2F2', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Award size={24} color={BRAND.red} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, flexWrap: 'wrap' }}>
          <h4 style={{ margin: 0, fontWeight: 700, fontSize: 14, color: BRAND.navy }}>{story.title}</h4>
          {story.dealValue && (
            <span style={{ fontSize: 12, fontWeight: 700, color: '#16a34a', background: '#DCFCE7', padding: '3px 9px', borderRadius: 999, whiteSpace: 'nowrap', flexShrink: 0 }}>
              ₹{story.dealValue.toLocaleString('en-IN')}
            </span>
          )}
        </div>
        {story.shortSummary && <p style={{ fontSize: 13, color: BRAND.muted, margin: '6px 0 8px', lineHeight: 1.55 }}>{story.shortSummary}</p>}
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', fontSize: 11, color: '#94A3B8' }}>
          {story.location && <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><MapPin size={11} /> {story.location}</span>}
          {story.timeTaken && <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Clock size={11} /> {story.timeTaken}</span>}
        </div>
      </div>
    </div>
  </div>
);

const TestimonialCard = ({ text }) => (
  <div className="yb-card" style={{ padding: 16 }}>
    <Quote size={20} color={BRAND.red} style={{ opacity: 0.22, marginBottom: 6 }} />
    <p style={{ fontSize: 14, color: '#334155', lineHeight: 1.6, margin: 0 }}>
      {typeof text === 'string' ? text : text?.message || text?.text}
    </p>
    {typeof text !== 'string' && text?.author && (
      <div style={{ marginTop: 10, paddingTop: 10, borderTop: `1px solid ${BRAND.soft}`, fontSize: 12, fontWeight: 700, color: BRAND.navy }}>— {text.author}</div>
    )}
  </div>
);

const EmptyState = ({ icon, title }) => (
  <div style={{ padding: '36px 16px', textAlign: 'center', color: BRAND.muted, background: BRAND.bg, borderRadius: 12, border: `1px dashed ${BRAND.border}` }}>
    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8, color: '#94A3B8' }}>{icon}</div>
    <div style={{ fontSize: 14, fontWeight: 600 }}>{title}</div>
  </div>
);

const LoadingScreen = () => (
  <div style={{ minHeight: '100vh', background: BRAND.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <div style={{ width: 34, height: 34, border: `3px solid ${BRAND.border}`, borderTopColor: BRAND.red, borderRadius: '50%', animation: 'ybspin 0.8s linear infinite' }} />
    <style>{`@keyframes ybspin { to { transform: rotate(360deg); } }`}</style>
  </div>
);

const NotFound = () => (
  <div style={{ minHeight: '100vh', background: BRAND.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: 20 }}>
    <div>
      <div style={{ fontSize: 48, marginBottom: 8 }}>🔍</div>
      <h2 style={{ color: BRAND.navy, margin: '0 0 6px' }}>Broker not found</h2>
      <p style={{ color: BRAND.muted, margin: 0 }}>The profile you're looking for doesn't exist.</p>
    </div>
  </div>
);

export default BrokerView;