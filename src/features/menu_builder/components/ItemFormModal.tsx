'use client';

// src/features/menu/components/ItemFormModal.tsx

import { Modal } from '../../../components/shared/ui';
import { ItemForm } from './ItemForm';
import type { ItemModalState, ItemFormValues } from '../types';

interface ItemFormModalProps {
  modal: ItemModalState;
  saving: boolean;
  isAdvanceCategory: boolean;
  onClose: () => void;
  onSubmit: (values: ItemFormValues) => void;
}

export function ItemFormModal({ modal, saving, onClose, onSubmit, isAdvanceCategory }: ItemFormModalProps) {
  return (
    <Modal open={modal.open} onClose={onClose} title={modal.item ? 'Edit Item' : 'Add Item'}>
      <ItemForm initial={modal.item} onSubmit={onSubmit} loading={saving} isAdvanceCategory={isAdvanceCategory} />
    </Modal>
  );
}
