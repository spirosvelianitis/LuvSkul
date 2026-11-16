import React, { useState } from 'react';
import {
  Calendar,
  CheckCircle2,
  Copy,
  ExternalLink,
  Globe,
  Plus,
  UserPlus,
} from 'lucide-react';
import type { CalendlyEvent, LoveSchoolState, WixPage } from '../../types';

interface WebsiteCalendlyViewProps {
  state: LoveSchoolState;
  onUpdateWixPage: (id: string, patch: Partial<WixPage>) => Promise<void>;
  onConvertWixLead: (leadId: string) => Promise<void>;
  onCreateCalendlyEvent: (payload: {
    familyName: string;
    parentEmail: string;
    eventType: string;
    scheduledFor: string;
    hostName: string;
    prepNote: string;
  }) => Promise<void>;
  onUpdateCalendlyEvent: (id: string, patch: Partial<CalendlyEvent>) => Promise<void>;
}

export const WebsiteCalendlyView: React.FC<WebsiteCalendlyViewProps> = ({
  state,
  onUpdateWixPage,
  onConvertWixLead,
  onCreateCalendlyEvent,
  onUpdateCalendlyEvent,
}) => {
  const [activeTab, setActiveTab] = useState<'wix' | 'calendly'>('wix');
  const [selectedPageId, setSelectedPageId] = useState<string>(state.wixPages[0]?.id || 'wp-1');
  const selectedPage =
    state.wixPages.find((p) => p.id === selectedPageId) || state.wixPages[0];

  const [headlineDraft, setHeadlineDraft] = useState(selectedPage?.headline || '');
  const [subheadlineDraft, setSubheadlineDraft] = useState(selectedPage?.subheadline || '');
  const [savingPage, setSavingPage] = useState(false);

  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [showNewTour, setShowNewTour] = useState(false);
  const [tourFamily, setTourFamily] = useState('');
  const [tourEmail, setTourEmail] = useState('');
  const [tourType, setTourType] = useState('Campus Visit & Family Tour');
  const [tourSlot, setTourSlot] = useState('Nov 21, 2026 · 10:00 AM');
  const [tourNote, setTourNote] = useState('');

  const handleSelectPage = (page: WixPage) => {
    setSelectedPageId(page.id);
    setHeadlineDraft(page.headline);
    setSubheadlineDraft(page.subheadline);
  };

  const handlePublishPage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPage) return;
    setSavingPage(true);
    try {
      await onUpdateWixPage(selectedPage.id, {
        headline: headlineDraft,
        subheadline: subheadlineDraft,
        status: 'Published',
      });
    } finally {
      setSavingPage(false);
    }
  };

  const handleCreateTour = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tourFamily.trim()) return;
    await onCreateCalendlyEvent({
      familyName: tourFamily.trim(),
      parentEmail: tourEmail.trim() || 'family@example.org',
      eventType: tourType,
      scheduledFor: tourSlot,
      hostName: 'Clara Vance',
      prepNote: tourNote.trim() || 'Prepare studio tea and welcome folder.',
    });
    setTourFamily('');
    setTourEmail('');
    setTourNote('');
    setShowNewTour(false);
  };

  const copyBookingLink = (id: string, url: string) => {
    navigator.clipboard?.writeText(url);
    setCopiedUrl(id);
    setTimeout(() => setCopiedUrl(null), 1800);
  };

  return (
    <div className="space-y-6">
      {/* Header + Segmented Control */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#E5E7EB]">
        <div>
          <h1 className="text-2xl font-semibold text-[#14181F]">
            Wix Website &amp; Calendly Scheduling
          </h1>
          <p className="mt-1 text-sm text-[#525C6A]">
            Manage loveschoolu.com content, welcome incoming inquiries, and host warm campus tours.
          </p>
        </div>

        <div className="flex items-center gap-1 p-1 bg-[#EAECEF] rounded-lg self-start shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('wix')}
            className={`px-3.5 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
              activeTab === 'wix'
                ? 'bg-white text-[#14181F] shadow-sm'
                : 'text-[#525C6A] hover:text-[#14181F]'
            }`}
          >
            Wix Site (loveschoolu.com)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('calendly')}
            className={`px-3.5 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
              activeTab === 'calendly'
                ? 'bg-white text-[#14181F] shadow-sm'
                : 'text-[#525C6A] hover:text-[#14181F]'
            }`}
          >
            Calendly Appointments
          </button>
        </div>
      </div>

      {activeTab === 'wix' ? (
        <div className="space-y-6">
          {/* Wix Live Preview & Page Editor */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-5 bg-white border border-[#E5E7EB] rounded-lg overflow-hidden">
              <div className="aspect-video w-full bg-[#EAECEF] relative overflow-hidden">
                <img
                  src="/src/assets/images/school_studio_hero_1794869225291.jpg"
                  alt="Love School sunlit classroom studio"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/30 to-transparent flex flex-col justify-end p-5">
                  <p className="text-xs text-white/80 font-mono">
                    https://loveschoolu.com{selectedPage?.path}
                  </p>
                  <p className="mt-1 text-base font-display font-semibold text-white leading-snug">
                    {headlineDraft || selectedPage?.headline}
                  </p>
                </div>
              </div>

              <div className="divide-y divide-[#E5E7EB]">
                {state.wixPages.map((page) => (
                  <button
                    key={page.id}
                    type="button"
                    onClick={() => handleSelectPage(page)}
                    className={`w-full text-left px-5 py-3.5 flex items-center justify-between gap-3 transition-colors ${
                      selectedPage?.id === page.id ? 'bg-[#F8F9FA]' : 'hover:bg-[#F9FAFB]'
                    }`}
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-[#14181F] truncate">{page.title}</p>
                      <p className="text-xs text-[#525C6A] font-mono mt-0.5">
                        {page.path} · {page.monthlyVisits.toLocaleString()} visits/mo
                      </p>
                    </div>
                    <span className="text-xs font-medium text-[#15803D] shrink-0">
                      {page.status}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="lg:col-span-7 bg-white border border-[#E5E7EB] rounded-lg p-6">
              <div className="flex items-center justify-between pb-4 border-b border-[#E5E7EB]">
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-[#1E4D3B]" />
                  <h2 className="text-base font-semibold text-[#14181F]">
                    Edit Wix Page Copy ({selectedPage?.path})
                  </h2>
                </div>
                <a
                  href="https://www.loveschoolu.com"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-medium text-[#1E4D3B] hover:underline whitespace-nowrap"
                >
                  Visit loveschoolu.com
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              <form onSubmit={handlePublishPage} className="mt-5 space-y-4">
                <div>
                  <label className="block text-xs font-medium text-[#525C6A] mb-1.5">
                    Hero Headline
                  </label>
                  <input
                    type="text"
                    value={headlineDraft}
                    onChange={(e) => setHeadlineDraft(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm text-[#14181F] border border-[#D1D5DB] rounded-md focus:outline-none focus:border-[#1E4D3B]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#525C6A] mb-1.5">
                    Supporting Subheadline
                  </label>
                  <textarea
                    rows={3}
                    value={subheadlineDraft}
                    onChange={(e) => setSubheadlineDraft(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm text-[#14181F] border border-[#D1D5DB] rounded-md focus:outline-none focus:border-[#1E4D3B]"
                  />
                </div>
                <div className="flex items-center justify-between pt-2">
                  <span className="text-xs text-[#525C6A]">
                    Last synced with Wix: {selectedPage?.lastSyncedAt}
                  </span>
                  <button
                    type="submit"
                    disabled={savingPage}
                    className="px-4 py-2 text-sm font-medium text-white bg-[#1E4D3B] rounded-md hover:bg-[#163B2D] disabled:opacity-60 whitespace-nowrap"
                  >
                    {savingPage ? 'Publishing...' : 'Publish Update to Wix'}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Incoming Wix Inquiries */}
          <div className="bg-white border border-[#E5E7EB] rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-[#E5E7EB] flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold text-[#14181F]">
                  Incoming Inquiries from loveschoolu.com
                </h2>
                <p className="text-xs text-[#525C6A] mt-0.5">
                  Converting an inquiry creates a Family Journey card and queues a personalized Calendly welcome email.
                </p>
              </div>
            </div>

            <div className="divide-y divide-[#E5E7EB]">
              {state.wixLeads.map((lead) => (
                <div
                  key={lead.id}
                  className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1 max-w-2xl">
                    <div className="flex items-center gap-2 text-xs text-[#525C6A]">
                      <span>{lead.submittedAt}</span>
                      <span aria-hidden="true">·</span>
                      <span>{lead.programInterest}</span>
                      <span aria-hidden="true">·</span>
                      <span>
                        Child: {lead.childName} ({lead.childAge})
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-[#14181F]">
                      {lead.parentName} ({lead.email})
                    </p>
                    <p className="text-sm text-[#374151] leading-relaxed">
                      &ldquo;{lead.personalStory}&rdquo;
                    </p>
                  </div>

                  <div className="shrink-0">
                    {lead.status === 'Converted' ? (
                      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#15803D]">
                        <CheckCircle2 className="w-4 h-4" />
                        In Family Journey
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => onConvertWixLead(lead.id)}
                        className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-[#1E4D3B] rounded-md hover:bg-[#163B2D] whitespace-nowrap"
                      >
                        <UserPlus className="w-3.5 h-3.5" />
                        Welcome &amp; Start Journey
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Calendly Booking Types */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {state.calendlyBookingTypes.map((bt) => (
              <div
                key={bt.id}
                className="bg-white border border-[#E5E7EB] rounded-lg p-5 flex flex-col justify-between gap-4"
              >
                <div>
                  <p className="text-xs text-[#525C6A] font-mono">
                    {bt.durationMinutes} min · {bt.location}
                  </p>
                  <h3 className="mt-1 text-base font-semibold text-[#14181F]">{bt.name}</h3>
                  <p className="mt-1.5 text-sm text-[#525C6A] leading-relaxed">{bt.description}</p>
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-[#F3F4F6]">
                  <span className="text-xs font-medium text-[#15803D]">Active on Calendly</span>
                  <button
                    type="button"
                    onClick={() => copyBookingLink(bt.id, bt.bookingUrl)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#14181F] bg-[#F8F9FA] border border-[#D1D5DB] rounded-md hover:bg-[#F3F4F6] whitespace-nowrap"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    {copiedUrl === bt.id ? 'Copied Link' : 'Copy Link'}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Upcoming & Completed Tours */}
          <div className="bg-white border border-[#E5E7EB] rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-[#E5E7EB] flex items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-semibold text-[#14181F]">
                  Scheduled Family Appointments
                </h2>
                <p className="text-xs text-[#525C6A] mt-0.5">
                  Marking a tour completed prepares the family’s Drive Enrollment Packet and queues a warm reflection email.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowNewTour((v) => !v)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-white bg-[#1E4D3B] rounded-md hover:bg-[#163B2D] whitespace-nowrap shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                Book Tour / Call
              </button>
            </div>

            {showNewTour && (
              <form
                onSubmit={handleCreateTour}
                className="p-6 bg-[#F8F9FA] border-b border-[#E5E7EB] grid grid-cols-1 md:grid-cols-4 gap-3"
              >
                <input
                  type="text"
                  required
                  placeholder="Family name"
                  value={tourFamily}
                  onChange={(e) => setTourFamily(e.target.value)}
                  className="px-3 py-2 text-sm bg-white border border-[#D1D5DB] rounded-md"
                />
                <input
                  type="email"
                  placeholder="Parent email"
                  value={tourEmail}
                  onChange={(e) => setTourEmail(e.target.value)}
                  className="px-3 py-2 text-sm bg-white border border-[#D1D5DB] rounded-md"
                />
                <select
                  value={tourType}
                  onChange={(e) => setTourType(e.target.value)}
                  className="px-3 py-2 text-sm bg-white border border-[#D1D5DB] rounded-md"
                >
                  <option value="Warm Discovery Call">Warm Discovery Call</option>
                  <option value="Campus Visit & Family Tour">Campus Visit &amp; Family Tour</option>
                  <option value="Mid-Term Family Heart-to-Heart">Mid-Term Family Heart-to-Heart</option>
                </select>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={tourSlot}
                    onChange={(e) => setTourSlot(e.target.value)}
                    className="flex-1 px-3 py-2 text-sm bg-white border border-[#D1D5DB] rounded-md"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 text-xs font-medium text-white bg-[#14181F] rounded-md whitespace-nowrap"
                  >
                    Save
                  </button>
                </div>
                <input
                  type="text"
                  placeholder="Personal prep note for the guide..."
                  value={tourNote}
                  onChange={(e) => setTourNote(e.target.value)}
                  className="md:col-span-4 px-3 py-2 text-sm bg-white border border-[#D1D5DB] rounded-md"
                />
              </form>
            )}

            <div className="divide-y divide-[#E5E7EB]">
              {state.calendlyEvents.map((ev) => (
                <div
                  key={ev.id}
                  className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs text-[#525C6A]">
                      <Calendar className="w-3.5 h-3.5" />
                      <span className="font-mono">{ev.scheduledFor}</span>
                      <span aria-hidden="true">·</span>
                      <span>{ev.eventType}</span>
                      <span aria-hidden="true">·</span>
                      <span>Host: {ev.hostName}</span>
                    </div>
                    <p className="text-sm font-semibold text-[#14181F]">{ev.familyName}</p>
                    <p className="text-xs text-[#525C6A]">Prep note: {ev.prepNote}</p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span
                      className={`text-xs font-medium ${
                        ev.status === 'Completed' ? 'text-[#15803D]' : 'text-[#1E4D3B]'
                      }`}
                    >
                      {ev.status}
                    </span>
                    {ev.status === 'Upcoming' && (
                      <button
                        type="button"
                        onClick={() => onUpdateCalendlyEvent(ev.id, { status: 'Completed' })}
                        className="px-3.5 py-1.5 text-xs font-medium text-white bg-[#1E4D3B] rounded-md hover:bg-[#163B2D] whitespace-nowrap"
                      >
                        Mark Completed &amp; Queue Packet
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
