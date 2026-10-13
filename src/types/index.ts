export type EventCategory = 
  | 'Hackathon' 
  | 'Tech Talk' 
  | 'Workshop' 
  | 'Cultural' 
  | 'Career' 
  | 'Sports' 
  | 'Academic';

export type RegistrationStatus = 
  | 'registered' 
  | 'waitlisted' 
  | 'attended' 
  | 'not_registered'
  | 'saved';

export interface EventSpeaker {
  name: string;
  role: string;
  organization?: string;
  avatarUrl?: string;
}

export interface EventScheduleItem {
  time: string;
  title: string;
  description?: string;
  venue?: string;
}

export interface CampusEvent {
  id: string;
  title: string;
  shortDescription: string;
  fullDescription: string;
  category: EventCategory;
  organizer: string;
  organizerEmail?: string;
  clubLogo?: string;
  bannerImage: string;
  startDate: string; // ISO date or "YYYY-MM-DD"
  startTime: string; // "10:00 AM"
  endDate: string;
  endTime: string;
  venue: string;
  room?: string;
  isVirtual?: boolean;
  virtualMeetingUrl?: string;
  registrationStatus: RegistrationStatus;
  registrationDeadline: string; // ISO or YYYY-MM-DD
  registrationFee?: string;
  attendeesCount: number;
  capacity?: number;
  tags: string[];
  speakers?: EventSpeaker[];
  schedule?: EventScheduleItem[];
  checklistTasks?: string[];
  externalUrl?: string;
  isFeatured?: boolean;
}

export interface PrepTask {
  id: string;
  eventId?: string;
  eventTitle?: string;
  title: string;
  dueDate: string;
  dueTime?: string;
  isCompleted: boolean;
  priority: 'low' | 'medium' | 'high';
  category?: 'prep' | 'submission' | 'travel' | 'registration';
}

export interface PendingDeadline {
  id: string;
  eventId: string;
  eventTitle: string;
  category: EventCategory;
  title: string;
  deadlineDate: string;
  deadlineTime: string;
  isUrgent: boolean;
  actionUrl?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  studentId: string;
  department: string;
  yearOfStudy: string;
  avatarUrl: string;
  campusName: string;
  interests: EventCategory[];
  notificationSettings: {
    emailReminders: boolean;
    deadlineAlerts: boolean;
    aiRecommendations: boolean;
    weeklyDigest: boolean;
    browserPush: boolean;
  };
  calendarSync: {
    google: boolean;
    apple: boolean;
    outlook: boolean;
  };
}

export interface CampusNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: 'reminder' | 'deadline' | 'update' | 'ai';
  eventId?: string;
}

export interface AIParseResult {
  title?: string | null;
  category?: EventCategory | null;
  organizer?: string | null;
  startDate?: string | null;
  startTime?: string | null;
  endDate?: string | null;
  endTime?: string | null;
  venue?: string | null;
  room?: string | null;
  description?: string | null;
  registrationDeadline?: string | null;
  registrationLink?: string | null;
  registrationFee?: string | null;
  tags?: string[];
  suggestedTasks?: string[];
  confidenceScore?: number;
  bannerImage?: string | null;
  extractedText?: string | null;
  missingFields?: string[];
  uncertainFields?: string[];
  isAiPowered?: boolean;
  provider?: string;
  model?: string | null;
  errorMessage?: string | null;
}

export interface AIStatusResponse {
  configured: boolean;
  provider: string;
  model?: string | null;
  supportedInputs: string[];
  message: string;
}

export type NavigationPage = 
  | 'dashboard' 
  | 'my-events' 
  | 'timeline' 
  | 'ai-importer' 
  | 'discover' 
  | 'settings';

export interface DemoUser {
  id: string;
  email: string;
  name: string;
  role: 'explorer' | 'organizer' | 'ai_tester';
  role_title: string;
  department: string;
  student_id: string;
  year_of_study: string;
  avatar_url: string;
  is_admin: boolean;
}

export interface DemoLoginResponse {
  token: string;
  token_type: string;
  expires_in: number;
  user: DemoUser;
}

