import React, { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=DM+Sans:wght@300;400;500;600&display=swap');

  .policy-page {
    font-family: 'DM Sans', sans-serif;
    color: #1a1a2e;
    background: #fff;
  }

  /* ── Hero ── */
  .policy-hero {
    background: linear-gradient(160deg, #0f0f1a 0%, #1a1040 100%);
    padding: 140px 0 80px;
    position: relative;
    overflow: hidden;
  }

  .policy-hero::before {
    content: '';
    position: absolute;
    width: 500px; height: 500px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(232,52,28,0.15), transparent);
    top: -100px; right: -100px;
  }

  .policy-badge {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: rgba(232,52,28,0.15);
    border: 1px solid rgba(232,52,28,0.25);
    border-radius: 100px;
    padding: 6px 18px;
    font-size: 0.75rem;
    font-weight: 600;
    letter-spacing: 2px;
    text-transform: uppercase;
    color: #ff6b4a;
    margin-bottom: 24px;
  }

  .policy-hero h1 {
    font-family: 'Playfair Display', serif;
    font-size: clamp(2.2rem, 5vw, 4rem);
    font-weight: 900;
    color: #fff;
    margin-bottom: 16px;
    line-height: 1.1;
  }

  .policy-hero p {
    color: rgba(255,255,255,0.55);
    font-size: 1rem;
    line-height: 1.7;
    max-width: 520px;
  }

  .policy-meta {
    display: flex;
    gap: 28px;
    margin-top: 36px;
    flex-wrap: wrap;
  }

  .policy-meta-item {
    display: flex;
    align-items: center;
    gap: 8px;
    color: rgba(255,255,255,0.4);
    font-size: 0.82rem;
  }

  .policy-meta-item span:first-child {
    font-size: 1rem;
  }

  /* ── Layout ── */
  .policy-body {
    display: grid;
    grid-template-columns: 260px 1fr;
    gap: 0;
    max-width: 1100px;
    margin: 0 auto;
    padding: 60px 24px 80px;
    align-items: start;
  }

  @media (max-width: 900px) {
    .policy-body { grid-template-columns: 1fr; }
    .policy-sidebar { display: none; }
  }

  /* ── Sidebar ── */
  .policy-sidebar {
    position: sticky;
    top: 100px;
    padding-right: 40px;
  }

  .sidebar-title {
    font-size: 0.72rem;
    font-weight: 700;
    letter-spacing: 2.5px;
    text-transform: uppercase;
    color: #94a3b8;
    margin-bottom: 16px;
  }

  .sidebar-nav a {
    display: block;
    padding: 8px 12px;
    border-radius: 8px;
    font-size: 0.85rem;
    color: #64748b;
    text-decoration: none;
    border-left: 2px solid transparent;
    margin-bottom: 4px;
    transition: all 0.2s ease;
    font-weight: 400;
  }

  .sidebar-nav a:hover,
  .sidebar-nav a.active {
    background: rgba(232,52,28,0.06);
    border-left-color: #e8341c;
    color: #e8341c;
    font-weight: 500;
  }

  /* ── Content ── */
  .policy-content {
    min-width: 0;
  }

  .policy-section {
    margin-bottom: 56px;
    scroll-margin-top: 100px;
  }

  .ps-number {
    font-size: 0.72rem;
    font-weight: 700;
    letter-spacing: 2px;
    text-transform: uppercase;
    color: #e8341c;
    margin-bottom: 10px;
  }

  .policy-section h2 {
    font-family: 'Playfair Display', serif;
    font-size: 1.6rem;
    font-weight: 700;
    color: #1a1a2e;
    margin-bottom: 16px;
    line-height: 1.3;
  }

  .policy-section p {
    font-size: 0.95rem;
    color: #475569;
    line-height: 1.85;
    margin-bottom: 14px;
  }

  .policy-section ul {
    margin: 0 0 16px;
    padding-left: 0;
    list-style: none;
  }

  .policy-section ul li {
    font-size: 0.93rem;
    color: #475569;
    line-height: 1.7;
    padding: 6px 0 6px 24px;
    position: relative;
  }

  .policy-section ul li::before {
    content: '→';
    position: absolute;
    left: 0;
    color: #e8341c;
    font-weight: 600;
  }

  .policy-divider {
    height: 1px;
    background: linear-gradient(90deg, #e8341c22, transparent);
    margin-bottom: 56px;
  }

  .policy-highlight-box {
    background: linear-gradient(135deg, #fff1ee, #fff8f6);
    border: 1px solid #fbd0c9;
    border-left: 4px solid #e8341c;
    border-radius: 12px;
    padding: 20px 24px;
    margin: 20px 0;
  }

  .policy-highlight-box p {
    margin: 0;
    color: #7c2d12 !important;
    font-weight: 500;
  }

  /* ── Contact Box ── */
  .contact-box {
    background: linear-gradient(135deg, #0f0f1a, #1e1040);
    border-radius: 20px;
    padding: 36px;
    margin-top: 48px;
    text-align: center;
  }

  .contact-box h3 {
    font-family: 'Playfair Display', serif;
    color: #fff;
    font-size: 1.4rem;
    margin-bottom: 10px;
  }

  .contact-box p {
    color: rgba(255,255,255,0.5) !important;
    font-size: 0.9rem;
    margin-bottom: 20px;
  }

  .contact-box a {
    display: inline-block;
    background: #e8341c;
    color: #fff;
    text-decoration: none;
    padding: 12px 28px;
    border-radius: 100px;
    font-weight: 600;
    font-size: 0.9rem;
    transition: all 0.25s;
  }

  .contact-box a:hover {
    background: #c42d18;
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(232,52,28,0.35);
    color: #fff;
  }
`;

const sections = [
  { id: 'information', label: 'Information We Collect', num: '01' },
  { id: 'usage', label: 'How We Use Information', num: '02' },
  { id: 'sharing', label: 'Information Sharing', num: '03' },
  { id: 'cookies', label: 'Cookies & Tracking', num: '04' },
  { id: 'security', label: 'Data Security', num: '05' },
  { id: 'rights', label: 'Your Rights', num: '06' },
  { id: 'retention', label: 'Data Retention', num: '07' },
  { id: 'changes', label: 'Policy Changes', num: '08' },
  { id: 'contact', label: 'Contact Us', num: '09' },
];

const PrivacyPolicy = () => {
  const [activeSection, setActiveSection] = useState('information');

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) { el.scrollIntoView({ behavior: 'smooth' }); setActiveSection(id); }
  };

  return (
    <>
      <style>{STYLES}</style>
      <Header />

      <div className="policy-page">
        {/* Hero */}
        <section className="policy-hero">
          <div className="container">
            <div className="policy-badge">🔒 Legal</div>
            <h1>Privacy Policy</h1>
            <p>
              At YesBroker, your privacy is fundamental. This policy explains how we
              collect, use, and protect your personal information on our platform.
            </p>
            <div className="policy-meta">
              <div className="policy-meta-item">
                <span>📅</span>
                <span>Effective: January 1, 2025</span>
              </div>
              <div className="policy-meta-item">
                <span>🔄</span>
                <span>Last Updated: May 6, 2026</span>
              </div>
              <div className="policy-meta-item">
                <span>🏢</span>
                <span>Kariyamangalam Technologies Pvt Ltd</span>
              </div>
            </div>
          </div>
        </section>

        {/* Body */}
        <div className="policy-body">
          {/* Sidebar */}
          <aside className="policy-sidebar">
            <div className="sidebar-title">Contents</div>
            <nav className="sidebar-nav">
              {sections.map(s => (
                <a
                  key={s.id}
                  href={`#${s.id}`}
                  className={activeSection === s.id ? 'active' : ''}
                  onClick={e => { e.preventDefault(); scrollTo(s.id); }}
                >
                  {s.num}. {s.label}
                </a>
              ))}
            </nav>
          </aside>

          {/* Content */}
          <main className="policy-content">

            <div id="information" className="policy-section">
              <div className="ps-number">01 — Information We Collect</div>
              <h2>What Information We Collect</h2>
              <p>We collect information you provide directly and data generated through your use of YesBroker:</p>
              <ul>
                <li>Account details: name, email address, mobile number, and profile photo (for brokers)</li>
                <li>Professional information: service offerings, experience, localities covered, languages spoken</li>
                <li>Property listings: title, type, location, price, description, and uploaded images</li>
                <li>Communication data: messages between brokers and clients through our platform</li>
                <li>Usage data: pages visited, search queries, filters applied, and session duration</li>
                <li>Device information: IP address, browser type, operating system, and device identifiers</li>
              </ul>
              <div className="policy-highlight-box">
                <p>🔐 We never collect or store payment card information. All transactions are processed through PCI-compliant third-party providers.</p>
              </div>
            </div>
            <div className="policy-divider" />

            <div id="usage" className="policy-section">
              <div className="ps-number">02 — How We Use Information</div>
              <h2>How We Use Your Information</h2>
              <p>Your information enables us to deliver and improve YesBroker's services:</p>
              <ul>
                <li>Creating and managing your broker or seeker account</li>
                <li>Sending OTP authentication codes for secure login and registration</li>
                <li>Verifying broker identity and approving profiles before publication</li>
                <li>Displaying property listings and broker profiles to relevant seekers</li>
                <li>Sending service updates, notifications, and promotional emails (opt-out available)</li>
                <li>Analyzing usage patterns to improve platform features and performance</li>
                <li>Preventing fraud, abuse, and unauthorized access to accounts</li>
                <li>Complying with legal obligations and resolving disputes</li>
              </ul>
            </div>
            <div className="policy-divider" />

            <div id="sharing" className="policy-section">
              <div className="ps-number">03 — Information Sharing</div>
              <h2>How We Share Information</h2>
              <p>We do not sell your personal information. We share data only in limited circumstances:</p>
              <ul>
                <li><strong>Broker Profiles:</strong> Verified broker information is publicly visible to help seekers make informed decisions</li>
                <li><strong>Service Providers:</strong> Trusted third parties (Cloudinary for images, Resend for email, MongoDB Atlas for data storage) under strict data processing agreements</li>
                <li><strong>Legal Requirements:</strong> When required by Indian law, court order, or government authority</li>
                <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets (users will be notified)</li>
                <li><strong>Consent:</strong> Any other sharing is done only with your explicit consent</li>
              </ul>
            </div>
            <div className="policy-divider" />

            <div id="cookies" className="policy-section">
              <div className="ps-number">04 — Cookies & Tracking</div>
              <h2>Cookies & Tracking Technologies</h2>
              <p>We use cookies and similar technologies to maintain your session and improve your experience:</p>
              <ul>
                <li><strong>Essential Cookies:</strong> JWT authentication tokens stored as HttpOnly cookies for secure broker sessions</li>
                <li><strong>Analytics:</strong> Anonymized usage data to understand how visitors interact with our platform</li>
                <li><strong>Preference Cookies:</strong> Remembering your search filters and location preferences</li>
              </ul>
              <p>You can control cookies through your browser settings. Disabling essential cookies will affect your ability to log in as a broker.</p>
            </div>
            <div className="policy-divider" />

            <div id="security" className="policy-section">
              <div className="ps-number">05 — Data Security</div>
              <h2>How We Protect Your Data</h2>
              <p>YesBroker employs multiple layers of security to protect your information:</p>
              <ul>
                <li>HttpOnly, Secure, SameSite JWT cookies prevent XSS and CSRF attacks</li>
                <li>OTP-based authentication with 2-minute expiry and rate limiting (3 per 10 minutes)</li>
                <li>All data transmitted over HTTPS with TLS encryption</li>
                <li>Profile images stored on Cloudinary with secure access URLs</li>
                <li>MongoDB Atlas with network access restrictions and authentication</li>
                <li>Regular security reviews and dependency audits</li>
              </ul>
              <div className="policy-highlight-box">
                <p>⚠️ No system is 100% secure. If you suspect unauthorized access to your account, contact us immediately at privacy@yesbroker.com</p>
              </div>
            </div>
            <div className="policy-divider" />

            <div id="rights" className="policy-section">
              <div className="ps-number">06 — Your Rights</div>
              <h2>Your Privacy Rights</h2>
              <p>Under applicable Indian data protection laws, you have the right to:</p>
              <ul>
                <li>Access the personal information we hold about you</li>
                <li>Correct inaccurate or incomplete information in your profile</li>
                <li>Request deletion of your account and associated data</li>
                <li>Withdraw consent for marketing communications at any time</li>
                <li>Request a portable copy of your data in a machine-readable format</li>
                <li>Lodge a complaint with the relevant data protection authority</li>
              </ul>
              <p>To exercise these rights, contact us at privacy@yesbroker.com. We will respond within 30 days.</p>
            </div>
            <div className="policy-divider" />

            <div id="retention" className="policy-section">
              <div className="ps-number">07 — Data Retention</div>
              <h2>How Long We Keep Your Data</h2>
              <p>We retain your information for as long as necessary to provide our services:</p>
              <ul>
                <li>Active broker accounts: retained for the duration of the account plus 2 years after closure</li>
                <li>Property listings: retained for 1 year after expiry or deletion</li>
                <li>OTP records: deleted immediately after verification or expiry (2-minute TTL)</li>
                <li>Log data: retained for 90 days for security purposes</li>
                <li>Legal hold: data may be retained longer if required for legal proceedings</li>
              </ul>
            </div>
            <div className="policy-divider" />

            <div id="changes" className="policy-section">
              <div className="ps-number">08 — Policy Changes</div>
              <h2>Changes to This Policy</h2>
              <p>
                We may update this Privacy Policy periodically to reflect changes in our practices, 
                technology, or legal requirements. When we make material changes, we will:
              </p>
              <ul>
                <li>Update the "Last Updated" date at the top of this page</li>
                <li>Send an email notification to all registered broker accounts</li>
                <li>Display a prominent notice on the YesBroker platform for 30 days</li>
              </ul>
              <p>Continued use of YesBroker after changes constitutes acceptance of the updated policy.</p>
            </div>
            <div className="policy-divider" />

            <div id="contact" className="policy-section">
              <div className="ps-number">09 — Contact Us</div>
              <h2>Questions About Privacy?</h2>
              <p>
                Kariyamangalam Technologies Pvt Ltd is the data controller for YesBroker. 
                For any privacy-related inquiries, contact our Data Protection Officer:
              </p>
              <div className="contact-box">
                <h3>Data Protection Officer</h3>
                <p>Kariyamangalam Technologies Pvt Ltd · Chennai, Tamil Nadu, India</p>
                <a href="mailto:privacy@yesbroker.com">📧 privacy@yesbroker.com</a>
              </div>
            </div>

          </main>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default PrivacyPolicy;