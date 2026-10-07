import React, { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useNavigate } from 'react-router-dom';

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=DM+Sans:wght@300;400;500;600&display=swap');

  .help-page {
    font-family: 'DM Sans', sans-serif;
    color: #1a1a2e;
    background: #fff;
  }

  /* ── Hero ── */
  .help-hero {
    background: linear-gradient(160deg, #0f0f1a 0%, #0f1a30 100%);
    padding: 120px 0 80px;
    position: relative;
    overflow: hidden;
    text-align: center;
  }

  .help-hero::before {
    content: '';
    position: absolute;
    width: 600px; height: 600px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(99,102,241,0.15), transparent);
    top: 50%; left: 50%;
    transform: translate(-50%, -50%);
  }

  .help-badge {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: rgba(99,102,241,0.15);
    border: 1px solid rgba(99,102,241,0.25);
    border-radius: 100px;
    padding: 6px 18px;
    font-size: 0.75rem;
    font-weight: 600;
    letter-spacing: 2px;
    text-transform: uppercase;
    color: #a5b4fc;
    margin-bottom: 24px;
  }

  .help-hero h1 {
    font-family: 'Playfair Display', serif;
    font-size: clamp(2.2rem, 5vw, 4rem);
    font-weight: 900;
    color: #fff;
    margin-bottom: 16px;
    line-height: 1.1;
    position: relative;
  }

  .help-hero p {
    color: rgba(255,255,255,0.55);
    font-size: 1rem;
    line-height: 1.7;
    max-width: 480px;
    margin: 0 auto 40px;
    position: relative;
  }

  /* ── Search Box ── */
  .help-search-wrap {
    position: relative;
    max-width: 520px;
    margin: 0 auto;
  }

  .help-search {
    width: 100%;
    height: 56px;
    border-radius: 100px;
    border: none;
    padding: 0 60px 0 24px;
    font-size: 0.95rem;
    font-family: 'DM Sans', sans-serif;
    background: rgba(255,255,255,0.1);
    color: #fff;
    outline: none;
    backdrop-filter: blur(8px);
    border: 1px solid rgba(255,255,255,0.15);
    transition: all 0.25s;
  }

  .help-search::placeholder { color: rgba(255,255,255,0.4); }

  .help-search:focus {
    background: rgba(255,255,255,0.15);
    border-color: rgba(255,255,255,0.3);
    box-shadow: 0 0 0 3px rgba(99,102,241,0.2);
  }

  .search-icon {
    position: absolute;
    right: 20px;
    top: 50%;
    transform: translateY(-50%);
    font-size: 1.1rem;
    pointer-events: none;
  }

  /* ── Quick Links ── */
  .quick-links {
    padding: 64px 0;
    background: #f8f9fc;
  }

  .quick-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 20px;
  }

  @media (max-width: 900px) { .quick-grid { grid-template-columns: repeat(2, 1fr); } }
  @media (max-width: 500px) { .quick-grid { grid-template-columns: 1fr; } }

  .quick-card {
    background: #fff;
    border-radius: 18px;
    padding: 28px 24px;
    text-align: center;
    border: 1px solid rgba(0,0,0,0.06);
    cursor: pointer;
    transition: all 0.3s ease;
    text-decoration: none;
    color: inherit;
    display: block;
  }

  .quick-card:hover {
    transform: translateY(-6px);
    box-shadow: 0 20px 48px rgba(0,0,0,0.1);
    border-color: rgba(232,52,28,0.15);
    color: inherit;
    text-decoration: none;
  }

  .qc-icon {
    font-size: 2rem;
    display: block;
    margin-bottom: 12px;
  }

  .qc-title {
    font-weight: 700;
    color: #1a1a2e;
    font-size: 0.95rem;
    margin-bottom: 6px;
  }

  .qc-desc {
    font-size: 0.82rem;
    color: #94a3b8;
    line-height: 1.5;
    margin: 0;
  }

  /* ── FAQ Section ── */
  .faq-section {
    padding: 100px 0;
    background: #fff;
  }

  .section-label {
    font-size: 0.75rem;
    font-weight: 700;
    letter-spacing: 3px;
    text-transform: uppercase;
    color: #6366f1;
    margin-bottom: 12px;
  }

  .section-title {
    font-family: 'Playfair Display', serif;
    font-size: clamp(1.8rem, 3.5vw, 2.8rem);
    font-weight: 700;
    color: #1a1a2e;
    margin-bottom: 12px;
  }

  /* ── FAQ Tabs ── */
  .faq-tabs {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    margin: 40px 0 32px;
  }

  .faq-tab {
    padding: 10px 20px;
    border-radius: 100px;
    border: 1.5px solid #e2e8f0;
    background: #fff;
    font-size: 0.85rem;
    font-weight: 500;
    font-family: 'DM Sans', sans-serif;
    cursor: pointer;
    color: #64748b;
    transition: all 0.2s;
  }

  .faq-tab.active {
    background: #6366f1;
    border-color: #6366f1;
    color: #fff;
    font-weight: 600;
  }

  .faq-tab:hover:not(.active) {
    border-color: #6366f1;
    color: #6366f1;
  }

  /* ── Accordion ── */
  .faq-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .faq-item {
    border: 1.5px solid #e8ecf0;
    border-radius: 16px;
    overflow: hidden;
    transition: border-color 0.25s, box-shadow 0.25s;
  }

  .faq-item.open {
    border-color: rgba(99,102,241,0.3);
    box-shadow: 0 8px 32px rgba(99,102,241,0.08);
  }

  .faq-question {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 20px 24px;
    cursor: pointer;
    background: #fff;
    gap: 16px;
    user-select: none;
  }

  .faq-question-text {
    font-weight: 600;
    color: #1a1a2e;
    font-size: 0.95rem;
    line-height: 1.4;
  }

  .faq-chevron {
    width: 28px; height: 28px;
    border-radius: 50%;
    background: #f1f5f9;
    display: flex; align-items: center; justify-content: center;
    font-size: 0.8rem;
    flex-shrink: 0;
    transition: all 0.25s;
  }

  .faq-item.open .faq-chevron {
    background: #6366f1;
    color: #fff;
    transform: rotate(180deg);
  }

  .faq-answer {
    max-height: 0;
    overflow: hidden;
    transition: max-height 0.35s cubic-bezier(0.4,0,0.2,1);
  }

  .faq-item.open .faq-answer { max-height: 300px; }

  .faq-answer-inner {
    padding: 0 24px 20px;
    font-size: 0.9rem;
    color: #64748b;
    line-height: 1.75;
    border-top: 1px solid #f1f5f9;
    padding-top: 16px;
    margin-top: 0;
  }

  /* ── Contact Cards ── */
  .contact-section {
    padding: 100px 0;
    background: linear-gradient(160deg, #fafbff 0%, #f5f0ff 100%);
  }

  .contact-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 24px;
    margin-top: 56px;
  }

  @media (max-width: 768px) { .contact-grid { grid-template-columns: 1fr; } }

  .contact-card {
    background: #fff;
    border-radius: 20px;
    padding: 36px 28px;
    text-align: center;
    border: 1px solid rgba(0,0,0,0.06);
    transition: all 0.3s;
  }

  .contact-card:hover {
    transform: translateY(-6px);
    box-shadow: 0 24px 56px rgba(0,0,0,0.1);
  }

  .cc-icon-wrap {
    width: 60px; height: 60px;
    border-radius: 18px;
    display: flex; align-items: center; justify-content: center;
    font-size: 1.5rem;
    margin: 0 auto 20px;
  }

  .contact-card h3 {
    font-family: 'Playfair Display', serif;
    font-size: 1.15rem;
    font-weight: 700;
    color: #1a1a2e;
    margin-bottom: 8px;
  }

  .contact-card p {
    font-size: 0.85rem;
    color: #94a3b8;
    line-height: 1.6;
    margin-bottom: 20px;
  }

  .contact-card a {
    display: inline-block;
    padding: 10px 24px;
    border-radius: 100px;
    font-size: 0.85rem;
    font-weight: 600;
    text-decoration: none;
    transition: all 0.25s;
  }

  /* ── Broker CTA ── */
  .broker-cta-section {
    padding: 80px 0;
    background: #0f0f1a;
    text-align: center;
    position: relative;
    overflow: hidden;
  }

  .broker-cta-section::before {
    content: '';
    position: absolute;
    width: 500px; height: 500px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(99,102,241,0.2), transparent);
    top: 50%; left: 50%;
    transform: translate(-50%, -50%);
  }

  .broker-cta-section h2 {
    font-family: 'Playfair Display', serif;
    color: #fff;
    font-size: clamp(1.8rem, 3vw, 2.5rem);
    margin-bottom: 12px;
    position: relative;
  }

  .broker-cta-section p {
    color: rgba(255,255,255,0.5);
    font-size: 1rem;
    margin-bottom: 32px;
    position: relative;
  }

  .cta-btn-indigo {
    display: inline-block;
    background: #6366f1;
    color: #fff;
    border: none;
    border-radius: 100px;
    padding: 14px 32px;
    font-size: 0.95rem;
    font-weight: 600;
    font-family: 'DM Sans', sans-serif;
    cursor: pointer;
    text-decoration: none;
    transition: all 0.25s;
    position: relative;
    margin: 4px;
  }

  .cta-btn-indigo:hover {
    background: #4f46e5;
    transform: translateY(-2px);
    box-shadow: 0 12px 32px rgba(99,102,241,0.4);
    color: #fff;
  }

  .cta-btn-ghost {
    display: inline-block;
    background: transparent;
    color: rgba(255,255,255,0.7);
    border: 1.5px solid rgba(255,255,255,0.2);
    border-radius: 100px;
    padding: 14px 32px;
    font-size: 0.95rem;
    font-weight: 600;
    font-family: 'DM Sans', sans-serif;
    cursor: pointer;
    text-decoration: none;
    transition: all 0.25s;
    position: relative;
    margin: 4px;
  }

  .cta-btn-ghost:hover {
    border-color: rgba(255,255,255,0.5);
    color: #fff;
  }
