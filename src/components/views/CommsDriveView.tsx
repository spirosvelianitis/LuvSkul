import React, { useState } from 'react';
import {
  CheckCircle2,
  ExternalLink,
  FolderPlus,
  HardDrive,
  Mail,
  RefreshCw,
  Search,
  Send,
} from 'lucide-react';
import type {
  FamilyJourney,
  GoogleDriveFile,
  GoogleGmailMessage,
  LoveSchoolState,
} from '../../types';
import { GoogleSignInButton } from '../GoogleSignInButton';

const WARM_TEMPLATES = [
  {
    id: 'tpl-welcome',
    label: 'Post-Inquiry Welcome',
    subject: 'So glad to connect — Love School',
    body: 'Dear [Parent Name],\n\nThank you for reaching out through loveschoolu.com! Hearing a little about [Child Name] brightened our morning. We would love to invite your family for an unhurried visit to our sunlit studios.\n\nWarmly,\nClara Vance\nDirector, Love School',
  },
  {
    id: 'tpl-tour',
    label: 'Post-Tour Thank You',
    subject: 'Thank you for visiting Love School today',
    body: 'Dear [Parent Name],\n\nIt was such a pleasure welcoming you and [Child Name] into our classroom this morning. I’ve set up your shared Google Drive enrollment folder whenever you feel ready for next steps—and please reply with any questions at all.\n\nWarmly,\nClara Vance',
  },
  {
    id: 'tpl-checkin',
    label: 'Mid-Term Check-In',
    subject: 'Thinking of [Child Name] this week',
    body: 'Hi [Parent Name],\n\nWe noticed [Child Name] spending such joyful, focused time at the botany table this week. Just wanted to send a quick note of gratitude for sharing your family with us!\n\nWith warmth,\nLove School Guides',
  },
];

interface CommsDriveViewProps {
  state: LoveSchoolState;
  googleConnected: boolean;
  googleUserEmail: string | null;
  gmailMessages: GoogleGmailMessage[];
  driveFiles: GoogleDriveFile[];
  loadingGoogle: boolean;
  onGoogleSignIn: () => void;
  onRefreshGmail: () => Promise<void>;
  onRefreshDrive: (query?: string) => Promise<void>;
  onRequestSendGmail: (payload: { to: string; subject: string; body: string }) => void;
  onSaveDraftToQueue: (payload: {
    recipientName: string;
    recipientEmail: string;
    subject: string;
    body: string;
  }) => Promise<void>;
  onRequestCreateDriveFolder: (folderName: string) => void;
  onSelectFamily: (family: FamilyJourney) => void;
}

