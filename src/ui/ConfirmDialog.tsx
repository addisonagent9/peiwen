import React from 'react';

interface Props {
  open: boolean;
  message: string;
  confirmLabel: string;
  cancelLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
  destructive?: boolean;
}

export function ConfirmDialog({ open, message, confirmLabel, cancelLabel, onConfirm, onCancel, destructive }: Props) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={onCancel}>
      <div className="bg-ink-bg border border-ink-line rounded-lg p-6 max-w-sm" onClick={e => e.stopPropagation()}>
        <p className="text-cream font-serif mb-4">{message}</p>
        <div className="flex justify-end gap-2">
          <button onClick={onCancel} className="px-3 py-1.5 text-sm text-creamDim hover:text-cream">{cancelLabel}</button>
          <button
            onClick={onConfirm}
            className={`px-3 py-1.5 text-sm rounded ${destructive ? 'bg-red-700 text-cream hover:bg-red-600' : 'bg-gold text-ink-bg hover:opacity-90'}`}
          >{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}
