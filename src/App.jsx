import { useMemo, useCallback, useEffect, lazy, Suspense, useState, useRef } from 'react';
import {
  Routes,
  Route,
  Navigate,
  useNavigate,
  useLocation,
  useParams,
  Outlet,
} from 'react-router-dom';
import { PageLayout } from './components/layout/PageLayout';
import { Pipeline } from './pages/Candidates/Pipeline/Pipeline';
import { JobList } from './pages/Jobs/JobManagement/JobList';
import { MockList } from './pages/Mocks/MockManagement/MockList/MockList';
import { Overview } from './pages/CompanyTeam/Overview/Overview';
import { Button } from './components/ui/Button';
import { EmptyState } from './components/ui/EmptyState';
import { getJoinRequestById } from './api';
import { buildApplicationContext, getApplicationSharePath } from './api';
import { getCandidateBySlug } from './api';
import {
  APPLICATION,
  CURRENT_USER_ID,
  JOBS,
  MOCKS,
  TEAM_MEMBERS,
  canCurrentUser,
  getCurrentUserRole,
  removeMock,
  useBackendData,
} from './api';
import { LoginPage } from './pages/Auth/LoginPage';
import { CompanyJoinPage } from './pages/Auth/CompanyJoinPage';
import {
  Users,
  Briefcase,
  FileText,
  Building2,
  UserCircle2,
  Settings,
  Hash,
  ClipboardCheck,
  Plus,
} from 'lucide-react';

// ── Lazy-loaded pages (code-split at route level) ──
const CandidateDetails = lazy(() =>
  import('./pages/Candidates/CandidateDetails/CandidateDetails').then((m) => ({
    default: m.CandidateDetails,
  }))
);
const JobDetails = lazy(() =>
  import('./pages/Jobs/JobManagement/JobDetails').then((m) => ({ default: m.JobDetails }))
);
const CreateConfig = lazy(() =>
  import('./pages/Jobs/JobConfigPage').then((m) => ({ default: m.CreateConfig }))
);
const EditConfig = lazy(() =>
  import('./pages/Jobs/JobConfigPage').then((m) => ({ default: m.EditConfig }))
);
const MockDetails = lazy(() =>
  import('./pages/Mocks/MockManagement/MockDetails/MockDetails').then((m) => ({
    default: m.MockDetails,
  }))
);
const CreateMockConfig = lazy(() =>
  import('./pages/Mocks/MockConfigPage').then((m) => ({ default: m.CreateMockConfig }))
);
const EditMockConfig = lazy(() =>
  import('./pages/Mocks/MockConfigPage').then((m) => ({ default: m.EditMockConfig }))
);
const MemberDetails = lazy(() =>
  import('./pages/CompanyTeam/MemberDetails/MemberDetails').then((m) => ({
    default: m.MemberDetails,
  }))
);
const AddMembers = lazy(() =>
  import('./pages/CompanyTeam/AddMembers/AddMembers').then((m) => ({
    default: m.AddMembers,
  }))
);
const CompanySettings = lazy(() =>
  import('./pages/CompanyTeam/CompanySettings/CompanySettings').then((m) => ({
    default: m.CompanySettings,
  }))
);
const ProfilePage = lazy(() => import('./pages/Profile').then((m) => ({ default: m.ProfilePage })));
const SettingsPage = lazy(() =>
  import('./pages/Settings').then((m) => ({ default: m.SettingsPage }))
);
const JobLanding = lazy(() =>
  import('./pages/Application').then((m) => ({ default: m.JobLanding }))
);
const CandidateForm = lazy(() =>
  import('./pages/Application').then((m) => ({ default: m.CandidateForm }))
);
const JobOverview = lazy(() =>
  import('./pages/Application').then((m) => ({ default: m.JobOverview }))
);
const MockSession = lazy(() =>
  import('./pages/Application').then((m) => ({ default: m.MockSession }))
);
const SubmissionComplete = lazy(() =>
  import('./pages/Application').then((m) => ({ default: m.SubmissionComplete }))
);
const ComponentShowcase = lazy(() =>
  import('./pages/_showcase').then((m) => ({ default: m.ComponentShowcase }))
);

