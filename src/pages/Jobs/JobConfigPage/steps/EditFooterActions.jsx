import { Button } from '../../../../components/ui/Button';

export function EditFooterActions({ onSaveChanges, disabled = false }) {
  return (
    <Button
      variant="primary"
      onClick={onSaveChanges}
      disabled={disabled}
    >
      Save changes
    </Button>
  );
}
