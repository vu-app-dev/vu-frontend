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
import { AppLogo } from './components/ui/AppLogo';
import { ApplicationFlowLayout } from './pages/Application/_shared/ApplicationFlowLayout';
import { RouteErrorBoundary } from './components/layout/RouteErrorBoundary';
import { Button } from './components/ui/Button';
import { EmptyState } from './components/ui/EmptyState';
import { ConfirmDialog } from './components/ui/Dialog';
import { getJoinRequestById } from './api';
import { buildApplicationContext, getApplicationSharePath } from './api';
import { getCandidateById, getCandidateBySlug } from './api';
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
import { Users, Briefcase, FileText, Building2, UserCircle2, Settings, Plus } from 'lucide-react';

// ── Lazy-loaded pages (code-split at route level) ──
const Pipeline = lazy(() =>
  import('./pages/Candidates/Pipeline').then((m) => ({ default: m.Pipeline }))
);
const JobList = lazy(() =>
  import('./pages/Jobs/JobManagement/JobList').then((m) => ({ default: m.JobList }))
);
const MockList = lazy(() =>
  import('./pages/Mocks/MockManagement/MockList').then((m) => ({ default: m.MockList }))
);
const Overview = lazy(() =>
  import('./pages/CompanyTeam/Overview').then((m) => ({ default: m.Overview }))
);
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
const InterviewSetup = lazy(() =>
  import('./pages/Application').then((m) => ({ default: m.InterviewSetup }))
);
const MockSession = lazy(() =>
  import('./pages/Application').then((m) => ({ default: m.MockSession }))
);
const InterviewSession = lazy(() =>
  import('./pages/Application').then((m) => ({ default: m.InterviewSession }))
);
const SubmissionComplete = lazy(() =>
  import('./pages/Application').then((m) => ({ default: m.SubmissionComplete }))
);
const ComponentShowcase = lazy(() =>
  import('./pages/_showcase').then((m) => ({ default: m.ComponentShowcase }))
);
const LandingPage = lazy(() => import('./pages/Landing').then((m) => ({ default: m.LandingPage })));

// ── Static config ──
// ── Route → breadcrumb mapping ──
function getRouteBreadcrumbs(pathname, navigate) {
  if (pathname === '/candidates') return [{ label: 'Candidates' }];
  if (/^\/candidates\/[^/]+$/.test(pathname)) {
    const slug = decodeURIComponent(pathname.split('/').pop() || '');
    const candidate = getCandidateBySlug(slug);
    const readableSlug = slug.split('--')[0] || slug;
    const name =
      candidate?.name ||
      readableSlug
        .split('-')
        .filter(Boolean)
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');
    return [{ label: 'Candidates', onClick: () => navigate('/candidates') }, { label: name }];
  }

  if (pathname === '/jobs') return [{ label: 'Jobs' }];
  if (pathname === '/jobs/create') return [{ label: 'Create job' }];
  if (/^\/jobs\/[^/]+$/.test(pathname))
    return [{ label: 'Jobs', onClick: () => navigate('/jobs') }, { label: 'Job details' }];
  if (/^\/jobs\/[^/]+\/edit$/.test(pathname))
    return [{ label: 'Jobs', onClick: () => navigate('/jobs') }, { label: 'Edit job' }];

  if (pathname === '/mocks') return [{ label: 'Mocks' }];
  if (pathname === '/mocks/create') return [{ label: 'Create mock' }];
  if (/^\/mocks\/[^/]+$/.test(pathname))
    return [{ label: 'Mocks', onClick: () => navigate('/mocks') }, { label: 'Mock details' }];
  if (/^\/mocks\/[^/]+\/edit$/.test(pathname))
    return [{ label: 'Mocks', onClick: () => navigate('/mocks') }, { label: 'Edit mock' }];

  if (pathname === '/company') return [{ label: 'Overview' }];
  if (/^\/company\/team\/[^/]+$/.test(pathname))
    return [
      { label: 'Overview', onClick: () => navigate('/company') },
      { label: 'Member details' },
    ];
  if (pathname === '/company/members') return [{ label: 'Invite members' }];
  if (/^\/company\/members\/[^/]+$/.test(pathname))
    return [
      { label: 'Invite members', onClick: () => navigate('/company/members') },
      { label: 'Member details' },
    ];
  if (/^\/company\/requests\/[^/]+$/.test(pathname))
    return [
      { label: 'Invite members', onClick: () => navigate('/company/members') },
      { label: 'Request details' },
    ];
  if (pathname === '/company/settings') return [{ label: 'Company settings' }];

  if (pathname === '/profile') return [{ label: 'Profile' }];
  if (pathname === '/settings') return [{ label: 'Settings' }];
  if (pathname === '/showcase') return [{ label: 'Component showcase' }];

  return [{ label: 'Candidates' }];
}