// ── Static config ──
// ── Route → breadcrumb mapping ──
function getRouteBreadcrumbs(pathname, navigate) {
  if (pathname === '/candidates') return [{ label: 'Candidates' }];
  if (/^\/candidates\/[a-z0-9-]+$/.test(pathname)) {
    const slug = pathname.split('/').pop();
    const name = slug
      .split('-')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
    return [{ label: 'Candidates', onClick: () => navigate('/candidates') }, { label: name }];
  }

  if (pathname === '/jobs') return [{ label: 'Job Management' }];
  if (pathname === '/jobs/create') return [{ label: 'Create Job' }];
  if (/^\/jobs\/[^/]+$/.test(pathname))
    return [
      { label: 'Job Management', onClick: () => navigate('/jobs') },
      { label: 'Job Details' },
    ];
  if (/^\/jobs\/[^/]+\/edit$/.test(pathname))
    return [{ label: 'Job Management', onClick: () => navigate('/jobs') }, { label: 'Edit Job' }];

  if (pathname === '/mocks') return [{ label: 'Mock Management' }];
  if (pathname === '/mocks/create') return [{ label: 'Create Mock' }];
  if (/^\/mocks\/[^/]+$/.test(pathname))
    return [
      { label: 'Mock Management', onClick: () => navigate('/mocks') },
      { label: 'Mock Details' },
    ];
  if (/^\/mocks\/[^/]+\/edit$/.test(pathname))
    return [
      { label: 'Mock Management', onClick: () => navigate('/mocks') },
      { label: 'Edit Mock' },
    ];

  if (pathname === '/company') return [{ label: 'Overview' }];
  if (/^\/company\/team\/[^/]+$/.test(pathname))
    return [
      { label: 'Overview', onClick: () => navigate('/company') },
      { label: 'Member Details' },
    ];
  if (pathname === '/company/members') return [{ label: 'Add Members' }];
  if (/^\/company\/members\/[^/]+$/.test(pathname))
    return [
      { label: 'Add Members', onClick: () => navigate('/company/members') },
      { label: 'Member Details' },
    ];
  if (/^\/company\/requests\/[^/]+$/.test(pathname))
    return [
      { label: 'Add Members', onClick: () => navigate('/company/members') },
      { label: 'Request Details' },
    ];
  if (pathname === '/company/settings') return [{ label: 'Company Settings' }];

  if (pathname === '/profile') return [{ label: 'My Profile' }];
  if (pathname === '/settings') return [{ label: 'Settings' }];
  if (pathname === '/showcase') return [{ label: 'Component Showcase' }];

  return [{ label: 'Candidates' }];
}

// ── Sidebar nav items derived from current pathname ──
function buildNavItems(pathname, navigate, can) {
  const firstJob = JOBS[0];
  const firstJobPath = firstJob ? getApplyPath(firstJob.companyId, firstJob.id) : '/jobs';
  const jobSubItems = [
    {
      label: 'Job Management',
      isActive: pathname.startsWith('/jobs') && pathname !== '/jobs/create',
      onClick: () => navigate('/jobs'),
    },
  ];
  if (can('create_jobs')) {
    jobSubItems.push({
      label: 'Create Job',
      isActive: pathname === '/jobs/create',
      onClick: () => navigate('/jobs/create'),
    });
  }

  const mockSubItems = [
    {
      label: 'Mock Management',
      isActive: pathname.startsWith('/mocks') && pathname !== '/mocks/create',
      onClick: () => navigate('/mocks'),
    },
  ];
  if (can('create_mocks')) {
    mockSubItems.push({
      label: 'Create Mock',
      isActive: pathname === '/mocks/create',
      onClick: () => navigate('/mocks/create'),
    });
  }

  const companySubItems = [
    {
      label: 'Overview',
      isActive: pathname === '/company' || pathname.startsWith('/company/team'),
      onClick: () => navigate('/company'),
    },
  ];
  if (can('accept_members')) {
    companySubItems.push({
      label: 'Add Members',
      isActive: pathname.startsWith('/company/members') || pathname.startsWith('/company/requests'),
      onClick: () => navigate('/company/members'),
    });
  }
  if (can('edit_company')) {
    companySubItems.push({
      label: 'Company Settings',
      isActive: pathname === '/company/settings',
      onClick: () => navigate('/company/settings'),
    });
  }

  return [
    {
      icon: Users,
      label: 'Candidates',
      isActive: pathname.startsWith('/candidates'),
      onClick: () => navigate('/candidates'),
    },
    {
      icon: Briefcase,
      label: 'Jobs',
      isActive: pathname.startsWith('/jobs'),
      subItems: jobSubItems,
      onClick: () => navigate('/jobs'),
    },
    {
      icon: FileText,
      label: 'Mocks',
      isActive: pathname.startsWith('/mocks'),
      subItems: mockSubItems,
      onClick: () => navigate('/mocks'),
    },
    {
      icon: Building2,
      label: 'Company',
      isActive: pathname.startsWith('/company'),
      subItems: companySubItems,
      onClick: () => navigate('/company'),
      separator: true,
    },
    {
      icon: UserCircle2,
      label: 'Profile',
      isActive: pathname === '/profile',
      onClick: () => navigate('/profile'),
    },
    {
      icon: Settings,
      label: 'Settings',
      isActive: pathname === '/settings',
      onClick: () => navigate('/settings'),
      separator: true,
    },
    can('edit_jobs') && {
      icon: ClipboardCheck,
      label: 'Application',
      isActive: pathname.startsWith('/apply'),
      onClick: () => navigate(firstJobPath),
    },
  ].filter(Boolean);
}

