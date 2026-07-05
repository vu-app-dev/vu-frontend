import { memo, useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import { useLocation, useNavigate, useParams, Outlet } from 'react-router-dom';
import { Badge } from '../../../components/ui/Badge';
import { Stepper } from '../../../components/ui/Stepper';
import { APPLICATION } from '../../../api';
import './ApplicationFlowLayout.css';

const STEPS = [
  { label: 'Job Details', suffix: '' },
  { label: 'Your Info', suffix: 'form' },
  { label: 'Setup', suffix: 'setup' },
];

function getApplyBase(companyId, jobId) {
  if (!jobId) return '/jobs';
  return companyId ? `/apply/${companyId}/${jobId}` : `/apply/${jobId}`;
}

function suffixFromPath(pathname, companyId, jobId) {
  const base = getApplyBase(companyId, jobId);
  const rest = pathname.slice(base.length).replace(/^\//, '');
  return rest;
}

export const ApplicationFlowLayout = memo(function ApplicationFlowLayout() {
  const { companyId, jobId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const currentSuffix = suffixFromPath(location.pathname, companyId, jobId);
  const activeStep = useMemo(() => {
    const idx = STEPS.findIndex((s) => s.suffix === currentSuffix);
    return idx >= 0 ? idx : 0;
  }, [currentSuffix]);

  const stepperSteps = useMemo(() => STEPS.map((s) => ({ label: s.label })), []);

  const handleStepClick = useCallback(
    (index) => {
      const target = STEPS[index];
      if (!target) return;
      const base = getApplyBase(companyId, jobId);
      const path = target.suffix ? `${base}/${target.suffix}` : base;
      const search = location.search || '';
      navigate(search ? `${path}${search}` : path);
    },
    [companyId, jobId, navigate, location.search]
  );

  const stepValidity = useMemo(() => {
    const v = {};
    for (let i = 0; i < activeStep; i++) v[i] = true;
    return v;
  }, [activeStep]);

  if (!APPLICATION) return <Outlet />;

  const { job, company } = APPLICATION;
  const contextParts = [company?.name, job?.location, job?.locationType].filter(Boolean);

  return (
    <div className="app-flow">
      <header className="app-flow__header">
        <p className="app-flow__company">{company?.name}</p>
        <div className="app-flow__title-row">
          <h1 className="app-flow__title">{job?.title}</h1>
          <Badge type="jobStatus" variant={job?.status || 'active'} />
        </div>
        <p className="app-flow__context">{contextParts.join(' · ')}</p>

        <div className="app-flow__stepper-wrap">
          <Stepper
            steps={stepperSteps}
            activeStep={activeStep}
            onStepClick={handleStepClick}
            stepValidity={stepValidity}
          />
        </div>
      </header>

      <div className="app-flow__body">
        <Outlet />
      </div>
    </div>
  );
});

ApplicationFlowLayout.propTypes = {};
