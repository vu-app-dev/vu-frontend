import { memo, useMemo, useCallback, useState } from 'react';
import PropTypes from 'prop-types';
import { useLocation, useNavigate, useParams, Outlet } from 'react-router-dom';
import { Building2, MapPin, Moon, Sun } from 'lucide-react';
import { Badge } from '../../../components/ui/Badge';
import { Stepper } from '../../../components/ui/Stepper';
import { APPLICATION } from '../../../api';
import { getActiveTheme, THEMES, toggleTheme as toggleAppTheme } from '../../../utils';
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
  const [theme, setTheme] = useState(() => getActiveTheme());

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

  const handleThemeToggle = useCallback(() => {
    setTheme((currentTheme) => toggleAppTheme(currentTheme));
  }, []);

  if (!APPLICATION) return <Outlet />;

  const { job, company } = APPLICATION;
  const isLightTheme = theme === THEMES.light;

  return (
    <div className="app-flow">
      <header className="app-flow__header">
        <div className="app-flow__header-main">
          <div className="app-flow__identity">
            <p className="app-flow__eyebrow">Application</p>
            <div className="app-flow__title-row">
              <h1 className="app-flow__title">{job?.title}</h1>
              <Badge type="jobStatus" variant={job?.status || 'active'} />
            </div>
            <div className="app-flow__context-list" aria-label="Application context">
              {company?.name && (
                <span className="app-flow__context-item">
                  <Building2 size={14} />
                  {company.name}
                </span>
              )}
              {job?.location && (
                <span className="app-flow__context-item">
                  <MapPin size={14} />
                  {job.location}
                </span>
              )}
              {job?.locationType && (
                <span className="app-flow__context-item">{job.locationType}</span>
              )}
            </div>
          </div>

          <div className="app-flow__header-actions">
            <button
              type="button"
              className="app-flow__theme-button"
              onClick={handleThemeToggle}
              aria-label={isLightTheme ? 'Switch to dark mode' : 'Switch to light mode'}
              title={isLightTheme ? 'Switch to dark mode' : 'Switch to light mode'}
            >
              {isLightTheme ? <Moon size={16} /> : <Sun size={16} />}
            </button>
          </div>
        </div>
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
