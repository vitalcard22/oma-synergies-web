import { useState } from 'react';
import logoIcon from '../../assets/logo-icon.png';
import { useAuth } from '../../hooks/useAuth';
import {
  ADMIN_CLIENTS, ADMIN_INQUIRIES, ADMIN_CONSULTATIONS, ADMIN_DOCUMENTS,
  ADMIN_PAYMENTS, ADMIN_TESTIMONIALS, ADMIN_DESTINATIONS, ADMIN_TOURS,
  ADMIN_STAFF, ADMIN_ACTIVITY, ADMIN_NOTIFICATIONS,
} from './adminData';
import './Admin.css';

type ViewId = 'dashboard' | 'clients' | 'inquiries' | 'calendar' | 'documents' | 'payments' | 'testimonials' | 'destinations' | 'tours' | 'staff';

const NAV: { section: string; items: { id: ViewId; icon: string; label: string; badge?: number }[] }[] = [
  { section: 'Overview', items: [{ id: 'dashboard', icon: '◆', label: 'Dashboard' }] },
  {
    section: 'Operations',
    items: [
      { id: 'clients', icon: '◈', label: 'Clients & Cases', badge: 9 },
      { id: 'inquiries', icon: '✉', label: 'Inquiries', badge: 4 },
      { id: 'calendar', icon: '▦', label: 'Consultation Calendar' },
      { id: 'documents', icon: '▤', label: 'Documents' },
      { id: 'payments', icon: '₦', label: 'Payments' },
    ],
  },
  {
    section: 'Content',
    items: [
      { id: 'testimonials', icon: '❝', label: 'Testimonials' },
      { id: 'destinations', icon: '◎', label: 'Destinations' },
      { id: 'tours', icon: '✈', label: 'Tours & Packages' },
    ],
  },
  { section: 'Team', items: [{ id: 'staff', icon: '☺', label: 'Staff & Roles' }] },
];

function getInitials(name: string | null): string {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? '';
  const last = parts.length > 1 ? parts[parts.length - 1][0] : '';
  return (first + last).toUpperCase();
}

function Badge({ status }: { status: string }) {
  let cls = 'status-pending';
  if (['Approved', 'Paid', 'Confirmed', 'Done'].includes(status)) cls = 'status-done';
  else if (['In Progress', 'Pending', 'Awaiting Confirmation'].includes(status)) cls = 'status-active';
  else if (status === 'New') cls = 'status-new';
  return <span className={`badge ${cls}`}>{status}</span>;
}

