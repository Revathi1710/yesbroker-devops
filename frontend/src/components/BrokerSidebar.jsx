import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  LayoutDashboard, UserCircle, Building2,
  Trophy, LogOut, Menu, PlusCircle, Globe, X
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import BrokerLogout from './BrokerLogout';

const styles = {
  sidebar: {
    width: '290px', height: '100vh', position: 'sticky', top: 0,
    background: '#ffffff', borderRight: '1px solid #f0f0f0',
    display: 'flex', flexDirection: 'column',
    fontFamily: "'DM Sans', sans-serif",
    boxShadow: '4px 0 24px rgba(0,0,0,0.04)', zIndex: 100,
  },
  profileSection: {
    padding: '20px 24px', borderBottom: '1px solid #f4f4f4',
    display: 'flex', alignItems: 'center', gap: '12px',
  },
  avatarWrap: { position: 'relative', flexShrink: 0 },
  avatar: {
    width: '46px', height: '46px', borderRadius: '14px',
    objectFit: 'cover', border: '2px solid #fff',
    boxShadow: '0 2px 12px rgba(0,0,0,0.12)',
  },
  onlineDot: {
    position: 'absolute', bottom: '-2px', right: '-2px',
    width: '12px', height: '12px', background: '#22c55e',
    borderRadius: '50%', border: '2px solid #fff',
  },
  profileInfo: { flex: 1, minWidth: 0 },
  profileName: {
    fontWeight: 700, fontSize: '14px', color: '#111',
    whiteSpace: 'nowrap', overflow: 'hidden',
    textOverflow: 'ellipsis', margin: 0,
  },
  badge: {
    display: 'inline-block', fontSize: '9px', fontWeight: 700,
    letterSpacing: '0.6px', color: '#E02424', background: '#fff1f1',
    border: '1px solid #fecaca', borderRadius: '4px',
    padding: '1px 6px', marginTop: '3px',
  },
  ctaWrap: { padding: '16px 20px' },
  ctaBtn: {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    gap: '8px', width: '100%', padding: '10px 0',
    background: 'linear-gradient(135deg, #E02424 0%, #b91c1c 100%)',
    color: '#fff', border: 'none', borderRadius: '12px',
    fontWeight: 700, fontSize: '14px', cursor: 'pointer',
    boxShadow: '0 4px 14px rgba(224,36,36,0.35)',
    textDecoration: 'none', transition: 'transform 0.15s, box-shadow 0.15s',
  },
  nav: {  padding: '8px 12px', overflowY: 'auto' },
  sectionLabel: {
    fontSize: '10px', fontWeight: 700, letterSpacing: '1px',
    color: '#aaa', textTransform: 'uppercase', padding: '8px 12px 4px',
  },
  navLink: (active) => ({
    display: 'flex', alignItems: 'center', gap: '12px',
    padding: '10px 12px', borderRadius: '10px', marginBottom: '2px',
    textDecoration: 'none', fontWeight: active ? 700 : 500,
    fontSize: '14px', color: active ? '#E02424' : '#555',
    background: active ? '#fff1f1' : 'transparent',
    transition: 'all 0.15s', position: 'relative',
  }),
  navIcon:          (active) => ({ color: active ? '#E02424' : '#888', flexShrink: 0 }),
  activeIndicator:  { position: 'absolute', right: '10px', width: '6px', height: '6px', borderRadius: '50%', background: '#E02424' },
  footer:           { padding: '12px 16px 20px', borderTop: '1px solid #f4f4f4' },
  logoutBtn: {
    display: 'flex', alignItems: 'center', gap: '10px', width: '100%',
    padding: '10px 12px', borderRadius: '10px', border: 'none',
    background: 'transparent', color: '#888', fontWeight: 600,
    fontSize: '14px', cursor: 'pointer', transition: 'background 0.15s, color 0.15s',
  },
  /* ── Mobile header ── */
  mobileHeader: {
    display: 'flex',                           /* ← KEY FIX */
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 16px',
    background: '#fff',
    borderBottom: '1px solid #f0f0f0',
    boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
    position: 'sticky', top: 60, zIndex: 200,
  },
  mobileLogo: {
    fontFamily: "'Syne', sans-serif", fontWeight: 800,
    fontSize: '18px', color: '#E02424', letterSpacing: '-0.4px',
  },
  menuBtn: {
    width: '38px', height: '38px', borderRadius: '10px',
    border: '1px solid #eee', background: '#fafafa',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer', color: '#333',
  },
  avatarCircle: {
    width: '36px', height: '36px', borderRadius: '50%',
    objectFit: 'cover', border: '2px solid #fff',
    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
  },
  overlay: (open) => ({
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)',
    zIndex: 299, opacity: open ? 1 : 0,
    pointerEvents: open ? 'auto' : 'none', transition: 'opacity 0.25s',
  }),
  drawer: (open) => ({
    position: 'fixed', top: 0, left: 0, height: '100vh',
    width: '280px', background: '#fff', zIndex: 300,
    display: 'flex', flexDirection: 'column',
    boxShadow: '8px 0 32px rgba(0,0,0,0.15)',
    transform: open ? 'translateX(0)' : 'translateX(-100%)',
    transition: 'transform 0.28s cubic-bezier(0.4,0,0.2,1)',
  }),
  drawerHeader: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '16px 20px', borderBottom: '1px solid #f4f4f4',
  },
  closeBtn: {
    width: '32px', height: '32px', borderRadius: '8px',
    border: '1px solid #eee', background: '#fafafa',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer', color: '#555',
  },
};

