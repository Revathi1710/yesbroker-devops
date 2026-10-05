import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import Adminlogout from './Adminlogout';

const NAV_SECTIONS = [
  {
    label: 'Overview',
    items: [{ to: '/dashboard', icon: 'bi-grid-1x2-fill', label: 'Dashboard' }],
  },
  {
    label: 'Brokers',
    items: [
      { to: '/add-broker', icon: 'bi-person-plus-fill', label: 'Add Broker' },
      { to: '/all-broker', icon: 'bi-people-fill', label: 'All Brokers' },
    ],
  },
  {
    label: 'Properties',
    items: [
      { to: '/add-property', icon: 'bi-plus-square-fill', label: 'Add Property' },
      { to: '/all-property', icon: 'bi-buildings-fill', label: 'All Properties' },
    ],
  },
  {
    label: 'Locality',
    items: [
      { to: '/add-locality', icon: 'bi bi-geo', label: 'Add Locality' },
      { to: '/all-locality', icon: 'bi bi-geo-alt', label: 'All Locality' },
    ],
  },
  {
    label: 'Manage',
    items: [
      { to: '/subscription', icon: 'bi-gem', label: 'Subscription Plan' },
      { to: '/banner-setting', icon: 'bi-image-fill', label: 'Banner Setting' },
       { to: '/change-password', icon: 'bi-key-fill', label: 'Change Password' },
    ],
  },
];

