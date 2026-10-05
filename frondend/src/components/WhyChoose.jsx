import React from 'react';

const FEATURES = [
  { title: 'Verified Listings', desc: 'Every property manually verified by our team before going live.', icon: 'bi-patch-check-fill', color: '#e02020', bg: '#fff1f1' },
  { title: 'Zero Fraud Guarantee', desc: 'Your investment protected with our fraud-free assurance policy.', icon: 'bi-shield-fill-check', color: '#f59e0b', bg: '#fff7e6' },
  { title: 'Expert Brokers', desc: '2,400+ certified brokers across every zone of Chennai.', icon: 'bi-people-fill', color: '#10b981', bg: '#e8f9f2' },
  { title: '24/7 Support', desc: 'Our team is always available to help you find your perfect home.', icon: 'bi-headset', color: '#3b82f6', bg: '#eaf2ff' },
];

const WhyChoose = () => (
  <section className="py-5" style={{ background: '#fafbfd' }}>
    <div className="container">
      <div className="text-center mb-5">
        <span className="text-uppercase fw-bold small" style={{ color: '#e02020', letterSpacing: '2px' }}>Why Choose Us</span>
        <h2 className="fw-bold mt-2 mb-2" style={{ fontSize: '2rem', letterSpacing: '-0.5px' }}>
          Why <span style={{ color: '#e02020' }}>YesBroker?</span>
        </h2>
        <p className="text-muted mx-auto" style={{ maxWidth: 560 }}>
          We make property hunting simple, safe, and successful for thousands of families across Chennai.
        </p>
      </div>

      <div className="row g-4">
        {FEATURES.map((f, i) => (
          <div className="col-12 col-md-6 col-lg-3" key={i}>
            <div
              className="h-100 p-4 bg-white text-center"
              style={{ borderRadius: 18, border: '1px solid #eef2f6', boxShadow: '0 4px 18px rgba(15,23,42,0.04)', transition: 'transform .25s, box-shadow .25s' }}
              onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.boxShadow = '0 18px 40px rgba(15,23,42,0.10)'; }}
              onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 18px rgba(15,23,42,0.04)'; }}
            >
              <div
                className="d-flex align-items-center justify-content-center mx-auto mb-3"
                style={{ width: 64, height: 64, background: f.bg, borderRadius: 16 }}
              >
                <i className={`bi ${f.icon}`} style={{ fontSize: '1.6rem', color: f.color }}></i>
              </div>
              <h6 className="fw-bold text-dark mb-2" style={{ fontSize: '1.05rem' }}>{f.title}</h6>
              <p className="text-muted small mb-0" style={{ lineHeight: 1.55 }}>{f.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default WhyChoose;