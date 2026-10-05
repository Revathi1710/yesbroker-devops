import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const MAX_RECENT = 5;
const RECENT_KEY = 'yesbroker_recent_searches';

const BannerSection = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Buy');
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [allLocalities, setAllLocalities] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [cursor, setCursor] = useState(-1);
  const [selectedLocations, setSelectedLocations] = useState([]);   // ← multi-select
  const [recentSearches, setRecentSearches] = useState([]);          // ← recent
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);

  const tabs = ['Buy', 'Rent', 'Commercial', 'PG/Co-living', 'Plots'];

  /* ── load localities ── */
  useEffect(() => {
    const fetchLocalities = async () => {
      try {
        const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/locality/all`, { withCredentials: true });
        const list = data.data
          .filter(item => item.active)
          .flatMap(item => {
            const localitiesStr = typeof item.state === 'string' ? item.state : '';
            const zoneName = item.zone || 'Chennai';
            return localitiesStr.split(',').map(loc => ({ name: loc.trim(), zone: zoneName }));
          })
          .filter(loc => loc.name !== '');
        const unique = list.filter((v, i, a) =>
          a.findIndex(t => t.name.toLowerCase() === v.name.toLowerCase()) === i
        );
        setAllLocalities(unique);
      } catch (err) {
        console.error('Locality fetch error:', err);
      }
    };
    fetchLocalities();
  }, []);

  /* ── load recent searches from localStorage ── */
  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(RECENT_KEY) || '[]');
      // Clean out any bad entries with blank/invalid location names
      const cleaned = stored.filter(entry =>
        Array.isArray(entry.locations) &&
        entry.locations.length > 0 &&
        entry.locations.every(l => l.name && l.name.trim().length > 1 && l.name.toLowerCase() !== 'all')
      );
      // Persist cleaned list back so stale bad data is removed
      localStorage.setItem(RECENT_KEY, JSON.stringify(cleaned));
      setRecentSearches(cleaned);
    } catch { setRecentSearches([]); }
  }, []);

  /* ── close dropdown on outside click ── */
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  /* ── filter suggestions ── */
  const handleInputChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    setCursor(-1);
    if (val.trim().length > 0) {
      const filtered = allLocalities
        .filter(loc =>
          loc.name.toLowerCase().includes(val.toLowerCase()) &&
          !selectedLocations.find(s => s.name.toLowerCase() === loc.name.toLowerCase())
        )
        .slice(0, 10);
      setSuggestions(filtered);
      setShowDropdown(true);
    } else {
      setSuggestions([]);
      setShowDropdown(true); // show recent searches when input is empty
    }
  };

  const handleFocus = () => {
    setShowDropdown(true);
    if (query.trim().length === 0) setSuggestions([]);
  };

  /* ── keyboard nav ── */
  const dropdownItems = query.trim().length > 0 ? suggestions : [];
  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown' && cursor < dropdownItems.length - 1) setCursor(p => p + 1);
    else if (e.key === 'ArrowUp' && cursor > 0) setCursor(p => p - 1);
    else if (e.key === 'Enter') {
      if (cursor >= 0 && dropdownItems[cursor]) addLocation(dropdownItems[cursor]);
      else handleSearch();
    } else if (e.key === 'Backspace' && query === '' && selectedLocations.length > 0) {
      removeLocation(selectedLocations[selectedLocations.length - 1].name);
    }
  };

  /* ── add / remove locations ── */
  const addLocation = (loc) => {
    if (!selectedLocations.find(s => s.name.toLowerCase() === loc.name.toLowerCase())) {
      setSelectedLocations(prev => [...prev, loc]);
    }
    setQuery('');
    setSuggestions([]);
    setShowDropdown(false);
    setCursor(-1);
    inputRef.current?.focus();
  };

  const removeLocation = (name) => {
    setSelectedLocations(prev => prev.filter(l => l.name !== name));
  };

  /* ── save & execute search ── */
  const saveRecent = (locations, tab) => {
    // ✅ Never save if any location name is blank or "all"
    const validLocs = locations.filter(l => l.name && l.name.trim().length > 1 && l.name.toLowerCase() !== 'all');
    if (validLocs.length === 0) return;
    const entry = { locations: validLocs, tab, timestamp: Date.now() };
    try {
      const existing = JSON.parse(localStorage.getItem(RECENT_KEY) || '[]');
      const deduped = existing.filter(r =>
        !(r.tab === tab && JSON.stringify(r.locations.map(l => l.name).sort()) === JSON.stringify(validLocs.map(l => l.name).sort()))
      );
      const updated = [entry, ...deduped].slice(0, MAX_RECENT);
      localStorage.setItem(RECENT_KEY, JSON.stringify(updated));
      setRecentSearches(updated);
    } catch {}
  };

  const handleSearch = () => {
    const locs = selectedLocations.length > 0
      ? selectedLocations
      : query.trim()
        ? [{ name: query.trim(), zone: 'Chennai' }]
        : [];
    if (locs.length === 0) return;
    saveRecent(locs, activeTab);
    const locString = locs.map(l => encodeURIComponent(l.name)).join(',');
    navigate(`/property/${activeTab.toLowerCase()}/${locString}`);
  };

  const applyRecent = (entry) => {
    setSelectedLocations(entry.locations);
    setActiveTab(entry.tab);
    setShowDropdown(false);
    const locString = entry.locations.map(l => encodeURIComponent(l.name)).join(',');
    navigate(`/property/${entry.tab.toLowerCase()}/${locString}`);
  };

  const clearRecent = (e) => {
    e.stopPropagation();
    localStorage.removeItem(RECENT_KEY);
    setRecentSearches([]);
  };

  const showRecent = showDropdown && query.trim().length === 0 && recentSearches.length > 0;
  const showSuggestions = showDropdown && query.trim().length > 0 && suggestions.length > 0;

  return (
    <div className="banner-wrapper" style={styles.bannerWrapper}>
      <style>{`
        .suggestion-item:hover, .suggestion-active { background-color: #fff5f5 !important; color: #e02020 !important; }
        .tab-btn:hover { color: #e02020 !important; }
        input::placeholder { color: #9ca3af !important; font-weight: 400; }
        .custom-scroll::-webkit-scrollbar { width: 6px; }
        .custom-scroll::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
        .stat-pill { display: inline-flex; align-items: center; gap: 8px; padding: 8px 16px; background: rgba(255,255,255,0.12); border: 1px solid rgba(255,255,255,0.2); border-radius: 50px; color: #fff; font-size: 0.82rem; font-weight: 500; backdrop-filter: blur(10px); }
        .loc-tag { display: inline-flex; align-items: center; gap: 4px; background: #fff0f0; border: 1px solid #fca5a5; color: #e02020; border-radius: 20px; padding: 3px 10px; font-size: 12px; font-weight: 500; white-space: nowrap; }
        .loc-tag-remove { background: none; border: none; cursor: pointer; color: #e02020; font-size: 14px; line-height: 1; padding: 0; margin-left: 2px; display: flex; align-items: center; }
        .loc-tag-remove:hover { color: #b91c1c; }
        .recent-item:hover { background: #f8fafc; }
        .recent-card:hover { border-color: #fca5a5 !important; background: #fff8f8 !important; }
        @media (max-width: 768px) {
          .banner-wrapper { min-height: 520px !important; padding: 40px 15px; }
          .banner-title { font-size: 1.9rem !important; }
          .banner-subtitle { font-size: 0.95rem !important; }
          .search-flex-container { flex-direction: column !important; gap: 10px; }
          .search-btn { width: 100% !important; margin-left: 0 !important; padding: 12px !important; }
          .tabs-scroll { overflow-x: auto; white-space: nowrap; -webkit-overflow-scrolling: touch; }
          .tab-btn { padding: 14px 16px !important; font-size: 0.72rem !important; }
        }
      `}</style>

      <div className="container" style={styles.container}>
        <div className="text-center text-white mb-4">
          <span className="stat-pill mb-3">
            <i className="bi bi-stars" style={{ color: '#fbbf24' }}></i>
            India's Most Trusted Broker Network
          </span>
          <h1 className="banner-title mt-3" style={styles.title}>
            Properties to {activeTab.toLowerCase()} in <span style={{ color: '#fbbf24' }}>Chennai</span>
          </h1>
          <p className="banner-subtitle" style={styles.subtitle}>
            9K+ listings added daily • 74K+ verified properties • 2,400+ trusted brokers
          </p>
        </div>

        <div className="mx-auto" style={styles.searchContainer} ref={dropdownRef}>
          {/* Tabs */}
          <div className="d-flex px-2 tabs-scroll" style={{ borderBottom: '1px solid #f0f0f0' }}>
            {tabs.map((tab) => (
              <button
                key={tab}
                className="tab-btn"
                onClick={() => { setActiveTab(tab); setQuery(''); setSelectedLocations([]); }}
                style={{
                  ...styles.tabButton,
                  borderBottom: activeTab === tab ? '3px solid #e02020' : '3px solid transparent',
                  color: activeTab === tab ? '#e02020' : '#4b5563',
                  fontWeight: activeTab === tab ? '700' : '500',
                }}
              >
                {tab.toUpperCase()}
              </button>
            ))}
          </div>

          {/* Search Row */}
          <div className="p-3 d-flex align-items-center position-relative search-flex-container">
            <div className="flex-grow-1 position-relative w-100">
              {/* Input with location tags */}
              <div
                style={styles.inputWrapper}
                onClick={() => inputRef.current?.focus()}
              >
                <i className="bi bi-search" style={styles.searchIconInline}></i>

                {/* Selected location tags */}
                {selectedLocations.map(loc => (
                  <span key={loc.name} className="loc-tag">
                    {loc.name}
                    <button className="loc-tag-remove" onClick={(e) => { e.stopPropagation(); removeLocation(loc.name); }}>×</button>
                  </span>
                ))}

                <input
                  ref={inputRef}
                  type="text"
                  className="border-0"
                  placeholder={selectedLocations.length === 0 ? 'Search locality, project, or landmark...' : 'Add more locations...'}
                  style={styles.inlineInput}
                  value={query}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  onFocus={handleFocus}
                />
              </div>

              {/* Dropdown */}
              {(showSuggestions || showRecent) && (
                <div className="position-absolute w-100 shadow-lg bg-white border-0 mt-1 custom-scroll" style={styles.dropdown}>

                  {/* Recent Searches */}
                  {showRecent && (
                    <>
                      <div style={styles.dropdownHeader}>
                        <span>Recent Searches</span>
                        <button onClick={clearRecent} style={styles.clearBtn}>Clear all</button>
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, padding: '10px 14px 14px' }}>
                        {recentSearches.map((entry, idx) => (
                          <div
                            key={idx}
                            className="recent-card"
                            onClick={() => applyRecent(entry)}
                            style={{
                              border: '1px solid #e2e8f0',
                              borderRadius: 10,
                              padding: '10px 14px',
                              cursor: 'pointer',
                              minWidth: 150,
                              maxWidth: 220,
                              flex: '1 1 140px',
                              background: '#fff',
                              transition: 'all 0.15s',
                            }}
                          >
                            <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#1e293b', marginBottom: 3 }}>
                              {entry.tab} in {entry.locations.map(l => l.name).join(', ')}
                            </div>
                            <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                              {entry.locations.map(l => l.zone || 'Chennai').filter((z, i, a) => a.indexOf(z) === i).join(', ')}
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}

                  {/* Locality Suggestions */}
                  {showSuggestions && (
                    <>
                      <div style={styles.dropdownHeader}>
                        <span>Matching Localities</span>
                        {selectedLocations.length > 0 && (
                          <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                            {selectedLocations.length} selected
                          </span>
                        )}
                      </div>
                      {suggestions.map((loc, idx) => (
                        <div
                          key={idx}
                          className={`suggestion-item d-flex align-items-center p-3 ${cursor === idx ? 'suggestion-active' : ''}`}
                          style={styles.suggestionItem}
                          onClick={() => addLocation(loc)}
                        >
                          <i className="bi bi-geo-alt-fill me-3" style={{ color: '#e02020', fontSize: '1.1rem' }}></i>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{loc.name}</div>
                            <div className="text-muted" style={{ fontSize: '0.75rem' }}>{loc.zone}</div>
                          </div>
                          <i className="bi bi-plus-circle" style={{ color: '#cbd5e1', fontSize: '1rem' }}></i>
                        </div>
                      ))}
                      {selectedLocations.length > 0 && (
                        <div style={{ padding: '8px 12px', background: '#f8fafc', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'flex-end' }}>
                          <button
                            onClick={handleSearch}
                            style={{ padding: '6px 18px', background: '#e02020', color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
                          >
                            Search {selectedLocations.length} location{selectedLocations.length > 1 ? 's' : ''}
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>

            <button className="btn text-white px-5 py-3 ms-3 search-btn" onClick={handleSearch} style={styles.searchBtn}>
              <i className="bi bi-search me-2"></i>Search
            </button>
          </div>
        </div>

        {/* Recent searches pills — dynamic from localStorage */}
        {recentSearches.length > 0 && (
          <div className="mt-4 text-center text-white d-none d-md-flex justify-content-center align-items-center gap-3 flex-wrap">
            <span className="small opacity-75">Recent:</span>
            {recentSearches.map((entry, idx) => (
              <button
                key={idx}
                onClick={() => applyRecent(entry)}
                className="btn btn-sm rounded-pill px-3 py-1"
                style={{ fontSize: '0.78rem', border: '1px solid rgba(255,255,255,0.3)', background: 'rgba(255,255,255,0.1)', color: '#fff', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', gap: 5 }}
              >
                <i className="bi bi-clock-history" style={{ fontSize: '0.7rem', opacity: 0.8 }}></i>
                {entry.locations.map(l => l.name).join(', ')}
                <span style={{ fontSize: '0.65rem', opacity: 0.7, background: 'rgba(255,255,255,0.15)', borderRadius: 10, padding: '1px 6px' }}>{entry.tab}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  bannerWrapper: {
    minHeight: '620px',
    backgroundImage: `linear-gradient(135deg, rgba(15,23,42,0.65) 0%, rgba(224,32,32,0.35) 100%), url('https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1920&q=80')`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    padding: '60px 0'
  },
  container: { position: 'relative', zIndex: 2, width: '100%', maxWidth: '960px' },
  title: { fontWeight: 800, fontSize: '2.8rem', letterSpacing: '-1.5px', textShadow: '0 4px 20px rgba(0,0,0,0.4)', lineHeight: 1.15 },
  subtitle: { fontWeight: 400, opacity: 0.95, fontSize: '1.05rem' },
  searchContainer: { backgroundColor: '#fff', borderRadius: '20px', width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' },
  tabButton: { background: 'none', border: 'none', padding: '18px 22px', fontSize: '0.78rem', cursor: 'pointer', transition: '0.2s', letterSpacing: '0.8px' },
  inputWrapper: {
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '6px',
    minHeight: '52px',
    padding: '6px 12px 6px 44px',
    border: '1.5px solid #e2e8f0',
    borderRadius: '12px',
    cursor: 'text',
    position: 'relative',
  },
  searchIconInline: { position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: '1.1rem', zIndex: 1 },
  inlineInput: { border: 'none', outline: 'none', boxShadow: 'none', fontSize: '0.95rem', fontWeight: 500, color: '#1e293b', minWidth: '160px', flex: 1, background: 'transparent', padding: '2px 0' },
  searchBtn: { backgroundColor: '#e02020', borderRadius: '12px', fontWeight: 700, letterSpacing: '0.5px', fontSize: '1rem', transition: '0.3s', boxShadow: '0 6px 16px rgba(224,32,32,0.4)', whiteSpace: 'nowrap' },
  dropdown: { zIndex: 1000, borderRadius: '14px', maxHeight: '360px', overflowY: 'auto', top: '100%', left: 0, right: 0 },
  dropdownHeader: { padding: '8px 16px 6px', fontSize: '10px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px', background: '#f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  clearBtn: { background: 'none', border: 'none', cursor: 'pointer', color: '#e02020', fontSize: '11px', fontWeight: 500, padding: 0 },
  suggestionItem: { cursor: 'pointer', borderBottom: '1px solid #f8f9fa', transition: 'all 0.2s' }
};

export default BannerSection;