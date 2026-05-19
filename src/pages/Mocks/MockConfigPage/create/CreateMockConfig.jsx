import { MockConfigForm } from '../MockConfigForm';
import { addMock } from '../../../../api';

/**
 * CreateMockConfig - thin wrapper that renders MockConfigForm in create mode.
 * On publish the mock is stored in the shared data file.
 * Status is derived (not set manually).
 */
export function CreateMockConfig({ onCreated }) {
  const handlePublish = async (form) => {
    try {
      const mock = await addMock(form);
      onCreated?.(mock.id);
    } catch (error) {
      window.alert(error.message || 'Unable to create mock.');
    }
  };

  return <MockConfigForm mode="create" onPublish={handlePublish} />;
}
