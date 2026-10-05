import React, { useEffect, useState, useMemo } from 'react';
import Sidebar from '../components/Sidebar';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import {
  Users, UserPlus, Search, Phone, X, Calendar, Trash2, Eye,
  CheckCircle2, Star, AlertTriangle, Inbox, RotateCcw, Mail,
} from 'lucide-react';

const API = import.meta.env.VITE_API_URL;

const AllBroker = () => {
  const [brokers, setBrokers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [searchMobile, setSearchMobile] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [tab, setTab] = useState('all'); // all | active | inactive | featured

  // Delete confirm modal
  const [confirmDel, setConfirmDel] = useState(null);

  // ── Fetch brokers ─────────────────────────────
  const fetchBrokers = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API}/allbrokers`);
      if (response.data.success) {
        setBrokers(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching brokers:', error);
      toast.error('Failed to load brokers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBrokers();
  }, []);

  // ── Toggle status / featured (optimistic) ─────
  const handleToggle = async (id, field, currentValue) => {
    const previous = brokers;
    setBrokers((prev) =>
      prev.map((b) => (b._id === id ? { ...b, [field]: !currentValue } : b))
    );

    try {
      const response = await axios.put(`${API}/update-broker-status/${id}`, {
        [field]: !currentValue,
      });

      if (response.data.success) {
        toast.success(`${field.charAt(0).toUpperCase() + field.slice(1)} updated`);
      } else {
        setBrokers(previous);
        toast.error('Update failed');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      setBrokers(previous);
      toast.error('Server error during update');
    }
  };

  // ── Delete broker ─────────────────────────────
  const handleDelete = async () => {
    if (!confirmDel) return;
    try {
      const res = await axios.delete(`${API}/delete-broker/${confirmDel._id}`);
      if (res.data?.success) {
        toast.success('Broker deleted successfully');
        setBrokers((prev) => prev.filter((b) => b._id !== confirmDel._id));
      } else {
        toast.success('Broker removed');
        setBrokers((prev) => prev.filter((b) => b._id !== confirmDel._id));
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete broker');
    } finally {
      setConfirmDel(null);
    }
  };

  // ── Reset filters ─────────────────────────────
  const handleReset = () => {
    setSearchTerm('');
    setSearchMobile('');
    setFromDate('');
    setToDate('');
    setTab('all');
  };

  // ── Filtered list ─────────────────────────────
  const visible = useMemo(() => {
    return brokers.filter((b) => {
      if (tab === 'active' && !b.active) return false;
      if (tab === 'inactive' && b.active) return false;
      if (tab === 'featured' && !b.feature) return false;

      if (searchTerm && !b.name?.toLowerCase().includes(searchTerm.toLowerCase()))
        return false;
      if (searchMobile && !b.mobile_number?.includes(searchMobile)) return false;

      if (fromDate && toDate) {
        const d = new Date(b.createdAt).toISOString().split('T')[0];
        if (d < fromDate || d > toDate) return false;
      }
      return true;
    });
  }, [brokers, searchTerm, searchMobile, fromDate, toDate, tab]);

  // ── Stats ─────────────────────────────────────
  const stats = useMemo(() => {
    const total = brokers.length;
    const active = brokers.filter((b) => b.active).length;
    const featured = brokers.filter((b) => b.feature).length;
    const listings = brokers.reduce((s, b) => s + (b.property_listings || 0), 0);
    return { total, active, featured, listings };
  }, [brokers]);

  return (
    <div>
      <Sidebar />
      <link
        href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=Playfair+Display:wght@700&display=swap"
        rel="stylesheet"
      />
      <style>{styles}</style>

      <div className="yb-content">
        {/* ── Page Header ── */}
        <div className="yb-page-head">
          <div className="yb-page-head-inner">
            <div className="yb-crumbs">
              <a href="/dashboard">Dashboard</a>
              <span>/</span>
              <span className="active">Brokers</span>
            </div>

            <div className="yb-head-row">
              <div>
                <h4 className="yb-title">All Brokers</h4>
                <p className="yb-subtitle">
                  Manage and monitor every registered agent on the platform.
                </p>
              </div>
              <div className="yb-head-actions">
                <a href="/add-broker" className="yb-btn yb-btn-primary">
                  <UserPlus size={15} /> Add Broker
                </a>
              </div>
            </div>

            <div className="yb-stats">
              <Stat icon={<Users size={16} />}        num={stats.total}    label="Total Brokers"  tone="navy" />
              <Stat icon={<CheckCircle2 size={16} />} num={stats.active}   label="Active"         tone="green" />
              <Stat icon={<Star size={16} />}         num={stats.featured} label="Featured"       tone="amber" />
              <Stat icon={<Users size={16} />}        num={stats.listings} label="Total Listings" tone="red" />
            </div>
          </div>
        </div>

        {/* ── Body ── */}
        <div className="yb-body">
          {/* Filters */}
          <div className="yb-filter-card">
            <div className="yb-filter-grid">
              <div className="yb-search">
                <Search size={15} />
                <input
                  type="text"
                  placeholder="Search broker name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                  <button onClick={() => setSearchTerm('')} className="yb-search-x">
                    <X size={14} />
                  </button>
                )}
              </div>

              <div className="yb-search">
                <Phone size={14} />
                <input
                  type="text"
                  placeholder="Mobile number..."
                  value={searchMobile}
                  onChange={(e) => setSearchMobile(e.target.value)}
                />
                {searchMobile && (
                  <button onClick={() => setSearchMobile('')} className="yb-search-x">
                    <X size={14} />
                  </button>
                )}
              </div>

              <div className="yb-date">
                <Calendar size={14} />
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                />
              </div>
              <div className="yb-date">
                <Calendar size={14} />
                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                />
              </div>

              <button className="yb-btn yb-btn-ghost" onClick={handleReset}>
                <RotateCcw size={14} /> Reset
              </button>
            </div>

            <div className="yb-tabs">
              {[
                { k: 'all',      label: 'All' },
                { k: 'active',   label: 'Active' },
                { k: 'inactive', label: 'Inactive' },
                { k: 'featured', label: 'Featured' },
              ].map((t) => (
                <button
                  key={t.k}
                  className={`yb-tab ${tab === t.k ? 'active' : ''}`}
                  onClick={() => setTab(t.k)}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          <div className="yb-card">
            {loading ? (
              <div className="yb-empty">
                <span className="yb-spin dark" /> Loading brokers…
              </div>
            ) : visible.length === 0 ? (
              <div className="yb-empty">
                <div className="yb-empty-ic"><Inbox size={28} /></div>
                <h6>No brokers found</h6>
                <p>Try adjusting your filters or search.</p>
              </div>
            ) : (
              <div className="yb-table-wrap">
                <table className="yb-table">
                  <thead>
                    <tr>
                      <th>Broker</th>
                      <th>Contact</th>
                      <th className="ta-c">Status</th>
                      <th className="ta-c">Featured</th>
                      <th className="ta-c">Listings</th>
                      <th className="ta-c">Joined</th>
                      <th className="ta-r">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visible.map((b) => (
                      <tr key={b._id}>
                        <td>
                          <div className="yb-broker">
                            {b.profileImage ? (
                              <img
                                src={b.profileImage}
                                alt={b.name}
                                className="yb-avatar img"
                              />
                            ) : (
                              <div className="yb-avatar">
                                {b.name?.charAt(0)?.toUpperCase() || '?'}
                              </div>
                            )}
                            <div>
                              <div className="yb-broker-name">
                                {b.name}
                                {b.feature && (
                                  <span className="yb-feat-pill">
                                    <Star size={9} /> Featured
                                  </span>
                                )}
                              </div>
                              <div className="yb-broker-meta">
                                <Mail size={10} /> {b.email || '—'}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td>
                          <div className="yb-broker-meta lg">
                            <Phone size={12} /> {b.mobile_number || '—'}
                          </div>
                        </td>

                        <td className="ta-c">
                          <label
                            className="yb-switch"
                            title={b.active ? 'Active' : 'Inactive'}
                          >
                            <input
                              type="checkbox"
                              checked={!!b.active}
                              onChange={() =>
                                handleToggle(b._id, 'active', b.active)
                              }
                            />
                            <span className="slider" />
                          </label>
                          <div className={`yb-switch-lbl ${b.active ? 'on' : 'off'}`}>
                            {b.active ? 'Active' : 'Inactive'}
                          </div>
                        </td>

                        <td className="ta-c">
                          <label
                            className="yb-switch gold"
                            title={b.feature ? 'Featured' : 'Regular'}
                          >
                            <input
                              type="checkbox"
                              checked={!!b.feature}
                              onChange={() =>
                                handleToggle(b._id, 'feature', b.feature)
                              }
                            />
                            <span className="slider" />
                          </label>
                          <div className={`yb-switch-lbl ${b.feature ? 'gold' : 'off'}`}>
                            {b.feature ? 'Featured' : 'Regular'}
                          </div>
                        </td>

                        <td className="ta-c">
                          <span className="yb-count-pill">
                            {b.property_listings || 0}
                          </span>
                        </td>
                        <td className="ta-c">
                          <span className="yb-date-text">
                            {b.createdAt
                              ? new Date(b.createdAt).toLocaleDateString('en-GB')
                              : '—'}
                          </span>
                        </td>
                        <td className="ta-r">
                          <div className="yb-actions-row">
                            <button className="yb-icon-btn view" title="View">
                              <Eye size={14} />
                            </button>
                            <button
                              className="yb-icon-btn del"
                              onClick={() => setConfirmDel(b)}
                              title="Delete"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Delete Confirmation Modal ── */}
      {confirmDel && (
        <div className="yb-modal-bg" onClick={() => setConfirmDel(null)}>
          <div className="yb-modal sm" onClick={(e) => e.stopPropagation()}>
            <div className="yb-modal-head">
              <div
                className="yb-card-icon"
                style={{ background: 'rgba(239,68,68,0.10)', color: '#ef4444' }}
              >
                <AlertTriangle size={18} />
              </div>
              <div style={{ flex: 1 }}>
                <h5 className="yb-card-title">Delete this broker?</h5>
                <p className="yb-card-desc">
                  "<strong>{confirmDel.name}</strong>" will be permanently removed
                  from the platform.
                </p>
              </div>
            </div>
            <div
              className="yb-modal-foot"
              style={{ borderTop: '1px solid #F1F5F9', paddingTop: 16 }}
            >
              <button
                className="yb-btn yb-btn-ghost"
                onClick={() => setConfirmDel(null)}
              >
                Cancel
              </button>
              <button className="yb-btn yb-btn-danger" onClick={handleDelete}>
                <Trash2 size={14} /> Yes, delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const Stat = ({ icon, num, label, tone }) => (
  <div className="yb-stat">
    <div className={`yb-stat-ic ${tone}`}>{icon}</div>
    <div>
      <div className="yb-stat-num">{num}</div>
      <div className="yb-stat-lbl">{label}</div>
    </div>
  </div>
);

const styles = `
  .yb-content { font-family:'DM Sans', sans-serif; background:#F6F7FB; min-height:100vh; }

  /* Page header */
  .yb-page-head { background:#fff; border-bottom:1px solid #ECEFF4; }
  .yb-page-head-inner { padding:18px 28px 22px; }
  .yb-crumbs { display:flex; flex-wrap:wrap; align-items:center; gap:6px; font-size:12px; color:#94A3B8; margin-bottom:8px; }
  .yb-crumbs a { color:#64748B; text-decoration:none; font-weight:500; }
  .yb-crumbs a:hover { color:#ef4444; }
  .yb-crumbs .active { color:#1a335d; font-weight:600; }
  .yb-head-row { display:flex; align-items:center; justify-content:space-between; gap:16px; flex-wrap:wrap; }
  .yb-title { font-family:'Playfair Display', serif; font-size:26px; color:#1a335d; margin:0; }
  .yb-subtitle { font-size:13.5px; color:#64748B; margin:4px 0 0; }
  .yb-head-actions { display:flex; gap:10px; flex-wrap:wrap; }

  /* Stats */
  .yb-stats { display:grid; grid-template-columns:repeat(4, 1fr); gap:12px; margin-top:18px; }
  @media (max-width:720px) { .yb-stats { grid-template-columns:repeat(2, 1fr); } }
  .yb-stat { display:flex; align-items:center; gap:12px; background:#F8FAFC; border:1px solid #ECEFF4; border-radius:12px; padding:12px 14px; }
  .yb-stat-ic { width:36px; height:36px; border-radius:10px; flex-shrink:0; display:inline-flex; align-items:center; justify-content:center; }
  .yb-stat-ic.navy { background:rgba(26,51,93,.10); color:#1a335d; }
  .yb-stat-ic.green { background:rgba(34,197,94,.10); color:#16a34a; }
  .yb-stat-ic.red { background:rgba(239,68,68,.10); color:#ef4444; }
  .yb-stat-ic.amber { background:rgba(245,158,11,.12); color:#d97706; }
  .yb-stat-num { font-size:18px; font-weight:800; color:#1a335d; line-height:1; }
  .yb-stat-lbl { font-size:11.5px; color:#64748B; margin-top:4px; text-transform:uppercase; letter-spacing:.4px; font-weight:600; }

  /* Buttons */
  .yb-btn { display:inline-flex; align-items:center; gap:8px; padding:10px 16px; border-radius:10px; font-size:13.5px; font-weight:600; cursor:pointer; border:1px solid transparent; text-decoration:none; transition:all .15s; white-space:nowrap; font-family:inherit; }
  .yb-btn-primary { background:linear-gradient(135deg,#ef4444,#dc2626); color:#fff; box-shadow:0 8px 18px rgba(239,68,68,.28); }
  .yb-btn-primary:hover:not(:disabled) { transform:translateY(-1px); box-shadow:0 12px 22px rgba(239,68,68,.34); color:#fff; }
  .yb-btn-ghost { background:#fff; color:#334155; border-color:#E2E8F0; }
  .yb-btn-ghost:hover { background:#F8FAFC; color:#1a335d; }
  .yb-btn-danger { background:#ef4444; color:#fff; }
  .yb-btn-danger:hover { background:#dc2626; color:#fff; }
  .yb-spin { width:14px; height:14px; border-radius:50%; border:2px solid rgba(255,255,255,.4); border-top-color:#fff; animation:ybspin .7s linear infinite; }
  .yb-spin.dark { border-color:rgba(15,23,42,.15); border-top-color:#1a335d; }
  @keyframes ybspin { to { transform:rotate(360deg); } }

  /* Body */
  .yb-body { padding:28px; max-width:1400px; }

  /* Filter card */
  .yb-filter-card { background:#fff; border:1px solid #ECEFF4; border-radius:16px; padding:18px; margin-bottom:18px; }
  .yb-filter-grid { display:grid; gap:10px; grid-template-columns: 1.4fr 1fr 1fr 1fr auto; }
  @media (max-width:900px) { .yb-filter-grid { grid-template-columns:1fr 1fr; } }
  @media (max-width:520px) { .yb-filter-grid { grid-template-columns:1fr; } }

  .yb-search { position:relative; display:flex; align-items:center; background:#F8FAFC; border:1px solid #E2E8F0; border-radius:10px; padding:0 12px; transition:all .15s; }
  .yb-search:focus-within { border-color:#ef4444; background:#fff; box-shadow:0 0 0 4px rgba(239,68,68,.10); }
  .yb-search svg { color:#94A3B8; flex-shrink:0; }
  .yb-search input { flex:1; border:none; background:transparent; outline:none; padding:10px 8px; font-size:13.5px; color:#0F172A; min-width:0; }
  .yb-search input::placeholder { color:#94A3B8; }
  .yb-search-x { background:none; border:none; cursor:pointer; color:#94A3B8; width:22px; height:22px; border-radius:50%; display:inline-flex; align-items:center; justify-content:center; }
  .yb-search-x:hover { background:#F1F5F9; color:#ef4444; }

  .yb-date { display:flex; align-items:center; gap:8px; padding:0 12px; background:#F8FAFC; border:1px solid #E2E8F0; border-radius:10px; transition:all .15s; }
  .yb-date:focus-within { border-color:#ef4444; background:#fff; box-shadow:0 0 0 4px rgba(239,68,68,.10); }
  .yb-date svg { color:#94A3B8; flex-shrink:0; }
  .yb-date input { flex:1; border:none; background:transparent; outline:none; padding:10px 0; font-size:13.5px; color:#0F172A; font-family:inherit; min-width:0; }

  /* Tabs */
  .yb-tabs { display:inline-flex; padding:4px; background:#F8FAFC; border:1px solid #E2E8F0; border-radius:10px; margin-top:14px; flex-wrap:wrap; }
  .yb-tab { background:none; border:none; cursor:pointer; padding:8px 14px; border-radius:7px; font-size:13px; font-weight:600; color:#64748B; transition:all .15s; font-family:inherit; }
  .yb-tab:hover { color:#1a335d; }
  .yb-tab.active { background:#1a335d; color:#fff; }

  /* Card / Table */
  .yb-card { background:#fff; border:1px solid #ECEFF4; border-radius:16px; padding:22px; box-shadow:0 1px 2px rgba(15,23,42,.03); }
  .yb-card-icon { width:40px; height:40px; border-radius:12px; flex-shrink:0; display:inline-flex; align-items:center; justify-content:center; background:rgba(239,68,68,.10); color:#ef4444; }
  .yb-card-title { margin:0; font-size:16px; font-weight:700; color:#1a335d; }
  .yb-card-desc { margin:2px 0 0; font-size:13px; color:#64748B; }

  .yb-table-wrap { overflow-x:auto; margin:-10px; padding:10px; }
  .yb-table { width:100%; border-collapse:separate; border-spacing:0; min-width:920px; }
  .yb-table thead th {
    text-align:left; font-size:11px; font-weight:700; color:#94A3B8;
    text-transform:uppercase; letter-spacing:.6px;
    padding:12px 16px; background:#F8FAFC;
    border-top:1px solid #ECEFF4; border-bottom:1px solid #ECEFF4;
  }
  .yb-table thead th:first-child { border-top-left-radius:10px; border-bottom-left-radius:10px; padding-left:18px; }
  .yb-table thead th:last-child { border-top-right-radius:10px; border-bottom-right-radius:10px; padding-right:18px; }
  .yb-table tbody tr { transition:background .12s; }
  .yb-table tbody tr:hover { background:#FAFBFE; }
  .yb-table tbody td { padding:14px 16px; vertical-align:middle; border-bottom:1px solid #F1F5F9; font-size:13.5px; color:#1E293B; }
  .yb-table tbody td:first-child { padding-left:18px; }
  .yb-table tbody td:last-child { padding-right:18px; }
  .yb-table tbody tr:last-child td { border-bottom:none; }
  .ta-c { text-align:center; } .ta-r { text-align:right; }

  /* Broker cell */
  .yb-broker { display:flex; align-items:center; gap:12px; }
  .yb-avatar {
    width:42px; height:42px; border-radius:50%;
    background:linear-gradient(135deg,#1a335d,#2a4a7a); color:#fff; font-weight:700;
    display:inline-flex; align-items:center; justify-content:center;
    flex-shrink:0; box-shadow:0 4px 10px rgba(26,51,93,.18);
    font-size:15px;
  }
  .yb-avatar.img { padding:0; object-fit:cover; border:2px solid #fff; outline:1px solid #E2E8F0; }
  .yb-broker-name {
    font-weight:700; color:#1a335d; font-size:13.5px;
    display:flex; align-items:center; gap:8px; flex-wrap:wrap;
  }
  .yb-broker-meta { font-size:12px; color:#64748B; margin-top:3px; display:inline-flex; align-items:center; gap:5px; }
  .yb-broker-meta.lg { font-size:13px; color:#334155; }
  .yb-broker-meta svg { color:#94A3B8; }

  .yb-feat-pill {
    display:inline-flex; align-items:center; gap:3px;
    background:rgba(245,158,11,.14); color:#d97706;
    font-size:10px; font-weight:700;
    padding:2px 7px; border-radius:999px;
    text-transform:uppercase; letter-spacing:.3px;
  }

  .yb-count-pill {
    display:inline-block; min-width:32px; padding:4px 10px;
    background:#EEF2FF; color:#4f46e5; border-radius:999px;
    font-weight:700; font-size:12.5px;
  }
  .yb-date-text { color:#64748B; font-size:12.5px; }

  /* Toggle switches */
  .yb-switch { position:relative; display:inline-block; width:38px; height:22px; cursor:pointer; }
  .yb-switch input { opacity:0; width:0; height:0; }
  .yb-switch .slider {
    position:absolute; inset:0; background:#E2E8F0; border-radius:999px;
    transition:.2s; cursor:pointer;
  }
  .yb-switch .slider:before {
    content:''; position:absolute; left:3px; top:3px;
    width:16px; height:16px; background:#fff; border-radius:50%;
    transition:.2s; box-shadow:0 1px 3px rgba(0,0,0,.2);
  }
  .yb-switch input:checked + .slider { background:#22c55e; }
  .yb-switch input:checked + .slider:before { transform:translateX(16px); }
  .yb-switch.gold input:checked + .slider { background:#f59e0b; }

  .yb-switch-lbl {
    margin-top:4px; font-size:11px; font-weight:700; letter-spacing:.3px;
  }
  .yb-switch-lbl.on { color:#16a34a; }
  .yb-switch-lbl.off { color:#94A3B8; }
  .yb-switch-lbl.gold { color:#d97706; }

  /* Action buttons */
  .yb-actions-row { display:inline-flex; gap:6px; }
  .yb-icon-btn { width:34px; height:34px; border-radius:9px; background:#fff; border:1px solid #E2E8F0; display:inline-flex; align-items:center; justify-content:center; cursor:pointer; transition:all .15s; color:#64748B; }
  .yb-icon-btn.view:hover { background:rgba(26,51,93,.08); color:#1a335d; border-color:#1a335d; }
  .yb-icon-btn.del:hover { background:#FEF2F2; color:#ef4444; border-color:#FECACA; }

  /* Empty */
  .yb-empty { text-align:center; padding:60px 20px; color:#64748B; display:flex; flex-direction:column; align-items:center; gap:10px; font-size:14px; }
  .yb-empty-ic { width:56px; height:56px; border-radius:14px; background:#F1F5F9; color:#94A3B8; display:inline-flex; align-items:center; justify-content:center; }
  .yb-empty h6 { margin:4px 0 0; font-size:15px; font-weight:700; color:#1a335d; }
  .yb-empty p { margin:0; font-size:13px; }

  /* Modal */
  .yb-modal-bg { position:fixed; inset:0; z-index:1100; background:rgba(15,23,42,.45); backdrop-filter:blur(4px); display:flex; align-items:center; justify-content:center; padding:20px; }
  .yb-modal { width:100%; max-width:560px; background:#fff; border-radius:18px; padding:22px; box-shadow:0 24px 60px rgba(15,23,42,.25); }
  .yb-modal.sm { max-width:440px; }
  .yb-modal-head { display:flex; align-items:flex-start; gap:12px; padding-bottom:16px; margin-bottom:18px; border-bottom:1px dashed #ECEFF4; }
  .yb-modal-foot { display:flex; justify-content:flex-end; gap:10px; margin-top:18px; }

  /* Mobile */
  @media (max-width:600px) {
    .yb-page-head-inner { padding:16px 18px 18px; }
    .yb-body { padding:18px; }
    .yb-card { padding:14px; }
    .yb-title { font-size:22px; }
    .yb-modal-foot { flex-direction:column-reverse; }
    .yb-modal-foot .yb-btn { width:100%; justify-content:center; }
  }
`;

export default AllBroker;