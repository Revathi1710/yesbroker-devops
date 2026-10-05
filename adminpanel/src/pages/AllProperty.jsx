import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import {
  Building2, Search, Plus, Trash2, Pencil,   // ✅ FIX: was `pencil` (lowercase) — lucide exports `Pencil`
  X, Filter, Calendar,
  CheckCircle2, AlertTriangle, MapPin, Phone, Inbox,
  ChevronDown, RotateCcw,
} from 'lucide-react';

const API = import.meta.env.VITE_API_URL;

const AllProperty = () => {
  const navigate = useNavigate();                  // ✅ for edit redirect

  const [properties,   setProperties]   = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [searchTerm,   setSearchTerm]   = useState('');
  const [propType,     setPropType]     = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [fromDate,     setFromDate]     = useState('');
  const [toDate,       setToDate]       = useState('');
  const [confirmDel,   setConfirmDel]   = useState(null);

  /* ── Fetch ── */
  const fetchProperties = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${API}/all-property-admin`);
      if (data.success) setProperties(data.data);
    } catch {
      toast.error('Error loading properties');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProperties(); }, []);

  /* ── Delete ── */
  const handleDelete = async () => {
    if (!confirmDel) return;
    try {
      const { data } = await axios.delete(`${API}/delete-property-admin/${confirmDel._id}`);
      if (data.success) {
        toast.success('Property deleted successfully');
        setProperties((prev) => prev.filter((p) => p._id !== confirmDel._id));
        setConfirmDel(null);
      }
    } catch {
      toast.error('Failed to delete property');
    }
  };

  /* ── Status change ── */
  const handleStatusChange = async (id, newStatus) => {
    try {
      const { data } = await axios.put(`${API}/update-property-status/${id}`, { status: newStatus });
      if (data.success) {
        toast.success(`Marked as ${newStatus}`);
        setProperties((prev) =>
          prev.map((p) => (p._id === id ? { ...p, status: newStatus } : p))
        );
      }
    } catch {
      toast.error('Failed to update status');
    }
  };

  /* ── Filtered list ── */
  const visible = useMemo(() => {
    return properties.filter((p) => {
      if (statusFilter !== 'all' && p.status !== statusFilter) return false;
      if (propType && p.propertyType !== propType) return false;
      if (searchTerm) {
        const q = searchTerm.toLowerCase();
        const match =
          p.broker?.name?.toLowerCase().includes(q) ||
          p.localities?.some((l) => l.toLowerCase().includes(q));
        if (!match) return false;
      }
      if (fromDate && toDate) {
        const d = new Date(p.createdAt).toISOString().split('T')[0];
        if (d < fromDate || d > toDate) return false;
      }
      return true;
    });
  }, [properties, searchTerm, propType, statusFilter, fromDate, toDate]);

  /* ── Stats ── */
  const stats = useMemo(() => ({
    total:  properties.length,
    active: properties.filter((p) => p.status === 'Active').length,
    sold:   properties.filter((p) => p.status === 'Sold').length,
    rented: properties.filter((p) => p.status === 'Rented').length,
  }), [properties]);

  const resetFilters = () => {
    setSearchTerm(''); setPropType(''); setStatusFilter('all');
    setFromDate(''); setToDate('');
  };

  /* ── Price formatter ── */
  const fmt = (n) => {
    if (!n) return '—';
    if (n >= 10000000) return `₹${(n / 10000000).toFixed(2)} Cr`;
    if (n >= 100000)   return `₹${(n / 100000).toFixed(1)} L`;
    return `₹${Number(n).toLocaleString('en-IN')}`;
  };

  return (
    <div style={{ display: 'flex' }}>
      <Sidebar />

      <div style={{ flex: 1, minWidth: 0 }}>
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
                <a href="/dashboard">Dashboard</a><span>/</span>
                <span className="active">Properties</span>
              </div>
              <div className="yb-head-row">
                <div>
                  <h4 className="yb-title">Property Management</h4>
                  <p className="yb-subtitle">Browse, filter, and manage all listings on the platform.</p>
                </div>
                <div className="yb-head-actions">
                  <button className="yb-btn yb-btn-primary" onClick={() => navigate('/add-property-admin')}>
                    <Plus size={15} /> Add Property
                  </button>
                </div>
              </div>

              {/* Stats strip */}
              <div className="yb-stats">
                <StatTile icon={<Building2 size={16}/>}    num={stats.total}  label="Total Listings" tone="navy"  />
                <StatTile icon={<CheckCircle2 size={16}/>} num={stats.active} label="Active"          tone="green" />
                <StatTile icon={<Building2 size={16}/>}    num={stats.sold}   label="Sold"            tone="red"   />
                <StatTile icon={<Building2 size={16}/>}    num={stats.rented} label="Rented"          tone="amber" />
              </div>
            </div>
          </div>

          {/* ── Body ── */}
          <div className="yb-body">

            {/* Filters */}
            <div className="yb-filter-card">
              <div className="yb-filter-grid">
                {/* Search */}
                <div className="yb-search">
                  <Search size={15} />
                  <input
                    type="text"
                    placeholder="Search broker or locality..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  {searchTerm && (
                    <button className="yb-search-x" onClick={() => setSearchTerm('')}>
                      <X size={14}/>
                    </button>
                  )}
                </div>

                {/* Property type */}
                <div className="yb-select">
                  <Filter size={14} />
                  <select value={propType} onChange={(e) => setPropType(e.target.value)}>
                    <option value="">All Types</option>
                    <option value="Apartment">Apartment</option>
                    <option value="Independent House">Independent House</option>
                    <option value="Villa">Villa</option>
                    <option value="Plot">Plot</option>
                    <option value="Commercial">Commercial</option>
                  </select>
                  <ChevronDown size={14} className="chev" />
                </div>

                {/* Date range */}
                <div className="yb-date">
                  <Calendar size={14} />
                  <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
                </div>
                <div className="yb-date">
                  <Calendar size={14} />
                  <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />
                </div>

                <button className="yb-btn yb-btn-ghost" onClick={resetFilters}>
                  <RotateCcw size={14} /> Reset
                </button>
              </div>

              {/* Status tabs */}
              <div className="yb-tabs">
                {[
                  { k: 'all',    label: `All (${stats.total})`     },
                  { k: 'Active', label: `Active (${stats.active})`  },
                  { k: 'Sold',   label: `Sold (${stats.sold})`      },
                  { k: 'Rented', label: `Rented (${stats.rented})`  },
                ].map((t) => (
                  <button
                    key={t.k}
                    className={`yb-tab ${statusFilter === t.k ? 'active' : ''}`}
                    onClick={() => setStatusFilter(t.k)}
                  >{t.label}</button>
                ))}
              </div>
            </div>

            {/* Table */}
            <div className="yb-card">
              {loading ? (
                <div className="yb-empty">
                  <span className="yb-spin dark" /> Loading properties…
                </div>
              ) : visible.length === 0 ? (
                <div className="yb-empty">
                  <div className="yb-empty-ic"><Inbox size={28} /></div>
                  <h6>No properties found</h6>
                  <p>Try adjusting your filters or search.</p>
                </div>
              ) : (
                <div className="yb-table-wrap">
                  <table className="yb-table">
                    <thead>
                      <tr>
                        <th>Property & Location</th>
                        <th>Broker</th>
                        <th className="ta-c">Price</th>
                        <th className="ta-c">Status</th>
                        <th className="ta-c">Listed</th>
                        <th className="ta-r">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {visible.map((p) => (
                        <tr key={p._id}>

                          {/* Property cell */}
                          <td>
                            <div className="yb-prop">
                              <img
                                src={p.photos?.[0] || 'https://placehold.co/60x45?text=N/A'}
                                alt="property"
                                className="yb-prop-img"
                                onError={(e) => { e.target.src = 'https://placehold.co/60x45?text=N/A'; }}
                              />
                              <div>
                                <div className="yb-prop-title">
                                  {p.propertyType}
                                  <span className="yb-tag-listing">{p.listingType}</span>
                                </div>
                                <div className="yb-prop-loc">
                                  <MapPin size={11} />
                                  {p.localities?.[0] || '—'}
                                  {p.localities?.length > 1 && (
                                    <span className="more"> +{p.localities.length - 1}</span>
                                  )}
                                </div>
                                <div className="yb-prop-size">{p.size} sq.ft</div>
                              </div>
                            </div>
                          </td>

                          {/* Broker cell */}
                          <td>
                            <div className="yb-broker">
                              <div className="yb-avatar sm">
                                {p.broker?.name?.charAt(0)?.toUpperCase() || '?'}
                              </div>
                              <div>
                                <div className="yb-broker-name">{p.broker?.name || 'Unknown'}</div>
                                <div className="yb-broker-meta">
                                  <Phone size={10}/> {p.broker?.mobile_number || '—'}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Price */}
                          <td className="ta-c">
                            <span className="yb-price">{fmt(p.price)}</span>
                          </td>

                          {/* Status dropdown */}
                          <td className="ta-c">
                            <div className={`yb-status-select ${p.status?.toLowerCase()}`}>
                              <select
                                value={p.status}
                                onChange={(e) => handleStatusChange(p._id, e.target.value)}
                              >
                                <option value="Active">Active</option>
                                <option value="Sold">Sold</option>
                                <option value="Rented">Rented</option>
                              </select>
                              <ChevronDown size={12} />
                            </div>
                          </td>

                          {/* Date */}
                          <td className="ta-c">
                            <span className="yb-date-text">
                              {p.createdAt
                                ? new Date(p.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
                                : '—'}
                            </span>
                          </td>

                          {/* Actions */}
                          <td className="ta-r">
                            <div className="yb-actions-row">
                              {/* ✅ FIX: Pencil (capitalised) + navigate to edit route */}
                              <button
                                className="yb-icon-btn edit"
                                title="Edit property"
                                onClick={() => navigate(`/edit-property-admin/${p._id}`)}
                              >
                                <Pencil size={14}/>
                              </button>
                              <button
                                className="yb-icon-btn del"
                                title="Delete property"
                                onClick={() => setConfirmDel(p)}
                              >
                                <Trash2 size={14}/>
                              </button>
                            </div>
                          </td>

                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Results count */}
              {!loading && visible.length > 0 && (
                <div style={{ padding: '12px 0 0', fontSize: 12, color: '#94A3B8', textAlign: 'right' }}>
                  Showing <strong style={{ color: '#1a335d' }}>{visible.length}</strong> of{' '}
                  <strong style={{ color: '#1a335d' }}>{properties.length}</strong> properties
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Delete confirmation modal ── */}
        {confirmDel && (
          <div className="yb-modal-bg" onClick={() => setConfirmDel(null)}>
            <div className="yb-modal sm" onClick={(e) => e.stopPropagation()}>
              <div className="yb-modal-head">
                <div className="yb-card-icon">
                  <AlertTriangle size={18} />
                </div>
                <div style={{ flex: 1 }}>
                  <h5 className="yb-card-title">Delete this property?</h5>
                  <p className="yb-card-desc">
                    <strong>{confirmDel.propertyType}</strong> in{' '}
                    <strong>{confirmDel.localities?.[0] || 'this location'}</strong> will be permanently removed.
                    This cannot be undone.
                  </p>
                </div>
              </div>
              <div className="yb-modal-foot">
                <button className="yb-btn yb-btn-ghost" onClick={() => setConfirmDel(null)}>Cancel</button>
                <button className="yb-btn yb-btn-danger" onClick={handleDelete}>
                  <Trash2 size={14} /> Yes, delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

/* ── Stat Tile ── */
const StatTile = ({ icon, num, label, tone }) => (
  <div className="yb-stat">
    <div className={`yb-stat-ic ${tone}`}>{icon}</div>
    <div>
      <div className="yb-stat-num">{num}</div>
      <div className="yb-stat-lbl">{label}</div>
    </div>
  </div>
);

/* ── Styles ── */
const styles = `
  .yb-content { font-family:'DM Sans',sans-serif; background:#F6F7FB; min-height:100vh; }

  .yb-page-head { background:#fff; border-bottom:1px solid #ECEFF4; }
  .yb-page-head-inner { padding:18px 28px 22px; }
  .yb-crumbs { display:flex; flex-wrap:wrap; align-items:center; gap:6px; font-size:12px; color:#94A3B8; margin-bottom:8px; }
  .yb-crumbs a { color:#64748B; text-decoration:none; font-weight:500; }
  .yb-crumbs a:hover { color:#ef4444; }
  .yb-crumbs .active { color:#1a335d; font-weight:600; }
  .yb-head-row { display:flex; align-items:center; justify-content:space-between; gap:16px; flex-wrap:wrap; }
  .yb-title { font-family:'Playfair Display',serif; font-size:26px; color:#1a335d; margin:0; }
  .yb-subtitle { font-size:13.5px; color:#64748B; margin:4px 0 0; }
  .yb-head-actions { display:flex; gap:10px; flex-wrap:wrap; }

  .yb-stats { display:grid; grid-template-columns:repeat(4,1fr); gap:12px; margin-top:18px; }
  @media(max-width:720px) { .yb-stats { grid-template-columns:repeat(2,1fr); } }
  .yb-stat { display:flex; align-items:center; gap:12px; background:#F8FAFC; border:1px solid #ECEFF4; border-radius:12px; padding:12px 14px; }
  .yb-stat-ic { width:36px; height:36px; border-radius:10px; flex-shrink:0; display:inline-flex; align-items:center; justify-content:center; }
  .yb-stat-ic.navy  { background:rgba(26,51,93,0.10);  color:#1a335d; }
  .yb-stat-ic.green { background:rgba(34,197,94,0.10); color:#16a34a; }
  .yb-stat-ic.red   { background:rgba(239,68,68,0.10); color:#ef4444; }
  .yb-stat-ic.amber { background:rgba(245,158,11,0.12);color:#d97706; }
  .yb-stat-num { font-size:18px; font-weight:800; color:#1a335d; line-height:1; }
  .yb-stat-lbl { font-size:11px; color:#64748B; margin-top:4px; text-transform:uppercase; letter-spacing:.4px; font-weight:600; }

  .yb-btn { display:inline-flex; align-items:center; gap:8px; padding:10px 16px; border-radius:10px; font-size:13.5px; font-weight:600; cursor:pointer; border:1px solid transparent; text-decoration:none; transition:all .15s; white-space:nowrap; font-family:inherit; }
  .yb-btn:disabled { opacity:.7; cursor:not-allowed; }
  .yb-btn-primary { background:linear-gradient(135deg,#ef4444,#dc2626); color:#fff; box-shadow:0 8px 18px rgba(239,68,68,.28); }
  .yb-btn-primary:hover { transform:translateY(-1px); box-shadow:0 12px 22px rgba(239,68,68,.34); color:#fff; }
  .yb-btn-ghost { background:#fff; color:#334155; border-color:#E2E8F0; }
  .yb-btn-ghost:hover { background:#F8FAFC; color:#1a335d; }
  .yb-btn-danger { background:#ef4444; color:#fff; border-color:transparent; }
  .yb-btn-danger:hover { background:#dc2626; }
  .yb-spin { display:inline-block; width:16px; height:16px; border-radius:50%; border:2px solid rgba(255,255,255,.35); border-top-color:#fff; animation:ybspin .7s linear infinite; }
  .yb-spin.dark { border-color:rgba(15,23,42,.12); border-top-color:#1a335d; }
  @keyframes ybspin { to { transform:rotate(360deg); } }

  .yb-body { padding:28px; }
  @media(max-width:600px) { .yb-body { padding:16px; } }

  .yb-filter-card { background:#fff; border:1px solid #ECEFF4; border-radius:16px; padding:18px; margin-bottom:18px; box-shadow:0 1px 2px rgba(15,23,42,.03); }
  .yb-filter-grid { display:grid; gap:10px; grid-template-columns:minmax(200px,2fr) 1fr 1fr 1fr auto; align-items:stretch; }
  @media(max-width:960px) { .yb-filter-grid { grid-template-columns:1fr 1fr; } }
  @media(max-width:520px)  { .yb-filter-grid { grid-template-columns:1fr; } }

  .yb-search { display:flex; align-items:center; gap:8px; background:#F8FAFC; border:1px solid #E2E8F0; border-radius:10px; padding:0 12px; transition:all .15s; }
  .yb-search:focus-within { border-color:#ef4444; background:#fff; box-shadow:0 0 0 4px rgba(239,68,68,.10); }
  .yb-search svg { color:#94A3B8; flex-shrink:0; }
  .yb-search input { flex:1; border:none; background:transparent; outline:none; padding:10px 6px; font-size:13.5px; color:#0F172A; font-family:inherit; min-width:0; }
  .yb-search input::placeholder { color:#94A3B8; }
  .yb-search-x { background:none; border:none; cursor:pointer; color:#94A3B8; width:22px; height:22px; border-radius:50%; display:inline-flex; align-items:center; justify-content:center; }
  .yb-search-x:hover { background:#F1F5F9; color:#ef4444; }

  .yb-select { position:relative; display:flex; align-items:center; gap:8px; padding:0 30px 0 12px; background:#F8FAFC; border:1px solid #E2E8F0; border-radius:10px; transition:all .15s; }
  .yb-select:focus-within { border-color:#ef4444; background:#fff; box-shadow:0 0 0 4px rgba(239,68,68,.10); }
  .yb-select svg:first-of-type { color:#94A3B8; flex-shrink:0; }
  .yb-select select { flex:1; border:none; background:transparent; outline:none; padding:10px 0; font-size:13.5px; color:#0F172A; appearance:none; cursor:pointer; font-family:inherit; }
  .yb-select .chev { position:absolute; right:10px; color:#94A3B8; pointer-events:none; }

  .yb-date { display:flex; align-items:center; gap:8px; padding:0 12px; background:#F8FAFC; border:1px solid #E2E8F0; border-radius:10px; transition:all .15s; }
  .yb-date:focus-within { border-color:#ef4444; background:#fff; box-shadow:0 0 0 4px rgba(239,68,68,.10); }
  .yb-date svg { color:#94A3B8; flex-shrink:0; }
  .yb-date input { flex:1; border:none; background:transparent; outline:none; padding:10px 0; font-size:13.5px; color:#0F172A; font-family:inherit; min-width:0; }

  .yb-tabs { display:inline-flex; padding:4px; background:#F8FAFC; border:1px solid #E2E8F0; border-radius:10px; margin-top:14px; flex-wrap:wrap; gap:2px; }
  .yb-tab { background:none; border:none; cursor:pointer; padding:7px 14px; border-radius:7px; font-size:13px; font-weight:600; color:#64748B; transition:all .15s; font-family:inherit; white-space:nowrap; }
  .yb-tab:hover { color:#1a335d; }
  .yb-tab.active { background:#1a335d; color:#fff; }

  .yb-card { background:#fff; border:1px solid #ECEFF4; border-radius:16px; padding:22px; box-shadow:0 1px 2px rgba(15,23,42,.03); }
  .yb-table-wrap { overflow-x:auto; margin:-6px; padding:6px; }
  .yb-table { width:100%; border-collapse:separate; border-spacing:0; min-width:900px; }
  .yb-table thead th { text-align:left; font-size:11px; font-weight:700; color:#94A3B8; text-transform:uppercase; letter-spacing:.6px; padding:12px 16px; background:#F8FAFC; border-top:1px solid #ECEFF4; border-bottom:1px solid #ECEFF4; }
  .yb-table thead th:first-child { border-radius:10px 0 0 10px; padding-left:18px; }
  .yb-table thead th:last-child  { border-radius:0 10px 10px 0; padding-right:18px; }
  .yb-table tbody tr { transition:background .12s; }
  .yb-table tbody tr:hover { background:#FAFBFE; }
  .yb-table tbody td { padding:14px 16px; vertical-align:middle; border-bottom:1px solid #F1F5F9; font-size:13.5px; color:#1E293B; }
  .yb-table tbody td:first-child { padding-left:18px; }
  .yb-table tbody td:last-child  { padding-right:18px; }
  .yb-table tbody tr:last-child td { border-bottom:none; }
  .ta-c { text-align:center; } .ta-r { text-align:right; }

  .yb-prop { display:flex; align-items:center; gap:12px; }
  .yb-prop-img { width:60px; height:48px; border-radius:10px; object-fit:cover; border:1px solid #ECEFF4; flex-shrink:0; background:#F1F5F9; }
  .yb-prop-title { font-weight:700; color:#1a335d; font-size:13.5px; display:flex; align-items:center; gap:6px; flex-wrap:wrap; }
  .yb-tag-listing { background:#EEF2FF; color:#4f46e5; font-size:10px; font-weight:700; padding:2px 7px; border-radius:6px; letter-spacing:.3px; text-transform:uppercase; }
  .yb-prop-loc { font-size:12px; color:#64748B; margin-top:3px; display:flex; align-items:center; gap:4px; }
  .yb-prop-loc svg { color:#94A3B8; }
  .yb-prop-loc .more { color:#1a335d; font-weight:600; }
  .yb-prop-size { font-size:11px; color:#94A3B8; margin-top:2px; }

  .yb-broker { display:flex; align-items:center; gap:10px; }
  .yb-avatar { width:38px; height:38px; border-radius:50%; background:linear-gradient(135deg,#1a335d,#2a4a7a); color:#fff; font-weight:700; display:inline-flex; align-items:center; justify-content:center; flex-shrink:0; font-size:14px; }
  .yb-avatar.sm { width:32px; height:32px; font-size:12px; border-radius:9px; }
  .yb-broker-name { font-weight:600; color:#1a335d; font-size:13px; }
  .yb-broker-meta { font-size:11.5px; color:#94A3B8; margin-top:2px; display:inline-flex; align-items:center; gap:4px; }

  .yb-price { font-weight:800; color:#1a335d; font-size:14px; }
  .yb-date-text { color:#64748B; font-size:12.5px; }

  .yb-status-select { position:relative; display:inline-flex; align-items:center; padding:0 26px 0 10px; border-radius:999px; font-weight:700; font-size:12px; height:30px; border:1.5px solid; cursor:pointer; }
  .yb-status-select select { background:transparent; border:none; outline:none; appearance:none; font-weight:700; font-size:12px; cursor:pointer; color:inherit; font-family:inherit; }
  .yb-status-select > svg { position:absolute; right:7px; pointer-events:none; }
  .yb-status-select.active { background:rgba(34,197,94,.10); color:#16a34a; border-color:rgba(34,197,94,.35); }
  .yb-status-select.sold   { background:rgba(239,68,68,.10); color:#ef4444; border-color:rgba(239,68,68,.35); }
  .yb-status-select.rented { background:rgba(245,158,11,.12); color:#d97706; border-color:rgba(245,158,11,.35); }

  .yb-actions-row { display:inline-flex; gap:6px; }
  .yb-icon-btn { width:34px; height:34px; border-radius:9px; background:#fff; border:1px solid #E2E8F0; display:inline-flex; align-items:center; justify-content:center; cursor:pointer; transition:all .15s; color:#64748B; }
  .yb-icon-btn.edit:hover { background:#EEF2FF; color:#4f46e5; border-color:#c7d2fe; }  /* ✅ blue tint for edit */
  .yb-icon-btn.del:hover  { background:#FEF2F2; color:#ef4444; border-color:#FECACA; }

  .yb-empty { text-align:center; padding:60px 20px; color:#64748B; display:flex; flex-direction:column; align-items:center; gap:10px; font-size:14px; }
  .yb-empty-ic { width:56px; height:56px; border-radius:14px; background:#F1F5F9; color:#94A3B8; display:inline-flex; align-items:center; justify-content:center; }
  .yb-empty h6 { margin:4px 0 0; font-size:15px; font-weight:700; color:#1a335d; }
  .yb-empty p { margin:0; font-size:13px; }

  .yb-modal-bg { position:fixed; inset:0; z-index:1100; background:rgba(15,23,42,.45); backdrop-filter:blur(4px); display:flex; align-items:center; justify-content:center; padding:20px; }
  .yb-modal { width:100%; max-width:560px; background:#fff; border-radius:18px; padding:24px; box-shadow:0 24px 60px rgba(15,23,42,.25); }
  .yb-modal.sm { max-width:440px; }
  .yb-modal-head { display:flex; align-items:flex-start; gap:14px; padding-bottom:16px; margin-bottom:16px; border-bottom:1px dashed #ECEFF4; }
  .yb-modal-foot { display:flex; justify-content:flex-end; gap:10px; }
  .yb-card-icon { width:44px; height:44px; border-radius:12px; flex-shrink:0; display:inline-flex; align-items:center; justify-content:center; background:rgba(239,68,68,.10); color:#ef4444; }
  .yb-card-title { margin:0 0 4px; font-size:16px; font-weight:700; color:#1a335d; }
  .yb-card-desc { margin:0; font-size:13px; color:#64748B; line-height:1.6; }

  @media(max-width:600px) {
    .yb-page-head-inner { padding:14px 16px 18px; }
    .yb-title { font-size:20px; }
    .yb-modal-foot { flex-direction:column-reverse; }
    .yb-modal-foot .yb-btn { width:100%; justify-content:center; }
  }
`;

export default AllProperty;