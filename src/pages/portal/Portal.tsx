import { useState } from 'react';
import { Link } from 'react-router-dom';
import logoIcon from '../../assets/logo-icon.png';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';
import { usePortalData, usePortalMessages, completeOnboarding } from '../../hooks/usePortalData';
import type { Database } from '../../lib/database.types';
import './Portal.css';

type ViewId = 'dashboard' | 'tracker' | 'documents' | 'messages' | 'settings';
type ApplicationStage = Database['public']['Tables']['applications']['Row']['stage'];

const NAV: { id: ViewId; icon: string; label: string }[] = [
  { id: 'dashboard', icon: '◆', label: 'Dashboard' },
  { id: 'tracker', icon: '◈', label: 'Application Tracker' },
  { id: 'documents', icon: '▤', label: 'Documents' },
  { id: 'messages', icon: '✉', label: 'Messages' },
  { id: 'settings', icon: '⚙', label: 'Account Settings' },
];

// Ordered main flow, used for the tracker's progress bar and step list.
// approved/refused/withdrawn are terminal outcomes, shown separately
// rather than as a 6th step in the middle of an in-progress bar.
const STAGE_FLOW: { stage: ApplicationStage; label: string; blurb: string }[] = [
  { stage: 'documents_requested', label: 'Documents Requested', blurb: 'We\'ve let you know what\'s needed - check the Documents tab for your checklist.' },
  { stage: 'documents_received', label: 'Documents Received', blurb: 'Your documents are with us and queued for review.' },
  { stage: 'application_prepared', label: 'Application Prepared', blurb: 'Your file has been compiled and checked for accuracy.' },
  { stage: 'submitted', label: 'Submitted', blurb: 'Your application has been formally submitted. Processing times vary by destination.' },
  { stage: 'decision_pending', label: 'Decision Pending', blurb: 'Awaiting a decision. We\'ll update this the moment we hear back.' },
];

const TERMINAL_LABELS: Record<string, string> = { approved: 'Approved', refused: 'Refused', withdrawn: 'Withdrawn' };

function getInitials(name: string | null | undefined): string {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? '') + (parts.length > 1 ? parts[parts.length - 1][0] : '')).toUpperCase();
}

