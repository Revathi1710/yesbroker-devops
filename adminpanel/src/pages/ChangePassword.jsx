import React, { useState, useMemo } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { 
  Key, Lock, ShieldCheck, ArrowLeft, CheckCircle2, 
  AlertTriangle, RefreshCw, ShieldAlert, History
} from "lucide-react";

const API = import.meta.env.VITE_API_URL;

const ChangePassword = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    old_password: "",
    new_password: "",
    confirm_password: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  setError("");
  setMessage("");

  if (form.new_password !== form.confirm_password) {
    return setError("New password and confirm password do not match");
  }

  try {
    setLoading(true);

    const res = await axios.put(          // ✅ PUT not POST
      `${API}/change-password`,
      {
        oldPassword: form.old_password,   // ✅ matches controller
        newPassword: form.new_password,   // ✅ matches controller
      },
      { withCredentials: true }           // ✅ cookie auth, not Bearer token
    );

    setMessage(res.data.message || "Password updated successfully");
    setForm({ old_password: "", new_password: "", confirm_password: "" });
  } catch (err) {
    setError(err.response?.data?.message || err.message || "Something went wrong");
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
        {/* ── Page Header ── */}
        <div className="yb-page-head">
          <div className="yb-page-head-inner">
            <div className="yb-crumbs">
              <button onClick={() => navigate(-1)} className="yb-back-btn">
                <ArrowLeft size={14} /> Back
              </button>
              <span>/</span>
              <a href="/dashboard">System</a>
              <span>/</span>
              <span className="active">Security</span>
            </div>

            <div className="yb-head-row">
              <div>
                <h4 className="yb-title">Account Security</h4>
                <p className="yb-subtitle">
                  Protect your administrative access by maintaining a strong password.
                </p>
              </div>
              <div className="yb-head-actions">
                <div className="yb-status-badge">
                  <ShieldCheck size={14} /> Managed Session
                </div>
              </div>
            </div>

            <div className="yb-stats">
              <Stat icon={<ShieldAlert size={16} />} label="Encryption" num="Active" tone="green" />
              <Stat icon={<History size={16} />} label="Last Change" num="2 Days" tone="navy" />
              <Stat icon={<Lock size={16} />} label="Privacy" num="High" tone="amber" />
              <Stat icon={<RefreshCw size={16} />} label="Sessions" num="Reset" tone="red" />
            </div>
          </div>
        </div>

        {/* ── Body ── */}
        <div className="yb-body">
          <div className="yb-grid-layout">
            
            {/* Left Info Column */}
            <div className="yb-info-col">
              <div className="yb-card-static">
                <h5 className="yb-card-title">Security Guidelines</h5>
                <p className="yb-card-desc">Keep your account safe by following these simple rules:</p>
                
                <ul className="yb-guide-list">
                  <li>
                    <CheckCircle2 size={14} className="text-green" />
                    <span>Use at least 8 characters</span>
                  </li>
                  <li>
                    <CheckCircle2 size={14} className="text-green" />
                    <span>Mix numbers and symbols</span>
                  </li>
                  <li>
                    <CheckCircle2 size={14} className="text-green" />
                    <span>Passwords are encrypted on server</span>
                  </li>
                  <li>
                    <CheckCircle2 size={14} className="text-green" />
                    <span>Forces logout on all devices</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Right Form Column */}
            <div className="yb-form-col">
              <div className="yb-card">
                <form onSubmit={handleSubmit} className="yb-form-stack">
                  
                  {error && (
                    <div className="yb-alert error">
                      <AlertTriangle size={18} />
                      <span>{error}</span>
                    </div>
                  )}
                  
                  {message && (
                    <div className="yb-alert success">
                      <CheckCircle2 size={18} />
                      <span>{message}</span>
                    </div>
                  )}

                  <div className="yb-input-group">
                    <label className="yb-input-label">Current Password</label>
                    <div className="yb-input-wrapper">
                      <Key size={16} />
                      <input
                        type="password"
                        name="old_password"
                        placeholder="Enter your current password"
                        value={form.old_password}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="yb-input-row">
                    <div className="yb-input-group">
                      <label className="yb-input-label">New Password</label>
                      <div className="yb-input-wrapper">
                        <Lock size={16} />
                        <input
                          type="password"
                          name="new_password"
                          placeholder="Min. 8 chars"
                          value={form.new_password}
                          onChange={handleChange}
                          required
                        />
                      </div>
                    </div>

                    <div className="yb-input-group">
                      <label className="yb-input-label">Confirm Password</label>
                      <div className="yb-input-wrapper">
                        <ShieldCheck size={16} />
                        <input
                          type="password"
                          name="confirm_password"
                          placeholder="Repeat new password"
                          value={form.confirm_password}
                          onChange={handleChange}
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="yb-form-footer">
                    <p className="yb-footer-text">
                      Updating will end all other active sessions.
                    </p>
                    <button
                      type="submit"
                      disabled={loading}
                      className="yb-btn yb-btn-primary"
                    >
                      {loading ? (
                        <span className="yb-spin" />
                      ) : (
                        <>
                          <RefreshCw size={15} /> Update Password
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

const Stat = ({ icon, num, label, tone }) => (
  <div className="yb-stat">
    <div className={`yb-stat-ic ${tone}`}>{icon}</div>
    <div>
      <div className="yb-stat-num">{num}</div>
      <div className="yb-stat-lbl">{label}</div>
    </div>
  </div>
);

const styles = `
  .yb-content { font-family:'DM Sans', sans-serif; background:#F6F7FB; min-height:100vh; }

  /* Page header */
  .yb-page-head { background:#fff; border-bottom:1px solid #ECEFF4; }
  .yb-page-head-inner { padding:18px 28px 22px; max-width:1400px; margin: 0 auto; }
  .yb-crumbs { display:flex; align-items:center; gap:8px; font-size:12px; color:#94A3B8; margin-bottom:8px; }
  .yb-crumbs a, .yb-back-btn { color:#64748B; text-decoration:none; font-weight:500; background:none; border:none; cursor:pointer; padding:0; font-family:inherit; }
  .yb-crumbs a:hover, .yb-back-btn:hover { color:#ef4444; }
  .yb-crumbs .active { color:#1a335d; font-weight:600; }
  .yb-head-row { display:flex; align-items:center; justify-content:space-between; gap:16px; flex-wrap:wrap; }
  .yb-title { font-family:'Playfair Display', serif; font-size:26px; color:#1a335d; margin:0; }
  .yb-subtitle { font-size:13.5px; color:#64748B; margin:4px 0 0; }

  .yb-status-badge { 
    display:flex; align-items:center; gap:6px;
    background:#EEF2FF; color:#4f46e5; border:1px solid #E0E7FF;
    padding:6px 12px; border-radius:99px; font-size:12px; font-weight:700;
  }

  /* Stats */
  .yb-stats { display:grid; grid-template-columns:repeat(4, 1fr); gap:12px; margin-top:18px; }
  @media (max-width:720px) { .yb-stats { grid-template-columns:repeat(2, 1fr); } }
  .yb-stat { display:flex; align-items:center; gap:12px; background:#F8FAFC; border:1px solid #ECEFF4; border-radius:12px; padding:12px 14px; }
  .yb-stat-ic { width:36px; height:36px; border-radius:10px; display:inline-flex; align-items:center; justify-content:center; }
  .yb-stat-ic.navy { background:rgba(26,51,93,.10); color:#1a335d; }
  .yb-stat-ic.green { background:rgba(34,197,94,.10); color:#16a34a; }
  .yb-stat-ic.red { background:rgba(239,68,68,.10); color:#ef4444; }
  .yb-stat-ic.amber { background:rgba(245,158,11,.12); color:#d97706; }
  .yb-stat-num { font-size:18px; font-weight:800; color:#1a335d; line-height:1; }
  .yb-stat-lbl { font-size:11.5px; color:#64748B; margin-top:4px; text-transform:uppercase; letter-spacing:.4px; font-weight:600; }

  /* Grid Layout */
  .yb-body { padding:28px; max-width:1200px; margin: 0 auto; }
  .yb-grid-layout { display: grid; grid-template-columns: 350px 1fr; gap: 30px; align-items: start; }
  @media (max-width: 992px) { .yb-grid-layout { grid-template-columns: 1fr; } }

  /* Card Styles */
  .yb-card { background:#fff; border:1px solid #ECEFF4; border-radius:16px; padding:30px; box-shadow:0 1px 2px rgba(15,23,42,.03); }
  .yb-card-static { padding: 10px; }
  .yb-card-title { font-size:18px; font-weight:700; color:#1a335d; margin:0; }
  .yb-card-desc { font-size:13.5px; color:#64748B; margin-top:6px; }

  /* Guide List */
  .yb-guide-list { list-style:none; padding:0; margin:20px 0 0; display:grid; gap:12px; }
  .yb-guide-list li { display:flex; align-items:center; gap:10px; font-size:13px; color:#475569; font-weight:500; }
  .text-green { color: #10b981; }

  /* Form Styles */
  .yb-form-stack { display: grid; gap: 24px; }
  .yb-input-row { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
  @media (max-width: 600px) { .yb-input-row { grid-template-columns: 1fr; } }

  .yb-input-group { display: flex; flex-direction: column; gap: 8px; }
  .yb-input-label { font-size: 12px; font-weight: 700; color: #64748B; text-transform: uppercase; letter-spacing: .5px; }
  
  .yb-input-wrapper { 
    position: relative; display: flex; align-items: center; 
    background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 12px;
    padding: 0 15px; transition: all 0.2s;
  }
  .yb-input-wrapper:focus-within { border-color: #ef4444; background: #fff; box-shadow: 0 0 0 4px rgba(239,68,68,0.1); }
  .yb-input-wrapper svg { color: #94A3B8; }
  .yb-input-wrapper input { 
    flex: 1; border: none; background: transparent; outline: none; 
    padding: 14px 12px; font-size: 14px; color: #1e293b; font-family: inherit;
  }

  /* Alerts */
  .yb-alert { display: flex; align-items: center; gap: 12px; padding: 14px; border-radius: 12px; font-size: 13.5px; font-weight: 600; }
  .yb-alert.error { background: #FEF2F2; color: #ef4444; border: 1px solid #FECACA; }
  .yb-alert.success { background: #F0FDF4; color: #16a34a; border: 1px solid #BBF7D0; }

  /* Buttons */
  .yb-btn { 
    display:inline-flex; align-items:center; justify-content:center; gap:8px; 
    padding:12px 24px; border-radius:12px; font-size:14px; font-weight:700; 
    cursor:pointer; border:none; transition:all .15s; font-family:inherit;
  }
  .yb-btn-primary { background:linear-gradient(135deg,#ef4444,#dc2626); color:#fff; box-shadow:0 8px 18px rgba(239,68,68,.28); }
  .yb-btn-primary:hover:not(:disabled) { transform:translateY(-1px); box-shadow:0 12px 22px rgba(239,68,68,.34); }
  
  .yb-form-footer { display: flex; align-items: center; justify-content: space-between; gap: 20px; border-top: 1px solid #F1F5F9; pt: 20px; margin-top: 10px; }
  .yb-footer-text { font-size: 12px; color: #94A3B8; font-style: italic; margin: 0; }

  .yb-spin { width:16px; height:16px; border-radius:50%; border:2px solid rgba(255,255,255,.4); border-top-color:#fff; animation:ybspin .7s linear infinite; }
  @keyframes ybspin { to { transform:rotate(360deg); } }
`;

export default ChangePassword;