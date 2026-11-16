import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  Circle,
  ExternalLink,
  Mail,
  MessageSquarePlus,
  X,
} from 'lucide-react';
import type { FamilyJourney, JourneyStage } from '../types';

const STAGES: JourneyStage[] = [
  'Wix Inquiry',
  'Calendly Tour',
  'Drive Packet',
  'QuickBooks Tuition',
  'Classroom Placement',
  'Ongoing Care',
];

interface FamilyDrawerProps {
  family: FamilyJourney | null;
  onClose: () => void;
  onUpdateFamily: (familyId: string, patch: Record<string, unknown>) => Promise<void>;
  onOpenWarmComposer: (family: FamilyJourney) => void;
}

export const FamilyDrawer: React.FC<FamilyDrawerProps> = ({
  family,
  onClose,
  onUpdateFamily,
  onOpenWarmComposer,
}) => {
  const [warmthNote, setWarmthNote] = useState('');
  const [newTouchpoint, setNewTouchpoint] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (family) {
      setWarmthNote(family.warmthNote);
      setNewTouchpoint('');
    }
  }, [family]);

  if (!family) return null;

  const handleStageChange = async (stage: JourneyStage) => {
    setSaving(true);
    try {
      await onUpdateFamily(family.id, {
        stage,
        touchpoint: {
          channel: 'Note',
          summary: `Moved family journey stage to ${stage}.`,
          author: 'Clara Vance',
        },
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveWarmthNote = async () => {
    setSaving(true);
    try {
      await onUpdateFamily(family.id, { warmthNote });
    } finally {
      setSaving(false);
    }
  };

  const handleToggleChecklist = async (itemId: string) => {
    const updated = family.checklist.map((item) =>
      item.id === itemId
        ? { ...item, completed: !item.completed, updatedAt: !item.completed ? 'Today' : undefined }
        : item
    );
    await onUpdateFamily(family.id, { checklist: updated });
  };

  const handleLogTouchpoint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTouchpoint.trim()) return;
    setSaving(true);
    try {
      await onUpdateFamily(family.id, {
        touchpoint: {
          channel: 'Note',
          summary: newTouchpoint.trim(),
          author: 'Clara Vance',
        },
      });
      setNewTouchpoint('');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-40 flex justify-end bg-[#14181F]/30 backdrop-blur-[1px]"
      role="dialog"
      aria-modal="true"
      aria-label={`${family.familyName} relationship profile`}
    >
      <div className="w-full max-w-xl bg-white h-full border-l border-[#E5E7EB] flex flex-col overflow-hidden">
        {/* Drawer Header */}
        <div className="flex items-start justify-between gap-4 px-6 py-5 border-b border-[#E5E7EB]">
          <div className="min-w-0">
            <p className="text-xs text-[#525C6A]">
              {family.program} <span aria-hidden="true">·</span> Child: {family.childName} ({family.childAge})
            </p>
            <h2 className="mt-1 text-xl font-semibold text-[#14181F] truncate">
              {family.familyName}
            </h2>
            <p className="mt-1 text-sm text-[#525C6A]">
              {family.parentNames} <span aria-hidden="true">·</span> {family.email}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close family drawer"
            className="p-2 rounded-md text-[#525C6A] hover:text-[#14181F] hover:bg-[#F3F4F6] transition-colors shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Drawer Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          {/* Quick Relational Action */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-5 border-b border-[#E5E7EB]">
            <div>
              <p className="text-xs font-medium text-[#525C6A]">Next personal step</p>
              <p className="mt-0.5 text-sm font-medium text-[#14181F]">{family.nextStepLabel}</p>
            </div>
            <button
              type="button"
              onClick={() => onOpenWarmComposer(family)}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#1E4D3B] rounded-md hover:bg-[#163B2D] transition-colors whitespace-nowrap shrink-0"
            >
              <Mail className="w-4 h-4" />
              Draft Warm Note
            </button>
          </div>

          {/* 6-Stage Journey Selector */}
          <div>
            <p className="text-xs font-medium text-[#525C6A] mb-2.5">Family Journey Stage</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
              {STAGES.map((stage) => {
                const active = family.stage === stage;
                return (
                  <button
                    key={stage}
                    type="button"
                    disabled={saving}
                    onClick={() => handleStageChange(stage)}
                    className={`px-3 py-2 text-xs font-medium rounded-md border text-left transition-colors whitespace-nowrap truncate ${
                      active
                        ? 'bg-[#1E4D3B] text-white border-[#1E4D3B]'
                        : 'bg-white text-[#374151] border-[#E5E7EB] hover:bg-[#F9FAFB]'
                    }`}
                  >
                    {stage}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Relationship & Care Notes */}
          <div className="pt-5 border-t border-[#E5E7EB]">
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="family-warmth-note" className="text-xs font-medium text-[#525C6A]">
                Personal Context & Child Interests
              </label>
              <span className="text-xs text-[#525C6A]">Guide: {family.assignedGuide}</span>
            </div>
            <textarea
              id="family-warmth-note"
              rows={3}
              value={warmthNote}
              onChange={(e) => setWarmthNote(e.target.value)}
              className="w-full px-3 py-2 text-sm text-[#14181F] bg-[#F9FAFB] border border-[#E5E7EB] rounded-md focus:outline-none focus:border-[#1E4D3B]"
            />
            <div className="mt-2 flex items-center justify-between gap-4">
              <span className="text-xs text-[#525C6A]">Prefers: {family.preferredContact}</span>
              <button
                type="button"
                disabled={saving || warmthNote === family.warmthNote}
                onClick={handleSaveWarmthNote}
                className="px-3 py-1.5 text-xs font-medium text-[#1E4D3B] bg-[#ECFDF5] border border-[#A7F3D0] rounded-md hover:bg-[#D1FAE5] disabled:opacity-40 transition-colors whitespace-nowrap shrink-0"
              >
                Save Note
              </button>
            </div>
          </div>

          {/* Google Drive Enrollment Packet Checklist */}
          <div className="pt-5 border-t border-[#E5E7EB]">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-medium text-[#525C6A]">
                Google Drive Enrollment Packet
              </p>
              {family.driveFolderUrl && (
                <a
                  href={family.driveFolderUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-medium text-[#1E4D3B] hover:underline whitespace-nowrap"
                >
                  Open Drive Folder
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
            <div className="divide-y divide-[#E5E7EB] border border-[#E5E7EB] rounded-md">
              {family.checklist.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleToggleChecklist(item.id)}
                  className="w-full flex items-center justify-between gap-3 px-3.5 py-2.5 text-left hover:bg-[#F9FAFB] transition-colors"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    {item.completed ? (
                      <CheckCircle2 className="w-4 h-4 text-[#15803D] shrink-0" />
                    ) : (
                      <Circle className="w-4 h-4 text-[#9CA3AF] shrink-0" />
                    )}
                    <span
                      className={`text-sm truncate ${
                        item.completed ? 'text-[#14181F]' : 'text-[#525C6A]'
                      }`}
                    >
                      {item.label}
                    </span>
                  </div>
                  <span className="text-xs font-mono text-[#525C6A] shrink-0">
                    {item.completed ? item.updatedAt || 'Complete' : 'Pending'}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Cross-Tool Snapshot */}
          <div className="pt-5 border-t border-[#E5E7EB] grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-xs text-[#525C6A]">Google Classroom</p>
              <p className="mt-0.5 font-medium text-[#14181F]">{family.classroomCohort}</p>
            </div>
            <div>
              <p className="text-xs text-[#525C6A]">QuickBooks Tuition</p>
              <p className="mt-0.5 font-medium text-[#14181F]">{family.tuitionStatus}</p>
            </div>
          </div>

          {/* Log Touchpoint + Timeline */}
          <div className="pt-5 border-t border-[#E5E7EB]">
            <p className="text-xs font-medium text-[#525C6A] mb-3">Relationship Timeline</p>
            <form onSubmit={handleLogTouchpoint} className="flex gap-2 mb-4">
              <input
                type="text"
                value={newTouchpoint}
                onChange={(e) => setNewTouchpoint(e.target.value)}
                placeholder="Log a call, hallway chat, or family observation..."
                className="flex-1 px-3 py-2 text-sm bg-white border border-[#E5E7EB] rounded-md focus:outline-none focus:border-[#1E4D3B]"
              />
              <button
                type="submit"
                disabled={saving || !newTouchpoint.trim()}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-white bg-[#14181F] rounded-md hover:bg-[#272E3A] disabled:opacity-40 transition-colors whitespace-nowrap shrink-0"
              >
                <MessageSquarePlus className="w-3.5 h-3.5" />
                Log Touch
              </button>
            </form>

            <div className="space-y-3">
              {family.touchpoints.map((tp) => (
                <div key={tp.id} className="pb-3 border-b border-[#F3F4F6] last:border-b-0">
                  <div className="flex items-center justify-between gap-2 text-xs text-[#525C6A]">
                    <span>
                      {tp.channel} <span aria-hidden="true">·</span> {tp.author}
                    </span>
                    <span className="font-mono">{tp.date}</span>
                  </div>
                  <p className="mt-1 text-sm text-[#14181F] leading-relaxed">{tp.summary}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