const Sidebar = () => {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [query, setQuery] = useState('');
  const [adminName, setAdminName] = useState('Admin');

  const { logout, loading } = Adminlogout();

  useEffect(() => {
    const fetchAdmin = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/admin/check-auth`,
          { withCredentials: true }
        );
        if (res.data?.admin?.name) {
          setAdminName(res.data.admin.name);
        } else if (res.data?.admin?.username) {
          setAdminName(res.data.admin.username);
        } else if (res.data?.name) {
          setAdminName(res.data.name);
        }
      } catch (_) {
        // fallback to "Admin"
      }
    };
    fetchAdmin();
  }, []);

  const isActive = (path) => location.pathname === path;
  const width = collapsed ? '78px' : '264px';
  const avatarInitial = adminName.charAt(0).toUpperCase();

  const filteredSections = NAV_SECTIONS.map((s) => ({
    ...s,
    items: s.items.filter((it) =>
      it.label.toLowerCase().includes(query.trim().toLowerCase())
    ),
  })).filter((s) => s.items.length > 0);

  return (
    <>
      <style>{`
        .yb-sidebar {
          width: ${width};
          height: 100vh;
          background: #ffffff;
          border-right: 1px solid #eef0f4;
          transition: width .25s ease;
          position: fixed; top: 0; left: 0;
          z-index: 1030; overflow: hidden;
          font-family: 'Inter', 'DM Sans', system-ui, -apple-system, sans-serif;
          display: flex; flex-direction: column;
        }
        .yb-content {
          margin-left: ${width};
          transition: margin-left .25s ease;
          min-height: 100vh;
        }

        /* Brand */
        .yb-brand {
          display: flex; align-items: center; gap: 12px;
          padding: 18px 18px 14px;
          border-bottom: 1px solid #f1f4f9;
        }
        .yb-brand-mark {
          width: 38px; height: 38px;
          background: linear-gradient(135deg, #ef4444, #dc2626);
          color: #fff; font-weight: 800; font-size: .9rem;
          border-radius: 10px;
          display: inline-flex; align-items: center; justify-content: center;
          box-shadow: 0 6px 14px rgba(239,68,68,.30);
          letter-spacing: .5px; flex-shrink: 0;
        }
        .yb-brand-text { line-height: 1.15; }
        .yb-brand-name { font-weight: 700; color: #1a335d; font-size: 1rem; }
        .yb-brand-sub  { color: #8a91a3; font-size: .72rem; font-weight: 500; margin-top: 2px; }

        /* Search */
        .yb-search-wrap { padding: 14px 14px 6px; }
        .yb-search {
          position: relative;
          background: #f1f4f9;
          border: 1px solid transparent;
          border-radius: 8px;
          display: flex; align-items: center;
          padding: 0 10px;
          transition: all .2s ease-in-out;
        }
        .yb-search:focus-within {
          background: #fff; border-color: #1a335d;
          box-shadow: 0 0 0 3px rgba(26,51,93,.10);
        }
        .yb-search i { color: #8a91a3; font-size: .85rem; }
        .yb-search input {
          flex: 1; border: none; background: transparent; outline: none;
          padding: 9px 8px; font-size: .85rem; color: #1f2937;
        }
        .yb-search input::placeholder { color: #9aa1b1; }

        /* Section labels */
        .yb-section-label {
          font-size: .65rem; letter-spacing: 1.4px; color: #9aa1b1;
          font-weight: 700; text-transform: uppercase;
          padding: 0 18px; margin: 16px 0 6px;
        }

        /* Nav links */
        .yb-link {
          display: flex; align-items: center;
          padding: 10px 14px; margin: 2px 10px;
          border-radius: 8px;
          color: #4b5163; font-size: .9rem; font-weight: 500;
          text-decoration: none;
          transition: all 0.2s ease-in-out;
          position: relative;
        }
        .yb-link i {
          font-size: 1rem; width: 22px; text-align: center;
          margin-right: 12px; color: #6c757d;
          transition: color 0.2s ease-in-out;
        }
        .yb-link:hover {
          background-color: #f1f4f9;
          color: #1a335d !important;
          border-radius: 8px;
        }
        .yb-link:hover i { color: #1a335d; }
        .yb-link.active {
          background-color: #1a335d !important;
          color: #ffffff !important;
          border-radius: 8px !important;
          box-shadow: 0 4px 12px rgba(26,51,93,.22);
          font-weight: 600;
        }
        .yb-link.active i { color: #ffffff; }
        .yb-link.active::before {
          content: ''; position: absolute;
          left: -10px; top: 8px; bottom: 8px;
          width: 3px; border-radius: 0 4px 4px 0;
          background: #ef4444;
        }

        .yb-badge {
          margin-left: auto;
          background: #eef0f4; color: #1a335d;
          font-size: .68rem; font-weight: 700;
          padding: 2px 8px; border-radius: 999px;
        }
        .yb-link.active .yb-badge { background: rgba(255,255,255,.18); color: #fff; }

        /* Collapse button */
        .yb-collapse-btn {
          position: absolute; top: 24px; right: -12px;
          width: 24px; height: 24px; border-radius: 50%;
          background: #fff; border: 1px solid #e5e7ef; color: #6c757d;
          display: inline-flex; align-items: center; justify-content: center;
          box-shadow: 0 2px 6px rgba(0,0,0,.06);
          cursor: pointer; z-index: 5;
          transition: all 0.2s ease-in-out;
        }
        .yb-collapse-btn:hover {
          color: #fff; background: #1a335d; border-color: #1a335d; transform: scale(1.08);
        }

        /* Profile card */
        .yb-profile {
          margin: 12px; padding: 14px;
          border-radius: 12px;
          background: #f1f4f9;
          border: 1px solid #e8ecf3;
        }
        .yb-avatar {
          width: 40px; height: 40px; border-radius: 10px;
          background: linear-gradient(135deg, #1a335d, #2a4a7a);
          color: #fff; font-weight: 700; font-size: .95rem;
          display: inline-flex; align-items: center; justify-content: center;
          flex-shrink: 0; box-shadow: 0 4px 10px rgba(26,51,93,.22);
        }
        .yb-profile-text { overflow: hidden; flex: 1; }
        .yb-profile-name {
          font-weight: 700; color: #1a335d;
          font-size: .88rem; white-space: nowrap;
          overflow: hidden; text-overflow: ellipsis;
        }
        .yb-profile-meta {
          display: flex; align-items: center; gap: 6px; margin-top: 3px;
        }
        .yb-plan-badge {
          background: #ef4444; color: #fff;
          font-size: .58rem; font-weight: 700;
          padding: 2px 8px; border-radius: 999px; letter-spacing: .5px;
        }
        .yb-profile-role { color: #8a91a3; font-size: .7rem; }

        .yb-signout {
          width: 100%; border: none; background: transparent;
          color: #6c757d; font-size: .85rem; font-weight: 600;
          padding: 10px 12px; border-radius: 8px;
          display: flex; align-items: center;
          justify-content: ${collapsed ? 'center' : 'flex-start'};
          transition: all 0.2s ease-in-out;
          cursor: pointer; margin-top: 8px;
        }
        .yb-signout:hover { background: #fef2f2; color: #dc2626; }
        .yb-signout:disabled { opacity: 0.6; cursor: not-allowed; }

        /* Collapsed mode */
        .yb-collapsed .yb-link { justify-content: center; padding: 11px; margin: 2px 8px; }
        .yb-collapsed .yb-link i { margin-right: 0; }
        .yb-collapsed .yb-link span,
        .yb-collapsed .yb-badge,
        .yb-collapsed .yb-section-label,
        .yb-collapsed .yb-brand-text,
        .yb-collapsed .yb-profile-text,
        .yb-collapsed .yb-search-wrap { display: none !important; }
        .yb-collapsed .yb-brand { justify-content: center; padding: 18px 0 14px; }
        .yb-collapsed .yb-profile { padding: 10px; text-align: center; }
        .yb-collapsed .yb-link.active::before { display: none; }

        /* Scrollbar */
        .yb-nav-scroll::-webkit-scrollbar { width: 5px; }
        .yb-nav-scroll::-webkit-scrollbar-thumb { background: #e5e7ef; border-radius: 999px; }
        .yb-nav-scroll::-webkit-scrollbar-track { background: transparent; }

        /* Empty search state */
        .yb-no-result {
          text-align: center; padding: 24px 14px;
          color: #9aa1b1; font-size: .82rem;
        }
      `}</style>

      <aside className={`yb-sidebar ${collapsed ? 'yb-collapsed' : ''}`}>

        {/* Collapse Toggle */}
        <button
          className="yb-collapse-btn"
          onClick={() => setCollapsed((c) => !c)}
          aria-label="Toggle sidebar"
        >
          <i
            className={`bi ${collapsed ? 'bi-chevron-right' : 'bi-chevron-left'}`}
            style={{ fontSize: '.7rem' }}
          />
        </button>

        {/* Brand */}
        <div className="yb-brand">
          <div className="yb-brand-mark">YB</div>
          <div className="yb-brand-text">
            <div className="yb-brand-name">YesBroker</div>
            <div className="yb-brand-sub">Admin Console</div>
          </div>
        </div>

        {/* Search */}
        {!collapsed && (
          <div className="yb-search-wrap">
            <div className="yb-search">
              <i className="bi bi-search" />
              <input
                type="text"
                placeholder="Search menu…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
          </div>
        )}

        {/* Nav */}
        <nav
          className="yb-nav-scroll"
          style={{ flex: 1, overflowY: 'auto', paddingBottom: 8 }}
        >
          {filteredSections.length === 0 ? (
            <div className="yb-no-result">No menu items match "{query}"</div>
          ) : (
            filteredSections.map((section) => (
              <div key={section.label}>
                <div className="yb-section-label">{section.label}</div>
                {section.items.map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={`yb-link ${isActive(item.to) ? 'active' : ''}`}
                    title={collapsed ? item.label : undefined}
                  >
                    <i className={`bi ${item.icon}`} />
                    <span>{item.label}</span>
                    {item.badge && <span className="yb-badge">{item.badge}</span>}
                  </Link>
                ))}
              </div>
            ))
          )}
        </nav>

        {/* Profile */}
        <div className="yb-profile">
          <div className="d-flex align-items-center" style={{ gap: '12px' }}>
            <div className="yb-avatar">{avatarInitial}</div>
            <div className="yb-profile-text">
              <div className="yb-profile-name">{adminName}</div>
              <div className="yb-profile-meta">
                <span className="yb-plan-badge">BASIC</span>
                <span className="yb-profile-role">Admin</span>
              </div>
            </div>
          </div>

          <button
            className="yb-signout"
            onClick={logout}
            disabled={loading}
          >
            <i
              className="bi bi-box-arrow-right"
              style={{ marginRight: collapsed ? 0 : '8px' }}
            />
            {!collapsed && (
              <span>{loading ? 'Signing out…' : 'Sign Out'}</span>
            )}
          </button>
        </div>

      </aside>
    </>
  );
};

export default Sidebar;