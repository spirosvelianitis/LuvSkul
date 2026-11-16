import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  BookOpen,
  CalendarDays,
  CheckCircle2,
  GraduationCap,
  Heart,
  Mail,
  Menu,
  Plus,
  Settings2,
  X,
} from 'lucide-react';
import type { User } from 'firebase/auth';
import type {
  AutomationWorkflow,
  CalendlyEvent,
  FamilyJourney,
  GoogleClassroomAnnouncement,
  GoogleClassroomCourse,
  GoogleClassroomStudent,
  GoogleDriveFile,
  GoogleGmailMessage,
  IntegrationConnector,
  LoveSchoolState,
  NavSection,
  NotionCurriculumUnit,
  QuickBooksInvoice,
  SocialPost,
  WarmEmailDraft,
  WixPage,
} from './types';
import {
  createClassroomAnnouncement,
  createDriveFolder,
  getAccessToken,
  googleSignIn,
  initAuth,
  listClassroomAnnouncements,
  listClassroomCourses,
  listClassroomStudents,
  listDriveFiles,
  listGmailMessages,
  logoutGoogle,
  sendGmailMessage,
} from './lib/googleWorkspace';
import { GoogleSignInButton } from './components/GoogleSignInButton';
import { ConfirmActionModal } from './components/ConfirmActionModal';
import { FamilyDrawer } from './components/FamilyDrawer';
import { ConnectorSettingsModal } from './components/ConnectorSettingsModal';
import { NewFamilyModal } from './components/NewFamilyModal';
import { OverviewView } from './components/views/OverviewView';
import { WebsiteCalendlyView } from './components/views/WebsiteCalendlyView';
import { CommsDriveView } from './components/views/CommsDriveView';
import { ClassroomBillingView } from './components/views/ClassroomBillingView';
import { CurriculumSocialView } from './components/views/CurriculumSocialView';

interface PendingConfirmation {
  title: string;
  description: string;
  details: string[];
  confirmLabel: string;
  execute: () => Promise<void>;
}

const NAV_ITEMS: Array<{
  id: NavSection;
  label: string;
  subtitle: string;
  icon: React.FC<{ className?: string }>;
}> = [
  {
    id: 'overview',
    label: 'Family Hub',
    subtitle: 'Journeys & Automations',
    icon: Heart,
  },
  {
    id: 'website-scheduling',
    label: 'Wix & Calendly',
    subtitle: 'loveschoolu.com & Tours',
    icon: CalendarDays,
  },
  {
    id: 'comms-drive',
    label: 'Email & Drive',
    subtitle: 'Gmail & Enrollment Docs',
    icon: Mail,
  },
  {
    id: 'classroom-billing',
    label: 'Classroom & Tuition',
    subtitle: 'Classroom & QuickBooks',
    icon: GraduationCap,
  },
  {
    id: 'curriculum-social',
    label: 'Notion & Social',
    subtitle: 'Curriculum & IG / FB',
    icon: BookOpen,
  },
];

