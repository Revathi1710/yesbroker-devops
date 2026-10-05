import React, { useEffect, useState } from "react";
import axios from "axios";
import BrokerSidebar from "../components/BrokerSidebar";
import Header from "../components/Header";

const BRAND = "#e12d2d";
const API   = import.meta.env.VITE_API_URL;

/* ── Helpers ── */
const useIsMobile = () => {
  const [v, setV] = useState(window.innerWidth < 992);
  useEffect(() => {
    const fn = () => setV(window.innerWidth < 992);
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, []);
  return v;
};

const formatCurrency = (val) => {
  if (!val) return "—";
  const n = Number(val);
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(2)} Cr`;
  if (n >= 100000)   return `₹${(n / 100000).toFixed(2)} L`;
  return `₹${n.toLocaleString("en-IN")}`;
};

/* ── Toast ── */
const Toast = ({ toast }) => {
  if (!toast) return null;
  const ok = toast.type !== "danger";
  return (
    <div style={{ position:"fixed", bottom:24, left:16, right:16, zIndex:9999, maxWidth:440, margin:"0 auto",
      background: ok ? "#f0fdf4" : "#fff1f1", color: ok ? "#166534" : "#991b1b",
      borderRadius:12, padding:"14px 20px", display:"flex", alignItems:"center", gap:10,
      fontWeight:600, fontSize:14, boxShadow:"0 8px 28px rgba(0,0,0,0.12)", animation:"toastIn .3s ease" }}>
      <i className={`bi bi-${ok ? "check-circle-fill" : "x-circle-fill"}`} style={{ fontSize:18, flexShrink:0 }} />
      {toast.msg}
    </div>
  );
};

/* ── Form primitives ── */
const Label = ({ children }) => (
  <div style={{ fontSize:11, fontWeight:700, color:"#6b7280", textTransform:"uppercase",
    letterSpacing:"0.6px", marginBottom:7 }}>{children}</div>
);

const inputSt = (f) => ({
  width:"100%", padding:"11px 14px", fontFamily:"inherit", fontSize:14, color:"#1f2937",
  border:`1.5px solid ${f ? BRAND : "#e5e7eb"}`, borderRadius:10, outline:"none",
  background:"#fff", boxSizing:"border-box",
  boxShadow: f ? "0 0 0 3px rgba(225,45,45,0.09)" : "none", transition:"all .2s",
});

const FInput = (props) => {
  const [f, setF] = useState(false);
  return <input {...props} style={inputSt(f)} onFocus={() => setF(true)} onBlur={() => setF(false)} />;
};

const FTextarea = ({ rows = 4, ...props }) => {
  const [f, setF] = useState(false);
  return <textarea rows={rows} {...props} style={{ ...inputSt(f), resize:"vertical" }} onFocus={() => setF(true)} onBlur={() => setF(false)} />;
};

const FSelect = ({ children, ...props }) => {
  const [f, setF] = useState(false);
  return (
    <select {...props} style={inputSt(f)} onFocus={() => setF(true)} onBlur={() => setF(false)}>
      {children}
    </select>
  );
};

const PrefixInput = ({ prefix, ...props }) => {
  const [f, setF] = useState(false);
  return (
    <div style={{ display:"flex", border:`1.5px solid ${f ? BRAND : "#e5e7eb"}`, borderRadius:10,
      overflow:"hidden", boxShadow: f ? "0 0 0 3px rgba(225,45,45,0.09)" : "none", transition:"all .2s" }}>
      <span style={{ padding:"11px 12px", background:"#f9fafb", fontSize:14, fontWeight:600,
        color:"#6b7280", borderRight:"1px solid #e5e7eb", flexShrink:0 }}>{prefix}</span>
      <input {...props} style={{ flex:1, padding:"11px 14px", border:"none", outline:"none",
        fontSize:14, fontFamily:"inherit", background:"#fff", color:"#1f2937", minWidth:0, boxSizing:"border-box" }}
        onFocus={() => setF(true)} onBlur={() => setF(false)} />
    </div>
  );
};

/* ── Section Card ── */
const SectionCard = ({ number, icon, title, desc, children }) => (
  <div style={{ background:"#fff", borderRadius:16, border:"1px solid #f0f2f5", marginBottom:20,
    boxShadow:"0 2px 12px rgba(0,0,0,0.05)", overflow:"hidden" }}>
    <div style={{ padding:"18px 22px 14px", borderBottom:"1px solid #f8f9fb", display:"flex", alignItems:"center", gap:12 }}>
      <div style={{ width:36, height:36, borderRadius:10, background:"#fff5f5",
        display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
        <span style={{ fontSize:17 }}>{icon}</span>
      </div>
      <div>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <span style={{ fontSize:10, fontWeight:800, color:BRAND, background:"#fff1f1",
            borderRadius:99, padding:"2px 8px", letterSpacing:"0.4px" }}>STEP {number}</span>
          <span style={{ fontSize:15, fontWeight:700, color:"#111827" }}>{title}</span>
        </div>
        {desc && <div style={{ fontSize:12, color:"#9ca3af", marginTop:2 }}>{desc}</div>}
      </div>
    </div>
    <div style={{ padding:"20px 22px" }}>{children}</div>
  </div>
);

/* ── Star Rating ── */
const StarRating = ({ value }) => (
  <span style={{ display:"inline-flex", gap:2 }}>
    {[1,2,3,4,5].map(s => (
      <i key={s} className={`bi bi-star${s <= value ? "-fill" : ""}`}
        style={{ color: s <= value ? "#f59e0b" : "#d1d5db", fontSize:13 }} />
    ))}
  </span>
);

/* ── Status Badge ── */
const StatusBadge = ({ status }) => {
  const map = {
    Active:   { bg:"#f0fdf4", color:"#15803d", dot:"#22c55e" },
    Inactive: { bg:"#f1f5f9", color:"#475569", dot:"#94a3b8" },
    Pending:  { bg:"#fefce8", color:"#a16207", dot:"#eab308" },
  };
  const s = map[status] || map.Pending;
  return (
    <span style={{ display:"inline-flex", alignItems:"center", gap:5, background:s.bg, color:s.color,
      borderRadius:20, fontSize:11, fontWeight:700, padding:"4px 10px", whiteSpace:"nowrap", flexShrink:0 }}>
      <span style={{ width:6, height:6, borderRadius:"50%", background:s.dot, flexShrink:0 }} />
      {status}
    </span>
  );
};

/* ── Story Card ── */
const StoryCard = ({ story, onEdit, onDelete, isMobile }) => {
  const cover = story.photos?.[0];
  return (
    <div style={{ background:"#fff", borderRadius:16, border:"1px solid #f0f2f5", marginBottom:16,
      boxShadow:"0 2px 12px rgba(0,0,0,0.05)", overflow:"hidden", transition:"box-shadow .2s" }}
      onMouseEnter={e => e.currentTarget.style.boxShadow = "0 8px 30px rgba(0,0,0,0.10)"}
      onMouseLeave={e => e.currentTarget.style.boxShadow = "0 2px 12px rgba(0,0,0,0.05)"}>
      <div style={{ display:"flex", flexDirection: isMobile ? "column" : "row" }}>

        {/* Cover */}
        <div style={{ width: isMobile ? "100%" : 220, minHeight: isMobile ? 190 : 180, flexShrink:0, position:"relative" }}>
          {cover
            ? <img src={cover} alt="cover" style={{ width:"100%", height:"100%", minHeight: isMobile ? 190 : 180, objectFit:"cover", display:"block" }} />
            : <div style={{ background:"linear-gradient(135deg,#fff5f5,#fef2f2)", width:"100%", minHeight: isMobile ? 190 : 180,
                display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:10 }}>
                <i className="bi bi-trophy" style={{ fontSize:42, color:"#fca5a5" }} />
                <span style={{ fontSize:12, fontWeight:600, color:"#fca5a5" }}>No Photo</span>
              </div>
          }
          {isMobile && (
            <div style={{ position:"absolute", top:12, right:12 }}>
              <StatusBadge status={story.status} />
            </div>
          )}
        </div>

        {/* Content */}
        <div style={{ flex:1, padding: isMobile ? "16px 16px 20px" : "20px 24px", display:"flex", flexDirection:"column", minWidth:0 }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:10, marginBottom:6 }}>
            <div style={{ flex:1, minWidth:0 }}>
              <h5 style={{ fontWeight:700, fontSize: isMobile ? 15 : 17, color:"#111827", margin:"0 0 4px",
                overflow:"hidden", textOverflow:"ellipsis", whiteSpace: isMobile ? "normal" : "nowrap" }}>
                {story.title}
              </h5>
              {story.shortSummary && (
                <p style={{ color:"#64748b", fontSize:13, margin:0, lineHeight:1.5,
                  display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical", overflow:"hidden" }}>
                  {story.shortSummary}
                </p>
              )}
            </div>
            {!isMobile && <StatusBadge status={story.status} />}
          </div>

          {/* Chips */}
          <div style={{ display:"flex", flexWrap:"wrap", gap:8, margin:"10px 0" }}>
            {story.propertyType && (
              <span style={{ background:"#fff1f1", color:BRAND, borderRadius:20, fontSize:12, fontWeight:700, padding:"4px 12px" }}>
                {story.propertyType}
              </span>
            )}
            {story.location && (
              <span style={{ background:"#f8fafc", color:"#475569", borderRadius:20, fontSize:12, fontWeight:700, padding:"4px 12px" }}>
                <i className="bi bi-geo-alt me-1" />{story.location}
              </span>
            )}
            {story.dealValue && (
              <span style={{ background:"#f0fdf4", color:"#15803d", borderRadius:20, fontSize:12, fontWeight:700, padding:"4px 12px" }}>
                {formatCurrency(story.dealValue)}
              </span>
            )}
            {story.timeTaken && (
              <span style={{ background:"#f8fafc", color:"#475569", borderRadius:20, fontSize:12, fontWeight:700, padding:"4px 12px" }}>
                <i className="bi bi-clock me-1" />{story.timeTaken}
              </span>
            )}
          </div>

          {/* Client + Rating */}
          {(story.clientName || story.rating) && (
            <div style={{ display:"flex", alignItems:"center", gap:12, flexWrap:"wrap", marginBottom:6 }}>
              {story.clientName && (
                <span style={{ fontSize:13, color:"#64748b", display:"flex", alignItems:"center", gap:5 }}>
                  <i className="bi bi-person-circle" style={{ fontSize:15 }} />{story.clientName}
                </span>
              )}
              {story.rating && <StarRating value={Number(story.rating)} />}
            </div>
          )}

          {/* Actions */}
          <div style={{ display:"flex", gap:10, marginTop:"auto", paddingTop:12 }}>
            <button onClick={() => onEdit(story)}
              style={{ flex: isMobile ? 1 : "unset", display:"flex", alignItems:"center", justifyContent:"center",
                gap:6, padding:"9px 18px", borderRadius:9, border:"1.5px solid #e2e8f0", background:"#fff",
                color:"#374151", fontWeight:600, fontSize:13, cursor:"pointer", fontFamily:"inherit", transition:"all .15s" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor="#94a3b8"; e.currentTarget.style.background="#f8fafc"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor="#e2e8f0"; e.currentTarget.style.background="#fff"; }}>
              <i className="bi bi-pencil" />Edit
            </button>
            <button onClick={() => onDelete(story)}
              style={{ flex: isMobile ? 1 : "unset", display:"flex", alignItems:"center", justifyContent:"center",
                gap:6, padding:"9px 18px", borderRadius:9, border:"1.5px solid #fecaca", background:"#fff1f1",
                color:BRAND, fontWeight:600, fontSize:13, cursor:"pointer", fontFamily:"inherit", transition:"background .15s" }}
              onMouseEnter={e => e.currentTarget.style.background="#fee2e2"}
              onMouseLeave={e => e.currentTarget.style.background="#fff1f1"}>
              <i className="bi bi-trash" />Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ── Skeleton ── */
const SkeletonCard = ({ isMobile }) => (
  <div style={{ background:"#fff", borderRadius:16, border:"1px solid #f0f2f5", marginBottom:16,
    boxShadow:"0 2px 12px rgba(0,0,0,0.04)", overflow:"hidden" }}>
    <div style={{ display:"flex", flexDirection: isMobile ? "column" : "row" }}>
      <div className="shimmer" style={{ width: isMobile ? "100%" : 220, minHeight: isMobile ? 190 : 180, flexShrink:0 }} />
      <div style={{ flex:1, padding:"20px 24px" }}>
        <div className="shimmer" style={{ height:18, width:"55%", borderRadius:6, marginBottom:10 }} />
        <div className="shimmer" style={{ height:14, width:"38%", borderRadius:6, marginBottom:8 }} />
        <div style={{ display:"flex", gap:8, marginTop:16 }}>
          <div className="shimmer" style={{ height:28, width:70, borderRadius:20 }} />
          <div className="shimmer" style={{ height:28, width:80, borderRadius:20 }} />
        </div>
        <div style={{ display:"flex", gap:10, marginTop:24 }}>
          <div className="shimmer" style={{ height:36, flex:1, borderRadius:9 }} />
          <div className="shimmer" style={{ height:36, width:80, borderRadius:9 }} />
        </div>
      </div>
    </div>
  </div>
);

/* ── Empty State ── */
const EmptyState = ({ onAdd }) => (
  <div style={{ textAlign:"center", padding:"60px 24px" }}>
    <div style={{ width:90, height:90, borderRadius:"50%", background:"linear-gradient(135deg,#fff5f5,#fef2f2)",
      display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 20px" }}>
      <i className="bi bi-trophy" style={{ fontSize:38, color:"#fca5a5" }} />
    </div>
    <h5 style={{ fontWeight:700, fontSize:18, marginBottom:8, color:"#111827" }}>No Success Stories Yet</h5>
    <p style={{ color:"#9ca3af", maxWidth:300, margin:"0 auto 24px", fontSize:14, lineHeight:1.6 }}>
      Share your winning deals to build trust and attract more clients.
    </p>
    <button onClick={onAdd}
      style={{ display:"inline-flex", alignItems:"center", gap:8, padding:"12px 28px",
        background:BRAND, color:"#fff", border:"none", borderRadius:12, fontWeight:700, fontSize:15,
        cursor:"pointer", fontFamily:"inherit", boxShadow:"0 4px 18px rgba(225,45,45,0.35)" }}>
      <i className="bi bi-plus-lg" />Add Your First Story
    </button>
  </div>
);

/* ── Delete Modal ── */
const DeleteModal = ({ story, onConfirm, onCancel, deleting }) => (
  <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.5)", zIndex:1055,
    display:"flex", alignItems:"center", justifyContent:"center", padding:16 }}
    onClick={e => e.target === e.currentTarget && !deleting && onCancel()}>
    <div style={{ background:"#fff", borderRadius:20, maxWidth:420, width:"100%",
      padding:"40px 32px", textAlign:"center", boxShadow:"0 20px 60px rgba(0,0,0,0.15)" }}>
      <div style={{ width:70, height:70, borderRadius:"50%", background:"#fff1f1",
        display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 20px" }}>
        <i className="bi bi-trash3" style={{ fontSize:28, color:BRAND }} />
      </div>
      <h5 style={{ fontWeight:700, fontSize:18, marginBottom:8 }}>Delete Story?</h5>
      <p style={{ color:"#64748b", fontSize:14, lineHeight:1.6, marginBottom:28 }}>
        This will permanently delete <strong>"{story?.title}"</strong>. This action cannot be undone.
      </p>
      <div style={{ display:"flex", gap:12, justifyContent:"center" }}>
        <button onClick={onCancel} disabled={deleting}
          style={{ padding:"10px 24px", borderRadius:10, border:"1.5px solid #e2e8f0",
            background:"#fff", fontWeight:600, fontSize:14, cursor:"pointer", fontFamily:"inherit" }}>
          Cancel
        </button>
        <button onClick={onConfirm} disabled={deleting}
          style={{ padding:"10px 24px", borderRadius:10, border:"none", background:BRAND, color:"#fff",
            fontWeight:700, fontSize:14, cursor: deleting ? "not-allowed" : "pointer",
            opacity: deleting ? 0.7 : 1, fontFamily:"inherit", display:"flex", alignItems:"center", gap:8 }}>
          {deleting
            ? <><span className="spinner-border spinner-border-sm" style={{ width:15, height:15, borderWidth:2 }} /> Deleting…</>
            : <><i className="bi bi-trash" /> Yes, Delete</>
          }
        </button>
      </div>
    </div>
  </div>
);

/* ── Story Form ── */
const EMPTY_FORM = {
  title:"", shortSummary:"", description:"",
  totalPropertiesSold:"", totalRevenue:"", dealValue:"",
  timeTaken:"", location:"", propertyType:"",
  clientName:"", clientFeedback:"", rating:"",
  successDate:"", status:"Pending",
};

const StoryForm = ({ editData, onSuccess, onCancel, showToast, isMobile }) => {
  const isEdit = !!editData;
  const [form, setForm] = useState(isEdit ? {
    title:               editData.title               || "",
    shortSummary:        editData.shortSummary        || "",
    description:         editData.description         || "",
    totalPropertiesSold: editData.totalPropertiesSold || "",
    totalRevenue:        editData.totalRevenue        || "",
    dealValue:           editData.dealValue           || "",
    timeTaken:           editData.timeTaken           || "",
    location:            editData.location            || "",
    propertyType:        editData.propertyType        || "",
    clientName:          editData.clientName          || "",
    clientFeedback:      editData.clientFeedback      || "",
    rating:              editData.rating              || "",
    successDate:         editData.successDate ? editData.successDate.slice(0,10) : "",
    status:              editData.status              || "Pending",
  } : EMPTY_FORM);

  const [existingPhotos, setExistingPhotos] = useState(editData?.photos || []);
  const [newPhotos,      setNewPhotos]      = useState([]);
  const [newPreviews,    setNewPreviews]    = useState([]);
  const [submitting,     setSubmitting]     = useState(false);

  const handleChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleFiles = e => {
    const files = Array.from(e.target.files);
    const total = existingPhotos.length + newPhotos.length;
    if (total + files.length > 5) { showToast("Maximum 5 photos allowed.", "danger"); return; }
    setNewPhotos(p => [...p, ...files]);
    setNewPreviews(p => [...p, ...files.map(f => URL.createObjectURL(f))]);
    e.target.value = "";
  };
  const removeExisting = url => setExistingPhotos(p => p.filter(u => u !== url));
  const removeNew      = i  => { setNewPhotos(p => p.filter((_,j) => j !== i)); setNewPreviews(p => p.filter((_,j) => j !== i)); };

  const handleSubmit = async e => {
    e.preventDefault();
    setSubmitting(true);
    const fd = new FormData();
    Object.entries(form).forEach(([k,v]) => { if (v !== "") fd.append(k, v); });
    newPhotos.forEach(f => fd.append("photos", f));
    if (isEdit) {
      const removed = (editData.photos || []).filter(u => !existingPhotos.includes(u));
      fd.append("removedPhotos", JSON.stringify(removed));
    }
    try {
      if (isEdit) {
        await axios.put(`${API}/success-story/${editData._id}`, fd, { headers:{"Content-Type":"multipart/form-data"}, withCredentials:true });
        showToast("Story updated successfully!");
      } else {
        await axios.post(`${API}/add-success-story`, fd, { headers:{"Content-Type":"multipart/form-data"}, withCredentials:true });
        showToast("Story posted successfully!");
      }
      onSuccess();
    } catch(err) { showToast(err.response?.data?.message || "Something went wrong.", "danger"); }
    finally { setSubmitting(false); }
  };

  const totalPhotos = existingPhotos.length + newPhotos.length;
  const grid2 = { display:"grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap:16 };

  return (
    <form onSubmit={handleSubmit} noValidate>

      {/* Section 1 — Basic Info */}
      <SectionCard number="1" icon="✍️" title="Story Details" desc="Title, summary, location and property info">
        <div style={{ marginBottom:16 }}>
          <Label>Title <span style={{ color:BRAND }}>*</span></Label>
          <FInput name="title" value={form.title} onChange={handleChange}
            placeholder="e.g. Sold a 3BHK Villa in Adyar in just 10 days" required />
        </div>
        <div style={{ marginBottom:16 }}>
          <Label>Short summary <span style={{ fontSize:10, fontWeight:400, color:"#9ca3af" }}>(max 150 chars)</span></Label>
          <FInput name="shortSummary" value={form.shortSummary} onChange={handleChange}
            placeholder="One-line headline for this story" maxLength={150} />
        </div>
        <div style={{ marginBottom:16 }}>
          <Label>Full description <span style={{ color:BRAND }}>*</span></Label>
          <FTextarea name="description" value={form.description} onChange={handleChange} rows={4}
            placeholder="Tell the full story — challenges faced, strategy used, and the outcome…" required />
        </div>
        <div style={grid2}>
          <div>
            <Label>Property type</Label>
            <FSelect name="propertyType" value={form.propertyType} onChange={handleChange}>
              <option value="">Select type…</option>
              {["Villa","Apartment","Land","Commercial","Independent House"].map(o => <option key={o}>{o}</option>)}
            </FSelect>
          </div>
          <div>
            <Label>Status</Label>
            <FSelect name="status" value={form.status} onChange={handleChange}>
              {["Pending","Active","Inactive"].map(o => <option key={o}>{o}</option>)}
            </FSelect>
          </div>
          <div>
            <Label>Location</Label>
            <FInput name="location" value={form.location} onChange={handleChange}
              placeholder="e.g. Anna Nagar, Chennai" />
          </div>
          <div>
            <Label>Success date</Label>
            <FInput type="date" name="successDate" value={form.successDate} onChange={handleChange} />
          </div>
        </div>
      </SectionCard>

      {/* Section 2 — Metrics */}
      <SectionCard number="2" icon="📊" title="Performance Metrics" desc="Deal value, revenue and time taken to close">
        <div style={grid2}>
          <div>
            <Label>Deal value (₹)</Label>
            <PrefixInput prefix="₹" type="number" name="dealValue" value={form.dealValue}
              onChange={handleChange} placeholder="e.g. 5000000" min="0" />
          </div>
          <div>
            <Label>Total revenue (₹)</Label>
            <PrefixInput prefix="₹" type="number" name="totalRevenue" value={form.totalRevenue}
              onChange={handleChange} placeholder="e.g. 200000" min="0" />
          </div>
          <div>
            <Label>Properties sold</Label>
            <FInput type="number" name="totalPropertiesSold" value={form.totalPropertiesSold}
              onChange={handleChange} placeholder="e.g. 3" min="0" />
          </div>
          <div>
            <Label>Time taken</Label>
            <FInput name="timeTaken" value={form.timeTaken} onChange={handleChange}
              placeholder='e.g. "15 days" or "1 month"' />
          </div>
        </div>
      </SectionCard>

      {/* Section 3 — Client Testimonial */}
      <SectionCard number="3" icon="⭐" title="Client Testimonial" desc="Who was the client and what did they say?">
        <div style={{ ...grid2, marginBottom:16 }}>
          <div>
            <Label>Client name</Label>
            <FInput name="clientName" value={form.clientName} onChange={handleChange}
              placeholder="e.g. Rajesh Kumar" />
          </div>
          <div>
            <Label>Rating</Label>
            <FSelect name="rating" value={form.rating} onChange={handleChange}>
              <option value="">Select rating…</option>
              {[5,4,3,2,1].map(r => <option key={r} value={r}>{"★".repeat(r)} ({r}/5)</option>)}
            </FSelect>
          </div>
        </div>
        <div>
          <Label>Client feedback</Label>
          <FTextarea name="clientFeedback" value={form.clientFeedback} onChange={handleChange} rows={3}
            placeholder="What did the client say about working with you?" />
        </div>
      </SectionCard>

      {/* Section 4 — Photos */}
      <SectionCard number="4" icon="📸" title="Photos" desc="Up to 5 photos for this success story">
        {(existingPhotos.length > 0 || newPreviews.length > 0) && (
          <div style={{ marginBottom:16 }}>
            <Label>Current photos ({totalPhotos}/5)</Label>
            <div style={{ display:"flex", flexWrap:"wrap", gap:10, marginTop:6 }}>
              {existingPhotos.map((url, i) => (
                <div key={`ex-${i}`} className="photo-slot">
                  <img src={url} alt="" />
                  <span className="photo-badge">Saved</span>
                  <button type="button" className="photo-remove" onClick={() => removeExisting(url)}>×</button>
                </div>
              ))}
              {newPreviews.map((src, i) => (
                <div key={`nw-${i}`} className="photo-slot">
                  <img src={src} alt="" />
                  <span className="photo-badge">New</span>
                  <button type="button" className="photo-remove" onClick={() => removeNew(i)}>×</button>
                </div>
              ))}
            </div>
          </div>
        )}
        <label className="upload-box" htmlFor="storyFileInput"
          style={{ opacity: totalPhotos >= 5 ? 0.5 : 1, pointerEvents: totalPhotos >= 5 ? "none" : "auto" }}>
          <input type="file" multiple id="storyFileInput" style={{ display:"none" }} onChange={handleFiles} accept="image/*" />
          <div style={{ width:52, height:52, borderRadius:14, background:"#f1f5f9",
            display:"flex", alignItems:"center", justifyContent:"center" }}>
            <i className="bi bi-cloud-arrow-up" style={{ fontSize:26, color:"#94a3b8" }} />
          </div>
          <div style={{ fontSize:14, fontWeight:700, color:"#374151" }}>
            {totalPhotos >= 5 ? "Photo limit reached" : "Click to upload photos"}
          </div>
          <div style={{ fontSize:12, color:"#9ca3af" }}>{totalPhotos}/5 photos · JPG or PNG</div>
        </label>
      </SectionCard>

      {/* Submit row */}
      <div style={{ display:"flex", gap:12, justifyContent:"flex-end", paddingBottom:24, flexDirection: isMobile ? "column" : "row" }}>
        <button type="button" onClick={onCancel} disabled={submitting}
          style={{ padding:"12px 24px", borderRadius:11, border:"1.5px solid #e2e8f0", background:"#fff",
            fontWeight:600, fontSize:14, cursor:"pointer", fontFamily:"inherit",
            order: isMobile ? 1 : 0 }}>
          Cancel
        </button>
        <button type="submit" disabled={submitting}
          style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:8,
            padding:"12px 32px", borderRadius:11, border:"none",
            background: submitting ? "#f87171" : BRAND, color:"#fff",
            fontWeight:700, fontSize:15, cursor: submitting ? "not-allowed" : "pointer",
            fontFamily:"inherit", boxShadow:"0 4px 18px rgba(225,45,45,0.35)", transition:"all .2s" }}>
          {submitting
            ? <><span className="spinner-border spinner-border-sm" style={{ width:16, height:16, borderWidth:2 }} />{isEdit ? "Saving…" : "Posting…"}</>
            : <><i className={`bi bi-${isEdit ? "check2-circle" : "send-fill"}`} />{isEdit ? "Save Changes" : "Post Story"}</>
          }
        </button>
      </div>
    </form>
  );
};

/* ── Main Page ── */
const YourSuccessStory = () => {
  const isMobile = useIsMobile();
  const [view,         setView]         = useState("list");
  const [stories,      setStories]      = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [editTarget,   setEditTarget]   = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting,     setDeleting]     = useState(false);
  const [toast,        setToast]        = useState(null);

  const showToast = (msg, type = "success") => { setToast({ msg, type }); setTimeout(() => setToast(null), 3500); };

  const fetchStories = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${API}/my-success-stories`, { withCredentials:true });
      setStories(data.data ?? data);
    } catch { showToast("Failed to load stories.", "danger"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchStories(); }, []);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await axios.delete(`${API}/success-story/${deleteTarget._id}`, { withCredentials:true });
      setStories(p => p.filter(s => s._id !== deleteTarget._id));
      showToast("Story deleted successfully.");
    } catch { showToast("Failed to delete. Please try again.", "danger"); }
    finally { setDeleting(false); setDeleteTarget(null); }
  };

  const handleFormSuccess = () => { setView("list"); setEditTarget(null); fetchStories(); };
  const openEdit = story => { setEditTarget(story); setView("edit"); };
  const goBack   = () => { setView("list"); setEditTarget(null); };

  const pageTitle = view === "add" ? "Add Success Story" : view === "edit" ? "Edit Story" : "My Success Stories";
  const pageSub   = view === "list"
    ? (loading ? "Fetching stories…" : `${stories.length} stor${stories.length === 1 ? "y" : "ies"} posted`)
    : "Fill in the details below and share your win.";

  return (
    <div style={{ background:"#f7f8fc", minHeight:"100vh", fontFamily:"'DM Sans', system-ui, sans-serif" }}>
      <style>{`
        * { box-sizing: border-box; }
        @keyframes toastIn { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        @keyframes shimmer { 0%{background-position:-600px 0} 100%{background-position:600px 0} }
        .shimmer { background:linear-gradient(90deg,#f0f2f5 25%,#e8eaed 50%,#f0f2f5 75%);
          background-size:600px 100%; animation:shimmer 1.4s infinite; }
        .photo-slot { position:relative; width:88px; height:88px; border-radius:12px; overflow:hidden;
          border:1.5px solid #e5e7eb; flex-shrink:0; background:#f9fafb; }
        .photo-slot img { width:100%; height:100%; object-fit:cover; display:block; }
        .photo-remove { position:absolute; top:5px; right:5px; width:22px; height:22px; border-radius:50%;
          background:rgba(0,0,0,0.65); border:none; color:#fff; cursor:pointer; font-size:13px;
          display:flex; align-items:center; justify-content:center; line-height:1; }
        .photo-badge { position:absolute; bottom:5px; left:5px; background:rgba(0,0,0,0.55);
          color:#fff; font-size:9px; padding:2px 6px; border-radius:5px; font-weight:700; }
        .upload-box { border:2px dashed #d1d5db; border-radius:14px; background:#fafbfc;
          display:flex; flex-direction:column; align-items:center; justify-content:center;
          gap:8px; padding:28px 20px; cursor:pointer; transition:all .2s; }
        .upload-box:hover { border-color:${BRAND}; background:#fff5f5; }
        select option { font-size:14px; }
      `}</style>

   <Header />

      <div style={{ display:"flex", flexDirection: isMobile ? "column" : "row",
        minHeight: isMobile ? "100vh" : "calc(100vh - 64px)" }}>
        <BrokerSidebar />

        <main style={{ flex:1, overflowY:"auto", padding: isMobile ? "20px 15px 100px" : "36px 44px 60px", minWidth:0 }}>
          <div style={{ margin:"0 auto" }}>

            {/* Page Header */}
            <div style={{ display:"flex", alignItems: isMobile ? "flex-start" : "center",
              justifyContent:"space-between", flexWrap:"wrap", gap:14, marginBottom:28 }}>
              <div style={{ display:"flex", alignItems:"center", gap:14 }}>
                {view !== "list" && (
                  <button type="button" onClick={goBack}
                    style={{ display:"flex", alignItems:"center", gap:6, padding:"9px 16px",
                      border:"1.5px solid #e5e7eb", borderRadius:10, background:"#fff",
                      fontSize:13, fontWeight:600, color:"#374151", cursor:"pointer",
                      fontFamily:"inherit", flexShrink:0 }}>
                    <i className="bi bi-arrow-left" /> Back
                  </button>
                )}
                <div>
                  <h2 style={{ fontSize: isMobile ? 20 : 26, fontWeight:800, color:"#111827",
                    margin:0, letterSpacing:"-0.3px" }}>{pageTitle}</h2>
                  <p style={{ fontSize:13, color:"#9ca3af", margin:"4px 0 0" }}>{pageSub}</p>
                </div>
              </div>
              {view === "list" && !isMobile && (
                <button onClick={() => setView("add")}
                  style={{ display:"flex", alignItems:"center", gap:8, padding:"11px 22px",
                    background:BRAND, color:"#fff", border:"none", borderRadius:11,
                    fontWeight:700, fontSize:14, cursor:"pointer", fontFamily:"inherit",
                    boxShadow:"0 4px 16px rgba(225,45,45,0.35)", whiteSpace:"nowrap" }}>
                  <i className="bi bi-plus-lg" /> Add Story
                </button>
              )}
            </div>

            {/* Content */}
            {view === "list" ? (
              loading
                ? [1,2,3].map(i => <SkeletonCard key={i} isMobile={isMobile} />)
                : stories.length > 0
                  ? stories.map(s => <StoryCard key={s._id} story={s} isMobile={isMobile} onEdit={openEdit} onDelete={setDeleteTarget} />)
                  : <EmptyState onAdd={() => setView("add")} />
            ) : (
              <StoryForm
                editData={view === "edit" ? editTarget : null}
                onSuccess={handleFormSuccess}
                onCancel={goBack}
                showToast={showToast}
                isMobile={isMobile}
              />
            )}

          </div>
        </main>
      </div>

      {/* Mobile FAB */}
      {view === "list" && isMobile && (
        <button onClick={() => setView("add")}
          style={{ position:"fixed", bottom:24, right:20, width:58, height:58, borderRadius:"50%",
            background:BRAND, color:"#fff", border:"none", fontSize:28, zIndex:1000, cursor:"pointer",
            display:"flex", alignItems:"center", justifyContent:"center",
            boxShadow:"0 6px 24px rgba(225,45,45,0.45)" }}>
          +
        </button>
      )}

      {deleteTarget && (
        <DeleteModal story={deleteTarget} onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)} deleting={deleting} />
      )}

      <Toast toast={toast} />
    </div>
  );
};

export default YourSuccessStory;