// ── Sidebar nav items derived from current pathname ──
function buildNavItems(pathname, navigate, can) {
  const jobSubItems = [
    {
      id: 'jobs-list',
      label: 'All jobs',
      isActive: pathname.startsWith('/jobs') && pathname !== '/jobs/create',
      onClick: () => navigate('/jobs'),
    },
  ];
  if (can('create_jobs')) {
    jobSubItems.push({
      id: 'jobs-create',
      label: 'Create job',
      isActive: pathname === '/jobs/create',
      onClick: () => navigate('/jobs/create'),
    });
  }

  const mockSubItems = [
    {
      id: 'mocks-list',
      label: 'All mocks',
      isActive: pathname.startsWith('/mocks') && pathname !== '/mocks/create',
      onClick: () => navigate('/mocks'),
    },
  ];
  if (can('create_mocks')) {
    mockSubItems.push({
      id: 'mocks-create',
      label: 'Create mock',
      isActive: pathname === '/mocks/create',
      onClick: () => navigate('/mocks/create'),
    });
  }

  const companySubItems = [
    {
      id: 'company-overview',
      label: 'Overview',
      isActive: pathname === '/company' || pathname.startsWith('/company/team'),
      onClick: () => navigate('/company'),
    },
  ];
  if (can('accept_members')) {
    companySubItems.push({
      id: 'company-members',
      label: 'Invite members',
      isActive: pathname.startsWith('/company/members') || pathname.startsWith('/company/requests'),
      onClick: () => navigate('/company/members'),
    });
  }
  if (can('edit_company')) {
    companySubItems.push({
      id: 'company-settings',
      label: 'Company settings',
      isActive: pathname === '/company/settings',
      onClick: () => navigate('/company/settings'),
    });
  }

  return [
    {
      id: 'candidates',
      icon: Users,
      label: 'Candidates',
      isActive: pathname.startsWith('/candidates'),
      onClick: () => navigate('/candidates'),
    },
    {
      id: 'jobs',
      icon: Briefcase,
      label: 'Jobs',
      isActive: pathname.startsWith('/jobs'),
      subItems: jobSubItems,
      onClick: () => navigate('/jobs'),
    },
    {
      id: 'mocks',
      icon: FileText,
      label: 'Mocks',
      isActive: pathname.startsWith('/mocks'),
      subItems: mockSubItems,
      onClick: () => navigate('/mocks'),
    },
    {
      id: 'company',
      icon: Building2,
      label: 'Company',
      isActive: pathname.startsWith('/company'),
      subItems: companySubItems,
      onClick: () => navigate('/company'),
      separator: true,
    },
    {
      id: 'profile',
      icon: UserCircle2,
      label: 'Profile',
      isActive: pathname === '/profile',
      onClick: () => navigate('/profile'),
    },
    {
      id: 'settings',
      icon: Settings,
      label: 'Settings',
      isActive: pathname === '/settings',
      onClick: () => navigate('/settings'),
      separator: true,
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

function isCurrentRoute(to, location) {
  if (typeof to !== 'string') return false;
  const current = `${location.pathname}${location.search}${location.hash}`;
  if (to === current) return true;
  return !location.search && !location.hash && to === location.pathname;
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
  return (
    <ConfirmDialog
      isOpen
      title="Create a mock first"
      description="Jobs need at least one assessment attached before publishing. Create a mock, then return to publish the job."
      confirmLabel="Create mock"
      cancelLabel="Cancel"
      onConfirm={onCreateMock}
      onClose={onClose}
    />
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

function RouteFallback() {
  return (
    <div
      aria-live="polite"
      style={{
        display: 'grid',
        minHeight: 180,
        placeItems: 'center',
        color: 'var(--text-tertiary)',
        fontSize: 'var(--text-sm)',
      }}
    >
      Loading...
    </div>
  );
}

function DashboardLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, isLoading, status, error, refreshData, logout, dataVersion } =
    useBackendData();
  const navigateTo = useCallback(
    (to, options) => {
      if (isCurrentRoute(to, location)) return;
      navigate(to, options);
    },
    [location, navigate]
  );

  const currentMember = useMemo(() => {
    void dataVersion;
    return TEAM_MEMBERS.find((member) => String(member.id) === String(CURRENT_USER_ID));
  }, [dataVersion]);

  const currentUser = useMemo(
    () => ({
      name: currentMember?.name || 'VU User',
      email: currentMember?.email || '',
    }),
    [currentMember]
  );

  const breadcrumbs = useMemo(() => {
    void dataVersion;
    return getRouteBreadcrumbs(location.pathname, navigateTo);
  }, [location.pathname, navigateTo, dataVersion]);

  const navItems = useMemo(() => {
    void dataVersion;
    return buildNavItems(location.pathname, navigateTo, canCurrentUser);
  }, [location.pathname, navigateTo, dataVersion]);

  const handleNavigate = useCallback(
    (page) => {
      const routes = {
        profile: '/profile',
        settings: '/settings',
        'company-settings': '/company/settings',
      };
      if (routes[page]) navigateTo(routes[page]);
    },
    [navigateTo]
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
            <button type="button" onClick={() => refreshData({ force: true })}>
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
                navigateTo('/login');
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
      logo={<AppLogo size="md" />}
      navItems={navItems}
      user={currentUser}
      breadcrumbItems={breadcrumbs}
      onNavigate={handleNavigate}
    >
      <RouteErrorBoundary scope="Dashboard page" fallbackPath="/candidates">
        <Suspense fallback={<RouteFallback />}>
          <Outlet />
        </Suspense>
      </RouteErrorBoundary>
    </PageLayout>
  );
}

function DashboardRouteLayout() {
  return (
    <RouteErrorBoundary scope="Dashboard" fallbackPath="/login">
      <DashboardLayout />
    </RouteErrorBoundary>
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
  const location = useLocation();
  const { dataVersion } = useBackendData();
  void dataVersion;
  const selectedCandidateId = location.state?.selectedCandidateId;
  const candidate =
    (selectedCandidateId ? getCandidateById(selectedCandidateId) : null) ||
    getCandidateBySlug(slug);
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
      onTest={(path) => {
        const targetPath = path || `/apply/${id}`;
        const targetUrl = new URL(targetPath, window.location.origin);
        window.open(targetUrl.toString(), '_blank', 'noopener,noreferrer');
      }}
      onShowCandidates={() => navigate(getCandidatesPath(id))}
      onViewCandidate={(slug, selectedCandidateId) =>
        navigate(`/candidates/${slug}`, { state: { selectedCandidateId } })
      }
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
            Create mock
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
  const [mockToDelete, setMockToDelete] = useState(null);
  const [deleteError, setDeleteError] = useState('');
  const [isDeletingMock, setIsDeletingMock] = useState(false);
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
    (mock) => {
      if (!canEditMock) return;
      setMockToDelete(mock);
    },
    [canEditMock]
  );

  const confirmDeleteMock = useCallback(async () => {
    if (!mockToDelete) return;
    setIsDeletingMock(true);
    try {
      await removeMock(mockToDelete.id);
      setMockToDelete(null);
    } catch (error) {
      setDeleteError(error.message || 'Unable to delete mock.');
    } finally {
      setIsDeletingMock(false);
    }
  }, [mockToDelete]);

  return (
    <>
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
      <ConfirmDialog
        isOpen={Boolean(mockToDelete)}
        title="Delete mock?"
        description={
          mockToDelete
            ? `Delete "${mockToDelete.title}"? This cannot be undone.`
            : 'Delete this mock?'
        }
        confirmLabel="Delete"
        confirmVariant="danger"
        isBusy={isDeletingMock}
        onConfirm={confirmDeleteMock}
        onClose={() => setMockToDelete(null)}
      />
      <ConfirmDialog
        isOpen={Boolean(deleteError)}
        title="Unable to delete mock"
        description={deleteError}
        confirmLabel="Close"
        showCancel={false}
        onConfirm={() => setDeleteError('')}
        onClose={() => setDeleteError('')}
      />
    </>
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
  const { dataVersion } = useBackendData();
  const buildKeyRef = useRef('');

  const jobSignature = useMemo(() => {
    void dataVersion;
    const id = String(jobId || '');
    const job = JOBS.find((item) => String(item.id) === id);
    if (!job) return `${companyId || ''}:${id}:missing`;

    const mocksSignature = (job.mocks || [])
      .map((mock) => `${mock.id}:${mock.weight}:${mock.durationMin}`)
      .join('|');
    return `${companyId || job.companyId || ''}:${id}:${job.title}:${job.endDateInput}:${mocksSignature}`;
  }, [companyId, jobId, dataVersion]);

  useEffect(() => {
    if (buildKeyRef.current === jobSignature) return;
    buildKeyRef.current = jobSignature;
    buildApplicationContext(jobId, { companyId });
  }, [companyId, jobId, jobSignature]);

  return (
    <div className="application-shell">
      <div className="application-shell__main">
        <RouteErrorBoundary scope="Application page" fallbackPath={getApplyPath(companyId, jobId)}>
          <Suspense fallback={<RouteFallback />}>
            <Outlet />
          </Suspense>
        </RouteErrorBoundary>
      </div>
    </div>
  );
}

function ApplicationRouteLayout() {
  const { companyId, jobId } = useParams();
  return (
    <RouteErrorBoundary scope="Application flow" fallbackPath={getApplyPath(companyId, jobId)}>
      <ApplicationLayout />
    </RouteErrorBoundary>
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
        navigate(keepSearch(getApplyPath(companyId, jobId, 'setup'), location.search))
      }
      onBack={() => navigate(keepSearch(getApplyPath(companyId, jobId), location.search))}
    />
  );
}

function AppSetupPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { companyId, jobId } = useParams();
  const unavailable = getApplicationUnavailableRedirect(companyId, jobId, location.search);
  if (unavailable) return unavailable;
  return (
    <InterviewSetup
      onNext={async () => {
        const el = document.documentElement;
        const request = el.requestFullscreen || el.webkitRequestFullscreen;
        if (request) {
          try { await request.call(el); } catch { /* browser denied */ }
        }
        navigate(keepSearch(getApplyPath(companyId, jobId, 'interview'), location.search));
      }}
      onBack={() =>
        navigate(keepSearch(getApplyPath(companyId, jobId, 'form'), location.search))
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
      key={mockId}
      mockId={mockId}
      onComplete={() =>
        navigate(keepSearch(getApplyPath(companyId, jobId, 'setup'), location.search))
      }
    />
  );
}

function AppInterviewPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { companyId, jobId } = useParams();
  const unavailable = getApplicationUnavailableRedirect(companyId, jobId, location.search);
  if (unavailable) return unavailable;
  return (
    <InterviewSession
      onComplete={() =>
        navigate(keepSearch(getApplyPath(companyId, jobId, 'complete'), location.search))
      }
    />
  );
}

function AppCompletePage() {
  return <SubmissionComplete />;
}

// ══════════════════════════════════════════════════════════
// Root — route definitions
// ══════════════════════════════════════════════════════════
export default function App() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <Suspense fallback={null}>
            <LandingPage />
          </Suspense>
        }
      />
      <Route
        path="/login"
        element={
          <RouteErrorBoundary scope="Login page" fallbackPath="/login">
            <LoginPage />
          </RouteErrorBoundary>
        }
      />
      <Route
        path="/join/:companyId"
        element={
          <RouteErrorBoundary scope="Join page" fallbackPath="/login">
            <CompanyJoinPage />
          </RouteErrorBoundary>
        }
      />

      {/* Dashboard pages (with sidebar + navbar) */}
      <Route element={<DashboardRouteLayout />}>
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
      <Route path="/apply/:companyId/:jobId" element={<ApplicationRouteLayout />}>
        {/* Steps with shared header + stepper */}
        <Route element={<ApplicationFlowLayout />}>
          <Route index element={<AppLandingPage />} />
          <Route path="form" element={<AppFormPage />} />
          <Route path="setup" element={<AppSetupPage />} />
        </Route>
        <Route path="mock/:mockId" element={<AppMockPage />} />
        <Route path="interview" element={<AppInterviewPage />} />
        <Route path="complete" element={<AppCompletePage />} />
      </Route>

      <Route path="/apply/:jobId" element={<ApplicationRouteLayout />}>
        <Route element={<ApplicationFlowLayout />}>
          <Route index element={<AppLandingPage />} />
          <Route path="form" element={<AppFormPage />} />
          <Route path="setup" element={<AppSetupPage />} />
        </Route>
        <Route path="mock/:mockId" element={<AppMockPage />} />
        <Route path="interview" element={<AppInterviewPage />} />
        <Route path="complete" element={<AppCompletePage />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/candidates" replace />} />
    </Routes>
  );
}
