import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import Header from "../components/Header";
import BrokerSidebar from "../components/BrokerSidebar";

// ── Time formatter ────────────────────────────────────────────
const timeAgo = (dateStr) => {
  const now  = Date.now();
  const diff = now - new Date(dateStr).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  const weeks = Math.floor(diff / 604800000);
  const months= Math.floor(diff / 2592000000);

  if (mins < 1)    return 'Just now';
  if (mins < 60)   return `${mins} minute${mins !== 1 ? 's' : ''} ago`;
  if (hours < 24)  return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
  if (days < 7)    return `${days} day${days !== 1 ? 's' : ''} ago`;
  if (weeks < 4)   return `${weeks} week${weeks !== 1 ? 's' : ''} ago`;
  if (months < 12) return `${months} month${months !== 1 ? 's' : ''} ago`;
  return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
};

// ── Styles ───────────────────────────────────────────────────
const styles = {
  mainContent: {
    flex: 1,
    padding: "32px 32px 40px",
    overflowX: "hidden",
    transition: "margin-left 0.3s ease",
    backgroundColor: "#f7f8fa",
    minHeight: "100vh",
    fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
  },
  mainContentMobile: {
    marginLeft: 0,
    padding: "20px 16px 40px",
  },
  pageHeader: { marginBottom: "28px" },
  greeting: {
    fontSize: "26px", fontWeight: 700, color: "#1a1a2e",
    margin: 0, letterSpacing: "-0.4px",
  },
  subGreeting: { fontSize: "14px", color: "#8a8fa8", marginTop: "4px", marginBottom: 0 },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "16px", marginBottom: "28px",
  },
  statCard: {
    background: "#ffffff", borderRadius: "14px", padding: "20px 22px",
    boxShadow: "0 1px 4px rgba(0,0,0,0.07)", display: "flex",
    alignItems: "center", gap: "16px", border: "1px solid #f0f0f5",
    transition: "transform 0.15s, box-shadow 0.15s", cursor: "default",
  },
  statIconWrap: {
    width: "48px", height: "48px", borderRadius: "12px",
    display: "flex", alignItems: "center", justifyContent: "center",
    flexShrink: 0, fontSize: "20px",
  },
  statLabel: {
    fontSize: "12px", color: "#8a8fa8", fontWeight: 500,
    textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "4px",
  },
  statValue: { fontSize: "24px", fontWeight: 700, color: "#1a1a2e", lineHeight: 1 },
  twoCol: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "24px" },
  card: {
    background: "#ffffff", borderRadius: "14px", padding: "22px",
    boxShadow: "0 1px 4px rgba(0,0,0,0.07)", border: "1px solid #f0f0f5",
  },
  cardTitle: {
    fontSize: "15px", fontWeight: 700, color: "#1a1a2e",
    marginBottom: "18px", display: "flex", alignItems: "center", gap: "8px",
  },
  profileRow: {
    display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px",
  },
  profileLabel: { fontSize: "13px", color: "#5a5f75", fontWeight: 500 },
  profilePercent: { fontSize: "13px", color: "#e53935", fontWeight: 700 },
  progressBarBg: { height: "8px", background: "#f0f0f5", borderRadius: "99px", overflow: "hidden" },
  progressBarFill: {
    height: "100%", borderRadius: "99px",
    background: "linear-gradient(90deg, #e53935, #ff6b6b)", transition: "width 0.6s ease",
  },
  completionTips: { marginTop: "16px", display: "flex", flexDirection: "column", gap: "10px" },
  tipRow: { display: "flex", alignItems: "center", gap: "10px", fontSize: "13px", color: "#5a5f75" },
  tipCheck: {
    width: "18px", height: "18px", borderRadius: "50%", display: "flex",
    alignItems: "center", justifyContent: "center", flexShrink: 0,
    fontSize: "10px", fontWeight: 700,
  },
  actionsGrid: { display: "grid", gap: "10px" },
  actionBtn: {
    padding: "14px 12px", borderRadius: "10px", border: "none", cursor: "pointer",
    fontSize: "13px", fontWeight: 600, display: "flex", flexDirection: "column",
    alignItems: "center", gap: "6px", transition: "transform 0.1s, opacity 0.1s",
    textDecoration: "none",
  },
  actionIcon: { fontSize: "20px", lineHeight: 1 },

  // ── Activity styles ──
  activityList: { display: "flex", flexDirection: "column", gap: "0" },
  activityItem: {
    display: "flex", alignItems: "flex-start", gap: "12px",
    padding: "12px 0", borderBottom: "1px solid #f7f8fa",
  },
  activityIconWrap: {
    width: "34px", height: "34px", borderRadius: "10px",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: "15px", flexShrink: 0,
  },
  activityText: { fontSize: "13px", color: "#1a1a2e", lineHeight: 1.5, fontWeight: 500 },
  activityTime: { fontSize: "11px", color: "#b0b5c8", marginTop: "3px" },
  activityMeta: {
    display: "inline-block", fontSize: "10px", fontWeight: 700,
    padding: "2px 7px", borderRadius: "99px", marginTop: "4px",
  },
  emptyActivity: {
    textAlign: "center", padding: "32px 16px", color: "#b0b5c8", fontSize: "13px",
  },
  loadingDot: {
    display: "inline-block", width: "6px", height: "6px", borderRadius: "50%",
    background: "#e53935", margin: "0 2px",
  },

  // ── Profile card styles ──
  profileInfoWrap: {
    display: "flex", alignItems: "center", gap: "16px",
    padding: "14px 0", borderBottom: "1px solid #f0f0f5", marginBottom: "14px",
  },
  profileAvatar: {
    width: "56px", height: "56px", borderRadius: "50%",
    objectFit: "cover", border: "2px solid #fde8e8", flexShrink: 0,
  },
  profileAvatarPlaceholder: {
    width: "56px", height: "56px", borderRadius: "50%", background: "#fde8e8",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: "22px", fontWeight: 700, color: "#e53935", flexShrink: 0,
  },
  profileName: { fontSize: "17px", fontWeight: 700, color: "#1a1a2e" },
  profileBadge: {
    display: "inline-flex", alignItems: "center", gap: "4px",
    background: "#fde8e8", color: "#e53935", fontSize: "11px",
    fontWeight: 600, padding: "2px 8px", borderRadius: "99px", marginTop: "4px",
  },
  infoRow: {
    display: "flex", justifyContent: "space-between", alignItems: "center",
    padding: "8px 0", borderBottom: "1px solid #f7f8fa", fontSize: "13px",
  },
  infoKey: { color: "#8a8fa8", fontWeight: 500 },
  infoVal: {
    color: "#1a1a2e", fontWeight: 600, textAlign: "right",
    maxWidth: "60%", wordBreak: "break-word",
  },
  emptyState: { textAlign: "center", padding: "32px 16px", color: "#b0b5c8", fontSize: "14px" },
  skeleton: {
    background: "linear-gradient(90deg, #f0f0f5 25%, #e8e8f0 50%, #f0f0f5 75%)",
    backgroundSize: "200% 100%", animation: "shimmer 1.4s infinite", borderRadius: "8px",
  },
};

