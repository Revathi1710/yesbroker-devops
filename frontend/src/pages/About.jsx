import React, { useEffect, useRef } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useNavigate } from 'react-router-dom';

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700;900&family=DM+Sans:wght@300;400;500;600&display=swap');

  .about-page {
    font-family: 'DM Sans', sans-serif;
    color: #1a1a2e;
    overflow-x: hidden;
  }

  /* ── Hero ── */
  .about-hero {
    position: relative;
    min-height: 92vh;
    display: flex;
    align-items: center;
    background: #0f0f1a;
    overflow: hidden;
  }

  .about-hero-bg {
    position: absolute;
    inset: 0;
    background:
      radial-gradient(ellipse 80% 60% at 60% 40%, rgba(232,52,28,0.18) 0%, transparent 60%),
      radial-gradient(ellipse 50% 40% at 10% 80%, rgba(99,102,241,0.12) 0%, transparent 50%),
      linear-gradient(160deg, #0f0f1a 0%, #1a1040 100%);
  }

  .about-hero-grid {
    position: absolute;
    inset: 0;
    background-image:
      linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px);
    background-size: 60px 60px;
  }

  .about-hero-content {
    position: relative;
    z-index: 2;
    max-width: 780px;
  }

      display: inline-flex;
    align-items: center;
    gap: 10px;
    background: rgb(255 76 76 / 15%);
    border: 1px solid rgba(232, 52, 28, 0.3);
    border-radius: 100px;
    padding: 8px 20px;
    font-size: 0.78rem;
    font-weight: 600;
    letter-spacing: 2px;
    text-transform: uppercase;
    color: #e02020;
    margin-bottom: 32px;
    }
  .hero-eyebrow::before {
    content: '';
    width: 6px; height: 6px;
    border-radius: 50%;
    background: #e02020;
    animation: pulse-dot 2s infinite;
  }

  @keyframes pulse-dot {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.5; transform: scale(0.7); }
  }

  .about-hero h1 {
    font-family: 'Playfair Display', serif;
    font-size: clamp(3rem, 6vw, 5.5rem);
    font-weight: 900;
    color: #fff;
    line-height: 1.05;
    margin-bottom: 28px;
    letter-spacing: -1px;
  }

  .about-hero h1 em {
    font-style: normal;
    color: #e8341c;
    position: relative;
  }

  .about-hero p {
    font-size: 1.15rem;
    color: rgba(255,255,255,0.65);
    line-height: 1.8;
    max-width: 540px;
    margin-bottom: 48px;
    font-weight: 300;
  }

  .hero-stats {
    display: flex;
    gap: 40px;
    flex-wrap: wrap;
  }

  .hero-stat {
    display: flex;
    flex-direction: column;
  }

  .hero-stat-num {
    font-family: 'Playfair Display', serif;
    font-size: 2.4rem;
    font-weight: 700;
    color: #fff;
    line-height: 1;
    margin-bottom: 4px;
  }

  .hero-stat-label {
    font-size: 0.78rem;
    color: rgba(255,255,255,0.45);
    letter-spacing: 1px;
    text-transform: uppercase;
  }

  .hero-scroll-indicator {
    position: absolute;
    bottom: 40px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    color: rgba(255,255,255,0.3);
    font-size: 0.72rem;
    letter-spacing: 2px;
    text-transform: uppercase;
    animation: float 3s ease-in-out infinite;
  }

  .scroll-line {
    width: 1px;
    height: 48px;
    background: linear-gradient(to bottom, rgba(232,52,28,0.8), transparent);
  }

  @keyframes float {
    0%, 100% { transform: translateX(-50%) translateY(0); }
    50% { transform: translateX(-50%) translateY(8px); }
  }

  /* ── Heritage Section ── */
  .heritage-section {
    padding: 120px 0;
    background: #fff;
    position: relative;
  }

  .section-label {
    font-size: 0.75rem;
    font-weight: 700;
    letter-spacing: 3px;
    text-transform: uppercase;
    color: #e8341c;
    margin-bottom: 16px;
  }

  .section-title {
    font-family: 'Playfair Display', serif;
    font-size: clamp(2rem, 4vw, 3.2rem);
    font-weight: 700;
    color: #1a1a2e;
    line-height: 1.2;
    margin-bottom: 24px;
  }

  .heritage-text {
    font-size: 1rem;
    color: #64748b;
    line-height: 1.9;
    margin-bottom: 20px;
  }

  .highlight-card {
    background: linear-gradient(135deg, #0f0f1a, #1e1e3f);
    border-radius: 24px;
    padding: 40px;
    position: relative;
    overflow: hidden;
  }

  .highlight-card::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 3px;
    background: linear-gradient(135deg, #e02020, #f43f5e);
  }

  .highlight-card::after {
    content: '';
    position: absolute;
    width: 200px; height: 200px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(232,52,28,0.15), transparent);
    bottom: -60px; right: -60px;
  }

  .highlight-item {
    display: flex;
    align-items: flex-start;
    gap: 16px;
    margin-bottom: 28px;
    position: relative;
    z-index: 1;
  }

  .highlight-item:last-child { margin-bottom: 0; }

  .hi-icon {
    width: 44px; height: 44px;
    border-radius: 12px;
    background: rgba(232,52,28,0.2);
    border: 1px solid rgba(232,52,28,0.3);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.1rem;
    flex-shrink: 0;
  }

  .hi-title {
    font-weight: 600;
    color: #fff;
    margin-bottom: 4px;
    font-size: 0.95rem;
  }

  .hi-desc {
    font-size: 0.84rem;
    color: rgba(255,255,255,0.5);
    line-height: 1.6;
    margin: 0;
  }

  /* ── Values Section ── */
  .values-section {
    padding: 120px 0;
    background: linear-gradient(160deg, #fafbff 0%, #f5f0ff 100%);
    position: relative;
  }

  .values-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 28px;
    margin-top: 64px;
  }

  @media (max-width: 768px) {
    .values-grid { grid-template-columns: 1fr; }
  }

  .value-card {
    background: #fff;
    border-radius: 20px;
    padding: 36px 32px;
    border: 1px solid rgba(0,0,0,0.06);
    transition: all 0.35s ease;
    position: relative;
    overflow: hidden;
  }

  .value-card::before {
    content: '';
    position: absolute;
    bottom: 0; left: 0; right: 0;
    height: 3px;
    background: linear-gradient(90deg, #e8341c, #ff6b35);
    transform: scaleX(0);
    transform-origin: left;
    transition: transform 0.35s ease;
  }

  .value-card:hover {
    transform: translateY(-8px);
    box-shadow: 0 32px 64px rgba(0,0,0,0.1);
    border-color: transparent;
  }

  .value-card:hover::before { transform: scaleX(1); }

  .value-number {
    font-family: 'Playfair Display', serif;
    font-size: 4rem;
    font-weight: 900;
    color: rgba(232,52,28,0.08);
    line-height: 1;
    margin-bottom: 16px;
  }

  .value-icon {
    font-size: 2rem;
    margin-bottom: 20px;
    display: block;
  }

  .value-card h3 {
    font-family: 'Playfair Display', serif;
    font-size: 1.3rem;
    font-weight: 700;
    color: #1a1a2e;
    margin-bottom: 12px;
  }

  .value-card p {
    font-size: 0.9rem;
    color: #64748b;
    line-height: 1.7;
    margin: 0;
  }

  /* ── Team / Why Section ── */
  .why-section {
    padding: 120px 0;
    background: #fff;
  }

  .why-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;
    margin-top: 64px;
  }

  @media (max-width: 768px) {
    .why-grid { grid-template-columns: 1fr; }
  }

  .why-card {
    display: flex;
    gap: 20px;
    padding: 28px;
    border-radius: 16px;
    background: #f8f9fc;
    border: 1px solid transparent;
    transition: all 0.3s ease;
  }

  .why-card:hover {
    background: #fff;
    border-color: rgba(232,52,28,0.15);
    box-shadow: 0 16px 48px rgba(0,0,0,0.08);
  }

  .why-icon {
    width: 52px; height: 52px;
    border-radius: 14px;
    background: linear-gradient(135deg, #e02020, #f43f5e);
    display: flex; align-items: center; justify-content: center;
    font-size: 1.3rem;
    flex-shrink: 0;
  }

  .why-card h4 {
    font-weight: 700;
    color: #1a1a2e;
    margin-bottom: 6px;
    font-size: 1rem;
  }

  .why-card p {
    font-size: 0.87rem;
    color: #64748b;
    line-height: 1.6;
    margin: 0;
  }

  /* ── CTA ── */
  .about-cta {
    padding: 100px 0;
    background: #0f0f1a;
    position: relative;
    overflow: hidden;
    text-align: center;
  }

  .about-cta::before {
    content: '';
    position: absolute;
    width: 600px; height: 600px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(232,52,28,0.2), transparent);
    top: 50%; left: 50%;
    transform: translate(-50%, -50%);
  }

  .about-cta h2 {
    font-family: 'Playfair Display', serif;
    font-size: clamp(2rem, 4vw, 3rem);
    font-weight: 700;
    color: #fff;
    margin-bottom: 16px;
    position: relative;
  }

  .about-cta p {
    color: rgba(255,255,255,0.55);
    font-size: 1.05rem;
    margin-bottom: 40px;
    position: relative;
  }

  .cta-buttons {
    display: flex;
    gap: 16px;
    justify-content: center;
    flex-wrap: wrap;
    position: relative;
  }

  .btn-cta-primary {
    background: #e8341c;
    color: #fff;
    border: none;
    border-radius: 100px;
    padding: 16px 36px;
    font-size: 0.95rem;
    font-weight: 600;
    font-family: 'DM Sans', sans-serif;
    cursor: pointer;
    transition: all 0.25s ease;
    letter-spacing: 0.3px;
  }

  .btn-cta-primary:hover {
    background: #c42d18;
    transform: translateY(-2px);
    box-shadow: 0 12px 32px rgba(232,52,28,0.4);
  }

  .btn-cta-ghost {
    background: transparent;
    color: #fff;
    border: 1.5px solid rgba(255,255,255,0.25);
    border-radius: 100px;
    padding: 16px 36px;
    font-size: 0.95rem;
    font-weight: 600;
    font-family: 'DM Sans', sans-serif;
    cursor: pointer;
    transition: all 0.25s ease;
  }

  .btn-cta-ghost:hover {
    border-color: rgba(255,255,255,0.6);
    background: rgba(255,255,255,0.05);
  }

  /* ── Responsive ── */
  @media (max-width: 768px) {
    .heritage-section, .values-section, .why-section, .about-cta { padding: 72px 0; }
    .hero-stats { gap: 24px; }
  }
