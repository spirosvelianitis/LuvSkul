import React, { useMemo, useState } from 'react';
import {
  CheckCircle2,
  CreditCard,
  ExternalLink,
  GraduationCap,
  HeartHandshake,
  Megaphone,
  Plus,
  RefreshCw,
  Users,
} from 'lucide-react';
import type {
  GoogleClassroomAnnouncement,
  GoogleClassroomCourse,
  GoogleClassroomStudent,
  LoveSchoolState,
  QuickBooksInvoice,
} from '../../types';
import { GoogleSignInButton } from '../GoogleSignInButton';

interface ClassroomBillingViewProps {
  state: LoveSchoolState;
  googleConnected: boolean;
  classroomCourses: GoogleClassroomCourse[];
  selectedCourseId: string | null;
  classroomStudents: GoogleClassroomStudent[];
  classroomAnnouncements: GoogleClassroomAnnouncement[];
  loadingGoogle: boolean;
  onGoogleSignIn: () => void;
  onSelectClassroomCourse: (courseId: string) => Promise<void>;
  onRefreshClassroom: () => Promise<void>;
  onRequestPostAnnouncement: (courseId: string, courseName: string, text: string) => void;
  onCreateInvoice: (payload: {
    familyName: string;
    parentEmail: string;
    program: string;
    billingPeriod: string;
    amountDollars: number;
    dueDate: string;
  }) => Promise<void>;
  onUpdateInvoice: (
    id: string,
    patch: { status?: QuickBooksInvoice['status']; queueGentleReminder?: boolean }
  ) => Promise<void>;
}

