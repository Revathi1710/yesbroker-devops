import React, { useState, useEffect } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import axios from 'axios';

const NAV_LINKS = [
  { to: '/', label: 'Home' },
  { to: '/property/buy/all', label: 'Buy' },
  { to: '/property/rent/all', label: 'Rent' },
  { to: '/property/commercial/all', label: 'Commercial' },
  { to: '/property/pg/all', label: 'PG/Co-living' },
  { to: '/property/plots/all', label: 'Plots' },
];

const Header = () => {
  const [data, setData] = useState(null);
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  // Fetch broker profile
  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_API_URL}/brokerProfile`, { withCredentials: true })
      .then((res) => setData(res.data))
      .catch((err) => {
        console.error('API Error:', err.response?.data || err.message);
        setData(null);
      });
  }, []);

  // Sticky shadow on scroll
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close menu on route change
  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  return (
    <>
      <style>{`
        .yh-wrap {
          position: sticky; top: 0; z-index: 1000;
          background: #ffffff;
          border-bottom: 1px solid transparent;
          transition: box-shadow .2s ease, border-color .2s ease;
        }
        .yh-wrap.scrolled {
          box-shadow: 0 4px 16px rgba(15,23,42,0.06);
          border-bottom-color: #eef0f4;
        }
        .yh-inner {
          max-width: 1240px; margin: 0 auto;
          padding: 12px 20px;
          display: flex; align-items: center; gap: 16px;
        }
        .yh-brand {
          display: inline-flex; align-items: center;
          font-weight: 800; font-size: 22px; letter-spacing: .5px;
          text-decoration: none; line-height: 1;
        }
        .yh-brand .b1 { color: #e02020; }
        .yh-brand .b2 { color: #0F172A; }

        .yh-nav {
          display: flex; align-items: center; gap: 4px;
          margin: 0 auto;
        }
        .yh-link {
          position: relative;
          padding: 10px 14px;
          color: #475569; font-weight: 600; font-size: 14.5px;
          text-decoration: none; border-radius: 10px;
          transition: color .15s ease, background .15s ease;
        }
        .yh-link:hover { color: #0F172A; background: #f5f6fa; }
        .yh-link.active {
          color: #e02020;
          background: rgba(224,32,32,0.08);
        }
        .yh-link.active::after {
          content: ''; position: absolute; left: 14px; right: 14px; bottom: 4px;
          height: 2px; background: #e02020; border-radius: 2px;
        }

        .yh-actions { display: flex; align-items: center; gap: 10px; margin-left: auto; }

        .yh-btn-post {
          display: inline-flex; align-items: center; gap: 6px;
          background: linear-gradient(135deg, #e02020, #f43f5e);
          color: #fff; border: none; cursor: pointer;
          padding: 9px 16px; border-radius: 50px;
          font-weight: 700; font-size: 13.5px;
          box-shadow: 0 6px 14px rgba(224,32,32,0.28);
          transition: transform .15s ease, box-shadow .15s ease;
        }
        .yh-btn-post:hover { transform: translateY(-1px); box-shadow: 0 8px 18px rgba(224,32,32,0.36); }

        .yh-btn-login {
          background: #0F172A; color: #fff; border: none; cursor: pointer;
          padding: 9px 16px; border-radius: 50px;
          font-weight: 700; font-size: 13.5px;
          transition: background .15s ease;
        }
        .yh-btn-login:hover { background: #1E293B; }

        .yh-profile {
          display: flex; align-items: center; gap: 10px;
          padding: 5px 14px 5px 5px;
          background: #fff; border: 1px solid #e2e8f0;
          border-radius: 50px; text-decoration: none;
          transition: border-color .15s ease, box-shadow .15s ease;
        }
        .yh-profile:hover { border-color: #cbd5e1; box-shadow: 0 4px 10px rgba(15,23,42,0.05); }
        .yh-avatar {
          width: 30px; height: 30px; border-radius: 50%;
          background: #e02020; color: #fff;
          display: inline-flex; align-items: center; justify-content: center;
          font-weight: 700; font-size: 13px;
        }
        .yh-profile-name { font-weight: 600; color: #1e293b; font-size: 13.5px; }

        .yh-burger {
          display: none;
          width: 40px; height: 40px; border-radius: 10px;
          background: transparent; border: 1px solid #e5e7ef;
          align-items: center; justify-content: center; cursor: pointer;
          transition: background .15s ease;
        }
        .yh-burger:hover { background: #f5f6fa; }
        .yh-burger span {
          display: block; width: 18px; height: 2px;
          background: #0F172A; border-radius: 2px;
          position: relative;
          transition: transform .2s ease, opacity .2s ease;
        }
        .yh-burger span::before, .yh-burger span::after {
          content: ''; position: absolute; left: 0; width: 18px; height: 2px;
          background: #0F172A; border-radius: 2px;
          transition: transform .2s ease, top .2s ease;
        }
        .yh-burger span::before { top: -6px; }
        .yh-burger span::after  { top:  6px; }
        .yh-burger.open span { background: transparent; }
        .yh-burger.open span::before { top: 0; transform: rotate(45deg); }
        .yh-burger.open span::after  { top: 0; transform: rotate(-45deg); }

        .yh-overlay {
          position: fixed; inset: 0; background: rgba(15,23,42,0.45);
          opacity: 0; pointer-events: none;
          transition: opacity .2s ease; z-index: 998;
        }
        .yh-overlay.show { opacity: 1; pointer-events: auto; }

        .yh-drawer {
          position: fixed; top: 0; right: 0; bottom: 0;
          width: min(86vw, 340px); background: #fff;
          transform: translateX(100%);
          transition: transform .25s ease;
          z-index: 999; display: flex; flex-direction: column;
          box-shadow: -10px 0 30px rgba(0,0,0,0.08);
        }
        .yh-drawer.show { transform: translateX(0); }
        .yh-drawer-head {
          padding: 18px 20px; border-bottom: 1px solid #eef0f4;
          display: flex; align-items: center; justify-content: space-between;
        }
        .yh-drawer-body { padding: 14px; flex: 1; overflow-y: auto; }
        .yh-drawer-link {
          display: block; padding: 13px 14px;
          color: #1e293b; font-weight: 600; font-size: 15px;
          text-decoration: none; border-radius: 10px;
          margin-bottom: 4px;
          transition: background .15s ease, color .15s ease;
        }
        .yh-drawer-link:hover { background: #f5f6fa; }
        .yh-drawer-link.active {
          background: rgba(224,32,32,0.08); color: #e02020;
        }
        .yh-drawer-foot {
          padding: 16px 18px; border-top: 1px solid #eef0f4;
          display: flex; flex-direction: column; gap: 10px;
        }
        .yh-drawer-foot .yh-btn-post,
        .yh-drawer-foot .yh-btn-login { width: 100%; justify-content: center; }

        @media (max-width: 991px) {
          .yh-nav, .yh-desktop-only { display: none !important; }
          .yh-burger { display: inline-flex; }
          .yh-actions { margin-left: auto; }
        }
        @media (max-width: 480px) {
          .yh-inner { padding: 10px 14px; }
          .yh-brand { font-size: 19px; }
        }
      `}</style>

      <header className={`yh-wrap ${scrolled ? 'scrolled' : ''}`}>
        <div className="yh-inner">
          {/* Brand */}
          <Link to="/" className="yh-brand">
            <span className="b1">YES</span>
            <span className="b2">BROKER</span>
          </Link>

          {/* Desktop nav */}
          <nav className="yh-nav">
            {NAV_LINKS.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.to === '/'}
                className={({ isActive }) => `yh-link ${isActive ? 'active' : ''}`}
              >
                {l.label}
              </NavLink>
            ))}
          </nav>

          {/* Actions */}
          <div className="yh-actions">
            {data ? (
              <>
                <Link to='/add-property' className="yh-btn-post yh-desktop-only text-decoration-none">
                  <i className="bi bi-plus-lg"></i> Post Property
                </Link>
                <Link to="/broker-dashboard" className="yh-profile yh-desktop-only">
                  <div className="yh-avatar">{data.name?.charAt(0).toUpperCase()}</div>
                  <span className="yh-profile-name">Hi, {data.name}</span>
                </Link>
              </>
            ) : (
              <>
                <Link to='/login' className="yh-btn-post yh-desktop-only text-decoration-none">
                  <i className="bi bi-plus-lg"></i> Post Property
                </Link>
                <Link to="/register" className="yh-desktop-only" style={{ textDecoration: 'none' }}>
                  <button className="yh-btn-login">Broker Register</button>
                </Link>
              </>
            )}

            {/* Mobile burger button */}
            <button
              type="button"
              className={`yh-burger ${open ? 'open' : ''}`}
              aria-label="Toggle menu"
              onClick={() => setOpen((o) => !o)}
            >
              <span />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile overlay */}
      <div className={`yh-overlay ${open ? 'show' : ''}`} onClick={() => setOpen(false)} />

      {/* Mobile drawer */}
      <aside className={`yh-drawer ${open ? 'show' : ''}`} aria-hidden={!open}>
        <div className="yh-drawer-head">
          <Link to="/" className="yh-brand" onClick={() => setOpen(false)}>
            <span className="b1">YES</span>
            <span className="b2">BROKER</span>
          </Link>
          <button
            className="yh-burger open"
            onClick={() => setOpen(false)}
            style={{ display: 'inline-flex' }}
          >
            <span />
          </button>
        </div>

        <div className="yh-drawer-body">
          {data && (
            <Link
              to="/broker-dashboard"
              onClick={() => setOpen(false)}
              style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: 14, marginBottom: 12, borderRadius: 12,
                background: '#f8fafc', border: '1px solid #e2e8f0',
                textDecoration: 'none',
              }}
            >
              <div className="yh-avatar" style={{ width: 40, height: 40, fontSize: 15 }}>
                {data.name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <div style={{ fontWeight: 700, color: '#0F172A', fontSize: 14 }}>Hi, {data.name}</div>
                <div style={{ fontSize: 12, color: '#64748B' }}>Open dashboard</div>
              </div>
            </Link>
          )}

          {NAV_LINKS.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === '/'}
              onClick={() => setOpen(false)}
              className={({ isActive }) => `yh-drawer-link ${isActive ? 'active' : ''}`}
            >
              {l.label}
            </NavLink>
          ))}
        </div>

        <div className="yh-drawer-foot">
          <Link 
            to={data ? '/add-property' : '/login'} 
            className="yh-btn-post text-decoration-none" 
            onClick={() => setOpen(false)}
          >
            <i className="bi bi-plus-lg"></i> Post Property
          </Link>
          {!data && (
            <Link to="/register" style={{ textDecoration: 'none' }} onClick={() => setOpen(false)}>
              <button className="yh-btn-login" style={{ width: '100%' }}>Broker Register</button>
            </Link>
          )}
        </div>
      </aside>
    </>
  );
};

export default Header;