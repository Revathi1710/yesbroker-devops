import React, { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=DM+Sans:wght@300;400;500;600&display=swap');

  .terms-page {
    font-family: 'DM Sans', sans-serif;
    color: #1a1a2e;
    background: #fff;
  }

  /* ── Hero ── */
  .terms-hero {
    background: linear-gradient(160deg, #0f1a0f 0%, #0f1a2e 100%);
    padding: 140px 0 80px;
    position: relative;
    overflow: hidden;
  }

  .terms-hero::before {
    content: '';
    position: absolute;
    width: 500px; height: 500px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(34,197,94,0.12), transparent);
    top: -100px; right: -100px;
  }

  .terms-badge {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: rgba(34,197,94,0.12);
    border: 1px solid rgba(34,197,94,0.25);
    border-radius: 100px;
    padding: 6px 18px;
    font-size: 0.75rem;
    font-weight: 600;
    letter-spacing: 2px;
    text-transform: uppercase;
    color: #4ade80;
    margin-bottom: 24px;
  }

  .terms-hero h1 {
    font-family: 'Playfair Display', serif;
    font-size: clamp(2.2rem, 5vw, 4rem);
    font-weight: 900;
    color: #fff;
    margin-bottom: 16px;
    line-height: 1.1;
  }

  .terms-hero p {
    color: rgba(255,255,255,0.55);
    font-size: 1rem;
    line-height: 1.7;
    max-width: 520px;
  }

  .terms-meta {
    display: flex;
    gap: 28px;
    margin-top: 36px;
    flex-wrap: wrap;
  }

  .terms-meta-item {
    display: flex;
    align-items: center;
    gap: 8px;
    color: rgba(255,255,255,0.4);
    font-size: 0.82rem;
  }

  /* ── Layout ── */
  .terms-body {
    display: grid;
    grid-template-columns: 260px 1fr;
    gap: 0;
    max-width: 1100px;
    margin: 0 auto;
    padding: 60px 24px 80px;
    align-items: start;
  }

  @media (max-width: 900px) {
    .terms-body { grid-template-columns: 1fr; }
    .terms-sidebar { display: none; }
  }

  /* ── Sidebar ── */
  .terms-sidebar {
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

  .terms-sidebar-nav a {
    display: block;
    padding: 8px 12px;
    border-radius: 8px;
    font-size: 0.85rem;
    color: #64748b;
    text-decoration: none;
    border-left: 2px solid transparent;
    margin-bottom: 4px;
    transition: all 0.2s ease;
  }

  .terms-sidebar-nav a:hover,
  .terms-sidebar-nav a.active {
    background: rgba(34,197,94,0.07);
    border-left-color: #22c55e;
    color: #16a34a;
    font-weight: 500;
  }

  /* ── Content ── */
  .terms-content {
    min-width: 0;
  }

  .terms-section {
    margin-bottom: 56px;
    scroll-margin-top: 100px;
  }

  .ts-number {
    font-size: 0.72rem;
    font-weight: 700;
    letter-spacing: 2px;
    text-transform: uppercase;
    color: #22c55e;
    margin-bottom: 10px;
  }

  .terms-section h2 {
    font-family: 'Playfair Display', serif;
    font-size: 1.6rem;
    font-weight: 700;
    color: #1a1a2e;
    margin-bottom: 16px;
    line-height: 1.3;
  }

  .terms-section p {
    font-size: 0.95rem;
    color: #475569;
    line-height: 1.85;
    margin-bottom: 14px;
  }

  .terms-section ul {
    margin: 0 0 16px;
    padding-left: 0;
    list-style: none;
  }

  .terms-section ul li {
    font-size: 0.93rem;
    color: #475569;
    line-height: 1.7;
    padding: 6px 0 6px 24px;
    position: relative;
  }

  .terms-section ul li::before {
    content: '→';
    position: absolute;
    left: 0;
    color: #22c55e;
    font-weight: 600;
  }

  .terms-divider {
    height: 1px;
    background: linear-gradient(90deg, #22c55e22, transparent);
    margin-bottom: 56px;
  }

  .terms-highlight-box {
    background: #f0fdf4;
    border: 1px solid #bbf7d0;
    border-left: 4px solid #22c55e;
    border-radius: 12px;
    padding: 20px 24px;
    margin: 20px 0;
  }

  .terms-highlight-box p {
    margin: 0;
    color: #14532d !important;
    font-weight: 500;
  }

  .terms-warning-box {
    background: #fff1ee;
    border: 1px solid #fbd0c9;
    border-left: 4px solid #e8341c;
    border-radius: 12px;
    padding: 20px 24px;
    margin: 20px 0;
  }

  .terms-warning-box p {
    margin: 0;
    color: #7c2d12 !important;
    font-weight: 500;
  }

  /* ── Agreement Banner ── */
  .agreement-banner {
    background: linear-gradient(135deg, #0f1a0f, #0f1a2e);
    border-radius: 20px;
    padding: 36px;
    margin-bottom: 48px;
    display: flex;
    align-items: center;
    gap: 24px;
  }

  @media (max-width: 600px) {
    .agreement-banner { flex-direction: column; text-align: center; }
  }

  .ab-icon {
    font-size: 2.5rem;
    flex-shrink: 0;
  }

  .ab-title {
    font-family: 'Playfair Display', serif;
    color: #fff;
    font-size: 1.2rem;
    margin-bottom: 4px;
  }

  .ab-desc {
    color: rgba(255,255,255,0.5);
    font-size: 0.85rem;
    line-height: 1.6;
    margin: 0;
  }

  /* ── Contact Box ── */
  .terms-contact-box {
    background: linear-gradient(135deg, #0f1a0f, #0f1a2e);
    border-radius: 20px;
    padding: 36px;
    margin-top: 48px;
    text-align: center;
  }

  .terms-contact-box h3 {
    font-family: 'Playfair Display', serif;
    color: #fff;
    font-size: 1.4rem;
    margin-bottom: 10px;
  }

  .terms-contact-box p {
    color: rgba(255,255,255,0.5) !important;
    font-size: 0.9rem;
    margin-bottom: 20px;
  }

  .terms-contact-box a {
    display: inline-block;
    background: #22c55e;
    color: #fff;
    text-decoration: none;
    padding: 12px 28px;
    border-radius: 100px;
    font-weight: 600;
    font-size: 0.9rem;
    transition: all 0.25s;
    margin: 4px;
  }

  .terms-contact-box a:hover {
    background: #16a34a;
    transform: translateY(-2px);
    color: #fff;
  }
`;

const sections = [
  { id: 'acceptance', label: 'Acceptance of Terms', num: '01' },
  { id: 'platform', label: 'Platform Description', num: '02' },
  { id: 'broker-obligations', label: 'Broker Obligations', num: '03' },
  { id: 'user-conduct', label: 'User Conduct', num: '04' },
  { id: 'listings', label: 'Property Listings', num: '05' },
  { id: 'intellectual-property', label: 'Intellectual Property', num: '06' },
  { id: 'limitation', label: 'Limitation of Liability', num: '07' },
  { id: 'termination', label: 'Account Termination', num: '08' },
  { id: 'governing-law', label: 'Governing Law', num: '09' },
  { id: 'contact', label: 'Contact', num: '10' },
];

const Terms = () => {
  const [activeSection, setActiveSection] = useState('acceptance');

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) { el.scrollIntoView({ behavior: 'smooth' }); setActiveSection(id); }
  };

  return (
    <>
      <style>{STYLES}</style>
      <Header />

      <div className="terms-page">
        {/* Hero */}
        <section className="terms-hero">
          <div className="container">
            <div className="terms-badge">⚖️ Legal</div>
            <h1>Terms & Conditions</h1>
            <p>
              Please read these terms carefully before using YesBroker. By accessing
              our platform, you agree to be bound by these conditions.
            </p>
            <div className="terms-meta">
              <div className="terms-meta-item">
                <span>📅</span>
                <span>Effective: January 1, 2025</span>
              </div>
              <div className="terms-meta-item">
                <span>🔄</span>
                <span>Last Updated: May 6, 2026</span>
              </div>
              <div className="terms-meta-item">
                <span>⚖️</span>
                <span>Jurisdiction: Chennai, Tamil Nadu</span>
              </div>
            </div>
          </div>
        </section>

        {/* Body */}
        <div className="terms-body">
          {/* Sidebar */}
          <aside className="terms-sidebar">
            <div className="sidebar-title">Contents</div>
            <nav className="terms-sidebar-nav">
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
          <main className="terms-content">

            <div className="agreement-banner">
              <div className="ab-icon">📋</div>
              <div>
                <div className="ab-title">Legal Agreement</div>
                <p className="ab-desc">
                  These Terms constitute a legally binding agreement between you and
                  Kariyamangalam Technologies Pvt Ltd ("we", "us", "YesBroker"). By using
                  our platform, you agree to all terms below.
                </p>
              </div>
            </div>

            <div id="acceptance" className="terms-section">
              <div className="ts-number">01 — Acceptance</div>
              <h2>Acceptance of Terms</h2>
              <p>
                By accessing or using YesBroker (yesbrokerfinal.onrender.com or any
                associated mobile application), you confirm that you:
              </p>
              <ul>
                <li>Are at least 18 years of age or a legally incorporated business entity</li>
                <li>Have the authority to enter into a binding legal agreement</li>
                <li>Have read, understood, and agree to these Terms and our Privacy Policy</li>
                <li>Will comply with all applicable Indian laws and regulations</li>
              </ul>
              <div className="terms-warning-box">
                <p>⚠️ If you do not agree to these Terms, you must immediately cease using the YesBroker platform.</p>
              </div>
            </div>
            <div className="terms-divider" />

            <div id="platform" className="terms-section">
              <div className="ts-number">02 — Platform</div>
              <h2>Platform Description</h2>
              <p>
                YesBroker is a digital marketplace operated by Kariyamangalam Technologies
                Pvt Ltd that connects property seekers with verified real estate brokers in
                Chennai, Tamil Nadu. We provide:
              </p>
              <ul>
                <li>A directory of verified broker profiles with professional information</li>
                <li>Property listing management tools for registered brokers</li>
                <li>Search and filter functionality for property seekers</li>
                <li>Secure OTP-based authentication for broker accounts</li>
                <li>Success story and portfolio showcasing for brokers</li>
              </ul>
              <p>
                YesBroker is a marketplace only. We do not act as a real estate agent, 
                broker, or party to any property transaction. All transactions are solely
                between brokers and their clients.
              </p>
            </div>
            <div className="terms-divider" />

            <div id="broker-obligations" className="terms-section">
              <div className="ts-number">03 — Broker Obligations</div>
              <h2>Broker Obligations & Representations</h2>
              <p>As a registered broker on YesBroker, you represent and warrant that:</p>
              <ul>
                <li>All information in your profile is accurate, current, and complete</li>
                <li>You hold all required licenses, registrations, or approvals to practice real estate brokerage in your area</li>
                <li>You will not misrepresent your qualifications, experience, or credentials</li>
                <li>You are solely responsible for all client interactions and transactions</li>
                <li>You will not engage in discriminatory practices in violation of Indian law</li>
                <li>You will promptly update your profile if any information becomes inaccurate</li>
                <li>You grant YesBroker a non-exclusive license to display your profile and listings</li>
              </ul>
              <div className="terms-highlight-box">
                <p>✅ YesBroker reserves the right to suspend or remove any broker account that violates these obligations without prior notice.</p>
              </div>
            </div>
            <div className="terms-divider" />

            <div id="user-conduct" className="terms-section">
              <div className="ts-number">04 — User Conduct</div>
              <h2>Prohibited User Conduct</h2>
              <p>You agree not to use YesBroker to:</p>
              <ul>
                <li>Post false, misleading, or fraudulent property listings or broker information</li>
                <li>Scrape, harvest, or extract data from the platform without written permission</li>
                <li>Circumvent, disable, or interfere with platform security features</li>
                <li>Use automated bots, crawlers, or scripts without prior consent</li>
                <li>Impersonate another broker, user, or YesBroker employee</li>
                <li>Upload content that is defamatory, obscene, or violates third-party rights</li>
                <li>Attempt to gain unauthorized access to other user accounts or our systems</li>
                <li>Use the platform for any purpose that violates applicable Indian law</li>
              </ul>
            </div>
            <div className="terms-divider" />

            <div id="listings" className="terms-section">
              <div className="ts-number">05 — Property Listings</div>
              <h2>Property Listings Policy</h2>
              <p>For all property listings submitted by brokers:</p>
              <ul>
                <li>Listings must accurately represent the property's location, price, size, and condition</li>
                <li>Photographs must be genuine images of the actual property being listed</li>
                <li>Prices must be realistic and reflect current market conditions</li>
                <li>Brokers must have authorization from property owners to list their properties</li>
                <li>Duplicate or spam listings may be removed without notice</li>
                <li>YesBroker does not verify property ownership or legal title</li>
              </ul>
              <div className="terms-warning-box">
                <p>⚠️ YesBroker accepts no liability for losses arising from inaccurate property listings. Seekers must independently verify all property details.</p>
              </div>
            </div>
            <div className="terms-divider" />

            <div id="intellectual-property" className="terms-section">
              <div className="ts-number">06 — Intellectual Property</div>
              <h2>Intellectual Property Rights</h2>
              <p>
                The YesBroker platform, including its design, features, logos, and code,
                is owned by Kariyamangalam Technologies Pvt Ltd and is protected by
                applicable intellectual property laws.
              </p>
              <ul>
                <li>You may not copy, reproduce, or create derivative works from our platform</li>
                <li>The "YesBroker" name, logo, and branding are registered trademarks</li>
                <li>Content you upload (photos, descriptions) remains your property; you grant us a license to display it</li>
                <li>You may not use our trademarks without prior written permission</li>
              </ul>
            </div>
            <div className="terms-divider" />

            <div id="limitation" className="terms-section">
              <div className="ts-number">07 — Limitation of Liability</div>
              <h2>Limitation of Liability</h2>
              <p>
                To the maximum extent permitted by Indian law, Kariyamangalam Technologies
                Pvt Ltd shall not be liable for:
              </p>
              <ul>
                <li>Any direct, indirect, incidental, or consequential damages arising from platform use</li>
                <li>Losses resulting from transactions between brokers and property seekers</li>
                <li>Inaccurate broker profiles or property listings submitted by third parties</li>
                <li>Platform downtime, data loss, or service interruptions</li>
                <li>Actions or omissions of brokers registered on the platform</li>
              </ul>
              <p>
                Our total aggregate liability shall not exceed the fees paid by you to 
                YesBroker in the 12 months preceding the claim.
              </p>
            </div>
            <div className="terms-divider" />

            <div id="termination" className="terms-section">
              <div className="ts-number">08 — Account Termination</div>
              <h2>Account Suspension & Termination</h2>
              <p>YesBroker reserves the right to suspend or permanently terminate accounts that:</p>
              <ul>
                <li>Violate any provision of these Terms</li>
                <li>Engage in fraudulent or misleading conduct</li>
                <li>Receive repeated complaints from property seekers</li>
                <li>Remain inactive for more than 24 months</li>
                <li>Are involved in illegal activities</li>
              </ul>
              <p>
                You may close your account at any time by contacting support@yesbroker.com.
                Upon closure, your public profile will be removed, though we may retain
                data as required by law.
              </p>
            </div>
            <div className="terms-divider" />

            <div id="governing-law" className="terms-section">
              <div className="ts-number">09 — Governing Law</div>
              <h2>Governing Law & Dispute Resolution</h2>
              <p>
                These Terms are governed by and construed in accordance with the laws of
                India. Any disputes arising from or related to these Terms or your use
                of YesBroker shall be subject to:
              </p>
              <ul>
                <li>First, good-faith negotiation between the parties</li>
                <li>If unresolved within 30 days, mediation by a mutually agreed mediator</li>
                <li>If still unresolved, the exclusive jurisdiction of courts in Chennai, Tamil Nadu, India</li>
              </ul>
            </div>
            <div className="terms-divider" />

            <div id="contact" className="terms-section">
              <div className="ts-number">10 — Contact</div>
              <h2>Legal Inquiries</h2>
              <p>For any questions regarding these Terms or to report a violation:</p>
              <div className="terms-contact-box">
                <h3>Legal Department</h3>
                <p>Kariyamangalam Technologies Pvt Ltd · Chennai, Tamil Nadu, India</p>
                <a href="mailto:legal@yesbroker.com">⚖️ legal@yesbroker.com</a>
                <a href="mailto:support@yesbroker.com">💬 support@yesbroker.com</a>
              </div>
            </div>

          </main>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default Terms;