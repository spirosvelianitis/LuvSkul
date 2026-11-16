import express from 'express';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const PORT = Number(process.env.PORT || 3000);
const DATA_DIR = path.resolve(process.cwd(), '.data');
const DB_FILE = path.join(DATA_DIR, 'loveschool-db.json');

function createSeedState() {
  return {
    families: [
      {
        id: 'fam-1',
        familyName: 'Morales Family',
        parentNames: 'Elena & Mateo Morales',
        email: 'elena.morales@example.org',
        phone: '(512) 555-0148',
        childName: 'Lucia Morales',
        childAge: '6 years',
        program: 'Lower Elementary Explorers',
        stage: 'Classroom Placement',
        warmthNote: 'Lucia lights up around botanical sketching and outdoor storytelling. Mateo works remotely on Fridays and loves joining morning circle.',
        preferredContact: 'Warm email summary on Thursday afternoons',
        assignedGuide: 'Clara Vance (Director)',
        driveFolderUrl: 'https://drive.google.com',
        classroomCohort: 'Lower Elementary Explorers (Fall)',
        tuitionStatus: 'Paid',
        nextStepLabel: 'Send Week 1 welcome reflection',
        lastTouchAt: '2026-11-16T09:20:00Z',
        checklist: [
          { id: 'c1', label: 'Enrollment Agreement Signed', completed: true, driveFileName: 'Morales_Enrollment_2026.pdf', updatedAt: 'Nov 10' },
          { id: 'c2', label: 'Child Learning & Care Profile', completed: true, driveFileName: 'Lucia_Learning_Profile.docx', updatedAt: 'Nov 11' },
          { id: 'c3', label: 'Immunization & Emergency Card', completed: true, driveFileName: 'Morales_Health_Form.pdf', updatedAt: 'Nov 12' },
          { id: 'c4', label: 'Tuition Autopay Confirmed', completed: true, driveFileName: 'QuickBooks_Receipt_102.pdf', updatedAt: 'Nov 13' },
        ],
        touchpoints: [
          { id: 't1', date: 'Nov 16, 9:20 AM', channel: 'Classroom', summary: 'Added Elena & Mateo as guardians in Lower Elementary Explorers.', author: 'Clara Vance' },
          { id: 't2', date: 'Nov 13, 2:10 PM', channel: 'QuickBooks', summary: 'November tuition invoice (#INV-2026-102) paid in full ($1,450.00).', author: 'System Sync' },
          { id: 't3', date: 'Nov 10, 11:00 AM', channel: 'Drive', summary: 'Created shared Morales Family Enrollment Folder in Google Drive.', author: 'Clara Vance' },
        ],
      },
      {
        id: 'fam-2',
        familyName: 'Chen-Patel Family',
        parentNames: 'Maya Chen & Dev Patel',
        email: 'maya.chen@example.org',
        phone: '(512) 555-0193',
        childName: 'Arjun Patel',
        childAge: '4.5 years',
        program: 'Early Childhood Wonder',
        stage: 'Drive Packet',
        warmthNote: 'Arjun is gentle and observant; he asked three thoughtful questions about the classroom fern during their campus visit.',
        preferredContact: 'Personal phone call or brief email',
        assignedGuide: 'Hannah Brooks (Lead Guide)',
        driveFolderUrl: 'https://drive.google.com',
        classroomCohort: 'Early Childhood Wonder (Fall)',
        tuitionStatus: 'Invoice Sent',
        nextStepLabel: 'Follow up gently on Health Form',
        lastTouchAt: '2026-11-15T16:40:00Z',
        checklist: [
          { id: 'c1', label: 'Enrollment Agreement Signed', completed: true, driveFileName: 'ChenPatel_Enrollment_2026.pdf', updatedAt: 'Nov 14' },
          { id: 'c2', label: 'Child Learning & Care Profile', completed: true, driveFileName: 'Arjun_Care_Notes.docx', updatedAt: 'Nov 15' },
          { id: 'c3', label: 'Immunization & Emergency Card', completed: false },
          { id: 'c4', label: 'Tuition Autopay Confirmed', completed: false },
        ],
        touchpoints: [
          { id: 't4', date: 'Nov 15, 4:40 PM', channel: 'Email', summary: 'Sent personalized post-tour reflection & Drive folder link.', author: 'Clara Vance' },
          { id: 't5', date: 'Nov 14, 10:30 AM', channel: 'Calendly', summary: 'Completed 45-minute Campus Visit & Family Tour.', author: 'Hannah Brooks' },
        ],
      },
      {
        id: 'fam-3',
        familyName: 'Okafor Family',
        parentNames: 'Nadia Okafor',
        email: 'nadia.okafor@example.org',
        phone: '(512) 555-0174',
        childName: 'Zion Okafor',
        childAge: '8 years',
        program: 'Upper Studio Makers',
        stage: 'QuickBooks Tuition',
        warmthNote: 'Zion builds intricate cardboard bridges at home. Nadia is transferring mid-semester and appreciates transparent weekly communication.',
        preferredContact: 'Email in the morning',
        assignedGuide: 'Clara Vance (Director)',
        driveFolderUrl: 'https://drive.google.com',
        classroomCohort: 'Upper Studio Makers (Fall)',
        tuitionStatus: 'Needs Gentle Follow-up',
        nextStepLabel: 'Send warm tuition check-in note',
        lastTouchAt: '2026-11-14T13:15:00Z',
        checklist: [
          { id: 'c1', label: 'Enrollment Agreement Signed', completed: true, driveFileName: 'Okafor_Enrollment.pdf', updatedAt: 'Nov 8' },
          { id: 'c2', label: 'Child Learning & Care Profile', completed: true, driveFileName: 'Zion_Profile.docx', updatedAt: 'Nov 9' },
          { id: 'c3', label: 'Immunization & Emergency Card', completed: true, driveFileName: 'Okafor_Medical.pdf', updatedAt: 'Nov 10' },
          { id: 'c4', label: 'Tuition Autopay Confirmed', completed: false },
        ],
        touchpoints: [
          { id: 't6', date: 'Nov 14, 1:15 PM', channel: 'QuickBooks', summary: 'Invoice #INV-2026-105 due in 2 days — queued gentle check-in.', author: 'System Sync' },
        ],
      },
      {
        id: 'fam-4',
        familyName: 'Lindqvist Family',
        parentNames: 'Freja & Jonas Lindqvist',
        email: 'freja.lindqvist@example.org',
        phone: '(512) 555-0112',
        childName: 'Soren Lindqvist',
        childAge: '5 years',
        program: 'Early Childhood Wonder',
        stage: 'Calendly Tour',
        warmthNote: 'Discovered loveschoolu.com via Instagram reading corner post. Excited about slow-paced outdoor mornings.',
        preferredContact: 'Email',
        assignedGuide: 'Clara Vance (Director)',
        driveFolderUrl: '',
        classroomCohort: 'Early Childhood Wonder (Fall)',
        tuitionStatus: 'Scheduled',
        nextStepLabel: 'Prepare campus welcome tea for Nov 18 tour',
        lastTouchAt: '2026-11-16T08:05:00Z',
        checklist: [
          { id: 'c1', label: 'Enrollment Agreement Signed', completed: false },
          { id: 'c2', label: 'Child Learning & Care Profile', completed: false },
          { id: 'c3', label: 'Immunization & Emergency Card', completed: false },
          { id: 'c4', label: 'Tuition Autopay Confirmed', completed: false },
        ],
        touchpoints: [
          { id: 't7', date: 'Nov 16, 8:05 AM', channel: 'Calendly', summary: 'Booked Campus Visit & Family Tour for Nov 18 at 10:00 AM.', author: 'Freja Lindqvist' },
          { id: 't8', date: 'Nov 15, 7:30 PM', channel: 'Wix', summary: 'Submitted Admissions Inquiry via loveschoolu.com.', author: 'Freja Lindqvist' },
        ],
      },
      {
        id: 'fam-5',
        familyName: 'Alvarez-Kim Family',
        parentNames: 'Sofia Alvarez & Min-Jun Kim',
        email: 'sofia.alvarez@example.org',
        phone: '(512) 555-0166',
        childName: 'Mina Kim',
        childAge: '7 years',
        program: 'Lower Elementary Explorers',
        stage: 'Ongoing Care',
        warmthNote: 'Enrolled since September. Sofia leads our parent garden morning once a month.',
        preferredContact: 'Weekly Notion family digest',
        assignedGuide: 'Hannah Brooks (Lead Guide)',
        driveFolderUrl: 'https://drive.google.com',
        classroomCohort: 'Lower Elementary Explorers (Fall)',
        tuitionStatus: 'Paid',
        nextStepLabel: 'Share Autumn Leaf Study guide',
        lastTouchAt: '2026-11-15T11:30:00Z',
        checklist: [
          { id: 'c1', label: 'Enrollment Agreement Signed', completed: true, driveFileName: 'AlvarezKim_Enrollment.pdf', updatedAt: 'Aug 22' },
          { id: 'c2', label: 'Child Learning & Care Profile', completed: true, driveFileName: 'Mina_Profile.docx', updatedAt: 'Aug 24' },
          { id: 'c3', label: 'Immunization & Emergency Card', completed: true, driveFileName: 'Mina_Health.pdf', updatedAt: 'Aug 25' },
          { id: 'c4', label: 'Tuition Autopay Confirmed', completed: true, driveFileName: 'QuickBooks_Autopay.pdf', updatedAt: 'Aug 28' },
        ],
        touchpoints: [
          { id: 't9', date: 'Nov 15, 11:30 AM', channel: 'Classroom', summary: 'Shared botanical sketchbook reflection with family.', author: 'Hannah Brooks' },
        ],
      },
    ],
    wixPages: [
      {
        id: 'wp-1',
        path: '/',
        title: 'Home — Love School (loveschoolu.com)',
        headline: 'A warm, relationship-centered learning community where every child is deeply known.',
        subheadline: 'Small mixed-age studios, unhurried outdoor inquiry, and personal partnerships with families.',
        status: 'Published',
        lastSyncedAt: 'Nov 16, 10:15 AM',
        monthlyVisits: 1840,
      },
      {
        id: 'wp-2',
        path: '/admissions',
        title: 'Admissions & Family Tours',
        headline: 'Begin with a unhurried conversation and a walk through our sunlit studios.',
        subheadline: 'Spring & Fall 2026 family visits open via Calendly.',
        status: 'Published',
        lastSyncedAt: 'Nov 15, 3:40 PM',
        monthlyVisits: 620,
      },
      {
        id: 'wp-3',
        path: '/curriculum',
        title: 'Living Curriculum & Guides',
        headline: 'Seasonal studies rooted in nature, craft, literacy, and joyful curiosity.',
        subheadline: 'Weekly home connection guides synced directly from our educators’ Notion studio.',
        status: 'Published',
        lastSyncedAt: 'Nov 14, 1:10 PM',
        monthlyVisits: 490,
      },
      {
        id: 'wp-4',
        path: '/tuition',
        title: 'Tuition & Family Stewardship',
        headline: 'Transparent monthly stewardship with flexible family plans.',
        subheadline: 'Simple, human-friendly billing powered by QuickBooks.',
        status: 'Published',
        lastSyncedAt: 'Nov 12, 9:00 AM',
        monthlyVisits: 315,
      },
    ],
    wixLeads: [
      {
        id: 'wl-1',
        submittedAt: 'Nov 16, 11:42 AM',
        parentName: 'Rachel & Thomas Bennett',
        email: 'rachel.bennett@example.org',
        childName: 'Oliver Bennett',
        childAge: '5.5 years',
        programInterest: 'Lower Elementary Explorers',
        personalStory: 'We moved to the neighborhood last month and are looking for a gentle, warm school where Oliver can build confidence and spend time outdoors.',
        status: 'New Inquiry',
      },
      {
        id: 'wl-2',
        submittedAt: 'Nov 16, 8:15 AM',
        parentName: 'Samira Haddad',
        email: 'samira.haddad@example.org',
        childName: 'Layla Haddad',
        childAge: '4 years',
        programInterest: 'Early Childhood Wonder',
        personalStory: 'Layla adores storytelling and painting. We would love to schedule a morning visit to meet the teachers.',
        status: 'New Inquiry',
      },
      {
        id: 'wl-3',
        submittedAt: 'Nov 15, 7:30 PM',
        parentName: 'Freja & Jonas Lindqvist',
        email: 'freja.lindqvist@example.org',
        childName: 'Soren Lindqvist',
        childAge: '5 years',
        programInterest: 'Early Childhood Wonder',
        personalStory: 'Saw your cozy reading corner photo on Instagram and felt right at home.',
        status: 'Converted',
      },
    ],
    calendlyBookingTypes: [
      {
        id: 'cb-1',
        name: 'Warm Discovery Call',
        durationMinutes: 25,
        location: 'Phone or Google Meet',
        description: 'An unhurried first conversation with Director Clara Vance to hear about your child and share our philosophy.',
        bookingUrl: 'https://calendly.com/loveschoolu/discovery-call',
        active: true,
      },
      {
        id: 'cb-2',
        name: 'Campus Visit & Family Tour',
        durationMinutes: 45,
        location: 'Love School Studio Campus',
        description: 'Walk through our classrooms during morning work time, meet lead guides, and linger over herbal tea.',
        bookingUrl: 'https://calendly.com/loveschoolu/campus-tour',
        active: true,
      },
      {
        id: 'cb-3',
        name: 'Mid-Term Family Heart-to-Heart',
        durationMinutes: 30,
        location: 'Studio Library or Google Meet',
        description: 'Reflective check-in celebrating your child’s growth, social friendships, and upcoming home projects.',
        bookingUrl: 'https://calendly.com/loveschoolu/family-checkin',
        active: true,
      },
    ],
    calendlyEvents: [
      {
        id: 'ce-1',
        familyId: 'fam-4',
        familyName: 'Lindqvist Family (Freja & Soren)',
        parentEmail: 'freja.lindqvist@example.org',
        eventType: 'Campus Visit & Family Tour',
        scheduledFor: 'Nov 18, 2026 · 10:00 AM',
        durationMinutes: 45,
        hostName: 'Clara Vance',
        status: 'Upcoming',
        prepNote: 'Prepare early childhood sample portfolio & chamomile tea.',
      },
      {
        id: 'ce-2',
        familyId: 'fam-1',
        familyName: 'Morales Family (Elena & Mateo)',
        parentEmail: 'elena.morales@example.org',
        eventType: 'Mid-Term Family Heart-to-Heart',
        scheduledFor: 'Nov 20, 2026 · 2:30 PM',
        durationMinutes: 30,
        hostName: 'Hannah Brooks',
        status: 'Upcoming',
        prepNote: 'Bring Lucia’s autumn leaf watercolor journal to celebrate her focus.',
      },
      {
        id: 'ce-3',
        familyId: 'fam-2',
        familyName: 'Chen-Patel Family (Maya & Arjun)',
        parentEmail: 'maya.chen@example.org',
        eventType: 'Campus Visit & Family Tour',
        scheduledFor: 'Nov 14, 2026 · 10:30 AM',
        durationMinutes: 45,
        hostName: 'Hannah Brooks',
        status: 'Completed',
        prepNote: 'Arjun loved the classroom ferns; sent Drive folder right after.',
      },
    ],
    emailDrafts: [
      {
        id: 'ed-1',
        familyId: 'fam-2',
        recipientName: 'Maya Chen & Dev Patel',
        recipientEmail: 'maya.chen@example.org',
        subject: 'Checking in with warmth — Arjun’s enrollment folder',
        body: 'Dear Maya and Dev,\n\nIt was such a joy watching Arjun examine our classroom ferns on Thursday! Whenever you have a quiet moment this week, feel free to drop his immunization card into your shared Love School Drive folder—no rush at all, and please reply if I can help with anything.\n\nWarmly,\nClara Vance\nDirector, Love School',
        triggerSource: 'Drive Packet Reminder (Human Review)',
        toneTag: 'Post-Tour Warmth',
        status: 'Pending Review',
        createdAt: 'Nov 16, 10:05 AM',
      },
      {
        id: 'ed-2',
        familyId: 'fam-3',
        recipientName: 'Nadia Okafor',
        recipientEmail: 'nadia.okafor@example.org',
        subject: 'A quick note on Zion’s November tuition & studio welcome',
        body: 'Hi Nadia,\n\nWe are so excited to have Zion joining Upper Studio Makers! Our QuickBooks system noted that invoice #INV-2026-105 is approaching its due date. Please let me know if you’d like to adjust the billing schedule or split payments—we are always happy to make things easy for your family.\n\nWith gratitude,\nClara Vance\nLove School',
        triggerSource: 'QuickBooks Gentle Check-In',
        toneTag: 'Supportive Billing',
        status: 'Pending Review',
        createdAt: 'Nov 16, 9:40 AM',
      },
      {
        id: 'ed-3',
        familyId: 'fam-1',
        recipientName: 'Elena & Mateo Morales',
        recipientEmail: 'elena.morales@example.org',
        subject: 'Welcome to Lower Elementary Explorers, Lucia!',
        body: 'Dear Elena and Mateo,\n\nLucia’s Google Classroom seat and family guardian link are all ready for Monday morning! We cannot wait to welcome her to our morning circle.\n\nWarmly,\nClara Vance',
        triggerSource: 'QuickBooks Paid -> Classroom Sync',
        toneTag: 'Enrollment Milestone',
        status: 'Approved & Sent',
        createdAt: 'Nov 13, 2:15 PM',
        sentAt: 'Nov 13, 2:30 PM',
      },
    ],
    classroomCohorts: [
      {
        id: 'cc-1',
        name: 'Early Childhood Wonder (Ages 3.5–5)',
        ageGroup: 'Ages 3.5–5',
        leadEducator: 'Hannah Brooks',
        enrolledCount: 14,
        capacity: 16,
        guardianLinkRate: '100% Guardians Linked',
        nextGathering: 'Thu, Nov 19 · Seasonal Soup & Story Morning',
        recentAnnouncement: 'This week we are pressing autumn leaves and listening to woodland folktales by the window.',
      },
      {
        id: 'cc-2',
        name: 'Lower Elementary Explorers (Ages 6–7)',
        ageGroup: 'Ages 6–7',
        leadEducator: 'Clara Vance',
        enrolledCount: 16,
        capacity: 18,
        guardianLinkRate: '94% Guardians Linked',
        nextGathering: 'Fri, Nov 20 · Botanical Sketchbook Sharing',
        recentAnnouncement: 'Families are invited at 11:15 AM Friday to admire the children’s watercolor leaf journals.',
      },
      {
        id: 'cc-3',
        name: 'Upper Studio Makers (Ages 8–10)',
        ageGroup: 'Ages 8–10',
        leadEducator: 'David Thorne',
        enrolledCount: 12,
        capacity: 15,
        guardianLinkRate: '100% Guardians Linked',
        nextGathering: 'Wed, Nov 18 · Bridge Architecture Showcase',
        recentAnnouncement: 'Remember to bring any recycled cardboard or twine you collected at home for bridge testing!',
      },
    ],
    invoices: [
      {
        id: 'inv-1',
        invoiceNumber: 'INV-2026-102',
        familyId: 'fam-1',
        familyName: 'Morales Family',
        parentEmail: 'elena.morales@example.org',
        program: 'Lower Elementary Explorers',
        billingPeriod: 'November 2026',
        amountCents: 145000,
        dueDate: 'Nov 10, 2026',
        status: 'Paid',
        paidAt: 'Nov 13, 2026',
      },
      {
        id: 'inv-2',
        invoiceNumber: 'INV-2026-103',
        familyId: 'fam-5',
        familyName: 'Alvarez-Kim Family',
        parentEmail: 'sofia.alvarez@example.org',
        program: 'Lower Elementary Explorers',
        billingPeriod: 'November 2026',
        amountCents: 145000,
        dueDate: 'Nov 10, 2026',
        status: 'Paid',
        paidAt: 'Nov 09, 2026',
      },
      {
        id: 'inv-3',
        invoiceNumber: 'INV-2026-104',
        familyId: 'fam-2',
        familyName: 'Chen-Patel Family',
        parentEmail: 'maya.chen@example.org',
        program: 'Early Childhood Wonder',
        billingPeriod: 'Enrollment Deposit + Nov',
        amountCents: 128000,
        dueDate: 'Nov 22, 2026',
        status: 'Sent',
      },
      {
        id: 'inv-4',
        invoiceNumber: 'INV-2026-105',
        familyId: 'fam-3',
        familyName: 'Okafor Family',
        parentEmail: 'nadia.okafor@example.org',
        program: 'Upper Studio Makers',
        billingPeriod: 'November 2026',
        amountCents: 152000,
        dueDate: 'Nov 14, 2026',
        status: 'Needs Gentle Follow-up',
        gentleNoteSent: false,
      },
    ],
    notionUnits: [
      {
        id: 'nu-1',
        title: 'Autumn Botany & Watercolor Field Journals',
        cohort: 'Lower Elementary Explorers',
        seasonWeek: 'Autumn · Week 11',
        themeSummary: 'Children collect fallen maple, oak, and birch leaves, observe venation under brass loupes, and paint slow observational studies.',
        familyPrompt: 'On a walk this weekend, ask your child to pick one fallen leaf and notice three tiny details you might otherwise walk past.',
        teacherPrep: 'Fresh cold-press watercolor blocks, brass magnifying glasses, linen table cloths.',
        status: 'Active Week',
        sharedWithFamilies: true,
        lastEditedAt: 'Nov 16, 8:45 AM',
      },
      {
        id: 'nu-2',
        title: 'Woodland Folktales & Cozy Reading Circle',
        cohort: 'Early Childhood Wonder',
        seasonWeek: 'Autumn · Week 11',
        themeSummary: 'Oral storytelling with felt woodland figures, rhyming rhythm games, and unhurried picture book exploration by the sunlit window.',
        familyPrompt: 'Share a story from your own childhood before bedtime this week—children love hearing your voice without a book in hand.',
        teacherPrep: 'Display "The Wild Garden" and "Luna & The Owl" in the low birch reading nook.',
        status: 'Ready to Share',
        sharedWithFamilies: false,
        lastEditedAt: 'Nov 15, 5:20 PM',
      },
      {
        id: 'nu-3',
        title: 'Tension, Span & Community Bridges',
        cohort: 'Upper Studio Makers',
        seasonWeek: 'Autumn · Week 12',
        themeSummary: 'Hands-on engineering studio investigating truss geometry, weight distribution, and how bridges connect neighborhoods.',
        familyPrompt: 'Notice a local pedestrian bridge or archway together and sketch its shapes.',
        teacherPrep: 'Corrugated kraft board, jute twine, brass weights for load testing.',
        status: 'In Planning',
        sharedWithFamilies: false,
        lastEditedAt: 'Nov 14, 2:00 PM',
      },
    ],
    socialPosts: [
      {
        id: 'sp-1',
        platform: 'Both',
        title: 'Slow Mornings at the Botany Table',
        caption: 'Before rushing into answers, we give children time to look closely. This week in Lower Elementary Explorers, fallen oak and maple leaves became our quiet teachers—paired with watercolor sketchbooks and brass magnifying glasses. #LoveSchool #RelationshipCenteredLearning',
        imageUrl: '/src/assets/images/curriculum_botany_table_1794869225319.jpg',
        scheduledFor: 'Nov 17, 2026 · 9:30 AM',
        status: 'Needs Review',
        relatedUnit: 'Autumn Botany & Watercolor Field Journals',
      },
      {
        id: 'sp-2',
        platform: 'Instagram',
        title: 'By the Sunlit Reading Window',
        caption: 'A corner built for wonder, wool rugs, and unhurried stories. Spring & Fall family tours are open at loveschoolu.com—come sit in the morning light with us.',
        imageUrl: '/src/assets/images/social_reading_circle_1794869225385.jpg',
        scheduledFor: 'Nov 19, 2026 · 4:00 PM',
        status: 'Scheduled',
        relatedUnit: 'Woodland Folktales & Cozy Reading Circle',
      },
      {
        id: 'sp-3',
        platform: 'Facebook',
        title: 'Open Studio Morning — Meet Our Guides',
        caption: 'Looking for a school where your child is truly known? Book a 45-minute Campus Visit through loveschoolu.com and share a cup of tea in our studio.',
        imageUrl: '/src/assets/images/school_studio_hero_1794869225291.jpg',
        scheduledFor: 'Nov 12, 2026 · 10:00 AM',
        status: 'Published',
      },
    ],
    automations: [
      {
        id: 'auto-1',
        name: 'Wix Inquiry -> Personal Welcome Draft',
        triggerTool: 'Wix',
        triggerEvent: 'New inquiry submitted on loveschoolu.com',
        actionSummary: 'Creates a Family Journey card, prepares a personalized welcome email mentioning their child by name, and includes your Calendly discovery link.',
        targetTools: ['Gmail', 'Calendly'],
        mode: 'Human Review Queue',
        enabled: true,
        runsCount: 28,
        lastRunAt: 'Today, 11:42 AM',
      },
      {
        id: 'auto-2',
        name: 'Calendly Tour Completed -> Drive Enrollment Folder',
        triggerTool: 'Calendly',
        triggerEvent: 'Campus Visit marked completed',
        actionSummary: 'Creates the family’s enrollment folder in Google Drive and queues a warm post-visit thank-you note reflecting on their tour.',
        targetTools: ['Google Drive', 'Gmail'],
        mode: 'Human Review Queue',
        enabled: true,
        runsCount: 19,
        lastRunAt: 'Yesterday, 4:40 PM',
      },
      {
        id: 'auto-3',
        name: 'QuickBooks Paid -> Classroom Seat & Welcome Guide',
        triggerTool: 'QuickBooks',
        triggerEvent: 'Tuition invoice marked Paid',
        actionSummary: 'Prepares Google Classroom roster placement & guardian invite and queues a warm orientation email.',
        targetTools: ['Google Classroom', 'Gmail'],
        mode: 'Human Review Queue',
        enabled: true,
        runsCount: 14,
        lastRunAt: 'Nov 13, 2:15 PM',
      },
      {
        id: 'auto-4',
        name: 'Notion Weekly Guide -> Classroom, Email & Social',
        triggerTool: 'Notion',
        triggerEvent: 'Curriculum unit marked Ready to Share',
        actionSummary: 'Generates a family weekend reflection email draft, a Google Classroom announcement draft, and an Instagram/Facebook storytelling post.',
        targetTools: ['Google Classroom', 'Gmail', 'Instagram'],
        mode: 'Human Review Queue',
        enabled: true,
        runsCount: 11,
        lastRunAt: 'Nov 15, 5:25 PM',
      },
    ],
    integrations: [
      {
        id: 'int-wix',
        name: 'Wix Website',
        category: 'loveschoolu.com CMS & Leads',
        status: 'Connected',
        accountLabel: 'loveschoolu.com (Live Webhook)',
        endpointHint: '/api/webhooks/wix',
        lastSyncAt: 'Today, 11:42 AM',
        configFields: { siteDomain: 'loveschoolu.com', siteId: 'wix-ls-2026-main' },
      },
      {
        id: 'int-calendly',
        name: 'Calendly',
        category: 'Tours & Heart-to-Hearts',
        status: 'Connected',
        accountLabel: 'calendly.com/loveschoolu',
        endpointHint: '/api/webhooks/calendly',
        lastSyncAt: 'Today, 8:05 AM',
        configFields: { organizationUri: 'calendly.com/loveschoolu', hostEmail: 'clara@loveschoolu.com' },
      },
      {
        id: 'int-gmail',
        name: 'Gmail',
        category: 'Personal Family Email',
        status: 'Needs Sign-In',
        accountLabel: 'Connect Google Workspace to sync live inbox',
        endpointHint: 'gmail.googleapis.com',
        lastSyncAt: 'Ready for Google Sign-In',
        configFields: {},
      },
      {
        id: 'int-drive',
        name: 'Google Drive',
        category: 'Enrollment Packets & Docs',
        status: 'Needs Sign-In',
        accountLabel: 'Connect Google Workspace to browse & create folders',
        endpointHint: 'drive.googleapis.com',
        lastSyncAt: 'Ready for Google Sign-In',
        configFields: {},
      },
      {
        id: 'int-classroom',
        name: 'Google Classroom',
        category: 'Cohorts, Rosters & Announcements',
        status: 'Needs Sign-In',
        accountLabel: 'Connect Google Workspace to manage courses',
        endpointHint: 'classroom.googleapis.com',
        lastSyncAt: 'Ready for Google Sign-In',
        configFields: {},
      },
      {
        id: 'int-quickbooks',
        name: 'QuickBooks Online',
        category: 'Tuition Invoicing & Payments',
        status: 'Connected',
        accountLabel: 'Love School LLC · Realm #9130-4482',
        endpointHint: '/api/webhooks/quickbooks',
        lastSyncAt: 'Today, 9:40 AM',
        configFields: { realmId: '9130-4482-8810', environment: 'Production' },
      },
      {
        id: 'int-notion',
        name: 'Notion',
        category: 'Curriculum & Family Guides',
        status: 'Connected',
        accountLabel: 'Love School Living Curriculum DB',
        endpointHint: 'api.notion.com/v1/databases',
        lastSyncAt: 'Today, 8:45 AM',
        configFields: { databaseId: 'notion-db-curriculum-2026', workspaceName: 'Love School Studio' },
      },
      {
        id: 'int-meta',
        name: 'Facebook & Instagram',
        category: 'Community Storytelling',
        status: 'Connected',
        accountLabel: '@loveschoolu · Meta Business Suite',
        endpointHint: 'graph.facebook.com/v20.0',
        lastSyncAt: 'Yesterday, 4:00 PM',
        configFields: { instagramHandle: '@loveschoolu', facebookPage: 'Love School Community' },
      },
    ],
    activityLog: [
      { id: 'act-1', timestamp: '11:42 AM', tool: 'Wix', description: 'New family inquiry received from Rachel & Thomas Bennett via loveschoolu.com', familyName: 'Bennett Family' },
      { id: 'act-2', timestamp: '10:05 AM', tool: 'Drive', description: 'Queued gentle reminder draft for Arjun Patel’s health form', familyName: 'Chen-Patel Family' },
      { id: 'act-3', timestamp: '9:40 AM', tool: 'QuickBooks', description: 'Queued supportive tuition check-in draft for INV-2026-105', familyName: 'Okafor Family' },
      { id: 'act-4', timestamp: '8:45 AM', tool: 'Notion', description: 'Updated Autumn Botany & Watercolor Field Journals prompt', familyName: 'All Families' },
      { id: 'act-5', timestamp: '8:05 AM', tool: 'Calendly', description: 'Freja Lindqvist booked Campus Visit for Nov 18 at 10:00 AM', familyName: 'Lindqvist Family' },
    ],
  };
}

