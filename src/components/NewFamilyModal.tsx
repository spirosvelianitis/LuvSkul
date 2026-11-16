import React, { useState } from 'react';
import { X } from 'lucide-react';

interface NewFamilyModalProps {
  open: boolean;
  onClose: () => void;
  onCreateFamily: (payload: {
    familyName: string;
    parentNames: string;
    email: string;
    phone: string;
    childName: string;
    childAge: string;
    program: string;
    warmthNote: string;
  }) => Promise<void>;
}

export const NewFamilyModal: React.FC<NewFamilyModalProps> = ({
  open,
  onClose,
  onCreateFamily,
}) => {
  const [familyName, setFamilyName] = useState('');
  const [parentNames, setParentNames] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [childName, setChildName] = useState('');
  const [childAge, setChildAge] = useState('');
  const [program, setProgram] = useState('Early Childhood Wonder');
  const [warmthNote, setWarmthNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!familyName.trim() || !email.trim() || !childName.trim()) return;
    setSubmitting(true);
    try {
      await onCreateFamily({
        familyName: familyName.trim(),
        parentNames: parentNames.trim() || familyName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        childName: childName.trim(),
        childAge: childAge.trim() || '5 years',
        program,
        warmthNote: warmthNote.trim(),
      });
      setFamilyName('');
      setParentNames('');
      setEmail('');
      setPhone('');
      setChildName('');
      setChildAge('');
      setWarmthNote('');
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#14181F]/40 backdrop-blur-[2px] p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Add new family inquiry"
    >
      <div className="w-full max-w-lg bg-white border border-[#E5E7EB] rounded-lg shadow-lg overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E7EB]">
          <div>
            <h2 className="text-base font-semibold text-[#14181F]">Welcome a New Family</h2>
            <p className="text-xs text-[#525C6A] mt-0.5">
              Creates a Family Journey and prepares a personal welcome draft for review.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="p-1.5 rounded-md text-[#525C6A] hover:text-[#14181F] hover:bg-[#F3F4F6]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#525C6A] mb-1">Family Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Rivera Family"
                value={familyName}
                onChange={(e) => setFamilyName(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-[#D1D5DB] rounded-md focus:outline-none focus:border-[#1E4D3B]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#525C6A] mb-1">Parent / Guardian Names</label>
              <input
                type="text"
                placeholder="e.g. Sofia & Carlos Rivera"
                value={parentNames}
                onChange={(e) => setParentNames(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-[#D1D5DB] rounded-md focus:outline-none focus:border-[#1E4D3B]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#525C6A] mb-1">Email *</label>
              <input
                type="email"
                required
                placeholder="parent@example.org"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-[#D1D5DB] rounded-md focus:outline-none focus:border-[#1E4D3B]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#525C6A] mb-1">Phone</label>
              <input
                type="text"
                placeholder="(512) 555-0100"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-[#D1D5DB] rounded-md focus:outline-none focus:border-[#1E4D3B]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#525C6A] mb-1">Child Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Leo"
                value={childName}
                onChange={(e) => setChildName(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-[#D1D5DB] rounded-md focus:outline-none focus:border-[#1E4D3B]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#525C6A] mb-1">Child Age</label>
              <input
                type="text"
                placeholder="e.g. 5 years"
                value={childAge}
                onChange={(e) => setChildAge(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-[#D1D5DB] rounded-md focus:outline-none focus:border-[#1E4D3B]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#525C6A] mb-1">Program</label>
              <select
                value={program}
                onChange={(e) => setProgram(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-[#D1D5DB] rounded-md bg-white focus:outline-none focus:border-[#1E4D3B]"
              >
                <option value="Early Childhood Wonder">Early Childhood Wonder</option>
                <option value="Lower Elementary Explorers">Lower Elementary Explorers</option>
                <option value="Upper Studio Makers">Upper Studio Makers</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#525C6A] mb-1">
              What excites this family or child?
            </label>
            <textarea
              rows={3}
              placeholder="Share a quick personal note so your welcome email feels thoughtful and grounded..."
              value={warmthNote}
              onChange={(e) => setWarmthNote(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-[#D1D5DB] rounded-md focus:outline-none focus:border-[#1E4D3B]"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-[#525C6A] bg-white border border-[#D1D5DB] rounded-md hover:bg-[#F9FAFB]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 text-sm font-medium text-white bg-[#1E4D3B] rounded-md hover:bg-[#163B2D] disabled:opacity-60"
            >
              {submitting ? 'Adding...' : 'Create Family Journey'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