`;

const faqData = {
  'For Property Seekers': [
    {
      q: 'How do I find a broker in my area?',
      a: 'Use our homepage search to filter brokers by locality. You can filter by zone (South, Central, West, North, East/OMR/ECR) and then by specific locality. Each broker\'s profile shows their specialty areas, services offered, and verified track record.'
    },
    {
      q: 'Are all brokers on YesBroker verified?',
      a: 'Yes. Every broker undergoes a manual review process by our team before their profile goes live. We verify their identity and professional information. Brokers marked as "Active" have been approved by YesBroker admins.'
    },
    {
      q: 'Is YesBroker free for property seekers?',
      a: 'Absolutely. YesBroker is completely free for property seekers. You can browse broker profiles, view property listings, and contact brokers without any charges. Any fees for brokerage services are directly between you and your chosen broker.'
    },
    {
      q: 'Can I see a broker\'s past deals and success stories?',
      a: 'Yes! Each broker\'s profile includes a Success Stories section where they showcase completed deals, client testimonials, and proven results. This helps you evaluate a broker\'s track record before engaging them.'
    },
    {
      q: 'What types of properties can I find on YesBroker?',
      a: 'YesBroker covers Buy, Rent, Commercial properties, PG/Co-living spaces, and Plots — all across the Greater Chennai area. Use our category navigation to filter by your specific need.'
    },
  ],
  'For Brokers': [
    {
      q: 'How do I register as a broker on YesBroker?',
      a: 'Click "Register" on the homepage and complete our registration form with your name, email, mobile number, profile photo, and services offered. After OTP email verification, your account will be reviewed by our admin team. Once approved and activated, you\'ll have full access to your broker dashboard.'
    },
    {
      q: 'How long does account activation take?',
      a: 'Account activation typically takes 24-48 hours after successful OTP verification. Our admin team manually reviews each broker profile. You\'ll be able to log in but will see an "Activation Pending" screen until your account is approved.'
    },
    {
      q: 'How does OTP login work?',
      a: 'YesBroker uses passwordless authentication. When you log in, enter your registered email and we\'ll send a 6-digit OTP valid for 2 minutes. Enter the OTP to access your dashboard. This is more secure than passwords and eliminates the risk of password theft.'
    },
    {
      q: 'How do I add and manage property listings?',
      a: 'From your broker dashboard, navigate to "Add Property" to create a new listing with title, type, locality, price, description, and photos. All your listings are manageable from the "Properties" section where you can edit or delete them.'
    },
    {
      q: 'Can I update my broker profile after registration?',
      a: 'Yes! Visit the "Profile" section in your dashboard to update your bio, profile photo, service areas, languages spoken, experience years, and other professional details anytime. Your public broker page updates immediately.'
    },
    {
      q: 'Is there a fee to list on YesBroker?',
      a: 'YesBroker is currently free for brokers during our growth phase. We may introduce premium features in the future, but registered brokers will always receive advance notice before any charges apply.'
    },
  ],
  'Account & Security': [
    {
      q: 'I didn\'t receive my OTP email. What should I do?',
      a: 'First, check your Spam or Promotions folder — OTP emails sometimes land there. If it\'s not there, wait 60 seconds and click "Resend OTP" (available after the 2-minute timer expires). If you still don\'t receive it, contact support@yesbroker.com with your registered email address.'
    },
    {
      q: 'My account shows "Activation Pending" — why?',
      a: 'This means your account is awaiting manual approval from our admin team. This process takes 24-48 hours. Once approved, you\'ll gain full access to all broker features. If it\'s been longer than 48 hours, email admin@yesbroker.com.'
    },
    {
      q: 'How do I delete my YesBroker account?',
      a: 'To delete your account, email support@yesbroker.com from your registered email address with the subject "Account Deletion Request". We\'ll process your request within 7 business days and confirm when complete. Note that all listings and profile data will be permanently removed.'
    },
    {
      q: 'How do I report a fraudulent broker or listing?',
      a: 'If you encounter a suspicious broker or property listing, email report@yesbroker.com with details including the broker\'s name or profile URL, and a description of your concern. We investigate all reports within 48 hours and take appropriate action.'
    },
  ],
};

const Help = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('For Property Seekers');
  const [openFaq, setOpenFaq] = useState(null);
  const [search, setSearch] = useState('');

  const tabs = Object.keys(faqData);

  const filteredFaqs = search.trim()
    ? Object.values(faqData).flat().filter(f =>
        f.q.toLowerCase().includes(search.toLowerCase()) ||
        f.a.toLowerCase().includes(search.toLowerCase())
      )
    : faqData[activeTab];

  return (
    <>
      <style>{STYLES}</style>
      <Header />

      <div className="help-page">
        {/* Hero */}
        <section className="help-hero">
          <div className="container" style={{ position: 'relative' }}>
            <div className="help-badge">💡 Help Center</div>
            <h1>How can we help you?</h1>
            <p>
              Find answers to common questions about buying, renting, and working
              with brokers on YesBroker.
            </p>
            <div className="help-search-wrap">
              <input
                className="help-search"
                placeholder="Search for answers…"
                value={search}
                onChange={e => { setSearch(e.target.value); }}
              />
              <span className="search-icon">🔍</span>
            </div>
          </div>
        </section>

        {/* Quick Links */}
        <section className="quick-links">
          <div className="container">
            <div className="quick-grid">
              {[
                { icon: '🏠', title: 'Browse Properties', desc: 'Search Buy, Rent, Commercial & more', href: '/' },
                { icon: '👤', title: 'Find a Broker', desc: 'Explore verified broker profiles', href: '/brokers' },
                { icon: '📝', title: 'Register as Broker', desc: 'Join our professional network', href: '/register' },
                { icon: '📧', title: 'Contact Support', desc: 'Get direct help from our team', href: 'mailto:support@yesbroker.com' },
              ].map((q, i) => (
                <a
                  key={i}
                  href={q.href}
                  className="quick-card"
                  onClick={q.href.startsWith('/') ? (e) => { e.preventDefault(); navigate(q.href); } : undefined}
                >
                  <span className="qc-icon">{q.icon}</span>
                  <div className="qc-title">{q.title}</div>
                  <p className="qc-desc">{q.desc}</p>
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="faq-section">
          <div className="container">
            <div className="row">
              <div className="col-lg-5 mb-4 mb-lg-0">
                <p className="section-label">FAQ</p>
                <h2 className="section-title">Frequently Asked Questions</h2>
                <p style={{ color: '#64748b', lineHeight: 1.8, fontSize: '0.95rem' }}>
                  Can't find an answer? Reach our support team directly and we'll
                  get back to you within 24 hours.
                </p>
                <a
                  href="mailto:support@yesbroker.com"
                  style={{
                    display: 'inline-block', marginTop: 20,
                    background: '#6366f1', color: '#fff',
                    padding: '12px 28px', borderRadius: '100px',
                    fontSize: '0.9rem', fontWeight: 600,
                    textDecoration: 'none', transition: 'all 0.25s',
                  }}
                >
                  Contact Support →
                </a>
              </div>
              <div className="col-lg-7">
                {!search.trim() && (
                  <div className="faq-tabs">
                    {tabs.map(tab => (
                      <button
                        key={tab}
                        className={`faq-tab ${activeTab === tab ? 'active' : ''}`}
                        onClick={() => { setActiveTab(tab); setOpenFaq(null); }}
                      >
                        {tab}
                      </button>
                    ))}
                  </div>
                )}
                {search.trim() && (
                  <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: 20 }}>
                    Showing results for "<strong style={{ color: '#1a1a2e' }}>{search}</strong>"
                    — {filteredFaqs.length} found
                  </p>
                )}
                <div className="faq-list">
                  {filteredFaqs.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px 20px', color: '#94a3b8' }}>
                      <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>🔍</div>
                      <p style={{ margin: 0 }}>No results found. Try a different search term.</p>
                    </div>
                  ) : filteredFaqs.map((faq, i) => (
                    <div
                      key={i}
                      className={`faq-item ${openFaq === i ? 'open' : ''}`}
                    >
                      <div
                        className="faq-question"
                        onClick={() => setOpenFaq(openFaq === i ? null : i)}
                      >
                        <span className="faq-question-text">{faq.q}</span>
                        <span className="faq-chevron">▾</span>
                      </div>
                      <div className="faq-answer">
                        <div className="faq-answer-inner">{faq.a}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Methods */}
        <section className="contact-section">
          <div className="container">
            <div className="text-center">
              <p className="section-label">Get In Touch</p>
              <h2 className="section-title">Still need help?</h2>
              <p style={{ color: '#64748b', maxWidth: 480, margin: '0 auto' }}>
                Our support team is available Monday–Saturday, 9 AM to 6 PM IST.
              </p>
            </div>
            <div className="contact-grid">
              {[
                {
                  icon: '📧',
                  bg: 'linear-gradient(135deg, #fff1ee, #ffe4e0)',
                  title: 'Email Support',
                  desc: 'For general inquiries, account issues, and feedback. Response within 24 hours.',
                  link: 'mailto:support@yesbroker.com',
                  linkText: 'support@yesbroker.com',
                  btnStyle: { background: '#e8341c', color: '#fff' },
                  btnHover: '#c42d18',
                },
                {
                  icon: '🛡️',
                  bg: 'linear-gradient(135deg, #f0fdf4, #dcfce7)',
                  title: 'Admin / Activation',
                  desc: 'For broker activation delays, account verification, or admin escalations.',
                  link: 'mailto:admin@yesbroker.com',
                  linkText: 'admin@yesbroker.com',
                  btnStyle: { background: '#22c55e', color: '#fff' },
                },
                {
                  icon: '⚖️',
                  bg: 'linear-gradient(135deg, #f5f3ff, #ede9fe)',
                  title: 'Legal & Privacy',
                  desc: 'For privacy requests, data deletion, Terms inquiries, or to report abuse.',
                  link: 'mailto:legal@yesbroker.com',
                  linkText: 'legal@yesbroker.com',
                  btnStyle: { background: '#6366f1', color: '#fff' },
                },
              ].map((c, i) => (
                <div className="contact-card" key={i}>
                  <div className="cc-icon-wrap" style={{ background: c.bg }}>
                    {c.icon}
                  </div>
                  <h3>{c.title}</h3>
                  <p>{c.desc}</p>
                  <a href={c.link} style={{ ...c.btnStyle, borderRadius: '100px', padding: '10px 20px', fontSize: '0.83rem', fontWeight: 600 }}>
                    {c.linkText}
                  </a>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="broker-cta-section">
          <div className="container">
            <h2>Ready to grow your real estate business?</h2>
            <p>Join Chennai's fastest-growing broker network today.</p>
            <div>
              <a href="/register" className="cta-btn-indigo" onClick={e => { e.preventDefault(); navigate('/register'); }}>
                Register as Broker →
              </a>
              <a href="/" className="cta-btn-ghost" onClick={e => { e.preventDefault(); navigate('/'); }}>
                Browse Properties
              </a>
            </div>
          </div>
        </section>
      </div>

      <Footer />
    </>
  );
};

export default Help;