export default function Admin() {
  const auth = useAuth();
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [signingIn, setSigningIn] = useState(false);
  const [activeView, setActiveView] = useState<ViewId>('dashboard');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [clientSearch, setClientSearch] = useState('');
  const [clientServiceFilter, setClientServiceFilter] = useState('all');
  const [inquiryStatusFilter, setInquiryStatusFilter] = useState('all');
  const [paymentsFilter, setPaymentsFilter] = useState('all');
  const [caseModalClient, setCaseModalClient] = useState<(typeof ADMIN_CLIENTS)[number] | null>(null);
  const [addModal, setAddModal] = useState<{ label: string; fields: string[] } | null>(null);
  const [toggles, setToggles] = useState<Record<string, boolean>>({});

  const filteredClients = ADMIN_CLIENTS.filter((c) => {
    const matchesSearch = c.name.toLowerCase().includes(clientSearch.toLowerCase());
    const matchesService = clientServiceFilter === 'all' || c.service === clientServiceFilter;
    return matchesSearch && matchesService;
  });

  const filteredInquiries = ADMIN_INQUIRIES.filter((i) => inquiryStatusFilter === 'all' || i.status === inquiryStatusFilter);
  const filteredPayments = ADMIN_PAYMENTS.filter((p) => paymentsFilter === 'all' || p.status === paymentsFilter);

  const toggleKey = (prefix: string, name: string) => `${prefix}:${name}`;
  const isOn = (prefix: string, name: string, defaultVal: boolean) => {
    const k = toggleKey(prefix, name);
    return k in toggles ? toggles[k] : defaultVal;
  };
  const flip = (prefix: string, name: string, defaultVal: boolean) => {
    const k = toggleKey(prefix, name);
    setToggles((t) => ({ ...t, [k]: !(k in t ? t[k] : defaultVal) }));
  };

  async function handleSignIn() {
    setLoginError(null);
    if (!loginEmail || !loginPassword) {
      setLoginError('Enter both email and password.');
      return;
    }
    setSigningIn(true);
    const errorMessage = await auth.signIn(loginEmail, loginPassword);
    setSigningIn(false);
    if (errorMessage) {
      setLoginError(errorMessage === 'Invalid login credentials'
        ? 'Incorrect email or password.'
        : errorMessage);
    }
    // On success, useAuth's onAuthStateChange listener updates auth.role
    // automatically - no need to set any local "logged in" flag here.
  }

  if (auth.loading) {
    return (
      <div className="admin-root">
        <div id="loginScreen">
          <div className="login-card">
            <div className="sub">Checking session…</div>
          </div>
        </div>
      </div>
    );
  }

  // Signed in, but the account isn't an admin (e.g. a client accidentally
  // trying their portal credentials here) - block access, don't just fall
  // through to the panel.
  if (auth.userId && auth.role === 'client') {
    return (
      <div className="admin-root">
        <div id="loginScreen">
          <div className="login-card">
            <div className="brand"><img src={logoIcon} alt="Oma Synergies" style={{ height: 30 }} /><span style={{ fontFamily: 'var(--display)', fontWeight: 700, fontSize: 14 }}>ADMIN PANEL</span></div>
            <h2>Access Restricted</h2>
            <div className="sub">This account doesn't have admin access. If you're a client, please use the <a href="/portal">client portal</a> instead.</div>
            <button className="login-btn" onClick={() => auth.signOut()}>Sign Out</button>
          </div>
        </div>
      </div>
    );
  }

  if (!auth.userId || !auth.role) {
    return (
      <div className="admin-root">
        <div id="loginScreen">
          <div className="login-card">
            <div className="brand"><img src={logoIcon} alt="Oma Synergies" style={{ height: 30 }} /><span style={{ fontFamily: 'var(--display)', fontWeight: 700, fontSize: 14 }}>ADMIN PANEL</span></div>
            <h2>Staff Sign In</h2>
            <div className="sub">Access restricted to Oma Synergies team members</div>
            <div className="form-row">
              <label>Email</label>
              <input
                type="email"
                placeholder="you@omasynergiestravel.com"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSignIn()}
              />
            </div>
            <div className="form-row">
              <label>Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSignIn()}
              />
            </div>
            {loginError && <div className="login-error">{loginError}</div>}
            <button className="login-btn" onClick={handleSignIn} disabled={signingIn}>
              {signingIn ? 'Signing In…' : 'Sign In'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-root">
      <div className="demo-banner"><strong>Sign-in is live.</strong> Client list, inquiries, payments and other data below are still sample data — real data connects in the next phase.</div>

      {mobileOpen && <div className="sidebar-overlay open" onClick={() => setMobileOpen(false)} />}

      <div className="mobile-topbar">
        <div className="brand"><img src={logoIcon} alt="Oma Synergies" style={{ height: 26 }} /><span style={{ fontFamily: 'var(--display)', fontWeight: 700, fontSize: 13 }}>ADMIN</span></div>
        <button className="hamburger" onClick={() => setMobileOpen(true)}>☰</button>
      </div>

      <div className="notif-wrap">
        <button className="notif-btn" onClick={() => setNotifOpen((v) => !v)}>🔔<span className="notif-dot" /></button>
        <div className={notifOpen ? 'notif-dropdown open' : 'notif-dropdown'}>
          <div className="notif-dropdown-head">Notifications</div>
          {ADMIN_NOTIFICATIONS.map((n) => (
            <div className="notif-item" key={n.title}>
              <div className="t">{n.title}</div>
              <div className="s">{n.sub}</div>
              <div className="when">{n.when}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="app">
        <aside className={mobileOpen ? 'sidebar mobile-open' : 'sidebar'}>
          <div className="brand"><img src={logoIcon} alt="Oma Synergies" /><span>ADMIN PANEL</span></div>
          {NAV.map((sec) => (
            <div key={sec.section}>
              <div className="nav-section-label">{sec.section}</div>
              {sec.items.map((item) => (
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
            </div>
          ))}
        </aside>

        <main className="main">
          {activeView === 'dashboard' && (
            <div className="view active">
              <div className="topbar">
                <div><div className="page-title">Dashboard</div><div className="page-sub">Overview of all activity across the agency</div></div>
                <div className="admin-user" onClick={() => auth.signOut()} style={{ cursor: 'pointer' }} title="Click to sign out">
                  <div className="avatar-sm">{getInitials(auth.fullName)}</div> {auth.fullName ?? auth.email}
                </div>
              </div>
              <div className="stat-cards">
                <div className="stat-card"><div className="n">9</div><div className="l">Active Clients</div></div>
                <div className="stat-card"><div className="n">4</div><div className="l">New Inquiries</div></div>
                <div className="stat-card"><div className="n">12</div><div className="l">Destinations Live</div></div>
                <div className="stat-card"><div className="n">6</div><div className="l">Tours Live</div></div>
              </div>
              <div className="panel">
                <div className="panel-head"><h3>Recent Activity</h3></div>
                <table>
                  <thead><tr><th>Client</th><th>Update</th><th>Service</th><th>When</th></tr></thead>
                  <tbody>
                    {ADMIN_ACTIVITY.map((a) => (
                      <tr key={a.update}>
                        <td>{a.initials && <span className="avatar-sm">{a.initials}</span>}{a.who}</td>
                        <td>{a.update}</td><td>{a.tag}</td><td>{a.when}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeView === 'clients' && (
            <div className="view active">
              <div className="topbar"><div><div className="page-title">Clients & Cases</div><div className="page-sub">Manage every client's admission, visa, and loan status</div></div></div>
              <div className="panel">
                <div className="panel-head">
                  <h3>All Clients ({filteredClients.length})</h3>
                  <div className="toolbar">
                    <input className="search-input" placeholder="Search clients..." value={clientSearch} onChange={(e) => setClientSearch(e.target.value)} />
                    <select className="select-filter" value={clientServiceFilter} onChange={(e) => setClientServiceFilter(e.target.value)}>
                      <option value="all">All Services</option>
                      <option>Study Visa</option><option>Tourist Visa</option><option>Business Visa</option><option>Spousal Work Permit</option>
                    </select>
                    <button className="btn-add" onClick={() => setAddModal({ label: 'Client', fields: ['Full Name', 'Email', 'Phone', 'Destination', 'Service'] })}>+ Add Client</button>
                  </div>
                </div>
                <table>
                  <thead><tr><th>Client</th><th>Destination</th><th>Service</th><th>Status</th><th></th></tr></thead>
                  <tbody>
                    {filteredClients.map((c) => (
                      <tr key={c.name}>
                        <td><span className="avatar-sm">{c.initials}</span>{c.name}</td>
                        <td>{c.destination}</td><td>{c.service}</td>
                        <td><Badge status={c.status} /></td>
                        <td className="row-actions"><button className="icon-btn" onClick={() => setCaseModalClient(c)}>⤢</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeView === 'inquiries' && (
            <div className="view active">
              <div className="topbar"><div><div className="page-title">Inquiries</div><div className="page-sub">Incoming messages from the website contact form</div></div></div>
              <div className="panel">
                <div className="panel-head">
                  <h3>Inbox ({filteredInquiries.length})</h3>
                  <div className="toolbar">
                    <select className="select-filter" value={inquiryStatusFilter} onChange={(e) => setInquiryStatusFilter(e.target.value)}>
                      <option value="all">All Status</option><option>New</option><option>Contacted</option><option>Closed</option>
                    </select>
                  </div>
                </div>
                <table>
                  <thead><tr><th>Name</th><th>Service Interested</th><th>Destination</th><th>Status</th><th></th></tr></thead>
                  <tbody>
                    {filteredInquiries.map((i) => (
                      <tr key={i.email}>
                        <td className="cell-name">{i.name}<div className="cell-sub">{i.email}</div></td>
                        <td>{i.service}</td><td>{i.destination}</td>
                        <td><Badge status={i.status} /></td>
                        <td className="row-actions"><button className="icon-btn">✉</button><button className="icon-btn">✓</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeView === 'calendar' && (
            <div className="view active">
              <div className="topbar">
                <div><div className="page-title">Consultation Calendar</div><div className="page-sub">Upcoming booked consultations across the team</div></div>
                <button className="btn-add" onClick={() => setAddModal({ label: 'Consultation', fields: ['Client Name', 'Date & Time', 'Service', 'Assigned Staff'] })}>+ Add Consultation</button>
              </div>
              <div className="panel">
                <div className="panel-head"><h3>This Week</h3></div>
                <table>
                  <thead><tr><th>Date & Time</th><th>Client</th><th>Service</th><th>Assigned To</th><th>Status</th></tr></thead>
                  <tbody>
                    {ADMIN_CONSULTATIONS.map((c) => (
                      <tr key={c.client}>
                        <td className="cell-name">{c.when}</td><td>{c.client}</td><td>{c.service}</td>
                        <td><span className="avatar-sm">{c.staffInitials}</span>{c.staff}</td>
                        <td><Badge status={c.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeView === 'documents' && (
            <div className="view active">
              <div className="topbar"><div><div className="page-title">Document Review</div><div className="page-sub">Review and approve documents uploaded by clients</div></div></div>
              <div className="panel">
                <div className="panel-head"><h3>Pending Review ({ADMIN_DOCUMENTS.length})</h3></div>
                <table>
                  <thead><tr><th>Client</th><th>Document</th><th>Type</th><th>Status</th><th></th></tr></thead>
                  <tbody>
                    {ADMIN_DOCUMENTS.map((d) => (
                      <tr key={d.doc}>
                        <td><span className="avatar-sm">{d.initials}</span>{d.client}</td><td>{d.doc}</td><td>{d.type}</td>
                        <td><Badge status={d.status} /></td>
                        <td className="row-actions"><button className="icon-btn">✓</button><button className="icon-btn">✕</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeView === 'payments' && (
            <div className="view active">
              <div className="topbar"><div><div className="page-title">Payments</div><div className="page-sub">Transactions processed via Selar</div></div></div>
              <div className="stat-cards">
                <div className="stat-card"><div className="n">₦4.2M</div><div className="l">Total Received <span style={{ color: 'var(--slate)', fontWeight: 400 }}>(sample)</span></div></div>
                <div className="stat-card"><div className="n">6</div><div className="l">Completed Payments</div></div>
                <div className="stat-card"><div className="n">2</div><div className="l">Pending</div></div>
              </div>
              <div className="panel">
                <div className="panel-head">
                  <h3>Recent Transactions</h3>
                  <div className="toolbar">
                    <select className="select-filter" value={paymentsFilter} onChange={(e) => setPaymentsFilter(e.target.value)}>
                      <option value="all">All Status</option><option>Paid</option><option>Pending</option>
                    </select>
                  </div>
                </div>
                <table>
                  <thead><tr><th>Client</th><th>Item</th><th>Amount</th><th>Selar Ref</th><th>Status</th></tr></thead>
                  <tbody>
                    {filteredPayments.map((p) => (
                      <tr key={p.ref}>
                        <td className="cell-name">{p.client}</td><td>{p.item}</td><td>{p.amount}</td><td>{p.ref}</td>
                        <td><Badge status={p.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="upload-note"><strong>Selar Integration</strong>These transactions will sync automatically once Selar checkout is wired up on the live site. For now this table reflects manually recorded sample data.</div>
            </div>
          )}

          {activeView === 'testimonials' && (
            <div className="view active">
              <div className="topbar"><div><div className="page-title">Testimonials</div><div className="page-sub">Manage text and video testimonials shown on the site</div></div></div>
              <div className="panel">
                <div className="panel-head">
                  <h3>All Testimonials ({ADMIN_TESTIMONIALS.length})</h3>
                  <div className="toolbar"><button className="btn-add" onClick={() => setAddModal({ label: 'Testimonial', fields: ['Client Name (or initial)', 'Service/Destination', 'Quote', 'Video Link (optional)'] })}>+ Add Testimonial</button></div>
                </div>
                <table>
                  <thead><tr><th>Client</th><th>Service</th><th>Type</th><th>Live on Site</th><th></th></tr></thead>
                  <tbody>
                    {ADMIN_TESTIMONIALS.map((t) => (
                      <tr key={t.client}>
                        <td><span className="avatar-sm">{t.initials}</span>{t.client}</td><td>{t.service}</td><td>{t.type}</td>
                        <td><button className={isOn('test', t.client, t.live) ? 'toggle on' : 'toggle'} onClick={() => flip('test', t.client, t.live)} /></td>
                        <td className="row-actions"><button className="icon-btn">{t.type === 'Video' ? '↑ Upload' : '✎'}</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="upload-note"><strong>Upload behavior (planned)</strong>Phone-friendly upload, real file size shown before upload, progress bar during, size warnings over limit, and confirmation of optimized size after, as previously specified.</div>
            </div>
          )}

          {activeView === 'destinations' && (
            <div className="view active">
              <div className="topbar"><div><div className="page-title">Destinations</div><div className="page-sub">Edit flagship destination details and processing times</div></div></div>
              <div className="panel">
                <div className="panel-head">
                  <h3>Flagship Destinations (12)</h3>
                  <div className="toolbar"><button className="btn-add" onClick={() => setAddModal({ label: 'Destination', fields: ['Country Name', 'Region', 'Avg. Processing Time', 'Photo Upload'] })}>+ Add Destination</button></div>
                </div>
                <table>
                  <thead><tr><th>Country</th><th>Region</th><th>Processing Time</th><th>Live on Site</th><th></th></tr></thead>
                  <tbody>
                    {ADMIN_DESTINATIONS.map((d) => (
                      <tr key={d.name}>
                        <td className="cell-name">{d.name}</td><td>{d.region}</td>
                        <td>{d.processing} <span style={{ color: 'var(--slate)', fontSize: 11 }}>(sample)</span></td>
                        <td><button className={isOn('dest', d.name, d.live) ? 'toggle on' : 'toggle'} onClick={() => flip('dest', d.name, d.live)} /></td>
                        <td className="row-actions"><button className="icon-btn">✎</button></td>
                      </tr>
                    ))}
                    <tr><td className="cell-name">+ 8 more destinations</td><td colSpan={3} style={{ color: 'var(--slate)' }}>Same pattern, edit any country's details inline</td></tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeView === 'tours' && (
            <div className="view active">
              <div className="topbar"><div><div className="page-title">Tours & Packages</div><div className="page-sub">Manage curated trips shown on the Tours page</div></div></div>
              <div className="panel">
                <div className="panel-head">
                  <h3>All Packages (6)</h3>
                  <div className="toolbar"><button className="btn-add" onClick={() => setAddModal({ label: 'Tour Package', fields: ['Package Name', 'Category', 'Duration', 'Price', 'Photo Upload'] })}>+ Add Package</button></div>
                </div>
                <table>
                  <thead><tr><th>Package</th><th>Category</th><th>Price</th><th>Live on Site</th><th></th></tr></thead>
                  <tbody>
                    {ADMIN_TOURS.map((t) => (
                      <tr key={t.name}>
                        <td className="cell-name">{t.name}</td><td>{t.category}</td><td>{t.price}</td>
                        <td><button className={isOn('tour', t.name, t.live) ? 'toggle on' : 'toggle'} onClick={() => flip('tour', t.name, t.live)} /></td>
                        <td className="row-actions"><button className="icon-btn">✎</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeView === 'staff' && (
            <div className="view active">
              <div className="topbar">
                <div><div className="page-title">Staff & Roles</div><div className="page-sub">Manage team access to the admin panel</div></div>
                <button className="btn-add" onClick={() => setAddModal({ label: 'Staff Member', fields: ['Full Name', 'Email', 'Role', 'Permission Level'] })}>+ Invite Staff</button>
              </div>
              <div className="panel">
                <div className="panel-head"><h3>Team Members ({ADMIN_STAFF.length})</h3></div>
                <table>
                  <thead><tr><th>Name</th><th>Role</th><th>Permission</th><th>Status</th><th></th></tr></thead>
                  <tbody>
                    {ADMIN_STAFF.map((s) => (
                      <tr key={s.name}>
                        <td><span className="avatar-sm">{s.initials}</span>{s.name}</td><td>{s.role}</td>
                        <td><span className={s.admin ? 'role-badge admin' : 'role-badge'}>{s.permission}</span></td>
                        <td><span className="badge status-done">Active</span></td>
                        <td className="row-actions"><button className="icon-btn">✎</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="upload-note"><strong>Permission levels (planned)</strong>Admin: full access to everything. Staff (Content Only): can manage testimonials, destinations, tours. Staff (View Only): can view clients/inquiries but not edit case status.</div>
            </div>
          )}
        </main>
      </div>

      {caseModalClient && (
        <div className="modal-overlay open" onClick={(e) => { if (e.target === e.currentTarget) setCaseModalClient(null); }}>
          <div className="modal">
            <div className="modal-head">
              <div><h3>{caseModalClient.name}'s Case</h3><div className="page-sub">{caseModalClient.destination} · {caseModalClient.service}</div></div>
              <button className="modal-close" onClick={() => setCaseModalClient(null)}>✕</button>
            </div>
            <div className="track-group">
              <div className="track-label">Admission Track</div>
              <div className="track-row"><span className="step-name">Consultation & Profile Evaluation</span><select className="status-select" defaultValue="Done"><option>Done</option><option>In Progress</option><option>Pending</option></select></div>
              <div className="track-row"><span className="step-name">School Admission & Document Prep</span><select className="status-select" defaultValue="Done"><option>Done</option><option>In Progress</option><option>Pending</option></select></div>
            </div>
            <div className="track-group">
              <div className="track-label">Visa Track</div>
              <div className="track-row"><span className="step-name">Visa Support & Study Loans</span><select className="status-select" defaultValue="In Progress"><option>Done</option><option>In Progress</option><option>Pending</option></select></div>
              <div className="track-row"><span className="step-name">Flight Booking & Relocation</span><select className="status-select" defaultValue="Pending"><option>Done</option><option>In Progress</option><option>Pending</option></select></div>
            </div>
            <div className="track-group">
              <div className="track-label">Internal Notes (not visible to client)</div>
              <textarea className="notes-box" defaultValue="Awaiting updated bank statement before visa submission." />
            </div>
            <div className="modal-actions">
              <button className="btn-save">Save Changes</button>
              <button className="icon-btn" style={{ width: 'auto', padding: '0 16px' }} onClick={() => setCaseModalClient(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {addModal && (
        <div className="modal-overlay open" onClick={(e) => { if (e.target === e.currentTarget) setAddModal(null); }}>
          <div className="modal" style={{ maxWidth: 480 }}>
            <div className="modal-head">
              <div><h3>Add {addModal.label}</h3><div className="page-sub">Fields shown match what this content type needs</div></div>
              <button className="modal-close" onClick={() => setAddModal(null)}>✕</button>
            </div>
            <div>
              {addModal.fields.map((f) => (
                <div className="form-row" key={f}><label>{f}</label><input type="text" placeholder={f} /></div>
              ))}
            </div>
            <div className="modal-actions">
              <button className="btn-save">Save</button>
              <button className="icon-btn" style={{ width: 'auto', padding: '0 16px' }} onClick={() => setAddModal(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
