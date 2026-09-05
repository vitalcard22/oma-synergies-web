import { useState } from 'react';
import logoIcon from '../../assets/logo-icon.png';
import { useAuth } from '../../hooks/useAuth';
import { useClients, useDashboardStats, useRecentActivity, useApplicationDocuments, useContactSubmissions, useStaffList, usePayments, useTourPackages, useMasterclasses, updateApplicationStage, updateApplicationNotes, updateDocumentStatus, updateSubmissionStatus, updateStaffStatus, addPayment, updateTestimonialStatus, addTestimonial, upsertTourPackage, updateTourStatus, upsertMasterclass, type ClientWithDetails } from '../../hooks/useAdminData';
import { useTestimonials } from '../../hooks/useTestimonials';
import { supabase } from '../../lib/supabase';
import type { Database } from '../../lib/database.types';
import { getInitials } from '../../utils/initials';
import { TOURS, formatNaira } from '../../data/tours';
import { DESTINATIONS } from '../../data/destinations';

import './Admin.css';

type ViewId = 'dashboard' | 'clients' | 'inquiries' | 'calendar' | 'documents' | 'payments' | 'testimonials' | 'destinations' | 'tours' | 'staff';

const NAV: { section: string; items: { id: ViewId; icon: string; label: string }[] }[] = [
  { section: 'Overview', items: [{ id: 'dashboard', icon: '◆', label: 'Dashboard' }] },
  {
    section: 'Operations',
    items: [
      { id: 'clients', icon: '◈', label: 'Clients & Cases' },
      { id: 'inquiries', icon: '✉', label: 'Inquiries' },
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

function Badge({ status }: { status: string }) {
  let cls = 'status-pending';
  if (['Approved', 'Paid', 'Confirmed', 'Done', 'converted', 'approved'].includes(status)) cls = 'status-done';
  else if (['In Progress', 'Pending', 'Awaiting Confirmation', 'pending'].includes(status)) cls = 'status-active';
  else if (['New', 'unread'].includes(status)) cls = 'status-new';
  else if (['rejected', 'Refused', 'refused'].includes(status)) cls = 'status-new'; // red, same as alert
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
  const [caseModalClient, setCaseModalClient] = useState<ClientWithDetails | null>(null);
  const [caseStageEdit, setCaseStageEdit] = useState('documents_requested');
  const [caseAdminNotes, setCaseAdminNotes] = useState('');
  const [caseClientMessage, setCaseClientMessage] = useState('');
  const [caseSaving, setCaseSaving] = useState(false);
  const [caseSaveError, setCaseSaveError] = useState<string | null>(null);
  const [caseSaveSuccess, setCaseSaveSuccess] = useState(false);
  const [caseDocSavingId, setCaseDocSavingId] = useState<string | null>(null);
  const [caseRejectReasons, setCaseRejectReasons] = useState<Record<string, string>>({});

  const caseApplication = caseModalClient?.applications[0] ?? null;
  const { documents: caseDocuments, refetch: refetchCaseDocuments } = useApplicationDocuments(caseApplication?.id ?? null);

  function openCaseModal(client: ClientWithDetails) {
    const app = client.applications[0];
    setCaseModalClient(client);
    setCaseStageEdit(app?.stage ?? 'documents_requested');
    setCaseAdminNotes(app?.admin_notes ?? '');
    setCaseClientMessage(app?.client_visible_message ?? '');
    setCaseSaveError(null);
    setCaseSaveSuccess(false);
  }

  async function handleSaveCase() {
    if (!caseApplication || !auth.userId) return;
    setCaseSaving(true);
    setCaseSaveError(null);
    setCaseSaveSuccess(false);

    if (caseStageEdit !== caseApplication.stage) {
      const stageErr = await updateApplicationStage(caseApplication.id, caseStageEdit as typeof caseApplication.stage, auth.userId);
      if (stageErr) {
        setCaseSaveError(stageErr);
        setCaseSaving(false);
        return;
      }
    }

    const notesErr = await updateApplicationNotes(caseApplication.id, caseAdminNotes, caseClientMessage);
    if (notesErr) {
      setCaseSaveError(notesErr);
      setCaseSaving(false);
      return;
    }

    setCaseSaving(false);
    setCaseSaveSuccess(true);
    refetchClients();
  }

  async function handleDocumentStatusChange(docId: string, newStatus: string) {
    setCaseDocSavingId(docId);
    const reason = newStatus === 'rejected' ? (caseRejectReasons[docId] ?? '') : null;
    await updateDocumentStatus(docId, newStatus as Database['public']['Tables']['documents']['Row']['status'], reason);
    await refetchCaseDocuments();
    setCaseDocSavingId(null);
  }

  async function handleRejectionReasonBlur(docId: string) {
    setCaseDocSavingId(docId);
    await updateDocumentStatus(docId, 'rejected', caseRejectReasons[docId] ?? '');
    await refetchCaseDocuments();
    setCaseDocSavingId(null);
  }

  const [addModal, setAddModal] = useState<{ label: string; fields: string[] } | null>(null);

  // ---- Register New Client (real, calls the serverless function) ----
  const [registerOpen, setRegisterOpen] = useState(false);
  const [registerForm, setRegisterForm] = useState({ fullName: '', email: '', phone: '', serviceType: 'UK Study Visa', destination: '' });
  const [registerSubmitting, setRegisterSubmitting] = useState(false);
  const [registerError, setRegisterError] = useState<string | null>(null);
  const [registerResult, setRegisterResult] = useState<{ tempPassword: string; documentsPopulated: number } | null>(null);

  function openRegisterModal() {
    setRegisterForm({ fullName: '', email: '', phone: '', serviceType: 'UK Study Visa', destination: '' });
    setRegisterError(null);
    setRegisterResult(null);
    setRegisterOpen(true);
  }

  async function handleRegisterClient() {
    setRegisterError(null);
    if (!registerForm.fullName.trim() || !registerForm.email.trim() || !registerForm.serviceType) {
      setRegisterError('Full name, email, and service type are required.');
      return;
    }
    setRegisterSubmitting(true);

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      setRegisterError('Your session has expired - please sign in again.');
      setRegisterSubmitting(false);
      return;
    }

    try {
      const res = await fetch('/api/admin/create-client', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify(registerForm),
      });
      const data = await res.json();
      if (!res.ok) {
        setRegisterError(data.error ?? 'Something went wrong creating this client.');
        setRegisterSubmitting(false);
        return;
      }
      setRegisterResult({ tempPassword: data.tempPassword, documentsPopulated: data.documentsPopulated });
      refetchClients();
    } catch {
      setRegisterError('Could not reach the server. Check your connection and try again.');
    }
    setRegisterSubmitting(false);
  }

  // ---- Tour Package edit/add ----
  type TourFormState = { id: string | null; name: string; destination: string; nights: string; fromPrice: string; status: string };
  const emptyTourForm: TourFormState = { id: null, name: '', destination: '', nights: '3', fromPrice: '', status: 'active' };
  const [tourModalOpen, setTourModalOpen] = useState(false);
  const [tourForm, setTourForm] = useState<TourFormState>(emptyTourForm);
  const [tourSaving, setTourSaving] = useState(false);
  const [tourError, setTourError] = useState<string | null>(null);

  function openTourModal(tour?: { id: string; name: string; destination: string; nights: number; from_price: number; status: string }) {
    setTourForm(tour
      ? { id: tour.id, name: tour.name, destination: tour.destination, nights: String(tour.nights), fromPrice: String(tour.from_price), status: tour.status }
      : emptyTourForm);
    setTourError(null);
    setTourModalOpen(true);
  }

  async function handleSaveTour() {
    if (!tourForm.name.trim() || !tourForm.fromPrice) { setTourError('Name and price are required.'); return; }
    setTourSaving(true);
    const err = await upsertTourPackage(tourForm.id, {
      name: tourForm.name, destination: tourForm.destination || tourForm.name,
      nights: Number(tourForm.nights) || 3, fromPrice: Number(tourForm.fromPrice),
      perPersonSharing: true, categories: ['Group Tours', 'Honeymoon', 'Solo', 'Family'],
      status: tourForm.status as 'active' | 'hidden',
    });
    setTourSaving(false);
    if (err) { setTourError(err); return; }
    setTourModalOpen(false);
    refetchTours();
  }

  // ---- Masterclass add/edit ----
  type MclassFormState = { id: string | null; title: string; topic: string; classDate: string; classTime: string; format: string; price: string; seatsTotal: string; seatsRemaining: string; status: string; bookingLink: string };
  const emptyMclassForm: MclassFormState = { id: null, title: '', topic: '', classDate: '', classTime: '10:00 AM - 1:00 PM WAT', format: 'Online (Zoom)', price: '', seatsTotal: '30', seatsRemaining: '30', status: 'open', bookingLink: '' };
  const [mclassModalOpen, setMclassModalOpen] = useState(false);
  const [mclassForm, setMclassForm] = useState<MclassFormState>(emptyMclassForm);
  const [mclassSaving, setMclassSaving] = useState(false);
  const [mclassError, setMclassError] = useState<string | null>(null);

  function openMclassModal(mc?: { id: string; title: string; topic: string; class_date: string; class_time: string; format: string; price: number; seats_total: number; seats_remaining: number; status: string; booking_link: string | null }) {
    setMclassForm(mc
      ? { id: mc.id, title: mc.title, topic: mc.topic, classDate: mc.class_date, classTime: mc.class_time, format: mc.format, price: String(mc.price), seatsTotal: String(mc.seats_total), seatsRemaining: String(mc.seats_remaining), status: mc.status, bookingLink: mc.booking_link ?? '' }
      : emptyMclassForm);
    setMclassError(null);
    setMclassModalOpen(true);
  }

  async function handleSaveMclass() {
    if (!mclassForm.title.trim() || !mclassForm.classDate || !mclassForm.price) { setMclassError('Title, date, and price are required.'); return; }
    setMclassSaving(true);
    const err = await upsertMasterclass(mclassForm.id, {
      title: mclassForm.title, topic: mclassForm.topic, classDate: mclassForm.classDate,
      classTime: mclassForm.classTime, format: mclassForm.format, price: Number(mclassForm.price),
      seatsTotal: Number(mclassForm.seatsTotal), seatsRemaining: Number(mclassForm.seatsRemaining),
      status: mclassForm.status as 'open' | 'sold_out' | 'coming_soon' | 'completed',
      bookingLink: mclassForm.bookingLink,
    });
    setMclassSaving(false);
    if (err) { setMclassError(err); return; }
    setMclassModalOpen(false);
    refetchMasterclasses();
  }

  // ---- Add / Approve / Reject Testimonial ----
  const [addTestimonialOpen, setAddTestimonialOpen] = useState(false);
  const [testimonialForm, setTestimonialForm] = useState({ clientName: '', destination: '', category: 'Study', serviceTag: '', quote: '', clientId: '' });
  const [testimonialSubmitting, setTestimonialSubmitting] = useState(false);
  const [testimonialError, setTestimonialError] = useState<string | null>(null);

  function openAddTestimonialModal() {
    setTestimonialForm({ clientName: '', destination: '', category: 'Study', serviceTag: '', quote: '', clientId: '' });
    setTestimonialError(null);
    setAddTestimonialOpen(true);
  }

  async function handleAddTestimonial() {
    setTestimonialError(null);
    if (!testimonialForm.clientName.trim() || !testimonialForm.quote.trim()) {
      setTestimonialError('Client name and quote are required.');
      return;
    }
    setTestimonialSubmitting(true);
    const err = await addTestimonial({
      clientName: testimonialForm.clientName,
      destination: testimonialForm.destination,
      category: testimonialForm.category,
      serviceTag: testimonialForm.serviceTag,
      quote: testimonialForm.quote,
      clientId: testimonialForm.clientId || undefined,
    });
    setTestimonialSubmitting(false);
    if (err) {
      setTestimonialError(err);
      return;
    }
    setAddTestimonialOpen(false);
    refetchTestimonials();
  }

  async function handleTestimonialStatus(id: string, status: 'approved' | 'rejected' | 'pending') {
    await updateTestimonialStatus(id, status);
    refetchTestimonials();
  }

  // ---- Add Manual Payment (real, no serverless function needed - admins
  // already have direct RLS write access to payments) ----
  const [addPaymentOpen, setAddPaymentOpen] = useState(false);
  const [paymentForm, setPaymentForm] = useState({ clientId: '', expectedAmount: '', amountPaid: '', status: 'confirmed' as string, selarOrderId: '' });
  const [paymentSubmitting, setPaymentSubmitting] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  function openAddPaymentModal() {
    setPaymentForm({ clientId: '', expectedAmount: '', amountPaid: '', status: 'confirmed', selarOrderId: '' });
    setPaymentError(null);
    setAddPaymentOpen(true);
  }

  async function handleAddPayment() {
    setPaymentError(null);
    const expected = Number(paymentForm.expectedAmount);
    const paid = Number(paymentForm.amountPaid);
    if (!paymentForm.clientId) {
      setPaymentError('Select which client this payment is for.');
      return;
    }
    if (!expected || expected <= 0) {
      setPaymentError('Enter a valid expected amount.');
      return;
    }
    setPaymentSubmitting(true);
    const err = await addPayment({
      clientId: paymentForm.clientId,
      expectedAmount: expected,
      amountPaid: Number.isFinite(paid) ? paid : 0,
      status: paymentForm.status as Database['public']['Tables']['payments']['Row']['status'],
      selarOrderId: paymentForm.selarOrderId,
    });
    setPaymentSubmitting(false);
    if (err) {
      setPaymentError(err);
      return;
    }
    setAddPaymentOpen(false);
    refetchPayments();
  }

  // ---- Register New Staff (Super Admin only, mirrors client registration) ----
  const [registerStaffOpen, setRegisterStaffOpen] = useState(false);
  const [staffForm, setStaffForm] = useState({ fullName: '', email: '', phone: '', title: 'Visa Consultant' });
  const [staffSubmitting, setStaffSubmitting] = useState(false);
  const [staffError, setStaffError] = useState<string | null>(null);
  const [staffResult, setStaffResult] = useState<{ tempPassword: string } | null>(null);

  function openRegisterStaffModal() {
    setStaffForm({ fullName: '', email: '', phone: '', title: 'Visa Consultant' });
    setStaffError(null);
    setStaffResult(null);
    setRegisterStaffOpen(true);
  }

  async function handleRegisterStaff() {
    setStaffError(null);
    if (!staffForm.fullName.trim() || !staffForm.email.trim()) {
      setStaffError('Full name and email are required.');
      return;
    }
    setStaffSubmitting(true);

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      setStaffError('Your session has expired - please sign in again.');
      setStaffSubmitting(false);
      return;
    }

    try {
      const res = await fetch('/api/admin/create-staff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify(staffForm),
      });
      const data = await res.json();
      if (!res.ok) {
        setStaffError(data.error ?? 'Something went wrong creating this account.');
        setStaffSubmitting(false);
        return;
      }
      setStaffResult({ tempPassword: data.tempPassword });
      refetchStaff();
    } catch {
      setStaffError('Could not reach the server. Check your connection and try again.');
    }
    setStaffSubmitting(false);
  }

  async function handleToggleStaffStatus(staffId: string, currentStatus: string) {
    const newStatus = currentStatus === 'suspended' ? 'active' : 'suspended';
    await updateStaffStatus(staffId, newStatus);
    refetchStaff();
  }

  // ---- Delete Client (real, irreversible - requires typing the name to confirm) ----
  const [deleteTarget, setDeleteTarget] = useState<ClientWithDetails | null>(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  async function handleDeleteClient() {
    if (!deleteTarget) return;
    setDeleteError(null);
    setDeleteSubmitting(true);

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      setDeleteError('Your session has expired - please sign in again.');
      setDeleteSubmitting(false);
      return;
    }

    try {
      const res = await fetch('/api/admin/delete-client', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({ clientId: deleteTarget.id }),
      });
      const data = await res.json();
      if (!res.ok) {
        setDeleteError(data.error ?? 'Something went wrong deleting this client.');
        setDeleteSubmitting(false);
        return;
      }
      setDeleteTarget(null);
      setDeleteConfirmText('');
      refetchClients();
    } catch {
      setDeleteError('Could not reach the server. Check your connection and try again.');
    }
    setDeleteSubmitting(false);
  }

  // Only fire these once someone is confirmed as a signed-in admin - not
  // on the bare login screen (where they'd fail RLS/be blocked anyway,
  // but there's no reason to send them at all before someone's signed in).
  const isAuthedAdmin = !auth.loading && !!auth.userId && (auth.role === 'super_admin' || auth.role === 'staff_admin');
  const { clients, loading: clientsLoading, refetch: refetchClients } = useClients(isAuthedAdmin);
  const dashboardStats = useDashboardStats(isAuthedAdmin);
  const { activity: recentActivity, loading: activityLoading } = useRecentActivity(8, isAuthedAdmin);
  const { submissions, loading: submissionsLoading, refetch: refetchSubmissions } = useContactSubmissions(isAuthedAdmin);
  const isSuperAdmin = !auth.loading && auth.role === 'super_admin';
  const { staff, loading: staffLoading, refetch: refetchStaff } = useStaffList(isSuperAdmin);
  const { payments, loading: paymentsLoading, refetch: refetchPayments } = usePayments(isAuthedAdmin);
  const { testimonials, loading: testimonialsLoading, refetch: refetchTestimonials } = useTestimonials(isAuthedAdmin);
  const { tours: dbTours, loading: toursLoading, refetch: refetchTours } = useTourPackages(isAuthedAdmin);
  const { masterclasses, loading: masterclassesLoading, refetch: refetchMasterclasses } = useMasterclasses(isAuthedAdmin);

  const filteredClients = clients.filter((c) => {
    const name = c.profile?.full_name ?? '';
    const matchesSearch = name.toLowerCase().includes(clientSearch.toLowerCase());
    const matchesService = clientServiceFilter === 'all' || c.service_type === clientServiceFilter;
    return matchesSearch && matchesService;
  });

  // Clients whose most recent application hasn't been updated in 7+ days.
  // These appear in the real notifications bell as actionable alerts.
  const OVERDUE_DAYS = 7;
  const overdueClients = clients.filter((c) => {
    const app = c.applications[0];
    if (!app) return false;
    const daysSince = (Date.now() - new Date(app.stage_updated_at).getTime()) / (1000 * 60 * 60 * 24);
    return daysSince >= OVERDUE_DAYS;
  });


  const filteredInquiries = submissions.filter((i) => inquiryStatusFilter === 'all' || i.status === inquiryStatusFilter);

  async function handleMarkSubmission(id: string, status: 'read' | 'converted' | 'no_action') {
    await updateSubmissionStatus(id, status);
    refetchSubmissions();
  }
  const filteredPayments = payments.filter((p) => paymentsFilter === 'all' || p.status === paymentsFilter);
  const totalReceived = payments.reduce((sum, p) => sum + p.amount_paid, 0);
  const completedCount = payments.filter((p) => p.status === 'confirmed').length;
  const pendingCount = payments.filter((p) => p.status === 'pending' || p.status === 'partially_paid').length;

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
            {auth.suspended && (
              <div className="login-error">This account has been suspended. Contact the CEO if you believe this is a mistake.</div>
            )}
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
        <button className="notif-btn" onClick={() => setNotifOpen((v) => !v)}>
          🔔{overdueClients.length > 0 && <span className="notif-dot" />}
        </button>
        <div className={notifOpen ? 'notif-dropdown open' : 'notif-dropdown'}>
          <div className="notif-dropdown-head">Overdue Clients (7+ days no update)</div>
          {overdueClients.length === 0 ? (
            <div className="notif-item"><div className="t">All caught up</div><div className="s">No clients are overdue right now.</div></div>
          ) : (
            overdueClients.map((c) => (
              <div className="notif-item" key={c.id} style={{ cursor: 'pointer' }} onClick={() => { openCaseModal(c); setNotifOpen(false); }}>
                <div className="t">{c.profile?.full_name ?? 'Unknown'}</div>
                <div className="s">{c.service_type} — click to open case</div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="app">
        <aside className={mobileOpen ? 'sidebar mobile-open' : 'sidebar'}>
          <div className="brand"><img src={logoIcon} alt="Oma Synergies" /><span>ADMIN PANEL</span></div>
          {NAV.filter((sec) => sec.section !== 'Team' || isSuperAdmin).map((sec) => (
            <div key={sec.section}>
              <div className="nav-section-label">{sec.section}</div>
              {sec.items.map((item) => {
                // Live counts only for nav items that have real data behind
                // them so far - everything else stays badge-free rather
                // than showing a stale or fake number.
                const liveBadge =
                  item.id === 'clients' ? clients.length :
                  item.id === 'inquiries' ? dashboardStats.newInquiries :
                  item.id === 'staff' ? staff.length :
                  undefined;
                return (
                  <a
                    key={item.id}
                    className={activeView === item.id ? 'nav-item active' : 'nav-item'}
                    onClick={() => { setActiveView(item.id); setMobileOpen(false); }}
                    style={{ cursor: 'pointer' }}
                  >
                    <span className="ic">{item.icon}</span> {item.label}
                    {!!liveBadge && <span className="nav-badge">{liveBadge}</span>}
                  </a>
                );
              })}
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
                <div className="stat-card"><div className="n">{dashboardStats.loading ? '—' : dashboardStats.activeClients}</div><div className="l">Active Clients</div></div>
                <div className="stat-card"><div className="n">{dashboardStats.loading ? '—' : dashboardStats.newInquiries}</div><div className="l">New Inquiries</div></div>
                <div className="stat-card"><div className="n">{DESTINATIONS.length}</div><div className="l">Destinations Live</div></div>
                <div className="stat-card"><div className="n">{TOURS.length}</div><div className="l">Tours Live</div></div>
              </div>
              <div className="panel">
                <div className="panel-head"><h3>Recent Activity</h3></div>
                {activityLoading ? (
                  <div className="empty-state">Loading…</div>
                ) : recentActivity.length === 0 ? (
                  <div className="empty-state">No activity yet — this fills in as client applications get updated.</div>
                ) : (
                  <table>
                    <thead><tr><th>Client</th><th>Update</th><th>Service</th><th>When</th></tr></thead>
                    <tbody>
                      {recentActivity.map((a) => (
                        <tr key={a.id}>
                          <td><span className="avatar-sm">{getInitials(a.clientName)}</span>{a.clientName}</td>
                          <td>{a.update}</td><td>{a.service}</td><td>{a.when}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
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
                    <button className="btn-add" onClick={openRegisterModal}>+ Add Client</button>
                  </div>
                </div>
                {clientsLoading ? (
                  <div className="empty-state">Loading…</div>
                ) : filteredClients.length === 0 ? (
                  <div className="empty-state">
                    {clients.length === 0
                      ? 'No clients yet. Register your first client to get started.'
                      : 'No clients match this search or filter.'}
                  </div>
                ) : (
                  <table>
                    <thead><tr><th>Client</th><th>Destination</th><th>Service</th><th>Status</th><th></th></tr></thead>
                    <tbody>
                      {filteredClients.map((c) => {
                        const latestApp = c.applications[0];
                        const name = c.profile?.full_name ?? 'Unknown';
                        return (
                          <tr key={c.id}>
                            <td><span className="avatar-sm">{getInitials(name)}</span>{name}</td>
                            <td>{latestApp?.destination ?? '—'}</td><td>{c.service_type}</td>
                            <td><Badge status={latestApp?.stage.replace(/_/g, ' ') ?? 'No application'} /></td>
                            <td className="row-actions">
                              <button className="icon-btn" onClick={() => openCaseModal(c)}>⤢</button>
                              <button className="icon-btn" title="Delete client" onClick={() => setDeleteTarget(c)}>🗑</button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
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
                      <option value="all">All Status</option>
                      <option value="unread">Unread</option>
                      <option value="read">Read</option>
                      <option value="converted">Converted</option>
                      <option value="no_action">No Action Needed</option>
                    </select>
                  </div>
                </div>
                {submissionsLoading ? (
                  <div className="empty-state">Loading…</div>
                ) : filteredInquiries.length === 0 ? (
                  <div className="empty-state">
                    {submissions.length === 0
                      ? 'No inquiries yet - real submissions from the website contact form will appear here.'
                      : 'No inquiries match this filter.'}
                  </div>
                ) : (
                  <table>
                    <thead><tr><th>Name</th><th>Service Interested</th><th>Destination</th><th>Status</th><th></th></tr></thead>
                    <tbody>
                      {filteredInquiries.map((i) => (
                        <tr key={i.id}>
                          <td className="cell-name">{i.full_name}<div className="cell-sub">{i.email}{i.phone ? ` · ${i.phone}` : ''}</div></td>
                          <td>{i.service_interested ?? '—'}</td><td>{i.destination ?? '—'}</td>
                          <td><Badge status={i.status.replace(/_/g, ' ')} /></td>
                          <td className="row-actions">
                            <button className="icon-btn" title="Mark as read" onClick={() => handleMarkSubmission(i.id, 'read')}>✉</button>
                            <button className="icon-btn" title="Mark as converted" onClick={() => handleMarkSubmission(i.id, 'converted')}>✓</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}

          {activeView === 'calendar' && (
            <div className="view active">
              <div className="topbar"><div><div className="page-title">Consultation Calendar</div><div className="page-sub">Key dates from active client applications</div></div></div>
              <div className="panel">
                <div className="panel-head"><h3>Upcoming Key Dates</h3></div>
                <div className="empty-state" style={{ textAlign: 'left', padding: '24px' }}>
                  <p style={{ marginBottom: 8 }}>
                    Key dates (embassy appointments, biometrics, interviews, submission deadlines) are set per-client in the <strong>Clients & Cases</strong> section — open any client's case and update the relevant date fields there.
                  </p>
                  <p>A consolidated calendar view across all clients will be added in a future update. For now, check each client's case for their specific upcoming dates.</p>
                </div>
              </div>
            </div>
          )}

          {activeView === 'documents' && (
            <div className="view active">
              <div className="topbar"><div><div className="page-title">Document Review</div><div className="page-sub">Documents are managed per-client inside each case</div></div></div>
              <div className="panel">
                <div className="panel-head"><h3>Where to Review Documents</h3></div>
                <div className="empty-state" style={{ textAlign: 'left', padding: '24px' }}>
                  <p style={{ marginBottom: 8 }}>
                    Document review happens inside each client's case. Go to <strong>Clients & Cases</strong>, open a client, and use the Document Checklist section to mark documents as Received, Under Review, Approved, or Rejected (with a reason the client will see in their portal).
                  </p>
                  <p>A cross-client "documents pending review" view is planned for a future update once client volume makes it necessary.</p>
                </div>
              </div>
            </div>
          )}

          {activeView === 'payments' && (
            <div className="view active">
              <div className="topbar">
                <div><div className="page-title">Payments</div><div className="page-sub">Manually recorded until Selar checkout syncs automatically</div></div>
                <button className="btn-add" onClick={openAddPaymentModal}>+ Add Payment</button>
              </div>
              <div className="stat-cards">
                <div className="stat-card"><div className="n">{formatNaira(totalReceived)}</div><div className="l">Total Received</div></div>
                <div className="stat-card"><div className="n">{completedCount}</div><div className="l">Completed Payments</div></div>
                <div className="stat-card"><div className="n">{pendingCount}</div><div className="l">Pending</div></div>
              </div>
              <div className="panel">
                <div className="panel-head">
                  <h3>All Transactions ({filteredPayments.length})</h3>
                  <div className="toolbar">
                    <select className="select-filter" value={paymentsFilter} onChange={(e) => setPaymentsFilter(e.target.value)}>
                      <option value="all">All Status</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="pending">Pending</option>
                      <option value="partially_paid">Partially Paid</option>
                      <option value="refunded">Refunded</option>
                    </select>
                  </div>
                </div>
                {paymentsLoading ? (
                  <div className="empty-state">Loading…</div>
                ) : filteredPayments.length === 0 ? (
                  <div className="empty-state">
                    {payments.length === 0
                      ? 'No payments recorded yet.'
                      : 'No payments match this filter.'}
                  </div>
                ) : (
                  <table>
                    <thead><tr><th>Client</th><th>Expected</th><th>Paid</th><th>Selar Ref</th><th>Status</th></tr></thead>
                    <tbody>
                      {filteredPayments.map((p) => (
                        <tr key={p.id}>
                          <td className="cell-name">{p.clientName}</td>
                          <td>{formatNaira(p.expected_amount)}</td>
                          <td>{formatNaira(p.amount_paid)}</td>
                          <td>{p.selar_order_id ?? '—'}</td>
                          <td><Badge status={p.status.replace(/_/g, ' ')} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}

          {activeView === 'testimonials' && (
            <div className="view active">
              <div className="topbar">
                <div><div className="page-title">Testimonials</div><div className="page-sub">Approved testimonials show live on the Success Stories page and homepage</div></div>
                <button className="btn-add" onClick={openAddTestimonialModal}>+ Add Testimonial</button>
              </div>
              <div className="panel">
                <div className="panel-head"><h3>All Testimonials ({testimonials.length})</h3></div>
                {testimonialsLoading ? (
                  <div className="empty-state">Loading…</div>
                ) : testimonials.length === 0 ? (
                  <div className="empty-state">No testimonials yet.</div>
                ) : (
                  <table>
                    <thead><tr><th>Client</th><th>Destination</th><th>Category</th><th>Status</th><th></th></tr></thead>
                    <tbody>
                      {testimonials.map((t) => (
                        <tr key={t.id}>
                          <td><span className="avatar-sm">{getInitials(t.client_name)}</span>{t.client_name}</td>
                          <td>{t.destination ?? '—'}</td><td>{t.category ?? '—'}</td>
                          <td><Badge status={t.status} /></td>
                          <td className="row-actions">
                            {t.status !== 'approved' && <button className="icon-btn" title="Approve - shows live on site" onClick={() => handleTestimonialStatus(t.id, 'approved')}>✓</button>}
                            {t.status !== 'rejected' && <button className="icon-btn" title="Reject - hides from site" onClick={() => handleTestimonialStatus(t.id, 'rejected')}>✕</button>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}

          {activeView === 'destinations' && (
            <div className="view active">
              <div className="topbar"><div><div className="page-title">Destinations</div><div className="page-sub">The 12 flagship destinations are managed in code — contact your developer to add or remove one. Processing times are editable here once tours are seeded.</div></div></div>
              <div className="panel">
                <div className="panel-head"><h3>Flagship Destinations (12)</h3></div>
                <div className="empty-state" style={{ textAlign: 'left', padding: '24px' }}>
                  <p style={{ marginBottom: 8 }}>Destination content (names, regions, photos, detail pages) is bundled as part of the site build. This is because each destination has its own photo imported as a code asset — making them editable without a full rebuild would require setting up Supabase Storage for image hosting first.</p>
                  <p>For now: to update a processing time or add a destination, send the details and it can be updated in one commit. Tour package prices and availability are fully editable from the Tours section below.</p>
                </div>
              </div>
            </div>
          )}

          {activeView === 'tours' && (
            <div className="view active">
              <div className="topbar">
                <div><div className="page-title">Tours & Packages</div><div className="page-sub">Prices and availability update live on the site immediately</div></div>
                <button className="btn-add" onClick={() => openTourModal()}>+ Add Package</button>
              </div>
              <div className="panel">
                <div className="panel-head"><h3>All Packages ({dbTours.length})</h3></div>
                {toursLoading ? (
                  <div className="empty-state">Loading… (run migration 0003_seed_tours.sql in Supabase if this stays empty)</div>
                ) : dbTours.length === 0 ? (
                  <div className="empty-state">No tour packages in the database yet. Run supabase/migrations/0003_seed_tours.sql to seed the existing 9 packages, then they'll appear here.</div>
                ) : (
                  <table>
                    <thead><tr><th>Package</th><th>Nights</th><th>From Price</th><th>Status</th><th></th></tr></thead>
                    <tbody>
                      {dbTours.map((t) => (
                        <tr key={t.id}>
                          <td className="cell-name">{t.name}</td>
                          <td>{t.nights} nights</td>
                          <td>{formatNaira(t.from_price)}</td>
                          <td><Badge status={t.status} /></td>
                          <td className="row-actions">
                            <button className="icon-btn" title="Edit" onClick={() => openTourModal(t)}>✎</button>
                            <button className="icon-btn" title={t.status === 'hidden' ? 'Show on site' : 'Hide from site'} onClick={() => updateTourStatus(t.id, t.status === 'hidden' ? 'active' : 'hidden').then(() => refetchTours())}>
                              {t.status === 'hidden' ? '👁' : '🚫'}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              <div className="panel" style={{ marginTop: 24 }}>
                <div className="panel-head">
                  <h3>Masterclasses ({masterclasses.length})</h3>
                  <button className="btn-add" onClick={() => openMclassModal()}>+ Add Session</button>
                </div>
                {masterclassesLoading ? (
                  <div className="empty-state">Loading…</div>
                ) : masterclasses.length === 0 ? (
                  <div className="empty-state">No masterclass sessions yet. Add the first one with the button above.</div>
                ) : (
                  <table>
                    <thead><tr><th>Title</th><th>Date</th><th>Price</th><th>Seats Left</th><th>Status</th><th></th></tr></thead>
                    <tbody>
                      {masterclasses.map((m) => (
                        <tr key={m.id}>
                          <td className="cell-name">{m.title}</td>
                          <td>{m.class_date}</td>
                          <td>{formatNaira(m.price)}</td>
                          <td>{m.seats_remaining} / {m.seats_total}</td>
                          <td><Badge status={m.status.replace(/_/g, ' ')} /></td>
                          <td className="row-actions"><button className="icon-btn" onClick={() => openMclassModal(m)}>✎</button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}

          {activeView === 'staff' && (
            <div className="view active">
              {!isSuperAdmin ? (
                <div className="empty-state">Staff management is restricted to the Super Admin account.</div>
              ) : (
                <>
                  <div className="topbar">
                    <div><div className="page-title">Staff & Roles</div><div className="page-sub">Manage team access to the admin panel</div></div>
                    <button className="btn-add" onClick={openRegisterStaffModal}>+ Add Staff</button>
                  </div>
                  <div className="panel">
                    <div className="panel-head"><h3>Team Members ({staff.length})</h3></div>
                    {staffLoading ? (
                      <div className="empty-state">Loading…</div>
                    ) : (
                      <table>
                        <thead><tr><th>Name</th><th>Role</th><th>Active Clients</th><th>Status</th><th></th></tr></thead>
                        <tbody>
                          {staff.map((s) => (
                            <tr key={s.id}>
                              <td><span className="avatar-sm">{getInitials(s.full_name)}</span>{s.full_name}{s.id === auth.userId && ' (you)'}</td>
                              <td>{s.role === 'super_admin' ? 'Super Admin' : (s.title || 'Staff Admin')}</td>
                              <td>{s.clientCount}</td>
                              <td><Badge status={s.status === 'active' ? 'Active' : 'Suspended'} /></td>
                              <td className="row-actions">
                                {s.role !== 'super_admin' && (
                                  <button className="icon-btn" title={s.status === 'suspended' ? 'Reactivate' : 'Suspend'} onClick={() => handleToggleStaffStatus(s.id, s.status)}>
                                    {s.status === 'suspended' ? '↺' : '⏸'}
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </>
              )}
            </div>
          )}
        </main>
      </div>

      {tourModalOpen && (
        <div className="modal-overlay open" onClick={(e) => { if (e.target === e.currentTarget && !tourSaving) setTourModalOpen(false); }}>
          <div className="modal" style={{ maxWidth: 460 }}>
            <div className="modal-head">
              <div><h3>{tourForm.id ? 'Edit Package' : 'Add Package'}</h3></div>
              <button className="modal-close" onClick={() => setTourModalOpen(false)}>✕</button>
            </div>
            <div className="form-row"><label>Package Name</label><input type="text" value={tourForm.name} onChange={(e) => setTourForm((f) => ({ ...f, name: e.target.value }))} /></div>
            <div className="form-row"><label>Destination (if different from name)</label><input type="text" value={tourForm.destination} onChange={(e) => setTourForm((f) => ({ ...f, destination: e.target.value }))} /></div>
            <div className="form-two">
              <div className="form-row"><label>Nights</label><input type="number" value={tourForm.nights} onChange={(e) => setTourForm((f) => ({ ...f, nights: e.target.value }))} /></div>
              <div className="form-row"><label>From Price (₦)</label><input type="number" value={tourForm.fromPrice} onChange={(e) => setTourForm((f) => ({ ...f, fromPrice: e.target.value }))} /></div>
            </div>
            <div className="form-row">
              <label>Status</label>
              <select value={tourForm.status} onChange={(e) => setTourForm((f) => ({ ...f, status: e.target.value }))}>
                <option value="active">Active — visible on site</option>
                <option value="hidden">Hidden — not shown</option>
              </select>
            </div>
            {tourError && <div className="login-error">{tourError}</div>}
            <div className="modal-actions">
              <button className="btn-save" onClick={handleSaveTour} disabled={tourSaving}>{tourSaving ? 'Saving…' : 'Save'}</button>
              <button className="icon-btn" style={{ width: 'auto', padding: '0 16px' }} onClick={() => setTourModalOpen(false)} disabled={tourSaving}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {mclassModalOpen && (
        <div className="modal-overlay open" onClick={(e) => { if (e.target === e.currentTarget && !mclassSaving) setMclassModalOpen(false); }}>
          <div className="modal" style={{ maxWidth: 520 }}>
            <div className="modal-head">
              <div><h3>{mclassForm.id ? 'Edit Masterclass' : 'Add Masterclass Session'}</h3></div>
              <button className="modal-close" onClick={() => setMclassModalOpen(false)}>✕</button>
            </div>
            <div className="form-row"><label>Title</label><input type="text" placeholder="UK Student Visa Masterclass" value={mclassForm.title} onChange={(e) => setMclassForm((f) => ({ ...f, title: e.target.value }))} /></div>
            <div className="form-row"><label>Topic (what's covered)</label><textarea value={mclassForm.topic} onChange={(e) => setMclassForm((f) => ({ ...f, topic: e.target.value }))} /></div>
            <div className="form-two">
              <div className="form-row"><label>Date</label><input type="date" value={mclassForm.classDate} onChange={(e) => setMclassForm((f) => ({ ...f, classDate: e.target.value }))} /></div>
              <div className="form-row"><label>Time</label><input type="text" placeholder="10:00 AM - 1:00 PM WAT" value={mclassForm.classTime} onChange={(e) => setMclassForm((f) => ({ ...f, classTime: e.target.value }))} /></div>
            </div>
            <div className="form-two">
              <div className="form-row">
                <label>Format</label>
                <select value={mclassForm.format} onChange={(e) => setMclassForm((f) => ({ ...f, format: e.target.value }))}>
                  <option>Online (Zoom)</option>
                  <option>In-Person, Abuja</option>
                  <option>Hybrid</option>
                </select>
              </div>
              <div className="form-row"><label>Price (₦)</label><input type="number" value={mclassForm.price} onChange={(e) => setMclassForm((f) => ({ ...f, price: e.target.value }))} /></div>
            </div>
            <div className="form-two">
              <div className="form-row"><label>Total Seats</label><input type="number" value={mclassForm.seatsTotal} onChange={(e) => setMclassForm((f) => ({ ...f, seatsTotal: e.target.value }))} /></div>
              <div className="form-row"><label>Seats Remaining</label><input type="number" value={mclassForm.seatsRemaining} onChange={(e) => setMclassForm((f) => ({ ...f, seatsRemaining: e.target.value }))} /></div>
            </div>
            <div className="form-two">
              <div className="form-row">
                <label>Status</label>
                <select value={mclassForm.status} onChange={(e) => setMclassForm((f) => ({ ...f, status: e.target.value }))}>
                  <option value="open">Open</option>
                  <option value="sold_out">Sold Out</option>
                  <option value="coming_soon">Coming Soon</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
              <div className="form-row"><label>Booking Link</label><input type="text" placeholder="Selar link or WhatsApp URL" value={mclassForm.bookingLink} onChange={(e) => setMclassForm((f) => ({ ...f, bookingLink: e.target.value }))} /></div>
            </div>
            {mclassError && <div className="login-error">{mclassError}</div>}
            <div className="modal-actions">
              <button className="btn-save" onClick={handleSaveMclass} disabled={mclassSaving}>{mclassSaving ? 'Saving…' : 'Save'}</button>
              <button className="icon-btn" style={{ width: 'auto', padding: '0 16px' }} onClick={() => setMclassModalOpen(false)} disabled={mclassSaving}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {addTestimonialOpen && (
        <div className="modal-overlay open" onClick={(e) => { if (e.target === e.currentTarget && !testimonialSubmitting) setAddTestimonialOpen(false); }}>
          <div className="modal" style={{ maxWidth: 480 }}>
            <div className="modal-head">
              <div><h3>Add Testimonial</h3><div className="page-sub">Saved as Pending until you approve it - won't show live until then</div></div>
              <button className="modal-close" onClick={() => setAddTestimonialOpen(false)}>✕</button>
            </div>
            <div className="form-row">
              <label>Client Name</label>
              <input type="text" placeholder="Egwu A." value={testimonialForm.clientName} onChange={(e) => setTestimonialForm((f) => ({ ...f, clientName: e.target.value }))} />
            </div>
            <div className="form-two">
              <div className="form-row">
                <label>Destination / Institution</label>
                <input type="text" placeholder="University of West Scotland, UK" value={testimonialForm.destination} onChange={(e) => setTestimonialForm((f) => ({ ...f, destination: e.target.value }))} />
              </div>
              <div className="form-row">
                <label>Category</label>
                <select value={testimonialForm.category} onChange={(e) => setTestimonialForm((f) => ({ ...f, category: e.target.value }))}>
                  <option value="Study">Study</option>
                  <option value="Tourist">Tourist</option>
                  <option value="Business">Business</option>
                </select>
              </div>
            </div>
            <div className="form-row">
              <label>Service Tag (shown as badge)</label>
              <input type="text" placeholder="Study Visa" value={testimonialForm.serviceTag} onChange={(e) => setTestimonialForm((f) => ({ ...f, serviceTag: e.target.value }))} />
            </div>
            <div className="form-row">
              <label>Link to Existing Client (optional)</label>
              <select value={testimonialForm.clientId} onChange={(e) => setTestimonialForm((f) => ({ ...f, clientId: e.target.value }))}>
                <option value="">None — manually entered</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>{c.profile?.full_name ?? 'Unknown'}</option>
                ))}
              </select>
            </div>
            <div className="form-row">
              <label>Quote</label>
              <textarea style={{ minHeight: 100 }} placeholder="The entire process was smooth..." value={testimonialForm.quote} onChange={(e) => setTestimonialForm((f) => ({ ...f, quote: e.target.value }))} />
            </div>
            {testimonialError && <div className="login-error">{testimonialError}</div>}
            <div className="modal-actions">
              <button className="btn-save" onClick={handleAddTestimonial} disabled={testimonialSubmitting}>{testimonialSubmitting ? 'Saving…' : 'Save as Pending'}</button>
              <button className="icon-btn" style={{ width: 'auto', padding: '0 16px' }} onClick={() => setAddTestimonialOpen(false)} disabled={testimonialSubmitting}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {addPaymentOpen && (
        <div className="modal-overlay open" onClick={(e) => { if (e.target === e.currentTarget && !paymentSubmitting) setAddPaymentOpen(false); }}>
          <div className="modal" style={{ maxWidth: 460 }}>
            <div className="modal-head">
              <div><h3>Record a Payment</h3><div className="page-sub">For cash, bank transfer, or any payment not yet auto-synced from Selar</div></div>
              <button className="modal-close" onClick={() => setAddPaymentOpen(false)}>✕</button>
            </div>
            <div className="form-row">
              <label>Client</label>
              <select value={paymentForm.clientId} onChange={(e) => setPaymentForm((f) => ({ ...f, clientId: e.target.value }))}>
                <option value="">Select a client</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>{c.profile?.full_name ?? 'Unknown'} — {c.service_type}</option>
                ))}
              </select>
            </div>
            <div className="form-two">
              <div className="form-row">
                <label>Expected Amount (₦)</label>
                <input type="number" placeholder="150000" value={paymentForm.expectedAmount} onChange={(e) => setPaymentForm((f) => ({ ...f, expectedAmount: e.target.value }))} />
              </div>
              <div className="form-row">
                <label>Amount Paid (₦)</label>
                <input type="number" placeholder="150000" value={paymentForm.amountPaid} onChange={(e) => setPaymentForm((f) => ({ ...f, amountPaid: e.target.value }))} />
              </div>
            </div>
            <div className="form-row">
              <label>Status</label>
              <select value={paymentForm.status} onChange={(e) => setPaymentForm((f) => ({ ...f, status: e.target.value }))}>
                <option value="confirmed">Confirmed</option>
                <option value="pending">Pending</option>
                <option value="partially_paid">Partially Paid</option>
              </select>
            </div>
            <div className="form-row">
              <label>Reference (optional)</label>
              <input type="text" placeholder="Selar order ID, bank transfer ref, etc." value={paymentForm.selarOrderId} onChange={(e) => setPaymentForm((f) => ({ ...f, selarOrderId: e.target.value }))} />
            </div>
            {paymentError && <div className="login-error">{paymentError}</div>}
            <div className="modal-actions">
              <button className="btn-save" onClick={handleAddPayment} disabled={paymentSubmitting}>{paymentSubmitting ? 'Saving…' : 'Record Payment'}</button>
              <button className="icon-btn" style={{ width: 'auto', padding: '0 16px' }} onClick={() => setAddPaymentOpen(false)} disabled={paymentSubmitting}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {registerStaffOpen && (
        <div className="modal-overlay open" onClick={(e) => { if (e.target === e.currentTarget && !staffSubmitting) setRegisterStaffOpen(false); }}>
          <div className="modal" style={{ maxWidth: 480 }}>
            {staffResult ? (
              <>
                <div className="modal-head">
                  <div><h3>Staff Account Created</h3><div className="page-sub">Share these login details with them directly - they won't be shown again</div></div>
                  <button className="modal-close" onClick={() => setRegisterStaffOpen(false)}>✕</button>
                </div>
                <div className="form-row"><label>Email</label><input type="text" readOnly value={staffForm.email} /></div>
                <div className="form-row"><label>Temporary Password</label><input type="text" readOnly value={staffResult.tempPassword} /></div>
                <div className="modal-actions">
                  <button className="btn-save" onClick={() => setRegisterStaffOpen(false)}>Done</button>
                </div>
              </>
            ) : (
              <>
                <div className="modal-head">
                  <div><h3>Add Staff Member</h3><div className="page-sub">Creates their admin login automatically</div></div>
                  <button className="modal-close" onClick={() => setRegisterStaffOpen(false)}>✕</button>
                </div>
                <div className="form-row"><label>Full Name</label><input type="text" placeholder="Adaeze Okafor" value={staffForm.fullName} onChange={(e) => setStaffForm((f) => ({ ...f, fullName: e.target.value }))} /></div>
                <div className="form-row"><label>Email</label><input type="email" placeholder="adaeze@omasynergiestravel.com" value={staffForm.email} onChange={(e) => setStaffForm((f) => ({ ...f, email: e.target.value }))} /></div>
                <div className="form-row"><label>Phone</label><input type="text" placeholder="0801 234 5678" value={staffForm.phone} onChange={(e) => setStaffForm((f) => ({ ...f, phone: e.target.value }))} /></div>
                <div className="form-row">
                  <label>Title</label>
                  <select value={staffForm.title} onChange={(e) => setStaffForm((f) => ({ ...f, title: e.target.value }))}>
                    <option>Visa Consultant</option>
                    <option>Travel Coordinator</option>
                    <option>Admissions Officer</option>
                  </select>
                </div>
                {staffError && <div className="login-error">{staffError}</div>}
                <div className="modal-actions">
                  <button className="btn-save" onClick={handleRegisterStaff} disabled={staffSubmitting}>{staffSubmitting ? 'Creating…' : 'Create Account'}</button>
                  <button className="icon-btn" style={{ width: 'auto', padding: '0 16px' }} onClick={() => setRegisterStaffOpen(false)} disabled={staffSubmitting}>Cancel</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {caseModalClient && (
        <div className="modal-overlay open" onClick={(e) => { if (e.target === e.currentTarget) setCaseModalClient(null); }}>
          <div className="modal">
            <div className="modal-head">
              <div><h3>{caseModalClient.profile?.full_name ?? 'Unknown'}'s Case</h3><div className="page-sub">{caseApplication?.destination ?? '—'} · {caseModalClient.service_type}</div></div>
              <button className="modal-close" onClick={() => setCaseModalClient(null)}>✕</button>
            </div>

            {!caseApplication ? (
              <div className="empty-state">No application record exists for this client yet.</div>
            ) : (
              <>
                <div className="track-group">
                  <div className="track-label">Application Stage</div>
                  <div className="track-row">
                    <span className="step-name">Current stage</span>
                    <select className="status-select" value={caseStageEdit} onChange={(e) => setCaseStageEdit(e.target.value)}>
                      <option value="documents_requested">Documents Requested</option>
                      <option value="documents_received">Documents Received</option>
                      <option value="application_prepared">Application Prepared</option>
                      <option value="submitted">Submitted</option>
                      <option value="decision_pending">Decision Pending</option>
                      <option value="approved">Approved</option>
                      <option value="refused">Refused</option>
                      <option value="withdrawn">Withdrawn</option>
                    </select>
                  </div>
                </div>

                <div className="track-group">
                  <div className="track-label">Document Checklist {caseDocuments.length > 0 && `(${caseDocuments.length})`}</div>
                  {caseDocuments.length === 0 ? (
                    <div className="empty-state" style={{ padding: '16px 0' }}>No documents on this checklist.</div>
                  ) : (
                    caseDocuments.map((doc) => (
                      <div key={doc.id}>
                        <div className="track-row">
                          <span className="step-name">{doc.document_name}{caseDocSavingId === doc.id && ' — saving…'}</span>
                          <select
                            className="status-select"
                            value={doc.status}
                            onChange={(e) => handleDocumentStatusChange(doc.id, e.target.value)}
                          >
                            <option value="required">Required</option>
                            <option value="pending">Pending</option>
                            <option value="received">Received</option>
                            <option value="under_review">Under Review</option>
                            <option value="approved">Approved</option>
                            <option value="rejected">Rejected</option>
                            <option value="submitted_to_embassy">Submitted to Embassy</option>
                            <option value="returned">Returned</option>
                          </select>
                        </div>
                        {doc.status === 'rejected' && (
                          <input
                            type="text"
                            placeholder="Reason for rejection (shown to client)"
                            defaultValue={doc.rejection_reason ?? ''}
                            onChange={(e) => setCaseRejectReasons((r) => ({ ...r, [doc.id]: e.target.value }))}
                            onBlur={() => handleRejectionReasonBlur(doc.id)}
                            style={{ width: '100%', marginTop: '-8px', marginBottom: '10px', padding: '8px 10px', fontSize: '12.5px', borderRadius: '8px', border: '1px solid var(--line-dark)' }}
                          />
                        )}
                      </div>
                    ))
                  )}
                </div>

                <div className="track-group">
                  <div className="track-label">Message to Client (they'll see this in their portal)</div>
                  <textarea className="notes-box" value={caseClientMessage} onChange={(e) => setCaseClientMessage(e.target.value)} placeholder="e.g. Your file has been submitted to the embassy. No action needed from you right now." />
                </div>

                <div className="track-group">
                  <div className="track-label">Internal Notes (not visible to client)</div>
                  <textarea className="notes-box" value={caseAdminNotes} onChange={(e) => setCaseAdminNotes(e.target.value)} />
                </div>

                {caseSaveError && <div className="login-error">{caseSaveError}</div>}
                {caseSaveSuccess && <div className="login-note">Saved.</div>}

                <div className="modal-actions">
                  <button className="btn-save" onClick={handleSaveCase} disabled={caseSaving}>{caseSaving ? 'Saving…' : 'Save Changes'}</button>
                  <button className="icon-btn" style={{ width: 'auto', padding: '0 16px' }} onClick={() => setCaseModalClient(null)}>Close</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {deleteTarget && (
        <div className="modal-overlay open" onClick={(e) => { if (e.target === e.currentTarget && !deleteSubmitting) { setDeleteTarget(null); setDeleteConfirmText(''); } }}>
          <div className="modal" style={{ maxWidth: 460 }}>
            <div className="modal-head">
              <div><h3>Delete {deleteTarget.profile?.full_name ?? 'this client'}?</h3><div className="page-sub">This permanently removes their login, application, documents, and message history. It cannot be undone.</div></div>
              <button className="modal-close" onClick={() => { setDeleteTarget(null); setDeleteConfirmText(''); }}>✕</button>
            </div>
            <div className="form-row">
              <label>Type "{deleteTarget.profile?.full_name}" to confirm</label>
              <input
                type="text"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder={deleteTarget.profile?.full_name ?? ''}
              />
            </div>
            {deleteError && <div className="login-error">{deleteError}</div>}
            <div className="modal-actions">
              <button
                className="login-btn"
                style={{ background: '#B3261E' }}
                disabled={deleteSubmitting || !deleteTarget.profile?.full_name || deleteConfirmText !== deleteTarget.profile.full_name}
                onClick={handleDeleteClient}
              >
                {deleteSubmitting ? 'Deleting…' : 'Delete Permanently'}
              </button>
              <button className="icon-btn" style={{ width: 'auto', padding: '0 16px' }} onClick={() => { setDeleteTarget(null); setDeleteConfirmText(''); }} disabled={deleteSubmitting}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {registerOpen && (
        <div className="modal-overlay open" onClick={(e) => { if (e.target === e.currentTarget && !registerSubmitting) setRegisterOpen(false); }}>
          <div className="modal" style={{ maxWidth: 480 }}>
            {registerResult ? (
              <>
                <div className="modal-head">
                  <div><h3>Client Registered</h3><div className="page-sub">Share these login details with them directly - they won't be shown again</div></div>
                  <button className="modal-close" onClick={() => setRegisterOpen(false)}>✕</button>
                </div>
                <div className="form-row">
                  <label>Email</label>
                  <input type="text" readOnly value={registerForm.email} />
                </div>
                <div className="form-row">
                  <label>Temporary Password</label>
                  <input type="text" readOnly value={registerResult.tempPassword} />
                </div>
                <div className="login-note">
                  {registerResult.documentsPopulated > 0
                    ? `${registerResult.documentsPopulated} document checklist items were auto-added based on "${registerForm.serviceType}".`
                    : `No document template exists yet for "${registerForm.serviceType}" - add items manually from the client's case.`}
                </div>
                <div className="modal-actions">
                  <button className="btn-save" onClick={() => setRegisterOpen(false)}>Done</button>
                </div>
              </>
            ) : (
              <>
                <div className="modal-head">
                  <div><h3>Register New Client</h3><div className="page-sub">Creates their login automatically - share the password with them yourself for now</div></div>
                  <button className="modal-close" onClick={() => setRegisterOpen(false)}>✕</button>
                </div>
                <div className="form-row">
                  <label>Full Name</label>
                  <input type="text" placeholder="Jane Okafor" value={registerForm.fullName} onChange={(e) => setRegisterForm((f) => ({ ...f, fullName: e.target.value }))} />
                </div>
                <div className="form-row">
                  <label>Email</label>
                  <input type="email" placeholder="jane@example.com" value={registerForm.email} onChange={(e) => setRegisterForm((f) => ({ ...f, email: e.target.value }))} />
                </div>
                <div className="form-row">
                  <label>Phone</label>
                  <input type="text" placeholder="0801 234 5678" value={registerForm.phone} onChange={(e) => setRegisterForm((f) => ({ ...f, phone: e.target.value }))} />
                </div>
                <div className="form-row">
                  <label>Service Type</label>
                  <select value={registerForm.serviceType} onChange={(e) => setRegisterForm((f) => ({ ...f, serviceType: e.target.value }))}>
                    <option>UK Study Visa</option>
                    <option>Tourist Visa</option>
                    <option>Business Visa</option>
                  </select>
                </div>
                <div className="form-row">
                  <label>Destination (optional)</label>
                  <input type="text" placeholder="United Kingdom" value={registerForm.destination} onChange={(e) => setRegisterForm((f) => ({ ...f, destination: e.target.value }))} />
                </div>
                {registerError && <div className="login-error">{registerError}</div>}
                <div className="modal-actions">
                  <button className="btn-save" onClick={handleRegisterClient} disabled={registerSubmitting}>
                    {registerSubmitting ? 'Creating…' : 'Create Account'}
                  </button>
                  <button className="icon-btn" style={{ width: 'auto', padding: '0 16px' }} onClick={() => setRegisterOpen(false)} disabled={registerSubmitting}>Cancel</button>
                </div>
              </>
            )}
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
