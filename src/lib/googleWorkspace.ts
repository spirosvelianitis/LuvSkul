import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';
import type {
  GoogleClassroomAnnouncement,
  GoogleClassroomCourse,
  GoogleClassroomStudent,
  GoogleDriveFile,
  GoogleGmailMessage,
} from '../types';

export const SCOPES = [
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/gmail.send',
  'https://www.googleapis.com/auth/drive.file',
  'https://www.googleapis.com/auth/drive.metadata.readonly',
  'https://www.googleapis.com/auth/classroom.courses.readonly',
  'https://www.googleapis.com/auth/classroom.rosters.readonly',
  'https://www.googleapis.com/auth/classroom.announcements',
  'https://www.googleapis.com/auth/classroom.courseworkmaterials.readonly',
];

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);

const provider = new GoogleAuthProvider();
for (const scope of SCOPES) {
  provider.addScope(scope);
}

// In-memory access token cache (never persisted to localStorage or sessionStorage)
let isSigningIn = false;
let cachedAccessToken: string | null = null;

export const initAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, (user: User | null) => {
    if (user) {
      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else if (!isSigningIn) {
        cachedAccessToken = null;
        if (onAuthFailure) onAuthFailure();
      }
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

export const googleSignIn = async (): Promise<{ user: User; accessToken: string } | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Failed to obtain Google Workspace access token.');
    }
    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } finally {
    isSigningIn = false;
  }
};

export const getAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};

export const logoutGoogle = async () => {
  await auth.signOut();
  cachedAccessToken = null;
};

// ---------------- Gmail API ----------------

export async function listGmailMessages(accessToken: string, maxResults = 12): Promise<GoogleGmailMessage[]> {
  const listRes = await fetch(
    `https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=${maxResults}`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );
  if (!listRes.ok) {
    throw new Error(`Gmail API error (${listRes.status})`);
  }
  const listData = await listRes.json();
  const messages: { id: string; threadId: string }[] = listData.messages || [];

  const details = await Promise.all(
    messages.slice(0, 10).map(async (m) => {
      const detailRes = await fetch(
        `https://gmail.googleapis.com/gmail/v1/users/me/messages/${m.id}?format=metadata&metadataHeaders=From&metadataHeaders=To&metadataHeaders=Subject&metadataHeaders=Date`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      if (!detailRes.ok) return null;
      const d = await detailRes.json();
      const headers: { name: string; value: string }[] = d.payload?.headers || [];
      const findHeader = (name: string) =>
        headers.find((h) => h.name.toLowerCase() === name.toLowerCase())?.value || '';

      return {
        id: d.id,
        threadId: d.threadId,
        from: findHeader('From') || 'Unknown sender',
        to: findHeader('To') || '',
        subject: findHeader('Subject') || '(No subject)',
        date: findHeader('Date') || '',
        snippet: d.snippet || '',
      } as GoogleGmailMessage;
    })
  );

  return details.filter((item): item is GoogleGmailMessage => item !== null);
}

function encodeBase64Url(input: string): string {
  const bytes = new TextEncoder().encode(input);
  let binary = '';
  for (let i = 0; i < bytes.length; i += 1) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export async function sendGmailMessage(
  accessToken: string,
  params: { to: string; subject: string; body: string }
): Promise<{ id: string }> {
  const rawEmail = [
    `To: ${params.to}`,
    `Subject: ${params.subject}`,
    'Content-Type: text/plain; charset="UTF-8"',
    'MIME-Version: 1.0',
    '',
    params.body,
  ].join('\r\n');

  const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ raw: encodeBase64Url(rawEmail) }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Failed to send email via Gmail (${res.status}): ${errText}`);
  }
  return res.json();
}

// ---------------- Google Drive API ----------------

export async function listDriveFiles(accessToken: string, queryText = ''): Promise<GoogleDriveFile[]> {
  const qParts = ['trashed = false'];
  if (queryText.trim()) {
    const safe = queryText.replace(/'/g, "\\'");
    qParts.push(`name contains '${safe}'`);
  }
  const url = `https://www.googleapis.com/drive/v3/files?pageSize=20&fields=files(id,name,mimeType,modifiedTime,webViewLink)&q=${encodeURIComponent(
    qParts.join(' and ')
  )}`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) {
    throw new Error(`Google Drive API error (${res.status})`);
  }
  const data = await res.json();
  return data.files || [];
}

export async function createDriveFolder(
  accessToken: string,
  folderName: string
): Promise<GoogleDriveFile> {
  const res = await fetch(
    'https://www.googleapis.com/drive/v3/files?fields=id,name,mimeType,modifiedTime,webViewLink',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: folderName,
        mimeType: 'application/vnd.google-apps.folder',
      }),
    }
  );
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Failed to create Drive folder (${res.status}): ${errText}`);
  }
  return res.json();
}

// ---------------- Google Classroom API ----------------

export async function listClassroomCourses(accessToken: string): Promise<GoogleClassroomCourse[]> {
  const res = await fetch('https://classroom.googleapis.com/v1/courses?courseStates=ACTIVE', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) {
    throw new Error(`Google Classroom API error (${res.status})`);
  }
  const data = await res.json();
  return data.courses || [];
}

export async function listClassroomStudents(
  accessToken: string,
  courseId: string
): Promise<GoogleClassroomStudent[]> {
  const res = await fetch(`https://classroom.googleapis.com/v1/courses/${courseId}/students`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) {
    return [];
  }
  const data = await res.json();
  return data.students || [];
}

export async function listClassroomAnnouncements(
  accessToken: string,
  courseId: string
): Promise<GoogleClassroomAnnouncement[]> {
  const res = await fetch(`https://classroom.googleapis.com/v1/courses/${courseId}/announcements?pageSize=5`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) {
    return [];
  }
  const data = await res.json();
  return data.announcements || [];
}

export async function createClassroomAnnouncement(
  accessToken: string,
  courseId: string,
  text: string
): Promise<GoogleClassroomAnnouncement> {
  const res = await fetch(`https://classroom.googleapis.com/v1/courses/${courseId}/announcements`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ text, state: 'PUBLISHED' }),
  });
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Failed to post announcement (${res.status}): ${errText}`);
  }
  return res.json();
}
