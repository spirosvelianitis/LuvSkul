import React, { useState } from 'react';
import { CheckCircle2, Copy, Link2, RefreshCw, X } from 'lucide-react';
import type { IntegrationConnector } from '../types';
import { GoogleSignInButton } from './GoogleSignInButton';

interface ConnectorSettingsModalProps {
  open: boolean;
  integrations: IntegrationConnector[];
  googleUserEmail: string | null;
  onGoogleSignIn: () => void;
  onGoogleSignOut: () => void;
  onUpdateConnector: (id: string, patch: Partial<IntegrationConnector>) => Promise<void>;
  onClose: () => void;
}

export const ConnectorSettingsModal: React.FC<ConnectorSettingsModalProps> = ({
  open,
  integrations,
  googleUserEmail,
  onGoogleSignIn,
  onGoogleSignOut,
  onUpdateConnector,
  onClose,
}) => {
  const [selectedId, setSelectedId] = useState<string>('int-wix');
  const [copiedHint, setCopiedHint] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [fieldDrafts, setFieldDrafts] = useState<Record<string, string>>({});

  if (!open) return null;

  const current = integrations.find((i) => i.id === selectedId) || integrations[0];
  const isGoogle =
    current.id === 'int-gmail' || current.id === 'int-drive' || current.id === 'int-classroom';

  const handleSelect = (conn: IntegrationConnector) => {
    setSelectedId(conn.id);
    setFieldDrafts({ ...conn.configFields });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onUpdateConnector(current.id, {
        status: 'Connected',
        configFields: Object.keys(fieldDrafts).length ? fieldDrafts : current.configFields,
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCopyWebhook = (hint: string) => {
    const fullUrl = hint.startsWith('/api/')
      ? `${window.location.origin}${hint}`
      : hint;
    navigator.clipboard?.writeText(fullUrl);
    setCopiedHint(current.id);
    setTimeout(() => setCopiedHint(null), 1800);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#14181F]/40 backdrop-blur-[2px] p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Connected Platforms & Webhooks"
    >
      <div className="w-full max-w-3xl bg-white border border-[#E5E7EB] rounded-lg shadow-lg overflow-hidden flex flex-col max-h-[85vh]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E7EB]">
          <div>
            <h2 className="text-lg font-semibold text-[#14181F]">
              Connected Platforms & Sync Settings
            </h2>
            <p className="text-xs text-[#525C6A] mt-0.5">
              All 8 tools unified for loveschoolu.com
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close connector settings"
            className="p-1.5 rounded-md text-[#525C6A] hover:text-[#14181F] hover:bg-[#F3F4F6]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 grid grid-cols-1 md:grid-cols-12 overflow-hidden">
          {/* Left Connector List */}
          <div className="md:col-span-5 border-b md:border-b-0 md:border-r border-[#E5E7EB] overflow-y-auto divide-y divide-[#F3F4F6]">
            {integrations.map((conn) => {
              const isGoogleConn =
                conn.id === 'int-gmail' ||
                conn.id === 'int-drive' ||
                conn.id === 'int-classroom';
              const effectiveConnected = isGoogleConn
                ? Boolean(googleUserEmail)
                : conn.status === 'Connected';

              return (
                <button
                  key={conn.id}
                  type="button"
                  onClick={() => handleSelect(conn)}
                  className={`w-full text-left px-5 py-3.5 transition-colors ${
                    current.id === conn.id ? 'bg-[#F3F4F6]' : 'hover:bg-[#F9FAFB]'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-medium text-[#14181F]">{conn.name}</span>
                    <span
                      className={`text-xs font-medium ${
                        effectiveConnected ? 'text-[#15803D]' : 'text-[#B45309]'
                      }`}
                    >
                      {effectiveConnected ? 'Connected' : 'Sign-In Needed'}
                    </span>
                  </div>
                  <p className="text-xs text-[#525C6A] mt-0.5 truncate">{conn.category}</p>
                </button>
              );
            })}
          </div>

          {/* Right Configuration Panel */}
          <div className="md:col-span-7 p-6 overflow-y-auto">
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-[#E5E7EB]">
              <div>
                <h3 className="text-base font-semibold text-[#14181F]">{current.name}</h3>
                <p className="text-xs text-[#525C6A] mt-0.5">
                  {isGoogle && googleUserEmail ? googleUserEmail : current.accountLabel}
                </p>
              </div>
              <span className="text-xs font-mono text-[#525C6A] shrink-0">
                {current.lastSyncAt}
              </span>
            </div>

            {isGoogle ? (
              <div className="mt-5 space-y-4">
                <p className="text-sm text-[#525C6A] leading-relaxed">
                  Gmail, Google Drive, and Google Classroom share a single verified Google Workspace session. Sign in below to load live inbox messages, Drive folders, and Classroom courses.
                </p>
                {googleUserEmail ? (
                  <div className="flex items-center justify-between gap-4 p-4 bg-[#F8F9FA] border border-[#E5E7EB] rounded-md">
                    <div className="flex items-center gap-2.5 text-sm text-[#14181F]">
                      <CheckCircle2 className="w-4 h-4 text-[#15803D] shrink-0" />
                      <span>Signed in as {googleUserEmail}</span>
                    </div>
                    <button
                      type="button"
                      onClick={onGoogleSignOut}
                      className="px-3 py-1.5 text-xs font-medium text-[#525C6A] bg-white border border-[#D1D5DB] rounded-md hover:bg-[#F9FAFB] whitespace-nowrap"
                    >
                      Sign Out
                    </button>
                  </div>
                ) : (
                  <GoogleSignInButton onClick={onGoogleSignIn} />
                )}
              </div>
            ) : (
              <form onSubmit={handleSave} className="mt-5 space-y-4">
                <div>
                  <p className="text-xs font-medium text-[#525C6A] mb-1.5">
                    Live Webhook / API Endpoint
                  </p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 flex items-center gap-2 px-3 py-2 text-xs font-mono text-[#14181F] bg-[#F8F9FA] border border-[#E5E7EB] rounded-md truncate">
                      <Link2 className="w-3.5 h-3.5 text-[#525C6A] shrink-0" />
                      <span className="truncate">
                        {current.endpointHint.startsWith('/api/')
                          ? `${window.location.origin}${current.endpointHint}`
                          : current.endpointHint}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopyWebhook(current.endpointHint)}
                      className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-[#374151] bg-white border border-[#D1D5DB] rounded-md hover:bg-[#F9FAFB] whitespace-nowrap shrink-0"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      {copiedHint === current.id ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                </div>

                {Object.entries(current.configFields).map(([key, defaultVal]) => (
                  <div key={key}>
                    <label className="block text-xs font-medium text-[#525C6A] mb-1">
                      {key.replace(/([A-Z])/g, ' $1').replace(/^./, (c) => c.toUpperCase())}
                    </label>
                    <input
                      type="text"
                      value={fieldDrafts[key] ?? defaultVal}
                      onChange={(e) =>
                        setFieldDrafts((prev) => ({ ...prev, [key]: e.target.value }))
                      }
                      className="w-full px-3 py-2 text-sm text-[#14181F] bg-white border border-[#D1D5DB] rounded-md focus:outline-none focus:border-[#1E4D3B]"
                    />
                  </div>
                ))}

                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#1E4D3B] rounded-md hover:bg-[#163B2D] disabled:opacity-60 transition-colors whitespace-nowrap"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    {saving ? 'Syncing...' : 'Save & Verify Sync'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
