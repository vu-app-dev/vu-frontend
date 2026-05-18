import { JobConfigForm } from '../JobConfigForm';
import { addJob } from '../../../../api';

/**
 * CreateConfig — thin wrapper that renders JobConfigForm in create mode.
 * On publish, the job is stored in the shared data file.
 */
export function CreateConfig({ onCreated }) {
  const handlePublish = async (form) => {
    try {
      const job = await addJob(form);
      onCreated?.(job.id);
    } catch (error) {
      window.alert(error.message || 'Unable to create job.');
    }
  };

  return <JobConfigForm mode="create" onPublish={handlePublish} />;
}