export default function App() {
  const [state, setState] = useState<LoveSchoolState | null>(null);
  const [loadingState, setLoadingState] = useState(true);
  const [activeSection, setActiveSection] = useState<NavSection>('overview');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Modals & Drawers
  const [selectedFamilyId, setSelectedFamilyId] = useState<string | null>(null);
  const [connectorsOpen, setConnectorsOpen] = useState(false);
  const [newFamilyOpen, setNewFamilyOpen] = useState(false);
  const [pendingConfirm, setPendingConfirm] = useState<PendingConfirmation | null>(null);
  const [confirmBusy, setConfirmBusy] = useState(false);
  const [bannerNotice, setBannerNotice] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Google Workspace Auth & Live Data
  const [googleUser, setGoogleUser] = useState<User | null>(null);
  const [googleToken, setGoogleToken] = useState<string | null>(null);
  const [needsAuth, setNeedsAuth] = useState(true);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loadingGoogle, setLoadingGoogle] = useState(false);

  const [gmailMessages, setGmailMessages] = useState<GoogleGmailMessage[]>([]);
  const [driveFiles, setDriveFiles] = useState<GoogleDriveFile[]>([]);
  const [classroomCourses, setClassroomCourses] = useState<GoogleClassroomCourse[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [classroomStudents, setClassroomStudents] = useState<GoogleClassroomStudent[]>([]);
  const [classroomAnnouncements, setClassroomAnnouncements] = useState<GoogleClassroomAnnouncement[]>([]);

  const showNotice = useCallback((type: 'success' | 'error', text: string) => {
    setBannerNotice({ type, text });
    setTimeout(() => {
      setBannerNotice((prev) => (prev?.text === text ? null : prev));
    }, 4500);
  }, []);

  const fetchState = useCallback(async () => {
    try {
      const res = await fetch('/api/state');
      if (!res.ok) throw new Error('Failed to load Love School workspace');
      const data: LoveSchoolState = await res.json();
      setState(data);
    } catch (err) {
      console.error(err);
      showNotice('error', 'Unable to load workspace state from server.');
    } finally {
      setLoadingState(false);
    }
  }, [showNotice]);

  useEffect(() => {
    fetchState();
  }, [fetchState]);

  const loadWorkspaceData = useCallback(async (token: string) => {
    setLoadingGoogle(true);
    try {
      const [msgs, files, courses] = await Promise.all([
        listGmailMessages(token).catch(() => []),
        listDriveFiles(token).catch(() => []),
        listClassroomCourses(token).catch(() => []),
      ]);
      setGmailMessages(msgs);
      setDriveFiles(files);
      setClassroomCourses(courses);

      if (courses.length > 0) {
        const firstId = courses[0].id;
        setSelectedCourseId(firstId);
        const [students, anns] = await Promise.all([
          listClassroomStudents(token, firstId),
          listClassroomAnnouncements(token, firstId),
        ]);
        setClassroomStudents(students);
        setClassroomAnnouncements(anns);
      }
    } finally {
      setLoadingGoogle(false);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = initAuth(
      (user, token) => {
        setGoogleUser(user);
        setGoogleToken(token);
        setNeedsAuth(false);
        loadWorkspaceData(token);
      },
      () => {
        setGoogleUser(null);
        setGoogleToken(null);
        setNeedsAuth(true);
      }
    );
    return () => unsubscribe();
  }, [loadWorkspaceData]);

  const handleGoogleLogin = async () => {
    setIsLoggingIn(true);
    try {
      const result = await googleSignIn();
      if (result) {
        setGoogleUser(result.user);
        setGoogleToken(result.accessToken);
        setNeedsAuth(false);
        showNotice('success', `Connected Google Workspace as ${result.user.email}`);
        await loadWorkspaceData(result.accessToken);
      }
    } catch (err) {
      console.error('Google Sign-In error:', err);
      showNotice('error', 'Google Workspace sign-in was cancelled or failed.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleGoogleLogout = async () => {
    await logoutGoogle();
    setGoogleUser(null);
    setGoogleToken(null);
    setNeedsAuth(true);
    setGmailMessages([]);
    setDriveFiles([]);
    setClassroomCourses([]);
    showNotice('success', 'Signed out of Google Workspace.');
  };

  const selectedFamily = useMemo(() => {
    if (!state || !selectedFamilyId) return null;
    return state.families.find((f) => f.id === selectedFamilyId) || null;
  }, [state, selectedFamilyId]);

  const apiMutate = async (url: string, method: string, body?: unknown) => {
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Request failed');
    }
    const updated: LoveSchoolState = await res.json();
    setState(updated);
    return updated;
  };

  // Workspace API Handlers (all mutating Google Workspace calls use ConfirmActionModal)
  const handleRefreshGmail = async () => {
    const token = googleToken || (await getAccessToken());
    if (!token) {
      setNeedsAuth(true);
      return;
    }
    setLoadingGoogle(true);
    try {
      const msgs = await listGmailMessages(token);
      setGmailMessages(msgs);
    } finally {
      setLoadingGoogle(false);
    }
  };

  const handleRefreshDrive = async (query = '') => {
    const token = googleToken || (await getAccessToken());
    if (!token) {
      setNeedsAuth(true);
      return;
    }
    setLoadingGoogle(true);
    try {
      const files = await listDriveFiles(token, query);
      setDriveFiles(files);
    } finally {
      setLoadingGoogle(false);
    }
  };

  const handleRefreshClassroom = async () => {
    const token = googleToken || (await getAccessToken());
    if (!token) {
      setNeedsAuth(true);
      return;
    }
    setLoadingGoogle(true);
    try {
      const courses = await listClassroomCourses(token);
      setClassroomCourses(courses);
      if (courses.length > 0) {
        const targetId = selectedCourseId || courses[0].id;
        setSelectedCourseId(targetId);
        const [students, anns] = await Promise.all([
          listClassroomStudents(token, targetId),
          listClassroomAnnouncements(token, targetId),
        ]);
        setClassroomStudents(students);
        setClassroomAnnouncements(anns);
      }
    } finally {
      setLoadingGoogle(false);
    }
  };

  const handleSelectClassroomCourse = async (courseId: string) => {
    setSelectedCourseId(courseId);
    const token = googleToken || (await getAccessToken());
    if (!token) return;
    setLoadingGoogle(true);
    try {
      const [students, anns] = await Promise.all([
        listClassroomStudents(token, courseId),
        listClassroomAnnouncements(token, courseId),
      ]);
      setClassroomStudents(students);
      setClassroomAnnouncements(anns);
    } finally {
      setLoadingGoogle(false);
    }
  };

  const handleRequestSendGmail = (payload: { to: string; subject: string; body: string }) => {
    setPendingConfirm({
      title: 'Send email via Gmail?',
      description: 'This will send a live email from your connected Google account.',
      details: [
        `Recipient: ${payload.to}`,
        `Subject: ${payload.subject}`,
      ],
      confirmLabel: 'Confirm & Send Email',
      execute: async () => {
        const token = googleToken || (await getAccessToken());
        if (!token) throw new Error('Google sign-in required to send via Gmail.');
        await sendGmailMessage(token, payload);
        showNotice('success', `Email sent via Gmail to ${payload.to}.`);
        await handleRefreshGmail();
      },
    });
  };

  const handleApproveEmailDraft = (
    draft: WarmEmailDraft,
    editedSubject: string,
    editedBody: string
  ) => {
    const willUseLiveGmail = !needsAuth && Boolean(googleToken);
    setPendingConfirm({
      title: willUseLiveGmail
        ? 'Send personal note via Gmail?'
        : 'Approve & log personal family note?',
      description: willUseLiveGmail
        ? 'This will deliver the email directly from your Gmail account and record it in the family timeline.'
        : 'This will mark the message as approved and record it in the family relationship timeline.',
      details: [
        `To: ${draft.recipientName} (${draft.recipientEmail})`,
        `Subject: ${editedSubject}`,
      ],
      confirmLabel: willUseLiveGmail ? 'Send via Gmail' : 'Approve & Send',
      execute: async () => {
        if (willUseLiveGmail && googleToken) {
          await sendGmailMessage(googleToken, {
            to: draft.recipientEmail,
            subject: editedSubject,
            body: editedBody,
          });
        }
        await apiMutate(`/api/emails/drafts/${draft.id}`, 'PATCH', {
          subject: editedSubject,
          body: editedBody,
          status: 'Approved & Sent',
        });
        showNotice('success', `Personal note sent to ${draft.recipientName}.`);
      },
    });
  };

  const handleRequestCreateDriveFolder = (folderName: string) => {
    setPendingConfirm({
      title: 'Create folder in Google Drive?',
      description: 'This will create a new folder in your connected Google Drive.',
      details: [`Folder name: ${folderName}`],
      confirmLabel: 'Create Drive Folder',
      execute: async () => {
        const token = googleToken || (await getAccessToken());
        if (!token) throw new Error('Google sign-in required.');
        await createDriveFolder(token, folderName);
        showNotice('success', `Created "${folderName}" in Google Drive.`);
        await handleRefreshDrive();
      },
    });
  };

  const handleRequestPostAnnouncement = (
    courseId: string,
    courseName: string,
    text: string
  ) => {
    setPendingConfirm({
      title: 'Post announcement to Google Classroom?',
      description: 'This will publish a live announcement visible to students and guardians in the class.',
      details: [`Course: ${courseName}`, `Message: ${text}`],
      confirmLabel: 'Publish Announcement',
      execute: async () => {
        const token = googleToken || (await getAccessToken());
        if (!token) throw new Error('Google sign-in required.');
        await createClassroomAnnouncement(token, courseId, text);
        showNotice('success', `Published announcement to ${courseName}.`);
        await handleSelectClassroomCourse(courseId);
      },
    });
  };

  const handleConfirmExecute = async () => {
    if (!pendingConfirm) return;
    setConfirmBusy(true);
    try {
      await pendingConfirm.execute();
      setPendingConfirm(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Operation failed.';
      showNotice('error', msg);
    } finally {
      setConfirmBusy(false);
    }
  };

  const currentNavMeta = NAV_ITEMS.find((n) => n.id === activeSection) || NAV_ITEMS[0];

  if (loadingState || !state) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F7F8F7] text-[#525C6A] text-sm">
        Loading Love School Hub...
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-[#F7F8F7] text-[#14181F]">
      {/* Desktop Sidebar (248px) */}
      <aside className="hidden lg:flex lg:w-[248px] lg:flex-col lg:fixed lg:inset-y-0 bg-[#F2F4F2] border-r border-[#E5E7EB]">
        <div className="h-16 px-6 flex items-center border-b border-[#E5E7EB]">
          <button
            type="button"
            onClick={() => setActiveSection('overview')}
            className="text-xl font-display font-semibold tracking-tight text-[#14181F] whitespace-nowrap"
          >
            Love School
          </button>
        </div>

        <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto" aria-label="Workspace navigation">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = activeSection === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveSection(item.id)}
                className={`w-full flex items-start gap-3 px-3 py-2.5 rounded-md text-left transition-colors ${
                  active
                    ? 'bg-white text-[#1E4D3B] border border-[#E5E7EB]'
                    : 'text-[#374151] hover:bg-white/60'
                }`}
              >
                <Icon
                  className={`w-4 h-4 mt-0.5 shrink-0 ${
                    active ? 'text-[#1E4D3B]' : 'text-[#525C6A]'
                  }`}
                />
                <div className="min-w-0">
                  <p className="text-sm font-medium leading-tight whitespace-nowrap truncate">
                    {item.label}
                  </p>
                  <p className="text-[11px] text-[#525C6A] mt-0.5 truncate">{item.subtitle}</p>
                </div>
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-[#E5E7EB] space-y-2">
          <button
            type="button"
            onClick={() => setConnectorsOpen(true)}
            className="w-full flex items-center justify-between px-3 py-2 text-xs font-medium text-[#374151] bg-white border border-[#E5E7EB] rounded-md hover:bg-[#F9FAFB] transition-colors"
          >
            <span className="inline-flex items-center gap-2 whitespace-nowrap">
              <Settings2 className="w-3.5 h-3.5 text-[#525C6A]" />
              8 Tool Connectors
            </span>
            <span className="font-mono text-[#15803D]">
              {state.integrations.filter((i) => {
                const isG =
                  i.id === 'int-gmail' || i.id === 'int-drive' || i.id === 'int-classroom';
                return isG ? !needsAuth : i.status === 'Connected';
              }).length}
              /8
            </span>
          </button>
          <p className="px-1 text-[11px] text-[#525C6A] truncate">loveschoolu.com</p>
        </div>
      </aside>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-[#14181F]/35"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative w-64 bg-[#F2F4F2] h-full border-r border-[#E5E7EB] flex flex-col">
            <div className="h-16 px-5 flex items-center justify-between border-b border-[#E5E7EB]">
              <span className="text-lg font-display font-semibold text-[#14181F]">Love School</span>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                aria-label="Close navigation menu"
                className="p-1.5 text-[#525C6A]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <nav className="flex-1 p-3 space-y-1">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const active = activeSection === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setActiveSection(item.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-left ${
                      active ? 'bg-white text-[#1E4D3B] border border-[#E5E7EB]' : 'text-[#374151]'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className="text-sm font-medium">{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-[248px] flex flex-col min-w-0">
        {/* Top Bar (3 zones: Breadcrumb, Google Workspace Auth, Primary CTA) */}
        <header className="h-16 bg-white border-b border-[#E5E7EB] px-4 sm:px-8 flex items-center justify-between gap-4 sticky top-0 z-30">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open navigation menu"
              className="lg:hidden p-2 rounded-md text-[#525C6A] hover:bg-[#F3F4F6]"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 text-sm text-[#525C6A] truncate">
              <span className="hidden sm:inline font-medium text-[#14181F]">Love School</span>
              <span className="hidden sm:inline" aria-hidden="true">
                /
              </span>
              <span className="text-[#14181F] font-medium truncate">{currentNavMeta.label}</span>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {needsAuth ? (
              <GoogleSignInButton
                onClick={handleGoogleLogin}
                disabled={isLoggingIn}
                label={isLoggingIn ? 'Signing in...' : 'Sign in with Google'}
              />
            ) : (
              <div className="hidden sm:flex items-center gap-2.5 px-3 py-1.5 bg-[#F8F9FA] border border-[#E5E7EB] rounded-md text-xs">
                <span className="text-[#15803D] font-medium whitespace-nowrap">
                  Workspace Connected
                </span>
                <span className="text-[#525C6A] truncate max-w-[140px]">
                  {googleUser?.email}
                </span>
                <button
                  type="button"
                  onClick={handleGoogleLogout}
                  className="text-[#525C6A] hover:text-[#14181F] underline whitespace-nowrap"
                >
                  Sign out
                </button>
              </div>
            )}

            <button
              type="button"
              onClick={() => setNewFamilyOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-[#1E4D3B] rounded-md hover:bg-[#163B2D] transition-colors whitespace-nowrap shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Family
            </button>
          </div>
        </header>

        {/* Action Toast Banner */}
        {bannerNotice && (
          <div className="px-4 sm:px-8 pt-4">
            <div
              className={`px-4 py-3 rounded-md border text-sm flex items-center justify-between gap-3 ${
                bannerNotice.type === 'success'
                  ? 'bg-[#ECFDF5] border-[#A7F3D0] text-[#14532D]'
                  : 'bg-[#FEF2F2] border-[#FECACA] text-[#991B1B]'
              }`}
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{bannerNotice.text}</span>
              </div>
              <button
                type="button"
                onClick={() => setBannerNotice(null)}
                className="text-xs underline shrink-0"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        {/* Active View Viewport */}
        <main className="flex-1 px-4 sm:px-8 py-7 max-w-[1320px] w-full mx-auto">
          {activeSection === 'overview' && (
            <OverviewView
              state={state}
              googleConnected={!needsAuth}
              onSelectFamily={(fam) => setSelectedFamilyId(fam.id)}
              onApproveEmailDraft={handleApproveEmailDraft}
              onDeleteEmailDraft={async (id) => {
                await apiMutate(`/api/emails/drafts/${id}`, 'DELETE');
                showNotice('success', 'Draft removed from queue.');
              }}
              onToggleAutomation={async (id, patch) => {
                await apiMutate(`/api/automations/${id}`, 'PATCH', patch);
                showNotice('success', 'Workflow automation updated.');
              }}
              onOpenConnectors={() => setConnectorsOpen(true)}
            />
          )}

          {activeSection === 'website-scheduling' && (
            <WebsiteCalendlyView
              state={state}
              onUpdateWixPage={async (id, patch: Partial<WixPage>) => {
                await apiMutate(`/api/wix/pages/${id}`, 'PATCH', patch);
                showNotice('success', 'Updated loveschoolu.com page copy.');
              }}
              onConvertWixLead={async (leadId) => {
                await apiMutate(`/api/wix/leads/${leadId}/convert`, 'POST');
                showNotice(
                  'success',
                  'Family Journey created & personal welcome draft added to your Approval Queue.'
                );
              }}
              onCreateCalendlyEvent={async (payload) => {
                await apiMutate('/api/calendly/events', 'POST', payload);
                showNotice('success', `Scheduled ${payload.eventType} for ${payload.familyName}.`);
              }}
              onUpdateCalendlyEvent={async (id, patch: Partial<CalendlyEvent>) => {
                await apiMutate(`/api/calendly/events/${id}`, 'PATCH', patch);
                showNotice('success', 'Updated appointment & queued next family step.');
              }}
            />
          )}

          {activeSection === 'comms-drive' && (
            <CommsDriveView
              state={state}
              googleConnected={!needsAuth}
              googleUserEmail={googleUser?.email || null}
              gmailMessages={gmailMessages}
              driveFiles={driveFiles}
              loadingGoogle={loadingGoogle}
              onGoogleSignIn={handleGoogleLogin}
              onRefreshGmail={handleRefreshGmail}
              onRefreshDrive={handleRefreshDrive}
              onRequestSendGmail={handleRequestSendGmail}
              onSaveDraftToQueue={async (payload) => {
                await apiMutate('/api/emails/drafts', 'POST', payload);
                showNotice('success', 'Saved personal note to Approval Queue.');
              }}
              onRequestCreateDriveFolder={handleRequestCreateDriveFolder}
              onSelectFamily={(fam) => setSelectedFamilyId(fam.id)}
            />
          )}

          {activeSection === 'classroom-billing' && (
            <ClassroomBillingView
              state={state}
              googleConnected={!needsAuth}
              classroomCourses={classroomCourses}
              selectedCourseId={selectedCourseId}
              classroomStudents={classroomStudents}
              classroomAnnouncements={classroomAnnouncements}
              loadingGoogle={loadingGoogle}
              onGoogleSignIn={handleGoogleLogin}
              onSelectClassroomCourse={handleSelectClassroomCourse}
              onRefreshClassroom={handleRefreshClassroom}
              onRequestPostAnnouncement={handleRequestPostAnnouncement}
              onCreateInvoice={async (payload) => {
                await apiMutate('/api/invoices', 'POST', payload);
                showNotice('success', `Issued QuickBooks invoice for ${payload.familyName}.`);
              }}
              onUpdateInvoice={async (id, patch) => {
                await apiMutate(`/api/invoices/${id}`, 'PATCH', patch);
                showNotice(
                  'success',
                  patch.queueGentleReminder
                    ? 'Gentle billing check-in added to your Personal Touch Queue.'
                    : 'Updated invoice & synced family journey.'
                );
              }}
            />
          )}

          {activeSection === 'curriculum-social' && (
            <CurriculumSocialView
              state={state}
              onUpdateNotionUnit={async (id, patch: Partial<NotionCurriculumUnit> & { shareWithFamilies?: boolean }) => {
                await apiMutate(`/api/notion/units/${id}`, 'PATCH', patch);
                showNotice(
                  'success',
                  patch.shareWithFamilies
                    ? 'Shared weekly Notion guide -> drafted Family Email & Social Story.'
                    : 'Saved Notion curriculum edits.'
                );
              }}
              onCreateNotionUnit={async (payload) => {
                await apiMutate('/api/notion/units', 'POST', payload);
                showNotice('success', `Added "${payload.title}" to Notion curriculum.`);
              }}
              onCreateSocialPost={async (payload) => {
                await apiMutate('/api/social/posts', 'POST', payload);
                showNotice('success', 'Social story added to Director Review queue.');
              }}
              onUpdateSocialPost={async (id, patch: Partial<SocialPost>) => {
                await apiMutate(`/api/social/posts/${id}`, 'PATCH', patch);
                showNotice('success', `Updated post status to ${patch.status}.`);
              }}
            />
          )}
        </main>
      </div>

      {/* Family Relationship Slide-Over */}
      <FamilyDrawer
        family={selectedFamily}
        onClose={() => setSelectedFamilyId(null)}
        onUpdateFamily={async (familyId, patch) => {
          await apiMutate(`/api/families/${familyId}`, 'PATCH', patch);
          showNotice('success', 'Updated family relationship profile.');
        }}
        onOpenWarmComposer={(fam) => {
          setSelectedFamilyId(null);
          setActiveSection('comms-drive');
          showNotice('success', `Opened communicator ready for ${fam.familyName}.`);
        }}
      />

      {/* 8-Platform Connector Settings Modal */}
      <ConnectorSettingsModal
        open={connectorsOpen}
        integrations={state.integrations}
        googleUserEmail={googleUser?.email || null}
        onGoogleSignIn={handleGoogleLogin}
        onGoogleSignOut={handleGoogleLogout}
        onUpdateConnector={async (id, patch: Partial<IntegrationConnector>) => {
          await apiMutate(`/api/integrations/${id}`, 'PATCH', patch);
          showNotice('success', 'Saved connector configuration & verified sync.');
        }}
        onClose={() => setConnectorsOpen(false)}
      />

      {/* New Family Modal */}
      <NewFamilyModal
        open={newFamilyOpen}
        onClose={() => setNewFamilyOpen(false)}
        onCreateFamily={async (payload) => {
          await apiMutate('/api/families', 'POST', payload);
          showNotice(
            'success',
            `Added ${payload.familyName} and queued a personal welcome draft.`
          );
        }}
      />

      {/* Mandatory Confirmation Dialog for Mutating Workspace Actions */}
      <ConfirmActionModal
        open={Boolean(pendingConfirm)}
        title={pendingConfirm?.title || ''}
        description={pendingConfirm?.description || ''}
        details={pendingConfirm?.details}
        confirmLabel={pendingConfirm?.confirmLabel}
        busy={confirmBusy}
        onConfirm={handleConfirmExecute}
        onCancel={() => setPendingConfirm(null)}
      />
    </div>
  );
}
