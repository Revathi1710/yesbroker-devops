import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const ZONE_KEYS_ORDER = [
  'South Chennai',
  'Central Chennai',
  'West Chennai',
  'North Chennai',
  'East Chennai / OMR / ECR',
];

/*
  Route map (from App.jsx + backend routes):
  /                          → Home
  /register                  → Register
  /login                     → Login
  /brokers/:slug             → BrokerView
  /property/:type/:locality  → PropertySearch  (type = buy|rent|commercial|pg|plots)
  /:typeproperty             → PropertyTypeSearch
  /:typeproperty/:locality   → PropertyTypeSearch
  /broker-dashboard          → Dashboard (protected)
  /add-property              → AddProperty (protected)
  /profile                   → ProfileDetails (protected)
  /properties                → Properties (protected)
  /success-stories           → YourSuccessStory (protected)

  Backend search: GET /search/:slug?type=Sell|Rent|PG|Commercial
*/

const Footer = () => {
  const [activeTab,    setActiveTab]    = useState('Rent');
  const [localities,   setLocalities]   = useState([]);
  const [loadingLocs,  setLoadingLocs]  = useState(true);
  const currentYear = new Date().getFullYear();

  /* ── Fetch localities ── */
  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_API_URL}/locality/all`, { withCredentials: true })
      .then(({ data }) => {
        const grouped = {};
        data.data
          .filter(item => item.active)
          .forEach(item => {
            const zone = item.zone?.trim();
            if (!zone) return;
            if (!grouped[zone]) grouped[zone] = [];
            if (typeof item.state === 'string') {
              item.state.split(',').map(s => s.trim()).filter(Boolean).forEach(loc => {
                if (!grouped[zone].includes(loc)) grouped[zone].push(loc);
              });
            }
          });

        const ordered = [
          ...ZONE_KEYS_ORDER.filter(k => grouped[k]),
          ...Object.keys(grouped).filter(k => !ZONE_KEYS_ORDER.includes(k)),
        ];
        const flat = [];
        ordered.forEach(z => grouped[z]?.forEach(l => { if (!flat.includes(l)) flat.push(l); }));
        setLocalities(flat);
      })
      .catch(err => console.error('Footer localities error:', err))
      .finally(() => setLoadingLocs(false));
  }, []);

  const pick = (start, count) => localities.slice(start, start + count);

  /*
    Each link has: { label, to }
    to = React Router path (uses <Link> for internal, <a> for external)
    
    URL patterns:
    • /property/buy/<locality>   → PropertySearch (full listing page with sidebar filter)
    • /property/rent/<locality>  → PropertySearch
    • /property/pg/<locality>    → PropertySearch
    • /property/plots/<locality> → PropertySearch
    • /property/commercial/<locality> → PropertySearch
    • /Apartment, /Villa etc    → PropertyTypeSearch (/:typeproperty)
    • /Villa/<locality>         → PropertyTypeSearch (/:typeproperty/:locality)
  */
  const buildBuyColumns = () => {
    const locs = pick(0, 16);
    return [
      {
        title: 'Popular Buy Searches',
        items: locs.slice(0, 4).map(loc => ({
          label: `Property for Sale in ${loc}`,
          to: `/property/buy/${encodeURIComponent(loc)}`,
        })),
      },
      {
        title: 'Villas for Sale',
        items: locs.slice(4, 8).map(loc => ({
          label: `Villa for Sale in ${loc}`,
          to: `/Villa/${encodeURIComponent(loc)}`,
        })),
      },
      {
        title: 'Plots for Sale',
        items: locs.slice(8, 12).map(loc => ({
          label: `Plot for Sale in ${loc}`,
          to: `/Plot/${encodeURIComponent(loc)}`,
        })),
      },
      {
        title: 'Commercial Spaces',
        items: locs.slice(12, 16).map(loc => ({
          label: `Commercial Space in ${loc}`,
          to: `/property/commercial/${encodeURIComponent(loc)}`,
        })),
      },
    ];
  };

  const buildRentColumns = () => {
    const locs = pick(0, 16);
    return [
      {
        title: 'Popular Rental Searches',
        items: locs.slice(0, 4).map(loc => ({
          label: `Property for Rent in ${loc}`,
          to: `/property/rent/${encodeURIComponent(loc)}`,
        })),
      },
      {
        title: 'Villas for Rent',
        items: locs.slice(4, 8).map(loc => ({
          label: `Villa for Rent in ${loc}`,
          to: `/property/rent/${encodeURIComponent(loc)}`,
        })),
      },
      {
        title: 'PG / Co-living',
        items: locs.slice(8, 12).map(loc => ({
          label: `PG / Hostel in ${loc}`,
          to: `/property/pg/${encodeURIComponent(loc)}`,
        })),
      },
      {
        title: 'Commercial Rent',
        items: locs.slice(12, 16).map(loc => ({
          label: `Office / Shop in ${loc}`,
          to: `/property/commercial/${encodeURIComponent(loc)}`,
        })),
      },
    ];
  };

  /* Fallback while loading */
  const fallbackBuy = [
    { title: 'Popular Buy Searches', items: [
      { label: 'All Properties for Sale',    to: '/property/buy/all'        },
      { label: 'Villas for Sale',            to: '/Villa'                   },
      { label: 'Plots for Sale',             to: '/Plot'                    },
      { label: 'Commercial Spaces',          to: '/property/commercial/all' },
    ]},
    { title: 'Villas for Sale', items: [
      { label: 'Luxury Villas',              to: '/Villa'         },
      { label: 'Independent Villas',         to: '/Villa'         },
      { label: 'Gated Community Villas',     to: '/Villa'         },
      { label: 'Premium Villas',             to: '/Villa'         },
    ]},
    { title: 'Plots for Sale', items: [
      { label: 'Residential Plots',          to: '/Plot'          },
      { label: 'Commercial Plots',           to: '/Plot'          },
      { label: 'DTCP Approved Plots',        to: '/Plot'          },
      { label: 'Corner Plots',               to: '/Plot'          },
    ]},
    { title: 'Commercial Spaces', items: [
      { label: 'Office Space in Chennai',    to: '/property/commercial/all' },
      { label: 'Retail Shops',               to: '/property/commercial/all' },
      { label: 'Showroom Space',             to: '/property/commercial/all' },
      { label: 'Warehouse / Godown',         to: '/property/commercial/all' },
    ]},
  ];

  const fallbackRent = [
    { title: 'Popular Rental Searches', items: [
      { label: 'All Rentals in Chennai',     to: '/property/rent/all'       },
      { label: 'Villas for Rent',            to: '/property/rent/all'       },
      { label: 'PG / Hostels',              to: '/property/pg/all'         },
      { label: 'Commercial for Rent',        to: '/property/commercial/all' },
    ]},
    { title: 'Villas for Rent', items: [
      { label: 'Luxury Villa for Rent',      to: '/property/rent/all' },
      { label: 'Independent House for Rent', to: '/property/rent/all' },
      { label: 'Bungalow for Rent',          to: '/property/rent/all' },
      { label: 'Gated Villas for Rent',      to: '/property/rent/all' },
    ]},
    { title: 'PG / Co-living', items: [
      { label: 'PG for Gents',              to: '/property/pg/all' },
      { label: 'PG for Ladies',             to: '/property/pg/all' },
      { label: 'Co-living Spaces',          to: '/property/pg/all' },
      { label: 'Hostels in Chennai',        to: '/property/pg/all' },
    ]},
    { title: 'Commercial Rent', items: [
      { label: 'Office Space for Rent',     to: '/property/commercial/all' },
      { label: 'Retail Shop for Rent',      to: '/property/commercial/all' },
      { label: 'Co-working Spaces',         to: '/property/commercial/all' },
      { label: 'Showroom for Rent',         to: '/property/commercial/all' },
    ]},
  ];

  const hasEnoughLocalities = !loadingLocs && localities.length >= 16;
  const columns = activeTab === 'Buy'
    ? (hasEnoughLocalities ? buildBuyColumns() : fallbackBuy)
    : (hasEnoughLocalities ? buildRentColumns() : fallbackRent);

  /* Quick Links with exact routes from App.jsx */
  const quickLinks = [
    { label: 'Home',               to: '/'                     },
    { label: 'All Brokers',        to: '/all-brokers'          },
    { label: 'Buy Property',       to: '/property/buy/all'     },
    { label: 'Rent Property',      to: '/property/rent/all'    },
    { label: 'PG / Co-living',     to: '/property/pg/all'      },
    { label: 'Plots',              to: '/property/plots/all'   },
    { label: 'Commercial',         to: '/property/commercial/all' },
  ];

  /* Property type links → /:typeproperty route */
  const propertyTypes = [
    { label: 'Apartments',          to: '/Apartment'    },
    { label: 'Villas',              to: '/Villa'        },
    { label: 'Plots',               to: '/Plot'         },
    { label: 'Commercial Spaces',   to: '/Commercial'   },
    { label: 'PG / Co-living',      to: '/property/pg/all' },
    { label: 'Independent Houses',  to: '/Independent House' },
  ];

  /* Broker / account links */
  const brokerLinks = [
    { label: 'Register as Broker',  to: '/register'          },
    { label: 'Broker Login',        to: '/login'             },
    { label: 'My Dashboard',        to: '/broker-dashboard'  },
    { label: 'Post Property',       to: '/add-property'      },
    { label: 'My Properties',       to: '/properties'        },
    { label: 'Success Stories',     to: '/success-stories'   },
  ];

  return (
    <footer style={{ background: '#f9fafb', color: '#333', paddingTop: 48, paddingBottom: 24, fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
        .ft-link { color: #666; text-decoration: none; font-size: 13px; line-height: 2; transition: color 0.15s; display: block; }
        .ft-link:hover { color: #e02020; padding-left: 2px; }
        .ft-tab { background: none; border: none; font-weight: 600; font-size: 14px; color: #888; padding: 0 0 10px; cursor: pointer; position: relative; transition: color 0.15s; }
        .ft-tab.active { color: #e02020; }
        .ft-tab.active::after { content:''; position:absolute; bottom:0; left:0; width:100%; height:3px; background:#e02020; border-radius:2px; }
        .ft-col-title { font-size: 12px; font-weight: 700; color: #1f2937; margin-bottom: 12px; letter-spacing: 0.5px; text-transform: uppercase; }
        .ft-divider { border: none; border-top: 1px solid #e5e7eb; margin: 32px 0; }
        .ft-brand-red { color: #e02020; }
        .ft-muted { color: #777; font-size: 13px; line-height: 1.7; margin: 0 0 8px; }
        .ft-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 28px; }
        .ft-bottom-grid { display: grid; grid-template-columns: 1.8fr 1fr 1fr 1fr 1.4fr; gap: 24px; }
        .ft-skeleton { height: 14px; background: linear-gradient(90deg,#f0f0f0 25%,#e8e8e8 50%,#f0f0f0 75%); background-size: 200% 100%; animation: shimmer 1.4s infinite; border-radius: 4px; margin-bottom: 8px; }
        @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
        @media(max-width: 1024px) {
          .ft-bottom-grid { grid-template-columns: repeat(3, 1fr); }
        }
        @media(max-width: 900px) {
          .ft-grid { grid-template-columns: repeat(2, 1fr); }
          .ft-bottom-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media(max-width: 540px) {
          .ft-grid { grid-template-columns: 1fr; }
          .ft-bottom-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px' }}>

        {/* ── Property options ── */}
        <section style={{ marginBottom: 40 }}>
          <p style={{ fontSize: 17, fontWeight: 700, color: '#1f2937', marginBottom: 20 }}>
            Property Options in Chennai
          </p>

          <div style={{ display: 'flex', gap: 28, borderBottom: '1px solid #e5e7eb', marginBottom: 28 }}>
            {['Buy', 'Rent'].map(tab => (
              <button key={tab} className={`ft-tab${activeTab === tab ? ' active' : ''}`} onClick={() => setActiveTab(tab)}>
                {tab}
              </button>
            ))}
          </div>

          <div className="ft-grid">
            {columns.map((col, idx) => (
              <div key={idx}>
                <p className="ft-col-title">{col.title}</p>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {loadingLocs
                    ? [70, 85, 65, 80].map((w, i) => (
                        <li key={i} className="ft-skeleton" style={{ width: `${w}%` }} />
                      ))
                    : col.items.map((item, i) => (
                        <li key={i}>
                          <Link to={item.to} className="ft-link">{item.label}</Link>
                        </li>
                      ))
                  }
                </ul>
              </div>
            ))}
          </div>
        </section>

        <hr className="ft-divider" />

        {/* ── Branding + link columns ── */}
        <div className="ft-bottom-grid" style={{ marginBottom: 32 }}>

          {/* Brand */}
          <div>
            <p style={{ fontWeight: 800, fontSize: 20, marginBottom: 10, margin: '0 0 10px' }}>
              <span className="ft-brand-red">YES</span>BROKER
            </p>
            <p className="ft-muted" style={{ marginBottom: 16 }}>
              Chennai's most trusted real estate network.<br />
              Connecting you with verified brokers across all zones.
            </p>
            {/* Social icons */}
            <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
              {[
                { icon: 'bi-facebook',  href: '#', color: '#1877f2' },
                { icon: 'bi-instagram', href: '#', color: '#e1306c' },
                { icon: 'bi-linkedin',  href: '#', color: '#0a66c2' },
                { icon: 'bi-whatsapp', href: 'https://wa.me/919884643772', color: '#25d366' },
              ].map(({ icon, href, color }) => (
                <a key={icon} href={href} target="_blank" rel="noreferrer"
                  style={{ width: 32, height: 32, borderRadius: 8, background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', color, fontSize: 16, textDecoration: 'none', transition: 'background 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#e5e7eb'}
                  onMouseLeave={e => e.currentTarget.style.background = '#f3f4f6'}
                >
                  <i className={`bi ${icon}`} />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <p className="ft-col-title">Quick Links</p>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {quickLinks.map(({ label, to }) => (
                <li key={label}>
                  <Link to={to} className="ft-link">{label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Property Types → /:typeproperty */}
          <div>
            <p className="ft-col-title">Property Types</p>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {propertyTypes.map(({ label, to }) => (
                <li key={label}>
                  <Link to={to} className="ft-link">{label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Broker Links */}
          <div>
            <p className="ft-col-title">For Brokers</p>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {brokerLinks.map(({ label, to }) => (
                <li key={label}>
                  <Link to={to} className="ft-link">{label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <p className="ft-col-title">Contact Us</p>
            <p className="ft-muted">
              <span style={{ color: '#e02020' }}>📍</span>{' '}
              2nd floor, No.9/25, Raghavendra colony,<br />
              Chinmayanagar, Virugambakkam,<br />
              Chennai – 600092
            </p>
            <p className="ft-muted">
              <a href="tel:+919884643772" style={{ color: '#777', textDecoration: 'none' }}>
                <span style={{ color: '#e02020' }}>📞</span> +91 98846 43772
              </a>
            </p>
            <p className="ft-muted">
              <a href="mailto:hello@yesbroker.in" style={{ color: '#777', textDecoration: 'none' }}>
                <span style={{ color: '#e02020' }}>✉️</span> hello@yesbroker.in
              </a>
            </p>
          </div>
        </div>

        {/* ── Bottom bar ── */}
        <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
          <p style={{ margin: 0, fontSize: 12, color: '#9ca3af' }}>
            © {currentYear} YesBroker. All rights reserved.
          </p>
          <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
            {[
               { label: 'About', to: '/about' },
              { label: 'Privacy Policy', to: '/privacy-policy' },
            
              { label: 'Terms & Conditions',        to: '/terms'        },
                { label: 'Help',        to: '/help'        },
            ].map(({ label, to }) => (
              <Link key={label} to={to} className="ft-link" style={{ fontSize: 12 }}>{label}</Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;