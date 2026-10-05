import React, { useState, useEffect, useMemo, useRef } from 'react';
import Sidebar from '../components/Sidebar';
import axios from 'axios';
import {
  Image as ImageIcon, Plus, Search, Pencil, Trash2, X, Link as LinkIcon,
  MousePointerClick, Upload, AlertTriangle, CheckCircle2, AlertCircle,
  Inbox, ExternalLink,
} from 'lucide-react';

const API = import.meta.env.VITE_API_URL;

const BannerSetting = () => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal]   = useState(false);
  const [editMode, setEditMode]     = useState(false);
  const [currentId, setCurrentId]   = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [saving, setSaving]         = useState(false);

  const [confirmDel, setConfirmDel] = useState(null);
  const [toast, setToast]           = useState(null);
  const [search, setSearch]         = useState('');

  const fileRef = useRef();

  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    button: '',
    url: '',
    profileImage: null,
  });

  // ── Fetch banners (UNCHANGED) ─────────────────
  const fetchBanners = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API}/banner/all`);
      setBanners(res.data.data || []);
    } catch (err) {
      console.error('Error fetching banners', err);
      showToast('Failed to load banners', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBanners(); }, []);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setFormData((prev) => ({ ...prev, profileImage: f }));
    setPreviewUrl(URL.createObjectURL(f));
  };

  const handleAddClick = () => {
    setEditMode(false);
    setCurrentId(null);
    setFormData({ title: '', subtitle: '', button: '', url: '', profileImage: null });
    setPreviewUrl(null);
    setShowModal(true);
  };

  const handleEditClick = (banner) => {
    setEditMode(true);
    setCurrentId(banner._id);
    setFormData({
      title: banner.title,
      subtitle: banner.subtitle,
      button: banner.button,
      url: banner.url,
      profileImage: null,
    });
    setPreviewUrl(banner.profileImage || null);
    setShowModal(true);
  };

  // ── Delete (UNCHANGED endpoint) ───────────────
  const handleDelete = async () => {
    if (!confirmDel) return;
    try {
      await axios.delete(`${API}/banner/delete/${confirmDel._id}`);
      showToast('Banner deleted successfully');
      setBanners((prev) => prev.filter((b) => b._id !== confirmDel._id));
    } catch (err) {
      showToast('Delete failed', 'error');
    } finally {
      setConfirmDel(null);
    }
  };

  // ── Submit (UNCHANGED endpoints + FormData) ───
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const data = new FormData();
    Object.keys(formData).forEach((key) => {
      if (formData[key] !== null) data.append(key, formData[key]);
    });

    try {
      if (editMode) {
        await axios.put(`${API}/banner/edit/${currentId}`, data);
        showToast('Banner updated successfully');
      } else {
        await axios.post(`${API}/banner/add`, data);
        showToast('Banner added successfully');
      }
      setShowModal(false);
      setPreviewUrl(null);
      fetchBanners();
    } catch (err) {
      showToast('Error saving banner', 'error');
    } finally {
      setSaving(false);
    }
  };

  const visible = useMemo(() => {
    if (!search) return banners;
    const q = search.toLowerCase();
    return banners.filter(
      (b) =>
        b.title?.toLowerCase().includes(q) ||
        b.subtitle?.toLowerCase().includes(q) ||
        b.button?.toLowerCase().includes(q)
    );
  }, [banners, search]);

  return (
    <div>
      <Sidebar />
      <link
        href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=Playfair+Display:wght@700&display=swap"
        rel="stylesheet"
      />
      <style>{styles}</style>

      <div className="yb-content">
        {/* Page Header */}
        <div className="yb-page-head">
          <div className="yb-page-head-inner">
            <div className="yb-crumbs">
              <a href="/dashboard">Dashboard</a><span>/</span>
              <span className="active">Banner Settings</span>
            </div>
            <div className="yb-head-row">
              <div>
                <h4 className="yb-title">Banner Settings</h4>
                <p className="yb-subtitle">
                  Manage and monitor every banner shown on your homepage.
                </p>
              </div>
              <div className="yb-head-actions">
                <button className="yb-btn yb-btn-primary" onClick={handleAddClick}>
                  <Plus size={15} /> Add New Banner
                </button>
              </div>
            </div>

            <div className="yb-stat-strip">
              <div className="yb-stat-pill">
                <div className="yb-stat-ic"><ImageIcon size={15} /></div>
                <div>
                  <div className="yb-stat-num">{banners.length}</div>
                  <div className="yb-stat-lbl">Total Banners</div>
                </div>
              </div>
              <div className="yb-search">
                <Search size={15} />
                <input
                  type="text"
                  placeholder="Search by title, subtitle, button..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                {search && (
                  <button className="yb-search-x" onClick={() => setSearch('')}>
                    <X size={14} />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="yb-body">
          <div className="yb-card">
            {loading ? (
              <div className="yb-empty">
                <span className="yb-spin dark" /> Loading banners…
              </div>
            ) : visible.length === 0 ? (
              <div className="yb-empty">
                <div className="yb-empty-ic"><Inbox size={28} /></div>
                <h6>{search ? 'No matching banners' : 'No banners yet'}</h6>
                <p>
                  {search
                    ? 'Try a different search term.'
                    : 'Add your first banner to get started.'}
                </p>
                {!search && (
                  <button className="yb-btn yb-btn-primary" onClick={handleAddClick} style={{ marginTop: 12 }}>
                    <Plus size={14}/> Add Banner
                  </button>
                )}
              </div>
            ) : (
              <div className="yb-table-wrap">
                <table className="yb-table">
                  <thead>
                    <tr>
                      <th>Banner</th>
                      <th>Button</th>
                      <th>Redirect URL</th>
                      <th className="ta-r">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visible.map((banner) => (
                      <tr key={banner._id}>
                        <td>
                          <div className="yb-banner-cell">
                            <div className="yb-banner-img">
                              {banner.profileImage ? (
                                <img src={banner.profileImage} alt={banner.title} />
                              ) : (
                                <ImageIcon size={20} />
                              )}
                            </div>
                            <div className="yb-banner-text">
                              <div className="yb-banner-title">{banner.title || 'Untitled'}</div>
                              <div className="yb-banner-sub">{banner.subtitle || '—'}</div>
                            </div>
                          </div>
                        </td>
                        <td>
                          {banner.button ? (
                            <span className="yb-pill">
                              <MousePointerClick size={11} /> {banner.button}
                            </span>
                          ) : (
                            <span className="yb-muted">—</span>
                          )}
                        </td>
                        <td>
                          {banner.url ? (
                            <a
                              href={banner.url}
                              target="_blank"
                              rel="noreferrer"
                              className="yb-url"
                              title={banner.url}
                            >
                              <LinkIcon size={11} />
                              <span>{banner.url}</span>
                              <ExternalLink size={10} />
                            </a>
                          ) : (
                            <span className="yb-muted">—</span>
                          )}
                        </td>
                        <td className="ta-r">
                          <div className="yb-actions-row">
                            <button
                              className="yb-icon-btn edit"
                              onClick={() => handleEditClick(banner)}
                              title="Edit"
                            >
                              <Pencil size={14} />
                            </button>
                            <button
                              className="yb-icon-btn del"
                              onClick={() => setConfirmDel(banner)}
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

      {/* ── Add / Edit Modal ── */}
      {showModal && (
        <div className="yb-modal-bg" onClick={() => setShowModal(false)}>
          <div className="yb-modal" onClick={(e) => e.stopPropagation()}>
            <div className="yb-modal-head">
              <div className="yb-modal-icon">
                <ImageIcon size={18} />
              </div>
              <div style={{ flex: 1 }}>
                <h5 className="yb-modal-title">
                  {editMode ? 'Edit Banner' : 'Create New Banner'}
                </h5>
                <p className="yb-modal-desc">
                  {editMode ? 'Update the banner details below.' : 'Fill in the details to add a new homepage banner.'}
                </p>
              </div>
              <button className="yb-modal-close" onClick={() => setShowModal(false)}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="yb-modal-body">
              {/* Image upload */}
              <div className="yb-field">
                <label className="yb-field-label">
                  Banner Image {!editMode && <span className="req">*</span>}
                </label>
                <div className="yb-upload-area">
                  <div
                    className={`yb-upload-preview ${previewUrl ? 'has-img' : ''}`}
                    onClick={() => fileRef.current?.click()}
                  >
                    {previewUrl ? (
                      <img src={previewUrl} alt="preview" />
                    ) : (
                      <>
                        <ImageIcon size={26} />
                        <span>Click to upload</span>
                      </>
                    )}
                  </div>
                  <div className="yb-upload-info">
                    <div className="yb-upload-title">
                      {previewUrl ? 'Looks great!' : 'Upload banner image'}
                    </div>
                    <div className="yb-upload-sub">
                      JPG or PNG, recommended 1600×600px.
                    </div>
                    <label className="yb-btn yb-btn-ghost" style={{ marginTop: 10 }}>
                      <Upload size={14} /> {previewUrl ? 'Change image' : 'Browse image'}
                      <input
                        type="file"
                        ref={fileRef}
                        hidden
                        accept="image/*"
                        onChange={handleFileChange}
                        required={!editMode}
                      />
                    </label>
                  </div>
                </div>
              </div>

              <div className="yb-field">
                <label className="yb-field-label">Title</label>
                <div className="yb-input">
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="e.g. Find your dream home today"
                  />
                </div>
              </div>

              <div className="yb-field">
                <label className="yb-field-label">Subtitle</label>
                <div className="yb-input">
                  <input
                    type="text"
                    name="subtitle"
                    value={formData.subtitle}
                    onChange={handleInputChange}
                    placeholder="e.g. Browse 10,000+ verified listings"
                  />
                </div>
              </div>

              <div className="yb-grid-2">
                <div className="yb-field">
                  <label className="yb-field-label">Button Text</label>
                  <div className="yb-input">
                    <MousePointerClick size={14} />
                    <input
                      type="text"
                      name="button"
                      value={formData.button}
                      onChange={handleInputChange}
                      placeholder="e.g. Explore Now"
                    />
                  </div>
                </div>

                <div className="yb-field">
                  <label className="yb-field-label">Redirect URL</label>
                  <div className="yb-input">
                    <LinkIcon size={14} />
                    <input
                      type="text"
                      name="url"
                      value={formData.url}
                      onChange={handleInputChange}
                      placeholder="https://..."
                    />
                  </div>
                </div>
              </div>

              <div className="yb-modal-foot">
                <button type="button" className="yb-btn yb-btn-ghost" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="yb-btn yb-btn-primary" disabled={saving}>
                  {saving
                    ? <><span className="yb-spin"/> Saving…</>
                    : editMode
                      ? <><Pencil size={14}/> Update Banner</>
                      : <><Plus size={14}/> Save Banner</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Delete Confirm ── */}
      {confirmDel && (
        <div className="yb-modal-bg" onClick={() => setConfirmDel(null)}>
          <div className="yb-modal sm" onClick={(e) => e.stopPropagation()}>
            <div className="yb-modal-head">
              <div className="yb-modal-icon" style={{ background: 'rgba(239,68,68,0.10)', color: '#ef4444' }}>
                <AlertTriangle size={18} />
              </div>
              <div style={{ flex: 1 }}>
                <h5 className="yb-modal-title">Delete this banner?</h5>
                <p className="yb-modal-desc">
                  "<strong>{confirmDel.title || 'Untitled'}</strong>" will be permanently removed from the homepage.
                </p>
              </div>
            </div>
            <div className="yb-modal-foot" style={{ borderTop: '1px solid #F1F5F9', paddingTop: 16 }}>
              <button className="yb-btn yb-btn-ghost" onClick={() => setConfirmDel(null)}>
                Cancel
              </button>
              <button className="yb-btn yb-btn-danger" onClick={handleDelete}>
                <Trash2 size={14} /> Yes, delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Toast ── */}
      {toast && (
        <div className={`yb-toast ${toast.type === 'error' ? 'error' : 'success'}`}>
          {toast.type === 'error' ? <AlertCircle size={16} /> : <CheckCircle2 size={16} />}
          <span>{toast.msg}</span>
        </div>
      )}
    </div>
  );
};

const styles = `
  .yb-content { font-family:'DM Sans', sans-serif; background:#F6F7FB; min-height:100vh; }

  /* Header */
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

  .yb-stat-strip {
    display:flex; align-items:center; gap:14px; margin-top:18px; flex-wrap:wrap;
  }
  .yb-stat-pill {
    display:flex; align-items:center; gap:10px;
    background:#F8FAFC; border:1px solid #ECEFF4; border-radius:12px;
    padding:10px 14px; flex-shrink:0;
  }
  .yb-stat-ic {
    width:34px; height:34px; border-radius:9px;
    background:rgba(26,51,93,.10); color:#1a335d;
    display:inline-flex; align-items:center; justify-content:center; flex-shrink:0;
  }
  .yb-stat-num { font-size:17px; font-weight:800; color:#1a335d; line-height:1; }
  .yb-stat-lbl { font-size:11px; color:#64748B; margin-top:3px; text-transform:uppercase; letter-spacing:.4px; font-weight:600; }

  /* Buttons */
  .yb-btn { display:inline-flex; align-items:center; gap:8px; padding:10px 18px; border-radius:10px;
    font-size:13.5px; font-weight:600; cursor:pointer; border:1px solid transparent;
    text-decoration:none; transition:all .15s; white-space:nowrap; font-family:inherit; }
  .yb-btn:disabled { opacity:.7; cursor:not-allowed; }
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
  .yb-body { padding:28px; max-width:1300px; }
  .yb-card { background:#fff; border:1px solid #ECEFF4; border-radius:16px; padding:22px; box-shadow:0 1px 2px rgba(15,23,42,.03); }

  /* Search */
  .yb-search { position:relative; display:flex; align-items:center; gap:8px;
    background:#F8FAFC; border:1px solid #E2E8F0; border-radius:10px;
    padding:0 12px; transition:all .15s; flex:1; min-width:240px; max-width:420px; }
  .yb-search:focus-within { border-color:#ef4444; background:#fff; box-shadow:0 0 0 4px rgba(239,68,68,.10); }
  .yb-search svg { color:#94A3B8; flex-shrink:0; }
  .yb-search input { flex:1; border:none; background:transparent; outline:none;
    padding:11px 0; font-size:13.5px; color:#0F172A; min-width:0; font-family:inherit; }
  .yb-search input::placeholder { color:#94A3B8; }
  .yb-search-x {
    background:none; border:none; cursor:pointer; color:#94A3B8;
    width:22px; height:22px; border-radius:50%;
    display:inline-flex; align-items:center; justify-content:center;
  }
  .yb-search-x:hover { background:#F1F5F9; color:#ef4444; }

  /* Table */
  .yb-table-wrap { overflow-x:auto; margin:-10px; padding:10px; }
  .yb-table { width:100%; border-collapse:separate; border-spacing:0; min-width:780px; }
  .yb-table thead th {
    text-align:left; font-size:11px; font-weight:700; color:#94A3B8;
    text-transform:uppercase; letter-spacing:.6px;
    padding:12px 16px; background:#F8FAFC;
    border-top:1px solid #ECEFF4; border-bottom:1px solid #ECEFF4;
  }
  .yb-table thead th:first-child { border-top-left-radius:10px; border-bottom-left-radius:10px; padding-left:18px; }
  .yb-table thead th:last-child  { border-top-right-radius:10px; border-bottom-right-radius:10px; padding-right:18px; }
  .yb-table tbody tr { transition:background .12s; }
  .yb-table tbody tr:hover { background:#FAFBFE; }
  .yb-table tbody td { padding:14px 16px; vertical-align:middle; border-bottom:1px solid #F1F5F9; font-size:13.5px; color:#1E293B; }
  .yb-table tbody td:first-child { padding-left:18px; }
  .yb-table tbody td:last-child  { padding-right:18px; }
  .yb-table tbody tr:last-child td { border-bottom:none; }
  .ta-r { text-align:right; }

  /* Banner cell */
  .yb-banner-cell { display:flex; align-items:center; gap:14px; }
  .yb-banner-img {
    width:88px; height:54px; border-radius:10px; flex-shrink:0;
    background:#F1F5F9; border:1px solid #ECEFF4; overflow:hidden;
    display:flex; align-items:center; justify-content:center; color:#94A3B8;
  }
  .yb-banner-img img { width:100%; height:100%; object-fit:cover; }
  .yb-banner-title { font-weight:700; color:#1a335d; font-size:14px; }
  .yb-banner-sub { font-size:12.5px; color:#64748B; margin-top:3px;
    overflow:hidden; text-overflow:ellipsis; display:-webkit-box;
    -webkit-line-clamp:1; -webkit-box-orient:vertical; max-width:300px; }

  .yb-pill {
    display:inline-flex; align-items:center; gap:5px;
    background:#EEF2FF; color:#4f46e5;
    font-size:11.5px; font-weight:700;
    padding:4px 10px; border-radius:99px;
  }
  .yb-muted { color:#94A3B8; font-size:12.5px; }

  .yb-url {
    display:inline-flex; align-items:center; gap:5px;
    color:#1a335d; font-size:12.5px; font-weight:600;
    text-decoration:none; max-width:240px;
    background:#F8FAFC; border:1px solid #E2E8F0;
    padding:5px 10px; border-radius:8px;
    transition:all .15s;
  }
  .yb-url span { white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:170px; }
  .yb-url:hover { background:#fff; color:#ef4444; border-color:#FECACA; }
  .yb-url svg { flex-shrink:0; color:#94A3B8; }
  .yb-url:hover svg { color:#ef4444; }

  /* Action buttons */
  .yb-actions-row { display:inline-flex; gap:6px; }
  .yb-icon-btn {
    width:34px; height:34px; border-radius:9px;
    background:#fff; border:1px solid #E2E8F0;
    display:inline-flex; align-items:center; justify-content:center;
    cursor:pointer; transition:all .15s; color:#64748B;
  }
  .yb-icon-btn.edit:hover { background:rgba(26,51,93,.08); color:#1a335d; border-color:#1a335d; }
  .yb-icon-btn.del:hover  { background:#FEF2F2; color:#ef4444; border-color:#FECACA; }

  /* Empty */
  .yb-empty {
    text-align:center; padding:60px 20px; color:#64748B;
    display:flex; flex-direction:column; align-items:center; gap:10px; font-size:14px;
  }
  .yb-empty-ic {
    width:56px; height:56px; border-radius:14px;
    background:#F1F5F9; color:#94A3B8;
    display:inline-flex; align-items:center; justify-content:center;
  }
  .yb-empty h6 { margin:4px 0 0; font-size:15px; font-weight:700; color:#1a335d; }
  .yb-empty p { margin:0; font-size:13px; }

  /* Modal */
  .yb-modal-bg {
    position:fixed; inset:0; z-index:1100;
    background:rgba(15,23,42,.45); backdrop-filter:blur(4px);
    display:flex; align-items:center; justify-content:center; padding:20px;
    overflow-y:auto;
  }
  .yb-modal {
    width:100%; max-width:620px; background:#fff; border-radius:18px;
    padding:0; box-shadow:0 24px 60px rgba(15,23,42,.25);
    max-height:90vh; overflow-y:auto;
  }
  .yb-modal.sm { max-width:440px; padding:22px; }
  .yb-modal-head {
    display:flex; align-items:flex-start; gap:12px;
    padding:22px 22px 16px; border-bottom:1px dashed #ECEFF4;
  }
  .yb-modal.sm .yb-modal-head { padding:0 0 16px; margin-bottom:18px; }
  .yb-modal-icon {
    width:40px; height:40px; border-radius:11px;
    background:rgba(239,68,68,.10); color:#ef4444;
    display:inline-flex; align-items:center; justify-content:center; flex-shrink:0;
  }
  .yb-modal-title { margin:0; font-size:16px; font-weight:700; color:#1a335d; }
  .yb-modal-desc { margin:2px 0 0; font-size:12.5px; color:#64748B; }
  .yb-modal-close {
    background:#F8FAFC; border:1px solid #E2E8F0; cursor:pointer;
    width:32px; height:32px; border-radius:9px; color:#64748B;
    display:inline-flex; align-items:center; justify-content:center;
    transition:all .15s; flex-shrink:0;
  }
  .yb-modal-close:hover { background:#FEF2F2; color:#ef4444; border-color:#FECACA; }
  .yb-modal-body { padding:18px 22px 22px; display:flex; flex-direction:column; gap:14px; }
  .yb-modal-foot {
    display:flex; justify-content:flex-end; gap:10px;
    margin-top:6px; padding-top:14px; border-top:1px dashed #ECEFF4;
  }

  /* Field */
  .yb-field { display:flex; flex-direction:column; gap:6px; min-width:0; }
  .yb-field-label { font-size:11px; font-weight:700; color:#64748B; text-transform:uppercase; letter-spacing:.5px; }
  .yb-field-label .req { color:#ef4444; margin-left:3px; }

  .yb-grid-2 { display:grid; grid-template-columns:1fr 1fr; gap:14px; }
  @media (max-width:560px) { .yb-grid-2 { grid-template-columns:1fr; } }

  .yb-input { display:flex; align-items:center; gap:8px; padding:0 12px;
    background:#F8FAFC; border:1px solid #E2E8F0; border-radius:10px; transition:all .15s; }
  .yb-input:focus-within { border-color:#ef4444; background:#fff; box-shadow:0 0 0 4px rgba(239,68,68,.10); }
  .yb-input svg { color:#94A3B8; flex-shrink:0; }
  .yb-input input { flex:1; border:none; background:transparent; outline:none;
    padding:11px 0; font-size:14px; color:#0F172A; font-family:inherit; min-width:0; }
  .yb-input input::placeholder { color:#94A3B8; }

  /* Upload */
  .yb-upload-area { display:flex; align-items:center; gap:16px; flex-wrap:wrap; }
  .yb-upload-preview {
    width:140px; height:88px; border-radius:12px; flex-shrink:0;
    background:#F8FAFC; border:2px dashed #E2E8F0; cursor:pointer;
    display:flex; flex-direction:column; align-items:center; justify-content:center;
    color:#94A3B8; font-size:11px; font-weight:600; gap:4px; overflow:hidden;
    transition:all .2s;
  }
  .yb-upload-preview:hover { border-color:#ef4444; color:#ef4444; background:#FEF2F2; }
  .yb-upload-preview.has-img { border-style:solid; border-color:#ef4444; padding:0; }
  .yb-upload-preview img { width:100%; height:100%; object-fit:cover; }
  .yb-upload-info { flex:1; min-width:180px; }
  .yb-upload-title { font-size:13.5px; font-weight:700; color:#1a335d; }
  .yb-upload-sub { font-size:12px; color:#64748B; margin-top:2px; }

  /* Toast */
  .yb-toast {
    position:fixed; bottom:28px; right:28px; z-index:9999;
    display:inline-flex; align-items:center; gap:10px;
    padding:14px 22px; border-radius:12px;
    font-size:13.5px; font-weight:600; color:#fff;
    box-shadow:0 16px 30px rgba(15,23,42,.20);
    animation:slideIn .25s ease-out;
  }
  .yb-toast.success { background:linear-gradient(135deg,#16a34a,#15803d); }
  .yb-toast.error   { background:linear-gradient(135deg,#ef4444,#dc2626); }
  @keyframes slideIn { from { transform:translateY(20px); opacity:0; } to { transform:translateY(0); opacity:1; } }

  /* Mobile */
  @media (max-width:600px) {
    .yb-page-head-inner { padding:16px 18px 18px; }
    .yb-body { padding:18px; }
    .yb-card { padding:14px; }
    .yb-title { font-size:22px; }
    .yb-modal-foot { flex-direction:column-reverse; }
    .yb-modal-foot .yb-btn { width:100%; justify-content:center; }
    .yb-toast { left:18px; right:18px; bottom:18px; }
  }
`;

export default BannerSetting;