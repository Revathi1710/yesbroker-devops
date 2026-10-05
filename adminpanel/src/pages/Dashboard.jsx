import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import {
  Users, Building2, Gem, IndianRupee, ArrowUpRight, ArrowDownRight,
  Plus, Download, MapPin, Star, MoreHorizontal, ArrowRight,
  UserPlus, PlusSquare, Image as ImageIcon, Clock, Sparkles,
  CheckCircle2, XCircle, HousePlus, ShieldCheck,
} from 'lucide-react';

// ─────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const AVATAR_COLORS = ['#1a335d','#ef4444','#0ea5a4','#f59e0b','#7c3aed'];

const ICONS = {
  brokers:    <Users size={18} />,
  properties: <Building2 size={18} />,
  subs:       <Gem size={18} />,
  revenue:    <IndianRupee size={18} />,
};

const ACT_META = {
  broker:   { icon: <UserPlus    size={15} />, color: '#1a335d' },
  property: { icon: <HousePlus   size={15} />, color: '#0ea5a4' },
  pro:      { icon: <Gem         size={15} />, color: '#f59e0b' },
  deal:     { icon: <CheckCircle2 size={15} />, color: '#16a34a' },
  banner:   { icon: <ImageIcon   size={15} />, color: '#7c3aed' },
  remove:   { icon: <XCircle     size={15} />, color: '#ef4444' },
};

// ─────────────────────────────────────────────────────────────
// FALLBACK DATA (shown while loading or on API error)
// ─────────────────────────────────────────────────────────────

const DEFAULT_STATS = [
  { label: 'Total Brokers',        value: '—', delta: '—',    up: true,  key: 'brokers',    accent: '#1a335d' },
  { label: 'Total Properties',     value: '—', delta: '—',    up: true,  key: 'properties', accent: '#0ea5a4' },
  { label: 'Active Subscriptions', value: '—', delta: '—',    up: true,  key: 'subs',       accent: '#f59e0b' },
  { label: 'Revenue (MTD)',        value: '—', delta: '—',    up: false, key: 'revenue',    accent: '#ef4444' },
];

const DEFAULT_CHART        = Array(12).fill(0);
const DEFAULT_TOP_BROKERS  = [];
const DEFAULT_RECENT_PROPS = [];
const DEFAULT_ACTIVITY     = [];

// ─────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────

