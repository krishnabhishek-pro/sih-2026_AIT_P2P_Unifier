export type UserRole =
  | 'SUPER_ADMIN'
  | 'SENIOR_OFFICIAL'
  | 'BUREAU_HEAD'
  | 'BUREAU_OFFICER'
  | 'REGIONAL_OFFICER';

export interface User {
  id: string;
  employeeId?: string | null;
  name: string;
  email: string;
  role: UserRole;
  designation: string;
  bureauId?: string | null;
  bureau?: {
    id: string;
    code: string;
    name: string;
  } | null;
  region?: string | null;
  phone?: string;
  avatar?: string;
  isActive?: boolean;
}

export interface Bureau {
  id: string;
  code: string; // AB, PAPB, RGRB, ROAC
  name: string;
  description: string;
  headName?: string;
  headEmail?: string;
  officersCount?: number;
  users?: User[];
  stats?: {
    total: number;
    resolved: number;
    pending: number;
    overdue: number;
    avgResolutionDays: number;
    resolutionRate: number;
  };
}

export interface Institution {
  id: string;
  aicteId: string;
  name: string;
  type: string;
  state: string;
  district: string;
  address: string;
  pinCode: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  website?: string;
  approvalYear: number;
  status: 'Active' | 'Under Scrutiny' | 'Suspended';
  totalComplaints: number;
  pendingComplaints: number;
  resolvedComplaints: number;
  _count?: {
    complaints: number;
    overlaps: number;
  };
}

export type ComplaintPriority = 'URGENT' | 'HIGH' | 'MEDIUM' | 'LOW';

export type ComplaintStatus =
  | 'PENDING'
  | 'UNDER_REVIEW'
  | 'ACTION_INITIATED'
  | 'SHOW_CAUSE_ISSUED'
  | 'COMMITTEE_HEARING'
  | 'RESOLVED'
  | 'CLOSED'
  | 'OVERDUE';

export interface ComplaintAction {
  id: string;
  complaintId: string;
  performedById?: string;
  performerName: string;
  performerRole: string;
  actionType: string;
  previousStatus?: string;
  newStatus?: string;
  remarks: string;
  createdAt: string;
}

export interface ComplaintDocument {
  id: string;
  complaintId: string;
  title: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSize: string;
  uploadedBy: string;
  createdAt: string;
}

export interface Complaint {
  id: string;
  complaintNo: string;
  institutionId: string;
  institution: {
    id: string;
    aicteId: string;
    name: string;
    state: string;
    district: string;
  };
  bureauId: string;
  bureau: {
    id: string;
    code: string;
    name: string;
  };
  assignedOfficerId?: string | null;
  assignedOfficer?: {
    id: string;
    name: string;
    email: string;
  } | null;
  complainantType: string;
  complainantName?: string;
  complainantEmail?: string;
  complainantPhone?: string;
  category: string;
  priority: ComplaintPriority;
  status: ComplaintStatus;
  title: string;
  description: string;
  dateReceived: string;
  dueDate: string;
  resolvedAt?: string | null;
  source: string;
  remarks?: string;
  crossBureauLinked: boolean;
  actions?: ComplaintAction[];
  documents?: ComplaintDocument[];
  originalOverlaps?: any[];
  relatedOverlaps?: any[];
  _count?: {
    actions: number;
    documents: number;
  };
}

export type OverlapStatus = 'POTENTIAL' | 'CONFIRMED' | 'REJECTED' | 'UNDER_REVIEW';

export interface CaseOverlap {
  id: string;
  originalComplaintId: string;
  relatedComplaintId: string;
  institutionId: string;
  institution: {
    id: string;
    aicteId: string;
    name: string;
    state: string;
    district: string;
  };
  originalBureauId: string;
  relatedBureauId: string;
  originalComplaint: Complaint;
  relatedComplaint: Complaint;
  matchScore: number;
  reasons: string[];
  status: OverlapStatus;
  reviewedById?: string;
  reviewedByName?: string;
  reviewedAt?: string;
  reviewDecisionRemarks?: string;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationItem {
  id: string;
  userId?: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  linkUrl?: string;
  createdAt: string;
}

export interface AuditLogItem {
  id: string;
  userId?: string;
  userName: string;
  userRole: string;
  action: string;
  entityType: string;
  entityId?: string;
  details: string;
  ipAddress: string;
  createdAt: string;
}

export interface DashboardStats {
  metrics: {
    totalComplaints: number;
    pendingComplaints: number;
    underReview: number;
    resolvedComplaints: number;
    overdueComplaints: number;
    potentialOverlaps: number;
    confirmedOverlaps: number;
  };
  trendData: Array<{ month: string; received: number; resolved: number; overdue: number }>;
  bureauDistribution: Array<{ bureauCode: string; bureauName: string; total: number; pending: number; resolved: number; overdue: number }>;
  statusDistribution: Array<{ name: string; value: number; color: string }>;
  recentComplaints: Complaint[];
  overlapAlerts: any[];
}