function formatStage(stage: string): string {
  return stage.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

const DOC_STATUS_LABEL: Record<string, string> = {
  required: 'Needed', pending: 'Pending', received: 'Received', under_review: 'Under Review',
  approved: 'Approved', rejected: 'Action Needed', submitted_to_embassy: 'Submitted', returned: 'Returned',
};
const DOC_STATUS_CLASS: Record<string, string> = {
  approved: 'approved', received: 'approved', submitted_to_embassy: 'approved',
  under_review: 'review', pending: 'review',
  rejected: 'needed', required: 'needed', returned: 'needed',
};

export default function Portal() {
  const auth = useAuth();
  const [activeView, setActiveView] = useState<ViewId>('dashboard');
  const [mobileOpen, setMobileOpen] = useState(false);

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [signingIn, setSigningIn] = useState(false);

  const [newPassword, setNewPassword] = useState('');
  const [newPasswordConfirm, setNewPasswordConfirm] = useState('');
  const [onboardSubmitting, setOnboardSubmitting] = useState(false);
  const [onboardError, setOnboardError] = useState<string | null>(null);

  const [msgInput, setMsgInput] = useState('');

  const isAuthedClient = !auth.loading && !!auth.userId && auth.role === 'client';
  const portal = usePortalData(isAuthedClient ? auth.userId : null);
  const portalMessages = usePortalMessages(portal.client?.id ?? null);

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
      setLoginError(errorMessage === 'Invalid login credentials' ? 'Incorrect email or password.' : errorMessage);
    }
  }

  async function handleCompleteOnboarding() {
    setOnboardError(null);
    if (newPassword.length < 8) {
      setOnboardError('Choose a password with at least 8 characters.');
      return;
    }
    if (newPassword !== newPasswordConfirm) {
      setOnboardError('Passwords don\'t match.');
      return;
    }
    if (!portal.client) return;
    setOnboardSubmitting(true);
    const err = await completeOnboarding(portal.client.id, newPassword);
    setOnboardSubmitting(false);
    if (err) {
      setOnboardError(err);
      return;
    }
    window.location.reload(); // simplest way to re-fetch everything fresh post-onboarding
  }

  async function handleSendMessage() {
    if (!msgInput.trim() || !auth.userId) return;
    const text = msgInput;
    setMsgInput('');
    await portalMessages.sendMessage(text, auth.userId);
  }

  // ---- Loading ----
  if (auth.loading) {
    return (
      <div className="portal-root">
        <div id="loginScreen"><div className="login-card"><div className="sub">Checking session…</div></div></div>
      </div>
    );
  }

  // ---- Wrong account type (an admin trying their own login here) ----
  if (auth.userId && auth.role !== 'client') {
    return (
      <div className="portal-root">
        <div id="loginScreen">
          <div className="login-card">
            <div className="brand"><img src={logoIcon} alt="Oma Synergies" /><span>CLIENT PORTAL</span></div>
            <h2>Wrong Portal</h2>
            <div className="sub">This account isn't a client account. Staff should sign in at the <a href="/admin">admin panel</a> instead.</div>
            <button className="login-btn" onClick={() => auth.signOut()}>Sign Out</button>
          </div>
        </div>
      </div>
    );
  }

  // ---- Login screen ----
  if (!auth.userId) {
    return (
      <div className="portal-root">
        <div id="loginScreen">
          <div className="login-card">
            <div className="brand"><img src={logoIcon} alt="Oma Synergies" /><span>CLIENT PORTAL</span></div>
            <h2>Welcome back</h2>
            <div className="sub">Track your application anytime, anywhere</div>
            <div className="form-row">
              <label>Email</label>
              <input type="email" placeholder="you@example.com" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSignIn()} />
            </div>
            <div className="form-row">
              <label>Password</label>
              <input type="password" placeholder="••••••••" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSignIn()} />
            </div>
            {loginError && <div className="login-error">{loginError}</div>}
            <button className="login-btn" onClick={handleSignIn} disabled={signingIn}>{signingIn ? 'Signing In…' : 'Log In'}</button>
            <div className="login-note">Don't have an account? Your consultant creates your portal access - contact us if you haven't received your login details.</div>
          </div>
        </div>
      </div>
    );
  }

  // ---- Waiting on portal data ----
  if (portal.loading) {
    return (
      <div className="portal-root">
        <div id="loginScreen"><div className="login-card"><div className="sub">Loading your account…</div></div></div>
      </div>
    );
  }

  if (portal.error || !portal.client) {
    return (
      <div className="portal-root">
        <div id="loginScreen">
          <div className="login-card">
            <h2>Something's Not Right</h2>
            <div className="sub">{portal.error ?? 'We couldn\'t find your client record.'} Contact your consultant if this continues.</div>
            <button className="login-btn" onClick={() => auth.signOut()}>Sign Out</button>
          </div>
        </div>
      </div>
    );
  }

  // ---- Forced password change on first login ----
  if (!portal.client.onboarding_complete) {
    return (
      <div className="portal-root">
        <div id="loginScreen">
          <div className="login-card">
            <div className="brand"><img src={logoIcon} alt="Oma Synergies" /><span>CLIENT PORTAL</span></div>
            <h2>Welcome, {auth.fullName ?? 'there'}</h2>
            <div className="sub">Set your own password to finish setting up your account</div>
            <div className="form-row"><label>New Password</label><input type="password" placeholder="At least 8 characters" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} /></div>
            <div className="form-row"><label>Confirm New Password</label><input type="password" value={newPasswordConfirm} onChange={(e) => setNewPasswordConfirm(e.target.value)} /></div>
            {onboardError && <div className="login-error">{onboardError}</div>}
            <button className="login-btn" onClick={handleCompleteOnboarding} disabled={onboardSubmitting}>{onboardSubmitting ? 'Saving…' : 'Set Password & Continue'}</button>
          </div>
        </div>
      </div>
    );
  }

  // ---- Main portal ----
  const app = portal.application;
  const currentStageIndex = app ? STAGE_FLOW.findIndex((s) => s.stage === app.stage) : -1;
  const isTerminal = app && app.stage in TERMINAL_LABELS;
  const progressPercent = isTerminal ? 100 : currentStageIndex >= 0 ? Math.round(((currentStageIndex + 1) / STAGE_FLOW.length) * 100) : 0;

  const docsApproved = portal.documents.filter((d) => d.status === 'approved' || d.status === 'received' || d.status === 'submitted_to_embassy').length;
  const docsNeeded = portal.documents.filter((d) => d.status === 'required' || d.status === 'rejected').length;
  const unreadFromTeam = portalMessages.messages.filter((m) => m.sender_id !== auth.userId && !m.read_by_recipient).length;

  return (
    <div className="portal-root">
      {mobileOpen && <div className="sidebar-overlay open" onClick={() => setMobileOpen(false)} />}

      <div className="mobile-topbar">
        <div className="brand"><img src={logoIcon} alt="Oma Synergies" style={{ height: 26 }} /><span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13 }}>PORTAL</span></div>
        <button className="hamburger" onClick={() => setMobileOpen(true)}>☰</button>
      </div>

      <div className="app">
        <aside className={mobileOpen ? 'sidebar mobile-open' : 'sidebar'}>
          <div className="brand"><img src={logoIcon} alt="Oma Synergies" /><span>CLIENT PORTAL</span></div>
          <div className="client-chip">
            <div className="avatar">{getInitials(auth.fullName)}</div>
            <div><div className="name">{auth.fullName ?? 'Client'}</div><div className="email">{auth.email}</div></div>
          </div>
          {NAV.map((item) => {
            const badge = item.id === 'documents' ? docsNeeded : item.id === 'messages' ? unreadFromTeam : undefined;
            return (
              <a key={item.id} className={activeView === item.id ? 'nav-item active' : 'nav-item'} onClick={() => { setActiveView(item.id); setMobileOpen(false); }} style={{ cursor: 'pointer' }}>
                <span className="ic">{item.icon}</span> {item.label}
                {!!badge && <span className="nav-badge">{badge}</span>}
              </a>
            );
          })}
          <div className="logout-item">
            <a className="nav-item" style={{ cursor: 'pointer' }} onClick={() => auth.signOut()}><span className="ic">↪</span> Sign Out</a>
            <Link className="nav-item" to="/"><span className="ic">←</span> Back to Website</Link>
          </div>
        </aside>

        <main className="main">
          {activeView === 'dashboard' && (
            <div className="view active">
              <div className="welcome-card">
                <h2>Welcome back, {(auth.fullName ?? 'there').split(' ')[0]}</h2>
                <p>{app ? `Here's where things stand with your ${app.service_type}${app.destination ? ` – ${app.destination}` : ''} application.` : 'Your consultant will set up your application details shortly.'}</p>
              </div>
              <div className="stat-cards">
                <div className="stat-card"><div className="n">{app ? (isTerminal ? TERMINAL_LABELS[app.stage] : `${progressPercent}%`) : '—'}</div><div className="l">Application Progress</div></div>
                <div className="stat-card"><div className="n">{docsApproved}</div><div className="l">Documents Approved</div></div>
                <div className="stat-card"><div className="n">{docsNeeded}</div><div className="l">Documents Needed</div></div>
                <div className="stat-card"><div className="n">{unreadFromTeam}</div><div className="l">New Messages</div></div>
              </div>
              {app?.client_visible_message && (
                <div className="panel">
                  <div className="panel-head"><h3>Latest Update from Your Consultant</h3></div>
                  <div className="panel-body"><p style={{ fontSize: '14px', lineHeight: 1.6 }}>{app.client_visible_message}</p></div>
                </div>
              )}
              <div className="panel">
                <div className="panel-head"><h3>Quick Summary</h3></div>
                <div className="panel-body">
                  {!app ? (
                    <p style={{ fontSize: '14px', color: 'var(--slate)' }}>No active application yet.</p>
                  ) : (
                    <div className="step-list">
                      {STAGE_FLOW.map((s, i) => {
                        const state = isTerminal || i < currentStageIndex ? 'done' : i === currentStageIndex ? 'active' : 'pending';
                        return (
                          <div className="step-item" key={s.stage}>
                            <div className={`step-icon ${state}`}>{state === 'done' ? '✓' : state === 'active' ? '●' : '○'}</div>
                            <div><h5>{s.label}</h5><p>{s.blurb}</p></div>
                            <span className={`step-tag ${state}`}>{state === 'done' ? 'Done' : state === 'active' ? 'In Progress' : 'Pending'}</span>
                          </div>
                        );
                      })}
                      {isTerminal && <div className="step-item"><div className="step-icon done">✓</div><div><h5>Outcome: {TERMINAL_LABELS[app.stage]}</h5></div></div>}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeView === 'tracker' && (
            <div className="view active">
              <div className="topbar"><div className="page-title">Application Tracker</div><div className="page-sub">Real-time status of your application</div></div>
              {!app ? (
                <div className="panel"><div className="panel-body"><p style={{ fontSize: '14px', color: 'var(--slate)' }}>No active application yet - check back once your consultant has set this up.</p></div></div>
              ) : (
                <div className="panel">
                  <div className="panel-body">
                    <div className="track-block">
                      <div className="track-block-head"><h4>{app.service_type}{app.destination ? ` — ${app.destination}` : ''}</h4><span className={`step-tag ${isTerminal ? 'done' : 'active'}`}>{isTerminal ? TERMINAL_LABELS[app.stage] : `${progressPercent}% Complete`}</span></div>
                      <div className="track-progress-bar"><div className="track-progress-fill" style={{ width: `${progressPercent}%` }} /></div>
                      <div className="step-list">
                        {STAGE_FLOW.map((s, i) => {
                          const state = isTerminal || i < currentStageIndex ? 'done' : i === currentStageIndex ? 'active' : 'pending';
                          return (
                            <div className="step-item" key={s.stage}>
                              <div className={`step-icon ${state}`}>{state === 'done' ? '✓' : state === 'active' ? '●' : '○'}</div>
                              <div><h5>{s.label}</h5><p>{s.blurb}</p></div>
                              <span className={`step-tag ${state}`}>{state === 'done' ? 'Done' : state === 'active' ? 'In Progress' : 'Pending'}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    {portal.stageHistory.length > 0 && (
                      <div className="track-block">
                        <div className="track-block-head"><h4>History</h4></div>
                        <div className="step-list">
                          {portal.stageHistory.map((h) => (
                            <div className="step-item" key={h.id}>
                              <div className="step-icon done">✓</div>
                              <div><h5>{formatStage(h.stage)}</h5><p>{new Date(h.changed_at).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}</p></div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeView === 'documents' && (
            <div className="view active">
              <div className="topbar"><div className="page-title">Document Center</div><div className="page-sub">Status of every document on your checklist</div></div>
              {portal.documents.length === 0 ? (
                <div className="panel"><div className="panel-body"><p style={{ fontSize: '14px', color: 'var(--slate)' }}>No documents on your checklist yet.</p></div></div>
              ) : (
                <div className="doc-grid">
                  {portal.documents.map((d) => (
                    <div className="doc-card" key={d.id}>
                      <div className="doc-icon">📄</div>
                      <div className="doc-info">
                        <h5>{d.document_name}</h5>
                        <div className={`status ${DOC_STATUS_CLASS[d.status] ?? 'needed'}`}>
                          {d.status === 'approved' || d.status === 'received' || d.status === 'submitted_to_embassy' ? '✓ ' : d.status === 'under_review' ? '● ' : '○ '}
                          {DOC_STATUS_LABEL[d.status] ?? formatStage(d.status)}
                        </div>
                        {d.status === 'rejected' && d.rejection_reason && (
                          <p style={{ fontSize: '12px', color: '#B3261E', marginTop: '6px' }}>{d.rejection_reason}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeView === 'messages' && (
            <div className="view active">
              <div className="topbar"><div className="page-title">Messages</div><div className="page-sub">A direct line to your Oma Synergies team</div></div>
              <div className="panel">
                <div className="panel-head"><h3>Oma Synergies Team</h3></div>
                <div className="msg-thread">
                  {portalMessages.messages.length === 0 ? (
                    <p style={{ fontSize: '13px', color: 'var(--slate)', padding: '20px' }}>No messages yet. Send one below to start the conversation.</p>
                  ) : (
                    portalMessages.messages.map((m) => (
                      <div className={m.sender_id === auth.userId ? 'msg from-client' : 'msg from-team'} key={m.id}>
                        <div className="who">{m.sender_id === auth.userId ? 'You' : 'Oma Synergies Team'}</div>
                        {m.body}
                      </div>
                    ))
                  )}
                </div>
                <div className="msg-input-row">
                  <input type="text" placeholder="Type a message..." value={msgInput} onChange={(e) => setMsgInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()} />
                  <button className="msg-send" onClick={handleSendMessage}>➤</button>
                </div>
              </div>
            </div>
          )}

          {activeView === 'settings' && (
            <PortalSettings authEmail={auth.email} authFullName={auth.fullName} />
          )}
        </main>
      </div>
    </div>
  );
}

/**
 * Kept as its own small component so its local password-change state
 * doesn't clutter the main Portal component above.
 */
function PortalSettings({ authEmail, authFullName }: { authEmail: string | null; authFullName: string | null }) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newPasswordConfirm, setNewPasswordConfirm] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleChangePassword() {
    setError(null);
    setSuccess(false);
    if (!currentPassword) {
      setError('Enter your current password.');
      return;
    }
    if (newPassword.length < 8) {
      setError('New password must be at least 8 characters.');
      return;
    }
    if (newPassword !== newPasswordConfirm) {
      setError('New passwords don\'t match.');
      return;
    }
    setSaving(true);
    // Re-authenticate with the current password first - Supabase's
    // updateUser doesn't itself require the current password, but
    // requiring it here prevents someone who's grabbed an unattended,
    // already-logged-in session from silently locking the real owner out.
    if (!authEmail) {
      setError('Could not verify your account email.');
      setSaving(false);
      return;
    }
    const { error: reauthError } = await supabase.auth.signInWithPassword({ email: authEmail, password: currentPassword });
    if (reauthError) {
      setError('Current password is incorrect.');
      setSaving(false);
      return;
    }
    const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });
    setSaving(false);
    if (updateError) {
      setError(updateError.message);
      return;
    }
    setCurrentPassword('');
    setNewPassword('');
    setNewPasswordConfirm('');
    setSuccess(true);
  }

  return (
    <div className="view active">
      <div className="topbar"><div className="page-title">Account Settings</div><div className="page-sub">Manage your profile and password</div></div>
      <div className="panel">
        <div className="panel-head"><h3>Profile</h3></div>
        <div className="panel-body">
          <div className="settings-grid">
            <div className="form-row"><label>Full Name</label><input type="text" value={authFullName ?? ''} disabled /></div>
            <div className="form-row"><label>Email</label><input type="email" value={authEmail ?? ''} disabled /></div>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--slate)', marginTop: '4px' }}>To update your name or email, contact your consultant.</p>
        </div>
      </div>
      <div className="panel">
        <div className="panel-head"><h3>Change Password</h3></div>
        <div className="panel-body">
          <div className="settings-grid">
            <div className="form-row"><label>Current Password</label><input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} /></div>
            <div className="form-row"><label>New Password</label><input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} /></div>
            <div className="form-row"><label>Confirm New Password</label><input type="password" value={newPasswordConfirm} onChange={(e) => setNewPasswordConfirm(e.target.value)} /></div>
          </div>
          {error && <div className="login-error">{error}</div>}
          {success && <div className="login-note">Password updated.</div>}
          <button className="btn-save" onClick={handleChangePassword} disabled={saving}>{saving ? 'Saving…' : 'Update Password'}</button>
        </div>
      </div>
    </div>
  );
}
