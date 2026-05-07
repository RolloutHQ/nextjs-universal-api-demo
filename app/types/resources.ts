// ========== BASE TYPES ==========
export interface Address {
  street?: string;
  city?: string;
  state?: string;
  code?: string;
  country?: string;
}

export interface Email {
  value: string;
  type?: 'work' | 'personal' | 'other';
}

export interface Phone {
  value: string;
  type?: 'work' | 'mobile' | 'home' | 'other';
}

// ========== PEOPLE (EXISTING) ==========
export interface Person {
  id: string;
  firstName: string;
  lastName: string;
  stage?: string;
  source?: string;
  emails?: Email[];
  phones?: Phone[];
  addresses?: Address[];
  companyId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreatePersonInput {
  firstName: string;
  lastName: string;
  emails?: Email[];
  phones?: Phone[];
  addresses?: Address[];
  stage?: string;
  source?: string;
}

// ========== COMPANIES ==========
export interface Company {
  id: string;
  name: string;
  domain?: string;
  industry?: string;
  employees?: number;
  description?: string;
  addresses?: Address[];
  phones?: Phone[];
  emails?: Email[];
  website?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateCompanyInput {
  name: string;
  domain?: string;
  industry?: string;
  employees?: number;
  description?: string;
  addresses?: Address[];
  phones?: Phone[];
  emails?: Email[];
  website?: string;
}

// ========== PROPERTIES ==========
export interface Property {
  id: string;
  address: Address;
  propertyType?: 'residential' | 'commercial' | 'land' | 'other';
  status?: 'active' | 'pending' | 'sold' | 'off-market';
  price?: number;
  bedrooms?: number;
  bathrooms?: number;
  squareFeet?: number;
  lotSize?: number;
  yearBuilt?: number;
  description?: string;
  listingAgentId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreatePropertyInput {
  address: Address;
  propertyType?: string;
  status?: string;
  price?: number;
  bedrooms?: number;
  bathrooms?: number;
  squareFeet?: number;
  lotSize?: number;
  yearBuilt?: number;
  description?: string;
}

// ========== EMAILS (Communication) ==========
export interface EmailMessage {
  id: string;
  subject: string;
  body: string;
  from: Email;
  to: Email[];
  cc?: Email[];
  bcc?: Email[];
  sentAt?: string;
  receivedAt?: string;
  direction?: 'inbound' | 'outbound';
  personId?: string;
  companyId?: string;
  createdAt?: string;
}

export interface CreateEmailInput {
  subject: string;
  body: string;
  from: Email;
  to: Email[];
  cc?: Email[];
  direction?: 'inbound' | 'outbound';
  personId?: string;
  companyId?: string;
}

// ========== MEETINGS ==========
export interface Meeting {
  id: string;
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  location?: string;
  attendees?: Array<{
    email: string;
    name?: string;
    status?: 'accepted' | 'declined' | 'tentative';
  }>;
  organizer?: string;
  meetingType?: 'in-person' | 'phone' | 'video' | 'other';
  personId?: string;
  companyId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateMeetingInput {
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  location?: string;
  meetingType?: string;
  attendees?: Array<{ email: string; name?: string }>;
  personId?: string;
  companyId?: string;
}

// ========== CALLS ==========
export interface Call {
  id: string;
  subject?: string;
  description?: string;
  startTime: string;
  endTime?: string;
  duration?: number; // seconds
  direction?: 'inbound' | 'outbound';
  outcome?: 'completed' | 'no-answer' | 'voicemail' | 'busy';
  phoneNumber?: string;
  personId?: string;
  companyId?: string;
  recordingUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateCallInput {
  subject?: string;
  description?: string;
  startTime: string;
  duration?: number;
  direction?: 'inbound' | 'outbound';
  outcome?: string;
  phoneNumber?: string;
  personId?: string;
  companyId?: string;
}

// ========== NOTES ==========
export interface Note {
  id: string;
  title?: string;
  content: string;
  personId?: string;
  companyId?: string;
  propertyId?: string;
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateNoteInput {
  title?: string;
  content: string;
  personId?: string;
  companyId?: string;
  propertyId?: string;
}

// ========== USERS (CRM Users) ==========
export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role?: string;
  status?: 'active' | 'inactive';
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateUserInput {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role?: string;
  status?: string;
}

// ========== TASKS ==========
export interface Task {
  id: string;
  title: string;
  description?: string;
  status?: 'todo' | 'in_progress' | 'completed' | 'cancelled';
  priority?: 'low' | 'medium' | 'high';
  dueDate?: string;
  assignedTo?: string;
  participants?: string[];
  personId?: string;
  companyId?: string;
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateTaskInput {
  title: string;
  description?: string;
  status?: string;
  priority?: string;
  dueDate?: string;
  assignedTo?: string;
  participants?: string[];
  personId?: string;
  companyId?: string;
}

// ========== CLOZE MESSAGES ==========
export interface ClozeMessageOpenAbout {
  ip?: string;
  agent?: string;
  last?: number;
}

export interface ClozeMessageOpenBreakdown {
  date: number;
  cookie?: string;
}

export interface ClozeMessageOpen {
  about?: ClozeMessageOpenAbout;
  breakdown?: ClozeMessageOpenBreakdown[];
}

export interface ClozeMessage {
  id: string; // Added for table display (maps from message field)
  message: string;
  date: number;
  threadId: string;
  opens?: ClozeMessageOpen[];
}

export interface ClozeMessagesResponse {
  errorcode?: number;
  more: boolean;
  next?: string;
  messages: ClozeMessage[];
}

// ========== USER PROFILE (for auth) ==========
export interface UserProfile {
  id: string;
  name: string;
  email?: string;
  credentialId?: string;
  createdAt: string;
  lastUsed?: string;
}

// ========== RESOURCE STATE ==========
export interface ResourceState<T> {
  data: T[];
  loading: boolean;
  error: string | null;
  modalOpen: boolean;
}

// ========== API RESPONSE ==========
export interface ApiResponse<T> {
  [key: string]: T[];
}