export const CommsDriveView: React.FC<CommsDriveViewProps> = ({
  state,
  googleConnected,
  googleUserEmail,
  gmailMessages,
  driveFiles,
  loadingGoogle,
  onGoogleSignIn,
  onRefreshGmail,
  onRefreshDrive,
  onRequestSendGmail,
  onSaveDraftToQueue,
  onRequestCreateDriveFolder,
  onSelectFamily,
}) => {
  const [activeTab, setActiveTab] = useState<'email' | 'drive'>('email');

  // Email Composer State
  const [toEmail, setToEmail] = useState(state.families[0]?.email || '');
  const [subject, setSubject] = useState(WARM_TEMPLATES[0].subject);
  const [body, setBody] = useState(WARM_TEMPLATES[0].body);
  const [savingDraft, setSavingDraft] = useState(false);

  // Drive Search & Folder Creation State
  const [driveSearch, setDriveSearch] = useState('');
  const [newFolderName, setNewFolderName] = useState('Love School — New Family Packet');

  const applyTemplate = (tplId: string) => {
    const tpl = WARM_TEMPLATES.find((t) => t.id === tplId);
    if (!tpl) return;
    setSubject(tpl.subject);
    setBody(tpl.body);
  };

  const fillWithFamily = (fam: FamilyJourney) => {
    setToEmail(fam.email);
    setSubject(subject.replace('[Child Name]', fam.childName));
    setBody(
      body
        .replace(/\[Parent Name\]/g, fam.parentNames)
        .replace(/\[Child Name\]/g, fam.childName)
    );
  };

  const handleSaveDraft = async () => {
    if (!toEmail.trim() || !subject.trim() || !body.trim()) return;
    setSavingDraft(true);
    try {
      await onSaveDraftToQueue({
        recipientName: toEmail.trim(),
        recipientEmail: toEmail.trim(),
        subject: subject.trim(),
        body: body.trim(),
      });
    } finally {
      setSavingDraft(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#E5E7EB]">
        <div>
          <h1 className="text-2xl font-semibold text-[#14181F]">
            Family Communication &amp; Drive Vault
          </h1>
          <p className="mt-1 text-sm text-[#525C6A]">
            Send warm personal notes via Gmail and organize family enrollment packets in Google Drive.
          </p>
        </div>

        <div className="flex items-center gap-1 p-1 bg-[#EAECEF] rounded-lg self-start shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('email')}
            className={`px-3.5 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
              activeTab === 'email'
                ? 'bg-white text-[#14181F] shadow-sm'
                : 'text-[#525C6A] hover:text-[#14181F]'
            }`}
          >
            Gmail Communication
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('drive')}
            className={`px-3.5 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
              activeTab === 'drive'
                ? 'bg-white text-[#14181F] shadow-sm'
                : 'text-[#525C6A] hover:text-[#14181F]'
            }`}
          >
            Google Drive Documents
          </button>
        </div>
      </div>

      {!googleConnected && (
        <div className="bg-white border border-[#E5E7EB] rounded-lg p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-[#14181F]">
              Connect Google Workspace to sync live Gmail &amp; Google Drive
            </p>
            <p className="text-xs text-[#525C6A] mt-0.5">
              Sign in with your Love School Google account to read family threads, send emails, and create Drive enrollment folders.
            </p>
          </div>
          <GoogleSignInButton onClick={onGoogleSignIn} />
        </div>
      )}

      {activeTab === 'email' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Warm Email Composer */}
          <div className="lg:col-span-6 bg-white border border-[#E5E7EB] rounded-lg p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E5E7EB]">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#1E4D3B]" />
                <h2 className="text-base font-semibold text-[#14181F]">
                  Compose Personal Family Note
                </h2>
              </div>
              {googleUserEmail && (
                <span className="text-xs text-[#525C6A] truncate max-w-[180px]">
                  From: {googleUserEmail}
                </span>
              )}
            </div>

            <div>
              <p className="text-xs font-medium text-[#525C6A] mb-1.5">
                Relationship-Centered Templates
              </p>
              <div className="flex flex-wrap gap-1.5">
                {WARM_TEMPLATES.map((tpl) => (
                  <button
                    key={tpl.id}
                    type="button"
                    onClick={() => applyTemplate(tpl.id)}
                    className="px-2.5 py-1.5 text-xs font-medium text-[#374151] bg-[#F3F4F6] rounded-md hover:bg-[#E5E7EB] whitespace-nowrap"
                  >
                    {tpl.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs font-medium text-[#525C6A] mb-1.5">
                Personalize for Family
              </p>
              <div className="flex flex-wrap gap-1.5">
                {state.families.slice(0, 4).map((fam) => (
                  <button
                    key={fam.id}
                    type="button"
                    onClick={() => fillWithFamily(fam)}
                    className="px-2.5 py-1 text-xs text-[#1E4D3B] bg-[#ECFDF5] border border-[#A7F3D0] rounded-md hover:bg-[#D1FAE5] whitespace-nowrap"
                  >
                    {fam.familyName}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3 pt-1">
              <div>
                <label className="block text-xs font-medium text-[#525C6A] mb-1">To</label>
                <input
                  type="email"
                  value={toEmail}
                  onChange={(e) => setToEmail(e.target.value)}
                  placeholder="parent@example.org"
                  className="w-full px-3 py-2 text-sm border border-[#D1D5DB] rounded-md focus:outline-none focus:border-[#1E4D3B]"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#525C6A] mb-1">Subject</label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-[#D1D5DB] rounded-md focus:outline-none focus:border-[#1E4D3B]"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#525C6A] mb-1">Message</label>
                <textarea
                  rows={6}
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-[#D1D5DB] rounded-md focus:outline-none focus:border-[#1E4D3B]"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-end gap-2 pt-2">
              <button
                type="button"
                disabled={savingDraft}
                onClick={handleSaveDraft}
                className="px-3.5 py-2 text-xs font-medium text-[#374151] bg-white border border-[#D1D5DB] rounded-md hover:bg-[#F9FAFB] whitespace-nowrap"
              >
                {savingDraft ? 'Saving...' : 'Save to Approval Queue'}
              </button>
              <button
                type="button"
                disabled={!googleConnected || !toEmail.trim()}
                onClick={() =>
                  onRequestSendGmail({
                    to: toEmail.trim(),
                    subject: subject.trim(),
                    body: body.trim(),
                  })
                }
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-[#1E4D3B] rounded-md hover:bg-[#163B2D] disabled:opacity-50 whitespace-nowrap"
              >
                <Send className="w-3.5 h-3.5" />
                Send via Gmail
              </button>
            </div>
          </div>

          {/* Live Gmail Inbox / Sent History */}
          <div className="lg:col-span-6 bg-white border border-[#E5E7EB] rounded-lg overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-[#E5E7EB] flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold text-[#14181F]">
                  {googleConnected ? 'Live Gmail Inbox' : 'Recent Sent Family Notes'}
                </h2>
                <p className="text-xs text-[#525C6A] mt-0.5">
                  {googleConnected
                    ? 'Synced directly from your Gmail account'
                    : 'Sign in with Google above to view live Gmail threads'}
                </p>
              </div>
              {googleConnected && (
                <button
                  type="button"
                  onClick={() => onRefreshGmail()}
                  disabled={loadingGoogle}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#374151] bg-[#F8F9FA] border border-[#D1D5DB] rounded-md hover:bg-[#F3F4F6] whitespace-nowrap"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loadingGoogle ? 'animate-spin' : ''}`} />
                  Refresh
                </button>
              )}
            </div>

            <div className="divide-y divide-[#E5E7EB] flex-1 max-h-[540px] overflow-y-auto">
              {googleConnected ? (
                gmailMessages.length === 0 ? (
                  <div className="p-8 text-center text-sm text-[#525C6A]">
                    {loadingGoogle ? 'Loading Gmail threads...' : 'No recent messages found.'}
                  </div>
                ) : (
                  gmailMessages.map((msg) => (
                    <div key={msg.id} className="p-5 hover:bg-[#F9FAFB] transition-colors">
                      <div className="flex items-center justify-between gap-2 text-xs text-[#525C6A]">
                        <span className="font-medium text-[#14181F] truncate">{msg.from}</span>
                        <span className="font-mono shrink-0">{msg.date.slice(0, 16)}</span>
                      </div>
                      <p className="mt-1 text-sm font-medium text-[#14181F]">{msg.subject}</p>
                      <p className="mt-1 text-xs text-[#525C6A] line-clamp-2 leading-relaxed">
                        {msg.snippet}
                      </p>
                    </div>
                  ))
                )
              ) : (
                state.emailDrafts
                  .filter((d) => d.status === 'Approved & Sent')
                  .map((sent) => (
                    <div key={sent.id} className="p-5">
                      <div className="flex items-center justify-between text-xs text-[#525C6A]">
                        <span>To: {sent.recipientName}</span>
                        <span className="font-mono">{sent.sentAt || sent.createdAt}</span>
                      </div>
                      <p className="mt-1 text-sm font-medium text-[#14181F]">{sent.subject}</p>
                      <p className="mt-1 text-xs text-[#525C6A] line-clamp-2">{sent.body}</p>
                    </div>
                  ))
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Drive Actions & Live Browser */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-5 bg-white border border-[#E5E7EB] rounded-lg p-6 space-y-5">
              <div className="flex items-center gap-2 pb-3 border-b border-[#E5E7EB]">
                <FolderPlus className="w-4 h-4 text-[#1E4D3B]" />
                <h2 className="text-base font-semibold text-[#14181F]">
                  Create Family Folder in Google Drive
                </h2>
              </div>
              <p className="text-sm text-[#525C6A] leading-relaxed">
                Keep each family’s enrollment agreement, health record, and learning profile organized in one calm Google Drive folder.
              </p>
              <div className="space-y-3">
                <input
                  type="text"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  placeholder="Folder name in Google Drive"
                  className="w-full px-3 py-2 text-sm border border-[#D1D5DB] rounded-md focus:outline-none focus:border-[#1E4D3B]"
                />
                <button
                  type="button"
                  disabled={!googleConnected || !newFolderName.trim()}
                  onClick={() => onRequestCreateDriveFolder(newFolderName.trim())}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#1E4D3B] rounded-md hover:bg-[#163B2D] disabled:opacity-50"
                >
                  <FolderPlus className="w-4 h-4" />
                  Create Folder in Google Drive
                </button>
              </div>
            </div>

            <div className="lg:col-span-7 bg-white border border-[#E5E7EB] rounded-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-[#E5E7EB] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <HardDrive className="w-4 h-4 text-[#1E4D3B]" />
                  <h2 className="text-base font-semibold text-[#14181F]">
                    Google Drive Files
                  </h2>
                </div>
                {googleConnected && (
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 text-[#525C6A] absolute left-2.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={driveSearch}
                        onChange={(e) => setDriveSearch(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') onRefreshDrive(driveSearch);
                        }}
                        placeholder="Search Drive..."
                        className="pl-8 pr-3 py-1.5 text-xs bg-[#F8F9FA] border border-[#D1D5DB] rounded-md focus:outline-none focus:border-[#1E4D3B]"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => onRefreshDrive(driveSearch)}
                      className="px-3 py-1.5 text-xs font-medium text-[#374151] bg-[#F8F9FA] border border-[#D1D5DB] rounded-md hover:bg-[#F3F4F6]"
                    >
                      Search
                    </button>
                  </div>
                )}
              </div>

              {googleConnected ? (
                <div className="divide-y divide-[#E5E7EB] max-h-[340px] overflow-y-auto">
                  {driveFiles.length === 0 ? (
                    <div className="p-8 text-center text-sm text-[#525C6A]">
                      {loadingGoogle ? 'Loading Google Drive files...' : 'No Drive files matched your search.'}
                    </div>
                  ) : (
                    driveFiles.map((file) => (
                      <div
                        key={file.id}
                        className="px-6 py-3.5 flex items-center justify-between gap-4 hover:bg-[#F9FAFB]"
                      >
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-[#14181F] truncate">{file.name}</p>
                          <p className="text-xs text-[#525C6A] font-mono mt-0.5 truncate">
                            {file.mimeType.includes('folder') ? 'Folder' : 'Document'}
                            {file.modifiedTime ? ` · Updated ${file.modifiedTime.slice(0, 10)}` : ''}
                          </p>
                        </div>
                        {file.webViewLink && (
                          <a
                            href={file.webViewLink}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-xs font-medium text-[#1E4D3B] hover:underline shrink-0"
                          >
                            Open
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>
                    ))
                  )}
                </div>
              ) : (
                <div className="p-8 text-center text-sm text-[#525C6A]">
                  Sign in with Google Workspace above to browse live folders and files from your Drive.
                </div>
              )}
            </div>
          </div>

          {/* Family Enrollment Document Completion Tracker */}
          <div className="bg-white border border-[#E5E7EB] rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-[#E5E7EB]">
              <h2 className="text-base font-semibold text-[#14181F]">
                Family Enrollment Packet Checklist
              </h2>
              <p className="text-xs text-[#525C6A] mt-0.5">
                Click any family row to inspect or toggle individual Google Drive form completion.
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-[#E5E7EB] bg-[#F8F9FA] text-xs font-medium text-[#525C6A]">
                    <th className="py-3 px-6">Family</th>
                    <th className="py-3 px-4">Enrollment Form</th>
                    <th className="py-3 px-4">Learning Profile</th>
                    <th className="py-3 px-4">Health &amp; Emergency</th>
                    <th className="py-3 px-6">Autopay Authorization</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E7EB]">
                  {state.families.map((fam) => (
                    <tr
                      key={fam.id}
                      onClick={() => onSelectFamily(fam)}
                      className="hover:bg-[#F9FAFB] cursor-pointer"
                    >
                      <td className="py-3.5 px-6 font-medium text-[#14181F]">{fam.familyName}</td>
                      {fam.checklist.map((item) => (
                        <td key={item.id} className="py-3.5 px-4 whitespace-nowrap">
                          {item.completed ? (
                            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#15803D]">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              {item.driveFileName || 'Complete'}
                            </span>
                          ) : (
                            <span className="text-xs text-[#B45309]">Awaiting Upload</span>
                          )}
                        </td>
                      ))}
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
