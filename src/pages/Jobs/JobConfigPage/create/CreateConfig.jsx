import { JobConfigForm } from '../JobConfigForm';
import { addJob } from '../../../../api';
import { useState } from 'react';
import { ConfirmDialog } from '../../../../components/ui/Dialog';

/**
 * CreateConfig — thin wrapper that renders JobConfigForm in create mode.
 * On publish, the job is stored in the shared data file.
 */
export function CreateConfig({ onCreated }) {
  const [error, setError] = useState('');

  const handlePublish = async (form) => {
    try {
      const job = await addJob(form);
      onCreated?.(job.id);
    } catch (error) {
      setError(error.message || 'Unable to create job.');
    }
  };

  return (
    <>
      <JobConfigForm mode="create" onPublish={handlePublish} />
      <ConfirmDialog
        isOpen={Boolean(error)}
        title="Unable to create job"
        description={error}
        confirmLabel="Close"
        showCancel={false}
        onConfirm={() => setError('')}
        onClose={() => setError('')}
      />
    </>
  );
}
