import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
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

const Skeleton = () => (
  <>
    <style>{`
      @keyframes shimmer { 0%{background-position:-600px 0} 100%{background-position:600px 0} }
      .sk {
        background:linear-gradient(90deg,#f0f2f5 25%,#e8eaed 50%,#f0f2f5 75%);
        background-size:600px 100%; animation:shimmer 1.4s infinite; border-radius:10px;
      }
    `}</style>
    {[1,2,3,4].map(i => (
      <div key={i} style={{
        background:"#fff", borderRadius:16, border:"1px solid #f0f2f5", marginBottom:20,
        padding:"22px 24px", boxShadow:"0 2px 12px rgba(0,0,0,0.04)",
      }}>
        <div className="sk" style={{ height:18, width:"38%", marginBottom:20 }} />
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
          <div className="sk" style={{ height:44 }} />
          <div className="sk" style={{ height:44 }} />
        </div>
      </div>
    ))}
  </>
);

const EditProperty = () => {
  const { id }   = useParams();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const [formData, setFormData] = useState({
    listingType:"Sell", propertyType:"", localities:[],
    size:"", price:"", description:"", status:"Active",
  });
  const [existingPhotos, setExistingPhotos] = useState([]);
  const [removedPhotos,  setRemovedPhotos]  = useState([]);
  const [newPhotos,      setNewPhotos]      = useState([]);
  const [newPreviews,    setNewPreviews]    = useState([]);
  const [loading,        setLoading]        = useState(true);
  const [submitting,     setSubmitting]     = useState(false);
  const [toast,          setToast]          = useState(null);
  const [zones,          setZones]          = useState({});
  const [zoneKeys,       setZoneKeys]       = useState([]);
  const [loadingZones,   setLoadingZones]   = useState(true);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    const fetchLocalities = async () => {
      try {
        const { data } = await axios.get(
          `${import.meta.env.VITE_API_URL}/locality/all`,
          { withCredentials:true }
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

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get(
          `${import.meta.env.VITE_API_URL}/property/${id}`,
          { withCredentials:true }
        );
        const p = data.data ?? data;
        setFormData({
          listingType:  p.listingType  || "Sell",
          propertyType: p.propertyType || "",
          localities:   p.localities   || [],
          size:         p.size         || "",
          price:        p.price        || "",
          description:  p.description  || "",
          status:       p.status       || "Active",
        });
        setExistingPhotos(p.photos || []);
      } catch {
        showToast("Failed to load property details.", "danger");
      } finally {
        setLoading(false);
      }
    };
    fetchProperty();
  }, [id]);

  const handleChange      = e  => setFormData(p => ({ ...p, [e.target.name]: e.target.value }));
  const removeExisting    = url => {
    setExistingPhotos(p => p.filter(u => u !== url));
    setRemovedPhotos(p => [...p, url]);
  };
  const handleNewPhotos   = (e) => {
    const files = Array.from(e.target.files);
    if (existingPhotos.length + newPhotos.length + files.length > 5) {
      showToast("Maximum 5 photos allowed.", "danger");
      return;
    }
    setNewPhotos(p => [...p, ...files]);
    setNewPreviews(p => [...p, ...files.map(f => URL.createObjectURL(f))]);
    e.target.value = "";
  };
  const removeNew = i => {
    setNewPhotos(p => p.filter((_, j) => j !== i));
    setNewPreviews(p => p.filter((_, j) => j !== i));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.localities.length) {
      showToast("Please select a locality.", "danger");
      return;
    }
    setSubmitting(true);
    const fd = new FormData();
    Object.entries(formData).forEach(([k,v]) =>
      fd.append(k, k === "localities" ? JSON.stringify(v) : v)
    );
    fd.append("removedPhotos", JSON.stringify(removedPhotos));
    newPhotos.forEach(p => fd.append("photos", p));
    try {
      await axios.put(
        `${import.meta.env.VITE_API_URL}/property/${id}`,
        fd,
        { headers:{ "Content-Type":"multipart/form-data" }, withCredentials:true }
      );
      showToast("Property updated successfully!");
      setTimeout(() => navigate("/properties"), 1500);
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to update property.", "danger");
    } finally {
      setSubmitting(false);
    }
  };

  const totalPhotos    = existingPhotos.length + newPhotos.length;
  const LISTING_TYPES  = ["Sell","Rent","PG","Commercial","Plots"];
  const PROPERTY_TYPES = ["Apartment","Independent House","Villa","Plot","Commercial"];
  const grid2 = { display:"grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap:16 };

  return (
    <div style={{ background:"#f7f8fc", minHeight:"100vh", fontFamily:"'DM Sans', system-ui, sans-serif" }}>
      <style>{`
        * { box-sizing: border-box; }
        @keyframes toastIn { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        @keyframes shimmer { 0%{background-position:-600px 0} 100%{background-position:600px 0} }
        .sk {
          background:linear-gradient(90deg,#f0f2f5 25%,#e8eaed 50%,#f0f2f5 75%);
          background-size:600px 100%; animation:shimmer 1.4s infinite;
        }
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
        .photo-badge {
          position:absolute; bottom:5px; left:5px; background:rgba(0,0,0,0.55);
          color:#fff; font-size:9px; padding:2px 6px; border-radius:5px; font-weight:700;
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
          <div style={{  margin:"0 auto" }}>

            {/* Page Header */}
            <div style={{
              display:"flex", alignItems: isMobile ? "flex-start" : "center",
              gap:16, marginBottom:28, flexWrap:"wrap",
            }}>
              <button type="button" onClick={() => navigate(-1)} style={{
                display:"flex", alignItems:"center", gap:6, padding:"9px 16px",
                border:"1.5px solid #e5e7eb", borderRadius:10, background:"#fff",
                fontSize:13, fontWeight:600, color:"#374151", cursor:"pointer",
                fontFamily:"inherit", flexShrink:0, whiteSpace:"nowrap",
              }}>
                <i className="bi bi-arrow-left" /> Back
              </button>
              <div>
                <h2 style={{
                  fontSize: isMobile ? 20 : 26, fontWeight:800, color:"#111827",
                  margin:0, letterSpacing:"-0.3px",
                }}>Edit Property</h2>
                <p style={{ fontSize:13, color:"#9ca3af", margin:"4px 0 0" }}>
                  Update the details below to keep your listing accurate.
                </p>
              </div>
            </div>

            {loading ? <Skeleton /> : (
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
                <SectionCard number="4" icon="📸" title="Photos & Description" desc="Manage existing photos and update the description">
                  <div style={{ marginBottom:18 }}>
                    <Label>Property description</Label>
                    <FTextarea
                      name="description" value={formData.description}
                      onChange={handleChange} rows={4}
                      placeholder="Key features: corner plot, near metro, parking, fully furnished…"
                    />
                  </div>

                  {/* Existing + new photo thumbnails */}
                  {(existingPhotos.length > 0 || newPreviews.length > 0) && (
                    <div style={{ marginBottom:18 }}>
                      <Label>Current photos ({totalPhotos}/5)</Label>
                      <div style={{ display:"flex", flexWrap:"wrap", gap:10, marginTop:6 }}>
                        {existingPhotos.map((url, i) => (
                          <div key={`e-${i}`} className="photo-slot">
                            <img src={url} alt="" />
                            <span className="photo-badge">Saved</span>
                            <button type="button" className="photo-remove" onClick={() => removeExisting(url)}>×</button>
                          </div>
                        ))}
                        {newPreviews.map((src, i) => (
                          <div key={`n-${i}`} className="photo-slot">
                            <img src={src} alt="" />
                            <span className="photo-badge">New</span>
                            <button type="button" className="photo-remove" onClick={() => removeNew(i)}>×</button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <Label>Add more photos</Label>
                  <label
                    className="upload-box"
                    htmlFor="editFileInput"
                    style={{
                      opacity: totalPhotos >= 5 ? 0.5 : 1,
                      pointerEvents: totalPhotos >= 5 ? "none" : "auto",
                    }}
                  >
                    <input
                      type="file" multiple id="editFileInput"
                      style={{ display:"none" }} onChange={handleNewPhotos} accept="image/*"
                    />
                    <div style={{
                      width:52, height:52, borderRadius:14, background:"#f1f5f9",
                      display:"flex", alignItems:"center", justifyContent:"center",
                    }}>
                      <i className="bi bi-cloud-arrow-up" style={{ fontSize:26, color:"#94a3b8" }} />
                    </div>
                    <div style={{ fontSize:14, fontWeight:700, color:"#374151" }}>
                      {totalPhotos >= 5 ? "Photo limit reached" : "Click to add more photos"}
                    </div>
                    <div style={{ fontSize:12, color:"#9ca3af" }}>{totalPhotos}/5 photos · JPG or PNG</div>
                  </label>
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
                      fontWeight:700, fontSize:15,
                      cursor: submitting ? "not-allowed" : "pointer",
                      fontFamily:"inherit",
                      boxShadow:"0 4px 18px rgba(225,45,45,0.35)",
                      transition:"all .2s",
                    }}
                  >
                    {submitting ? (
                      <>
                        <span className="spinner-border spinner-border-sm" role="status"
                          style={{ width:16, height:16, borderWidth:2 }} />
                        Saving…
                      </>
                    ) : (
                      <>
                        <i className="bi bi-check2-circle" />
                        Save Changes
                      </>
                    )}
                  </button>
                </div>

              </form>
            )}
          </div>
        </main>
      </div>

      <Toast toast={toast} />
    </div>
  );
};

export default EditProperty;