function readDb() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(DB_FILE)) {
    const seed = createSeedState();
    fs.writeFileSync(DB_FILE, JSON.stringify(seed, null, 2), 'utf-8');
    return seed;
  }
  try {
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch {
    const seed = createSeedState();
    fs.writeFileSync(DB_FILE, JSON.stringify(seed, null, 2), 'utf-8');
    return seed;
  }
}

function writeDb(state: ReturnType<typeof createSeedState>) {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  const tmpFile = `${DB_FILE}.tmp`;
  fs.writeFileSync(tmpFile, JSON.stringify(state, null, 2), 'utf-8');
  fs.renameSync(tmpFile, DB_FILE);
}

function nowLabel() {
  return new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '2mb' }));

  // Health & Full Workspace State
  app.get('/api/health', (_req, res) => {
    res.json({ ok: true, service: 'love-school-hub' });
  });

  app.get('/api/state', (_req, res) => {
    const db = readDb();
    res.json(db);
  });

  // Reset demo data if requested
  app.post('/api/state/reset', (_req, res) => {
    const seed = createSeedState();
    writeDb(seed);
    res.json(seed);
  });

  // Families CRUD & Relational Touchpoints
  app.post('/api/families', (req, res) => {
    const db = readDb();
    const {
      familyName,
      parentNames,
      email,
      phone,
      childName,
      childAge,
      program,
      warmthNote,
      preferredContact,
    } = req.body;

    if (!familyName || !email || !childName) {
      res.status(400).json({ error: 'Family name, email, and child name are required.' });
      return;
    }

    const newFamily = {
      id: `fam-${Date.now()}`,
      familyName,
      parentNames: parentNames || familyName,
      email,
      phone: phone || '(512) 555-0100',
      childName,
      childAge: childAge || '5 years',
      program: program || 'Early Childhood Wonder',
      stage: 'Wix Inquiry',
      warmthNote: warmthNote || 'New family connected through Love School Hub.',
      preferredContact: preferredContact || 'Personal email',
      assignedGuide: 'Clara Vance (Director)',
      driveFolderUrl: '',
      classroomCohort: `${program || 'Early Childhood Wonder'} (Fall)`,
      tuitionStatus: 'Scheduled',
      nextStepLabel: 'Send warm welcome & Calendly tour link',
      lastTouchAt: new Date().toISOString(),
      checklist: [
        { id: 'c1', label: 'Enrollment Agreement Signed', completed: false },
        { id: 'c2', label: 'Child Learning & Care Profile', completed: false },
        { id: 'c3', label: 'Immunization & Emergency Card', completed: false },
        { id: 'c4', label: 'Tuition Autopay Confirmed', completed: false },
      ],
      touchpoints: [
        {
          id: `tp-${Date.now()}`,
          date: `Today, ${nowLabel()}`,
          channel: 'Note',
          summary: `Added ${familyName} (${childName}) to the Love School Family Journey.`,
          author: 'Clara Vance',
        },
      ],
    };

    db.families.unshift(newFamily);
    db.emailDrafts.unshift({
      id: `ed-${Date.now()}`,
      familyId: newFamily.id,
      recipientName: newFamily.parentNames,
      recipientEmail: newFamily.email,
      subject: `So glad to connect — ${childName} & Love School`,
      body: `Dear ${newFamily.parentNames},\n\nThank you so much for reaching out to Love School! We would love to hear more about ${childName} and invite your family for an unhurried morning walk through our studio.\n\nWhenever you’re ready, you can choose a time that feels easy here: https://calendly.com/loveschoolu/campus-tour\n\nWarmly,\nClara Vance\nDirector, Love School`,
      triggerSource: 'New Family Journey (Human Review)',
      toneTag: 'Warm Welcome',
      status: 'Pending Review',
      createdAt: `Today, ${nowLabel()}`,
    });
    db.activityLog.unshift({
      id: `act-${Date.now()}`,
      timestamp: nowLabel(),
      tool: 'Family Hub',
      description: `Created family journey for ${familyName} and queued a personal welcome draft`,
      familyName,
    });
    writeDb(db);
    res.json(db);
  });

  app.patch('/api/families/:id', (req, res) => {
    const db = readDb();
    const idx = db.families.findIndex((f: { id: string }) => f.id === req.params.id);
    if (idx === -1) {
      res.status(404).json({ error: 'Family not found' });
      return;
    }

    const fam = db.families[idx];
    const { stage, warmthNote, nextStepLabel, checklist, touchpoint, driveFolderUrl } = req.body;
    if (stage) fam.stage = stage;
    if (typeof warmthNote === 'string') fam.warmthNote = warmthNote;
    if (typeof nextStepLabel === 'string') fam.nextStepLabel = nextStepLabel;
    if (typeof driveFolderUrl === 'string') fam.driveFolderUrl = driveFolderUrl;
    if (Array.isArray(checklist)) fam.checklist = checklist;
    if (touchpoint) {
      fam.touchpoints.unshift({
        id: `tp-${Date.now()}`,
        date: `Today, ${nowLabel()}`,
        channel: touchpoint.channel || 'Note',
        summary: touchpoint.summary,
        author: touchpoint.author || 'Clara Vance',
      });
      db.activityLog.unshift({
        id: `act-${Date.now()}`,
        timestamp: nowLabel(),
        tool: touchpoint.channel || 'Family Hub',
        description: touchpoint.summary,
        familyName: fam.familyName,
      });
    }
    fam.lastTouchAt = new Date().toISOString();
    writeDb(db);
    res.json(db);
  });

  // Wix Website & Leads
  app.patch('/api/wix/pages/:id', (req, res) => {
    const db = readDb();
    const page = db.wixPages.find((p: { id: string }) => p.id === req.params.id);
    if (!page) {
      res.status(404).json({ error: 'Page not found' });
      return;
    }
    const { headline, subheadline, status } = req.body;
    if (typeof headline === 'string') page.headline = headline;
    if (typeof subheadline === 'string') page.subheadline = subheadline;
    if (status) page.status = status;
    page.lastSyncedAt = `Today, ${nowLabel()}`;
    db.activityLog.unshift({
      id: `act-${Date.now()}`,
      timestamp: nowLabel(),
      tool: 'Wix',
      description: `Updated live copy on loveschoolu.com${page.path}`,
    });
    writeDb(db);
    res.json(db);
  });

  app.post('/api/wix/leads/:id/convert', (req, res) => {
    const db = readDb();
    const lead = db.wixLeads.find((l: { id: string }) => l.id === req.params.id);
    if (!lead) {
      res.status(404).json({ error: 'Lead not found' });
      return;
    }
    lead.status = 'Converted';
    const lastName = lead.parentName.split(' ').slice(-1)[0] || lead.parentName;
    const newFamily = {
      id: `fam-${Date.now()}`,
      familyName: `${lastName} Family`,
      parentNames: lead.parentName,
      email: lead.email,
      phone: '(512) 555-0182',
      childName: lead.childName,
      childAge: lead.childAge,
      program: lead.programInterest,
      stage: 'Wix Inquiry',
      warmthNote: lead.personalStory,
      preferredContact: 'Personal email',
      assignedGuide: 'Clara Vance (Director)',
      driveFolderUrl: '',
      classroomCohort: `${lead.programInterest} (Fall)`,
      tuitionStatus: 'Scheduled',
      nextStepLabel: 'Review & send personalized Calendly tour invitation',
      lastTouchAt: new Date().toISOString(),
      checklist: [
        { id: 'c1', label: 'Enrollment Agreement Signed', completed: false },
        { id: 'c2', label: 'Child Learning & Care Profile', completed: false },
        { id: 'c3', label: 'Immunization & Emergency Card', completed: false },
        { id: 'c4', label: 'Tuition Autopay Confirmed', completed: false },
      ],
      touchpoints: [
        {
          id: `tp-${Date.now()}`,
          date: `Today, ${nowLabel()}`,
          channel: 'Wix',
          summary: `Welcomed from loveschoolu.com inquiry: "${lead.personalStory}"`,
          author: 'Clara Vance',
        },
      ],
    };
    db.families.unshift(newFamily);
    db.emailDrafts.unshift({
      id: `ed-${Date.now()}`,
      familyId: newFamily.id,
      recipientName: lead.parentName,
      recipientEmail: lead.email,
      subject: `Welcome to Love School — thinking of ${lead.childName}`,
      body: `Dear ${lead.parentName},\n\nThank you for sharing a glimpse of ${lead.childName} with us on loveschoolu.com! Hearing that "${lead.personalStory.slice(0, 90)}..." made us smile.\n\nWe would love to invite you for a relaxed morning visit. You can pick any opening on our Calendly here: https://calendly.com/loveschoolu/campus-tour\n\nWarmly,\nClara Vance\nDirector, Love School`,
      triggerSource: 'Wix Inquiry -> Personal Welcome Draft',
      toneTag: 'Personal Story Reply',
      status: 'Pending Review',
      createdAt: `Today, ${nowLabel()}`,
    });
    db.activityLog.unshift({
      id: `act-${Date.now()}`,
      timestamp: nowLabel(),
      tool: 'Wix',
      description: `Converted ${lead.parentName} into active Family Journey & drafted personal welcome email`,
      familyName: newFamily.familyName,
    });
    writeDb(db);
    res.json(db);
  });

  // Calendly Events
  app.post('/api/calendly/events', (req, res) => {
    const db = readDb();
    const { familyName, parentEmail, eventType, scheduledFor, hostName, prepNote } = req.body;
    if (!familyName || !scheduledFor) {
      res.status(400).json({ error: 'Family name and scheduled date/time are required.' });
      return;
    }
    const ev = {
      id: `ce-${Date.now()}`,
      familyName,
      parentEmail: parentEmail || 'family@example.org',
      eventType: eventType || 'Campus Visit & Family Tour',
      scheduledFor,
      durationMinutes: 45,
      hostName: hostName || 'Clara Vance',
      status: 'Upcoming',
      prepNote: prepNote || 'Prepare studio tea and welcome packet.',
    };
    db.calendlyEvents.unshift(ev);
    db.activityLog.unshift({
      id: `act-${Date.now()}`,
      timestamp: nowLabel(),
      tool: 'Calendly',
      description: `Scheduled ${ev.eventType} for ${ev.familyName} (${ev.scheduledFor})`,
      familyName: ev.familyName,
    });
    writeDb(db);
    res.json(db);
  });

  app.patch('/api/calendly/events/:id', (req, res) => {
    const db = readDb();
    const ev = db.calendlyEvents.find((e: { id: string }) => e.id === req.params.id);
    if (!ev) {
      res.status(404).json({ error: 'Event not found' });
      return;
    }
    const { status, prepNote, scheduledFor } = req.body;
    if (status) ev.status = status;
    if (typeof prepNote === 'string') ev.prepNote = prepNote;
    if (typeof scheduledFor === 'string') ev.scheduledFor = scheduledFor;

    if (status === 'Completed') {
      if (ev.familyId) {
        const fam = db.families.find((f: { id: string }) => f.id === ev.familyId);
        if (fam) {
          fam.stage = 'Drive Packet';
          fam.nextStepLabel = 'Share Google Drive Enrollment Folder';
          fam.touchpoints.unshift({
            id: `tp-${Date.now()}`,
            date: `Today, ${nowLabel()}`,
            channel: 'Calendly',
            summary: `Completed ${ev.eventType}. Queued post-visit thank-you & Drive packet note.`,
            author: ev.hostName,
          });
        }
      }
      db.emailDrafts.unshift({
        id: `ed-${Date.now()}`,
        familyId: ev.familyId,
        recipientName: ev.familyName,
        recipientEmail: ev.parentEmail,
        subject: 'Thank you for visiting Love School today',
        body: `Dear ${ev.familyName},\n\nThank you for spending part of your morning with us at Love School! ${ev.prepNote ? `Note from our visit: ${ev.prepNote}\n\n` : ''}Whenever you feel ready for next steps, we’ve prepared your personal Google Drive enrollment folder so everything stays simple and calm.\n\nWarmly,\n${ev.hostName}\nLove School`,
        triggerSource: 'Calendly Tour Completed -> Drive & Thank-You',
        toneTag: 'Post-Visit Reflection',
        status: 'Pending Review',
        createdAt: `Today, ${nowLabel()}`,
      });
    }

    db.activityLog.unshift({
      id: `act-${Date.now()}`,
      timestamp: nowLabel(),
      tool: 'Calendly',
      description: `Updated ${ev.eventType} for ${ev.familyName} (${ev.status})`,
      familyName: ev.familyName,
    });
    writeDb(db);
    res.json(db);
  });

  // Email Drafts & Personal Touch Queue
  app.post('/api/emails/drafts', (req, res) => {
    const db = readDb();
    const { familyId, recipientName, recipientEmail, subject, body, triggerSource, toneTag } = req.body;
    if (!recipientEmail || !subject || !body) {
      res.status(400).json({ error: 'Recipient email, subject, and body are required.' });
      return;
    }
    const draft = {
      id: `ed-${Date.now()}`,
      familyId,
      recipientName: recipientName || recipientEmail,
      recipientEmail,
      subject,
      body,
      triggerSource: triggerSource || 'Director Personal Touch',
      toneTag: toneTag || 'Personal Check-In',
      status: 'Pending Review',
      createdAt: `Today, ${nowLabel()}`,
    };
    db.emailDrafts.unshift(draft);
    writeDb(db);
    res.json(db);
  });

  app.patch('/api/emails/drafts/:id', (req, res) => {
    const db = readDb();
    const draft = db.emailDrafts.find((d: { id: string }) => d.id === req.params.id);
    if (!draft) {
      res.status(404).json({ error: 'Draft not found' });
      return;
    }
    const { subject, body, status } = req.body;
    if (typeof subject === 'string') draft.subject = subject;
    if (typeof body === 'string') draft.body = body;
    if (status) {
      draft.status = status;
      if (status === 'Approved & Sent') {
        draft.sentAt = `Today, ${nowLabel()}`;
        if (draft.familyId) {
          const fam = db.families.find((f: { id: string }) => f.id === draft.familyId);
          if (fam) {
            fam.touchpoints.unshift({
              id: `tp-${Date.now()}`,
              date: `Today, ${nowLabel()}`,
              channel: 'Email',
              summary: `Sent personalized note: "${draft.subject}"`,
              author: 'Clara Vance',
            });
          }
        }
        db.activityLog.unshift({
          id: `act-${Date.now()}`,
          timestamp: nowLabel(),
          tool: 'Gmail',
          description: `Approved and sent warm email "${draft.subject}" to ${draft.recipientName}`,
          familyName: draft.recipientName,
        });
      }
    }
    writeDb(db);
    res.json(db);
  });

  app.delete('/api/emails/drafts/:id', (req, res) => {
    const db = readDb();
    db.emailDrafts = db.emailDrafts.filter((d: { id: string }) => d.id !== req.params.id);
    writeDb(db);
    res.json(db);
  });

  // QuickBooks Invoices
  app.post('/api/invoices', (req, res) => {
    const db = readDb();
    const { familyName, parentEmail, program, billingPeriod, amountDollars, dueDate } = req.body;
    if (!familyName || !amountDollars) {
      res.status(400).json({ error: 'Family name and amount are required.' });
      return;
    }
    const nextNum = 106 + db.invoices.length;
    const inv = {
      id: `inv-${Date.now()}`,
      invoiceNumber: `INV-2026-${nextNum}`,
      familyName,
      parentEmail: parentEmail || 'family@example.org',
      program: program || 'Lower Elementary Explorers',
      billingPeriod: billingPeriod || 'December 2026',
      amountCents: Math.round(Number(amountDollars) * 100),
      dueDate: dueDate || 'Dec 01, 2026',
      status: 'Sent',
    };
    db.invoices.unshift(inv);
    db.activityLog.unshift({
      id: `act-${Date.now()}`,
      timestamp: nowLabel(),
      tool: 'QuickBooks',
      description: `Issued invoice ${inv.invoiceNumber} ($${Number(amountDollars).toFixed(2)}) for ${familyName}`,
      familyName,
    });
    writeDb(db);
    res.json(db);
  });

  app.patch('/api/invoices/:id', (req, res) => {
    const db = readDb();
    const inv = db.invoices.find((i: { id: string }) => i.id === req.params.id);
    if (!inv) {
      res.status(404).json({ error: 'Invoice not found' });
      return;
    }
    const { status, queueGentleReminder } = req.body;
    if (status) {
      inv.status = status;
      if (status === 'Paid') {
        inv.paidAt = `Today, ${nowLabel()}`;
        if (inv.familyId) {
          const fam = db.families.find((f: { id: string }) => f.id === inv.familyId);
          if (fam) {
            fam.tuitionStatus = 'Paid';
            fam.stage = 'Classroom Placement';
            fam.nextStepLabel = 'Confirm Google Classroom guardian invite';
            fam.touchpoints.unshift({
              id: `tp-${Date.now()}`,
              date: `Today, ${nowLabel()}`,
              channel: 'QuickBooks',
              summary: `Paid ${inv.invoiceNumber} ($${(inv.amountCents / 100).toFixed(2)}). Advanced to Classroom Placement.`,
              author: 'QuickBooks Sync',
            });
          }
        }
        db.emailDrafts.unshift({
          id: `ed-${Date.now()}`,
          familyId: inv.familyId,
          recipientName: inv.familyName,
          recipientEmail: inv.parentEmail,
          subject: `Thank you & welcome to your classroom, ${inv.familyName}`,
          body: `Dear ${inv.familyName},\n\nThank you for your tuition stewardship (${inv.invoiceNumber})! We’ve prepared your child’s Google Classroom seat and orientation guide so everything feels effortless on day one.\n\nWarmly,\nClara Vance\nLove School`,
          triggerSource: 'QuickBooks Paid -> Classroom Sync',
          toneTag: 'Gratitude & Orientation',
          status: 'Pending Review',
          createdAt: `Today, ${nowLabel()}`,
        });
      }
    }
    if (queueGentleReminder) {
      inv.gentleNoteSent = true;
      db.emailDrafts.unshift({
        id: `ed-${Date.now()}`,
        familyId: inv.familyId,
        recipientName: inv.familyName,
        recipientEmail: inv.parentEmail,
        subject: `Warm check-in regarding ${inv.invoiceNumber}`,
        body: `Hi ${inv.familyName},\n\nJust a gentle note about invoice ${inv.invoiceNumber} ($${(inv.amountCents / 100).toFixed(2)} for ${inv.billingPeriod}). If you need flexible timing or have any questions at all, just hit reply—we are always glad to work together.\n\nWarmly,\nClara Vance\nLove School`,
        triggerSource: 'QuickBooks Gentle Reminder',
        toneTag: 'Supportive Billing',
        status: 'Pending Review',
        createdAt: `Today, ${nowLabel()}`,
      });
    }
    db.activityLog.unshift({
      id: `act-${Date.now()}`,
      timestamp: nowLabel(),
      tool: 'QuickBooks',
      description: queueGentleReminder
        ? `Queued gentle billing check-in for ${inv.familyName}`
        : `Updated ${inv.invoiceNumber} status to ${inv.status}`,
      familyName: inv.familyName,
    });
    writeDb(db);
    res.json(db);
  });

  // Notion Curriculum Units
  app.post('/api/notion/units', (req, res) => {
    const db = readDb();
    const { title, cohort, seasonWeek, themeSummary, familyPrompt, teacherPrep } = req.body;
    if (!title) {
      res.status(400).json({ error: 'Unit title is required.' });
      return;
    }
    const unit = {
      id: `nu-${Date.now()}`,
      title,
      cohort: cohort || 'Lower Elementary Explorers',
      seasonWeek: seasonWeek || 'Autumn · Week 12',
      themeSummary: themeSummary || '',
      familyPrompt: familyPrompt || '',
      teacherPrep: teacherPrep || '',
      status: 'Ready to Share',
      sharedWithFamilies: false,
      lastEditedAt: `Today, ${nowLabel()}`,
    };
    db.notionUnits.unshift(unit);
    writeDb(db);
    res.json(db);
  });

  app.patch('/api/notion/units/:id', (req, res) => {
    const db = readDb();
    const unit = db.notionUnits.find((u: { id: string }) => u.id === req.params.id);
    if (!unit) {
      res.status(404).json({ error: 'Curriculum unit not found' });
      return;
    }
    const { title, themeSummary, familyPrompt, teacherPrep, status, shareWithFamilies } = req.body;
    if (typeof title === 'string') unit.title = title;
    if (typeof themeSummary === 'string') unit.themeSummary = themeSummary;
    if (typeof familyPrompt === 'string') unit.familyPrompt = familyPrompt;
    if (typeof teacherPrep === 'string') unit.teacherPrep = teacherPrep;
    if (status) unit.status = status;
    unit.lastEditedAt = `Today, ${nowLabel()}`;

    if (shareWithFamilies) {
      unit.sharedWithFamilies = true;
      unit.status = 'Active Week';
      db.emailDrafts.unshift({
        id: `ed-${Date.now()}`,
        recipientName: `${unit.cohort} Families`,
        recipientEmail: 'families@loveschoolu.com',
        subject: `This Week in ${unit.cohort}: ${unit.title}`,
        body: `Dear ${unit.cohort} Families,\n\n${unit.themeSummary}\n\nHome Connection Prompt:\n${unit.familyPrompt}\n\nWarmly,\nYour Love School Guides`,
        triggerSource: 'Notion Weekly Guide -> Family Email',
        toneTag: 'Weekly Learning Digest',
        status: 'Pending Review',
        createdAt: `Today, ${nowLabel()}`,
      });
      db.socialPosts.unshift({
        id: `sp-${Date.now()}`,
        platform: 'Both',
        title: unit.title,
        caption: `${unit.themeSummary} At home this week: ${unit.familyPrompt} #LoveSchool #loveschoolu`,
        imageUrl: '/src/assets/images/curriculum_botany_table_1794869225319.jpg',
        scheduledFor: 'Tomorrow · 10:00 AM',
        status: 'Needs Review',
        relatedUnit: unit.title,
      });
      db.activityLog.unshift({
        id: `act-${Date.now()}`,
        timestamp: nowLabel(),
        tool: 'Notion',
        description: `Shared "${unit.title}" -> queued Family Email Digest & Social Highlight`,
      });
    }
    writeDb(db);
    res.json(db);
  });

  // Social Media Posts
  app.post('/api/social/posts', (req, res) => {
    const db = readDb();
    const { platform, title, caption, imageUrl, scheduledFor } = req.body;
    if (!title || !caption) {
      res.status(400).json({ error: 'Post title and caption are required.' });
      return;
    }
    const post = {
      id: `sp-${Date.now()}`,
      platform: platform || 'Both',
      title,
      caption,
      imageUrl: imageUrl || '/src/assets/images/social_reading_circle_1794869225385.jpg',
      scheduledFor: scheduledFor || 'Tomorrow · 10:00 AM',
      status: 'Needs Review',
    };
    db.socialPosts.unshift(post);
    db.activityLog.unshift({
      id: `act-${Date.now()}`,
      timestamp: nowLabel(),
      tool: 'Social Studio',
      description: `Created ${post.platform} story "${post.title}" for review`,
    });
    writeDb(db);
    res.json(db);
  });

  app.patch('/api/social/posts/:id', (req, res) => {
    const db = readDb();
    const post = db.socialPosts.find((p: { id: string }) => p.id === req.params.id);
    if (!post) {
      res.status(404).json({ error: 'Post not found' });
      return;
    }
    const { status, caption, scheduledFor, platform } = req.body;
    if (status) post.status = status;
    if (typeof caption === 'string') post.caption = caption;
    if (typeof scheduledFor === 'string') post.scheduledFor = scheduledFor;
    if (platform) post.platform = platform;
    db.activityLog.unshift({
      id: `act-${Date.now()}`,
      timestamp: nowLabel(),
      tool: 'Social Studio',
      description: `Updated "${post.title}" (${post.platform}) to ${post.status}`,
    });
    writeDb(db);
    res.json(db);
  });

  // Automation Workflows
  app.patch('/api/automations/:id', (req, res) => {
    const db = readDb();
    const auto = db.automations.find((a: { id: string }) => a.id === req.params.id);
    if (!auto) {
      res.status(404).json({ error: 'Automation not found' });
      return;
    }
    const { enabled, mode, runNow } = req.body;
    if (typeof enabled === 'boolean') auto.enabled = enabled;
    if (mode) auto.mode = mode;
    if (runNow) {
      auto.runsCount += 1;
      auto.lastRunAt = `Today, ${nowLabel()}`;
      db.activityLog.unshift({
        id: `act-${Date.now()}`,
        timestamp: nowLabel(),
        tool: auto.triggerTool,
        description: `Ran workflow "${auto.name}" (${auto.mode})`,
      });
    }
    writeDb(db);
    res.json(db);
  });

  // Integration Connectors
  app.patch('/api/integrations/:id', (req, res) => {
    const db = readDb();
    const conn = db.integrations.find((i: { id: string }) => i.id === req.params.id);
    if (!conn) {
      res.status(404).json({ error: 'Connector not found' });
      return;
    }
    const { accountLabel, status, configFields } = req.body;
    if (typeof accountLabel === 'string') conn.accountLabel = accountLabel;
    if (status) conn.status = status;
    if (configFields && typeof configFields === 'object') {
      conn.configFields = { ...conn.configFields, ...configFields };
    }
    conn.lastSyncAt = `Today, ${nowLabel()}`;
    db.activityLog.unshift({
      id: `act-${Date.now()}`,
      timestamp: nowLabel(),
      tool: conn.name,
      description: `Updated & verified ${conn.name} connection settings`,
    });
    writeDb(db);
    res.json(db);
  });

  // Real External Webhook Receivers (Wix, Calendly, QuickBooks)
  app.post('/api/webhooks/wix', (req, res) => {
    const db = readDb();
    const payload = req.body || {};
    const parentName = payload.parentName || payload.name || 'New Website Family';
    const email = payload.email || 'inquiry@example.org';
    const childName = payload.childName || 'Student';
    const childAge = payload.childAge || '5 years';
    const programInterest = payload.programInterest || 'Early Childhood Wonder';
    const personalStory = payload.message || payload.personalStory || 'Submitted via loveschoolu.com contact form.';

    const lead = {
      id: `wl-${Date.now()}`,
      submittedAt: `Today, ${nowLabel()}`,
      parentName,
      email,
      childName,
      childAge,
      programInterest,
      personalStory,
      status: 'New Inquiry',
    };
    db.wixLeads.unshift(lead);
    db.activityLog.unshift({
      id: `act-${Date.now()}`,
      timestamp: nowLabel(),
      tool: 'Wix Webhook',
      description: `Received live website inquiry from ${parentName}`,
    });
    writeDb(db);
    res.json({ received: true, leadId: lead.id });
  });

  app.post('/api/webhooks/calendly', (req, res) => {
    const db = readDb();
    const payload = req.body || {};
    const ev = {
      id: `ce-${Date.now()}`,
      familyName: payload.inviteeName || 'Visiting Family',
      parentEmail: payload.inviteeEmail || 'family@example.org',
      eventType: payload.eventType || 'Campus Visit & Family Tour',
      scheduledFor: payload.scheduledFor || 'Upcoming Slot',
      durationMinutes: 45,
      hostName: 'Clara Vance',
      status: 'Upcoming',
      prepNote: payload.questions || 'Booked via Calendly webhook.',
    };
    db.calendlyEvents.unshift(ev);
    db.activityLog.unshift({
      id: `act-${Date.now()}`,
      timestamp: nowLabel(),
      tool: 'Calendly Webhook',
      description: `Synced new Calendly booking for ${ev.familyName}`,
    });
    writeDb(db);
    res.json({ received: true, eventId: ev.id });
  });

  app.post('/api/webhooks/quickbooks', (req, res) => {
    const db = readDb();
    const { invoiceNumber, status } = req.body || {};
    if (invoiceNumber) {
      const inv = db.invoices.find((i: { invoiceNumber: string }) => i.invoiceNumber === invoiceNumber);
      if (inv) {
        inv.status = status || 'Paid';
        inv.paidAt = `Today, ${nowLabel()}`;
        db.activityLog.unshift({
          id: `act-${Date.now()}`,
          timestamp: nowLabel(),
          tool: 'QuickBooks Webhook',
          description: `Synced invoice ${invoiceNumber} status -> ${inv.status}`,
          familyName: inv.familyName,
        });
        writeDb(db);
      }
    }
    res.json({ received: true });
  });

  // Vite Middleware (dev) or Static Serve (prod)
  if (process.env.NODE_ENV === 'production') {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Love School Hub running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start Love School Hub server:', err);
  process.exit(1);
});