function getApplyPath(companyId, jobId, suffix = '') {
  if (!jobId) return '/jobs';
  const base = companyId ? `/apply/${companyId}/${jobId}` : `/apply/${jobId}`;
  return suffix ? `${base}/${suffix.replace(/^\//, '')}` : base;
}

function keepSearch(path, search = '') {
  return search ? `${path}${search}` : path;
}

function getCandidatesPath(jobId) {
  return jobId ? `/candidates?jobId=${encodeURIComponent(jobId)}` : '/candidates';
}

function copyApplyLink(job) {
  const path = getApplicationSharePath(job);
  if (typeof window === 'undefined' || !job?.id) return;
  navigator.clipboard?.writeText(`${window.location.origin}${path}`);
}

function NoMocksGuideDialog({ onCreateMock, onClose }) {
  const steps = [
    {
      icon: FileText,
      title: 'Create a mock',
      text: 'Build the interview or assessment candidates will take.',
    },
    {
      icon: Briefcase,
      title: 'Attach it to a job',
      text: 'Every job needs at least one mock so applicants have a real flow.',
    },
    {
      icon: ClipboardCheck,
      title: 'Publish and share',
      text: 'Once the job is active, candidates can apply through the public link.',
    },
  ];

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        display: 'grid',
        placeItems: 'center',
        padding: 24,
        background: 'rgba(0, 0, 0, 0.58)',
      }}
    >
      <div
        style={{
          width: 'min(100%, 520px)',
          border: '1px solid var(--border-default)',
          borderRadius: 8,
          background: 'var(--bg-surface)',
          padding: 20,
          color: 'var(--text-primary)',
          boxShadow: '0 24px 80px rgba(0, 0, 0, 0.35)',
        }}
      >
        <h2 style={{ margin: 0, fontSize: 'var(--text-xl)' }}>Create a mock first</h2>
        <p style={{ margin: '8px 0 18px', color: 'var(--text-tertiary)', lineHeight: 1.6 }}>
          Jobs are published with assessments attached. That keeps the candidate link complete from
          the first application.
        </p>

        <div style={{ display: 'grid', gap: 10 }}>
          {steps.map((step, index) => (
            <div
              key={step.title}
              style={{
                display: 'grid',
                gridTemplateColumns: '2rem 1fr',
                gap: 12,
                alignItems: 'start',
                padding: 12,
                border: '1px solid var(--border-subtle)',
                borderRadius: 8,
                background: 'var(--bg-card)',
              }}
            >
              <div
                style={{
                  display: 'grid',
                  placeItems: 'center',
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  color: 'var(--brand-default)',
                  background: 'var(--white-a5)',
                }}
              >
                <step.icon size={16} />
              </div>
              <div>
                <strong style={{ display: 'block', fontSize: 'var(--text-sm)' }}>
                  {index + 1}. {step.title}
                </strong>
                <span style={{ color: 'var(--text-tertiary)', fontSize: 'var(--text-sm)' }}>
                  {step.text}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 8,
            marginTop: 18,
            flexWrap: 'wrap',
          }}
        >
          <Button variant="ghost" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" iconRight={<Plus size={16} />} onClick={onCreateMock}>
            Create Mock
          </Button>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════
// Dashboard layout — sidebar + navbar + breadcrumbs
// ══════════════════════════════════════════════════════════
function BackendStateScreen({ title, message, action }) {
  return (
    <div style={{ display: 'grid', minHeight: '100vh', placeItems: 'center', padding: 24 }}>
      <div
        style={{
          width: 'min(100%, 440px)',
          border: '1px solid var(--border-default)',
          borderRadius: 8,
          background: 'var(--bg-surface)',
          padding: 20,
          color: 'var(--text-primary)',
        }}
      >
        <h1 style={{ margin: 0, fontSize: 'var(--text-xl)' }}>{title}</h1>
        {message && (
          <p style={{ margin: '8px 0 16px', color: 'var(--text-tertiary)' }}>{message}</p>
        )}
        {action}
      </div>
    </div>
  );
}

function DashboardLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, isLoading, status, error, refreshData, logout, dataVersion } =
    useBackendData();

  const currentMember = useMemo(() => {
    void dataVersion;
    return TEAM_MEMBERS.find((member) => String(member.id) === String(CURRENT_USER_ID));
  }, [dataVersion]);

  const currentUser = useMemo(
    () => ({
      name: currentMember?.name || 'VU User',
      email: currentMember?.email || '',
      icon: Hash,
    }),
    [currentMember]
  );

  const breadcrumbs = getRouteBreadcrumbs(location.pathname, navigate);

  const navItems = useMemo(() => {
    void dataVersion;
    return buildNavItems(location.pathname, navigate, canCurrentUser);
  }, [location.pathname, navigate, dataVersion]);

  const handleNavigate = useCallback(
    (page) => {
      const routes = {
        profile: '/profile',
        settings: '/settings',
        'company-settings': '/company/settings',
      };
      if (routes[page]) navigate(routes[page]);
    },
    [navigate]
  );

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (isLoading && dataVersion === 0) {
    return <BackendStateScreen title="Loading workspace" message="Connecting to the backend." />;
  }

  if (status === 'error') {
    return (
      <BackendStateScreen
        title="Backend unavailable"
        message={error?.message || 'The backend did not return the expected data.'}
        action={
          <div style={{ display: 'flex', gap: 8 }}>
            <button type="button" onClick={refreshData}>
              Retry
            </button>
            <button
              type="button"
              onClick={async () => {
                try {
                  await logout();
                } catch {
                  // ignore logout errors and continue redirecting
                }
                navigate('/login');
              }}
            >
              Sign out
            </button>
          </div>
        }
      />
    );
  }

  return (
    <PageLayout
      navItems={navItems}
      user={currentUser}
      breadcrumbItems={breadcrumbs}
      onNavigate={handleNavigate}
    >
      <Suspense fallback={null}>
        <Outlet />
      </Suspense>
    </PageLayout>
  );
}

