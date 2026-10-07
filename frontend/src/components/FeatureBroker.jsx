import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const FeatureBroker = () => {
  const [brokers, setBrokers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFeaturedBrokers = async () => {
      try {
        const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/feature-broker`);
        if (data.success) setBrokers(data.data);
      } catch (error) {
        console.error("Error fetching featured brokers:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchFeaturedBrokers();
  }, []);

  if (loading || brokers.length === 0) return null;

  return (
    <div className="container py-5">
      <div className="text-center mb-5">
        <span className="text-uppercase fw-bold small" style={{ color: '#e02020', letterSpacing: '2px' }}>Top Rated</span>
        <h2 className="fw-bold mt-2" style={{ fontSize: '2rem', letterSpacing: '-0.5px' }}>Our Featured Partners</h2>
        <p className="text-muted">Expert brokers with proven track records in Chennai</p>
      </div>

      <div className="row g-4">
        {brokers.map((broker) => (
          <div key={broker._id} className="col-12 col-sm-6 col-md-4 col-lg-3">
            <div
              className="card h-100 border-0 text-center p-4"
              style={{ borderRadius: 18, boxShadow: '0 4px 18px rgba(15,23,42,0.05)', transition: '0.3s', background: '#fff' }}
              onMouseOver={(e) => { e.currentTarget.style.boxShadow = '0 18px 40px rgba(15,23,42,0.12)'; e.currentTarget.style.transform = 'translateY(-4px)'; }}
              onMouseOut={(e) => { e.currentTarget.style.boxShadow = '0 4px 18px rgba(15,23,42,0.05)'; e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              <div className="position-relative mx-auto mb-3" style={{ width: 110, height: 110 }}>
                <div style={{ position: 'absolute', inset: -4, borderRadius: '50%', background: 'linear-gradient(135deg,#e02020,#f59e0b)' }}></div>
                <img
                  src={broker.profileImage || 'https://via.placeholder.com/110'}
                  className="rounded-circle position-relative"
                  alt={broker.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', border: '3px solid #fff' }}
                />
                <div
                  className="position-absolute bottom-0 end-0 d-flex align-items-center justify-content-center"
                  style={{ width: 28, height: 28, background: '#10b981', borderRadius: '50%', border: '2px solid #fff' }}
                >
                  <i className="bi bi-patch-check-fill text-white" style={{ fontSize: '0.85rem' }}></i>
                </div>
              </div>

              <h6 className="fw-bold mb-1" style={{ fontSize: '1rem' }}>{broker.name}</h6>
              <p className="small fw-semibold mb-2" style={{ color: '#e02020' }}>
                <i className="bi bi-award-fill me-1"></i>{broker.year_experience}+ Years Experience
              </p>

              <div className="mb-3 d-flex flex-wrap gap-1 justify-content-center">
                {broker.service_offered?.slice(0, 2).map((service, i) => (
                  <span
                    key={i}
                    className="badge fw-normal px-2 py-1"
                    style={{ background: '#f1f5f9', color: '#475569', borderRadius: 6, fontSize: '0.7rem' }}
                  >
                    {service}
                  </span>
                ))}
              </div>

              <p className="text-muted small mb-3" style={{ fontSize: '0.78rem', minHeight: 38 }}>
                <i className="bi bi-geo-alt-fill me-1" style={{ color: '#e02020' }}></i>
                Specialist in {broker.locality?.slice(0, 2).join(", ")}
              </p>

              <button
                className="btn w-100 fw-bold py-2"
                style={{ background: '#e02020', color: '#fff', borderRadius: 10, fontSize: '0.85rem', boxShadow: '0 6px 14px rgba(224,32,32,0.25)' }}
                onClick={() => navigate(`/brokers/${broker.slug}`)}
              >
                View Profile <i className="bi bi-arrow-right ms-1"></i>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FeatureBroker;