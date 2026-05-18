import { CheckCircle } from 'lucide-react';
import { Button } from '../../../../components/ui/Button';

export function EditFooterActions({ onSaveChanges, disabled = false }) {
  return (
    <Button
      variant="primary"
      iconLeft={<CheckCircle size={16} />}
      onClick={onSaveChanges}
      disabled={disabled}
    >
      Save Changes
    </Button>
  );
}