// ══════════════════════════════════════════════════════════
// Page wrappers — bridge route params → component props
// ══════════════════════════════════════════════════════════
function CandidatesPage() {
  const location = useLocation();
  return <Pipeline key={location.search} />;
}
function CandidateDetailsPage() {
  const { slug } = useParams();
  const candidate = getCandidateBySlug(slug);
  if (!candidate) return <Navigate to="/candidates" replace />;
  return <CandidateDetails candidate={candidate} />;
}

function JobListPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [showNoMocksGuide, setShowNoMocksGuide] = useState(false);
  const { dataVersion } = useBackendData();
  const canCreateJob = useMemo(() => {
    void dataVersion;
    return canCurrentUser('create_jobs');
  }, [dataVersion]);
  const canEditJob = useMemo(() => {
    void dataVersion;
    return canCurrentUser('edit_jobs');
  }, [dataVersion]);
  const hasMocks = useMemo(() => {
    void dataVersion;
    return MOCKS.length > 0;
  }, [dataVersion]);
  const handleCreateJob = useCallback(() => {
    if (!canCreateJob) return;
    if (!hasMocks) {
      setShowNoMocksGuide(true);
      return;
    }
    navigate('/jobs/create');
  }, [canCreateJob, hasMocks, navigate]);
  return (
    <>
      <JobList
        key={location.search}
        onViewJob={(id) => navigate(`/jobs/${id}`)}
        onEditJob={(id) => navigate(`/jobs/${id}/edit`)}
        onCreateJob={handleCreateJob}
        onShowCandidates={(job) => navigate(getCandidatesPath(job.id))}
        onShareJob={copyApplyLink}
        canCreateJob={canCreateJob}
        canEditJob={canEditJob}
      />
      {showNoMocksGuide && (
        <NoMocksGuideDialog
          onClose={() => setShowNoMocksGuide(false)}
          onCreateMock={() => {
            setShowNoMocksGuide(false);
            navigate('/mocks/create');
          }}
        />
      )}
    </>
  );
}

function JobDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { dataVersion } = useBackendData();
  const canEditJob = useMemo(() => {
    void dataVersion;
    return canCurrentUser('edit_jobs');
  }, [dataVersion]);
  return (
    <JobDetails
      jobId={id}
      onEdit={() => navigate(`/jobs/${id}/edit`)}
      onTest={(path) => navigate(path || `/apply/${id}`)}
      onShowCandidates={() => navigate(getCandidatesPath(id))}
      canEditJob={canEditJob}
    />
  );
}

function CreateJobPage() {
  const navigate = useNavigate();
  const { dataVersion } = useBackendData();
  const canCreateJob = useMemo(() => {
    void dataVersion;
    return canCurrentUser('create_jobs');
  }, [dataVersion]);
  const hasMocks = useMemo(() => {
    void dataVersion;
    return MOCKS.length > 0;
  }, [dataVersion]);

  if (!canCreateJob) return <Navigate to="/jobs" replace />;

  if (!hasMocks) {
    return (
      <EmptyState
        icon={<FileText size={24} />}
        title="Create a mock first"
        description="Jobs need at least one mock interview before they can be published."
        action={
          <Button
            variant="primary"
            iconRight={<Plus size={16} />}
            onClick={() => navigate('/mocks/create')}
          >
            Create Mock
          </Button>
        }
      />
    );
  }

  return <CreateConfig onCreated={(id) => navigate(`/jobs/${id}`)} />;
}

function EditJobPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { dataVersion } = useBackendData();
  const canEditJob = useMemo(() => {
    void dataVersion;
    return canCurrentUser('edit_jobs');
  }, [dataVersion]);
  if (!canEditJob) return <Navigate to={`/jobs/${id}`} replace />;
  return <EditConfig jobId={id} onSaved={(savedId) => navigate(`/jobs/${savedId}`)} />;
}

function MockListPage() {
  const navigate = useNavigate();
  const { dataVersion } = useBackendData();
  const canCreateMock = useMemo(() => {
    void dataVersion;
    return canCurrentUser('create_mocks');
  }, [dataVersion]);
  const canEditMock = useMemo(() => {
    void dataVersion;
    return canCurrentUser('edit_mocks');
  }, [dataVersion]);
  const handleDeleteMock = useCallback(
    async (mock) => {
      if (!canEditMock) return;
      if (!window.confirm(`Delete "${mock.title}"? This cannot be undone.`)) return;
      try {
        await removeMock(mock.id);
      } catch (error) {
        window.alert(error.message || 'Unable to delete mock.');
      }
    },
    [canEditMock]
  );

  return (
    <MockList
      onViewMock={(id) => navigate(`/mocks/${id}`)}
      onEditMock={(id) => navigate(`/mocks/${id}/edit`)}
      onCreateMock={() => navigate('/mocks/create')}
      onTestMock={(mock) => {
        if (!mock.firstJobId) return;
        const job = JOBS.find((item) => String(item.id) === String(mock.firstJobId));
        navigate(`${getApplyPath(job?.companyId, mock.firstJobId)}/mock/${mock.id}`);
      }}
      onDeleteMock={handleDeleteMock}
      canCreateMock={canCreateMock}
      canEditMock={canEditMock}
    />
  );
}

function MockDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { dataVersion } = useBackendData();
  const canEditMock = useMemo(() => {
    void dataVersion;
    return canCurrentUser('edit_mocks');
  }, [dataVersion]);
  return (
    <MockDetails
      mockId={id}
      onEdit={() => navigate(`/mocks/${id}/edit`)}
      onTestMock={(jobId) => {
        const job = JOBS.find((item) => String(item.id) === String(jobId));
        navigate(`${getApplyPath(job?.companyId, jobId)}/mock/${id}`);
      }}
      canEditMock={canEditMock}
    />
  );
}

function CreateMockPage() {
  const navigate = useNavigate();
  const { dataVersion } = useBackendData();
  const canCreateMock = useMemo(() => {
    void dataVersion;
    return canCurrentUser('create_mocks');
  }, [dataVersion]);
  if (!canCreateMock) return <Navigate to="/mocks" replace />;
  return <CreateMockConfig onCreated={(id) => navigate(`/mocks/${id}`)} />;
}

function EditMockPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { dataVersion } = useBackendData();
  const canEditMock = useMemo(() => {
    void dataVersion;
    return canCurrentUser('edit_mocks');
  }, [dataVersion]);
  if (!canEditMock) return <Navigate to={`/mocks/${id}`} replace />;
  return <EditMockConfig mockId={id} onSaved={(savedId) => navigate(`/mocks/${savedId}`)} />;
}

function OverviewPage() {
  const navigate = useNavigate();
  const { dataVersion } = useBackendData();
  const canEditCompany = useMemo(() => {
    void dataVersion;
    return canCurrentUser('edit_company');
  }, [dataVersion]);
  const canViewTeamMembers = useMemo(() => {
    void dataVersion;
    return getCurrentUserRole() !== 'viewer';
  }, [dataVersion]);
  return (
    <Overview
      onEditCompany={() => navigate('/company/settings')}
      onViewMember={(id) => navigate(`/company/team/${id}`)}
      canEditCompany={canEditCompany}
      canViewTeamMembers={canViewTeamMembers}
    />
  );
}

function CompanySettingsPage() {
  const { dataVersion } = useBackendData();
  const canEditCompany = useMemo(() => {
    void dataVersion;
    return canCurrentUser('edit_company');
  }, [dataVersion]);
  if (!canEditCompany) return <Navigate to="/company" replace />;
  return <CompanySettings />;
}

function TeamMemberPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  return <MemberDetails memberId={id} onRemoved={() => navigate('/company')} />;
}

function AddMembersPage() {
  const navigate = useNavigate();
  const { dataVersion } = useBackendData();
  const canAcceptMembers = useMemo(() => {
    void dataVersion;
    return canCurrentUser('accept_members');
  }, [dataVersion]);
  if (!canAcceptMembers) return <Navigate to="/company" replace />;
  return (
    <AddMembers
      onViewMember={(id) => navigate(`/company/members/${id}`)}
      onViewRequest={(id) => navigate(`/company/requests/${id}`)}
    />
  );
}

function MemberFromRequestsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { dataVersion } = useBackendData();
  const canAcceptMembers = useMemo(() => {
    void dataVersion;
    return canCurrentUser('accept_members');
  }, [dataVersion]);
  if (!canAcceptMembers) return <Navigate to="/company" replace />;
  return <MemberDetails memberId={id} onRemoved={() => navigate('/company/members')} />;
}

function RequestDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { dataVersion } = useBackendData();
  const canAcceptMembers = useMemo(() => {
    void dataVersion;
    return canCurrentUser('accept_members');
  }, [dataVersion]);
  if (!canAcceptMembers) return <Navigate to="/company" replace />;
  const request = getJoinRequestById(id);
  if (!request) return <Navigate to="/company/members" replace />;
  return (
    <MemberDetails
      request={request}
      onAccepted={(memberId) => navigate(`/company/members/${memberId}`)}
      onDeclined={() => navigate('/company/members')}
    />
  );
}

// ══════════════════════════════════════════════════════════
// Application layout — candidate-facing, no dashboard chrome
// ══════════════════════════════════════════════════════════
function ApplicationLayout() {
  const { companyId, jobId } = useParams();
  const location = useLocation();
  const { dataVersion } = useBackendData();
  const buildKeyRef = useRef('');
  const shareToken = useMemo(
    () => new URLSearchParams(location.search).get('j') || '',
    [location.search]
  );

  const jobSignature = useMemo(() => {
    void dataVersion;
    const id = String(jobId || '');
    const job = JOBS.find((item) => String(item.id) === id);
    if (!job) return `${companyId || ''}:${id}:missing:${shareToken}`;

    const mocksSignature = (job.mocks || [])
      .map((mock) => `${mock.id}:${mock.weight}:${mock.durationMin}`)
      .join('|');
    return `${companyId || job.companyId || ''}:${id}:${job.title}:${job.endDateInput}:${mocksSignature}:${shareToken}`;
  }, [companyId, jobId, dataVersion, shareToken]);

  useEffect(() => {
    if (buildKeyRef.current === jobSignature) return;
    buildKeyRef.current = jobSignature;
    buildApplicationContext(jobId, { companyId, shareToken });
  }, [companyId, jobId, jobSignature, shareToken]);

  return (
    <div className="application-shell">
      <div className="application-shell__main">
        <Suspense fallback={null}>
          <Outlet />
        </Suspense>
      </div>
    </div>
  );
}

function AppLandingPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { companyId, jobId } = useParams();
  return (
    <JobLanding
      onApply={() => navigate(keepSearch(getApplyPath(companyId, jobId, 'form'), location.search))}
    />
  );
}

function getApplicationUnavailableRedirect(companyId, jobId, search = '') {
  if (APPLICATION?.job && APPLICATION.job.status !== 'active') {
    return <Navigate to={keepSearch(getApplyPath(companyId, jobId), search)} replace />;
  }
  return null;
}

function AppFormPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { companyId, jobId } = useParams();
  const unavailable = getApplicationUnavailableRedirect(companyId, jobId, location.search);
  if (unavailable) return unavailable;
  return (
    <CandidateForm
      onSubmit={() =>
        navigate(keepSearch(getApplyPath(companyId, jobId, 'overview'), location.search))
      }
      onBack={() => navigate(keepSearch(getApplyPath(companyId, jobId), location.search))}
    />
  );
}

function AppOverviewPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { companyId, jobId } = useParams();
  const unavailable = getApplicationUnavailableRedirect(companyId, jobId, location.search);
  if (unavailable) return unavailable;
  return (
    <JobOverview
      onStartMock={(mockId) =>
        navigate(keepSearch(getApplyPath(companyId, jobId, `mock/${mockId}`), location.search))
      }
      onSubmitApplication={() =>
        navigate(keepSearch(getApplyPath(companyId, jobId, 'complete'), location.search))
      }
    />
  );
}

function AppMockPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { companyId, jobId, mockId } = useParams();
  const unavailable = getApplicationUnavailableRedirect(companyId, jobId, location.search);
  if (unavailable) return unavailable;
  return (
    <MockSession
      mockId={mockId}
      onComplete={() =>
        navigate(keepSearch(getApplyPath(companyId, jobId, 'overview'), location.search))
      }
    />
  );
}

function AppCompletePage() {
  const navigate = useNavigate();
  return <SubmissionComplete onBackToJobs={() => navigate('/candidates')} />;
}

// ══════════════════════════════════════════════════════════
// Root — route definitions
// ══════════════════════════════════════════════════════════
export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/join/:companyId" element={<CompanyJoinPage />} />

      {/* Dashboard pages (with sidebar + navbar) */}
      <Route element={<DashboardLayout />}>
        <Route path="/candidates" element={<CandidatesPage />} />
        <Route path="/candidates/:slug" element={<CandidateDetailsPage />} />
        <Route path="/jobs" element={<JobListPage />} />
        <Route path="/jobs/create" element={<CreateJobPage />} />
        <Route path="/jobs/:id" element={<JobDetailsPage />} />
        <Route path="/jobs/:id/edit" element={<EditJobPage />} />
        <Route path="/mocks" element={<MockListPage />} />
        <Route path="/mocks/create" element={<CreateMockPage />} />
        <Route path="/mocks/:id" element={<MockDetailsPage />} />
        <Route path="/mocks/:id/edit" element={<EditMockPage />} />
        <Route path="/company" element={<OverviewPage />} />
        <Route path="/company/team/:id" element={<TeamMemberPage />} />
        <Route path="/company/members" element={<AddMembersPage />} />
        <Route path="/company/members/:id" element={<MemberFromRequestsPage />} />
        <Route path="/company/requests/:id" element={<RequestDetailsPage />} />
        <Route path="/company/settings" element={<CompanySettingsPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/showcase" element={<ComponentShowcase />} />
      </Route>

      {/* Application flow (candidate-facing, standalone) */}
      <Route path="/apply/:companyId/:jobId" element={<ApplicationLayout />}>
        <Route index element={<AppLandingPage />} />
        <Route path="form" element={<AppFormPage />} />
        <Route path="overview" element={<AppOverviewPage />} />
        <Route path="mock/:mockId" element={<AppMockPage />} />
        <Route path="complete" element={<AppCompletePage />} />
      </Route>

      <Route path="/apply/:jobId" element={<ApplicationLayout />}>
        <Route index element={<AppLandingPage />} />
        <Route path="form" element={<AppFormPage />} />
        <Route path="overview" element={<AppOverviewPage />} />
        <Route path="mock/:mockId" element={<AppMockPage />} />
        <Route path="complete" element={<AppCompletePage />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/candidates" replace />} />
    </Routes>
  );
}
