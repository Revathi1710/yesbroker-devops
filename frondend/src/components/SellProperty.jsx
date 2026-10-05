import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const SellProperty = () => {
    const [sellProperties, setSellProperties] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchSellProperties = async () => {
            try {
                setLoading(true);
                const { data } = await axios.get(
                    `${import.meta.env.VITE_API_URL}/sellproperty`
                );
                // Limit to 4 for the exclusive homepage section
                setSellProperties(data.data.slice(0, 4));
            } catch (error) {
                console.error("Error fetching sell properties:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchSellProperties();
    }, []);

    if (loading) return null;

    return (
        <div className="container py-5">
            {/* Header Section */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h3 className="fw-bold mb-0">Exclusive Properties for Sale</h3>
                    <div style={{ height: '3px', width: '60px', backgroundColor: '#dc3545', marginTop: '5px' }}></div>
                </div>
                <button 
                    className="btn btn-link text-danger text-decoration-none fw-bold" 
                    onClick={() => navigate('/property/sell/all')}
                >
                    See all Properties &rarr;
                </button>
            </div>

            {/* Property Grid: Horizontal scroll on mobile */}
            <div className="row g-4 flex-nowrap overflow-auto pb-3 custom-scrollbar">
                {sellProperties.length > 0 ? (
                    sellProperties.map((property) => (
                        <div key={property._id} className="col-12 col-sm-6 col-md-4 col-lg-3">
                            <div 
                                className="card h-100 border-0 shadow-sm" 
                                style={{ borderRadius: '12px', cursor: 'pointer', overflow: 'hidden', transition: '0.3s' }} 
                               
                                onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                                onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                            >
                                {/* Property Image & "For Sale" Badge */}
                                <div className="position-relative" onClick={() => navigate(`/property-details/${property._id}`)}>
                                    <img 
                                        src={property.photos?.[0] || 'https://via.placeholder.com/400x250'} 
                                        className="card-img-top" 
                                        alt="Property" 
                                        style={{ height: '200px', objectFit: 'cover' }}
                                    />
                                    <div className="position-absolute top-0 start-0 m-2">
                                        <span className="badge bg-danger px-3 py-2 shadow-sm" style={{ borderRadius: '20px' }}>
                                            {property.propertyType}
                                        </span>
                                    </div>
                                    <div className="position-absolute bottom-0 end-0 m-2 badge bg-dark opacity-75">
                                        1/{property.photos?.length || 0}
                                    </div>
                                </div>

                                {/* Property Details */}
                                <div className="card-body p-3">
                                    <h4 className="fw-bold text-dark mb-1">
                                        ₹{property.price?.toLocaleString('en-IN')}
                                    </h4>
                                    <p className="text-muted mb-2 small text-truncate">
                                        {property.propertyType} • {property.localities?.[0]}
                                    </p>
                                    
                                    {/* Zone Display from Locality Data */}
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

                                    {/* Footer with Size & Action */}
                                    <div className="d-flex justify-content-between align-items-center border-top pt-3">
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
                                        <button className="btn btn-outline-danger btn-sm px-3 rounded-pill"  onClick={() => navigate(`/brokers/${property.broker?.slug}`)}>
                                            View details
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="ps-3 text-muted">No properties available for sale at the moment.</div>
                )}
            </div>
        </div>
    );
};

export default SellProperty;