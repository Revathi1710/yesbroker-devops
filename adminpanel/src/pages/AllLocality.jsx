import React, { useState, useEffect, useMemo } from 'react';
import Sidebar from '../components/Sidebar';
import axios from 'axios';
import {
  MapPin, Plus, Search, Pencil, Trash2, X, Layers,
  CheckCircle2, XCircle, AlertTriangle, Save, ArrowRight,
  Inbox,
} from 'lucide-react';

const API = import.meta.env.VITE_API_URL;

const AllLocality = () => {
  const [localities, setLocalities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all'); // all | active | inactive

  // Edit modal
  const [showModal, setShowModal] = useState(false);
  const [currentLocality, setCurrentLocality] = useState(null);
  const [zone, setZone] = useState('');
  const [placeInput, setPlaceInput] = useState('');
  const [states, setStates] = useState([]);
  const [saving, setSaving] = useState(false);

  // Delete confirm
  const [confirmDel, setConfirmDel] = useState(null); // locality object

  // Toast
  const [toast, setToast] = useState(null);
  const showToast = (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 2800);
  };

  const fetchLocalities = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/locality/all`);
      setLocalities(res.data.data || []);
    } catch (err) {
      console.error('Error fetching localities', err);
      showToast('error', 'Could not load localities');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLocalities(); }, []);

  // Filtered + searched list
  const visible = useMemo(() => {
    return localities.filter((l) => {
      if (filter === 'active' && !l.active) return false;
      if (filter === 'inactive' && l.active) return false;
      if (!query.trim()) return true;
      const q = query.toLowerCase();
      return (
        (l.zone || '').toLowerCase().includes(q) ||
        (l.state || '').toLowerCase().includes(q)
      );
    });
  }, [localities, query, filter]);

  // Stats
  const stats = useMemo(() => {
    const total = localities.length;
    const active = localities.filter((l) => l.active).length;
    const places = localities.reduce(
      (sum, l) => sum + (l.state ? l.state.split(',').filter(Boolean).length : 0),
      0
    );
    return { total, active, inactive: total - active, places };
  }, [localities]);

  // Edit handlers
  const handleEditClick = (loc) => {
    setCurrentLocality(loc);
    setZone(loc.zone);
    setStates((loc.state || '').split(',').map((s) => s.trim()).filter(Boolean));
    setPlaceInput('');
    setShowModal(true);
  };

  const handleAddPlace = (e) => {
    if (e.key === 'Enter' && placeInput.trim() !== '') {
      e.preventDefault();
      const v = placeInput.trim();
      if (!states.includes(v)) setStates([...states, v]);
      setPlaceInput('');
    }
  };

  const handleAddPlaceClick = () => {
    const v = placeInput.trim();
    if (v && !states.includes(v)) {
      setStates([...states, v]);
      setPlaceInput('');
    }
  };

  const removePlace = (i) => setStates(states.filter((_, idx) => idx !== i));

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!zone.trim()) return showToast('error', 'Zone name is required');
    if (states.length === 0) return showToast('error', 'Add at least one place');
    setSaving(true);
    try {
      const payload = { zone, state: states.join(', ') };
      await axios.put(`${API}/locality/update/${currentLocality._id}`, payload);
      setShowModal(false);
      showToast('success', 'Locality updated');
      fetchLocalities();
    } catch (err) {
      showToast('error', 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmDel) return;
    try {
      await axios.delete(`${API}/locality/delete/${confirmDel._id}`);
      setConfirmDel(null);
      showToast('success', 'Locality deleted');
      fetchLocalities();
    } catch (err) {
      showToast('error', 'Delete failed');
    }
  };

  return (
    <div>
      <Sidebar />
      <link
        href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=Playfair+Display:wght@700&display=swap"
        rel="stylesheet"
      />
      <style>{styles}</style>

      <div className="yb-content">
        {/* Toast */}
        {toast && (
          <div className={`yb-toast ${toast.type}`}>
            {toast.type === 'success' ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
            {toast.msg}
          </div>
        )}

        {/* Page Header */}
        <div className="yb-page-head">
          <div className="yb-page-head-inner">
            <div className="yb-crumbs">
              <a href="/dashboard">Dashboard</a>
              <span>/</span>
              <span className="active">Localities</span>
            </div>

            <div className="yb-head-row">
              <div>
                <h4 className="yb-title">All Localities</h4>
                <p className="yb-subtitle">
                  Manage zones and the cities or places served under each.
                </p>
              </div>
              <div className="yb-head-actions">
                <a href="/add-locality" className="yb-btn yb-btn-primary">
                  <Plus size={15} /> Add Locality
                </a>
              </div>
            </div>

            {/* Stat tiles */}
            <div className="yb-stats">
              <div className="yb-stat">
                <div className="yb-stat-ic"><Layers size={16} /></div>
                <div>
                  <div className="yb-stat-num">{stats.total}</div>
                  <div className="yb-stat-lbl">Total Zones</div>
                </div>
              </div>
              <div className="yb-stat">
                <div className="yb-stat-ic green"><CheckCircle2 size={16} /></div>
                <div>
                  <div className="yb-stat-num">{stats.active}</div>
                  <div className="yb-stat-lbl">Active</div>
                </div>
              </div>
              <div className="yb-stat">
                <div className="yb-stat-ic gray"><XCircle size={16} /></div>
                <div>
                  <div className="yb-stat-num">{stats.inactive}</div>
                  <div className="yb-stat-lbl">Inactive</div>
                </div>
              </div>
              <div className="yb-stat">
                <div className="yb-stat-ic red"><MapPin size={16} /></div>
                <div>
                  <div className="yb-stat-num">{stats.places}</div>
                  <div className="yb-stat-lbl">Places Mapped</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="yb-body">
          {/* Toolbar */}
          <div className="yb-toolbar">
            <div className="yb-search">
              <Search size={15} />
              <input
                type="text"
                placeholder="Search by zone or place..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              {query && (
                <button onClick={() => setQuery('')} className="yb-search-x" aria-label="Clear">
                  <X size={14} />
                </button>
              )}
            </div>

            <div className="yb-tabs">
              {[
                { k: 'all', label: 'All' },
                { k: 'active', label: 'Active' },
                { k: 'inactive', label: 'Inactive' },
              ].map((t) => (
                <button
                  key={t.k}
                  className={`yb-tab ${filter === t.k ? 'active' : ''}`}
                  onClick={() => setFilter(t.k)}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Table card */}
          <div className="yb-card">
            {loading ? (
              <div className="yb-empty"><span className="yb-spin dark" /> Loading localities…</div>
            ) : visible.length === 0 ? (
              <div className="yb-empty">
                <div className="yb-empty-ic"><Inbox size={28} /></div>
                <h6>No localities found</h6>
                <p>{query ? 'Try a different search term.' : 'Add your first zone to get started.'}</p>
                {!query && (
                  <a href="/add-locality" className="yb-btn yb-btn-primary" style={{ marginTop: 6 }}>
                    <Plus size={15} /> Add Locality
                  </a>
                )}
              </div>
            ) : (
              <div className="yb-table-wrap">
                <table className="yb-table">
                  <thead>
                    <tr>
                      <th>Zone</th>
                      <th>Places / Cities</th>
                      <th className="ta-c">Status</th>
                      <th className="ta-r">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visible.map((loc) => {
                      const places = (loc.state || '').split(',').map((s) => s.trim()).filter(Boolean);
                      return (
                        <tr key={loc._id}>
                          <td>
                            <div className="yb-zone">
                              <div className="yb-zone-ic"><MapPin size={14} /></div>
                              <div>
                                <div className="yb-zone-name">{loc.zone}</div>
                                <div className="yb-zone-meta">
                                  {places.length} place{places.length === 1 ? '' : 's'}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td>
                            <div className="yb-places">
                              {places.slice(0, 6).map((p, i) => (
                                <span key={i} className="yb-pill">{p}</span>
                              ))}
                              {places.length > 6 && (
                                <span className="yb-pill more">+{places.length - 6}</span>
                              )}
                            </div>
                          </td>
                          <td className="ta-c">
                            <span className={`yb-status ${loc.active ? 'on' : 'off'}`}>
                              <span className="dot" />
                              {loc.active ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="ta-r">
                            <div className="yb-actions-row">
                              <button
                                className="yb-icon-btn edit"
                                onClick={() => handleEditClick(loc)}
                                aria-label="Edit"
                                title="Edit"
                              >
                                <Pencil size={14} />
                              </button>
                              <button
                                className="yb-icon-btn del"
                                onClick={() => setConfirmDel(loc)}
                                aria-label="Delete"
                                title="Delete"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* EDIT MODAL */}
      {showModal && (
        <div className="yb-modal-bg" onClick={() => !saving && setShowModal(false)}>
          <div className="yb-modal" onClick={(e) => e.stopPropagation()}>
            <div className="yb-modal-head">
              <div className="yb-card-icon"><Pencil size={18} /></div>
              <div style={{ flex: 1 }}>
                <h5 className="yb-card-title">Edit Locality</h5>
                <p className="yb-card-desc">Update the zone name or its places.</p>
              </div>
              <button className="yb-modal-x" onClick={() => setShowModal(false)} aria-label="Close">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleUpdate} className="yb-form">
              <div className="yb-field">
                <label className="yb-label">Zone Name <span className="req">*</span></label>
                <input
                  type="text"
                  className="yb-input"
                  value={zone}
                  onChange={(e) => setZone(e.target.value)}
                  placeholder="e.g. South Chennai"
                  required
                />
              </div>

              <div className="yb-field">
                <label className="yb-label">Places / Cities <span className="req">*</span></label>
                <div className="yb-chip-add">
                  <input
                    type="text"
                    className="yb-input"
                    value={placeInput}
                    placeholder="Type a place and press Enter"
                    onChange={(e) => setPlaceInput(e.target.value)}
                    onKeyDown={handleAddPlace}
                  />
                  <button
                    type="button"
                    onClick={handleAddPlaceClick}
                    className="yb-add-btn"
                    disabled={!placeInput.trim()}
                  >
                    <Plus size={15} /> Add
                  </button>
                </div>
                <div className={`yb-chips ${states.length === 0 ? 'empty' : ''}`}>
                  {states.length === 0 ? (
                    <div className="yb-chip-empty">No places — add at least one.</div>
                  ) : (
                    states.map((p, i) => (
                      <span key={i} className="yb-chip">
                        <MapPin size={11} /> {p}
                        <button
                          type="button"
                          className="yb-chip-x"
                          onClick={() => removePlace(i)}
                          aria-label={`Remove ${p}`}
                        >
                          <X size={12} />
                        </button>
                      </span>
                    ))
                  )}
                </div>
                <div className="yb-help">{states.length} place{states.length === 1 ? '' : 's'} in this zone.</div>
              </div>

              <div className="yb-modal-foot">
                <button
                  type="button"
                  className="yb-btn yb-btn-ghost"
                  onClick={() => setShowModal(false)}
                  disabled={saving}
                >
                  Cancel
                </button>
                <button type="submit" className="yb-btn yb-btn-primary" disabled={saving}>
                  {saving
                    ? (<><span className="yb-spin" /> Updating…</>)
                    : (<><Save size={15} /> Update Locality <ArrowRight size={14} /></>)
                  }
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRM */}
      {confirmDel && (
        <div className="yb-modal-bg" onClick={() => setConfirmDel(null)}>
          <div className="yb-modal sm" onClick={(e) => e.stopPropagation()}>
            <div className="yb-modal-head">
              <div className="yb-card-icon" style={{ background: 'rgba(239,68,68,0.10)', color: '#ef4444' }}>
                <AlertTriangle size={18} />
              </div>
              <div style={{ flex: 1 }}>
                <h5 className="yb-card-title">Delete this locality?</h5>
                <p className="yb-card-desc">
                  "<strong>{confirmDel.zone}</strong>" will be permanently removed.
                </p>
              </div>
            </div>
            <div className="yb-modal-foot" style={{ borderTop: '1px solid #F1F5F9', paddingTop: 16 }}>
              <button className="yb-btn yb-btn-ghost" onClick={() => setConfirmDel(null)}>Cancel</button>
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

const styles = `
  .yb-content { font-family: 'DM Sans', sans-serif; background: #F6F7FB; min-height: 100vh; }

  /* Toast */
  .yb-toast {
    position: fixed; top: 22px; right: 22px; z-index: 1200;
    display: flex; align-items: center; gap: 8px;
    padding: 12px 16px; border-radius: 12px;
    font-size: 13.5px; font-weight: 600; color: #fff;
    box-shadow: 0 12px 28px rgba(15,23,42,0.18);
    animation: ybslide .25s ease;
  }
  .yb-toast.success { background: linear-gradient(135deg, #16a34a, #22c55e); }
  .yb-toast.error   { background: linear-gradient(135deg, #dc2626, #ef4444); }
  @keyframes ybslide { from { transform: translateY(-10px); opacity: 0; } to { transform: none; opacity: 1; } }

  /* Page header */
  .yb-page-head { background: #fff; border-bottom: 1px solid #ECEFF4; }
  .yb-page-head-inner { padding: 18px 28px 22px; }
  .yb-crumbs {
    display: flex; flex-wrap: wrap; align-items: center; gap: 6px;
    font-size: 12px; color: #94A3B8; margin-bottom: 8px;
  }
  .yb-crumbs a { color: #64748B; text-decoration: none; font-weight: 500; }
  .yb-crumbs a:hover { color: #ef4444; }
  .yb-crumbs .active { color: #0F172A; font-weight: 600; }

  .yb-head-row {
    display: flex; align-items: center; justify-content: space-between; gap: 16px; flex-wrap: wrap;
  }
  .yb-title { font-family: 'Playfair Display', serif; font-size: 26px; color: #0F172A; margin: 0; }
  .yb-subtitle { font-size: 13.5px; color: #64748B; margin: 4px 0 0; }
  .yb-head-actions { display: flex; gap: 10px; flex-wrap: wrap; }

  /* Stat tiles */
  .yb-stats {
    display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-top: 18px;
  }
  @media (max-width: 720px) { .yb-stats { grid-template-columns: repeat(2, 1fr); } }
  .yb-stat {
    display: flex; align-items: center; gap: 12px;
    background: #F8FAFC; border: 1px solid #ECEFF4; border-radius: 12px; padding: 12px 14px;
  }
  .yb-stat-ic {
    width: 36px; height: 36px; border-radius: 10px; flex-shrink: 0;
    display: inline-flex; align-items: center; justify-content: center;
    background: rgba(99,102,241,0.10); color: #6366f1;
  }
  .yb-stat-ic.green { background: rgba(34,197,94,0.10); color: #16a34a; }
  .yb-stat-ic.red   { background: rgba(239,68,68,0.10); color: #ef4444; }
  .yb-stat-ic.gray  { background: rgba(148,163,184,0.18); color: #64748B; }
  .yb-stat-num { font-size: 18px; font-weight: 800; color: #0F172A; line-height: 1; }
  .yb-stat-lbl { font-size: 11.5px; color: #64748B; margin-top: 4px; text-transform: uppercase; letter-spacing: .4px; font-weight: 600; }

  /* Buttons */
  .yb-btn {
    display: inline-flex; align-items: center; gap: 8px;
    padding: 10px 16px; border-radius: 10px;
    font-size: 13.5px; font-weight: 600; cursor: pointer; border: 1px solid transparent;
    text-decoration: none; transition: all .15s ease; white-space: nowrap;
  }
  .yb-btn-primary {
    background: linear-gradient(135deg, #ef4444, #dc2626); color: #fff;
    box-shadow: 0 8px 18px rgba(239,68,68,0.28);
  }
  .yb-btn-primary:hover:not(:disabled) {
    transform: translateY(-1px); box-shadow: 0 12px 22px rgba(239,68,68,0.34); color: #fff;
  }
  .yb-btn-primary:disabled { opacity: .65; cursor: not-allowed; }
  .yb-btn-ghost { background: #fff; color: #334155; border-color: #E2E8F0; }
  .yb-btn-ghost:hover { background: #F8FAFC; color: #0F172A; }
  .yb-btn-danger { background: #ef4444; color: #fff; }
  .yb-btn-danger:hover { background: #dc2626; color: #fff; }

  .yb-spin {
    width: 14px; height: 14px; border-radius: 50%;
    border: 2px solid rgba(255,255,255,0.4); border-top-color: #fff;
    animation: ybspin .7s linear infinite;
  }
  .yb-spin.dark { border-color: rgba(15,23,42,0.15); border-top-color: #0F172A; }
  @keyframes ybspin { to { transform: rotate(360deg); } }

  /* Body */
  .yb-body { padding: 28px; max-width: 1400px; }

  /* Toolbar */
  .yb-toolbar {
    display: flex; align-items: center; justify-content: space-between; gap: 12px;
    margin-bottom: 14px; flex-wrap: wrap;
  }
  .yb-search {
    position: relative; flex: 1 1 280px; max-width: 380px;
    display: flex; align-items: center;
    background: #fff; border: 1px solid #E2E8F0; border-radius: 10px;
    padding: 0 12px; transition: border-color .15s, box-shadow .15s;
  }
  .yb-search:focus-within { border-color: #ef4444; box-shadow: 0 0 0 4px rgba(239,68,68,0.10); }
  .yb-search svg { color: #94A3B8; flex-shrink: 0; }
  .yb-search input {
    flex: 1; border: none; background: transparent; outline: none;
    padding: 10px 8px; font-size: 13.5px; color: #0F172A;
  }
  .yb-search input::placeholder { color: #94A3B8; }
  .yb-search-x {
    background: none; border: none; cursor: pointer; color: #94A3B8;
    width: 22px; height: 22px; border-radius: 50%;
    display: inline-flex; align-items: center; justify-content: center;
  }
  .yb-search-x:hover { background: #F1F5F9; color: #ef4444; }

  .yb-tabs {
    display: inline-flex; padding: 4px;
    background: #fff; border: 1px solid #E2E8F0; border-radius: 10px;
  }
  .yb-tab {
    background: none; border: none; cursor: pointer;
    padding: 8px 14px; border-radius: 7px;
    font-size: 13px; font-weight: 600; color: #64748B;
    transition: all .15s;
  }
  .yb-tab:hover { color: #0F172A; }
  .yb-tab.active { background: #0F172A; color: #fff; }

  /* Card */
  .yb-card {
    background: #fff; border: 1px solid #ECEFF4;
    border-radius: 16px; padding: 22px;
    box-shadow: 0 1px 2px rgba(15,23,42,0.03);
  }
  .yb-card-icon {
    width: 40px; height: 40px; border-radius: 12px; flex-shrink: 0;
    display: inline-flex; align-items: center; justify-content: center;
    background: rgba(239,68,68,0.10); color: #ef4444;
  }
  .yb-card-title { margin: 0; font-size: 16px; font-weight: 700; color: #0F172A; }
  .yb-card-desc { margin: 2px 0 0; font-size: 13px; color: #64748B; }

  /* Table */
  .yb-table-wrap { overflow-x: auto; margin: -10px -10px; padding: 10px; }
  .yb-table {
    width: 100%; border-collapse: separate; border-spacing: 0;
    min-width: 720px;
  }
  .yb-table thead th {
    text-align: left; font-size: 11px; font-weight: 700;
    color: #94A3B8; text-transform: uppercase; letter-spacing: 0.6px;
    padding: 12px 16px; background: #F8FAFC;
    border-top: 1px solid #ECEFF4; border-bottom: 1px solid #ECEFF4;
  }
  .yb-table thead th:first-child { border-top-left-radius: 10px; border-bottom-left-radius: 10px; padding-left: 18px; }
  .yb-table thead th:last-child  { border-top-right-radius: 10px; border-bottom-right-radius: 10px; padding-right: 18px; }
  .yb-table tbody tr { transition: background .12s; }
  .yb-table tbody tr:hover { background: #FAFBFE; }
  .yb-table tbody td {
    padding: 14px 16px; vertical-align: middle;
    border-bottom: 1px solid #F1F5F9; font-size: 13.5px; color: #1E293B;
  }
  .yb-table tbody td:first-child { padding-left: 18px; }
  .yb-table tbody td:last-child  { padding-right: 18px; }
  .yb-table tbody tr:last-child td { border-bottom: none; }
  .ta-c { text-align: center; } .ta-r { text-align: right; }

  /* Zone cell */
  .yb-zone { display: flex; align-items: center; gap: 12px; }
  .yb-zone-ic {
    width: 36px; height: 36px; border-radius: 10px; flex-shrink: 0;
    display: inline-flex; align-items: center; justify-content: center;
    background: rgba(239,68,68,0.10); color: #ef4444;
  }
  .yb-zone-name { font-weight: 700; color: #0F172A; }
  .yb-zone-meta { font-size: 11.5px; color: #94A3B8; margin-top: 2px; }

  /* Place pills */
  .yb-places { display: flex; flex-wrap: wrap; gap: 6px; max-width: 480px; }
  .yb-pill {
    background: #F1F5F9; color: #334155; border-radius: 999px;
    padding: 4px 10px; font-size: 12px; font-weight: 500;
  }
  .yb-pill.more { background: #0F172A; color: #fff; }

  /* Status */
  .yb-status {
    display: inline-flex; align-items: center; gap: 6px;
    font-size: 12px; font-weight: 700; letter-spacing: .3px;
    padding: 5px 10px; border-radius: 999px;
  }
  .yb-status .dot { width: 6px; height: 6px; border-radius: 50%; }
  .yb-status.on  { background: rgba(34,197,94,0.10); color: #16a34a; }
  .yb-status.on .dot  { background: #22c55e; box-shadow: 0 0 0 3px rgba(34,197,94,0.18); }
  .yb-status.off { background: rgba(148,163,184,0.16); color: #64748B; }
  .yb-status.off .dot { background: #94A3B8; }

  /* Actions */
  .yb-actions-row { display: inline-flex; gap: 6px; }
  .yb-icon-btn {
    width: 34px; height: 34px; border-radius: 9px;
    background: #fff; border: 1px solid #E2E8F0;
    display: inline-flex; align-items: center; justify-content: center;
    cursor: pointer; transition: all .15s; color: #64748B;
  }
  .yb-icon-btn.edit:hover { background: #EEF2FF; color: #4f46e5; border-color: #C7D2FE; }
  .yb-icon-btn.del:hover  { background: #FEF2F2; color: #ef4444; border-color: #FECACA; }

  /* Empty */
  .yb-empty {
    text-align: center; padding: 60px 20px; color: #64748B;
    display: flex; flex-direction: column; align-items: center; gap: 10px;
    font-size: 14px;
  }
  .yb-empty-ic {
    width: 56px; height: 56px; border-radius: 14px;
    background: #F1F5F9; color: #94A3B8;
    display: inline-flex; align-items: center; justify-content: center;
  }
  .yb-empty h6 { margin: 4px 0 0; font-size: 15px; font-weight: 700; color: #0F172A; }
  .yb-empty p  { margin: 0; font-size: 13px; }

  /* Modal */
  .yb-modal-bg {
    position: fixed; inset: 0; z-index: 1100;
    background: rgba(15,23,42,0.45); backdrop-filter: blur(4px);
    display: flex; align-items: center; justify-content: center;
    padding: 20px; animation: ybfade .15s ease;
  }
  @keyframes ybfade { from { opacity: 0; } to { opacity: 1; } }
  .yb-modal {
    width: 100%; max-width: 560px;
    background: #fff; border-radius: 18px; padding: 22px;
    box-shadow: 0 24px 60px rgba(15,23,42,0.25);
    animation: ybpop .18s ease;
  }
  .yb-modal.sm { max-width: 440px; }
  @keyframes ybpop { from { transform: translateY(8px) scale(.98); opacity: 0; } to { transform: none; opacity: 1; } }
  .yb-modal-head {
    display: flex; align-items: flex-start; gap: 12px;
    padding-bottom: 16px; margin-bottom: 18px;
    border-bottom: 1px dashed #ECEFF4;
  }
  .yb-modal-x {
    background: #F8FAFC; border: 1px solid #E2E8F0; cursor: pointer;
    width: 32px; height: 32px; border-radius: 8px;
    display: inline-flex; align-items: center; justify-content: center;
    color: #64748B;
  }
  .yb-modal-x:hover { background: #FEF2F2; color: #ef4444; border-color: #FECACA; }
  .yb-modal-foot {
    display: flex; justify-content: flex-end; gap: 10px;
    margin-top: 18px;
  }

  /* Form (shared with edit modal) */
  .yb-form { display: flex; flex-direction: column; gap: 18px; }
  .yb-field { display: flex; flex-direction: column; }
  .yb-label { font-size: 12.5px; font-weight: 700; letter-spacing: .3px; color: #334155; margin-bottom: 8px; }
  .yb-label .req { color: #ef4444; margin-left: 2px; }
  .yb-input {
    width: 100%; padding: 12px 14px; font-size: 14px;
    color: #0F172A; background: #F8FAFC;
    border: 1px solid #E2E8F0; border-radius: 10px; outline: none;
    transition: border-color .15s, box-shadow .15s, background .15s;
  }
  .yb-input::placeholder { color: #94A3B8; }
  .yb-input:focus { border-color: #ef4444; background: #fff; box-shadow: 0 0 0 4px rgba(239,68,68,0.10); }
  .yb-help { font-size: 12px; color: #94A3B8; margin-top: 8px; }

  .yb-chip-add { display: grid; grid-template-columns: 1fr auto; gap: 10px; }
  .yb-add-btn {
    display: inline-flex; align-items: center; gap: 6px;
    background: #0F172A; color: #fff; border: none; padding: 0 16px;
    border-radius: 10px; font-size: 13.5px; font-weight: 600; cursor: pointer;
  }
  .yb-add-btn:hover:not(:disabled) { background: #1E293B; }
  .yb-add-btn:disabled { opacity: .4; cursor: not-allowed; }

  .yb-chips {
    display: flex; flex-wrap: wrap; gap: 8px;
    min-height: 56px; padding: 12px;
    background: #F8FAFC; border: 1px dashed #E2E8F0; border-radius: 12px;
    margin-top: 10px; align-items: center;
  }
  .yb-chips.empty { justify-content: center; }
  .yb-chip-empty { color: #94A3B8; font-size: 13px; font-style: italic; }
  .yb-chip {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 6px 6px 6px 12px;
    background: #fff; color: #0F172A;
    border: 1px solid #FECACA; border-radius: 999px;
    font-size: 13px; font-weight: 600;
    box-shadow: 0 1px 2px rgba(15,23,42,0.04);
  }
  .yb-chip svg { color: #ef4444; }
  .yb-chip-x {
    width: 22px; height: 22px; border-radius: 50%;
    background: #FEF2F2; color: #ef4444; border: none; cursor: pointer;
    display: inline-flex; align-items: center; justify-content: center;
  }
  .yb-chip-x:hover { background: #ef4444; color: #fff; }

  /* Mobile */
  @media (max-width: 600px) {
    .yb-page-head-inner { padding: 16px 18px 18px; }
    .yb-body { padding: 18px; }
    .yb-card { padding: 16px; }
    .yb-title { font-size: 22px; }
    .yb-toolbar { flex-direction: column; align-items: stretch; }
    .yb-search { max-width: none; }
    .yb-tabs { width: 100%; justify-content: space-between; }
    .yb-tab { flex: 1; text-align: center; }
    .yb-modal-foot { flex-direction: column-reverse; }
    .yb-modal-foot .yb-btn { width: 100%; justify-content: center; }
  }
`;

export default AllLocality;