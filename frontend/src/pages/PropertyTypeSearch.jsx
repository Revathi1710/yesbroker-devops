import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import Header from '../components/Header';

const RECENT_KEY = 'yesbroker_recent_searches';
const MAX_RECENT = 5;

const fmt = (n) => {
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(2)} Cr`;
  if (n >= 100000)   return `₹${(n / 100000).toFixed(1)} L`;
  return `₹${n.toLocaleString('en-IN')}`;
};

// ── Status config ─────────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  Active:  { bg: '#dcfce7', color: '#16a34a', dot: '#22c55e', label: 'Active'  },
  Sold:    { bg: '#fee2e2', color: '#dc2626', dot: '#ef4444', label: 'Sold'    },
  Rented:  { bg: '#fef9c3', color: '#ca8a04', dot: '#eab308', label: 'Rented'  },
};

// ── Type mappings ─────────────────────────────────────────────────────────────
const LISTING_TYPE_MAP = {
  buy:        { field: 'listingType', value: 'Sell'       },
  rent:       { field: 'listingType', value: 'Rent'       },
  pg:         { field: 'listingType', value: 'PG'         },
  commercial: { field: 'listingType', value: 'Commercial' },
  plots:      { field: 'listingType', value: 'Plot'       },
};

const PROPERTY_TYPE_MAP = {
  apartment:           { field: 'propertyType', value: 'Apartment'         },
  villa:               { field: 'propertyType', value: 'Villa'             },
  house:               { field: 'propertyType', value: 'Independent House' },
  'independent-house': { field: 'propertyType', value: 'Independent House' },
  plot:                { field: 'propertyType', value: 'Plot'              },
};

const getTypeConfig = (typeproperty) => {
  const key = typeproperty?.toLowerCase();
  return LISTING_TYPE_MAP[key] || PROPERTY_TYPE_MAP[key] || { field: 'listingType', value: 'Sell' };
};

const isPropertyTypeRoute = (typeproperty) =>
  !!PROPERTY_TYPE_MAP[typeproperty?.toLowerCase()];

// ── Image Slider ──────────────────────────────────────────────────────────────
const ImageSlider = ({ photos, listingType, status }) => {
  const [current, setCurrent] = useState(0);
  const total = photos?.length || 0;
  const go = (idx) => setCurrent((idx + total) % total);

  const listingBadge = listingType === 'Sell' ? 'For Sale'
    : listingType === 'Rent' ? 'For Rent'
    : listingType === 'PG' ? 'PG'
    : listingType || 'Property';

  const statusCfg = STATUS_CONFIG[status] || STATUS_CONFIG.Active;
  const isSold = status === 'Sold' || status === 'Rented';

  return (
    <div style={{ position: 'relative', height: 210, overflow: 'hidden', background: '#f1f5f9' }}>
      {total > 0 ? (
        <>
          <div style={{
            display: 'flex', height: '100%',
            transform: `translateX(-${current * 100}%)`,
            transition: 'transform 0.4s ease',
            filter: isSold ? 'brightness(0.75) grayscale(0.3)' : 'none',
          }}>
            {photos.map((url, i) => (
              <img key={i} src={url} alt={`property-${i}`}
                style={{ flexShrink: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                loading="lazy" />
            ))}
          </div>

          {isSold && (
            <div style={{
              position: 'absolute', inset: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              pointerEvents: 'none',
            }}>
              <div style={{
                background: status === 'Sold' ? 'rgba(220,38,38,0.88)' : 'rgba(202,138,4,0.88)',
                color: '#fff', fontWeight: 800, fontSize: 22, letterSpacing: 3,
                padding: '8px 28px', borderRadius: 6,
                transform: 'rotate(-12deg)',
                boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
                textTransform: 'uppercase',
              }}>
                {status}
              </div>
            </div>
          )}

          {total > 1 && !isSold && (
            <>
              <button onClick={() => go(current - 1)} style={sliderBtnStyle('left')}>&#8249;</button>
              <button onClick={() => go(current + 1)} style={sliderBtnStyle('right')}>&#8250;</button>
              <div style={{ position: 'absolute', bottom: 8, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 5 }}>
                {photos.map((_, i) => (
                  <div key={i} onClick={() => go(i)} style={{
                    width: 6, height: 6, borderRadius: '50%', cursor: 'pointer',
                    background: i === current ? '#fff' : 'rgba(255,255,255,0.45)',
                  }} />
                ))}
              </div>
              <span style={{
                position: 'absolute', bottom: 10, right: 10,
                background: 'rgba(0,0,0,0.5)', color: '#fff',
                fontSize: 11, padding: '3px 8px', borderRadius: 12,
              }}>{current + 1}/{total}</span>
            </>
          )}
        </>
      ) : (
        <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', flexDirection: 'column', gap: 6 }}>
          <span style={{ fontSize: 28 }}>🏠</span>
          <span style={{ fontSize: 12 }}>No photos available</span>
        </div>
      )}

      <span style={{
        position: 'absolute', top: 10, left: 10,
        background: listingType === 'Sell' ? '#1d4ed8' : listingType === 'Rent' ? '#059669' : '#7c3aed',
        color: '#fff', fontSize: 10, fontWeight: 700,
        padding: '3px 10px', borderRadius: 20, letterSpacing: '0.5px',
        textTransform: 'uppercase',
      }}>{listingBadge}</span>

      <span style={{
        position: 'absolute', top: 10, right: 10,
        background: statusCfg.bg, color: statusCfg.color,
        fontSize: 10, fontWeight: 700,
        padding: '3px 10px', borderRadius: 20, letterSpacing: '0.5px',
        display: 'flex', alignItems: 'center', gap: 4,
        textTransform: 'uppercase',
      }}>
        <span style={{ width: 5, height: 5, borderRadius: '50%', background: statusCfg.dot, display: 'inline-block' }} />
        {statusCfg.label}
      </span>
    </div>
  );
};

const sliderBtnStyle = (side) => ({
  position: 'absolute', top: '50%', transform: 'translateY(-50%)',
  [side === 'left' ? 'left' : 'right']: 8,
  background: 'rgba(0,0,0,0.45)', color: '#fff', border: 'none',
  width: 30, height: 30, borderRadius: '50%', cursor: 'pointer',
  fontSize: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2,
});

// ── Filter Chips ──────────────────────────────────────────────────────────────
const ChipGroup = ({ options, value, onChange }) => (
  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
    {options.map((opt) => (
      <button key={opt.val} onClick={() => onChange(opt.val)} style={{
        padding: '5px 12px', borderRadius: 20, fontSize: 12, cursor: 'pointer',
        border: value === opt.val ? '1.5px solid #e02020' : '1px solid #e2e8f0',
        background: value === opt.val ? '#e02020' : '#fff',
        color: value === opt.val ? '#fff' : '#64748b',
        fontWeight: value === opt.val ? 600 : 400,
        transition: 'all 0.15s',
      }}>{opt.label}</button>
    ))}
  </div>
);

// ── Filter Sidebar ────────────────────────────────────────────────────────────
const FilterSidebar = ({
  filters, onChange, onApply, maxPrice, onMaxPriceChange,
  onReset, onPropTypeNavigate, currentTypeproperty,
}) => {
  const propTypeOptions = [
    { val: 'all',               label: 'All',       slug: null          },
    { val: 'Apartment',         label: 'Apartment', slug: 'apartment'   },
    { val: 'Independent House', label: 'House',     slug: 'house'       },
    { val: 'Villa',             label: 'Villa',     slug: 'villa'       },
    { val: 'Plot',              label: 'Plot',      slug: 'plot'        },
    { val: 'Commercial',        label: 'Commercial',slug: 'commercial'  },
  ];

  const currentPropValue = isPropertyTypeRoute(currentTypeproperty)
    ? getTypeConfig(currentTypeproperty).value
    : null;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, paddingBottom: 12, borderBottom: '1px solid #f1f5f9' }}>
        <span style={{ fontSize: 15, fontWeight: 700, color: '#1e293b' }}>Filters</span>
        <button onClick={onReset} style={{ background: 'none', border: 'none', color: '#e02020', fontSize: 12, fontWeight: 600, cursor: 'pointer', padding: 0 }}>Reset all</button>
      </div>

      {/* ✅ Property type — navigates URL on property-type routes, filters in-place on listing routes */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 8 }}>Property type</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {propTypeOptions.map((opt) => {
            const isActive = isPropertyTypeRoute(currentTypeproperty)
              ? (opt.val === 'all' ? false : opt.val === currentPropValue)
              : (filters.prop === opt.val);

            return (
              <button
                key={opt.val}
                onClick={() => {
                  if (isPropertyTypeRoute(currentTypeproperty)) {
                    // On /apartment, /house etc. → navigate to new URL
                    if (opt.slug) onPropTypeNavigate(opt.slug);
                  } else {
                    // On /buy, /rent etc. → client-side filter
                    onChange('prop', opt.val);
                  }
                }}
                style={{
                  padding: '5px 12px', borderRadius: 20, fontSize: 12, cursor: 'pointer',
                  border: isActive ? '1.5px solid #e02020' : '1px solid #e2e8f0',
                  background: isActive ? '#e02020' : '#fff',
                  color: isActive ? '#fff' : '#64748b',
                  fontWeight: isActive ? 600 : 400,
                  transition: 'all 0.15s',
                }}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Status filter */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 8 }}>Status</div>
        <ChipGroup
          options={[
            { val: 'all', label: 'All' }, { val: 'Active', label: 'Active' },
            { val: 'Sold', label: 'Sold' }, { val: 'Rented', label: 'Rented' },
          ]}
          value={filters.status}
          onChange={(val) => onChange('status', val)}
        />
      </div>

      {/* Budget */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 8 }}>Budget (max)</div>
        <input type="range" min={0} max={10000000} step={100000} value={maxPrice}
          onChange={(e) => onMaxPriceChange(+e.target.value)}
          style={{ width: '100%', accentColor: '#e02020' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#94a3b8', marginTop: 5 }}>
          <span>₹0</span>
          <span style={{ fontWeight: 600, color: '#e02020' }}>{maxPrice >= 10000000 ? 'Any budget' : fmt(maxPrice)}</span>
        </div>
      </div>

      <button onClick={onApply} style={{
        width: '100%', padding: '11px', background: 'linear-gradient(135deg,#e02020,#c01010)',
        color: '#fff', border: 'none', borderRadius: 10, fontSize: 14,
        fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 12px rgba(224,32,32,0.3)',
      }}>
        Apply Filters
      </button>
    </div>
  );
};

// ── Property Card ─────────────────────────────────────────────────────────────
const PropertyCard = ({ property, navigate }) => {
  const isSold    = property.status === 'Sold';
  const isRented  = property.status === 'Rented';
  const isDimmed  = isSold || isRented;
  const statusCfg = STATUS_CONFIG[property.status] || STATUS_CONFIG.Active;

  return (
    <div style={{
      background: '#fff', borderRadius: 14, overflow: 'hidden',
      border: `1px solid ${isDimmed ? '#fecaca' : '#f1f5f9'}`,
      boxShadow: isDimmed ? '0 1px 4px rgba(220,38,38,0.08)' : '0 1px 4px rgba(0,0,0,0.06)',
      transition: 'transform 0.15s, box-shadow 0.15s',
      opacity: isDimmed ? 0.9 : 1,
    }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = isDimmed ? '0 6px 18px rgba(220,38,38,0.12)' : '0 6px 18px rgba(0,0,0,0.1)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = isDimmed ? '0 1px 4px rgba(220,38,38,0.08)' : '0 1px 4px rgba(0,0,0,0.06)';
      }}
    >
      <ImageSlider photos={property.photos} listingType={property.listingType} status={property.status} />

      <div style={{ padding: '14px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
          <div style={{ fontSize: 20, fontWeight: 800, color: isDimmed ? '#9ca3af' : '#1e293b', textDecoration: isDimmed ? 'line-through' : 'none' }}>
            {fmt(property.price)}
          </div>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 4,
            background: statusCfg.bg, color: statusCfg.color,
            fontSize: 10, fontWeight: 700, padding: '3px 9px',
            borderRadius: 20, letterSpacing: '0.4px', textTransform: 'uppercase',
          }}>
            <span style={{ width: 5, height: 5, borderRadius: '50%', background: statusCfg.dot, display: 'inline-block' }} />
            {statusCfg.label}
          </span>
        </div>

        {isDimmed && (
          <div style={{
            background: isSold ? '#fef2f2' : '#fefce8',
            border: `1px solid ${isSold ? '#fecaca' : '#fef08a'}`,
            borderRadius: 8, padding: '6px 10px', marginBottom: 10,
            display: 'flex', alignItems: 'center', gap: 6,
          }}>
            <span style={{ fontSize: 14 }}>{isSold ? '🔴' : '🟡'}</span>
            <span style={{ fontSize: 12, fontWeight: 600, color: isSold ? '#dc2626' : '#ca8a04' }}>
              {isSold ? 'This property has been sold' : 'This property is already rented'}
            </span>
          </div>
        )}

        <div style={{ fontSize: 13, color: '#64748b', marginBottom: 10 }}>
          {property.propertyType} · {property.localities?.[0]}
        </div>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 10 }}>
          {[
            { icon: '📐', text: `${property.size} sq.ft` },
            { icon: '🏷️', text: property.propertyType },
          ].map(({ icon, text }) => (
            <span key={text} style={{
              display: 'inline-flex', alignItems: 'center', gap: 4,
              background: '#f8fafc', border: '1px solid #e2e8f0',
              borderRadius: 20, padding: '3px 10px', fontSize: 11, color: '#64748b', fontWeight: 500,
            }}>{icon} {text}</span>
          ))}
        </div>

        <p style={{ fontSize: 12, color: '#94a3b8', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', margin: '0 0 12px' }}>
          {property.description || 'No description provided.'}
        </p>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 12, borderTop: '1px solid #f1f5f9' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 30, height: 30, borderRadius: '50%', background: '#fde8e8',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 13, fontWeight: 700, color: '#e02020', flexShrink: 0,
            }}>
              {property.broker?.name?.charAt(0)?.toUpperCase() || 'Y'}
            </div>
            <div>
              <div style={{ fontSize: 11, color: '#94a3b8', lineHeight: 1 }}>Listed by</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b' }}>{property.broker?.name || 'Independent'}</div>
            </div>
          </div>

          <button
            onClick={() => navigate(`/brokers/${property.broker?.slug}`)}
            disabled={isDimmed}
            style={{
              padding: '7px 16px',
              border: isDimmed ? '1.5px solid #e2e8f0' : '1.5px solid #e02020',
              color: isDimmed ? '#94a3b8' : '#e02020',
              borderRadius: 20, background: 'none', cursor: isDimmed ? 'not-allowed' : 'pointer',
              fontSize: 12, fontWeight: 600, transition: 'all 0.15s',
            }}
            onMouseEnter={e => { if (!isDimmed) { e.currentTarget.style.background = '#e02020'; e.currentTarget.style.color = '#fff'; }}}
            onMouseLeave={e => { if (!isDimmed) { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = '#e02020'; }}}
          >
            {isDimmed ? 'Unavailable' : 'View Details'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Top Search Bar ────────────────────────────────────────────────────────────
const TopSearchBar = ({ currentLocalities, currentType, allLocalities, onSearch }) => {
  const [query,          setQuery]          = useState('');
  const [selected,       setSelected]       = useState(currentLocalities.map(n => ({ name: n, zone: 'Chennai' })));
  const [activeTab,      setActiveTab]      = useState(currentType);
  const [suggestions,    setSuggestions]    = useState([]);
  const [showDrop,       setShowDrop]       = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  const [cursor,         setCursor]         = useState(-1);
  const wrapRef  = useRef(null);
  const inputRef = useRef(null);
  const tabs     = ['buy', 'rent', 'commercial', 'pg', 'plots'];

  useEffect(() => {
    setSelected(currentLocalities.map(n => ({ name: n, zone: 'Chennai' })));
    setActiveTab(currentType);
  }, [currentLocalities, currentType]);

  useEffect(() => {
    try {
      const stored  = JSON.parse(localStorage.getItem(RECENT_KEY) || '[]');
      const cleaned = stored.filter(e => Array.isArray(e.locations) && e.locations.length > 0 && e.locations.every(l => l.name?.trim().length > 1 && l.name.toLowerCase() !== 'all'));
      localStorage.setItem(RECENT_KEY, JSON.stringify(cleaned));
      setRecentSearches(cleaned);
    } catch { setRecentSearches([]); }
  }, []);

  useEffect(() => {
    const h = (e) => { if (wrapRef.current && !wrapRef.current.contains(e.target)) setShowDrop(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const handleInputChange = (e) => {
    const val = e.target.value;
    setQuery(val); setCursor(-1);
    setSuggestions(val.trim()
      ? allLocalities.filter(l => l.name.toLowerCase().includes(val.toLowerCase()) && !selected.find(s => s.name.toLowerCase() === l.name.toLowerCase())).slice(0, 10)
      : []);
    setShowDrop(true);
  };

  const addLoc = (loc) => {
    if (!selected.find(s => s.name.toLowerCase() === loc.name.toLowerCase()))
      setSelected(p => [...p, loc]);
    setQuery(''); setSuggestions([]); setShowDrop(false); setCursor(-1);
    inputRef.current?.focus();
  };

  const removeLoc = (name) => setSelected(p => p.filter(l => l.name !== name));

  const saveRecent = (locs, tab) => {
    const valid = locs.filter(l => l.name?.trim().length > 1 && l.name.toLowerCase() !== 'all');
    if (!valid.length) return;
    try {
      const existing = JSON.parse(localStorage.getItem(RECENT_KEY) || '[]');
      const deduped  = existing.filter(r => !(r.tab === tab && JSON.stringify(r.locations.map(l => l.name).sort()) === JSON.stringify(valid.map(l => l.name).sort())));
      localStorage.setItem(RECENT_KEY, JSON.stringify([{ locations: valid, tab, timestamp: Date.now() }, ...deduped].slice(0, MAX_RECENT)));
      setRecentSearches(JSON.parse(localStorage.getItem(RECENT_KEY)));
    } catch {}
  };

  const doSearch = (locs = selected, tab = activeTab) => {
    if (locs.length === 0 && query.trim()) locs = [{ name: query.trim(), zone: 'Chennai' }];
    if (!locs.length) return;
    saveRecent(locs, tab);
    onSearch(locs.map(l => l.name), tab);
    setShowDrop(false);
  };

  const applyRecent = (entry) => { setSelected(entry.locations); setActiveTab(entry.tab); onSearch(entry.locations.map(l => l.name), entry.tab); setShowDrop(false); };
  const showRecent  = showDrop && !query.trim() && recentSearches.length > 0;
  const showSugg    = showDrop && query.trim() && suggestions.length > 0;

  return (
    <div style={{ background: '#fff', borderBottom: '1px solid #f1f5f9', padding: '10px 16px', position: 'sticky', top: 0, zIndex: 100, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
      <style>{`
        .ts-tag{display:inline-flex;align-items:center;gap:4px;background:#fff0f0;border:1px solid #fca5a5;color:#e02020;border-radius:20px;padding:2px 8px;font-size:12px;font-weight:600;white-space:nowrap;}
        .ts-remove{background:none;border:none;cursor:pointer;color:#e02020;font-size:14px;line-height:1;padding:0;}
        .ts-sug:hover,.ts-sug-active{background:#fff5f5;}
        .ts-recent:hover{background:#f8fafc;}
        .ts-tab{padding:5px 11px;font-size:11px;font-weight:700;border-radius:20px;cursor:pointer;border:1.5px solid #e2e8f0;background:#f8fafc;color:#64748b;text-transform:uppercase;letter-spacing:0.4px;transition:all 0.15s;}
        .ts-tab:hover{border-color:#e02020;color:#e02020;}
        .ts-tab.active{background:#e02020;color:#fff;border-color:#e02020;}
        @media(max-width:640px){.ts-tabs{overflow-x:auto;scrollbar-width:none;flex-wrap:nowrap!important;}.ts-tabs::-webkit-scrollbar{display:none;}}
      `}</style>

      <div style={{ maxWidth: 960, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div className="ts-tabs" style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
          {tabs.map(tab => (
            <button key={tab} className={`ts-tab${activeTab === tab ? ' active' : ''}`}
              onClick={() => { setActiveTab(tab); doSearch(selected, tab); }}>
              {tab === 'pg' ? 'PG' : tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <div style={{ flex: 1, position: 'relative' }} ref={wrapRef}>
            <div
              style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 5, border: '1.5px solid #e2e8f0', borderRadius: 10, padding: '5px 10px 5px 36px', minHeight: 42, cursor: 'text', position: 'relative', background: '#fff' }}
              onClick={() => inputRef.current?.focus()}
            >
              <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: 15 }}>🔍</span>
              {selected.map(loc => (
                <span key={loc.name} className="ts-tag">
                  {loc.name}
                  <button className="ts-remove" onClick={e => { e.stopPropagation(); removeLoc(loc.name); }}>×</button>
                </span>
              ))}
              <input
                ref={inputRef} type="text" value={query}
                onChange={handleInputChange} onFocus={() => setShowDrop(true)}
                onKeyDown={e => {
                  if (e.key === 'ArrowDown') setCursor(p => Math.min(p + 1, suggestions.length - 1));
                  else if (e.key === 'ArrowUp') setCursor(p => Math.max(p - 1, 0));
                  else if (e.key === 'Enter') { if (cursor >= 0 && suggestions[cursor]) addLoc(suggestions[cursor]); else doSearch(); }
                  else if (e.key === 'Backspace' && query === '' && selected.length > 0) removeLoc(selected[selected.length - 1].name);
                }}
                placeholder={selected.length === 0 ? 'Search locality, area...' : 'Add more localities...'}
                style={{ border: 'none', outline: 'none', fontSize: 13, fontWeight: 500, color: '#1e293b', minWidth: 120, flex: 1, background: 'transparent' }}
              />
            </div>

            {(showSugg || showRecent) && (
              <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, boxShadow: '0 8px 24px rgba(0,0,0,0.12)', zIndex: 999, maxHeight: 300, overflowY: 'auto', marginTop: 4 }}>
                {showRecent && (
                  <>
                    <div style={{ padding: '6px 14px 4px', fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1, background: '#f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>Recent searches</span>
                      <button onClick={() => { localStorage.removeItem(RECENT_KEY); setRecentSearches([]); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#e02020', fontSize: 11, fontWeight: 600, padding: 0 }}>Clear</button>
                    </div>
                    {recentSearches.map((entry, i) => (
                      <div key={i} className="ts-recent" style={{ display: 'flex', alignItems: 'center', padding: '10px 14px', cursor: 'pointer', borderBottom: '1px solid #f8f9fa', gap: 10 }} onClick={() => applyRecent(entry)}>
                        <span style={{ color: '#94a3b8' }}>🕐</span>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 600, fontSize: 13 }}>{entry.locations.map(l => l.name).join(', ')}</div>
                          <div style={{ fontSize: 11, color: '#94a3b8', textTransform: 'capitalize' }}>{entry.tab}</div>
                        </div>
                        <span style={{ fontSize: 10, background: '#f1f5f9', color: '#64748b', padding: '2px 8px', borderRadius: 10, textTransform: 'uppercase', fontWeight: 600 }}>{entry.tab}</span>
                      </div>
                    ))}
                  </>
                )}
                {showSugg && (
                  <>
                    <div style={{ padding: '6px 14px 4px', fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1, background: '#f8fafc' }}>Localities</div>
                    {suggestions.map((loc, i) => (
                      <div key={i} className={`ts-sug${cursor === i ? ' ts-sug-active' : ''}`}
                        style={{ display: 'flex', alignItems: 'center', padding: '10px 14px', cursor: 'pointer', borderBottom: '1px solid #f8f9fa', gap: 10 }}
                        onClick={() => addLoc(loc)}>
                        <span style={{ color: '#e02020' }}>📍</span>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 600, fontSize: 13 }}>{loc.name}</div>
                          <div style={{ fontSize: 11, color: '#94a3b8' }}>{loc.zone}</div>
                        </div>
                        <span style={{ color: '#cbd5e1', fontSize: 18 }}>+</span>
                      </div>
                    ))}
                  </>
                )}
              </div>
            )}
          </div>

          <button onClick={() => doSearch()} style={{
            padding: '9px 22px', background: 'linear-gradient(135deg,#e02020,#c01010)',
            color: '#fff', border: 'none', borderRadius: 10, fontWeight: 700,
            fontSize: 13, cursor: 'pointer', whiteSpace: 'nowrap',
            boxShadow: '0 4px 12px rgba(224,32,32,0.3)', flexShrink: 0,
          }}>Search</button>
        </div>
      </div>
    </div>
  );
};

// ── Main Component ────────────────────────────────────────────────────────────
const PropertyTypeSearch = () => {
  const { typeproperty, locality } = useParams();
  const navigate = useNavigate();

  const localityList = locality
    ? locality.split(',').map(l => decodeURIComponent(l.trim())).filter(Boolean)
    : [];

  const [properties,    setProperties]    = useState([]);
  const [filtered,      setFiltered]      = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [sortBy,        setSortBy]        = useState('newest');
  const [maxPrice,      setMaxPrice]      = useState(10000000);
  const [mobileOpen,    setMobileOpen]    = useState(false);
  const [filters,       setFilters]       = useState({ prop: 'all', status: 'all' });
  const [allLocalities, setAllLocalities] = useState([]);

  useEffect(() => {
    axios.get(`${import.meta.env.VITE_API_URL}/locality/all`, { withCredentials: true })
      .then(({ data }) => {
        const list = data.data
          .filter(item => item.active)
          .flatMap(item => {
            const s = typeof item.state === 'string' ? item.state : '';
            const z = item.zone || 'Chennai';
            return s.split(',').map(loc => ({ name: loc.trim(), zone: z }));
          })
          .filter(loc => loc.name !== '');
        setAllLocalities(list.filter((v, i, a) => a.findIndex(t => t.name.toLowerCase() === v.name.toLowerCase()) === i));
      })
      .catch(() => {});
  }, []);

  // ✅ Fetch on every route param change, reset filters
  useEffect(() => {
    if (!typeproperty) return;
    setLoading(true);
    setFilters({ prop: 'all', status: 'all' });
    setMaxPrice(10000000);

    const typeConfig = getTypeConfig(typeproperty);

    const buildUrl = (loc) => {
      const encodedLoc = encodeURIComponent(loc);
      return typeConfig.field === 'propertyType'
        ? `${import.meta.env.VITE_API_URL}/searchtype/${encodedLoc}?propertyType=${encodeURIComponent(typeConfig.value)}`
        : `${import.meta.env.VITE_API_URL}/searchtype/${encodedLoc}?type=${encodeURIComponent(typeConfig.value)}`;
    };

    const fetches = localityList.length > 0
      ? localityList.map(loc => axios.get(buildUrl(loc)).then(r => r.data.data || []).catch(() => []))
      : [axios.get(buildUrl('all')).then(r => r.data.data || []).catch(() => [])];

    Promise.all(fetches).then(results => {
      const unique = results.flat().filter((v, i, a) => a.findIndex(p => p._id === v._id) === i);
      setProperties(unique);
      setFiltered(unique);
      setLoading(false);
    });
  }, [typeproperty, locality]);

  // ✅ Apply filters — prop filter only on listing-type routes
  const applyFilters = useCallback(() => {
    let result = [...properties];
    if (!isPropertyTypeRoute(typeproperty) && filters.prop !== 'all') {
      result = result.filter(p => p.propertyType === filters.prop);
    }
    if (filters.status !== 'all') result = result.filter(p => p.status === filters.status);
    if (maxPrice < 10000000)       result = result.filter(p => p.price <= maxPrice);
    setFiltered(result);
    setMobileOpen(false);
  }, [filters, maxPrice, properties, typeproperty]);

  const resetFilters = () => {
    setFilters({ prop: 'all', status: 'all' });
    setMaxPrice(10000000);
    setFiltered(properties);
    setMobileOpen(false);
  };

  // ✅ Property type chip click → change URL slug, keep locality
  const handlePropTypeNavigate = (slug) => {
    if (localityList.length > 0) {
      navigate(`/${slug}/${localityList.map(l => encodeURIComponent(l)).join(',')}`);
    } else {
      navigate(`/${slug}`);
    }
  };

  const sorted = [...filtered].sort((a, b) => {
    const aW = a.status === 'Active' ? 0 : 1;
    const bW = b.status === 'Active' ? 0 : 1;
    if (aW !== bW) return aW - bW;
    if (sortBy === 'price_asc')  return a.price - b.price;
    if (sortBy === 'price_desc') return b.price - a.price;
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  const handleTopSearch = (locs, tab) => {
    navigate(locs.length > 0
      ? `/property/${tab.toLowerCase()}/${locs.map(l => encodeURIComponent(l)).join(',')}`
      : `/property/${tab.toLowerCase()}`
    );
  };

  const pageTitle = (() => {
    const cfg = getTypeConfig(typeproperty);
    if (cfg.field === 'propertyType') return cfg.value;
    const m = { Sell: 'Buy', Rent: 'Rent', PG: 'PG', Commercial: 'Commercial', Plot: 'Plots' };
    return m[cfg.value] || typeproperty;
  })();

  const activeCount  = properties.filter(p => p.status === 'Active').length;
  const soldCount    = properties.filter(p => p.status === 'Sold').length;
  const rentedCount  = properties.filter(p => p.status === 'Rented').length;

  const sidebarContent = (
    <FilterSidebar
      filters={filters}
      onChange={(key, val) => setFilters(f => ({ ...f, [key]: val }))}
      onApply={applyFilters}
      maxPrice={maxPrice}
      onMaxPriceChange={setMaxPrice}
      onReset={resetFilters}
      onPropTypeNavigate={handlePropTypeNavigate}
      currentTypeproperty={typeproperty}
    />
  );

  const topSearchBar = (
    <TopSearchBar
      currentLocalities={localityList}
      currentType={typeproperty || 'buy'}
      allLocalities={allLocalities}
      onSearch={handleTopSearch}
    />
  );

  if (loading) return (
    <>
      <Header />
      {topSearchBar}
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400, flexDirection: 'column', gap: 12 }}>
        <div style={{ width: 40, height: 40, border: '3px solid #fecaca', borderTop: '3px solid #e02020', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin{to{transform:rotate(360deg);}}`}</style>
        <span style={{ color: '#94a3b8', fontSize: 13 }}>Finding properties...</span>
      </div>
    </>
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
        *{box-sizing:border-box;}body{font-family:'DM Sans',sans-serif;}
        .ps-overlay{position:fixed;inset:0;background:rgba(0,0,0,0.45);z-index:299;opacity:0;pointer-events:none;transition:opacity 0.25s;}
        .ps-overlay.open{opacity:1;pointer-events:auto;}
        .ps-drawer{position:fixed;top:0;right:0;bottom:0;width:min(85vw,300px);background:#fff;z-index:300;padding:20px;transform:translateX(100%);transition:transform 0.28s cubic-bezier(0.4,0,0.2,1);overflow-y:auto;}
        .ps-drawer.open{transform:translateX(0);}
        @media(max-width:767px){.ps-desktop-sidebar{display:none!important;}.ps-results-grid{grid-template-columns:1fr!important;}}
        @media(min-width:768px){.ps-mobile-filter-btn{display:none!important;}}
        @media(min-width:540px) and (max-width:767px){.ps-results-grid{grid-template-columns:repeat(2,1fr)!important;}}
      `}</style>

      <Header />
      {topSearchBar}

      <div style={{ display: 'flex', minHeight: '100vh', background: '#f8fafc' }}>
        <aside className="ps-desktop-sidebar" style={{ width: 270, flexShrink: 0, background: '#fff', borderRight: '1px solid #f1f5f9', padding: '20px 18px', position: 'sticky', top: 0, height: '100vh', overflowY: 'auto' }}>
          {sidebarContent}
        </aside>

        <div className={`ps-overlay${mobileOpen ? ' open' : ''}`} onClick={() => setMobileOpen(false)} />
        <div className={`ps-drawer${mobileOpen ? ' open' : ''}`}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <span style={{ fontWeight: 700, fontSize: 15, color: '#1e293b' }}>Filters</span>
            <button onClick={() => setMobileOpen(false)} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#64748b' }}>✕</button>
          </div>
          {sidebarContent}
        </div>

        <main style={{ flex: 1, padding: '20px', minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
            <div>
              <button className="ps-mobile-filter-btn" onClick={() => setMobileOpen(true)} style={{
                display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 14px',
                border: '1.5px solid #e2e8f0', borderRadius: 8, background: '#fff',
                fontSize: 13, fontWeight: 600, cursor: 'pointer', marginBottom: 10, color: '#475569',
              }}>⚙️ Filters</button>

              <h2 style={{ fontSize: 18, fontWeight: 700, color: '#1e293b', margin: '0 0 4px' }}>
                {sorted.length} {pageTitle} results
                {localityList.length > 0 && (
                  <span> in{' '}
                    {localityList.map((loc, i) => (
                      <span key={loc}>
                        <span style={{ color: '#e02020' }}>{loc}</span>
                        {i < localityList.length - 1 && <span style={{ color: '#94a3b8' }}>, </span>}
                      </span>
                    ))}
                  </span>
                )}
              </h2>
              <p style={{ fontSize: 12, color: '#94a3b8', margin: 0 }}>Verified by YesBroker</p>

              <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
                {[
                  { label: `${activeCount} Active`, bg: '#dcfce7', color: '#16a34a', dot: '#22c55e' },
                  { label: `${soldCount} Sold`,     bg: '#fee2e2', color: '#dc2626', dot: '#ef4444' },
                  { label: `${rentedCount} Rented`, bg: '#fef9c3', color: '#ca8a04', dot: '#eab308' },
                ].filter(s => parseInt(s.label) > 0).map(s => (
                  <span key={s.label} style={{
                    display: 'inline-flex', alignItems: 'center', gap: 5,
                    background: s.bg, color: s.color, fontSize: 11, fontWeight: 700,
                    padding: '3px 10px', borderRadius: 20,
                  }}>
                    <span style={{ width: 5, height: 5, borderRadius: '50%', background: s.dot }} />
                    {s.label}
                  </span>
                ))}
              </div>
            </div>

            <select value={sortBy} onChange={e => setSortBy(e.target.value)} style={{
              padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: 8,
              fontSize: 13, background: '#fff', cursor: 'pointer',
              fontFamily: "'DM Sans',sans-serif", fontWeight: 500, color: '#475569', flexShrink: 0,
            }}>
              <option value="newest">Newest first</option>
              <option value="price_asc">Price: low → high</option>
              <option value="price_desc">Price: high → low</option>
            </select>
          </div>

          {sorted.length > 0 ? (
            <div className="ps-results-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
              {sorted.map(p => <PropertyCard key={p._id} property={p} navigate={navigate} />)}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '60px 20px', background: '#fff', borderRadius: 14, border: '1px solid #f1f5f9' }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>🔍</div>
              <h4 style={{ fontWeight: 700, color: '#1e293b', marginBottom: 8 }}>No properties found</h4>
              <p style={{ color: '#94a3b8', fontSize: 14, marginBottom: 20 }}>Try adjusting your filters or searching a different area.</p>
              <button onClick={resetFilters} style={{ padding: '9px 24px', background: '#e02020', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}>
                Reset Filters
              </button>
            </div>
          )}
        </main>
      </div>
    </>
  );
};

export default PropertyTypeSearch;