`;

const About = () => {
  const navigate = useNavigate();

  return (
    <>
      <style>{STYLES}</style>
      <Header />

      <div className="about-page">
        {/* ── Hero ── */}
        <section className="about-hero">
          <div className="about-hero-bg" />
          <div className="about-hero-grid" />
          <div className="container">
            <div className="about-hero-content">
              <div className="hero-eyebrow">Est. 2024 · Chennai, India</div>
              <h1>
                Redefining<br />
                <em>Real Estate</em><br />
                in India.
              </h1>
              <p>
                YesBroker is a verified broker marketplace built to bring trust,
                transparency, and technology to every property transaction across Chennai.
              </p>
              <div className="hero-stats">
                {[
                  { num: '500+', label: 'Verified Brokers' },
                  { num: '12K+', label: 'Properties Listed' },
                  { num: '98%', label: 'Client Satisfaction' },
                  { num: '5 Zones', label: 'Coverage Area' },
                ].map((s, i) => (
                  <div className="hero-stat" key={i}>
                    <span className="hero-stat-num">{s.num}</span>
                    <span className="hero-stat-label">{s.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="hero-scroll-indicator">
            <div className="scroll-line" />
            <span>Scroll</span>
          </div>
        </section>

        {/* ── Heritage ── */}
        <section className="heritage-section">
          <div className="container">
            <div className="row align-items-center g-5">
              <div className="col-lg-6">
                <p className="section-label">Our Heritage</p>
                <h2 className="section-title">
                  A Division of Kariyamangalam<br />Technologies Pvt Ltd
                </h2>
                <p className="heritage-text">
                  <strong>YesBroker</strong> is the flagship digital marketplace of
                  Kariyamangalam Technologies Pvt Ltd — built on enterprise-grade
                  infrastructure to simplify property discovery and broker engagement
                  across Chennai.
                </p>
                <p className="heritage-text">
                  Our platform exclusively bridges the gap between property seekers and
                  RERA-compliant professional brokers, ensuring every interaction is
                  verified, accountable, and seamless.
                </p>
              </div>
              <div className="col-lg-6">
                <div className="highlight-card">
                  {[
                    { icon: '🔐', title: 'Verified Broker Identity', desc: 'Every broker undergoes manual KYC before going live on the platform.' },
                    { icon: '🏙️', title: 'Hyperlocal Coverage', desc: 'Granular locality data across all 5 zones of Greater Chennai.' },
                    { icon: '📊', title: 'Data-Driven Matching', desc: 'Smart filters connect seekers with the right specialists instantly.' },
                    { icon: '⚡', title: 'Built on Reliable Infrastructure', desc: 'Enterprise-grade tech from Kariyamangalam Technologies stack.' },
                  ].map((item, i) => (
                    <div className="highlight-item" key={i}>
                      <div className="hi-icon">{item.icon}</div>
                      <div>
                        <div className="hi-title">{item.title}</div>
                        <p className="hi-desc">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Values ── */}
        <section className="values-section">
          <div className="container">
            <div className="text-center">
              <p className="section-label">What We Stand For</p>
              <h2 className="section-title" style={{ maxWidth: 500, margin: '0 auto' }}>
                Our Mission, Vision & Values
              </h2>
            </div>
            <div className="values-grid">
              {[
                {
                  num: '01',
                  icon: '🎯',
                  title: 'Our Mission',
                  desc: 'To empower every property seeker in Chennai with access to verified, expert broker guidance — making every transaction safe, fast, and transparent.',
                },
                {
                  num: '02',
                  icon: '🔭',
                  title: 'Our Vision',
                  desc: 'To become India\'s most trusted hyperlocal broker marketplace, setting the gold standard for broker-client relationships in the digital era.',
                },
                {
                  num: '03',
                  icon: '⚖️',
                  title: 'Our Values',
                  desc: 'Transparency in every listing. Accountability in every broker. Excellence in every experience. These are not just words — they\'re our operating principles.',
                },
              ].map((v, i) => (
                <div className="value-card" key={i}>
                  <div className="value-number">{v.num}</div>
                  <span className="value-icon">{v.icon}</span>
                  <h3>{v.title}</h3>
                  <p>{v.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Why YesBroker ── */}
        <section className="why-section">
          <div className="container">
            <div className="row">
              <div className="col-lg-5 mb-5 mb-lg-0">
                <p className="section-label">Why Choose Us</p>
                <h2 className="section-title">
                  The smarter way to find your broker.
                </h2>
                <p style={{ color: '#64748b', lineHeight: 1.8, marginTop: 20 }}>
                  From Buy to Rent to Commercial, our platform is designed for the
                  entire property journey — with brokers who specialize exactly
                  where you need them.
                </p>
              </div>
              <div className="col-lg-7">
                <div className="why-grid">
                  {[
                    { icon: '✅', title: 'Manual Verification', desc: 'Every broker profile is reviewed and approved by our team before going live.' },
                    { icon: '📍', title: 'Locality Specialists', desc: 'Filter by zone and locality to find brokers who know your target area deeply.' },
                    { icon: '🏠', title: 'Full Property Categories', desc: 'Buy, Rent, Commercial, PG/Co-living, and Plots — all in one place.' },
                    { icon: '💬', title: 'Direct Broker Contact', desc: 'No middlemen. Connect directly with the verified broker of your choice.' },
                    { icon: '📈', title: 'Success Story Tracking', desc: 'Real deals, real clients — brokers showcase proven track records.' },
                    { icon: '🔒', title: 'Secure OTP Login', desc: 'Passwordless authentication keeps broker accounts safe and seamless.' },
                  ].map((w, i) => (
                    <div className="why-card" key={i}>
                      <div className="why-icon">{w.icon}</div>
                      <div>
                        <h4>{w.title}</h4>
                        <p>{w.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="about-cta">
          <div className="container">
            <h2>Ready to find your perfect broker?</h2>
            <p>Join thousands of property seekers who found their ideal match on YesBroker.</p>
            <div className="cta-buttons">
              <button className="btn-cta-primary" onClick={() => navigate('/brokers')}>
                Explore Brokers →
              </button>
              <button className="btn-cta-ghost" onClick={() => navigate('/register')}>
                Register as Broker
              </button>
            </div>
          </div>
        </section>
      </div>

      <Footer />
    </>
  );
};

export default About;