import React, { useMemo, useState } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  Edit3,
  Mail,
  Play,
  Search,
  Send,
  SlidersHorizontal,
  Trash2,
} from 'lucide-react';
import type {
  AutomationWorkflow,
  FamilyJourney,
  JourneyStage,
  LoveSchoolState,
  WarmEmailDraft,
} from '../../types';

const STAGE_FILTERS: Array<'All' | JourneyStage> = [
  'All',
  'Wix Inquiry',
  'Calendly Tour',
  'Drive Packet',
  'QuickBooks Tuition',
  'Classroom Placement',
  'Ongoing Care',
];

interface OverviewViewProps {
  state: LoveSchoolState;
  googleConnected: boolean;
  onSelectFamily: (family: FamilyJourney) => void;
  onApproveEmailDraft: (draft: WarmEmailDraft, editedSubject: string, editedBody: string) => void;
  onDeleteEmailDraft: (draftId: string) => Promise<void>;
  onToggleAutomation: (id: string, patch: Partial<AutomationWorkflow> & { runNow?: boolean }) => Promise<void>;
  onOpenConnectors: () => void;
}

export const OverviewView: React.FC<OverviewViewProps> = ({
  state,
  googleConnected,
  onSelectFamily,
  onApproveEmailDraft,
  onDeleteEmailDraft,
  onToggleAutomation,
  onOpenConnectors,
}) => {
  const [stageFilter, setStageFilter] = useState<'All' | JourneyStage>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingDraftId, setEditingDraftId] = useState<string | null>(null);
  const [draftSubject, setDraftSubject] = useState('');
  const [draftBody, setDraftBody] = useState('');

  const pendingDrafts = useMemo(
    () => state.emailDrafts.filter((d) => d.status === 'Pending Review'),
    [state.emailDrafts]
  );

  const upcomingToursCount = useMemo(
    () => state.calendlyEvents.filter((e) => e.status === 'Upcoming').length,
    [state.calendlyEvents]
  );

  const collectedTuitionCents = useMemo(
    () =>
      state.invoices
        .filter((i) => i.status === 'Paid')
        .reduce((sum, i) => sum + i.amountCents, 0),
    [state.invoices]
  );

  const filteredFamilies = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return state.families.filter((f) => {
      const matchesStage = stageFilter === 'All' || f.stage === stageFilter;
      const matchesQuery =
        !q ||
        f.familyName.toLowerCase().includes(q) ||
        f.parentNames.toLowerCase().includes(q) ||
        f.childName.toLowerCase().includes(q) ||
        f.program.toLowerCase().includes(q);
      return matchesStage && matchesQuery;
    });
  }, [state.families, stageFilter, searchQuery]);

  const startEditingDraft = (draft: WarmEmailDraft) => {
    setEditingDraftId(draft.id);
    setDraftSubject(draft.subject);
    setDraftBody(draft.body);
  };

  return (
    <div className="space-y-8">
      {/* Editorial Header Strip */}
      <section className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-[#E5E7EB]">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full overflow-hidden bg-[#E5E7EB] shrink-0 border border-[#D1D5DB] flex items-center justify-center">
            <img
              src="/src/assets/images/director_avatar_1794869226035.jpg"
              alt="Director Clara Vance"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-semibold text-[#14181F] text-balance tracking-tight">
              Love School Family &amp; Studio Hub
            </h1>
            <p className="mt-1 text-sm text-[#525C6A]">
              loveschoolu.com <span aria-hidden="true">·</span> Automated logistics across 8 tools, reviewed by humans before every personal touch.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onOpenConnectors}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-[#14181F] bg-white border border-[#D1D5DB] rounded-md hover:bg-[#F9FAFB] transition-colors whitespace-nowrap shrink-0 self-start lg:self-auto"
        >
          <SlidersHorizontal className="w-4 h-4 text-[#525C6A]" />
          Manage 8 Integrations
        </button>
      </section>

      {/* 4-Column Metric Strip */}
      <section className="grid grid-cols-2 lg:grid-cols-4 border border-[#E5E7EB] bg-white rounded-lg divide-y lg:divide-y-0 lg:divide-x divide-[#E5E7EB]">
        <div className="p-5">
          <p className="text-xs font-medium text-[#525C6A]">Active Families</p>
          <p className="mt-2 text-2xl font-semibold text-[#14181F] font-mono tabular-nums">
            {state.families.length}
          </p>
          <p className="mt-1 text-xs text-[#525C6A]">
            {state.wixLeads.filter((l) => l.status === 'New Inquiry').length} new Wix inquiries
          </p>
        </div>

        <div className="p-5">
          <p className="text-xs font-medium text-[#525C6A]">Upcoming Calendly Tours</p>
          <p className="mt-2 text-2xl font-semibold text-[#14181F] font-mono tabular-nums">
            {upcomingToursCount}
          </p>
          <p className="mt-1 text-xs text-[#525C6A]">Discovery &amp; campus visits</p>
        </div>

        <div className="p-5">
          <p className="text-xs font-medium text-[#525C6A]">Personal Touches Queued</p>
          <p className="mt-2 text-2xl font-semibold text-[#1E4D3B] font-mono tabular-nums">
            {pendingDrafts.length}
          </p>
          <p className="mt-1 text-xs text-[#525C6A]">
            {googleConnected ? 'Ready to send via Gmail' : 'Review & personalize'}
          </p>
        </div>

        <div className="p-5">
          <p className="text-xs font-medium text-[#525C6A]">Tuition Collected (Nov)</p>
          <p className="mt-2 text-2xl font-semibold text-[#14181F] font-mono tabular-nums">
            ${(collectedTuitionCents / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </p>
          <p className="mt-1 text-xs text-[#525C6A]">QuickBooks Online synced</p>
        </div>
      </section>

      {/* Personal Touch Approval Queue */}
      <section className="bg-white border border-[#E5E7EB] rounded-lg overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-6 py-4 border-b border-[#E5E7EB]">
          <div>
            <h2 className="text-lg font-semibold text-[#14181F]">
              Personal Touch Approval Queue
            </h2>
            <p className="text-xs text-[#525C6A] mt-0.5">
              Automated triggers draft warm messages so your team never starts from a blank page—nothing sends until you approve.
            </p>
          </div>
          <span className="text-xs font-mono text-[#525C6A] shrink-0">
            {pendingDrafts.length} awaiting review
          </span>
        </div>

        {pendingDrafts.length === 0 ? (
          <div className="px-6 py-10 text-center">
            <CheckCircle2 className="w-6 h-6 text-[#15803D] mx-auto" />
            <p className="mt-2 text-sm font-medium text-[#14181F]">
              All personal family messages have been reviewed and sent.
            </p>
            <p className="mt-1 text-xs text-[#525C6A]">
              New drafts appear here automatically when families submit Wix forms, finish Calendly tours, or pay QuickBooks invoices.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[#E5E7EB]">
            {pendingDrafts.map((draft) => {
              const isEditing = editingDraftId === draft.id;
              return (
                <div key={draft.id} className="p-6 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <p className="text-xs text-[#525C6A]">
                        {draft.triggerSource} <span aria-hidden="true">·</span> {draft.toneTag}{' '}
                        <span aria-hidden="true">·</span> {draft.createdAt}
                      </p>
                      <p className="mt-1 text-sm font-semibold text-[#14181F]">
                        To: {draft.recipientName} ({draft.recipientEmail})
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() =>
                          isEditing ? setEditingDraftId(null) : startEditingDraft(draft)
                        }
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#374151] bg-white border border-[#D1D5DB] rounded-md hover:bg-[#F9FAFB] whitespace-nowrap"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        {isEditing ? 'Done Editing' : 'Personalize'}
                      </button>
                      <button
                        type="button"
                        onClick={() => onDeleteEmailDraft(draft.id)}
                        aria-label={`Discard draft for ${draft.recipientName}`}
                        className="p-1.5 text-[#525C6A] hover:text-[#B91C1C] rounded-md hover:bg-[#FEF2F2] transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          onApproveEmailDraft(
                            draft,
                            isEditing ? draftSubject : draft.subject,
                            isEditing ? draftBody : draft.body
                          )
                        }
                        className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-medium text-white bg-[#1E4D3B] rounded-md hover:bg-[#163B2D] whitespace-nowrap"
                      >
                        <Send className="w-3.5 h-3.5" />
                        {googleConnected ? 'Approve & Send via Gmail' : 'Approve & Send'}
                      </button>
                    </div>
                  </div>

                  {isEditing ? (
                    <div className="space-y-2.5 pt-2">
                      <input
                        type="text"
                        value={draftSubject}
                        onChange={(e) => setDraftSubject(e.target.value)}
                        className="w-full px-3 py-2 text-sm font-medium border border-[#D1D5DB] rounded-md focus:outline-none focus:border-[#1E4D3B]"
                      />
                      <textarea
                        rows={5}
                        value={draftBody}
                        onChange={(e) => setDraftBody(e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-[#D1D5DB] rounded-md focus:outline-none focus:border-[#1E4D3B]"
                      />
                    </div>
                  ) : (
                    <div className="bg-[#F8F9FA] border border-[#E5E7EB] rounded-md p-4">
                      <p className="text-sm font-medium text-[#14181F]">{draft.subject}</p>
                      <p className="mt-2 text-sm text-[#374151] whitespace-pre-line leading-relaxed">
                        {draft.body}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Active Family Journey Directory */}
      <section className="bg-white border border-[#E5E7EB] rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-[#E5E7EB] space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-[#14181F]">Family Journey Directory</h2>
              <p className="text-xs text-[#525C6A] mt-0.5">
                Click any family to review personal notes, Drive enrollment checklists, QuickBooks status, and timeline.
              </p>
            </div>
            <div className="relative w-full md:w-72">
              <Search className="w-4 h-4 text-[#525C6A] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search family, child, or program..."
                className="w-full pl-9 pr-3 py-2 text-sm bg-[#F8F9FA] border border-[#E5E7EB] rounded-md focus:outline-none focus:bg-white focus:border-[#1E4D3B]"
              />
            </div>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            {STAGE_FILTERS.map((stage) => {
              const active = stageFilter === stage;
              return (
                <button
                  key={stage}
                  type="button"
                  onClick={() => setStageFilter(stage)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                    active
                      ? 'bg-[#14181F] text-white'
                      : 'bg-[#F3F4F6] text-[#525C6A] hover:text-[#14181F]'
                  }`}
                >
                  {stage}
                </button>
              );
            })}
          </div>
        </div>

        {filteredFamilies.length === 0 ? (
          <div className="px-6 py-10 text-center text-sm text-[#525C6A]">
            No families match that filter or search query.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#E5E7EB] bg-[#F8F9FA] text-xs font-medium text-[#525C6A]">
                  <th className="py-3 px-6">Family &amp; Child</th>
                  <th className="py-3 px-4">Program</th>
                  <th className="py-3 px-4">Current Stage</th>
                  <th className="py-3 px-4">Drive Packet</th>
                  <th className="py-3 px-4">Tuition</th>
                  <th className="py-3 px-6 text-right">Next Personal Step</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB] text-sm">
                {filteredFamilies.map((fam) => {
                  const completedDocs = fam.checklist.filter((c) => c.completed).length;
                  return (
                    <tr
                      key={fam.id}
                      onClick={() => onSelectFamily(fam)}
                      className="hover:bg-[#F9FAFB] cursor-pointer transition-colors"
                    >
                      <td className="py-3.5 px-6">
                        <p className="font-medium text-[#14181F]">{fam.familyName}</p>
                        <p className="text-xs text-[#525C6A]">
                          {fam.childName} ({fam.childAge}) <span aria-hidden="true">·</span> {fam.parentNames}
                        </p>
                      </td>
                      <td className="py-3.5 px-4 text-[#374151] whitespace-nowrap">
                        {fam.program}
                      </td>
                      <td className="py-3.5 px-4 font-medium text-[#1E4D3B] whitespace-nowrap">
                        {fam.stage}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-xs text-[#525C6A] whitespace-nowrap">
                        {completedDocs}/{fam.checklist.length} docs
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`text-xs font-medium ${
                            fam.tuitionStatus === 'Paid'
                              ? 'text-[#15803D]'
                              : fam.tuitionStatus === 'Needs Gentle Follow-up'
                              ? 'text-[#B45309]'
                              : 'text-[#525C6A]'
                          }`}
                        >
                          {fam.tuitionStatus}
                        </span>
                      </td>
                      <td className="py-3.5 px-6 text-right">
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-[#14181F]">
                          {fam.nextStepLabel}
                          <ArrowRight className="w-3.5 h-3.5 text-[#525C6A]" />
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Cross-Tool Workflow Automations & Recent Activity */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 bg-white border border-[#E5E7EB] rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-[#E5E7EB]">
            <h2 className="text-lg font-semibold text-[#14181F]">
              Relationship-First Workflow Automations
            </h2>
            <p className="text-xs text-[#525C6A] mt-0.5">
              Connects Wix, Calendly, Drive, QuickBooks, Classroom, Notion, Gmail, and Meta Social without losing your human voice.
            </p>
          </div>
          <div className="divide-y divide-[#E5E7EB]">
            {state.automations.map((auto) => (
              <div key={auto.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 text-xs text-[#525C6A]">
                    <span>{auto.triggerTool}</span>
                    <span aria-hidden="true">·</span>
                    <span>{auto.targetTools.join(' + ')}</span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono">{auto.runsCount} runs</span>
                  </div>
                  <p className="mt-1 text-sm font-semibold text-[#14181F]">{auto.name}</p>
                  <p className="mt-0.5 text-xs text-[#525C6A] leading-relaxed">
                    {auto.actionSummary}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() =>
                      onToggleAutomation(auto.id, {
                        mode:
                          auto.mode === 'Human Review Queue'
                            ? 'Instant Send'
                            : 'Human Review Queue',
                      })
                    }
                    className="px-2.5 py-1.5 text-xs font-medium text-[#374151] bg-[#F8F9FA] border border-[#E5E7EB] rounded-md hover:bg-[#F3F4F6] whitespace-nowrap"
                  >
                    {auto.mode}
                  </button>
                  <button
                    type="button"
                    onClick={() => onToggleAutomation(auto.id, { enabled: !auto.enabled })}
                    className={`px-2.5 py-1.5 text-xs font-medium rounded-md border whitespace-nowrap ${
                      auto.enabled
                        ? 'bg-[#ECFDF5] text-[#15803D] border-[#A7F3D0]'
                        : 'bg-[#F3F4F6] text-[#525C6A] border-[#D1D5DB]'
                    }`}
                  >
                    {auto.enabled ? 'Active' : 'Paused'}
                  </button>
                  <button
                    type="button"
                    onClick={() => onToggleAutomation(auto.id, { runNow: true })}
                    aria-label={`Run ${auto.name} now`}
                    className="p-1.5 text-[#1E4D3B] border border-[#D1D5DB] rounded-md hover:bg-[#F9FAFB]"
                  >
                    <Play className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Unified Activity Stream */}
        <div className="lg:col-span-5 bg-white border border-[#E5E7EB] rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-[#E5E7EB] flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-[#14181F]">Cross-Platform Pulse</h2>
              <p className="text-xs text-[#525C6A] mt-0.5">Recent syncs &amp; family milestones</p>
            </div>
            <Clock className="w-4 h-4 text-[#525C6A]" />
          </div>
          <div className="divide-y divide-[#F3F4F6] max-h-[420px] overflow-y-auto">
            {state.activityLog.slice(0, 12).map((act) => (
              <div key={act.id} className="px-6 py-3.5">
                <div className="flex items-center justify-between text-xs text-[#525C6A]">
                  <span className="font-medium text-[#1E4D3B]">
                    {act.tool}
                    {act.familyName ? ` · ${act.familyName}` : ''}
                  </span>
                  <span className="font-mono">{act.timestamp}</span>
                </div>
                <p className="mt-1 text-sm text-[#14181F] leading-snug">{act.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};
