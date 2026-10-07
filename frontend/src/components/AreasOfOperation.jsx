import React, { useState, useEffect } from 'react';
import axios from 'axios';

// Ensure these match your database strings exactly
const ZONE_KEYS_ORDER = [
  'South Chennai', 
  'Central Chennai', 
  'West Chennai', 
  'North Chennai', 
  'East Chennai / OMR / ECR'
];

const AreasOfOperation = ({ selected = [], onChange, singleSelect = false }) => {
  const [zones, setZones] = useState({});
  const [zoneKeys, setZoneKeys] = useState([]);
  const [activeZone, setActiveZone] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLocalities = async () => {
      try {
        const { data } = await axios.get(
          `${import.meta.env.VITE_API_URL}/locality/all`,
          { withCredentials: true }
        );

        const grouped = {};
        
        data.data
          .filter(item => item.active)
          .forEach(item => {
            const zoneName = item.zone?.trim();
            if (!zoneName) return;

            if (!grouped[zoneName]) {
              grouped[zoneName] = { label: zoneName, locs: [] };
            }

            // Logic to split the "state" string into individual locality chips
            if (typeof item.state === 'string') {
              const splitLocs = item.state.split(',').map(s => s.trim()).filter(Boolean);
              splitLocs.forEach(loc => {
                // Prevent duplicate chips in the same zone
                if (!grouped[zoneName].locs.includes(loc)) {
                  grouped[zoneName].locs.push(loc);
                }
              });
            }
          });

        // Apply custom sort order
        const ordered = [
          ...ZONE_KEYS_ORDER.filter(k => grouped[k]),
          ...Object.keys(grouped).filter(k => !ZONE_KEYS_ORDER.includes(k)),
        ];

        setZones(grouped);
        setZoneKeys(ordered);
        setActiveZone(ordered[0] ?? null);
      } catch (err) {
        console.error('Failed to load localities:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchLocalities();
  }, []);

  const toggle = (loc) => {
    if (singleSelect) {
      // If already selected, clicking again clears it. Otherwise, replaces selection.
      onChange(selected.includes(loc) ? [] : [loc]);
    } else {
      onChange(selected.includes(loc)
        ? selected.filter(l => l !== loc)
        : [...selected, loc]);
    }
  };

  const toggleZone = (zk) => {
    if (singleSelect) return; // Zone toggle disabled for single selection
    const locs = zones[zk]?.locs ?? [];
    const allOn = locs.every(l => selected.includes(l));
    onChange(allOn
      ? selected.filter(l => !locs.includes(l))
      : [...selected, ...locs.filter(l => !selected.includes(l))]);
  };

  const clearAll = () => onChange([]);

  if (loading) {
    return (
      <div style={{ border: '1.5px solid #e5e7eb', borderRadius: 12, padding: '24px', textAlign: 'center', color: '#9ca3af', fontSize: 13 }}>
        <span className="spinner-border spinner-border-sm me-2" /> Loading localities…
      </div>
    );
  }

  if (!activeZone || zoneKeys.length === 0) {
    return (
      <div style={{ border: '1.5px solid #e5e7eb', borderRadius: 12, padding: '24px', textAlign: 'center', color: '#9ca3af', fontSize: 13 }}>
        No localities available.
      </div>
    );
  }

  const activeLocs = zones[activeZone]?.locs ?? [];
  const activeSelCnt = activeLocs.filter(l => selected.includes(l)).length;
  const allActive = activeLocs.length > 0 && activeSelCnt === activeLocs.length;

  return (
    <div style={{ fontFamily: "'Segoe UI', system-ui, sans-serif" }}>
      {/* Zone Tab Navigation */}
      <div style={{ display: 'flex', borderRadius: '10px 10px 0 0', border: '1.5px solid #e5e7eb', borderBottom: 'none', background: '#f9fafb', overflowX: 'auto' }}>
        {zoneKeys.map(zk => {
          const cnt = (zones[zk]?.locs ?? []).filter(l => selected.includes(l)).length;
          const isOn = zk === activeZone;
          return (
            <button
              key={zk}
              type="button"
              onClick={() => setActiveZone(zk)}
              style={{
                flex: '1', minWidth: '120px', padding: '12px 8px', border: 'none',
                background: isOn ? '#fff' : 'transparent',
                borderBottom: isOn ? '3px solid #ef4444' : '3px solid transparent',
                cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, transition: 'all .15s',
              }}
            >
              <span style={{ fontSize: 11, fontWeight: isOn ? 700 : 500, color: isOn ? '#ef4444' : '#6b7280', whiteSpace: 'nowrap' }}>
                {zk}
              </span>
              {cnt > 0 && (
                <span style={{ background: '#ef4444', color: '#fff', fontSize: 10, fontWeight: 700, borderRadius: 99, padding: '1px 6px' }}>
                  {cnt}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div style={{ border: '1.5px solid #e5e7eb', borderTop: 'none', borderRadius: '0 0 10px 10px', overflow: 'hidden', background: '#fff' }}>
        {/* Active Zone Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderBottom: '1px solid #f3f4f6' }}>
          <div>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#1f2937' }}>
              {zones[activeZone]?.label}
            </span>
            <span style={{ fontSize: 11, color: '#9ca3af', marginLeft: 8 }}>
              {activeSelCnt}/{activeLocs.length} selected
            </span>
          </div>
          {!singleSelect && (
            <button
              type="button"
              onClick={() => toggleZone(activeZone)}
              style={{ background: 'none', border: '1px solid #e5e7eb', borderRadius: 6, padding: '4px 12px', fontSize: 11, fontWeight: 600, color: '#4b5563', cursor: 'pointer' }}
            >
              {allActive ? 'Deselect all' : 'Select all'}
            </button>
          )}
        </div>

        {/* Individual Locality Chips */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, padding: '20px 16px' }}>
          {activeLocs.map(loc => {
            const isSelected = selected.includes(loc);
            return (
              <button
                key={loc}
                type="button"
                onClick={() => toggle(loc)}
                style={{
                  padding: '8px 16px', borderRadius: 99, fontSize: 13, fontWeight: 500, cursor: 'pointer',
                  border: isSelected ? '1.5px solid #ef4444' : '1.5px solid #e5e7eb',
                  background: isSelected ? '#fef2f2' : '#fff',
                  color: isSelected ? '#ef4444' : '#4b5563',
                  display: 'inline-flex', alignItems: 'center', gap: 6, transition: 'all .2s ease',
                }}
              >
                {isSelected && <i className="bi bi-check-lg" style={{ fontSize: 12 }} />}
                {loc}
              </button>
            );
          })}
        </div>

        {/* Selected Items Summary Strip */}
        {selected.length > 0 && (
          <div style={{ borderTop: '1px solid #fee2e2', background: '#fff5f5', padding: '12px 16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#b91c1c', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                {selected.length} {selected.length === 1 ? 'Selection' : 'Selections'}
              </span>
              <button type="button" onClick={clearAll} style={{ background: 'none', border: 'none', fontSize: 11, fontWeight: 700, color: '#b91c1c', cursor: 'pointer', textDecoration: 'underline' }}>
                Clear all
              </button>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {selected.map(loc => (
                <span key={loc} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 10px', background: '#ef4444', color: '#fff', borderRadius: 99, fontSize: 11, fontWeight: 600 }}>
                  {loc}
                  <button type="button" onClick={() => toggle(loc)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: 16, padding: 0, lineHeight: 1 }}>×</button>
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AreasOfOperation;