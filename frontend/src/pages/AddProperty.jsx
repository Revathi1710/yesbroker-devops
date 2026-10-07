import React, { useState, useEffect } from "react";
import BrokerSidebar from "../components/BrokerSidebar";
import Header from "../components/Header";
import AreasOfOperation from "../components/AreasOfOperation";
import axios from "axios";

const BRAND      = "#e12d2d";
const ZONE_ORDER = ['South Chennai','Central Chennai','West Chennai','North Chennai','East Chennai / OMR / ECR'];

const useIsMobile = () => {
  const [v, setV] = useState(window.innerWidth < 992);
  useEffect(() => {
    const fn = () => setV(window.innerWidth < 992);
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, []);
  return v;
};

const Toast = ({ toast }) => {
  if (!toast) return null;
  const ok = toast.type !== "danger";
  return (
    <div style={{
      position:"fixed", bottom:24, left:16, right:16, zIndex:9999, maxWidth:440, margin:"0 auto",
      background: ok ? "#f0fdf4" : "#fff1f1", color: ok ? "#166534" : "#991b1b",
      borderRadius:12, padding:"14px 20px", display:"flex", alignItems:"center", gap:10,
      fontWeight:600, fontSize:14, boxShadow:"0 8px 28px rgba(0,0,0,0.12)", animation:"toastIn .3s ease",
    }}>
      <i className={`bi bi-${ok ? "check-circle-fill" : "x-circle-fill"}`} style={{ fontSize:18, flexShrink:0 }} />
      {toast.msg}
    </div>
  );
};

const Label = ({ children }) => (
  <div style={{ fontSize:11, fontWeight:700, color:"#6b7280", textTransform:"uppercase", letterSpacing:"0.6px", marginBottom:7 }}>
    {children}
  </div>
);

const SectionCard = ({ number, icon, title, desc, children }) => (
  <div style={{
    background:"#fff", borderRadius:16, border:"1px solid #f0f2f5", marginBottom:20,
    boxShadow:"0 2px 12px rgba(0,0,0,0.05)", overflow:"hidden",
  }}>
    <div style={{ padding:"18px 22px 14px", borderBottom:"1px solid #f8f9fb", display:"flex", alignItems:"center", gap:12 }}>
      <div style={{
        width:36, height:36, borderRadius:10, background:"#fff5f5",
        display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0,
      }}>
        <span style={{ fontSize:17 }}>{icon}</span>
      </div>
      <div>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <span style={{
            fontSize:10, fontWeight:800, color:BRAND, background:"#fff1f1",
            borderRadius:99, padding:"2px 8px", letterSpacing:"0.4px",
          }}>STEP {number}</span>
          <span style={{ fontSize:15, fontWeight:700, color:"#111827" }}>{title}</span>
        </div>
        {desc && <div style={{ fontSize:12, color:"#9ca3af", marginTop:2 }}>{desc}</div>}
      </div>
    </div>
    <div style={{ padding:"20px 22px" }}>{children}</div>
  </div>
);

const inputSt = (focused) => ({
  width:"100%", padding:"11px 14px", border:`1.5px solid ${focused ? BRAND : "#e5e7eb"}`,
  borderRadius:10, fontSize:14, fontFamily:"inherit", background:"#fff", outline:"none",
  color:"#1f2937", boxSizing:"border-box",
  boxShadow: focused ? "0 0 0 3px rgba(225,45,45,0.09)" : "none",
  transition:"border-color .2s, box-shadow .2s",
});

const FInput = (props) => {
  const [f, setF] = useState(false);
  return <input {...props} style={inputSt(f)} onFocus={() => setF(true)} onBlur={() => setF(false)} />;
};

const FTextarea = ({ rows = 4, ...props }) => {
  const [f, setF] = useState(false);
  return (
    <textarea rows={rows} {...props}
      style={{ ...inputSt(f), resize:"vertical" }}
      onFocus={() => setF(true)} onBlur={() => setF(false)} />
  );
};

const FSelect = ({ children, ...props }) => {
  const [f, setF] = useState(false);
  return (
    <select {...props} style={inputSt(f)} onFocus={() => setF(true)} onBlur={() => setF(false)}>
      {children}
    </select>
  );
};

const PrefixInput = ({ prefix, suffix, ...props }) => {
  const [f, setF] = useState(false);
  return (
    <div style={{
      display:"flex", border:`1.5px solid ${f ? BRAND : "#e5e7eb"}`, borderRadius:10,
      overflow:"hidden", boxShadow: f ? "0 0 0 3px rgba(225,45,45,0.09)" : "none", transition:"all .2s",
    }}>
      {prefix && (
        <span style={{
          padding:"11px 12px", background:"#f9fafb", fontSize:14, fontWeight:600,
          color:"#6b7280", borderRight:"1px solid #e5e7eb", flexShrink:0,
        }}>{prefix}</span>
      )}
      <input {...props} style={{
        flex:1, padding:"11px 14px", border:"none", outline:"none",
        fontSize:14, fontFamily:"inherit", background:"#fff", color:"#1f2937", minWidth:0,
      }} onFocus={() => setF(true)} onBlur={() => setF(false)} />
      {suffix && (
        <span style={{
          padding:"11px 12px", background:"#f9fafb", fontSize:13, fontWeight:600,
          color:"#6b7280", borderLeft:"1px solid #e5e7eb", flexShrink:0,
        }}>{suffix}</span>
      )}
    </div>
  );
};

const AddProperty = () => {
  const isMobile = useIsMobile();

  const [formData, setFormData] = useState({
    listingType:"Sell", propertyType:"", localities:[],
    size:"", price:"", description:"", status:"Active",
  });
  const [photos,       setPhotos]       = useState([]);
  const [previews,     setPreviews]     = useState([]);
  const [submitting,   setSubmitting]   = useState(false);
  const [toast,        setToast]        = useState(null);
  const [zones,        setZones]        = useState({});
  const [zoneKeys,     setZoneKeys]     = useState([]);
  const [loadingZones, setLoadingZones] = useState(true);

  useEffect(() => {
    const fetchLocalities = async () => {
      try {
        const { data } = await axios.get(
          `${import.meta.env.VITE_API_URL}/locality/all`,
          { withCredentials: true }
        );
        const grouped = {};
        data.data.filter(i => i.active).forEach(item => {
          const z = item.zone?.trim();
          if (!z) return;
          if (!grouped[z]) grouped[z] = { label:z, locs:[] };
          if (typeof item.state === "string") {
            item.state.split(",").forEach(s => {
              const l = s.trim();
              if (l && !grouped[z].locs.includes(l)) grouped[z].locs.push(l);
            });
          } else if (Array.isArray(item.state)) {
            item.state.forEach(s => {
              const l = s.trim();
              if (l && !grouped[z].locs.includes(l)) grouped[z].locs.push(l);
            });
          }
        });
        const ordered = [
          ...ZONE_ORDER.filter(k => grouped[k]),
          ...Object.keys(grouped).filter(k => !ZONE_ORDER.includes(k)),
        ];
        setZones(grouped);
        setZoneKeys(ordered);
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingZones(false);
      }
    };
    fetchLocalities();
  }, []);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleChange = e => setFormData(p => ({ ...p, [e.target.name]: e.target.value }));

  const handlePhotos = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + photos.length > 5) {
      showToast("Maximum 5 photos allowed.", "danger");
      return;
    }
    setPhotos(p => [...p, ...files]);
    setPreviews(p => [...p, ...files.map(f => URL.createObjectURL(f))]);
    e.target.value = "";
  };

  const removePhoto = i => {
    setPhotos(p => p.filter((_, j) => j !== i));
    setPreviews(p => p.filter((_, j) => j !== i));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.localities.length) {
      showToast("Please select a locality.", "danger");
      return;
    }
    setSubmitting(true);
    const fd = new FormData();
    Object.entries(formData).forEach(([k, v]) =>
      fd.append(k, k === "localities" ? JSON.stringify(v) : v)
    );
    photos.forEach(p => fd.append("photos", p));
    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/add-property`,
        fd,
        { headers:{ "Content-Type":"multipart/form-data" }, withCredentials:true }
      );
      showToast("Property posted successfully!");
      setFormData({ listingType:"Sell", propertyType:"", localities:[], size:"", price:"", description:"", status:"Active" });
      setPhotos([]);
      setPreviews([]);
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to post property.", "danger");
    } finally {
      setSubmitting(false);
    }
  };

  const LISTING_TYPES  = ["Sell","Rent","PG","Commercial","Plot"];
  const PROPERTY_TYPES = ["Apartment","Independent House","Villa","Plot","Commercial"];
  const grid2 = { display:"grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap:16 };

  return (
    <div style={{ background:"#f7f8fc", minHeight:"100vh", fontFamily:"'DM Sans', system-ui, sans-serif" }}>
      <style>{`
        * { box-sizing: border-box; }
        @keyframes toastIn { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        .photo-slot {
          position:relative; width:88px; height:88px; border-radius:12px;
          overflow:hidden; border:1.5px solid #e5e7eb; flex-shrink:0; background:#f9fafb;
        }
        .photo-slot img { width:100%; height:100%; object-fit:cover; display:block; }
        .photo-remove {
          position:absolute; top:5px; right:5px; width:22px; height:22px; border-radius:50%;
          background:rgba(0,0,0,0.65); border:none; color:#fff; cursor:pointer; font-size:13px;
          display:flex; align-items:center; justify-content:center; line-height:1;
        }
        .upload-box {
          border:2px dashed #d1d5db; border-radius:14px; background:#fafbfc;
          display:flex; flex-direction:column; align-items:center; justify-content:center;
          gap:8px; padding:28px 20px; cursor:pointer; transition:all .2s;
        }
        .upload-box:hover { border-color:${BRAND}; background:#fff5f5; }
        select option { font-size:14px; }
      `}</style>

     <Header />

      <div style={{
        display:"flex", flexDirection: isMobile ? "column" : "row",
        minHeight: isMobile ? "100vh" : "calc(100vh - 64px)",
      }}>
        <BrokerSidebar />

        <main style={{
          flex:1, overflowY:"auto",
          padding: isMobile ? "20px 15px 100px" : "36px 44px 60px",
          minWidth:0,
        }}>
          <div style={{ margin:"0 auto" }}>

            {/* Page Header */}
            <div style={{ marginBottom:28 }}>
              <h2 style={{
                fontSize: isMobile ? 20 : 26, fontWeight:800, color:"#111827",
                margin:0, letterSpacing:"-0.3px",
              }}>
                Post a Property
              </h2>
              <p style={{ fontSize:13, color:"#9ca3af", margin:"6px 0 0" }}>
                Fill in accurate details to attract verified buyers and renters.
              </p>
            </div>

            <form onSubmit={handleSubmit} noValidate>

              {/* ── Section 1: Basic Details ── */}
              <SectionCard number="1" icon="🏷️" title="Basic Details" desc="Listing type, property category and current status">
                <div style={{ marginBottom:20 }}>
                  <Label>I want to…</Label>
                  <div style={{ display:"flex", flexWrap:"wrap", gap:9 }}>
                    {LISTING_TYPES.map(t => {
                      const on = formData.listingType === t;
                      return (
                        <button key={t} type="button"
                          onClick={() => setFormData(p => ({ ...p, listingType:t }))}
                          style={{
                            padding:"9px 20px", borderRadius:10, fontWeight:700, fontSize:13,
                            border:`1.5px solid ${on ? BRAND : "#e5e7eb"}`,
                            background: on ? BRAND : "#fff",
                            color: on ? "#fff" : "#6b7280",
                            cursor:"pointer", fontFamily:"inherit", transition:"all .15s",
                          }}>
                          {t}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div style={grid2}>
                  <div>
                    <Label>Property type <span style={{ color:BRAND }}>*</span></Label>
                    <FSelect name="propertyType" value={formData.propertyType} onChange={handleChange} required>
                      <option value="">Select type…</option>
                      {PROPERTY_TYPES.map(o => <option key={o}>{o}</option>)}
                    </FSelect>
                  </div>
                  <div>
                    <Label>Listing status</Label>
                    <FSelect name="status" value={formData.status} onChange={handleChange}>
                      <option>Active</option>
                      <option>Sold</option>
                      <option>Rented</option>
                    </FSelect>
                  </div>
                </div>
              </SectionCard>

              {/* ── Section 2: Location ── */}
              <SectionCard number="2" icon="📍" title="Property Location" desc="Select the locality where the property is situated">
                {formData.localities.length > 0 && (
                  <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:14 }}>
                    <span style={{ fontSize:11, fontWeight:700, color:"#9ca3af", textTransform:"uppercase" }}>Selected</span>
                    <span style={{
                      display:"inline-flex", alignItems:"center", gap:6, background:BRAND,
                      color:"#fff", borderRadius:99, padding:"5px 12px 5px 14px", fontSize:13, fontWeight:700,
                    }}>
                      <i className="bi bi-geo-alt-fill" style={{ fontSize:11 }} />
                      {formData.localities[0]}
                      <button type="button"
                        onClick={() => setFormData(p => ({ ...p, localities:[] }))}
                        style={{
                          background:"none", border:"none", color:"rgba(255,255,255,0.8)",
                          cursor:"pointer", fontSize:17, lineHeight:1, padding:"0 0 0 3px", fontFamily:"inherit",
                        }}>×</button>
                    </span>
                  </div>
                )}
                <AreasOfOperation
                  selected={formData.localities}
                  onChange={v => setFormData(p => ({ ...p, localities:v }))}
                  zones={zones}
                  zoneKeys={zoneKeys}
                  loadingZones={loadingZones}
                  singleSelect={true}
                />
              </SectionCard>

              {/* ── Section 3: Price & Area ── */}
              <SectionCard number="3" icon="💰" title="Price & Area" desc="Enter the total asking price and property size">
                <div style={grid2}>
                  <div>
                    <Label>Total price (₹) <span style={{ color:BRAND }}>*</span></Label>
                    <PrefixInput
                      prefix="₹" type="number" name="price"
                      value={formData.price} onChange={handleChange}
                      placeholder="e.g. 5000000" required min="0"
                    />
                  </div>
                  <div>
                    <Label>Built-up area <span style={{ color:BRAND }}>*</span></Label>
                    <PrefixInput
                      suffix="Sq.Ft" type="text" name="size"
                      value={formData.size} onChange={handleChange}
                      placeholder="e.g. 1200" required
                    />
                  </div>
                </div>
              </SectionCard>

              {/* ── Section 4: Photos & Description ── */}
              <SectionCard number="4" icon="📸" title="Photos & Description" desc="Up to 5 photos and a short property description">
                <div style={{ marginBottom:18 }}>
                  <Label>Property description</Label>
                  <FTextarea
                    name="description" value={formData.description}
                    onChange={handleChange} rows={4}
                    placeholder="Key features: corner plot, near metro, parking, fully furnished, garden view…"
                  />
                </div>

                <Label>Upload photos ({photos.length}/5)</Label>
                <label
                  className="upload-box"
                  htmlFor="addFileInput"
                  style={{ opacity: photos.length >= 5 ? 0.5 : 1, pointerEvents: photos.length >= 5 ? "none" : "auto" }}
                >
                  <input
                    type="file" multiple id="addFileInput"
                    style={{ display:"none" }} onChange={handlePhotos} accept="image/*"
                  />
                  <div style={{
                    width:52, height:52, borderRadius:14, background:"#f1f5f9",
                    display:"flex", alignItems:"center", justifyContent:"center",
                  }}>
                    <i className="bi bi-cloud-arrow-up" style={{ fontSize:26, color:"#94a3b8" }} />
                  </div>
                  <div style={{ fontSize:14, fontWeight:700, color:"#374151" }}>
                    {photos.length >= 5 ? "Photo limit reached" : "Click to upload photos"}
                  </div>
                  <div style={{ fontSize:12, color:"#9ca3af" }}>
                    JPG or PNG · max 5 photos · best at square crop
                  </div>
                </label>

                {previews.length > 0 && (
                  <div style={{ display:"flex", flexWrap:"wrap", gap:10, marginTop:16 }}>
                    {previews.map((src, i) => (
                      <div key={i} className="photo-slot">
                        <img src={src} alt="" />
                        <button type="button" className="photo-remove" onClick={() => removePhoto(i)}>×</button>
                      </div>
                    ))}
                  </div>
                )}
              </SectionCard>

              {/* ── Submit ── */}
              <div style={{ display:"flex", justifyContent:"flex-end", paddingBottom:20 }}>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    display:"flex", alignItems:"center", gap:8,
                    padding: isMobile ? "14px 0" : "13px 36px",
                    width: isMobile ? "100%" : "auto",
                    justifyContent:"center",
                    background: submitting ? "#f87171" : BRAND,
                    color:"#fff", border:"none", borderRadius:12,
                    fontWeight:700, fontSize:15, cursor: submitting ? "not-allowed" : "pointer",
                    fontFamily:"inherit",
                    boxShadow:"0 4px 18px rgba(225,45,45,0.35)",
                    transition:"all .2s",
                  }}
                >
                  {submitting ? (
                    <>
                      <span className="spinner-border spinner-border-sm" role="status"
                        style={{ width:16, height:16, borderWidth:2 }} />
                      Posting…
                    </>
                  ) : (
                    <>
                      <i className="bi bi-send-fill" />
                      Post Property Now
                    </>
                  )}
                </button>
              </div>

            </form>
          </div>
        </main>
      </div>

      <Toast toast={toast} />
    </div>
  );
};

export default AddProperty;