const Dashboard = () => {
  const [dashData,  setDashData]  = useState(null);   // null = not yet loaded
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState(null);
  const [period,    setPeriod]    = useState('Month');

  // ── Fetch ──────────────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const apiUrl = import.meta.env.VITE_API_URL;
        if (!apiUrl) throw new Error('VITE_API_URL is not set');
        const res = await axios.get(`${apiUrl}/dashboard-summary`, { withCredentials: true });
        if (res.data?.success) {
          setDashData(res.data);
        } else {
          throw new Error('API returned success:false');
        }
      } catch (err) {
        console.error('Dashboard fetch error:', err);
        setError(err.message);
        setDashData(null);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // ── Derived state ──────────────────────────────────────────

  // Stats: use API data if available, fall back to defaults
  const stats = useMemo(() => {
    if (!dashData?.stats?.length) return DEFAULT_STATS;
    return dashData.stats.map(s => ({
      label:  s.label,
      value:  s.value,
      delta:  s.delta,
      up:     s.up,
      key:    s.key   || 'brokers',
      accent: s.accent || '#1a335d',
    }));
  }, [dashData]);

  // Chart bars
  const chartData = useMemo(() => {
    const raw = dashData?.chartData;
    return Array.isArray(raw) && raw.length === 12 ? raw : DEFAULT_CHART;
  }, [dashData]);
  const maxBar = Math.max(...chartData, 1);

  // Top brokers
  const topBrokers = useMemo(() => {
    const list = dashData?.topBrokers;
    if (!Array.isArray(list) || list.length === 0) return DEFAULT_TOP_BROKERS;
    return list.map((b, i) => ({
      name:    b.name   || 'Broker',
      city: b.locality?.[0] || b.area?.[0] || b.city || '—',
      deals:   b.deals  ?? b.deals_closed ?? b.dealsClosed ?? 0,
      rating:  typeof b.rating === 'number' ? b.rating : 4.5,
      initial: (b.name || '?').charAt(0).toUpperCase(),
      color:   AVATAR_COLORS[i % AVATAR_COLORS.length],
    }));
  }, [dashData]);

  // Recent properties
  const recentProperties = useMemo(() => {
    const list = dashData?.recentProperties;
    if (!Array.isArray(list) || list.length === 0) return DEFAULT_RECENT_PROPS;
    return list.map(p => ({
      id:       p.id       || `#${(p._id || '').toString().slice(-4).toUpperCase()}`,
      title:    p.title    || 'Property',
      location: p.location || p.city || '—',
      price:    p.price    || '—',
      type:     p.type     || p.listingType || 'Sale',
      status:   p.status   || 'Active',
    }));
  }, [dashData]);

  // Activity feed
  const activity = useMemo(() => {
    const list = dashData?.activity;
    return Array.isArray(list) && list.length > 0 ? list : DEFAULT_ACTIVITY;
  }, [dashData]);

  // ── Loading screen ─────────────────────────────────────────
  if (loading) return (
    <div>
      <Sidebar />
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=Playfair+Display:wght@700&display=swap" rel="stylesheet" />
      <style>{styles}</style>
      <div className="yb-content yb-loading">
        <div className="yb-loader">
          <span className="yb-spin dark" />
          <h6>Loading Dashboard…</h6>
          <p>Fetching the latest insights for you</p>
        </div>
      </div>
    </div>
  );

  // ── Main render ────────────────────────────────────────────
  return (
    <div>
      <Sidebar />
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=Playfair+Display:wght@700&display=swap" rel="stylesheet" />
      <style>{styles}</style>

      <div className="yb-content">

        {/* Error banner */}
        {error && (
          <div className="yb-error-banner">
            ⚠ Could not load live data ({error}). Showing placeholder values.
          </div>
        )}

        {/* ── Header ── */}
        <div className="yb-page-head">
          <div className="yb-page-head-inner">
            <div className="yb-crumbs">
              <span className="active">Dashboard</span>
            </div>
            <div className="yb-head-row">
              <div>
                <h4 className="yb-title">Welcome back, Admin</h4>
                <p className="yb-subtitle">Here's what's happening with YesBroker today.</p>
              </div>
              <div className="yb-head-actions">
                <div className="yb-period">
                  {['Week','Month','Year'].map(p => (
                    <button
                      key={p}
                      className={`yb-period-btn ${period === p ? 'active' : ''}`}
                      onClick={() => setPeriod(p)}
                    >{p}</button>
                  ))}
                </div>
                <button className="yb-btn yb-btn-ghost">
                  <Download size={14}/> Export
                </button>
                <a href="/add-property" className="yb-btn yb-btn-primary">
                  <Plus size={14}/> Add Property
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="yb-body">

          {/* ── Stats ── */}
          <div className="yb-stats-grid">
            {stats.map((s, i) => (
              <div className="yb-stat-card" key={s.label}>
                <div className="yb-stat-top">
                  <div className="yb-stat-ic" style={{ background: `${s.accent}15`, color: s.accent }}>
                    {ICONS[s.key] || <Sparkles size={18}/>}
                  </div>
                  <span className={`yb-delta ${s.up ? 'up' : 'down'}`}>
                    {s.up
                      ? <ArrowUpRight   size={11}/>
                      : <ArrowDownRight size={11}/>
                    }
                    {s.delta}
                  </span>
                </div>
                <div className="yb-stat-label">{s.label}</div>
                <div className="yb-stat-value">{s.value}</div>
                <div className="yb-stat-sub">vs. last month</div>
                <div className="yb-stat-bar">
                  <div
                    className="yb-stat-bar-fill"
                    style={{
                      width:      `${60 + i * 8}%`,
                      background: `linear-gradient(90deg, ${s.accent}, ${s.accent}80)`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* ── Chart + Top Brokers ── */}
          <div className="yb-grid-8-4">

            {/* Bar chart */}
            <div className="yb-card">
              <div className="yb-card-head">
                <div>
                  <h6 className="yb-card-title">Property Listings Overview</h6>
                  <p className="yb-card-sub">Monthly listings added in {new Date().getFullYear()}</p>
                </div>
                <div className="yb-legend">
                  <span className="yb-legend-dot"/> Listings
                </div>
              </div>
              <div className="yb-chart">
                {chartData.map((v, i) => (
                  <div className="yb-bar-wrap" key={i}>
                    <div className="yb-bar-tip">{v}</div>
                    <div
                      className="yb-bar"
                      style={{ height: `${(v / maxBar) * 180}px` }}
                      title={`${MONTHS[i]}: ${v}`}
                    />
                    <span className="yb-bar-label">{MONTHS[i]}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Top brokers */}
            <div className="yb-card">
              <div className="yb-card-head">
                <div>
                  <h6 className="yb-card-title">Top Brokers</h6>
                  <p className="yb-card-sub">Best performers this month</p>
                </div>
                <a href="/all-broker" className="yb-link-more">View all <ArrowRight size={12}/></a>
              </div>

              {topBrokers.length === 0 ? (
                <p className="yb-empty">No broker data yet.</p>
              ) : (
                <div className="yb-broker-list">
                  {topBrokers.slice(0, 5).map((b, i) => (
                    <div className="yb-broker-row" key={`${b.name}-${i}`}>
                      <div className="yb-rank">{i + 1}</div>
                      <div className="yb-broker-avatar" style={{ background: b.color }}>
                        {b.initial}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div className="yb-broker-name">{b.name}</div>
                        <div className="yb-broker-meta"><MapPin size={10}/> {b.city}</div>
                      </div>
                      <div className="yb-broker-side">
                        <div className="yb-broker-deals">{b.deals}</div>
                        <div className="yb-broker-rating">
                          <Star size={10} fill="#f59e0b" stroke="#f59e0b"/>
                          {b.rating}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ── Quick Actions ── */}
          <div className="yb-quick-grid">
            {[
              { icon: <UserPlus   size={18}/>, title: 'Add Broker',    sub: 'Onboard a new agent',     accent: '#1a335d', href: '/add-broker'      },
              { icon: <PlusSquare size={18}/>, title: 'List Property', sub: 'Create a new listing',    accent: '#0ea5a4', href: '/add-property'    },
              { icon: <Gem        size={18}/>, title: 'Plans',         sub: 'Manage subscriptions',    accent: '#f59e0b', href: '/plans'           },
              { icon: <ImageIcon  size={18}/>, title: 'Banners',       sub: 'Update homepage banners', accent: '#ef4444', href: '/banner-setting'  },
            ].map(q => (
              <a className="yb-quick" key={q.title} href={q.href}>
                <div className="yb-quick-ic" style={{ background: `${q.accent}15`, color: q.accent }}>
                  {q.icon}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="yb-quick-title">{q.title}</div>
                  <div className="yb-quick-sub">{q.sub}</div>
                </div>
                <ArrowRight size={14} className="yb-quick-arr"/>
              </a>
            ))}
          </div>

          {/* ── Recent Properties + Activity ── */}
          <div className="yb-grid-8-4">

            {/* Recent properties table */}
            <div className="yb-card">
              <div className="yb-card-head">
                <div>
                  <h6 className="yb-card-title">Recent Properties</h6>
                  <p className="yb-card-sub">Latest listings added to the platform</p>
                </div>
                <a href="/all-property" className="yb-link-more">View all <ArrowRight size={12}/></a>
              </div>

              {recentProperties.length === 0 ? (
                <p className="yb-empty">No properties listed yet.</p>
              ) : (
                <div className="yb-table-wrap">
                  <table className="yb-table">
                    <thead>
                      <tr>
                        <th>Property</th>
                        <th>Price</th>
                        <th>Type</th>
                        <th>Status</th>
                        <th className="ta-r"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentProperties.map(p => (
                        <tr key={p.id}>
                          <td>
                            <div className="yb-prop-title">{p.title}</div>
                            <div className="yb-prop-loc">
                              <MapPin size={10}/> {p.location}
                              <span className="yb-prop-id">{p.id}</span>
                            </div>
                          </td>
                          <td className="yb-fw">{p.price}</td>
                          <td>
                            <span className={`yb-pill ${p.type === 'Sale' ? 'pill-sale' : 'pill-rent'}`}>
                              {p.type}
                            </span>
                          </td>
                          <td>
                            <span className={`yb-pill ${
                              p.status === 'Active'  ? 'pill-active'
                            : p.status === 'Pending' ? 'pill-pending'
                            : 'pill-sold'
                            }`}>
                              {p.status}
                            </span>
                          </td>
                          <td className="ta-r">
                            <button className="yb-icon-btn"><MoreHorizontal size={14}/></button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Activity feed */}
            <div className="yb-card">
              <div className="yb-card-head">
                <div>
                  <h6 className="yb-card-title">Recent Activity</h6>
                  <p className="yb-card-sub">Latest events on the platform</p>
                </div>
                <a href="#" className="yb-link-more">All</a>
              </div>

              {activity.length === 0 ? (
                <p className="yb-empty">No recent activity.</p>
              ) : (
                <div className="yb-act-list">
                  {activity.map((a, i) => {
                    const meta = ACT_META[a.type] || { icon: <Sparkles size={15}/>, color: '#1a335d' };
                    return (
                      <div className="yb-act-row" key={i}>
                        <div className="yb-act-ic" style={{ background: `${meta.color}15`, color: meta.color }}>
                          {meta.icon}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div className="yb-act-text">
                            {a.text} {a.strong && <strong>{a.strong}</strong>} {a.action}
                          </div>
                          <div className="yb-act-time"><Clock size={10}/> {a.time}</div>
                        </div>
                      </div>
                    );
                  })}
                  <div className="yb-act-foot">
                    <ShieldCheck size={12}/> Live feed · auto-updates every minute
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>{/* .yb-body */}
      </div>{/* .yb-content */}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────────────────────

const styles = `
  .yb-content { font-family:'DM Sans', sans-serif; background:#F6F7FB; min-height:100vh; }

  .yb-error-banner {
    background:#fef2f2; border-bottom:1px solid #fecaca; color:#b91c1c;
    padding:10px 28px; font-size:13px; font-weight:500;
  }

  /* Header */
  .yb-page-head { background:#fff; border-bottom:1px solid #ECEFF4; }
  .yb-page-head-inner { padding:18px 28px 22px; }
  .yb-crumbs { display:flex; flex-wrap:wrap; align-items:center; gap:6px; font-size:12px; color:#94A3B8; margin-bottom:8px; }
  .yb-crumbs .active { color:#1a335d; font-weight:600; }
  .yb-head-row { display:flex; align-items:center; justify-content:space-between; gap:16px; flex-wrap:wrap; }
  .yb-title { font-family:'Playfair Display', serif; font-size:26px; color:#1a335d; margin:0; }
  .yb-subtitle { font-size:13.5px; color:#64748B; margin:4px 0 0; }
  .yb-head-actions { display:flex; gap:10px; flex-wrap:wrap; align-items:center; }

  /* Period toggle */
  .yb-period { display:inline-flex; padding:4px; border:1px solid #E2E8F0; border-radius:10px; background:#F8FAFC; }
  .yb-period-btn {
    border:none; background:transparent; padding:6px 14px; border-radius:7px;
    font-size:12.5px; font-weight:600; color:#64748B; cursor:pointer; font-family:inherit; transition:all .15s;
  }
  .yb-period-btn:hover { color:#1a335d; }
  .yb-period-btn.active { background:#fff; color:#1a335d; box-shadow:0 2px 6px rgba(15,23,42,.08); }

  /* Buttons */
  .yb-btn { display:inline-flex; align-items:center; gap:8px; padding:10px 16px; border-radius:10px;
    font-size:13px; font-weight:600; cursor:pointer; border:1px solid transparent;
    text-decoration:none; transition:all .15s; white-space:nowrap; font-family:inherit; }
  .yb-btn-primary { background:linear-gradient(135deg,#ef4444,#dc2626); color:#fff; box-shadow:0 8px 18px rgba(239,68,68,.28); }
  .yb-btn-primary:hover { transform:translateY(-1px); box-shadow:0 12px 22px rgba(239,68,68,.34); color:#fff; }
  .yb-btn-ghost { background:#fff; color:#334155; border-color:#E2E8F0; }
  .yb-btn-ghost:hover { background:#F8FAFC; color:#1a335d; }
  .yb-spin { width:14px; height:14px; border-radius:50%; border:2px solid rgba(255,255,255,.4); border-top-color:#fff; animation:ybspin .7s linear infinite; }
  .yb-spin.dark { border-color:rgba(15,23,42,.15); border-top-color:#1a335d; width:30px; height:30px; border-width:3px; }
  @keyframes ybspin { to { transform:rotate(360deg); } }

  /* Loading */
  .yb-loading { display:flex; align-items:center; justify-content:center; min-height:100vh; }
  .yb-loader { text-align:center; }
  .yb-loader h6 { font-size:16px; font-weight:700; color:#1a335d; margin:14px 0 4px; }
  .yb-loader p  { font-size:13px; color:#64748B; margin:0; }

  /* Empty state */
  .yb-empty { font-size:13px; color:#94A3B8; padding:24px; text-align:center; margin:0; }

  /* Body */
  .yb-body { padding:24px 28px; display:flex; flex-direction:column; gap:18px; max-width:1400px; }

  /* Stats */
  .yb-stats-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:16px; }
  @media (max-width:1100px) { .yb-stats-grid { grid-template-columns:repeat(2,1fr); } }
  @media (max-width:560px)  { .yb-stats-grid { grid-template-columns:1fr; } }

  .yb-stat-card {
    background:#fff; border:1px solid #ECEFF4; border-radius:16px; padding:20px;
    box-shadow:0 1px 2px rgba(15,23,42,.03); transition:all .15s; display:flex; flex-direction:column;
  }
  .yb-stat-card:hover { transform:translateY(-2px); box-shadow:0 12px 24px rgba(15,23,42,.06); }
  .yb-stat-top { display:flex; align-items:flex-start; justify-content:space-between; margin-bottom:14px; }
  .yb-stat-ic { width:42px; height:42px; border-radius:12px; display:inline-flex; align-items:center; justify-content:center; }
  .yb-delta { display:inline-flex; align-items:center; gap:3px; font-size:11.5px; font-weight:700; padding:4px 9px; border-radius:99px; }
  .yb-delta.up   { background:rgba(22,163,74,.12); color:#16a34a; }
  .yb-delta.down { background:rgba(239,68,68,.12); color:#dc2626; }
  .yb-stat-label { font-size:12px; font-weight:600; color:#64748B; text-transform:uppercase; letter-spacing:.4px; }
  .yb-stat-value { font-size:26px; font-weight:800; color:#1a335d; margin:6px 0 2px; letter-spacing:-.5px; font-family:'Playfair Display', serif; }
  .yb-stat-sub   { font-size:11.5px; color:#94A3B8; }
  .yb-stat-bar   { margin-top:14px; height:5px; border-radius:99px; background:#F1F5F9; overflow:hidden; }
  .yb-stat-bar-fill { height:100%; border-radius:99px; transition:width .4s; }

  /* Card */
  .yb-card { background:#fff; border:1px solid #ECEFF4; border-radius:16px; padding:22px; box-shadow:0 1px 2px rgba(15,23,42,.03); height:100%; }
  .yb-card-head { display:flex; align-items:flex-start; justify-content:space-between; gap:12px; margin-bottom:18px; flex-wrap:wrap; }
  .yb-card-title { font-size:15px; font-weight:700; color:#1a335d; margin:0; }
  .yb-card-sub   { font-size:12px; color:#64748B; margin:2px 0 0; }
  .yb-link-more  { display:inline-flex; align-items:center; gap:4px; color:#ef4444; text-decoration:none; font-size:12.5px; font-weight:600; }
  .yb-link-more:hover { color:#dc2626; }
  .yb-legend { display:inline-flex; align-items:center; gap:6px; font-size:12px; color:#64748B; font-weight:500; }
  .yb-legend-dot { width:8px; height:8px; border-radius:50%; background:linear-gradient(135deg,#ef4444,#dc2626); display:inline-block; }

  .yb-grid-8-4 { display:grid; grid-template-columns:8fr 4fr; gap:18px; }
  @media (max-width:1100px) { .yb-grid-8-4 { grid-template-columns:1fr; } }

  /* Chart */
  .yb-chart { display:flex; align-items:flex-end; justify-content:space-between; height:230px; gap:10px; padding-top:18px; }
  .yb-bar-wrap { flex:1; display:flex; flex-direction:column; align-items:center; gap:8px; position:relative; }
  .yb-bar-tip {
    position:absolute; top:-22px;
    background:#1a335d; color:#fff; font-size:10px; font-weight:700; padding:3px 6px; border-radius:6px;
    opacity:0; pointer-events:none; transition:opacity .15s;
  }
  .yb-bar-wrap:hover .yb-bar-tip { opacity:1; }
  .yb-bar {
    width:100%; max-width:30px; border-radius:8px 8px 4px 4px;
    background:linear-gradient(180deg,#ef4444 0%,#dc2626 60%,#1a335d 100%);
    opacity:.85; transition:all .2s; cursor:pointer; min-height:6px;
  }
  .yb-bar-wrap:hover .yb-bar { opacity:1; transform:translateY(-3px); }
  .yb-bar-label { font-size:10.5px; color:#94A3B8; font-weight:600; }

  /* Brokers */
  .yb-broker-list { display:flex; flex-direction:column; }
  .yb-broker-row { display:flex; align-items:center; gap:12px; padding:12px 4px; border-bottom:1px solid #F1F5F9; transition:background .12s; }
  .yb-broker-row:last-child { border-bottom:none; }
  .yb-broker-row:hover { background:#FAFBFE; }
  .yb-rank { width:22px; height:22px; border-radius:7px; background:#F1F5F9; color:#64748B; font-size:11px; font-weight:800; display:inline-flex; align-items:center; justify-content:center; flex-shrink:0; }
  .yb-broker-row:nth-child(1) .yb-rank { background:linear-gradient(135deg,#fde68a,#f59e0b); color:#fff; }
  .yb-broker-row:nth-child(2) .yb-rank { background:#E2E8F0; color:#475569; }
  .yb-broker-row:nth-child(3) .yb-rank { background:#fed7aa; color:#9a3412; }
  .yb-broker-avatar { width:36px; height:36px; border-radius:10px; color:#fff; font-weight:700; font-size:14px; display:inline-flex; align-items:center; justify-content:center; flex-shrink:0; }
  .yb-broker-name { font-size:13.5px; font-weight:600; color:#1a335d; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
  .yb-broker-meta { font-size:11.5px; color:#64748B; margin-top:2px; display:flex; align-items:center; gap:4px; }
  .yb-broker-side { text-align:right; flex-shrink:0; }
  .yb-broker-deals  { font-size:14px; font-weight:800; color:#1a335d; line-height:1; }
  .yb-broker-rating { font-size:11px; color:#f59e0b; font-weight:600; display:inline-flex; align-items:center; gap:3px; margin-top:3px; }

  /* Quick actions */
  .yb-quick-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:14px; }
  @media (max-width:900px) { .yb-quick-grid { grid-template-columns:repeat(2,1fr); } }
  @media (max-width:500px) { .yb-quick-grid { grid-template-columns:1fr; } }
  .yb-quick { display:flex; align-items:center; gap:14px; padding:14px 16px; background:#fff; border:1px solid #ECEFF4; border-radius:14px; text-decoration:none; transition:all .15s; box-shadow:0 1px 2px rgba(15,23,42,.03); }
  .yb-quick:hover { border-color:#FECACA; transform:translateY(-2px); box-shadow:0 12px 24px rgba(239,68,68,.10); }
  .yb-quick-ic { width:42px; height:42px; border-radius:11px; flex-shrink:0; display:inline-flex; align-items:center; justify-content:center; }
  .yb-quick-title { font-size:13.5px; font-weight:700; color:#1a335d; }
  .yb-quick-sub   { font-size:11.5px; color:#64748B; margin-top:2px; }
  .yb-quick-arr   { color:#94A3B8; transition:all .15s; flex-shrink:0; }
  .yb-quick:hover .yb-quick-arr { color:#ef4444; transform:translateX(2px); }

  /* Table */
  .yb-table-wrap { overflow-x:auto; margin:-10px; padding:10px; }
  .yb-table { width:100%; border-collapse:separate; border-spacing:0; min-width:620px; }
  .yb-table thead th { text-align:left; font-size:10.5px; font-weight:700; color:#94A3B8; text-transform:uppercase; letter-spacing:.6px; padding:10px 14px; background:#F8FAFC; border-top:1px solid #ECEFF4; border-bottom:1px solid #ECEFF4; }
  .yb-table thead th:first-child { border-top-left-radius:10px; border-bottom-left-radius:10px; padding-left:16px; }
  .yb-table thead th:last-child  { border-top-right-radius:10px; border-bottom-right-radius:10px; padding-right:16px; }
  .yb-table tbody tr { transition:background .12s; }
  .yb-table tbody tr:hover { background:#FAFBFE; }
  .yb-table tbody td { padding:14px; vertical-align:middle; border-bottom:1px solid #F1F5F9; font-size:13px; color:#1E293B; }
  .yb-table tbody td:first-child { padding-left:16px; }
  .yb-table tbody td:last-child  { padding-right:16px; }
  .yb-table tbody tr:last-child td { border-bottom:none; }
  .ta-r { text-align:right; }
  .yb-fw { font-weight:700; color:#1a335d; }
  .yb-prop-title { font-weight:700; color:#1a335d; font-size:13.5px; }
  .yb-prop-loc   { font-size:11.5px; color:#64748B; margin-top:3px; display:inline-flex; align-items:center; gap:4px; }
  .yb-prop-id    { color:#94A3B8; font-weight:600; margin-left:8px; }

  .yb-pill { font-size:10.5px; font-weight:700; padding:4px 9px; border-radius:99px; display:inline-block; letter-spacing:.3px; text-transform:uppercase; }
  .pill-sale    { background:rgba(26,51,93,.10);   color:#1a335d; }
  .pill-rent    { background:rgba(245,158,11,.14); color:#b45309; }
  .pill-active  { background:rgba(22,163,74,.12);  color:#16a34a; }
  .pill-pending { background:rgba(245,158,11,.14); color:#b45309; }
  .pill-sold    { background:rgba(107,114,128,.14);color:#4b5563; }

  .yb-icon-btn { width:32px; height:32px; border-radius:8px; background:#fff; border:1px solid #E2E8F0; cursor:pointer; display:inline-flex; align-items:center; justify-content:center; color:#64748B; transition:all .15s; }
  .yb-icon-btn:hover { background:#F8FAFC; color:#1a335d; }

  /* Activity */
  .yb-act-list { display:flex; flex-direction:column; }
  .yb-act-row  { display:flex; gap:12px; padding:12px 4px; border-bottom:1px solid #F1F5F9; }
  .yb-act-row:last-of-type { border-bottom:none; }
  .yb-act-ic   { width:34px; height:34px; border-radius:10px; display:inline-flex; align-items:center; justify-content:center; flex-shrink:0; }
  .yb-act-text { font-size:12.5px; color:#475569; line-height:1.5; }
  .yb-act-text strong { color:#1a335d; font-weight:700; }
  .yb-act-time { font-size:11px; color:#94A3B8; margin-top:3px; display:inline-flex; align-items:center; gap:4px; }
  .yb-act-foot { display:inline-flex; align-items:center; gap:6px; font-size:11px; color:#64748B; font-weight:500; padding:10px 4px 0; margin-top:6px; border-top:1px dashed #ECEFF4; }
  .yb-act-foot svg { color:#16a34a; }

  /* Mobile */
  @media (max-width:640px) {
    .yb-page-head-inner { padding:16px 18px 18px; }
    .yb-body { padding:18px; gap:14px; }
    .yb-card { padding:16px; }
    .yb-title { font-size:22px; }
    .yb-stat-value { font-size:22px; }
    .yb-period { width:100%; justify-content:space-between; }
    .yb-period-btn { flex:1; }
    .yb-head-actions { width:100%; }
    .yb-head-actions .yb-btn { flex:1; justify-content:center; }
  }
`;

export default Dashboard;