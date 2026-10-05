import axios from 'axios';
import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock, User, ShieldCheck, ArrowRight } from 'lucide-react';

const AdminLogin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!username || !password) {
      toast.error('Username and Password required');
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/admin-login`,
        { username, password },
        { withCredentials: true }
      );
      toast.success('Login Successful ✅');
      navigate('/dashboard');
      console.log(response.data);
    } catch (error) {
      console.error(error);
      toast.error(error?.response?.data?.message || 'Login failed ❌');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="al-page">
      <link
        href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Playfair+Display:wght@700&display=swap"
        rel="stylesheet"
      />

      <style>{`
        .al-page {
          min-height: 100vh;
          font-family: 'DM Sans', sans-serif;
          background: #F8FAFC;
          display: flex; align-items: center; justify-content: center;
          padding: 24px;
        }
        .al-card {
          width: 100%;
          max-width: 960px;
          display: grid; grid-template-columns: 1.05fr 1fr;
          background: #fff;
          border-radius: 24px;
          overflow: hidden;
          box-shadow: 0 20px 50px rgba(15,23,42,0.10);
          border: 1px solid #eef0f4;
        }

        /* LEFT PANEL — brand */
        .al-brand {
          position: relative;
          color: #fff;
          padding: 44px 40px;
          background:
            radial-gradient(700px 320px at 90% -10%, rgba(239,68,68,0.35), transparent 60%),
            radial-gradient(500px 260px at -10% 110%, rgba(99,102,241,0.30), transparent 60%),
            linear-gradient(135deg, #0F172A 0%, #1E293B 100%);
          display: flex; flex-direction: column; justify-content: space-between;
          min-height: 540px;
          overflow: hidden;
        }
        .al-brand::before, .al-brand::after {
          content: ''; position: absolute; border-radius: 50%;
          background: rgba(255,255,255,0.04); pointer-events: none;
        }
        .al-brand::before { width: 240px; height: 240px; top: -60px; right: -60px; }
        .al-brand::after  { width: 180px; height: 180px; bottom: -40px; left: -50px; }

        .al-logo {
          display: inline-flex; align-items: baseline;
          font-weight: 800; font-size: 24px; letter-spacing: .5px;
        }
        .al-logo .b1 { color: #ef4444; }
        .al-logo .b2 { color: #fff; }

        .al-headline {
          font-family: 'Playfair Display', serif;
          font-size: clamp(26px, 3vw, 34px);
          line-height: 1.15;
          margin: 0 0 10px;
        }
        .al-sub { color: #cbd5e1; font-size: 14px; line-height: 1.6; max-width: 360px; }

        .al-feature {
          display: flex; align-items: center; gap: 10px;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.12);
          padding: 12px 14px; border-radius: 12px;
          font-size: 13px; color: #e2e8f0;
        }
        .al-feature .dot {
          width: 32px; height: 32px; border-radius: 10px;
          background: rgba(239,68,68,0.18); color: #fca5a5;
          display: inline-flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }

        /* RIGHT PANEL — form */
        .al-form-wrap {
          padding: 44px 40px;
          display: flex; flex-direction: column; justify-content: center;
        }
        .al-title {
          font-family: 'Playfair Display', serif;
          font-size: 26px; color: #0F172A; margin: 0 0 6px;
        }
        .al-desc { color: #64748B; font-size: 14px; margin: 0 0 24px; }

        .al-label {
          display: block; font-size: 12.5px; font-weight: 700;
          color: #334155; margin-bottom: 6px; letter-spacing: 0.3px;
        }
        .al-input-wrap {
          position: relative; margin-bottom: 16px;
        }
        .al-input-wrap .al-icon {
          position: absolute; left: 14px; top: 50%; transform: translateY(-50%);
          color: #94A3B8;
        }
        .al-input {
          width: 100%;
          padding: 13px 14px 13px 42px;
          font-size: 14px; color: #0F172A;
          background: #F8FAFC;
          border: 1px solid #E2E8F0; border-radius: 12px;
          outline: none;
          transition: border-color .15s ease, background .15s ease, box-shadow .15s ease;
        }
        .al-input::placeholder { color: #94A3B8; }
        .al-input:focus {
          border-color: #ef4444; background: #fff;
          box-shadow: 0 0 0 4px rgba(239,68,68,0.12);
        }
        .al-pwd-toggle {
          position: absolute; right: 10px; top: 50%; transform: translateY(-50%);
          background: transparent; border: none; cursor: pointer;
          color: #94A3B8; padding: 6px; border-radius: 8px;
        }
        .al-pwd-toggle:hover { color: #475569; background: #F1F5F9; }

        .al-row {
          display: flex; align-items: center; justify-content: space-between;
          margin: 4px 0 22px;
          font-size: 13px;
        }
        .al-check { display: inline-flex; align-items: center; gap: 8px; color: #475569; cursor: pointer; user-select: none; }
        .al-check input { accent-color: #ef4444; width: 15px; height: 15px; }
        .al-forgot {
          color: #ef4444; font-weight: 600; text-decoration: none;
        }
        .al-forgot:hover { text-decoration: underline; }

        .al-btn {
          width: 100%; padding: 14px 18px; border: none; cursor: pointer;
          background: linear-gradient(135deg, #ef4444, #dc2626);
          color: #fff; font-weight: 700; font-size: 15px;
          border-radius: 12px;
          display: inline-flex; align-items: center; justify-content: center; gap: 8px;
          box-shadow: 0 10px 22px rgba(239,68,68,0.30);
          transition: transform .15s ease, box-shadow .15s ease, opacity .15s ease;
        }
        .al-btn:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 14px 26px rgba(239,68,68,0.38);
        }
        .al-btn:disabled { opacity: 0.7; cursor: not-allowed; }

        .al-spinner {
          width: 16px; height: 16px; border-radius: 50%;
          border: 2px solid rgba(255,255,255,0.4);
          border-top-color: #fff;
          animation: alspin 0.7s linear infinite;
        }
        @keyframes alspin { to { transform: rotate(360deg); } }

        .al-foot {
          margin-top: 20px; text-align: center;
          font-size: 12.5px; color: #94A3B8;
        }

        /* Responsive */
        @media (max-width: 860px) {
          .al-card { grid-template-columns: 1fr; max-width: 480px; }
          .al-brand { min-height: 220px; padding: 28px; gap: 18px; }
          .al-form-wrap { padding: 28px; }
        }
        @media (max-width: 420px) {
          .al-page { padding: 14px; }
          .al-card { border-radius: 18px; }
          .al-brand { padding: 22px; }
          .al-form-wrap { padding: 22px; }
        }
      `}</style>

      <div className="al-card">
        {/* LEFT — brand panel */}
        <div className="al-brand">
          <div className="al-logo">
            <span className="b1">YES</span>
            <span className="b2">BROKER</span>
          </div>

          <div>
            <h1 className="al-headline">Welcome back, Admin.</h1>
            <p className="al-sub">
              Manage brokers, properties, localities and subscriptions —
              all from one secure console.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div className="al-feature">
              <span className="dot"><ShieldCheck size={16} /></span>
              Secure session-based authentication
            </div>
            <div className="al-feature">
              <span className="dot"><Lock size={16} /></span>
              Restricted to authorized administrators
            </div>
          </div>
        </div>

        {/* RIGHT — form */}
        <div className="al-form-wrap">
          <h2 className="al-title">Admin Login</h2>
          <p className="al-desc">Enter your credentials to access the dashboard.</p>

          <form onSubmit={handleSubmit} noValidate>
            <label className="al-label" htmlFor="al-username">Username</label>
            <div className="al-input-wrap">
              <User size={16} className="al-icon" />
              <input
                id="al-username"
                type="text"
                className="al-input"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
              />
            </div>

            <label className="al-label" htmlFor="al-password">Password</label>
            <div className="al-input-wrap">
              <Lock size={16} className="al-icon" />
              <input
                id="al-password"
                type={showPwd ? 'text' : 'password'}
                className="al-input"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                style={{ paddingRight: 44 }}
              />
              <button
                type="button"
                className="al-pwd-toggle"
                onClick={() => setShowPwd((s) => !s)}
                aria-label={showPwd ? 'Hide password' : 'Show password'}
                tabIndex={-1}
              >
                {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

          {/*<div className="al-row">
              <label className="al-check">
                <input type="checkbox" /> Remember me
              </label>
              <a href="#" className="al-forgot" onClick={(e) => e.preventDefault()}>
                Forgot password?
              </a>
            </div>*/}

            <button type="submit" className="al-btn" disabled={loading}>
              {loading ? (
                <>
                  <span className="al-spinner" /> Logging in...
                </>
              ) : (
                <>
                  Sign In <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          <div className="al-foot">
            © {new Date().getFullYear()} YesBroker. All rights reserved.
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;