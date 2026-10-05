import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import axios from 'axios';
import {
  MapPin, Plus, X, Layers, Info, ListChecks,
  ArrowLeft, Save, ArrowRight, CheckCircle2,
} from 'lucide-react';

const AddLocality = () => {
  const [zone, setZone] = useState('');
  const [placeInput, setPlaceInput] = useState('');
  const [states, setStates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null); // { type, msg }

  const showToast = (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3000);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!zone.trim()) return showToast('error', 'Please enter a zone name');
    if (states.length === 0) return showToast('error', 'Please add at least one place');

    setLoading(true);
    try {
      const payload = { zone, state: states.join(', '), active: true };
      await axios.post(`${import.meta.env.VITE_API_URL}/locality/add`, payload);
      showToast('success', 'Locality added successfully!');
      setZone('');
      setStates([]);
    } catch (err) {
      console.error(err);
      showToast('error', 'Error adding locality');
    } finally {
      setLoading(false);
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
            <CheckCircle2 size={16} />
            {toast.msg}
          </div>
        )}

        {/* Page Header */}
        <div className="yb-page-head">
          <div className="yb-page-head-inner">
            <div className="yb-crumbs">
              <a href="/dashboard">Dashboard</a>
              <span>/</span>
              <a href="/all-locality">Localities</a>
              <span>/</span>
              <span className="active">Add New</span>
            </div>
            <div className="yb-head-row">
              <div>
                <h4 className="yb-title">Add New Locality</h4>
                <p className="yb-subtitle">
                  Define a zone and group its associated cities or places.
                </p>
              </div>
              <div className="yb-head-actions">
                <a href="/all-locality" className="yb-btn yb-btn-ghost">
                  <ArrowLeft size={15} /> Back
                </a>
                <a href="/all-locality" className="yb-btn yb-btn-primary">
                  <Layers size={15} /> All Localities
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="yb-body">
          <div className="yb-grid">
            {/* MAIN FORM CARD */}
            <div className="yb-card">
              <div className="yb-card-head">
                <div className="yb-card-icon"><MapPin size={18} /></div>
                <div>
                  <h5 className="yb-card-title">Locality Details</h5>
                  <p className="yb-card-desc">Provide a zone name and add the places that fall under it.</p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="yb-form">
                {/* Zone Name */}
                <div className="yb-field">
                  <label className="yb-label" htmlFor="zone">
                    Zone Name <span className="req">*</span>
                  </label>
                  <input
                    id="zone"
                    type="text"
                    className="yb-input"
                    placeholder="e.g. South Chennai"
                    value={zone}
                    onChange={(e) => setZone(e.target.value)}
                    required
                  />
                  <div className="yb-help">
                    Use a clear, descriptive name like "South Chennai" or "OMR Belt".
                  </div>
                </div>

                {/* Places */}
                <div className="yb-field">
                  <label className="yb-label">
                    Places / Cities <span className="req">*</span>
                  </label>

                  <div className="yb-chip-add">
                    <input
                      type="text"
                      className="yb-input"
                      placeholder="Type a place and press Enter"
                      value={placeInput}
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
                      <div className="yb-chip-empty">
                        <ListChecks size={16} />
                        No places added yet — type above and hit Enter.
                      </div>
                    ) : (
                      states.map((p, i) => (
                        <span key={i} className="yb-chip">
                          <MapPin size={11} /> {p}
                          <button
                            type="button"
                            onClick={() => removePlace(i)}
                            className="yb-chip-x"
                            aria-label={`Remove ${p}`}
                          >
                            <X size={12} />
                          </button>
                        </span>
                      ))
                    )}
                  </div>

                  <div className="yb-help">
                    Example: Adyar, Velachery, Guindy.{' '}
                    <strong style={{ color: '#0F172A' }}>{states.length}</strong>{' '}
                    place{states.length === 1 ? '' : 's'} added.
                  </div>
                </div>

                {/* Actions */}
                <div className="yb-actions">
                  <button
                    type="button"
                    onClick={() => { setZone(''); setStates([]); setPlaceInput(''); }}
                    className="yb-btn yb-btn-ghost"
                    disabled={loading}
                  >
                    Reset
                  </button>
                  <button
                    type="submit"
                    className="yb-btn yb-btn-primary lg"
                    disabled={loading}
                  >
                    {loading
                      ? (<><span className="yb-spin" /> Saving…</>)
                      : (<><Save size={15} /> Add Locality <ArrowRight size={15} /></>)
                    }
                  </button>
                </div>
              </form>
            </div>

            {/* SIDE: Live preview + tips */}
            <aside className="yb-side">
              <div className="yb-card">
                <div className="yb-card-head">
                  <div className="yb-card-icon dark"><Layers size={18} /></div>
                  <div>
                    <h5 className="yb-card-title">Live Preview</h5>
                    <p className="yb-card-desc">How this zone will appear in listings.</p>
                  </div>
                </div>

                <div className="yb-preview">
                  <div className="yb-preview-zone">
                    <MapPin size={14} />
                    {zone.trim() || 'Zone name'}
                  </div>
                  <div className="yb-preview-count">
                    {states.length} place{states.length === 1 ? '' : 's'}
                  </div>
                  <div className="yb-preview-list">
                    {states.length === 0 ? (
                      <div className="yb-preview-empty">No places added yet</div>
                    ) : (
                      states.slice(0, 6).map((p, i) => (
                        <span key={i} className="yb-preview-pill">{p}</span>
                      ))
                    )}
                    {states.length > 6 && (
                      <span className="yb-preview-pill more">+{states.length - 6} more</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="yb-card tips">
                <div className="yb-card-head">
                  <div className="yb-card-icon soft"><Info size={18} /></div>
                  <div>
                    <h5 className="yb-card-title">Tips</h5>
                    <p className="yb-card-desc">Make this locality easy to discover.</p>
                  </div>
                </div>
                <ul className="yb-tips">
                  <li><CheckCircle2 size={14} /> Use a recognizable, geographic name for the zone.</li>
                  <li><CheckCircle2 size={14} /> Add only places that actually belong to the zone.</li>
                  <li><CheckCircle2 size={14} /> Keep names consistent with the city's official spelling.</li>
                  <li><CheckCircle2 size={14} /> You can edit or deactivate a locality anytime.</li>
                </ul>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = `
  .yb-content { font-family: 'DM Sans', sans-serif; background: #F6F7FB; min-height: 100vh; }

  /* Toast */
  .yb-toast {
    position: fixed; top: 22px; right: 22px; z-index: 1000;
    display: flex; align-items: center; gap: 8px;
    padding: 12px 16px; border-radius: 12px;
    font-size: 13.5px; font-weight: 600; color: #fff;
    box-shadow: 0 12px 28px rgba(15,23,42,0.18);
    animation: slidein .25s ease;
  }
  .yb-toast.success { background: linear-gradient(135deg, #16a34a, #22c55e); }
  .yb-toast.error   { background: linear-gradient(135deg, #dc2626, #ef4444); }
  @keyframes slidein { from { transform: translateY(-10px); opacity: 0; } to { transform: none; opacity: 1; } }

  /* Page header */
  .yb-page-head {
    background: #fff; border-bottom: 1px solid #ECEFF4;
    position: sticky; top: 0; z-index: 5;
  }
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
  .yb-title {
    font-family: 'Playfair Display', serif; font-size: 26px;
    color: #0F172A; margin: 0;
  }
  .yb-subtitle { font-size: 13.5px; color: #64748B; margin: 4px 0 0; }
  .yb-head-actions { display: flex; gap: 10px; flex-wrap: wrap; }

  /* Buttons */
  .yb-btn {
    display: inline-flex; align-items: center; gap: 8px;
    padding: 10px 16px; border-radius: 10px;
    font-size: 13.5px; font-weight: 600; cursor: pointer; border: 1px solid transparent;
    text-decoration: none; transition: all .15s ease;
    white-space: nowrap;
  }
  .yb-btn.lg { padding: 12px 20px; font-size: 14.5px; border-radius: 12px; }
  .yb-btn-primary {
    background: linear-gradient(135deg, #ef4444, #dc2626); color: #fff;
    box-shadow: 0 8px 18px rgba(239,68,68,0.28);
  }
  .yb-btn-primary:hover:not(:disabled) {
    transform: translateY(-1px); box-shadow: 0 12px 22px rgba(239,68,68,0.34); color: #fff;
  }
  .yb-btn-primary:disabled { opacity: .65; cursor: not-allowed; }
  .yb-btn-ghost {
    background: #fff; color: #334155; border-color: #E2E8F0;
  }
  .yb-btn-ghost:hover { background: #F8FAFC; color: #0F172A; }

  .yb-spin {
    width: 14px; height: 14px; border-radius: 50%;
    border: 2px solid rgba(255,255,255,0.4); border-top-color: #fff;
    animation: yspin .7s linear infinite;
  }
  @keyframes yspin { to { transform: rotate(360deg); } }

  /* Body grid */
  .yb-body { padding: 28px; }
  .yb-grid {
    display: grid; grid-template-columns: minmax(0, 1.4fr) minmax(0, 1fr);
    gap: 24px; max-width: 1200px;
  }
  @media (max-width: 992px) { .yb-grid { grid-template-columns: 1fr; } }

  /* Cards */
  .yb-card {
    background: #fff; border: 1px solid #ECEFF4;
    border-radius: 16px; padding: 22px;
    box-shadow: 0 1px 2px rgba(15,23,42,0.03);
  }
  .yb-card + .yb-card { margin-top: 18px; }
  .yb-card-head {
    display: flex; align-items: flex-start; gap: 12px;
    padding-bottom: 16px; margin-bottom: 18px; border-bottom: 1px dashed #ECEFF4;
  }
  .yb-card-icon {
    width: 40px; height: 40px; border-radius: 12px; flex-shrink: 0;
    display: inline-flex; align-items: center; justify-content: center;
    background: rgba(239,68,68,0.10); color: #ef4444;
  }
  .yb-card-icon.dark { background: #0F172A; color: #fff; }
  .yb-card-icon.soft { background: rgba(99,102,241,0.10); color: #6366f1; }
  .yb-card-title { margin: 0; font-size: 16px; font-weight: 700; color: #0F172A; }
  .yb-card-desc { margin: 2px 0 0; font-size: 13px; color: #64748B; }

  /* Form */
  .yb-form { display: flex; flex-direction: column; gap: 22px; }
  .yb-field { display: flex; flex-direction: column; }
  .yb-label {
    font-size: 12.5px; font-weight: 700; letter-spacing: .3px;
    color: #334155; margin-bottom: 8px;
  }
  .yb-label .req { color: #ef4444; margin-left: 2px; }
  .yb-input {
    width: 100%; padding: 12px 14px; font-size: 14px;
    color: #0F172A; background: #F8FAFC;
    border: 1px solid #E2E8F0; border-radius: 10px; outline: none;
    transition: border-color .15s, box-shadow .15s, background .15s;
  }
  .yb-input::placeholder { color: #94A3B8; }
  .yb-input:focus {
    border-color: #ef4444; background: #fff;
    box-shadow: 0 0 0 4px rgba(239,68,68,0.10);
  }
  .yb-help { font-size: 12px; color: #94A3B8; margin-top: 8px; }

  /* Chip add row */
  .yb-chip-add {
    display: grid; grid-template-columns: 1fr auto; gap: 10px; align-items: stretch;
  }
  .yb-add-btn {
    display: inline-flex; align-items: center; gap: 6px;
    background: #0F172A; color: #fff; border: none; padding: 0 16px;
    border-radius: 10px; font-size: 13.5px; font-weight: 600; cursor: pointer;
    transition: background .15s;
  }
  .yb-add-btn:hover:not(:disabled) { background: #1E293B; }
  .yb-add-btn:disabled { opacity: .4; cursor: not-allowed; }

  /* Chips list */
  .yb-chips {
    display: flex; flex-wrap: wrap; gap: 8px;
    min-height: 56px; padding: 12px;
    background: #F8FAFC; border: 1px dashed #E2E8F0; border-radius: 12px;
    margin-top: 10px; align-items: center;
  }
  .yb-chips.empty { justify-content: center; }
  .yb-chip-empty {
    display: inline-flex; align-items: center; gap: 8px;
    color: #94A3B8; font-size: 13px; font-style: italic;
  }
  .yb-chip {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 6px 6px 6px 12px;
    background: #fff; color: #0F172A;
    border: 1px solid #FECACA; border-radius: 999px;
    font-size: 13px; font-weight: 600;
    box-shadow: 0 1px 2px rgba(15,23,42,0.04);
    transition: all .15s;
  }
  .yb-chip:hover { border-color: #ef4444; transform: translateY(-1px); }
  .yb-chip svg { color: #ef4444; }
  .yb-chip-x {
    width: 22px; height: 22px; border-radius: 50%;
    background: #FEF2F2; color: #ef4444; border: none; cursor: pointer;
    display: inline-flex; align-items: center; justify-content: center;
    transition: background .15s, color .15s;
  }
  .yb-chip-x:hover { background: #ef4444; color: #fff; }

  /* Actions */
  .yb-actions {
    display: flex; justify-content: flex-end; gap: 10px;
    padding-top: 8px; border-top: 1px solid #F1F5F9;
    margin-top: 6px; padding-top: 18px;
    flex-wrap: wrap;
  }

  /* Side panel */
  .yb-side { display: flex; flex-direction: column; }
  .yb-preview {
    background: #F8FAFC; border: 1px solid #ECEFF4; border-radius: 12px;
    padding: 16px;
  }
  .yb-preview-zone {
    display: inline-flex; align-items: center; gap: 6px;
    font-size: 15px; font-weight: 700; color: #0F172A;
  }
  .yb-preview-zone svg { color: #ef4444; }
  .yb-preview-count {
    font-size: 12px; color: #64748B; margin-top: 2px;
    text-transform: uppercase; letter-spacing: .5px; font-weight: 600;
  }
  .yb-preview-list {
    display: flex; flex-wrap: wrap; gap: 6px; margin-top: 12px;
  }
  .yb-preview-pill {
    background: #fff; color: #334155; border: 1px solid #E2E8F0;
    border-radius: 999px; padding: 4px 10px;
    font-size: 12px; font-weight: 500;
  }
  .yb-preview-pill.more {
    background: #0F172A; color: #fff; border-color: transparent;
  }
  .yb-preview-empty { font-size: 12.5px; color: #94A3B8; font-style: italic; }

  /* Tips */
  .yb-tips { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 10px; }
  .yb-tips li {
    display: flex; gap: 10px; align-items: flex-start;
    font-size: 13px; color: #475569; line-height: 1.5;
  }
  .yb-tips li svg { color: #22c55e; flex-shrink: 0; margin-top: 2px; }

  /* Mobile */
  @media (max-width: 600px) {
    .yb-page-head-inner { padding: 16px 18px 18px; }
    .yb-body { padding: 18px; }
    .yb-card { padding: 18px; }
    .yb-title { font-size: 22px; }
    .yb-actions { justify-content: stretch; }
    .yb-actions .yb-btn { flex: 1; justify-content: center; }
    .yb-chip-add { grid-template-columns: 1fr; }
  }
`;

export default AddLocality;