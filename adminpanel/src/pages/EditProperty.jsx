import React, { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AreasOfOperation from "../components/AreasOfOperation";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import {
  Home, User, MapPin, IndianRupee, Image as ImageIcon, Send,
  Search, X, CheckCircle2, AlertCircle, UploadCloud, Trash2,
  Building2, Tag, Ruler, FileText, Sparkles, ChevronRight, Loader2,
} from "lucide-react";

const API = import.meta.env.VITE_API_URL;
const ZONE_ORDER = [
  "South Chennai", "Central Chennai", "West Chennai",
  "North Chennai", "East Chennai / OMR / ECR",
];

const LISTING_TYPES = [
  { id: "Sell",       label: "Sell",       icon: <Tag size={14} /> },
  { id: "Rent",       label: "Rent",       icon: <Home size={14} /> },
  { id: "PG",         label: "PG",         icon: <User size={14} /> },
  { id: "Commercial", label: "Commercial", icon: <Building2 size={14} /> },
  { id: "plots",      label: "Plots",      icon: <MapPin size={14} /> },
];
const PROPERTY_TYPES = ["Apartment", "Independent House", "Villa", "Plot", "Commercial"];
const STATUSES       = ["Active", "Sold", "Rented"];

/* ─── Toast ──────────────────────────────────────────── */
const Toast = ({ toast }) =>
  !toast ? null : (
    <div className={`yb-toast ${toast.type === "danger" ? "error" : "success"}`}>
      {toast.type === "danger" ? <AlertCircle size={16} /> : <CheckCircle2 size={16} />}
      <span>{toast.msg}</span>
    </div>
  );

/* ─── Section Card ────────────────────────────────────── */
const Section = ({ number, icon, title, desc, children }) => (
  <div className="yb-section">
    <div className="yb-section-head">
      <div className="yb-section-num">{number}</div>
      <div className="yb-section-ic">{icon}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="yb-section-title">{title}</div>
        {desc && <div className="yb-section-desc">{desc}</div>}
      </div>
    </div>
    <div className="yb-section-body">{children}</div>
  </div>
);

/* ─── Broker Search Select ───────────────────────────── */
const BrokerSearchSelect = ({ brokers, selectedBroker, onSelect, onClear }) => {
  const [search, setSearch] = useState("");
  const [open,   setOpen]   = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const getInitials = (name = "") =>
    name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();

  const filtered = useMemo(
    () => brokers.filter(
      (b) =>
        b.name?.toLowerCase().includes(search.toLowerCase()) ||
        b.phone?.includes(search)
    ),
    [brokers, search]
  );

  return (
    <div>
      {selectedBroker && (
        <div className="yb-broker-chip">
          <div className="yb-avatar">{getInitials(selectedBroker.name)}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="yb-broker-name">{selectedBroker.name}</div>
            <div className="yb-broker-phone">{selectedBroker.phone}</div>
          </div>
          <span className="yb-broker-tag">Assigned</span>
          <button type="button" className="yb-broker-x" onClick={onClear}>
            <X size={14} />
          </button>
        </div>
      )}

      <div ref={ref} style={{ position: "relative" }}>
        <div className="yb-input">
          <Search size={14} />
          <input
            type="text"
            placeholder="Search broker by name or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onFocus={() => setOpen(true)}
          />
        </div>

        {open && (
          <div className="yb-dropdown">
            {filtered.length === 0 ? (
              <div className="yb-dropdown-empty">No brokers found</div>
            ) : (
              filtered.map((b) => {
                const isSel = selectedBroker?._id === b._id;
                return (
                  <div
                    key={b._id}
                    className={`yb-dropdown-item ${isSel ? "selected" : ""}`}
                    onMouseDown={() => { onSelect(b); setSearch(""); setOpen(false); }}
                  >
                    <div className={`yb-avatar sm ${isSel ? "active" : ""}`}>
                      {getInitials(b.name)}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="yb-dd-name">{b.name}</div>
                      <div className="yb-dd-phone">{b.phone}</div>
                    </div>
                    {isSel && <CheckCircle2 size={16} color="#ef4444" />}
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
};

/* ─── Existing Photo Grid ────────────────────────────── */
const ExistingPhotoGrid = ({ photos, onRemove }) => {
  if (!photos.length) return null;
  return (
    <div>
      <p style={{ fontSize: 11, fontWeight: 700, color: "#64748B", textTransform: "uppercase", letterSpacing: ".5px", marginBottom: 10 }}>
        Current Photos ({photos.length})
      </p>
      <div className="yb-thumbs">
        {photos.map((url, idx) => (
          <div key={url} className="yb-thumb">
            <img src={url} alt={`existing-${idx}`} />
            {idx === 0 && <span className="yb-thumb-badge">COVER</span>}
            <button type="button" className="yb-thumb-x" onClick={() => onRemove(url)} title="Remove photo">
              <Trash2 size={12} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ─── Main Component ─────────────────────────────────── */
const EditProperty = () => {
  const { id }   = useParams();          // ✅ get property id from URL
  const navigate = useNavigate();         // ✅ for redirect after save

  /* ── Form state ── */
  const [formData, setFormData] = useState({
    listingType:  "Sell",
    propertyType: "",
    localities:   [],
    size:         "",
    price:        "",
    description:  "",
    status:       "Active",
  });

  /* ── Photo state ── */
  const [existingPhotos, setExistingPhotos] = useState([]);  // ✅ URLs from DB
  const [removedPhotos,  setRemovedPhotos]  = useState([]);  // ✅ URLs to delete
  const [newPhotos,      setNewPhotos]      = useState([]);  // ✅ new File objects
  const [newPreviews,    setNewPreviews]    = useState([]);  // ✅ blob URLs for preview

  /* ── Other state ── */
  const [brokers,        setBrokers]        = useState([]);
  const [selectedBroker, setSelectedBroker] = useState(null);
  const [zones,          setZones]          = useState({});
  const [zoneKeys,       setZoneKeys]       = useState([]);
  const [loadingZones,   setLoadingZones]   = useState(true);
  const [loading,        setLoading]        = useState(true);   // ✅ page-load state
  const [submitting,     setSubmitting]     = useState(false);
  const [toast,          setToast]          = useState(null);

  const totalPhotos = existingPhotos.length + newPhotos.length;

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  /* ── 1. Fetch all brokers ── */
  useEffect(() => {
    axios.get(`${API}/allbrokers`, { withCredentials: true })
      .then(({ data }) => { if (data.success) setBrokers(data.data); })
      .catch((err) => console.error("Brokers fetch error:", err));
  }, []);

  /* ── 2. Fetch localities ── */
  useEffect(() => {
    axios.get(`${API}/locality/all`, { withCredentials: true })
      .then(({ data }) => {
        const grouped = {};
        data.data.filter((item) => item.active).forEach((item) => {
          const zoneName = item.zone?.trim();
          if (!zoneName) return;
          if (!grouped[zoneName]) grouped[zoneName] = { label: zoneName, locs: [] };
          if (typeof item.state === "string") {
            item.state.split(",").map((s) => s.trim()).filter(Boolean).forEach((loc) => {
              if (!grouped[zoneName].locs.includes(loc)) grouped[zoneName].locs.push(loc);
            });
          }
        });
        const ordered = [
          ...ZONE_ORDER.filter((k) => grouped[k]),
          ...Object.keys(grouped).filter((k) => !ZONE_ORDER.includes(k)),
        ];
        setZones(grouped);
        setZoneKeys(ordered);
      })
      .catch((err) => console.error("Locality fetch error:", err))
      .finally(() => setLoadingZones(false));
  }, []);

  /* ── 3. Fetch existing property data ── */
  useEffect(() => {
    if (!id) return;
    setLoading(true);
    axios.get(`${API}/propertyadmin/${id}`, { withCredentials: true })
      .then(({ data }) => {
        const prop = data.data ?? data;

        setFormData({
          listingType:  prop.listingType  || "Sell",
          propertyType: prop.propertyType || "",
          localities:   prop.localities   || [],
          size:         prop.size         || "",
          price:        prop.price        || "",
          description:  prop.description  || "",
          status:       prop.status       || "Active",
        });

        setExistingPhotos(prop.photos || []);

        // ✅ Pre-select broker if property has one
        if (prop.broker && brokers.length > 0) {
          const brokerId = typeof prop.broker === "object" ? prop.broker._id : prop.broker;
          const match = brokers.find((b) => b._id === brokerId);
          if (match) setSelectedBroker(match);
        }
      })
      .catch((err) => {
        console.error("Property fetch error:", err);
        showToast("Failed to load property details.", "danger");
      })
      .finally(() => setLoading(false));
  }, [id, brokers]); // re-run when brokers load so broker can be pre-selected

  /* ── Handlers ── */
  const handleChange = (e) =>
    setFormData((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleLocalityChange = (selectedList) =>
    setFormData((f) => ({ ...f, localities: selectedList }));

  /* Remove an EXISTING (already-uploaded) photo */
  const handleRemoveExisting = (url) => {
    setExistingPhotos((prev) => prev.filter((u) => u !== url));
    setRemovedPhotos((prev) => [...prev, url]);
  };

  /* Add NEW photos */
  const handleNewPhotos = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + totalPhotos > 5) {
      showToast("Maximum 5 photos allowed.", "danger");
      e.target.value = "";
      return;
    }
    setNewPhotos((prev) => [...prev, ...files]);
    setNewPreviews((prev) => [...prev, ...files.map((f) => URL.createObjectURL(f))]);
    e.target.value = "";
  };

  /* Remove a NEW (not yet uploaded) photo */
  const handleRemoveNew = (idx) => {
    setNewPhotos((prev)    => prev.filter((_, i) => i !== idx));
    setNewPreviews((prev)  => prev.filter((_, i) => i !== idx));
  };

  /* ── Progress ── */
  const progress = useMemo(() => {
    let done = 0;
    if (formData.listingType)         done++;
    if (formData.propertyType)        done++;
    if (selectedBroker)               done++;
    if (formData.localities.length)   done++;
    if (formData.price && formData.size) done++;
    if (totalPhotos > 0 || formData.description) done++;
    return Math.round((done / 6) * 100);
  }, [formData, selectedBroker, totalPhotos]);

  /* ── Submit ── */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.localities.length) { showToast("Please select a locality.", "danger"); return; }
    if (!selectedBroker)             { showToast("Please assign a broker.", "danger");   return; }

    setSubmitting(true);

    const fd = new FormData();
    // Scalar fields
    fd.append("listingType",  formData.listingType);
    fd.append("propertyType", formData.propertyType);
    fd.append("localities",   JSON.stringify(formData.localities));
    fd.append("size",         formData.size);
    fd.append("price",        formData.price);
    fd.append("description",  formData.description);
    fd.append("status",       formData.status);
    fd.append("broker_id",    selectedBroker._id);                    // ✅ broker update

    // Tell backend which old photos to delete
    if (removedPhotos.length) {
      fd.append("removedPhotos", JSON.stringify(removedPhotos));       // ✅ removed photos
    }

    // New files to upload
    newPhotos.forEach((photo) => fd.append("photos", photo));

    try {
      await axios.put(`${API}/propertyadmin/${id}`, fd, {              // ✅ admin endpoint — no ownership check
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      });
      showToast("Property updated successfully!");
      setTimeout(() => navigate("/all-property"), 1200);
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.message || "Failed to update property.", "danger");
    } finally {
      setSubmitting(false);
    }
  };

  /* ── Loading screen ── */
  if (loading) {
    return (
      <div style={{ display: "flex" }}>
        <Sidebar />
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", fontFamily: "'DM Sans', sans-serif" }}>
          <div style={{ textAlign: "center" }}>
            <Loader2 size={36} style={{ color: "#ef4444", animation: "ybspin .8s linear infinite" }} />
            <p style={{ marginTop: 12, color: "#64748B", fontSize: 14 }}>Loading property details…</p>
          </div>
        </div>
      </div>
    );
  }

  /* ── Render ── */
  return (
    <div style={{ display: "flex" }}>
      <Sidebar />

      <div style={{ flex: 1, minWidth: 0 }}>
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=Playfair+Display:wght@700&display=swap"
          rel="stylesheet"
        />
        <style>{styles}</style>
        <Toast toast={toast} />

        <div className="yb-content">
          {/* ── Sticky Header ── */}
          <div className="yb-page-head">
            <div className="yb-page-head-inner">
              <div className="yb-crumbs">
                <a href="/dashboard">Dashboard</a><span>/</span>
                <a href="/allproperty">Properties</a><span>/</span>
                <span className="active">Edit Property</span>
              </div>
              <div className="yb-head-row">
                <div>
                  <h4 className="yb-title">Edit Property</h4>
                  <p className="yb-subtitle">Update details — changes are saved on submission.</p>
                </div>
                <div className="yb-head-actions">
                  <button type="button" className="yb-btn yb-btn-ghost" onClick={() => navigate(-1)}>
                    <ChevronRight size={14} style={{ transform: "rotate(180deg)" }} />
                    Back
                  </button>
                </div>
              </div>

              <div className="yb-progress-strip">
                <div className="yb-progress-info">
                  <Sparkles size={14} />
                  <span>Listing completion</span>
                  <strong>{progress}%</strong>
                </div>
                <div className="yb-progress-bar">
                  <div className="yb-progress-fill" style={{ width: `${progress}%` }} />
                </div>
              </div>
            </div>
          </div>

          {/* ── Form ── */}
          <form onSubmit={handleSubmit} className="yb-body">

            {/* Section 1 — Basic Details */}
            <Section number="1" icon={<Home size={16} />} title="Basic Details"
              desc="Update the listing type and property category.">
              <div className="yb-field">
                <label className="yb-field-label">I want to…</label>
                <div className="yb-chip-row">
                  {LISTING_TYPES.map((t) => (
                    <button
                      key={t.id} type="button"
                      className={`yb-chip ${formData.listingType === t.id ? "active" : ""}`}
                      onClick={() => setFormData((f) => ({ ...f, listingType: t.id }))}
                    >
                      {t.icon} {t.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="yb-grid-2">
                <div className="yb-field">
                  <label className="yb-field-label">Property Type <span className="req">*</span></label>
                  <div className="yb-input">
                    <Building2 size={14} />
                    <select name="propertyType" value={formData.propertyType} onChange={handleChange} required>
                      <option value="">Select Type</option>
                      {PROPERTY_TYPES.map((o) => <option key={o}>{o}</option>)}
                    </select>
                  </div>
                </div>

                <div className="yb-field">
                  <label className="yb-field-label">Listing Status</label>
                  <div className="yb-input">
                    <Tag size={14} />
                    <select name="status" value={formData.status} onChange={handleChange}>
                      {STATUSES.map((s) => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
              </div>
            </Section>

            {/* Section 2 — Assign Broker */}
            <Section number="2" icon={<User size={16} />} title="Assigned Broker"
              desc="Change or keep the broker handling this property.">
              <BrokerSearchSelect
                brokers={brokers}
                selectedBroker={selectedBroker}
                onSelect={setSelectedBroker}
                onClear={() => setSelectedBroker(null)}
              />
            </Section>

            {/* Section 3 — Location */}
            <Section number="3" icon={<MapPin size={16} />} title="Property Location"
              desc="Update the zone and locality of this property.">
              {formData.localities.length > 0 && (
                <div className="yb-selected-row">
                  <span className="yb-selected-label">SELECTED:</span>
                  <span className="yb-selected-pill">
                    <MapPin size={11} /> {formData.localities[0]}
                    <button type="button" onClick={() => setFormData((f) => ({ ...f, localities: [] }))}>
                      <X size={12} />
                    </button>
                  </span>
                </div>
              )}
              <div className="overflow-hidden">
                <AreasOfOperation
                  selected={formData.localities}
                  onChange={handleLocalityChange}
                  zones={zones}
                  zoneKeys={zoneKeys}
                  loadingZones={loadingZones}
                  singleSelect={true}
                />
              </div>
            </Section>

            {/* Section 4 — Price & Area */}
            <Section number="4" icon={<IndianRupee size={16} />} title="Price & Area"
              desc="Update the price and total area of this property.">
              <div className="yb-grid-2">
                <div className="yb-field">
                  <label className="yb-field-label">Total Price <span className="req">*</span></label>
                  <div className="yb-input prefix">
                    <span className="yb-input-affix">₹</span>
                    <input type="number" name="price" placeholder="e.g. 5000000"
                      value={formData.price} onChange={handleChange} required min="0" />
                  </div>
                </div>
                <div className="yb-field">
                  <label className="yb-field-label">Area / Size <span className="req">*</span></label>
                  <div className="yb-input suffix">
                    <Ruler size={14} />
                    <input type="text" name="size" placeholder="e.g. 1200"
                      value={formData.size} onChange={handleChange} required />
                    <span className="yb-input-affix right">Sq. Ft</span>
                  </div>
                </div>
              </div>
            </Section>

            {/* Section 5 — Media & Description */}
            <Section number="5" icon={<ImageIcon size={16} />} title="Media & Description"
              desc="Remove old photos or add new ones. Up to 5 total.">

              {/* Description */}
              <div className="yb-field">
                <label className="yb-field-label">
                  <FileText size={11} style={{ marginRight: 4, verticalAlign: "-1px" }} />
                  Description
                </label>
                <div className="yb-textarea">
                  <textarea name="description" rows="4"
                    placeholder="Mention key features: corner plot, near metro, parking, furnished..."
                    value={formData.description} onChange={handleChange} />
                </div>
              </div>

              {/* Existing photos — with individual remove */}
              <ExistingPhotoGrid photos={existingPhotos} onRemove={handleRemoveExisting} />

              {/* Removed photos notice */}
              {removedPhotos.length > 0 && (
                <div style={{
                  background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 10,
                  padding: "10px 14px", fontSize: 13, color: "#dc2626", fontWeight: 600,
                  display: "flex", alignItems: "center", gap: 8,
                }}>
                  <Trash2 size={14} />
                  {removedPhotos.length} photo{removedPhotos.length > 1 ? "s" : ""} marked for removal — will be deleted on save.
                </div>
              )}

              {/* New photo upload */}
              <div className="yb-field">
                <label className="yb-field-label">
                  Add New Photos
                  <span className="yb-count">{totalPhotos}/5</span>
                </label>
                <div
                  className={`yb-dropzone ${totalPhotos >= 5 ? "disabled" : ""}`}
                  onClick={() => totalPhotos < 5 && document.getElementById("fileInputEdit").click()}
                >
                  <input type="file" multiple hidden id="fileInputEdit"
                    onChange={handleNewPhotos} accept="image/*" />
                  <div className="yb-dropzone-ic"><UploadCloud size={26} /></div>
                  <div className="yb-dropzone-title">
                    {totalPhotos >= 5 ? "Maximum 5 photos reached" : "Click to upload new photos"}
                  </div>
                  <div className="yb-dropzone-sub">
                    JPG or PNG · {5 - totalPhotos} slot{5 - totalPhotos !== 1 ? "s" : ""} remaining
                  </div>
                </div>

                {/* New photo previews */}
                {newPreviews.length > 0 && (
                  <div>
                    <p style={{ fontSize: 11, fontWeight: 700, color: "#64748B", textTransform: "uppercase", letterSpacing: ".5px", margin: "14px 0 8px" }}>
                      New Photos ({newPreviews.length})
                    </p>
                    <div className="yb-thumbs">
                      {newPreviews.map((src, idx) => (
                        <div key={idx} className="yb-thumb">
                          <img src={src} alt={`new-${idx}`} />
                          <span className="yb-thumb-badge" style={{ background: "linear-gradient(135deg,#16a34a,#15803d)" }}>NEW</span>
                          <button type="button" className="yb-thumb-x" onClick={() => handleRemoveNew(idx)}>
                            <Trash2 size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Section>

            {/* Sticky Footer */}
            <div className="yb-foot">
              <div className="yb-foot-inner">
                <div className="yb-foot-info">
                  <Sparkles size={14} />
                  {progress < 100
                    ? `${progress}% complete — fill remaining sections for better reach`
                    : "All set! Ready to save changes."}
                </div>
                <div className="yb-foot-actions">
                  <button type="button" className="yb-btn yb-btn-ghost" onClick={() => navigate(-1)}>
                    Cancel
                  </button>
                  <button type="submit" className="yb-btn yb-btn-primary" disabled={submitting}>
                    {submitting
                      ? <><span className="yb-spin" /> Saving…</>
                      : <><Send size={14} /> Save Changes</>}
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

/* ─── Styles ─────────────────────────────────────────── */
const styles = `
  .yb-content { font-family:'DM Sans',sans-serif; background:#F6F7FB; min-height:100vh; padding-bottom:90px; }

  .yb-page-head { background:#fff; border-bottom:1px solid #ECEFF4; position:sticky; top:0; z-index:50; }
  .yb-page-head-inner { padding:16px 28px 18px; }
  .yb-crumbs { display:flex; flex-wrap:wrap; align-items:center; gap:6px; font-size:12px; color:#94A3B8; margin-bottom:8px; }
  .yb-crumbs a { color:#64748B; text-decoration:none; font-weight:500; }
  .yb-crumbs a:hover { color:#ef4444; }
  .yb-crumbs .active { color:#1a335d; font-weight:600; }
  .yb-head-row { display:flex; align-items:center; justify-content:space-between; gap:16px; flex-wrap:wrap; }
  .yb-title { font-family:'Playfair Display',serif; font-size:24px; color:#1a335d; margin:0; }
  .yb-subtitle { font-size:13px; color:#64748B; margin:4px 0 0; }
  .yb-head-actions { display:flex; gap:10px; flex-wrap:wrap; }

  .yb-progress-strip { margin-top:14px; }
  .yb-progress-info { display:flex; align-items:center; gap:8px; font-size:12.5px; color:#64748B; margin-bottom:6px; }
  .yb-progress-info svg { color:#ef4444; }
  .yb-progress-info strong { color:#1a335d; margin-left:auto; font-size:13px; }
  .yb-progress-bar { height:6px; border-radius:99px; background:#F1F5F9; overflow:hidden; }
  .yb-progress-fill { height:100%; background:linear-gradient(90deg,#ef4444,#dc2626); border-radius:99px; transition:width .3s; }

  .yb-btn { display:inline-flex; align-items:center; gap:8px; padding:10px 18px; border-radius:10px;
    font-size:13.5px; font-weight:600; cursor:pointer; border:1px solid transparent;
    text-decoration:none; transition:all .15s; white-space:nowrap; font-family:inherit; }
  .yb-btn:disabled { opacity:.7; cursor:not-allowed; }
  .yb-btn-primary { background:linear-gradient(135deg,#ef4444,#dc2626); color:#fff; box-shadow:0 8px 18px rgba(239,68,68,.28); }
  .yb-btn-primary:hover:not(:disabled) { transform:translateY(-1px); box-shadow:0 12px 22px rgba(239,68,68,.34); color:#fff; }
  .yb-btn-ghost { background:#fff; color:#334155; border-color:#E2E8F0; }
  .yb-btn-ghost:hover { background:#F8FAFC; color:#1a335d; }
  .yb-spin { width:14px; height:14px; border-radius:50%; border:2px solid rgba(255,255,255,.4); border-top-color:#fff; animation:ybspin .7s linear infinite; }
  @keyframes ybspin { to { transform:rotate(360deg); } }

  .yb-body { padding:24px 28px; max-width:1100px; display:flex; flex-direction:column; gap:18px; }

  .yb-section { background:#fff; border:1px solid #ECEFF4; border-radius:16px; overflow:hidden; box-shadow:0 1px 2px rgba(15,23,42,.03); }
  .yb-section-head { display:flex; align-items:center; gap:12px; padding:18px 22px; border-bottom:1px dashed #ECEFF4; background:linear-gradient(180deg,#FAFBFE 0%,#fff 100%); }
  .yb-section-num { width:30px; height:30px; border-radius:9px; background:linear-gradient(135deg,#ef4444,#dc2626); color:#fff; display:inline-flex; align-items:center; justify-content:center; font-weight:800; font-size:13px; flex-shrink:0; box-shadow:0 4px 10px rgba(239,68,68,.25); }
  .yb-section-ic { width:34px; height:34px; border-radius:9px; background:rgba(26,51,93,.10); color:#1a335d; display:inline-flex; align-items:center; justify-content:center; flex-shrink:0; }
  .yb-section-title { font-size:15px; font-weight:700; color:#1a335d; }
  .yb-section-desc  { font-size:12.5px; color:#64748B; margin-top:2px; }
  .yb-section-body { padding:22px; display:flex; flex-direction:column; gap:18px; }

  .yb-field { display:flex; flex-direction:column; gap:6px; min-width:0; }
  .yb-field-label { font-size:11px; font-weight:700; color:#64748B; text-transform:uppercase; letter-spacing:.5px; display:flex; align-items:center; }
  .yb-field-label .req { color:#ef4444; margin-left:3px; }
  .yb-count { margin-left:auto; font-size:11px; font-weight:700; color:#1a335d; background:#F1F5F9; padding:3px 8px; border-radius:99px; letter-spacing:0; }

  .yb-grid-2 { display:grid; grid-template-columns:1fr 1fr; gap:14px; }
  @media(max-width:640px) { .yb-grid-2 { grid-template-columns:1fr; } }

  .yb-input { display:flex; align-items:center; gap:8px; padding:0 12px; background:#F8FAFC; border:1px solid #E2E8F0; border-radius:10px; transition:all .15s; }
  .yb-input:focus-within { border-color:#ef4444; background:#fff; box-shadow:0 0 0 4px rgba(239,68,68,.10); }
  .yb-input > svg { color:#94A3B8; flex-shrink:0; }
  .yb-input input, .yb-input select { flex:1; border:none; background:transparent; outline:none; padding:11px 0; font-size:14px; color:#0F172A; font-family:inherit; min-width:0; appearance:none; }
  .yb-input select { cursor:pointer; padding-right:18px; background-image:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'><polyline points='6 9 12 15 18 9'></polyline></svg>"); background-repeat:no-repeat; background-position:right center; }
  .yb-input input::placeholder { color:#94A3B8; }
  .yb-input-affix { font-size:14px; font-weight:700; color:#64748B; padding-right:6px; border-right:1px solid #E2E8F0; padding-block:11px; }
  .yb-input-affix.right { border-right:none; border-left:1px solid #E2E8F0; padding:11px 0 11px 10px; font-size:12.5px; color:#94A3B8; font-weight:600; }

  .yb-textarea { background:#F8FAFC; border:1px solid #E2E8F0; border-radius:10px; padding:10px 12px; transition:all .15s; }
  .yb-textarea:focus-within { border-color:#ef4444; background:#fff; box-shadow:0 0 0 4px rgba(239,68,68,.10); }
  .yb-textarea textarea { width:100%; border:none; background:transparent; outline:none; resize:vertical; font-size:14px; color:#0F172A; font-family:inherit; min-height:90px; }
  .yb-textarea textarea::placeholder { color:#94A3B8; }

  .yb-chip-row { display:flex; flex-wrap:wrap; gap:8px; }
  .yb-chip { display:inline-flex; align-items:center; gap:6px; padding:9px 16px; border-radius:99px; background:#F8FAFC; border:1px solid #E2E8F0; font-size:13px; font-weight:600; color:#475569; cursor:pointer; transition:all .15s; font-family:inherit; }
  .yb-chip:hover { border-color:#ef4444; color:#ef4444; }
  .yb-chip.active { background:linear-gradient(135deg,#ef4444,#dc2626); color:#fff; border-color:transparent; box-shadow:0 6px 14px rgba(239,68,68,.22); }

  .yb-broker-chip { display:flex; align-items:center; gap:12px; padding:12px 14px; margin-bottom:14px; background:linear-gradient(135deg,#FEF2F2,#FEE2E2); border:1px solid #FECACA; border-radius:12px; }
  .yb-avatar { width:38px; height:38px; border-radius:50%; background:#1a335d; color:#fff; display:inline-flex; align-items:center; justify-content:center; font-weight:700; font-size:13px; flex-shrink:0; }
  .yb-avatar.sm { width:34px; height:34px; font-size:12px; background:#F1F5F9; color:#1a335d; }
  .yb-avatar.sm.active { background:linear-gradient(135deg,#ef4444,#dc2626); color:#fff; }
  .yb-broker-name { font-weight:700; font-size:14px; color:#1a335d; }
  .yb-broker-phone { font-size:12px; color:#64748B; }
  .yb-broker-tag { background:#fff; color:#ef4444; border:1px solid #FECACA; font-size:10.5px; font-weight:700; padding:3px 8px; border-radius:99px; text-transform:uppercase; letter-spacing:.4px; }
  .yb-broker-x { background:#fff; border:1px solid #FECACA; border-radius:8px; width:28px; height:28px; cursor:pointer; color:#ef4444; display:inline-flex; align-items:center; justify-content:center; }
  .yb-broker-x:hover { background:#ef4444; color:#fff; }

  .yb-dropdown { position:absolute; top:calc(100% + 6px); left:0; right:0; z-index:200; background:#fff; border:1px solid #ECEFF4; border-radius:12px; box-shadow:0 16px 30px rgba(15,23,42,.10); max-height:260px; overflow-y:auto; padding:6px; }
  .yb-dropdown-empty { text-align:center; padding:18px; font-size:13px; color:#94A3B8; }
  .yb-dropdown-item { display:flex; align-items:center; gap:10px; padding:10px 12px; border-radius:9px; cursor:pointer; transition:background .12s; }
  .yb-dropdown-item:hover { background:#F8FAFC; }
  .yb-dropdown-item.selected { background:#FEF2F2; }
  .yb-dd-name { font-size:14px; font-weight:600; color:#1e293b; }
  .yb-dd-phone { font-size:12px; color:#64748b; margin-top:2px; }

  .yb-selected-row { display:flex; align-items:center; gap:10px; margin-bottom:14px; flex-wrap:wrap; }
  .yb-selected-label { font-size:11px; font-weight:700; color:#64748B; letter-spacing:.5px; }
  .yb-selected-pill { display:inline-flex; align-items:center; gap:6px; background:linear-gradient(135deg,#1a335d,#0f1f3d); color:#fff; font-size:12.5px; font-weight:600; padding:6px 12px; border-radius:99px; }
  .yb-selected-pill button { background:rgba(255,255,255,.18); border:none; color:#fff; width:18px; height:18px; border-radius:50%; cursor:pointer; display:inline-flex; align-items:center; justify-content:center; padding:0; }
  .yb-selected-pill button:hover { background:rgba(255,255,255,.32); }

  .yb-dropzone { border:2px dashed #CBD5E1; border-radius:14px; background:#F8FAFC; padding:30px 18px; text-align:center; cursor:pointer; transition:all .2s; }
  .yb-dropzone:hover { border-color:#ef4444; background:#FEF2F2; }
  .yb-dropzone.disabled { opacity:.55; cursor:not-allowed; }
  .yb-dropzone.disabled:hover { border-color:#CBD5E1; background:#F8FAFC; }
  .yb-dropzone-ic { width:54px; height:54px; border-radius:14px; background:#fff; border:1px solid #E2E8F0; color:#ef4444; display:inline-flex; align-items:center; justify-content:center; margin-bottom:10px; }
  .yb-dropzone-title { font-weight:700; color:#1a335d; font-size:14px; }
  .yb-dropzone-sub { font-size:12.5px; color:#64748B; margin-top:4px; }

  .yb-thumbs { display:flex; flex-wrap:wrap; gap:10px; }
  .yb-thumb { position:relative; width:104px; height:104px; border-radius:12px; overflow:hidden; border:1px solid #E2E8F0; flex-shrink:0; background:#F1F5F9; }
  .yb-thumb img { width:100%; height:100%; object-fit:cover; display:block; }
  .yb-thumb-x { position:absolute; top:6px; right:6px; background:rgba(15,23,42,.85); border:none; color:#fff; width:24px; height:24px; border-radius:50%; cursor:pointer; display:flex; align-items:center; justify-content:center; }
  .yb-thumb-x:hover { background:#ef4444; }
  .yb-thumb-badge { position:absolute; bottom:6px; left:6px; background:linear-gradient(135deg,#ef4444,#dc2626); color:#fff; font-size:9.5px; font-weight:800; padding:3px 7px; border-radius:5px; letter-spacing:.5px; }

  .yb-foot { position:fixed; left:250px; right:0; bottom:0; z-index:60; background:rgba(255,255,255,.96); border-top:1px solid #ECEFF4; backdrop-filter:blur(8px); }
  .yb-foot-inner { max-width:1500px; margin:0 auto; padding:12px 28px; display:flex; align-items:center; gap:14px; flex-wrap:wrap; }
  .yb-foot-info { display:flex; align-items:center; gap:8px; font-size:12.5px; color:#64748B; flex:1; min-width:200px; }
  .yb-foot-info svg { color:#ef4444; }
  .yb-foot-actions { display:flex; gap:10px; }

  .yb-toast { position:fixed; bottom:90px; right:28px; z-index:9999; display:inline-flex; align-items:center; gap:10px; padding:14px 22px; border-radius:12px; font-size:13.5px; font-weight:600; color:#fff; box-shadow:0 16px 30px rgba(15,23,42,.20); animation:slideIn .25s ease-out; }
  .yb-toast.success { background:linear-gradient(135deg,#16a34a,#15803d); }
  .yb-toast.error   { background:linear-gradient(135deg,#ef4444,#dc2626); }
  @keyframes slideIn { from { transform:translateY(20px); opacity:0; } to { transform:translateY(0); opacity:1; } }

  @media(max-width:640px) {
    .yb-page-head-inner { padding:14px 18px 16px; }
    .yb-body { padding:16px; }
    .yb-section-head { padding:14px 16px; }
    .yb-section-body { padding:16px; }
    .yb-title { font-size:20px; }
    .yb-foot { left:0; }
    .yb-foot-inner { padding:12px 18px; }
    .yb-foot-info { display:none; }
    .yb-foot-actions { width:100%; }
    .yb-foot-actions .yb-btn { flex:1; justify-content:center; }
    .yb-toast { left:18px; right:18px; bottom:90px; }
  }
`;

export default EditProperty;