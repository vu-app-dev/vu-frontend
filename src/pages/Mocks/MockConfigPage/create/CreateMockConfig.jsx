import { MockConfigForm } from '../MockConfigForm';
import { addMock } from '../../../../api';
import { useState } from 'react';
import { ConfirmDialog } from '../../../../components/ui/Dialog';

/**
 * CreateMockConfig - thin wrapper that renders MockConfigForm in create mode.
 * On publish the mock is stored in the shared data file.
 * Status is derived (not set manually).
 */
export function CreateMockConfig({ onCreated }) {
  const [error, setError] = useState('');

  const handlePublish = async (form) => {
    try {
      const mock = await addMock(form);
      onCreated?.(mock.id);
    } catch (error) {
      setError(error.message || 'Unable to create mock.');
    }
  };

  return (
    <>
      <MockConfigForm mode="create" onPublish={handlePublish} />
      <ConfirmDialog
        isOpen={Boolean(error)}
        title="Unable to create mock"
        description={error}
        confirmLabel="Close"
        showCancel={false}
        onConfirm={() => setError('')}
        onClose={() => setError('')}
      />
    </>
  );
}