if (typeof document !== 'undefined' && !document.getElementById('broker-sidebar-fonts')) {
  const link = document.createElement('link');
  link.id   = 'broker-sidebar-fonts';
  link.rel  = 'stylesheet';
  link.href = 'https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Syne:wght@700;800&display=swap';
  document.head.appendChild(link);
}

const NavItem = ({ to, icon, label, active, onClick }) => (
  <Link to={to} onClick={onClick} style={styles.navLink(active)}
    onMouseEnter={(e) => { if (!active) { e.currentTarget.style.background = '#fafafa'; e.currentTarget.style.color = '#333'; } }}
    onMouseLeave={(e) => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#555'; } }}>
    <span style={styles.navIcon(active)}>{icon}</span>
    <span style={{ flex: 1 }}>{label}</span>
    {active && <span style={styles.activeIndicator} />}
  </Link>
);

const SidebarContent = ({ data, logout, loading, location, onNavClick }) => {
  const isActive = (path) => location.pathname === path;
  const avatarSrc = data?.profileImage
    || `https://ui-avatars.com/api/?name=${encodeURIComponent(data?.name || 'Agent')}&background=E02424&color=fff`;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', fontFamily: "'DM Sans', sans-serif" }}>
      <div style={styles.profileSection}>
        <div style={styles.avatarWrap}>
          <img src={avatarSrc} alt="Profile" style={styles.avatar} />
          <span style={styles.onlineDot} />
        </div>
        <div style={styles.profileInfo}>
          <p style={styles.profileName}>{data?.name || 'Seller Name'}</p>
          <span style={styles.badge}>✦ CERTIFIED AGENT</span>
        </div>
      </div>

      <div style={styles.ctaWrap}>
        <Link to="/add-property" style={styles.ctaBtn} onClick={onNavClick}
          onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(224,36,36,0.45)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(224,36,36,0.35)'; }}>
          <PlusCircle size={16} />
          Post Property
        </Link>
      </div>

      <nav style={styles.nav}>
        <p style={styles.sectionLabel}>Main Menu</p>
        <NavItem to="/broker-dashboard" icon={<LayoutDashboard size={17} />} label="Dashboard"       active={isActive('/broker-dashboard')} onClick={onNavClick} />
        <NavItem to="/properties"       icon={<Building2 size={17} />}       label="My Properties"   active={isActive('/properties')}       onClick={onNavClick} />
        <NavItem to="/profile"          icon={<UserCircle size={17} />}      label="Company Profile" active={isActive('/profile')}          onClick={onNavClick} />
        <p style={{ ...styles.sectionLabel, marginTop: '12px' }}>Growth</p>
        <NavItem to="/success-stories"                          icon={<Trophy size={17} />} label="Success Stories" active={isActive('/success-stories')}  onClick={onNavClick} />
        <NavItem to={`/brokers/${data?.slug || 'seller-name'}`} icon={<Globe size={17} />}  label="My Website"      active={isActive('/website')}           onClick={onNavClick} />
      </nav>

      <div style={styles.footer}>
        <button onClick={logout} disabled={loading} style={styles.logoutBtn}
          onMouseEnter={(e) => { e.currentTarget.style.background = '#fff1f1'; e.currentTarget.style.color = '#E02424'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#888'; }}>
          <LogOut size={17} />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
};

const BrokerSidebar = () => {
  const [data, setData]             = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isMobile, setIsMobile]     = useState(window.innerWidth < 992);
  const location                    = useLocation();
  const { logout, loading }         = BrokerLogout();

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 992);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    axios.get(`${import.meta.env.VITE_API_URL}/brokerProfile`, { withCredentials: true })
      .then((res) => setData(res.data))
      .catch((err) => console.error('Sidebar API Error:', err.response?.data || err.message));
  }, []);

  useEffect(() => setDrawerOpen(false), [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = drawerOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [drawerOpen]);

  const avatarSrc = data?.profileImage
    || `https://ui-avatars.com/api/?name=${encodeURIComponent(data?.name || 'Agent')}&background=E02424&color=fff`;

  if (!isMobile) {
    return (
      <aside style={styles.sidebar}>
        <SidebarContent data={data} logout={logout} loading={loading} location={location} />
      </aside>
    );
  }

  return (
    <>
      {/* Mobile sticky top bar */}
      <div style={styles.mobileHeader}>
        <button style={styles.menuBtn} onClick={() => setDrawerOpen(true)} aria-label="Open menu">
          <Menu size={20} />
        </button>
       {/* <span style={styles.mobileLogo}>
          YES<span style={{ color: '#111' }}>BROKER</span>
        </span>*/}
        <img src={avatarSrc} alt="avatar" style={styles.avatarCircle} />
      </div>

      {/* Backdrop */}
      <div style={styles.overlay(drawerOpen)} onClick={() => setDrawerOpen(false)} />

      {/* Drawer */}
      <div style={styles.drawer(drawerOpen)} aria-hidden={!drawerOpen}>
        <div style={styles.drawerHeader}>
          <span style={styles.mobileLogo}>
            YES<span style={{ color: '#111' }}>BROKER</span>
          </span>
          <button style={styles.closeBtn} onClick={() => setDrawerOpen(false)} aria-label="Close menu">
            <X size={16} />
          </button>
        </div>
        <div style={{ flex: 1, overflowY: 'auto' }}>
          <SidebarContent data={data} logout={logout} loading={loading} location={location} onNavClick={() => setDrawerOpen(false)} />
        </div>
      </div>
    </>
  );
};

export default BrokerSidebar;