export const ClassroomBillingView: React.FC<ClassroomBillingViewProps> = ({
  state,
  googleConnected,
  classroomCourses,
  selectedCourseId,
  classroomStudents,
  classroomAnnouncements,
  loadingGoogle,
  onGoogleSignIn,
  onSelectClassroomCourse,
  onRefreshClassroom,
  onRequestPostAnnouncement,
  onCreateInvoice,
  onUpdateInvoice,
}) => {
  const [activeTab, setActiveTab] = useState<'classroom' | 'quickbooks'>('classroom');
  const [announcementText, setAnnouncementText] = useState('');

  // QuickBooks Filters & New Invoice Form
  const [statusFilter, setStatusFilter] = useState<'All' | QuickBooksInvoice['status']>('All');
  const [showNewInvoice, setShowNewInvoice] = useState(false);
  const [invFamily, setInvFamily] = useState('');
  const [invEmail, setInvEmail] = useState('');
  const [invProgram, setInvProgram] = useState('Lower Elementary Explorers');
  const [invPeriod, setInvPeriod] = useState('December 2026');
  const [invAmount, setInvAmount] = useState('1450');
  const [invDue, setInvDue] = useState('Dec 01, 2026');

  const selectedCourse =
    classroomCourses.find((c) => c.id === selectedCourseId) || classroomCourses[0];

  const filteredInvoices = useMemo(() => {
    if (statusFilter === 'All') return state.invoices;
    return state.invoices.filter((i) => i.status === statusFilter);
  }, [state.invoices, statusFilter]);

  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!invFamily.trim() || !invAmount) return;
    await onCreateInvoice({
      familyName: invFamily.trim(),
      parentEmail: invEmail.trim() || 'family@example.org',
      program: invProgram,
      billingPeriod: invPeriod,
      amountDollars: Number(invAmount),
      dueDate: invDue,
    });
    setInvFamily('');
    setInvEmail('');
    setShowNewInvoice(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#E5E7EB]">
        <div>
          <h1 className="text-2xl font-semibold text-[#14181F]">
            Google Classroom &amp; QuickBooks Tuition
          </h1>
          <p className="mt-1 text-sm text-[#525C6A]">
            Unite virtual classroom rosters &amp; announcements with compassionate family tuition billing.
          </p>
        </div>

        <div className="flex items-center gap-1 p-1 bg-[#EAECEF] rounded-lg self-start shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('classroom')}
            className={`px-3.5 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
              activeTab === 'classroom'
                ? 'bg-white text-[#14181F] shadow-sm'
                : 'text-[#525C6A] hover:text-[#14181F]'
            }`}
          >
            Google Classroom
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('quickbooks')}
            className={`px-3.5 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
              activeTab === 'quickbooks'
                ? 'bg-white text-[#14181F] shadow-sm'
                : 'text-[#525C6A] hover:text-[#14181F]'
            }`}
          >
            QuickBooks Invoicing
          </button>
        </div>
      </div>

      {activeTab === 'classroom' ? (
        <div className="space-y-6">
          {/* Love School Cohorts Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {state.classroomCohorts.map((cohort) => (
              <div
                key={cohort.id}
                className="bg-white border border-[#E5E7EB] rounded-lg p-5 space-y-3"
              >
                <div className="flex items-center justify-between text-xs text-[#525C6A]">
                  <span>{cohort.ageGroup}</span>
                  <span className="font-mono">
                    {cohort.enrolledCount}/{cohort.capacity} seats
                  </span>
                </div>
                <div>
                  <h3 className="text-base font-semibold text-[#14181F]">{cohort.name}</h3>
                  <p className="text-xs text-[#525C6A] mt-0.5">
                    Lead Guide: {cohort.leadEducator} · {cohort.guardianLinkRate}
                  </p>
                </div>
                <p className="text-xs text-[#374151] bg-[#F8F9FA] border border-[#E5E7EB] rounded-md p-3 leading-relaxed">
                  {cohort.recentAnnouncement}
                </p>
                <p className="text-xs font-medium text-[#1E4D3B]">{cohort.nextGathering}</p>
              </div>
            ))}
          </div>

          {/* Live Google Classroom Integration */}
          <div className="bg-white border border-[#E5E7EB] rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-[#E5E7EB] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-[#1E4D3B]" />
                <div>
                  <h2 className="text-base font-semibold text-[#14181F]">
                    Live Google Classroom Workspace
                  </h2>
                  <p className="text-xs text-[#525C6A]">
                    Inspect real Classroom courses, student rosters, and publish warm family announcements.
                  </p>
                </div>
              </div>
              {googleConnected ? (
                <button
                  type="button"
                  onClick={() => onRefreshClassroom()}
                  disabled={loadingGoogle}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#374151] bg-[#F8F9FA] border border-[#D1D5DB] rounded-md hover:bg-[#F3F4F6] whitespace-nowrap self-start"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loadingGoogle ? 'animate-spin' : ''}`} />
                  Sync Courses
                </button>
              ) : (
                <GoogleSignInButton onClick={onGoogleSignIn} />
              )}
            </div>

            {googleConnected ? (
              classroomCourses.length === 0 ? (
                <div className="p-8 text-center text-sm text-[#525C6A]">
                  {loadingGoogle
                    ? 'Loading active Google Classroom courses...'
                    : 'No active Google Classroom courses found on this account.'}
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-12">
                  {/* Course List */}
                  <div className="lg:col-span-4 border-b lg:border-b-0 lg:border-r border-[#E5E7EB] divide-y divide-[#F3F4F6]">
                    {classroomCourses.map((course) => (
                      <button
                        key={course.id}
                        type="button"
                        onClick={() => onSelectClassroomCourse(course.id)}
                        className={`w-full text-left px-5 py-4 transition-colors ${
                          selectedCourse?.id === course.id ? 'bg-[#F8F9FA]' : 'hover:bg-[#F9FAFB]'
                        }`}
                      >
                        <p className="text-sm font-semibold text-[#14181F]">{course.name}</p>
                        <p className="text-xs text-[#525C6A] mt-0.5">
                          {course.section || course.descriptionHeading || 'Active Course'}
                        </p>
                      </button>
                    ))}
                  </div>

                  {/* Selected Course Details + Roster + Announcement */}
                  <div className="lg:col-span-8 p-6 space-y-6">
                    {selectedCourse && (
                      <>
                        <div className="flex items-start justify-between gap-4 pb-4 border-b border-[#E5E7EB]">
                          <div>
                            <h3 className="text-lg font-semibold text-[#14181F]">
                              {selectedCourse.name}
                            </h3>
                            <p className="text-xs text-[#525C6A] mt-0.5">
                              {selectedCourse.section || 'Google Classroom'} ·{' '}
                              {classroomStudents.length} students synced
                            </p>
                          </div>
                          {selectedCourse.alternateLink && (
                            <a
                              href={selectedCourse.alternateLink}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 text-xs font-medium text-[#1E4D3B] hover:underline whitespace-nowrap"
                            >
                              Open in Classroom
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          )}
                        </div>

                        {/* Post Announcement */}
                        <div className="space-y-2.5">
                          <label className="flex items-center gap-1.5 text-xs font-medium text-[#525C6A]">
                            <Megaphone className="w-3.5 h-3.5" />
                            Post Warm Classroom Announcement
                          </label>
                          <textarea
                            rows={3}
                            value={announcementText}
                            onChange={(e) => setAnnouncementText(e.target.value)}
                            placeholder="Share a warm reminder, weekend reflection, or photo gathering invite..."
                            className="w-full px-3 py-2 text-sm border border-[#D1D5DB] rounded-md focus:outline-none focus:border-[#1E4D3B]"
                          />
                          <div className="flex justify-end">
                            <button
                              type="button"
                              disabled={!announcementText.trim()}
                              onClick={() => {
                                onRequestPostAnnouncement(
                                  selectedCourse.id,
                                  selectedCourse.name,
                                  announcementText.trim()
                                );
                                setAnnouncementText('');
                              }}
                              className="px-4 py-2 text-xs font-medium text-white bg-[#1E4D3B] rounded-md hover:bg-[#163B2D] disabled:opacity-50"
                            >
                              Publish to Google Classroom
                            </button>
                          </div>
                        </div>

                        {/* Roster & Recent Stream */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 border-t border-[#E5E7EB]">
                          <div>
                            <p className="flex items-center gap-1.5 text-xs font-medium text-[#525C6A] mb-2.5">
                              <Users className="w-3.5 h-3.5" />
                              Enrolled Students
                            </p>
                            {classroomStudents.length === 0 ? (
                              <p className="text-xs text-[#525C6A]">No students listed yet.</p>
                            ) : (
                              <ul className="space-y-1.5 text-sm text-[#14181F]">
                                {classroomStudents.map((st) => (
                                  <li key={st.userId} className="truncate">
                                    {st.profile.name.fullName}
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>

                          <div>
                            <p className="text-xs font-medium text-[#525C6A] mb-2.5">
                              Recent Announcements
                            </p>
                            {classroomAnnouncements.length === 0 ? (
                              <p className="text-xs text-[#525C6A]">No recent announcements.</p>
                            ) : (
                              <div className="space-y-2.5">
                                {classroomAnnouncements.map((ann) => (
                                  <div
                                    key={ann.id}
                                    className="p-3 bg-[#F8F9FA] border border-[#E5E7EB] rounded-md text-xs text-[#374151]"
                                  >
                                    {ann.text}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )
            ) : (
              <div className="p-8 text-center text-sm text-[#525C6A]">
                Sign in with Google Workspace above to load live Google Classroom courses and rosters.
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* QuickBooks Tuition Ledger */}
          <div className="bg-white border border-[#E5E7EB] rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-[#E5E7EB] flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-semibold text-[#14181F]">
                  QuickBooks Tuition &amp; Stewardship Ledger
                </h2>
                <p className="text-xs text-[#525C6A] mt-0.5">
                  Marking an invoice Paid automatically prepares Google Classroom placement and a warm welcome note.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-1 p-1 bg-[#F3F4F6] rounded-md">
                  {(['All', 'Paid', 'Sent', 'Needs Gentle Follow-up'] as const).map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setStatusFilter(st)}
                      className={`px-2.5 py-1 text-xs font-medium rounded transition-colors whitespace-nowrap ${
                        statusFilter === st
                          ? 'bg-white text-[#14181F] shadow-sm'
                          : 'text-[#525C6A] hover:text-[#14181F]'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => setShowNewInvoice((v) => !v)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-white bg-[#1E4D3B] rounded-md hover:bg-[#163B2D] whitespace-nowrap"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Issue Invoice
                </button>
              </div>
            </div>

            {showNewInvoice && (
              <form
                onSubmit={handleCreateInvoice}
                className="p-6 bg-[#F8F9FA] border-b border-[#E5E7EB] grid grid-cols-1 md:grid-cols-6 gap-3"
              >
                <input
                  type="text"
                  required
                  placeholder="Family name"
                  value={invFamily}
                  onChange={(e) => setInvFamily(e.target.value)}
                  className="px-3 py-2 text-sm bg-white border border-[#D1D5DB] rounded-md"
                />
                <input
                  type="email"
                  placeholder="Parent email"
                  value={invEmail}
                  onChange={(e) => setInvEmail(e.target.value)}
                  className="px-3 py-2 text-sm bg-white border border-[#D1D5DB] rounded-md"
                />
                <select
                  value={invProgram}
                  onChange={(e) => setInvProgram(e.target.value)}
                  className="px-3 py-2 text-sm bg-white border border-[#D1D5DB] rounded-md"
                >
                  <option value="Early Childhood Wonder">Early Childhood Wonder</option>
                  <option value="Lower Elementary Explorers">Lower Elementary Explorers</option>
                  <option value="Upper Studio Makers">Upper Studio Makers</option>
                </select>
                <input
                  type="text"
                  value={invPeriod}
                  onChange={(e) => setInvPeriod(e.target.value)}
                  className="px-3 py-2 text-sm bg-white border border-[#D1D5DB] rounded-md"
                />
                <input
                  type="number"
                  required
                  min="1"
                  value={invAmount}
                  onChange={(e) => setInvAmount(e.target.value)}
                  placeholder="Amount ($)"
                  className="px-3 py-2 text-sm bg-white border border-[#D1D5DB] rounded-md font-mono"
                />
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={invDue}
                    onChange={(e) => setInvDue(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-white border border-[#D1D5DB] rounded-md"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 text-xs font-medium text-white bg-[#14181F] rounded-md whitespace-nowrap"
                  >
                    Create
                  </button>
                </div>
              </form>
            )}

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-[#E5E7EB] bg-[#F8F9FA] text-xs font-medium text-[#525C6A]">
                    <th className="py-3 px-6">Invoice #</th>
                    <th className="py-3 px-4">Family &amp; Program</th>
                    <th className="py-3 px-4">Period</th>
                    <th className="py-3 px-4">Due Date</th>
                    <th className="py-3 px-4 text-right">Amount</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-6 text-right">Personal Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E7EB]">
                  {filteredInvoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-[#F9FAFB]">
                      <td className="py-3.5 px-6 font-mono text-xs text-[#14181F] whitespace-nowrap">
                        {inv.invoiceNumber}
                      </td>
                      <td className="py-3.5 px-4">
                        <p className="font-medium text-[#14181F]">{inv.familyName}</p>
                        <p className="text-xs text-[#525C6A]">{inv.program}</p>
                      </td>
                      <td className="py-3.5 px-4 text-[#374151] whitespace-nowrap">
                        {inv.billingPeriod}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-xs text-[#525C6A] whitespace-nowrap">
                        {inv.dueDate}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono tabular-nums font-medium text-[#14181F] whitespace-nowrap">
                        ${(inv.amountCents / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 text-xs font-medium ${
                            inv.status === 'Paid'
                              ? 'text-[#15803D]'
                              : inv.status === 'Needs Gentle Follow-up'
                              ? 'text-[#B45309]'
                              : 'text-[#374151]'
                          }`}
                        >
                          {inv.status === 'Paid' ? (
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          ) : (
                            <CreditCard className="w-3.5 h-3.5" />
                          )}
                          {inv.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-6 text-right whitespace-nowrap">
                        {inv.status !== 'Paid' ? (
                          <div className="inline-flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => onUpdateInvoice(inv.id, { queueGentleReminder: true })}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-[#374151] bg-white border border-[#D1D5DB] rounded-md hover:bg-[#F9FAFB]"
                            >
                              <HeartHandshake className="w-3.5 h-3.5 text-[#B45309]" />
                              {inv.gentleNoteSent ? 'Queued Check-In' : 'Gentle Note'}
                            </button>
                            <button
                              type="button"
                              onClick={() => onUpdateInvoice(inv.id, { status: 'Paid' })}
                              className="px-3 py-1.5 text-xs font-medium text-white bg-[#1E4D3B] rounded-md hover:bg-[#163B2D]"
                            >
                              Record Paid
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs font-mono text-[#525C6A]">
                            Paid {inv.paidAt || ''}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
