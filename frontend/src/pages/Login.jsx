import React, { useState, useRef, useEffect } from 'react';
import Header from '../components/Header';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

import { useBroker } from '../context/BrokerContext';

/* ─────────────────────────────────────────────
   Inline styles & keyframes injected once
───────────────────────────────────────────── */
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

  :root {
    --primary: #e8341c;
    --primary-soft: #fff1ee;
    --primary-border: #fbd0c9;
    --dark: #1a1a2e;
    --mid: #4a4a6a;
    --light: #f7f8fc;
    --card-shadow: 0 24px 64px rgba(0,0,0,0.08), 0 4px 16px rgba(0,0,0,0.04);
  }

  .login-page * { font-family: 'Sora', sans-serif; box-sizing: border-box; }

  .login-page {
    min-height: 100vh;
    background: linear-gradient(145deg, #fdf6f4 0%, #f0f4ff 50%, #faf5ff 100%);
    padding: 80px 0 60px;
    position: relative;
    overflow: hidden;
  }

  .login-page::before {
    content: '';
    position: absolute;
    width: 600px; height: 600px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(232,52,28,0.06) 0%, transparent 70%);
    top: -200px; right: -200px;
    pointer-events: none;
  }

  .login-page::after {
    content: '';
    position: absolute;
    width: 400px; height: 400px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(99,102,241,0.06) 0%, transparent 70%);
    bottom: -100px; left: -100px;
    pointer-events: none;
  }

  /* ── Card ── */
  .auth-card {
    background: #fff;
    border-radius: 24px;
    padding: 48px 40px;
    box-shadow: var(--card-shadow);
    border: 1px solid rgba(0,0,0,0.04);
    position: relative;
    overflow: hidden;
  }

  .auth-card::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 4px;
    background: linear-gradient(90deg, var(--primary), #ff7043, #ffd740);
    border-radius: 24px 24px 0 0;
  }

  /* ── Inputs ── */
  .auth-input {
    height: 52px;
    border-radius: 12px;
    border: 1.5px solid #e2e8f0;
    padding: 0 16px;
    font-size: 0.95rem;
    font-family: 'DM Sans', sans-serif;
    width: 100%;
    transition: all 0.2s ease;
    background: #fafafa;
    outline: none;
    color: var(--dark);
  }
  .auth-input:focus {
    border-color: var(--primary);
    background: #fff;
    box-shadow: 0 0 0 3px rgba(232,52,28,0.1);
  }
  .auth-input.success {
    border-color: #22c55e;
    background: #f0fdf4;
  }

  /* ── OTP boxes ── */
  .otp-grid {
    display: flex;
    gap: 10px;
    justify-content: center;
    margin: 20px 0;
  }
  .otp-box {
    width: 52px; height: 60px;
    border-radius: 12px;
    border: 1.5px solid #e2e8f0;
    text-align: center;
    font-size: 1.5rem;
    font-weight: 700;
    font-family: 'Sora', sans-serif;
    color: var(--dark);
    transition: all 0.2s ease;
    background: #fafafa;
    outline: none;
  }
  .otp-box:focus {
    border-color: var(--primary);
    background: #fff;
    box-shadow: 0 0 0 3px rgba(232,52,28,0.12);
    transform: scale(1.05);
  }
  .otp-box.filled {
    border-color: var(--primary);
    background: var(--primary-soft);
    color: var(--primary);
  }
  .otp-box.error {
    border-color: #ef4444;
    background: #fef2f2;
    animation: shake 0.4s ease;
  }

  @media (max-width: 400px) {
    .otp-box { width: 42px; height: 52px; font-size: 1.2rem; }
    .otp-grid { gap: 7px; }
  }

  /* ── Buttons ── */
  .btn-primary-auth {
    height: 54px;
    width: 100%;
    background: var(--primary);
    color: #fff;
    border: none;
    border-radius: 14px;
    font-size: 1rem;
    font-weight: 700;
    font-family: 'Sora', sans-serif;
    cursor: pointer;
    transition: all 0.25s ease;
    position: relative;
    overflow: hidden;
    letter-spacing: 0.3px;
  }
  .btn-primary-auth:hover:not(:disabled) {
    background: #c42d18;
    transform: translateY(-1px);
    box-shadow: 0 8px 24px rgba(232,52,28,0.3);
  }
  .btn-primary-auth:active:not(:disabled) { transform: translateY(0); }
  .btn-primary-auth:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }

  .btn-ghost {
    background: none; border: none; cursor: pointer;
    color: var(--primary); font-weight: 600;
    font-family: 'Sora', sans-serif;
    font-size: 0.9rem; padding: 0;
    text-decoration: underline;
    transition: opacity 0.2s;
  }
  .btn-ghost:hover { opacity: 0.7; }
  .btn-ghost:disabled { opacity: 0.4; cursor: not-allowed; }

  /* ── Step indicator ── */
  .step-dots {
    display: flex; gap: 8px; justify-content: center; margin-bottom: 28px;
  }
  .step-dot {
    width: 8px; height: 8px; border-radius: 50%;
    background: #e2e8f0; transition: all 0.3s ease;
  }
  .step-dot.active { background: var(--primary); width: 24px; border-radius: 4px; }
  .step-dot.done { background: #22c55e; }

  /* ── Badge ── */
  .partner-badge {
    display: inline-block;
    background: var(--primary);
    color: #fff;
    padding: 5px 14px;
    border-radius: 20px;
    font-size: 0.72rem;
    font-weight: 700;
    letter-spacing: 1.5px;
    margin-bottom: 16px;
  }

  /* ── Timer ── */
  .timer-chip {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: var(--primary-soft);
    border: 1px solid var(--primary-border);
    border-radius: 20px;
    padding: 4px 12px;
    font-size: 0.82rem;
    font-weight: 600;
    color: var(--primary);
  }

  /* ── Slide transitions ── */
  .slide-in {
    animation: slideIn 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
  }
  @keyframes slideIn {
    from { opacity: 0; transform: translateX(30px) scale(0.97); }
    to   { opacity: 1; transform: translateX(0) scale(1); }
  }
  @keyframes shake {
    0%,100% { transform: translateX(0); }
    20%,60% { transform: translateX(-5px); }
    40%,80% { transform: translateX(5px); }
  }
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  .spin { animation: spin 0.8s linear infinite; display: inline-block; }

  /* ── Feature list ── */
  .feature-item { display: flex; align-items: flex-start; gap: 14px; margin-bottom: 22px; }
  .feature-icon {
    width: 40px; height: 40px; border-radius: 12px;
    background: var(--primary-soft);
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
  }

  /* ── Responsive ── */
  @media (max-width: 768px) {
    .login-page { padding: 70px 0 40px; }
    .auth-card { padding: 32px 24px; border-radius: 20px; }
    .left-col { display: none !important; }
    .right-col { padding: 0 8px !important; }
  }
`;

/* ─────────────────────────────────────────────
   Timer hook
───────────────────────────────────────────── */
const useCountdown = (seconds) => {
  const [timeLeft, setTimeLeft] = useState(0);
  const timerRef = useRef(null);

  const start = () => {
    setTimeLeft(seconds);
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { clearInterval(timerRef.current); return 0; }
        return t - 1;
      });
    }, 1000);
  };

  useEffect(() => () => clearInterval(timerRef.current), []);
  return { timeLeft, start };
};

/* ─────────────────────────────────────────────
   Main Component
───────────────────────────────────────────── */
const Login = () => {
  const navigate = useNavigate();
   const { refreshBrokerData } = useBroker();
  const [step, setStep] = useState(1); // 1 = email, 2 = otp
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [otpError, setOtpError] = useState(false);
  const [stepKey, setStepKey] = useState(0);
  const otpRefs = useRef([]);
  const { timeLeft, start: startTimer } = useCountdown(120);

  /* ── Send OTP ── */
  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!email.trim()) return toast.error('Please enter your email address');
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return toast.error('Please enter a valid email');

    setLoading(true);
    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/broker/send-otp`,
        { email: email.trim().toLowerCase() },
        { withCredentials: true }
      );
      toast.success('OTP sent to your email!');
      startTimer();
      setStep(2);
      setStepKey(k => k + 1);
      setTimeout(() => otpRefs.current[0]?.focus(), 400);
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to send OTP. Try again.');
    } finally {
      setLoading(false);
    }
  };

  /* ── OTP input handling ── */
  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    setOtpError(false);
    const updated = [...otp];
    updated[index] = value.slice(-1);
    setOtp(updated);
    if (value && index < 5) otpRefs.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
    if (e.key === 'ArrowLeft' && index > 0) otpRefs.current[index - 1]?.focus();
    if (e.key === 'ArrowRight' && index < 5) otpRefs.current[index + 1]?.focus();
  };

  const handleOtpPaste = (e) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) {
      setOtp(pasted.split(''));
      setOtpError(false);
      otpRefs.current[5]?.focus();
    }
    e.preventDefault();
  };

  /* ── Verify OTP ── */
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    const otpCode = otp.join('');
    if (otpCode.length !== 6) {
      setOtpError(true);
      return toast.error('Please enter the 6-digit OTP');
    }

    setLoading(true);
    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/broker/verify-otp`,
        { email: email.trim().toLowerCase(), otp: otpCode },
        { withCredentials: true }
      );
      toast.success('Login successful! Welcome back 🎉');
      
      await refreshBrokerData(); // ← fetch broker data FIRST, then navigate
      navigate('/broker-dashboard');
      
    } catch (error) {
      setOtpError(true);
      setOtp(['', '', '', '', '', '']);
      otpRefs.current[0]?.focus();
      toast.error(error?.response?.data?.message || 'Invalid OTP. Try again.');
    } finally {
      setLoading(false);
    }
  };

  /* ── Resend ── */
  const handleResend = async () => {
    if (timeLeft > 0) return;
    setLoading(true);
    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/broker/send-otp`,
        { email: email.trim().toLowerCase() },
        { withCredentials: true }
      );
      toast.success('New OTP sent!');
      setOtp(['', '', '', '', '', '']);
      setOtpError(false);
      startTimer();
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to resend OTP');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  return (
    <>
      <style>{STYLES}</style>
      <Header />
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />

      <section className="login-page">
        <div className="container">
          <div className="row justify-content-between align-items-center">

            {/* ── Left Column ── */}
            <div className="col-lg-6 mb-5 mb-lg-0 left-col">
              <span className="partner-badge">PARTNER WITH US</span>
              <h1 style={{ fontWeight: 800, color: '#1a1a2e', lineHeight: 1.15, fontSize: 'clamp(2rem, 4vw, 3rem)' }}>
                Grow your{' '}
                <span style={{ color: 'var(--primary)' }}>Real Estate</span>{' '}
                network today.
              </h1>
              <p style={{ color: '#64748b', lineHeight: 1.8, marginTop: 20, marginBottom: 40, fontSize: '1.05rem' }}>
                Join our exclusive network of professional brokers. Access verified leads, advanced marketing tools, and a dedicated support team.
              </p>

              {[
                {
                  icon: '🔐',
                  title: 'Secure OTP Login',
                  desc: 'No passwords needed. We verify your identity via email every time.'
                },
                {
                  icon: '✅',
                  title: 'Verified Identity',
                  desc: 'Build trust with a verified professional profile.'
                },
                {
                  icon: '📊',
                  title: 'Smart Analytics',
                  desc: 'Track your property listings and lead conversions.'
                }
              ].map((f, i) => (
                <div className="feature-item" key={i}>
                  <div className="feature-icon">
                    <span style={{ fontSize: '1.2rem' }}>{f.icon}</span>
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, color: '#1a1a2e', marginBottom: 2 }}>{f.title}</div>
                    <div style={{ color: '#64748b', fontSize: '0.9rem' }}>{f.desc}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* ── Right Column ── */}
            <div className="col-lg-5 col-12 right-col" style={{ padding: '0 12px' }}>
              <div className="auth-card">

                {/* Step dots */}
                <div className="step-dots">
                  <div className={`step-dot ${step === 1 ? 'active' : 'done'}`} />
                  <div className={`step-dot ${step === 2 ? 'active' : step > 2 ? 'done' : ''}`} />
                </div>

                {/* ── STEP 1: Email ── */}
                {step === 1 && (
                  <div className="slide-in" key="step1">
                    <div style={{ textAlign: 'center', marginBottom: 28 }}>
                      <div style={{ fontSize: '2.2rem', marginBottom: 10 }}>👋</div>
                      <h3 style={{ fontWeight: 800, color: '#1a1a2e', marginBottom: 6 }}>Welcome back</h3>
                      <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Enter your registered email to receive an OTP</p>
                    </div>

                    <form onSubmit={handleSendOtp} noValidate>
                      <div style={{ marginBottom: 20 }}>
                        <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', color: '#374151', marginBottom: 8 }}>
                          Email Address
                        </label>
                        <input
                          type="email"
                          className={`auth-input ${email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? 'success' : ''}`}
                          placeholder="yourname@agency.com"
                          value={email}
                          onChange={e => setEmail(e.target.value)}
                          required
                          autoComplete="email"
                        />
                      </div>

                      <button type="submit" className="btn-primary-auth" disabled={loading}>
                        {loading ? (
                          <span><span className="spin">⟳</span> Sending OTP...</span>
                        ) : (
                          'Send OTP →'
                        )}
                      </button>
                    </form>

                    <p style={{ textAlign: 'center', marginTop: 20, color: '#64748b', fontSize: '0.85rem' }}>
                      Don't have an account?{' '}
                      <Link to="/register" style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>
                        Register here
                      </Link>
                    </p>
                  </div>
                )}

                {/* ── STEP 2: OTP ── */}
                {step === 2 && (
                  <div className="slide-in" key={`step2-${stepKey}`}>
                    <div style={{ textAlign: 'center', marginBottom: 8 }}>
                      <div style={{ fontSize: '2.2rem', marginBottom: 10 }}>📧</div>
                      <h3 style={{ fontWeight: 800, color: '#1a1a2e', marginBottom: 6 }}>Check your email</h3>
                      <p style={{ color: '#64748b', fontSize: '0.88rem', lineHeight: 1.6 }}>
                        We sent a 6-digit code to<br />
                        <strong style={{ color: '#1a1a2e' }}>{email}</strong>
                      </p>
                    </div>

                    {/* Timer */}
                    <div style={{ textAlign: 'center', margin: '14px 0' }}>
                      {timeLeft > 0 ? (
                        <span className="timer-chip">
                          <span>⏱</span>
                          Expires in {formatTime(timeLeft)}
                        </span>
                      ) : (
                        <span style={{ color: '#ef4444', fontSize: '0.85rem', fontWeight: 600 }}>
                          OTP expired
                        </span>
                      )}
                    </div>

                    <form onSubmit={handleVerifyOtp} noValidate>
                      {/* OTP boxes */}
                      <div className="otp-grid" onPaste={handleOtpPaste}>
                        {otp.map((digit, i) => (
                          <input
                            key={i}
                            ref={el => otpRefs.current[i] = el}
                            type="text"
                            inputMode="numeric"
                            maxLength={1}
                            className={`otp-box ${digit ? 'filled' : ''} ${otpError ? 'error' : ''}`}
                            value={digit}
                            onChange={e => handleOtpChange(i, e.target.value)}
                            onKeyDown={e => handleOtpKeyDown(i, e)}
                            autoComplete="one-time-code"
                          />
                        ))}
                      </div>

                      {otpError && (
                        <p style={{ textAlign: 'center', color: '#ef4444', fontSize: '0.83rem', marginTop: -8, marginBottom: 12 }}>
                          ✗ Incorrect OTP. Please try again.
                        </p>
                      )}

                      <button type="submit" className="btn-primary-auth" disabled={loading || otp.join('').length < 6}>
                        {loading ? (
                          <span><span className="spin">⟳</span> Verifying...</span>
                        ) : (
                          'Verify & Login'
                        )}
                      </button>
                    </form>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 20 }}>
                      <button
                        className="btn-ghost"
                        onClick={() => { setStep(1); setOtp(['','','','','','']); setOtpError(false); }}
                        style={{ fontSize: '0.82rem', color: '#64748b', textDecoration: 'none' }}
                      >
                        ← Change email
                      </button>
                      <button
                        className="btn-ghost"
                        onClick={handleResend}
                        disabled={timeLeft > 0 || loading}
                        style={{ fontSize: '0.82rem' }}
                      >
                        {timeLeft > 0 ? `Resend in ${formatTime(timeLeft)}` : 'Resend OTP'}
                      </button>
                    </div>
                  </div>
                )}

              </div>

              {/* Footer note */}
              <p style={{ textAlign: 'center', color: '#94a3b8', fontSize: '0.78rem', marginTop: 16 }}>
                🔒 Secured with end-to-end encrypted OTP authentication
              </p>
            </div>

          </div>
        </div>
      </section>
    </>
  );
};

export default Login;