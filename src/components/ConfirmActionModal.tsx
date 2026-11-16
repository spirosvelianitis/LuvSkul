import React from 'react';
import { ShieldAlert, X } from 'lucide-react';

export interface ConfirmActionModalProps {
  open: boolean;
  title: string;
  description: string;
  details?: string[];
  confirmLabel?: string;
  busy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmActionModal: React.FC<ConfirmActionModalProps> = ({
  open,
  title,
  description,
  details,
  confirmLabel = 'Confirm',
  busy = false,
  onConfirm,
  onCancel,
}) => {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#14181F]/40 backdrop-blur-[2px] p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-modal-title"
    >
      <div className="w-full max-w-md bg-white border border-[#E5E7EB] rounded-lg shadow-lg overflow-hidden">
        <div className="flex items-start justify-between gap-4 px-6 py-5 border-b border-[#E5E7EB]">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 p-2 rounded-md bg-[#FEF3C7] text-[#B45309] shrink-0">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <h3 id="confirm-modal-title" className="text-base font-semibold text-[#14181F]">
                {title}
              </h3>
              <p className="mt-1 text-sm text-[#525C6A] leading-relaxed">{description}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onCancel}
            disabled={busy}
            aria-label="Close confirmation dialog"
            className="p-1.5 rounded-md text-[#525C6A] hover:text-[#14181F] hover:bg-[#F3F4F6] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {details && details.length > 0 && (
          <div className="px-6 py-4 bg-[#F8F9FA] border-b border-[#E5E7EB]">
            <p className="text-xs font-medium text-[#525C6A] mb-2">Action summary</p>
            <ul className="space-y-1.5 text-sm text-[#14181F]">
              {details.map((item, idx) => (
                <li key={idx} className="leading-snug">
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex items-center justify-end gap-3 px-6 py-4 bg-white">
          <button
            type="button"
            onClick={onCancel}
            disabled={busy}
            className="px-4 py-2 text-sm font-medium text-[#525C6A] bg-white border border-[#D1D5DB] rounded-md hover:bg-[#F9FAFB] transition-colors whitespace-nowrap shrink-0"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={busy}
            className="px-4 py-2 text-sm font-medium text-white bg-[#1E4D3B] rounded-md hover:bg-[#163B2D] disabled:opacity-60 transition-colors whitespace-nowrap shrink-0"
          >
            {busy ? 'Working...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
