export type JourneyStage =
  | 'Wix Inquiry'
  | 'Calendly Tour'
  | 'Drive Packet'
  | 'QuickBooks Tuition'
  | 'Classroom Placement'
  | 'Ongoing Care';

export type NavSection =
  | 'overview'
  | 'website-scheduling'
  | 'comms-drive'
  | 'classroom-billing'
  | 'curriculum-social';

export interface FamilyChecklistItem {
  id: string;
  label: string;
  completed: boolean;
  driveFileName?: string;
  updatedAt?: string;
}

export interface FamilyTouchpoint {
  id: string;
  date: string;
  channel: 'Email' | 'Calendly' | 'Wix' | 'Drive' | 'Classroom' | 'QuickBooks' | 'Note';
  summary: string;
  author: string;
}

export interface FamilyJourney {
  id: string;
  familyName: string;
  parentNames: string;
  email: string;
  phone: string;
  childName: string;
  childAge: string;
  program: string;
  stage: JourneyStage;
  warmthNote: string;
  preferredContact: string;
  assignedGuide: string;
  driveFolderUrl: string;
  classroomCohort: string;
  tuitionStatus: 'Paid' | 'Invoice Sent' | 'Scheduled' | 'Needs Gentle Follow-up';
  nextStepLabel: string;
  lastTouchAt: string;
  checklist: FamilyChecklistItem[];
  touchpoints: FamilyTouchpoint[];
}

export interface WixPage {
  id: string;
  path: string;
  title: string;
  headline: string;
  subheadline: string;
  status: 'Published' | 'Draft Update';
  lastSyncedAt: string;
  monthlyVisits: number;
}

export interface WixLead {
  id: string;
  submittedAt: string;
  parentName: string;
  email: string;
  childName: string;
  childAge: string;
  programInterest: string;
  personalStory: string;
  status: 'New Inquiry' | 'Welcomed' | 'Converted';
}

export interface CalendlyBookingType {
  id: string;
  name: string;
  durationMinutes: number;
  location: string;
  description: string;
  bookingUrl: string;
  active: boolean;
}

export interface CalendlyEvent {
  id: string;
  familyId?: string;
  familyName: string;
  parentEmail: string;
  eventType: string;
  scheduledFor: string;
  durationMinutes: number;
  hostName: string;
  status: 'Upcoming' | 'Completed' | 'Rescheduled';
  prepNote: string;
}

export interface WarmEmailDraft {
  id: string;
  familyId?: string;
  recipientName: string;
  recipientEmail: string;
  subject: string;
  body: string;
  triggerSource: string;
  toneTag: string;
  status: 'Pending Review' | 'Approved & Sent';
  createdAt: string;
  sentAt?: string;
}

export interface ClassroomCohort {
  id: string;
  name: string;
  ageGroup: string;
  leadEducator: string;
  enrolledCount: number;
  capacity: number;
  guardianLinkRate: string;
  nextGathering: string;
  recentAnnouncement: string;
}

export interface QuickBooksInvoice {
  id: string;
  invoiceNumber: string;
  familyId?: string;
  familyName: string;
  parentEmail: string;
  program: string;
  billingPeriod: string;
  amountCents: number;
  dueDate: string;
  status: 'Paid' | 'Sent' | 'Scheduled' | 'Needs Gentle Follow-up';
  paidAt?: string;
  gentleNoteSent?: boolean;
}

export interface NotionCurriculumUnit {
  id: string;
  title: string;
  cohort: string;
  seasonWeek: string;
  themeSummary: string;
  familyPrompt: string;
  teacherPrep: string;
  status: 'Active Week' | 'Ready to Share' | 'In Planning';
  sharedWithFamilies: boolean;
  lastEditedAt: string;
}

export interface SocialPost {
  id: string;
  platform: 'Instagram' | 'Facebook' | 'Both';
  title: string;
  caption: string;
  imageUrl: string;
  scheduledFor: string;
  status: 'Needs Review' | 'Scheduled' | 'Published';
  relatedUnit?: string;
}

export interface AutomationWorkflow {
  id: string;
  name: string;
  triggerTool: string;
  triggerEvent: string;
  actionSummary: string;
  targetTools: string[];
  mode: 'Human Review Queue' | 'Instant Send';
  enabled: boolean;
  runsCount: number;
  lastRunAt: string;
}

export interface IntegrationConnector {
  id: string;
  name: string;
  category: string;
  status: 'Connected' | 'Needs Sign-In' | 'Ready to Configure';
  accountLabel: string;
  endpointHint: string;
  lastSyncAt: string;
  configFields: Record<string, string>;
}

export interface ActivityLogEntry {
  id: string;
  timestamp: string;
  tool: string;
  description: string;
  familyName?: string;
}

export interface LoveSchoolState {
  families: FamilyJourney[];
  wixPages: WixPage[];
  wixLeads: WixLead[];
  calendlyBookingTypes: CalendlyBookingType[];
  calendlyEvents: CalendlyEvent[];
  emailDrafts: WarmEmailDraft[];
  classroomCohorts: ClassroomCohort[];
  invoices: QuickBooksInvoice[];
  notionUnits: NotionCurriculumUnit[];
  socialPosts: SocialPost[];
  automations: AutomationWorkflow[];
  integrations: IntegrationConnector[];
  activityLog: ActivityLogEntry[];
}

export interface GoogleGmailMessage {
  id: string;
  threadId: string;
  from: string;
  to: string;
  subject: string;
  date: string;
  snippet: string;
}

export interface GoogleDriveFile {
  id: string;
  name: string;
  mimeType: string;
  modifiedTime?: string;
  webViewLink?: string;
}

export interface GoogleClassroomCourse {
  id: string;
  name: string;
  section?: string;
  descriptionHeading?: string;
  courseState?: string;
  alternateLink?: string;
}

export interface GoogleClassroomStudent {
  userId: string;
  courseId: string;
  profile: {
    id: string;
    name: { fullName: string };
    emailAddress?: string;
  };
}

export interface GoogleClassroomAnnouncement {
  id: string;
  courseId: string;
  text: string;
  creationTime: string;
  state: string;
}