// ── Stat Card ────────────────────────────────────────────────
const StatCard = ({ icon, label, value, iconBg }) => {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      style={{
        ...styles.statCard,
        transform: hovered ? "translateY(-2px)" : "none",
        boxShadow: hovered ? "0 6px 18px rgba(0,0,0,0.10)" : "0 1px 4px rgba(0,0,0,0.07)",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div style={{ ...styles.statIconWrap, background: iconBg }}>{icon}</div>
      <div>
        <div style={styles.statLabel}>{label}</div>
        <div style={styles.statValue}>{value ?? "—"}</div>
      </div>
    </div>
  );
};

// ── Activity Skeleton ────────────────────────────────────────
const ActivitySkeleton = () => (
  <div style={{ display: "flex", flexDirection: "column", gap: "14px", padding: "4px 0" }}>
    {[1, 2, 3, 4].map((i) => (
      <div key={i} style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <div style={{ ...styles.skeleton, width: "34px", height: "34px", borderRadius: "10px", flexShrink: 0 }} />
        <div style={{ flex: 1 }}>
          <div style={{ ...styles.skeleton, height: "13px", width: "80%", marginBottom: "6px" }} />
          <div style={{ ...styles.skeleton, height: "10px", width: "40%" }} />
        </div>
      </div>
    ))}
  </div>
);

// ── Profile Completion Helper ────────────────────────────────
const getCompletionScore = (broker) => {
  if (!broker) return { score: 0, items: [] };
  const checks = [
    { label: "Profile photo",    done: !!broker.profileImage },
    { label: "Bio / About",      done: !!broker.about },
    { label: "Localities set",   done: Array.isArray(broker.locality) && broker.locality.length > 0 },
    { label: "Languages",        done: Array.isArray(broker.languages_spoken) && broker.languages_spoken.length > 0 },
    { label: "Services offered", done: Array.isArray(broker.service_offered) && broker.service_offered.length > 0 },
  ];
  const done = checks.filter((c) => c.done).length;
  return { score: Math.round((done / checks.length) * 100), items: checks };
};

// ── Activity type → meta badge color ────────────────────────
const metaBadgeStyle = (type) => {
  const map = {
    property: { bg: "#fde8e8", color: "#c62828" },
    story:    { bg: "#e8f5e9", color: "#2e7d32" },
    nudge:    { bg: "#fff8e1", color: "#f57f17" },
  };
  return map[type] || null;
};

// ── Main Dashboard ───────────────────────────────────────────
const Dashboard = () => {
  const [data,       setData]       = useState(null);
  const [activities, setActivities] = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [actLoading, setActLoading] = useState(true);
  const [isMobile,   setIsMobile]   = useState(window.innerWidth < 768);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Fetch profile
  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_API_URL}/brokerProfile`, { withCredentials: true })
      .then((res) => { setData(res.data); setLoading(false); })
      .catch((err) => { console.error("Profile API Error:", err.response?.data || err.message); setLoading(false); });
  }, []);

  // Fetch recent activity
  const fetchActivity = useCallback(() => {
    setActLoading(true);
    axios
      .get(`${import.meta.env.VITE_API_URL}/broker/recent-activity`, { withCredentials: true })
      .then((res) => { setActivities(res.data?.data || []); setActLoading(false); })
      .catch((err) => { console.error("Activity API Error:", err.response?.data || err.message); setActLoading(false); });
  }, []);

  useEffect(() => { fetchActivity(); }, [fetchActivity]);

  const { score, items } = getCompletionScore(data);
  const firstName = data?.name?.split(" ")[0] || "Broker";
  const initials  = data?.name
    ? data.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()
    : "YB";

  const mainStyle      = { ...styles.mainContent, ...(isMobile ? styles.mainContentMobile : {}) };
  const twoColStyle    = { ...styles.twoCol, ...(isMobile ? { gridTemplateColumns: "1fr" } : {}) };
  const actionsGridStyle = {
    ...styles.actionsGrid,
    gridTemplateColumns: isMobile ? "repeat(4, 1fr)" : "1fr 1fr",
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
        @keyframes shimmer {
          0%   { background-position: 200% 0 }
          100% { background-position: -200% 0 }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .act-item { animation: fadeIn 0.3s ease forwards; }
        .yb-action-btn:hover { opacity: 0.88 !important; transform: scale(0.97) !important; }
        @media (max-width: 480px) {
          .yb-actions-grid { grid-template-columns: 1fr 1fr !important; }
        }
      `}</style>

      <Header />
       
          <div className="mainbodybroker">
  <BrokerSidebar />
 <main style={{
          flex:1, overflowY:"auto",
          padding: isMobile ? "20px 15px 80px" : "36px 44px 60px",
          minWidth:0,
        }}> 


          {/* ── Page Header ── */}
          <div style={styles.pageHeader}>
            {loading ? (
              <div style={{ ...styles.skeleton, height: "28px", width: "220px", marginBottom: "8px" }} />
            ) : (
              <h1 style={styles.greeting}>Good morning, {firstName} 👋</h1>
            )}
            <p style={styles.subGreeting}>Here's what's happening with your broker account today.</p>
          </div>

          {/* ── Stats Row ── */}
          <div style={styles.statsGrid}>
            <StatCard icon="🏠" label="Property Listings" value={data?.property_listings ?? 0} iconBg="#fde8e8" />
            <StatCard icon="🤝" label="Deals Closed"       value={data?.deals_closed      ?? 0} iconBg="#e8f5e9" />
            <StatCard icon="😊" label="Happy Clients"      value={data?.happy_clients     ?? 0} iconBg="#e3f2fd" />
            <StatCard icon="📅" label="Years Experience"   value={data?.year_experience   ?? 0} iconBg="#fff3e0" />
          </div>

          {/* ── Row 1: Profile Overview + Profile Completion ── */}
          <div style={twoColStyle}>

            {/* Profile Overview */}
            <div style={styles.card}>
              <div style={styles.cardTitle}><span>👤</span> Profile Overview</div>
              {loading ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {[80, 60, 90, 70].map((w, i) => (
                    <div key={i} style={{ ...styles.skeleton, height: "16px", width: `${w}%` }} />
                  ))}
                </div>
              ) : data ? (
                <>
                  <div style={styles.profileInfoWrap}>
                    {data.profileImage ? (
                      <img src={data.profileImage} alt="Profile" style={styles.profileAvatar} />
                    ) : (
                      <div style={styles.profileAvatarPlaceholder}>{initials}</div>
                    )}
                    <div>
                      <div style={styles.profileName}>{data.name}</div>
                      <div style={styles.profileBadge}>✔ Certified Agent</div>
                    </div>
                  </div>
                  {[
                    { k: "Email",    v: data.email },
                    { k: "Mobile",   v: data.mobile_number },
                    { k: "Services", v: Array.isArray(data.service_offered) ? data.service_offered.join(", ") : data.service_offered },
                    {
                      k: "Areas",
                      v: Array.isArray(data.locality) && data.locality.length
                        ? data.locality.slice(0, 3).join(", ") + (data.locality.length > 3 ? ` +${data.locality.length - 3}` : "")
                        : "Not set",
                    },
                  ].map(({ k, v }) => (
                    <div style={styles.infoRow} key={k}>
                      <span style={styles.infoKey}>{k}</span>
                      <span style={styles.infoVal}>{v || "—"}</span>
                    </div>
                  ))}
                </>
              ) : (
                <div style={styles.emptyState}>Profile data unavailable.</div>
              )}
            </div>

            {/* Profile Completion */}
            <div style={styles.card}>
              <div style={styles.cardTitle}><span>✅</span> Profile Completion</div>
              <div style={styles.profileRow}>
                <span style={styles.profileLabel}>Overall completion</span>
                <span style={styles.profilePercent}>{score}%</span>
              </div>
              <div style={styles.progressBarBg}>
                <div style={{ ...styles.progressBarFill, width: `${score}%` }} />
              </div>
              <div style={styles.completionTips}>
                {items.map(({ label, done }) => (
                  <div style={styles.tipRow} key={label}>
                    <div style={{
                      ...styles.tipCheck,
                      background: done ? "#e8f5e9" : "#f0f0f5",
                      color:      done ? "#4CAF50" : "#c0c5d8",
                    }}>
                      {done ? "✓" : "○"}
                    </div>
                    <span style={{ color: done ? "#1a1a2e" : "#8a8fa8" }}>{label}</span>
                    {!done && (
                      <span style={{
                        marginLeft: "auto", fontSize: "11px", color: "#e53935",
                        background: "#fde8e8", padding: "2px 7px",
                        borderRadius: "99px", fontWeight: 600,
                      }}>
                        Add
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Row 2: Quick Actions + Recent Activity ── */}
          <div style={twoColStyle}>

            {/* Quick Actions */}
            <div style={styles.card}>
              <div style={styles.cardTitle}><span>⚡</span> Quick Actions</div>
              <div className="yb-actions-grid" style={actionsGridStyle}>
                {[
                  { icon: "🏠", label: "Post Property", color: "#fde8e8", text: "#e53935", href: "/add-property"    },
                  { icon: "📖", label: "Success Story", color: "#e8f5e9", text: "#388e3c", href: "/success-stories"  },
{ 
  icon: "🌐", 
  label: "My Website", 
  color: "#e3f2fd", 
  text: "#1976d2", 
  // Corrected: Removed the outer curly braces
  href: `/brokers/${data?.slug || 'seller-name'}` 
},     
                  { icon: "✏️", label: "Edit Profile",  color: "#fff3e0", text: "#f57c00", href: "/company-profile"  },
                ].map(({ icon, label, color, text, href }) => (
                  <a key={label} href={href} className="yb-action-btn"
                    style={{ ...styles.actionBtn, background: color, color: text }}>
                    <span style={styles.actionIcon}>{icon}</span>
                    <span>{label}</span>
                  </a>
                ))}
              </div>
            </div>

            {/* ── Recent Activity (dynamic) ── */}
            <div style={styles.card}>
              <div style={{ ...styles.cardTitle, justifyContent: "space-between" }}>
                <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span>🕐</span> Recent Activity
                </span>
                <button
                  onClick={fetchActivity}
                  disabled={actLoading}
                  style={{
                    background: "none", border: "none", cursor: actLoading ? "default" : "pointer",
                    fontSize: "12px", color: "#e53935", fontWeight: 600, padding: 0,
                    opacity: actLoading ? 0.5 : 1,
                  }}
                >
                  {actLoading ? "Loading..." : "↺ Refresh"}
                </button>
              </div>

              {actLoading ? (
                <ActivitySkeleton />
              ) : activities.length === 0 ? (
                <div style={styles.emptyActivity}>
                  <div style={{ fontSize: "2rem", marginBottom: "8px" }}>📭</div>
                  No activity yet. Start by adding a property or updating your profile!
                </div>
              ) : (
                <div style={styles.activityList}>
                  {activities.map((act, i) => {
                    const badge = metaBadgeStyle(act.type);
                    return (
                      <div
                        key={i}
                        className="act-item"
                        style={{ ...styles.activityItem, animationDelay: `${i * 0.05}s`,
                          borderBottom: i === activities.length - 1 ? "none" : "1px solid #f7f8fa" }}
                      >
                        {/* Icon bubble */}
                        <div style={{
                          ...styles.activityIconWrap,
                          background: act.color + "18",
                        }}>
                          {act.icon}
                        </div>

                        {/* Text */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={styles.activityText}>{act.message}</div>
                          {act.meta && badge && (
                            <span style={{ ...styles.activityMeta, background: badge.bg, color: badge.color }}>
                              {act.meta}
                            </span>
                          )}
                          <div style={styles.activityTime}>{timeAgo(act.time)}</div>
                        </div>

                        {/* Right dot indicator */}
                        <div style={{
                          width: "7px", height: "7px", borderRadius: "50%",
                          background: act.isNudge ? "#f59e0b" : act.color,
                          flexShrink: 0, marginTop: "6px",
                        }} />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* ── Row 3: Services + Localities ── */}
          {data && (
            <div style={twoColStyle}>
              <div style={styles.card}>
                <div style={styles.cardTitle}><span>🔧</span> Services Offered</div>
                {Array.isArray(data.service_offered) && data.service_offered.length > 0 ? (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                    {data.service_offered.map((s) => (
                      <span key={s} style={{
                        background: "#fde8e8", color: "#c62828",
                        fontSize: "12px", fontWeight: 600,
                        padding: "5px 12px", borderRadius: "99px",
                      }}>
                        {s}
                      </span>
                    ))}
                  </div>
                ) : (
                  <div style={styles.emptyState}>No services added yet.</div>
                )}
              </div>

              <div style={styles.card}>
                <div style={styles.cardTitle}><span>📍</span> Service Areas</div>
                {Array.isArray(data.locality) && data.locality.length > 0 ? (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                    {data.locality.map((loc) => (
                      <span key={loc} style={{
                        background: "#e3f2fd", color: "#1565c0",
                        fontSize: "12px", fontWeight: 600,
                        padding: "5px 12px", borderRadius: "99px",
                      }}>
                        {loc}
                      </span>
                    ))}
                  </div>
                ) : (
                  <div style={styles.emptyState}>No localities added yet.</div>
                )}
              </div>
            </div>
          )}

        </main>
      </div>
    </>
  );
};

export default Dashboard;