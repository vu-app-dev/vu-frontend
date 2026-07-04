import { useMemo, useState } from 'react';
import { JobConfigForm } from '../JobConfigForm';
import { ConfirmDialog } from '../../../../components/ui/Dialog';
import {
  formToBackendJobSchedulePatch,
  getJobById,
  getJobForm,
  updateJob,
  useBackendData,
} from '../../../../api';

/**
 * EditConfig renders JobConfigForm in edit mode with pre-filled backend data.
 */
export function EditConfig({ jobId, onSaved }) {
  const { dataVersion } = useBackendData();
  const [error, setError] = useState('');
  const job = getJobById(jobId);
  const formData = useMemo(() => {
    void dataVersion;
    return job ? getJobForm(job) : null;
  }, [job, dataVersion]);

  const handleSaveChanges = async (form) => {
    if (!job) return;
    try {
      const patch = job.status === 'active' ? formToBackendJobSchedulePatch(form, job) : form;
      const saved = await updateJob(job.id, patch);
      onSaved?.(saved?.id || job.id);
    } catch (error) {
      setError(error.message || 'Unable to update job.');
    }
  };

  if (!formData) {
    return (
      <div style={{ padding: 'var(--padding-lg)', color: 'var(--text-tertiary)' }}>
        Job not found.
      </div>
    );
  }

  if (job.status === 'closed') {
    return (
      <div style={{ padding: 'var(--padding-lg)', color: 'var(--text-tertiary)' }}>
        Closed jobs are read-only and cannot be reopened.
      </div>
    );
  }

  return (
    <>
      <JobConfigForm
        mode="edit"
        initialData={formData}
        status={job.status}
        onSaveChanges={handleSaveChanges}
      />
      <ConfirmDialog
        isOpen={Boolean(error)}
        title="Unable to update job"
        description={error}
        confirmLabel="Close"
        showCancel={false}
        onConfirm={() => setError('')}
        onClose={() => setError('')}
      />
    </>
  );
}
