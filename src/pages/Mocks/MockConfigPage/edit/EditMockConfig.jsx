import { useMemo, useState } from 'react';
import { Info } from 'lucide-react';
import { MockConfigForm } from '../MockConfigForm';
import { ConfirmDialog } from '../../../../components/ui/Dialog';
import { getMockById, getMockForm, getMockStatus, updateMock, useBackendData } from '../../../../api';

/**
 * EditMockConfig renders MockConfigForm in edit mode with backend data.
 */
export function EditMockConfig({ mockId, onSaved }) {
  const { dataVersion } = useBackendData();
  const [error, setError] = useState('');
  const mock = getMockById(mockId);
  const formData = useMemo(() => {
    void dataVersion;
    return mock ? getMockForm(mock) : null;
  }, [mock, dataVersion]);
  const isActive = mock ? getMockStatus(mock.id) === 'active' : false;

  const handleSaveChanges = async (form) => {
    if (!mock) return;
    try {
      const saved = await updateMock(mock.id, form);
      onSaved?.(saved?.id || mock.id);
    } catch (error) {
      setError(error.message || 'Unable to update mock.');
    }
  };

  if (!formData) {
    return (
      <div style={{ padding: 'var(--padding-lg)', color: 'var(--text-tertiary)' }}>
        Mock not found.
      </div>
    );
  }

  if (isActive) {
    return (
      <div className="create-mock-page">
        <div className="create-mock">
          <div className="create-mock__active-banner">
            <Info size={16} />
            <span>This mock is used in an active job and cannot be edited.</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <MockConfigForm
        mode="edit"
        initialData={formData}
        isActive={isActive}
        onSaveChanges={handleSaveChanges}
      />
      <ConfirmDialog
        isOpen={Boolean(error)}
        title="Unable to update mock"
        description={error}
        confirmLabel="Close"
        showCancel={false}
        onConfirm={() => setError('')}
        onClose={() => setError('')}
      />
    </>
  );
}
