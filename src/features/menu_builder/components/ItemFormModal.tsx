'use client';

// src/features/menu/components/ItemFormModal.tsx

import { Modal } from '../../../components/ui/UiComponents';
import { ItemForm } from './ItemForm';
import type { ItemModalState, ItemFormValues } from '../types';

interface ItemFormModalProps {
  modal: ItemModalState;
  saving: boolean;
  isAdvanceCategory: boolean;
  /** plan_limits.advanced_item_details */
  canUseAdvancedDetails?: boolean;
  onClose: () => void;
  onSubmit: (values: ItemFormValues) => void;
  onUpgrade?: () => void;
}

export function ItemFormModal({
  modal,
  saving,
  onClose,
  onSubmit,
  isAdvanceCategory,
  canUseAdvancedDetails,
  onUpgrade,
}: ItemFormModalProps) {
  return (
    <Modal open={modal.open} onClose={onClose} title={modal.item ? 'Edit Item' : 'Add Item'}>
      <ItemForm
        initial={modal.item}
        onSubmit={onSubmit}
        loading={saving}
        isAdvanceCategory={isAdvanceCategory}
        canUseAdvancedDetails={canUseAdvancedDetails}
        onUpgrade={onUpgrade}
      />
    </Modal>
  );
}
