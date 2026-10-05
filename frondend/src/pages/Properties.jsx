import React, { useEffect, useState } from "react";
import axios from "axios";
import Header from "../components/Header";
import BrokerSidebar from "../components/BrokerSidebar";
import { Link, useNavigate } from "react-router-dom";

const BRAND = "#e12d2d";

const useIsMobile = () => {
  const [v, setV] = useState(window.innerWidth < 992);
  useEffect(() => {
    const fn = () => setV(window.innerWidth < 992);
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, []);
  return v;
};

const formatPrice = (price) => {
  if (!price) return "N/A";
  const n = Number(price);
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(2)} Cr`;
  if (n >= 100000)   return `₹${(n / 100000).toFixed(2)} L`;
  return `₹${n.toLocaleString("en-IN")}`;
};

const Toast = ({ toast }) => {
  if (!toast) return null;
  const ok = toast.type !== "danger";
  return (
    <div style={{
      position:"fixed", bottom:24, left:16, right:16, zIndex:9999,
      maxWidth:440, margin:"0 auto",
      background: ok ? "#f0fdf4" : "#fff1f1",
      color: ok ? "#166534" : "#991b1b",
      borderRadius:12, padding:"14px 20px",
      display:"flex", alignItems:"center", gap:10,
      fontWeight:600, fontSize:14,
      boxShadow:"0 8px 28px rgba(0,0,0,0.12)",
      animation:"toastIn .3s ease",
    }}>
      <i className={`bi bi-${ok ? "check-circle-fill" : "x-circle-fill"}`}
        style={{ fontSize:18, flexShrink:0 }} />
      {toast.msg}
    </div>
  );
};

const StatusBadge = ({ status }) => {
  const map = {
    Active: { bg:"#f0fdf4", color:"#15803d", dot:"#22c55e" },
    Sold:   { bg:"#eff6ff", color:"#1d4ed8", dot:"#3b82f6" },
    Rented: { bg:"#fefce8", color:"#a16207", dot:"#eab308" },
  };
  const s = map[status] || map.Active;
  return (
    <span style={{
      display:"inline-flex", alignItems:"center", gap:5,
      background:s.bg, color:s.color,
      borderRadius:20, fontSize:11, fontWeight:700,
      padding:"4px 10px", whiteSpace:"nowrap", flexShrink:0,
    }}>
      <span style={{
        width:7, height:7, borderRadius:"50%",
        background:s.dot, flexShrink:0,
      }} />
      {status}
    </span>
  );
};

const SkeletonCard = ({ isMobile }) => (
  <div style={{
    background:"#fff", borderRadius:16, border:"1px solid #f0f2f5",
    marginBottom:16, boxShadow:"0 2px 12px rgba(0,0,0,0.05)", overflow:"hidden",
  }}>
    <div style={{ display:"flex", flexDirection: isMobile ? "column" : "row" }}>
      <div className="shimmer" style={{
        width: isMobile ? "100%" : 240,
        minHeight: isMobile ? 200 : 180, flexShrink:0,
      }} />
      <div style={{ flex:1, padding:"20px 24px" }}>
        <div className="shimmer" style={{ height:20, width:"55%", borderRadius:6, marginBottom:12 }} />
        <div className="shimmer" style={{ height:14, width:"38%", borderRadius:6, marginBottom:8 }} />
        <div style={{ display:"flex", gap:8, marginTop:16 }}>
          <div className="shimmer" style={{ height:28, width:60, borderRadius:20 }} />
          <div className="shimmer" style={{ height:28, width:80, borderRadius:20 }} />
          <div className="shimmer" style={{ height:28, width:70, borderRadius:20 }} />
        </div>
        <div style={{ display:"flex", gap:10, marginTop:24 }}>
          <div className="shimmer" style={{ height:36, width:80, borderRadius:9 }} />
          <div className="shimmer" style={{ height:36, width:80, borderRadius:9 }} />
        </div>
      </div>
    </div>
  </div>
);

const PropertyCard = ({ prop, onEdit, onDelete, isMobile }) => {
  const cover = prop.photos?.[0] || null;
  return (
    <div style={{
      background:"#fff", borderRadius:16, border:"1px solid #f0f2f5",
      marginBottom:16, boxShadow:"0 2px 12px rgba(0,0,0,0.05)",
      overflow:"hidden", transition:"box-shadow .2s",
    }}
      onMouseEnter={e => e.currentTarget.style.boxShadow = "0 8px 30px rgba(0,0,0,0.10)"}
      onMouseLeave={e => e.currentTarget.style.boxShadow = "0 2px 12px rgba(0,0,0,0.05)"}>

      <div style={{ display:"flex", flexDirection: isMobile ? "column" : "row" }}>

        {/* Photo */}
        <div style={{
          width: isMobile ? "100%" : 240,
          minHeight: isMobile ? 200 : 180,
          flexShrink:0, position:"relative",
        }}>
          {cover
            ? <img src={cover} alt="property" style={{
                width:"100%", height:"100%",
                minHeight: isMobile ? 200 : 180,
                objectFit:"cover", display:"block",
              }} />
            : <div style={{
                background:"linear-gradient(135deg,#f8fafc,#f1f5f9)",
                width:"100%", minHeight: isMobile ? 200 : 180,
                display:"flex", flexDirection:"column",
                alignItems:"center", justifyContent:"center", gap:10,
              }}>
                <i className="bi bi-building" style={{ fontSize:44, color:"#cbd5e1" }} />
                <span style={{ fontSize:12, color:"#94a3b8", fontWeight:600 }}>No Photo</span>
              </div>
          }
          {isMobile && (
            <div style={{ position:"absolute", top:12, right:12 }}>
              <StatusBadge status={prop.status || "Active"} />
            </div>
          )}
        </div>

        {/* Content */}
        <div style={{
          flex:1, padding: isMobile ? "16px 16px 20px" : "20px 24px",
          display:"flex", flexDirection:"column", minWidth:0,
        }}>
          <div style={{
            display:"flex", justifyContent:"space-between",
            alignItems:"flex-start", gap:10, marginBottom:6,
          }}>
            <div style={{ flex:1, minWidth:0 }}>
              <h5 style={{
                fontWeight:700, fontSize: isMobile ? 15 : 17,
                color:"#111827", margin:"0 0 4px",
              }}>
                {prop.propertyType || "Property"}
                {prop.localities?.[0] ? ` · ${prop.localities[0]}` : ""}
              </h5>
              <div style={{
                color:"#64748b", fontSize:13,
                display:"flex", alignItems:"center", gap:4,
              }}>
                <i className="bi bi-geo-alt" />
                {prop.localities?.join(", ") || "Location not specified"}
              </div>
            </div>
            {!isMobile && <StatusBadge status={prop.status || "Active"} />}
          </div>

          {/* Chips */}
          <div style={{ display:"flex", flexWrap:"wrap", gap:8, margin:"10px 0" }}>
            <span style={{
              background:"#fff1f1", color:BRAND,
              borderRadius:20, fontSize:12, fontWeight:700, padding:"4px 12px",
            }}>
              {prop.listingType || "Sell"}
            </span>
            {prop.size && (
              <span style={{
                background:"#f8fafc", color:"#475569",
                borderRadius:20, fontSize:12, fontWeight:700, padding:"4px 12px",
              }}>
                <i className="bi bi-arrows-angle-expand me-1" />{prop.size} Sq.Ft
              </span>
            )}
            {prop.price && (
              <span style={{
                background:"#f0fdf4", color:"#15803d",
                borderRadius:20, fontSize:12, fontWeight:700, padding:"4px 12px",
              }}>
                {formatPrice(prop.price)}
              </span>
            )}
          </div>

          {/* Description */}
          {prop.description && (
            <p style={{
              color:"#64748b", fontSize:13, lineHeight:1.6, margin:"0 0 8px",
              display:"-webkit-box", WebkitLineClamp:2,
              WebkitBoxOrient:"vertical", overflow:"hidden",
            }}>
              {prop.description}
            </p>
          )}

          {/* Photo count */}
          {prop.photos?.length > 0 && (
            <div style={{ color:"#94a3b8", fontSize:12, marginBottom:4 }}>
              <i className="bi bi-images me-1" />
              {prop.photos.length} photo{prop.photos.length !== 1 ? "s" : ""}
            </div>
          )}

          {/* Actions */}
          <div style={{ display:"flex", gap:10, marginTop:"auto", paddingTop:14 }}>
            <button
              onClick={() => onEdit(prop._id)}
              style={{
                flex: isMobile ? 1 : "unset",
                display:"flex", alignItems:"center",
                justifyContent:"center", gap:6,
                padding:"9px 18px", borderRadius:9,
                border:"1.5px solid #e2e8f0", background:"#fff",
                color:"#374151", fontWeight:600, fontSize:13,
                cursor:"pointer", fontFamily:"inherit", transition:"all .15s",
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor="#94a3b8";
                e.currentTarget.style.background="#f8fafc";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor="#e2e8f0";
                e.currentTarget.style.background="#fff";
              }}>
              <i className="bi bi-pencil" /> Edit
            </button>
            <button
              onClick={() => onDelete(prop)}
              style={{
                flex: isMobile ? 1 : "unset",
                display:"flex", alignItems:"center",
                justifyContent:"center", gap:6,
                padding:"9px 18px", borderRadius:9,
                border:"1.5px solid #fecaca", background:"#fff1f1",
                color:BRAND, fontWeight:600, fontSize:13,
                cursor:"pointer", fontFamily:"inherit", transition:"background .15s",
              }}
              onMouseEnter={e => e.currentTarget.style.background="#fee2e2"}
              onMouseLeave={e => e.currentTarget.style.background="#fff1f1"}>
              <i className="bi bi-trash" /> Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const DeleteModal = ({ property, onConfirm, onCancel, deleting }) => (
  <div style={{
    position:"fixed", inset:0, background:"rgba(0,0,0,0.5)",
    zIndex:1055, display:"flex", alignItems:"center",
    justifyContent:"center", padding:16,
  }}
    onClick={e => e.target === e.currentTarget && !deleting && onCancel()}>
    <div style={{
      background:"#fff", borderRadius:20, maxWidth:420, width:"100%",
      padding:"40px 32px", textAlign:"center",
      boxShadow:"0 20px 60px rgba(0,0,0,0.15)",
    }}>
      <div style={{
        width:70, height:70, borderRadius:"50%", background:"#fff1f1",
        display:"flex", alignItems:"center", justifyContent:"center",
        margin:"0 auto 20px",
      }}>
        <i className="bi bi-trash3" style={{ fontSize:28, color:BRAND }} />
      </div>
      <h5 style={{ fontWeight:700, fontSize:18, marginBottom:8 }}>Delete Property?</h5>
      <p style={{ color:"#64748b", fontSize:14, lineHeight:1.6, marginBottom:28 }}>
        This will permanently delete{" "}
        <strong>{property?.propertyType}</strong> in{" "}
        <strong>{property?.localities?.[0]}</strong>. This cannot be undone.
      </p>
      <div style={{ display:"flex", gap:12, justifyContent:"center" }}>
        <button
          onClick={onCancel} disabled={deleting}
          style={{
            padding:"10px 24px", borderRadius:10,
            border:"1.5px solid #e2e8f0", background:"#fff",
            fontWeight:600, fontSize:14, cursor:"pointer", fontFamily:"inherit",
          }}>
          Cancel
        </button>
        <button
          onClick={onConfirm} disabled={deleting}
          style={{
            display:"flex", alignItems:"center", gap:8,
            padding:"10px 24px", borderRadius:10, border:"none",
            background:BRAND, color:"#fff", fontWeight:700, fontSize:14,
            cursor: deleting ? "not-allowed" : "pointer",
            opacity: deleting ? 0.7 : 1, fontFamily:"inherit",
          }}>
          {deleting
            ? <><span className="spinner-border spinner-border-sm"
                style={{ width:15, height:15, borderWidth:2 }} /> Deleting…</>
            : <><i className="bi bi-trash" /> Yes, Delete</>
          }
        </button>
      </div>
    </div>
  </div>
);

const EmptyState = ({ isMobile }) => (
  <div style={{ textAlign:"center", padding: isMobile ? "48px 24px" : "64px 24px" }}>
    <div style={{
      width:90, height:90, borderRadius:"50%",
      background:"linear-gradient(135deg,#f8fafc,#f1f5f9)",
      display:"flex", alignItems:"center", justifyContent:"center",
      margin:"0 auto 20px",
    }}>
      <i className="bi bi-building" style={{ fontSize:38, color:"#94a3b8" }} />
    </div>
    <h5 style={{ fontWeight:700, fontSize:18, marginBottom:8, color:"#111827" }}>
      No Properties Yet
    </h5>
    <p style={{ color:"#9ca3af", maxWidth:300, margin:"0 auto 24px", fontSize:14, lineHeight:1.6 }}>
      You haven't listed any properties. Add your first one to start getting leads.
    </p>
    <Link to="/add-property" style={{
      display:"inline-flex", alignItems:"center", gap:8,
      padding:"12px 28px", background:BRAND, color:"#fff",
      borderRadius:12, fontWeight:700, fontSize:15,
      textDecoration:"none", boxShadow:"0 4px 18px rgba(225,45,45,0.35)",
    }}>
      <i className="bi bi-plus-lg" /> Add Your First Property
    </Link>
  </div>
);

const Properties = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const [properties,   setProperties]   = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting,     setDeleting]     = useState(false);
  const [toast,        setToast]        = useState(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/my-properties`,
          { withCredentials: true }
        );
        setProperties(response.data.data ?? response.data);
      } catch (error) {
        console.error("Fetch error:", error);
        showToast("Failed to load properties. Please try again.", "danger");
      } finally {
        setLoading(false);
      }
    };
    fetchProperties();
  }, []);

  const handleEdit = id => navigate(`/edit-property/${id}`);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await axios.delete(
        `${import.meta.env.VITE_API_URL}/properties/${deleteTarget._id}`,
        { withCredentials:true }
      );
      setProperties(p => p.filter(x => x._id !== deleteTarget._id));
      showToast("Property deleted successfully.");
    } catch {
      showToast("Failed to delete property.", "danger");
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  return (
    <div style={{ background:"#f7f8fc", minHeight:"100vh", fontFamily:"'DM Sans', system-ui, sans-serif" }}>
      <style>{`
        * { box-sizing: border-box; }
        @keyframes toastIn {
          from { opacity:0; transform:translateY(12px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes shimmer {
          0%   { background-position:-600px 0; }
          100% { background-position: 600px 0; }
        }
        .shimmer {
          background: linear-gradient(90deg,#f0f2f5 25%,#e8eaed 50%,#f0f2f5 75%);
          background-size: 600px 100%;
          animation: shimmer 1.4s infinite;
        }
      `}</style>

     <Header />

      <div style={{
        display:"flex",
        flexDirection: isMobile ? "column" : "row",
        minHeight: isMobile ? "100vh" : "calc(100vh - 64px)",
      }}>
        <BrokerSidebar />

        <main style={{
          flex:1, overflowY:"auto",
          padding: isMobile ? "20px 15px 80px" : "36px 44px 60px",
          minWidth:0,
        }}>
          <div style={{  margin:"0 auto" }}>

            {/* Page Header */}
            <div style={{
              display:"flex",
              alignItems: isMobile ? "flex-start" : "center",
              justifyContent:"space-between",
              flexDirection: isMobile ? "column" : "row",
              gap:16, marginBottom:28,
            }}>
              <div>
                <h2 style={{
                  fontSize: isMobile ? 20 : 26, fontWeight:800,
                  color:"#111827", margin:0, letterSpacing:"-0.3px",
                }}>
                  My Properties
                </h2>
                <p style={{ fontSize:13, color:"#9ca3af", margin:"4px 0 0" }}>
                  {loading
                    ? "Loading listings…"
                    : `${properties.length} ${properties.length === 1 ? "property" : "properties"} listed`
                  }
                </p>
              </div>
              <Link to="/add-property" style={{
                display:"inline-flex", alignItems:"center", gap:8,
                padding:"11px 22px", background:BRAND, color:"#fff",
                borderRadius:11, fontWeight:700, fontSize:14,
                textDecoration:"none",
                boxShadow:"0 4px 16px rgba(225,45,45,0.35)",
                whiteSpace:"nowrap",
                alignSelf: isMobile ? "flex-start" : "auto",
              }}>
                <i className="bi bi-plus-lg" /> Add Property
              </Link>
            </div>

            {/* Content */}
            {loading
              ? [1,2,3].map(i => <SkeletonCard key={i} isMobile={isMobile} />)
              : properties.length === 0
                ? <EmptyState isMobile={isMobile} />
                : properties.map(prop => (
                    <PropertyCard
                      key={prop._id}
                      prop={prop}
                      isMobile={isMobile}
                      onEdit={handleEdit}
                      onDelete={setDeleteTarget}
                    />
                  ))
            }

          </div>
        </main>
      </div>

      {deleteTarget && (
        <DeleteModal
          property={deleteTarget}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          deleting={deleting}
        />
      )}

      <Toast toast={toast} />
    </div>
  );
};

export default Properties;