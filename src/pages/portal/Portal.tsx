import { useState } from 'react';
import { Link } from 'react-router-dom';
import logoIcon from '../../assets/logo-icon.png';
import './Portal.css';

type ViewId = 'dashboard' | 'tracker' | 'documents' | 'messages' | 'settings';

const NAV: { id: ViewId; icon: string; label: string; badge?: number }[] = [
  { id: 'dashboard', icon: '◆', label: 'Dashboard' },
  { id: 'tracker', icon: '◈', label: 'Application Tracker' },
  { id: 'documents', icon: '▤', label: 'Documents', badge: 1 },
  { id: 'messages', icon: '✉', label: 'Messages', badge: 2 },
  { id: 'settings', icon: '⚙', label: 'Account Settings' },
];

const INITIAL_MESSAGES = [
  { from: 'team' as const, text: "Hi Praise, we've reviewed your transcript and SOP — both look great. We just need your bank statement to move your visa file forward." },
  { from: 'client' as const, text: "Thank you! I'll upload it today." },
  { from: 'team' as const, text: 'Perfect, once that\'s in we can move to submission. You\'re doing great so far!' },
];

export default function Portal() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [activeView, setActiveView] = useState<ViewId>('dashboard');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loginTab, setLoginTab] = useState<'login' | 'register'>('login');
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [msgInput, setMsgInput] = useState('');
  const [toggles, setToggles] = useState({ email: true, sms: false, newMsg: true });

  const sendMessage = () => {
    if (!msgInput.trim()) return;
    setMessages((m) => [...m, { from: 'client', text: msgInput }]);
    setMsgInput('');
  };

  if (!loggedIn) {
    return (
      <div className="portal-root">
        <div id="loginScreen">
          <div className="login-card">
            <div className="brand"><img src={logoIcon} alt="Oma Synergies" /><span>CLIENT PORTAL</span></div>
            <div className="login-tabs">
              <div className={loginTab === 'login' ? 'login-tab active' : 'login-tab'} onClick={() => setLoginTab('login')}>Log In</div>
              <div className={loginTab === 'register' ? 'login-tab active' : 'login-tab'} onClick={() => setLoginTab('register')}>Register</div>
            </div>
            <h2>Welcome back</h2>
            <div className="sub">Track your application anytime, anywhere</div>
            <div className="form-row"><label>Email</label><input type="email" placeholder="you@example.com" /></div>
            <div className="form-row"><label>Password</label><input type="password" placeholder="••••••••" /></div>
            <button className="login-btn" onClick={() => setLoggedIn(true)}>Log In</button>
            <div className="login-note">Demo only — click Log In to preview the portal as a sample client.</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="portal-root">
      <div className="demo-banner"><strong>PROTOTYPE</strong> — visual design only, using a fictional demo client. Not yet connected to a real backend or real client data.</div>

      {mobileOpen && <div className="sidebar-overlay open" onClick={() => setMobileOpen(false)} />}

      <div className="mobile-topbar">
        <div className="brand"><img src={logoIcon} alt="Oma Synergies" style={{ height: 26 }} /><span style={{ fontFamily: 'var(--display)', fontWeight: 700, fontSize: 13 }}>PORTAL</span></div>
        <button className="hamburger" onClick={() => setMobileOpen(true)}>☰</button>
      </div>

      <div className="app">
        <aside className={mobileOpen ? 'sidebar mobile-open' : 'sidebar'}>
          <div className="brand"><img src={logoIcon} alt="Oma Synergies" /><span>CLIENT PORTAL</span></div>
          <div className="client-chip">
            <div className="avatar">P.A.</div>
            <div><div className="name">Praise Adebayo</div><div className="email">Demo Client Account</div></div>
          </div>
          {NAV.map((item) => (
            <a
              key={item.id}
              className={activeView === item.id ? 'nav-item active' : 'nav-item'}
              onClick={() => { setActiveView(item.id); setMobileOpen(false); }}
              style={{ cursor: 'pointer' }}
            >
              <span className="ic">{item.icon}</span> {item.label}
              {item.badge && <span className="nav-badge">{item.badge}</span>}
            </a>
          ))}
          <div className="logout-item">
            <Link className="nav-item" to="/"><span className="ic">←</span> Back to Website</Link>
          </div>
        </aside>

        <main className="main">
          {activeView === 'dashboard' && (
            <div className="view active">
              <div className="welcome-card">
                <h2>Welcome back, Praise</h2>
                <p>Here's where things stand with your Canada study application. Everything is tracked in real time — no need to email us for an update.</p>
              </div>
              <div className="stat-cards">
                <div className="stat-card"><div className="n">2</div><div className="l">Active Tracks</div></div>
                <div className="stat-card"><div className="n">3</div><div className="l">Documents Approved</div></div>
                <div className="stat-card"><div className="n">1</div><div className="l">Document Needed</div></div>
                <div className="stat-card"><div className="n">2</div><div className="l">New Messages</div></div>
              </div>
              <div className="panel">
                <div className="panel-head"><h3>Quick Summary</h3></div>
                <div className="panel-body">
                  <div className="step-list">
                    <div className="step-item"><div className="step-icon done">✓</div><div><h5>Admission — Consultation & Profile Evaluation</h5><p>Completed on your first call with our team.</p></div><span className="step-tag done">Done</span></div>
                    <div className="step-item"><div className="step-icon active">●</div><div><h5>Visa — Document Review</h5><p>Our team is currently reviewing your submitted documents.</p></div><span className="step-tag active">In Progress</span></div>
                    <div className="step-item"><div className="step-icon pending">○</div><div><h5>Visa — Application Submission</h5><p>Will begin once document review is complete.</p></div><span className="step-tag pending">Pending</span></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeView === 'tracker' && (
            <div className="view active">
              <div className="topbar">
                <div className="page-title">Application Tracker</div>
                <div className="page-sub">Real-time status across every part of your journey</div>
              </div>
              <div className="panel">
                <div className="panel-body">
                  <div className="track-block">
                    <div className="track-block-head"><h4>🎓 Admission — Canada, University Canada West</h4><span className="step-tag done">100% Complete</span></div>
                    <div className="track-progress-bar"><div className="track-progress-fill" style={{ width: '100%' }} /></div>
                    <div className="step-list">
                      <div className="step-item"><div className="step-icon done">✓</div><div><h5>Consultation & Profile Evaluation</h5><p>Goals and budget assessed, schools matched.</p></div><span className="step-tag done">Done</span></div>
                      <div className="step-item"><div className="step-icon done">✓</div><div><h5>School Admission & Document Prep</h5><p>SOP and CV completed, application submitted.</p></div><span className="step-tag done">Done</span></div>
                      <div className="step-item"><div className="step-icon done">✓</div><div><h5>Offer Letter Received</h5><p>Admitted to your program — congratulations!</p></div><span className="step-tag done">Done</span></div>
                    </div>
                  </div>

                  <div className="track-block">
                    <div className="track-block-head"><h4>🛂 Visa — Canada Study Permit</h4><span className="step-tag active">50% Complete</span></div>
                    <div className="track-progress-bar"><div className="track-progress-fill" style={{ width: '50%' }} /></div>
                    <div className="step-list">
                      <div className="step-item"><div className="step-icon done">✓</div><div><h5>Document Compilation</h5><p>All required documents gathered and organized.</p></div><span className="step-tag done">Done</span></div>
                      <div className="step-item"><div className="step-icon active">●</div><div><h5>Document Review</h5><p>Our team is reviewing for accuracy before submission.</p></div><span className="step-tag active">In Progress</span></div>
                      <div className="step-item"><div className="step-icon pending">○</div><div><h5>Visa Submission</h5><p>Formal application to be submitted.</p></div><span className="step-tag pending">Pending</span></div>
                      <div className="step-item"><div className="step-icon pending">○</div><div><h5>Decision</h5><p>Awaiting outcome once submitted.</p></div><span className="step-tag pending">Pending</span></div>
                    </div>
                  </div>

                  <div className="track-block">
                    <div className="track-block-head"><h4>💳 Study Loan — Facilitation</h4><span className="step-tag pending">Not Started</span></div>
                    <div className="track-progress-bar"><div className="track-progress-fill" style={{ width: '0%' }} /></div>
                    <div className="step-list">
                      <div className="step-item"><div className="step-icon pending">○</div><div><h5>Eligibility Check</h5><p>Will begin once you're ready to proceed.</p></div><span className="step-tag pending">Not Started</span></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeView === 'documents' && (
            <div className="view active">
              <div className="topbar">
                <div className="page-title">Document Center</div>
                <div className="page-sub">Upload and track the status of your documents</div>
              </div>
              <div className="dropzone">
                <div className="ic">⬆</div>
                <h4>Drag & drop a file, or tap to upload</h4>
                <p>Accepted: PDF, JPG, PNG — max 10MB per file <span className="placeholder-note">Planned</span></p>
              </div>
              <div className="doc-grid">
                <div className="doc-card"><div className="doc-icon">🛂</div><div className="doc-info"><h5>Passport Scan</h5><div className="status approved">✓ Approved</div></div></div>
                <div className="doc-card"><div className="doc-icon">🎓</div><div className="doc-info"><h5>Academic Transcript</h5><div className="status approved">✓ Approved</div></div></div>
                <div className="doc-card"><div className="doc-icon">✍️</div><div className="doc-info"><h5>Statement of Purpose</h5><div className="status approved">✓ Approved</div></div></div>
                <div className="doc-card"><div className="doc-icon">💰</div><div className="doc-info"><h5>Bank Statement</h5><div className="status review">● Under Review</div></div></div>
                <div className="doc-card"><div className="doc-icon">📄</div><div className="doc-info"><h5>Proof of Accommodation</h5><div className="status needed">○ Needed</div></div></div>
              </div>
            </div>
          )}

          {activeView === 'messages' && (
            <div className="view active">
              <div className="topbar">
                <div className="page-title">Messages</div>
                <div className="page-sub">A direct line to your Oma Synergies team</div>
              </div>
              <div className="panel">
                <div className="panel-head"><h3>Oma Synergies Team</h3></div>
                <div className="msg-thread">
                  {messages.map((m, i) => (
                    <div className={m.from === 'team' ? 'msg from-team' : 'msg from-client'} key={i}>
                      <div className="who">{m.from === 'team' ? 'Oma Synergies Team' : 'You'}</div>
                      {m.text}
                    </div>
                  ))}
                </div>
                <div className="msg-input-row">
                  <input type="text" placeholder="Type a message..." value={msgInput} onChange={(e) => setMsgInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && sendMessage()} />
                  <button className="msg-send" onClick={sendMessage}>➤</button>
                </div>
              </div>
            </div>
          )}

          {activeView === 'settings' && (
            <div className="view active">
              <div className="topbar">
                <div className="page-title">Account Settings</div>
                <div className="page-sub">Manage your profile and notification preferences</div>
              </div>
              <div className="panel">
                <div className="panel-head"><h3>Profile</h3></div>
                <div className="panel-body">
                  <div className="settings-grid">
                    <div className="form-row"><label>Full Name</label><input type="text" defaultValue="Praise Adebayo" /></div>
                    <div className="form-row"><label>Email</label><input type="email" defaultValue="praise.demo@example.com" /></div>
                    <div className="form-row"><label>Phone</label><input type="tel" defaultValue="0800 000 0000" /></div>
                    <div className="form-row"><label>Destination</label><input type="text" defaultValue="Canada" disabled /></div>
                  </div>
                  <button className="btn-save">Save Changes</button>
                </div>
              </div>
              <div className="panel">
                <div className="panel-head"><h3>Notification Preferences</h3></div>
                <div className="panel-body">
                  <div className="toggle-row"><div><h5>Email updates</h5><p>Get notified when your application status changes</p></div><button className={toggles.email ? 'toggle on' : 'toggle'} onClick={() => setToggles((t) => ({ ...t, email: !t.email }))} /></div>
                  <div className="toggle-row"><div><h5>SMS updates</h5><p>Text alerts for urgent updates</p></div><button className={toggles.sms ? 'toggle on' : 'toggle'} onClick={() => setToggles((t) => ({ ...t, sms: !t.sms }))} /></div>
                  <div className="toggle-row"><div><h5>New messages</h5><p>Notify me when the team sends a message</p></div><button className={toggles.newMsg ? 'toggle on' : 'toggle'} onClick={() => setToggles((t) => ({ ...t, newMsg: !t.newMsg }))} /></div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
