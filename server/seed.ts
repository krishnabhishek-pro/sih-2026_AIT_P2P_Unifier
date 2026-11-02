import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export async function seedDatabase() {
  console.log('🌱 Starting database seeding for AICTE AUGMS (All data is fictional for demo/evaluation)...');

  // Clear existing records
  await prisma.auditLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.complaintDocument.deleteMany();
  await prisma.caseOverlap.deleteMany();
  await prisma.complaintAction.deleteMany();
  await prisma.complaint.deleteMany();
  await prisma.user.deleteMany();
  await prisma.bureau.deleteMany();
  await prisma.institution.deleteMany();

  // 1. Seed Bureaus
  const bureausData = [
    {
      code: 'AB',
      name: 'Approval Bureau',
      description: 'Handles institutional approvals, Extension of Approval (EoA), land/building physical norms compliance, and annual approvals.',
      headName: 'Dr. Ramesh Chandra Verma',
      headEmail: 'head.approval@aicte.gov.in',
    },
    {
      code: 'PAPB',
      name: 'Policy & Academic Planning Bureau',
      description: 'Oversees model curricula, syllabus standards, faculty qualification equivalence, research policies, and academic guidelines.',
      headName: 'Prof. Sunita Sundaram',
      headEmail: 'head.policy@aicte.gov.in',
    },
    {
      code: 'RGRB',
      name: 'Regulation & Grievance Redressal Bureau',
      description: 'Administers AICTE regulations, 7th CPC faculty pay scales, fee capitation restrictions, anti-ragging, and student/faculty rights.',
      headName: 'Dr. Anand K. Kulkarni',
      headEmail: 'head.grievance@aicte.gov.in',
    },
    {
      code: 'ROAC',
      name: 'Regional Office Affairs Cell',
      description: 'Coordinates AICTE regional offices (WRO, SRO, NRO, ERO, NWRO, SWRO), regional ombudsman monitoring, and spot inspections.',
      headName: 'Shri Vikramaditya Rathore',
      headEmail: 'head.regional@aicte.gov.in',
    },
  ];

  const bureaus: Record<string, any> = {};
  for (const b of bureausData) {
    bureaus[b.code] = await prisma.bureau.create({ data: b });
  }

  // 2. Seed Users
  const defaultPasswordHash = await bcrypt.hash('aicte@123', 10);

  const usersData = [
    {
      employeeId: 'AICTE/HQ/001',
      name: 'Dr. Abhay Jere',
      email: 'admin@aicte.gov.in',
      passwordHash: defaultPasswordHash,
      role: 'SUPER_ADMIN',
      designation: 'Chief Vigilance & Monitoring Officer',
      region: 'Central HQ (New Delhi)',
      phone: '+91-11-29581001',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    },
    {
      employeeId: 'AICTE/HQ/002',
      name: 'Prof. T. G. Sitharam',
      email: 'senior.official@aicte.gov.in',
      passwordHash: defaultPasswordHash,
      role: 'SENIOR_OFFICIAL',
      designation: 'Senior Monitoring Advisor',
      region: 'Central HQ (New Delhi)',
      phone: '+91-11-29581002',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    },
    {
      employeeId: 'AICTE/AB/010',
      name: 'Dr. Ramesh Chandra Verma',
      email: 'head.approval@aicte.gov.in',
      passwordHash: defaultPasswordHash,
      role: 'BUREAU_HEAD',
      designation: 'Adviser & Bureau Head - Approval',
      bureauId: bureaus['AB'].id,
      region: 'Central HQ (New Delhi)',
      phone: '+91-11-29581010',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    },
    {
      employeeId: 'AICTE/RGRB/020',
      name: 'Dr. Anand K. Kulkarni',
      email: 'head.grievance@aicte.gov.in',
      passwordHash: defaultPasswordHash,
      role: 'BUREAU_HEAD',
      designation: 'Adviser & Bureau Head - Regulation & Grievance',
      bureauId: bureaus['RGRB'].id,
      region: 'Central HQ (New Delhi)',
      phone: '+91-11-29581020',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
    },
    {
      employeeId: 'AICTE/PAPB/030',
      name: 'Prof. Sunita Sundaram',
      email: 'head.policy@aicte.gov.in',
      passwordHash: defaultPasswordHash,
      role: 'BUREAU_HEAD',
      designation: 'Bureau Head - Policy & Academic Planning',
      bureauId: bureaus['PAPB'].id,
      region: 'Central HQ (New Delhi)',
      phone: '+91-11-29581030',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
    },
    {
      employeeId: 'AICTE/ROAC/040',
      name: 'Shri Vikramaditya Rathore',
      email: 'head.regional@aicte.gov.in',
      passwordHash: defaultPasswordHash,
      role: 'BUREAU_HEAD',
      designation: 'Director - Regional Office Affairs',
      bureauId: bureaus['ROAC'].id,
      region: 'Central HQ (New Delhi)',
      phone: '+91-11-29581040',
      avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150',
    },
    {
      employeeId: 'AICTE/AB/050',
      name: 'Dr. Manoj Sharma',
      email: 'officer.sharma@aicte.gov.in',
      passwordHash: defaultPasswordHash,
      role: 'BUREAU_OFFICER',
      designation: 'Deputy Director - Approval Investigations',
      bureauId: bureaus['AB'].id,
      region: 'Northern Region',
      phone: '+91-11-29581050',
      avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150',
    },
    {
      employeeId: 'AICTE/RGRB/060',
      name: 'Smt. Priya Nair',
      email: 'officer.nair@aicte.gov.in',
      passwordHash: defaultPasswordHash,
      role: 'BUREAU_OFFICER',
      designation: 'Assistant Director - Grievance Redressal',
      bureauId: bureaus['RGRB'].id,
      region: 'Southern Region',
      phone: '+91-11-29581060',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150',
    },
    {
      employeeId: 'AICTE/PAPB/070',
      name: 'Dr. Rajesh Deshmukh',
      email: 'officer.deshmukh@aicte.gov.in',
      passwordHash: defaultPasswordHash,
      role: 'BUREAU_OFFICER',
      designation: 'Under Secretary - Academic Norms & Curriculum',
      bureauId: bureaus['PAPB'].id,
      region: 'Western Region',
      phone: '+91-11-29581070',
      avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150',
    },
    {
      employeeId: 'AICTE/ROAC/080',
      name: 'Shri Arvind Swaminathan',
      email: 'regional.south@aicte.gov.in',
      passwordHash: defaultPasswordHash,
      role: 'REGIONAL_OFFICER',
      designation: 'Regional Officer - Southern Region (Chennai/Bengaluru)',
      bureauId: bureaus['ROAC'].id,
      region: 'Southern Region',
      phone: '+91-44-22350101',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
    },
  ];

  const users: any[] = [];
  for (const u of usersData) {
    users.push(await prisma.user.create({ data: u }));
  }

  // 3. Seed 20 Fictional Institutions
  const institutionsData = [
    {
      aicteId: '1-332458901',
      name: 'Apex Institute of Technology & Management',
      type: 'Private/Self-Financing',
      state: 'Maharashtra',
      district: 'Pune',
      address: 'Plot 42, Hinjawadi Phase 2, IT Park Road',
      pinCode: '411057',
      contactPerson: 'Dr. Prakash S. Patil (Principal)',
      email: 'principal@apexinstitute.edu.in',
      phone: '+91-20-67123400',
      website: 'www.apexinstitute-demo.edu.in',
      approvalYear: 2004,
      status: 'Under Scrutiny',
    },
    {
      aicteId: '1-441298032',
      name: 'Vanguard College of Engineering',
      type: 'Autonomous',
      state: 'Karnataka',
      district: 'Bengaluru Urban',
      address: 'Outer Ring Road, Bellandur Post',
      pinCode: '560103',
      contactPerson: 'Prof. K. Venkatesh (Dean Academics)',
      email: 'dean@vanguard-engg.edu.in',
      phone: '+91-80-41982000',
      website: 'www.vanguard-engg-demo.edu.in',
      approvalYear: 1998,
      status: 'Active',
    },
    {
      aicteId: '1-558291044',
      name: 'Horizon Institute of Technology & Science',
      type: 'Private/Self-Financing',
      state: 'Telangana',
      district: 'Hyderabad',
      address: 'Gandipet Campus, Near Financial District',
      pinCode: '500075',
      contactPerson: 'Dr. M. Rama Rao (Director)',
      email: 'director@horizontech.edu.in',
      phone: '+91-40-23456780',
      website: 'www.horizontech-demo.edu.in',
      approvalYear: 2008,
      status: 'Under Scrutiny',
    },
    {
      aicteId: '1-669102941',
      name: 'Dronacharya Technical Campus',
      type: 'Private/Self-Financing',
      state: 'Uttar Pradesh',
      district: 'Gautam Buddha Nagar (Greater Noida)',
      address: 'Knowledge Park III, Institutional Area',
      pinCode: '201306',
      contactPerson: 'Dr. S. K. Gupta (Principal)',
      email: 'contact@dronacharyagc.edu.in',
      phone: '+91-120-2323456',
      website: 'www.dronacharyagc-demo.edu.in',
      approvalYear: 2006,
      status: 'Under Scrutiny',
    },
    {
      aicteId: '1-771829031',
      name: 'National Institute of Advanced Science & Polytechnic',
      type: 'Polytechnic',
      state: 'Tamil Nadu',
      district: 'Chennai',
      address: 'GST Road, Tambaram Sanatorium',
      pinCode: '600047',
      contactPerson: 'Er. R. Soundararajan (Principal)',
      email: 'principal@niaspoly.edu.in',
      phone: '+91-44-22441122',
      website: 'www.niaspoly-demo.edu.in',
      approvalYear: 1995,
      status: 'Active',
    },
    {
      aicteId: '1-882910432',
      name: 'Imperial College of Engineering & Research',
      type: 'Private/Self-Financing',
      state: 'Gujarat',
      district: 'Ahmedabad',
      address: 'SG Highway, Bodakdev',
      pinCode: '380054',
      contactPerson: 'Dr. B. K. Patel (Director)',
      email: 'director@imperial-research.edu.in',
      phone: '+91-79-40012233',
      website: 'www.imperial-research-demo.edu.in',
      approvalYear: 2011,
      status: 'Active',
    },
    {
      aicteId: '1-993820121',
      name: 'Malabar Academy of Technical Education',
      type: 'Private/Self-Financing',
      state: 'Kerala',
      district: 'Kozhikode',
      address: 'Mavoor Road, Medical College Post',
      pinCode: '673008',
      contactPerson: 'Prof. K. P. Nambiar',
      email: 'office@malabaracademy.edu.in',
      phone: '+91-495-2345678',
      website: 'www.malabaracademy-demo.edu.in',
      approvalYear: 2002,
      status: 'Active',
    },
    {
      aicteId: '1-102938475',
      name: 'Bhartiya Vidya Technical University Institute',
      type: 'Deemed University',
      state: 'Maharashtra',
      district: 'Mumbai Suburban',
      address: 'Munshi Nagar, Andheri West',
      pinCode: '400058',
      contactPerson: 'Dr. Arvind Joshi (Registrar)',
      email: 'registrar@bvidyatech.edu.in',
      phone: '+91-22-26232145',
      website: 'www.bvidyatech-demo.edu.in',
      approvalYear: 1988,
      status: 'Active',
    },
    {
      aicteId: '1-213049586',
      name: 'Kalinga Institute of Technology & Poly',
      type: 'Private/Self-Financing',
      state: 'Odisha',
      district: 'Bhubaneswar',
      address: 'Patia, Chandaka Industrial Estate',
      pinCode: '751024',
      contactPerson: 'Dr. S. Mohapatra',
      email: 'contact@kalingatech.edu.in',
      phone: '+91-674-2725113',
      website: 'www.kalingatech-demo.edu.in',
      approvalYear: 2005,
      status: 'Active',
    },
    {
      aicteId: '1-324150697',
      name: 'Jaipur Technical Institute',
      type: 'Private/Self-Financing',
      state: 'Rajasthan',
      district: 'Jaipur',
      address: 'RIICO Institutional Area, Sitapura',
      pinCode: '302022',
      contactPerson: 'Dr. Neeraj Sharma',
      email: 'info@jaipurtech.edu.in',
      phone: '+91-141-2770123',
      website: 'www.jaipurtech-demo.edu.in',
      approvalYear: 2007,
      status: 'Active',
    },
    {
      aicteId: '1-435261708',
      name: 'Government College of Engineering & Technology',
      type: 'Government',
      state: 'West Bengal',
      district: 'Kolkata',
      address: 'Sector III, Salt Lake City',
      pinCode: '700098',
      contactPerson: 'Dr. Debabrata Roy (Principal)',
      email: 'principal@gcet-wb.gov.in',
      phone: '+91-33-23356789',
      website: 'www.gcet-wb-demo.gov.in',
      approvalYear: 1978,
      status: 'Active',
    },
    {
      aicteId: '1-546372819',
      name: 'Sardar Patel Institute of Applied Technology',
      type: 'Autonomous',
      state: 'Madhya Pradesh',
      district: 'Bhopal',
      address: 'Raisen Road, Anand Nagar',
      pinCode: '462021',
      contactPerson: 'Prof. Alok Saxena',
      email: 'director@spiatbhopal.edu.in',
      phone: '+91-755-4098765',
      website: 'www.spiatbhopal-demo.edu.in',
      approvalYear: 2001,
      status: 'Active',
    },
    {
      aicteId: '1-657483920',
      name: 'Sri Krishna Devaraya Engineering College',
      type: 'Private/Self-Financing',
      state: 'Andhra Pradesh',
      district: 'Visakhapatnam',
      address: 'Madhurawada, NH-16',
      pinCode: '530048',
      contactPerson: 'Dr. C. V. Raman Murthy',
      email: 'principal@skdecol.edu.in',
      phone: '+91-891-2895678',
      website: 'www.skdecol-demo.edu.in',
      approvalYear: 2003,
      status: 'Active',
    },
    {
      aicteId: '1-768594031',
      name: 'Punjab Polytechnic & Skill College',
      type: 'Polytechnic',
      state: 'Punjab',
      district: 'Ludhiana',
      address: 'Gill Road, Industrial Focal Point',
      pinCode: '141006',
      contactPerson: 'Er. Gurpreet Singh',
      email: 'info@punjabpoly.edu.in',
      phone: '+91-161-2490123',
      website: 'www.punjabpoly-demo.edu.in',
      approvalYear: 1999,
      status: 'Active',
    },
    {
      aicteId: '1-879605142',
      name: 'Chanakya School of Management & Technology',
      type: 'Private/Self-Financing',
      state: 'Bihar',
      district: 'Patna',
      address: 'Bailey Road, Khagaul Area',
      pinCode: '801105',
      contactPerson: 'Dr. Sanjay K. Jha',
      email: 'dean@chanakyamgmt.edu.in',
      phone: '+91-612-2589012',
      website: 'www.chanakyamgmt-demo.edu.in',
      approvalYear: 2012,
      status: 'Active',
    },
    {
      aicteId: '1-980716253',
      name: 'Rani Chennamma Technical Campus',
      type: 'Private/Self-Financing',
      state: 'Karnataka',
      district: 'Belagavi',
      address: 'Udyambag Industrial Suburb',
      pinCode: '590008',
      contactPerson: 'Dr. Vinay Hegde',
      email: 'principal@ranichennammatech.edu.in',
      phone: '+91-831-2456789',
      website: 'www.ranichennammatech-demo.edu.in',
      approvalYear: 2009,
      status: 'Active',
    },
    {
      aicteId: '1-091827364',
      name: 'Cauvery Valley College of Engineering',
      type: 'Private/Self-Financing',
      state: 'Tamil Nadu',
      district: 'Coimbatore',
      address: 'Avinashi Road, Peelamedu',
      pinCode: '641004',
      contactPerson: 'Dr. Meenakshi Sundaram',
      email: 'info@cauveryvalley.edu.in',
      phone: '+91-422-2578901',
      website: 'www.cauveryvalley-demo.edu.in',
      approvalYear: 2005,
      status: 'Active',
    },
    {
      aicteId: '1-192837465',
      name: 'Aravali Engineering College',
      type: 'Private/Self-Financing',
      state: 'Haryana',
      district: 'Faridabad',
      address: 'Sector 88, Greater Faridabad Expressway',
      pinCode: '121002',
      contactPerson: 'Prof. Anil Chaudhry',
      email: 'contact@aravali-engg.edu.in',
      phone: '+91-129-4100200',
      website: 'www.aravali-engg-demo.edu.in',
      approvalYear: 2010,
      status: 'Active',
    },
    {
      aicteId: '1-293847566',
      name: 'Deccan Institute of Pharmacy & Technology',
      type: 'Private/Self-Financing',
      state: 'Maharashtra',
      district: 'Nashik',
      address: 'Gangapur Road, Someshwar',
      pinCode: '422013',
      contactPerson: 'Dr. Savita Deshpande',
      email: 'principal@deccanpharm.edu.in',
      phone: '+91-253-2340987',
      website: 'www.deccanpharm-demo.edu.in',
      approvalYear: 2007,
      status: 'Active',
    },
    {
      aicteId: '1-394857677',
      name: 'Assam Hills Institute of Technical Sciences',
      type: 'Government',
      state: 'Assam',
      district: 'Guwahati (Kamrup Metro)',
      address: 'Jalukbari, NH-37 Bypass',
      pinCode: '781014',
      contactPerson: 'Dr. Bipul Barua',
      email: 'principal@assamtech.gov.in',
      phone: '+91-361-2678901',
      website: 'www.assamtech-demo.gov.in',
      approvalYear: 1985,
      status: 'Active',
    },
  ];

  const institutions: Record<string, any> = {};
  for (const inst of institutionsData) {
    institutions[inst.aicteId] = await prisma.institution.create({ data: inst });
  }

  // 4. Seed 50 Complaints with Deliberate Cross-Bureau Overlaps!
  // Overlap Scenario 1:
  // Apex Institute of Technology & Management (1-332458901)
  // - Complaint 1 (AB): Fake faculty list during EoA inspection, ghost faculty not on payroll
  // - Complaint 2 (RGRB): Faculty salary non-payment for 7 months, arbitrary termination of 12 faculty members
  // -> MATCH SCORE: 96% (Same Institution + Cross Bureau + Connected Faculty Category & Ghost/Salary Keywords)

  // Overlap Scenario 2:
  // Horizon Institute of Technology & Science (1-558291044)
  // - Complaint 3 (RGRB): Demanding ₹4,00,000 cash capitation fee for CSE admissions, refusing fee receipt
  // - Complaint 4 (AB): Excess intake of 60 unapproved seats in AI/ML branch without AICTE approval
  // -> MATCH SCORE: 92% (Same Institution + Cross Bureau + Excess Admission/Capitation Link)

  // Overlap Scenario 3:
  // Dronacharya Technical Campus (1-669102941)
  // - Complaint 5 (RGRB): Withholding original 10th and 12th certificates and demanding penalty for college transfer
  // - Complaint 6 (ROAC): Failure to refund admission caution deposit after seat cancellation within AICTE guidelines
  // -> MATCH SCORE: 88% (Same Institution + Cross Bureau + Student Certificate/Refund Non-compliance)

  // Overlap Scenario 4:
  // Vanguard College of Engineering (1-441298032)
  // - Complaint 7 (PAPB): Conducting unapproved evening diploma shifts and substandard practical lab facilities
  // - Complaint 8 (AB): Construction of Block C without fire safety clearance and missing requisite core laboratory equipment
  // -> MATCH SCORE: 85% (Same Institution + Cross Bureau + Infrastructure & Unapproved Shifts)

  const rawComplaints = [
    // --- Overlap Pair 1 (Apex Institute) ---
    {
      complaintNo: 'AICTE/GRV/2026/0001',
      aicteId: '1-332458901',
      bureauCode: 'AB',
      category: 'Unapproved Intake & Courses',
      priority: 'URGENT',
      status: 'UNDER_REVIEW',
      title: 'Submission of fraudulent ghost faculty list for Extension of Approval (EoA) 2025-26',
      description: 'The management has submitted names of 18 PhD faculty members on AICTE portal who do not exist on the institutional payroll or attendance register. Ghost faculty names were used to claim 1:15 faculty-student ratio during annual EoA verification.',
      complainantType: 'Whistleblower',
      source: 'DIRECT_PORTAL',
      daysAgo: 14,
      dueInDays: 16,
      assignedOfficerEmail: 'officer.sharma@aicte.gov.in',
      remarks: 'Preliminary inspection report requested from Regional Office.',
      crossBureauLinked: true,
    },
    {
      complaintNo: 'AICTE/GRV/2026/0002',
      aicteId: '1-332458901',
      bureauCode: 'RGRB',
      category: 'Faculty Salary & Service Matters',
      priority: 'URGENT',
      status: 'SHOW_CAUSE_ISSUED',
      title: 'Non-payment of 7th CPC faculty salaries for 7 months and illegal service termination',
      description: 'Faculty Association petition stating 42 regular assistant professors have not received salaries since August 2025. Upon raising grievance to management, 12 faculty members were served arbitrary termination letters without notice or inquiry.',
      complainantType: 'Faculty',
      source: 'CPGRAMS',
      daysAgo: 10,
      dueInDays: 5,
      assignedOfficerEmail: 'officer.nair@aicte.gov.in',
      remarks: 'Show Cause notice issued ref AICTE/RGRB/2026/SC-88. Hearing scheduled.',
      crossBureauLinked: true,
    },

    // --- Overlap Pair 2 (Horizon Institute) ---
    {
      complaintNo: 'AICTE/GRV/2026/0003',
      aicteId: '1-558291044',
      bureauCode: 'RGRB',
      category: 'Excess Fee & Capitation',
      priority: 'HIGH',
      status: 'ACTION_INITIATED',
      title: 'Extortion of ₹4,00,000 cash capitation fee for B.Tech Computer Science management quota',
      description: 'Multiple parents report college administration demanding ₹4,00,000 cash per student over and above Telangana State Fee Regulatory Committee prescribed fee, refusing to issue official receipts for the development fund component.',
      complainantType: 'Parent',
      source: 'CPGRAMS',
      daysAgo: 22,
      dueInDays: 8,
      assignedOfficerEmail: 'officer.nair@aicte.gov.in',
      remarks: 'Forwarded to State Fee Regulatory Committee for joint audit.',
      crossBureauLinked: true,
    },
    {
      complaintNo: 'AICTE/GRV/2026/0004',
      aicteId: '1-558291044',
      bureauCode: 'AB',
      category: 'Unapproved Intake & Courses',
      priority: 'HIGH',
      status: 'UNDER_REVIEW',
      title: 'Unapproved extra intake of 60 seats in Artificial Intelligence & Machine Learning',
      description: 'Institution admitted 180 students against approved intake of 120 in B.Tech AIML. Management admitting extra students on pretext of future approval regularization without AICTE Executive Committee sanction.',
      complainantType: 'Public',
      source: 'RTI',
      daysAgo: 18,
      dueInDays: 12,
      assignedOfficerEmail: 'officer.sharma@aicte.gov.in',
      remarks: 'Sanction letter records being verified against Council portal admission records.',
      crossBureauLinked: true,
    },

    // --- Overlap Pair 3 (Dronacharya Technical Campus) ---
    {
      complaintNo: 'AICTE/GRV/2026/0005',
      aicteId: '1-669102941',
      bureauCode: 'RGRB',
      category: 'Harassment & Victimization',
      priority: 'HIGH',
      status: 'PENDING',
      title: 'Illegal retention of original qualifying degree certificates and refusal of NOC for transfer',
      description: 'Students applying for lateral migration or withdrawal are denied original Class 10th and 12th marksheets unless they pay full four-year course fees as penalty in violation of AICTE Approval Process Handbook Clause 8.2.',
      complainantType: 'Student',
      source: 'DIRECT_PORTAL',
      daysAgo: 5,
      dueInDays: 25,
      assignedOfficerEmail: 'officer.nair@aicte.gov.in',
      remarks: 'Under initial scrutiny by RGRB desk officer.',
      crossBureauLinked: true,
    },
    {
      complaintNo: 'AICTE/GRV/2026/0006',
      aicteId: '1-669102941',
      bureauCode: 'ROAC',
      category: 'Admission Irregularities',
      priority: 'MEDIUM',
      status: 'UNDER_REVIEW',
      title: 'Arbitrary deduction of 60% admission fees upon cancellation before stipulated AICTE cutoff',
      description: 'Northern Regional Office received complaint against Dronacharya Technical Campus regarding non-compliance with AICTE circular on 100% refund of fees minus ₹1,000 processing fee on withdrawal before cutoff date.',
      complainantType: 'Parent',
      source: 'REGIONAL_OFFICE',
      daysAgo: 8,
      dueInDays: 22,
      assignedOfficerEmail: 'regional.south@aicte.gov.in',
      remarks: 'Regional Director issued inquiry letter to campus director.',
      crossBureauLinked: true,
    },

    // --- Overlap Pair 4 (Vanguard College of Engineering) ---
    {
      complaintNo: 'AICTE/GRV/2026/0007',
      aicteId: '1-441298032',
      bureauCode: 'PAPB',
      category: 'Infrastructure Deficiencies',
      priority: 'MEDIUM',
      status: 'UNDER_REVIEW',
      title: 'Operating unapproved evening polytechnic shift without dedicated faculty or lab provisions',
      description: 'Autonomous college utilizing existing day-college laboratories in evening hours for unapproved diploma programs, violating curriculum guidelines, minimum laboratory contact hours, and safety norms.',
      complainantType: 'Faculty',
      source: 'DIRECT_PORTAL',
      daysAgo: 19,
      dueInDays: 11,
      assignedOfficerEmail: 'officer.deshmukh@aicte.gov.in',
      remarks: 'Academic council syllabus compliance report awaited.',
      crossBureauLinked: true,
    },
    {
      complaintNo: 'AICTE/GRV/2026/0008',
      aicteId: '1-441298032',
      bureauCode: 'AB',
      category: 'Infrastructure Deficiencies',
      priority: 'HIGH',
      status: 'ACTION_INITIATED',
      title: 'Non-compliance of Fire Safety Clearance and inadequate CAD/CAM laboratory infrastructure',
      description: 'Physical inspection team found Block C building operating without Fire NOC renewal since 2024. Mechanical CAD/CAM lab licensed software licenses expired and only 12 workstations available for 180 enrolled students.',
      complainantType: 'Public',
      source: 'COURT_ORDER',
      daysAgo: 25,
      dueInDays: 5,
      assignedOfficerEmail: 'officer.sharma@aicte.gov.in',
      remarks: 'Hon’ble High Court writ petition status review required within 15 days.',
      crossBureauLinked: true,
    },

    // --- 42 More Realistic Fictional Complaints Across Various Institutions ---
    {
      complaintNo: 'AICTE/GRV/2026/0009',
      aicteId: '1-771829031',
      bureauCode: 'RGRB',
      category: 'Harassment & Victimization',
      priority: 'URGENT',
      status: 'COMMITTEE_HEARING',
      title: 'Allegation of mental harassment and denial of internal grievance redressal committee access',
      description: 'Final year diploma student lodged formal complaint of systematic harassment by HOD and refusal of institute administration to convene the mandatory Internal Complaint Committee (ICC).',
      complainantType: 'Student',
      source: 'DIRECT_PORTAL',
      daysAgo: 35,
      dueInDays: -5, // OVERDUE
      assignedOfficerEmail: 'officer.nair@aicte.gov.in',
      remarks: 'Hearing date scheduled before Standing Grievance Committee.',
      crossBureauLinked: false,
    },
    {
      complaintNo: 'AICTE/GRV/2026/0010',
      aicteId: '1-882910432',
      bureauCode: 'AB',
      category: 'Infrastructure Deficiencies',
      priority: 'MEDIUM',
      status: 'RESOLVED',
      title: 'Inadequate barrier-free ramp and lift facilities for Persons with Disabilities (PwD)',
      description: 'Inspection revealed missing elevators and ramps for wheelchair access in academic Block A and central library. Rectification compliance submitted by college with photographic evidence.',
      complainantType: 'Public',
      source: 'DIRECT_PORTAL',
      daysAgo: 60,
      dueInDays: -30,
      assignedOfficerEmail: 'officer.sharma@aicte.gov.in',
      remarks: 'Compliance accepted. Physical verification completed by Regional Office.',
      crossBureauLinked: false,
    },
    {
      complaintNo: 'AICTE/GRV/2026/0011',
      aicteId: '1-993820121',
      bureauCode: 'RGRB',
      category: 'Faculty Salary & Service Matters',
      priority: 'HIGH',
      status: 'ACTION_INITIATED',
      title: 'Denial of maternity benefits and deduction of salary during approved leave period',
      description: 'Assistant Professor with 6 years service denied paid maternity leave under Maternity Benefit Act 2017 and subjected to threat of service disruption by management.',
      complainantType: 'Faculty',
      source: 'CPGRAMS',
      daysAgo: 16,
      dueInDays: 14,
      assignedOfficerEmail: 'officer.nair@aicte.gov.in',
      remarks: 'Direct directive issued to Chairman of trust to restore salary arrears.',
      crossBureauLinked: false,
    },
    {
      complaintNo: 'AICTE/GRV/2026/0012',
      aicteId: '1-102938475',
      bureauCode: 'PAPB',
      category: 'Admission Irregularities',
      priority: 'MEDIUM',
      status: 'PENDING',
      title: 'Failure to implement NEP 2020 multiple entry and exit credit transfer mechanism',
      description: 'Institute refusing Academic Bank of Credits (ABC) ID transfer for students wishing to migrate after second year to another accredited university.',
      complainantType: 'Student',
      source: 'DIRECT_PORTAL',
      daysAgo: 4,
      dueInDays: 26,
      assignedOfficerEmail: 'officer.deshmukh@aicte.gov.in',
      remarks: 'Clarification sought from Controller of Examinations.',
      crossBureauLinked: false,
    },
    {
      complaintNo: 'AICTE/GRV/2026/0013',
      aicteId: '1-213049586',
      bureauCode: 'AB',
      category: 'Unapproved Intake & Courses',
      priority: 'HIGH',
      status: 'SHOW_CAUSE_ISSUED',
      title: 'Offering unapproved postgraduate diploma course in Industrial Safety without AICTE mandate',
      description: 'Institute publishing brochures and enrolling students in 1-year PG Diploma in Industrial Safety which is neither recognized by AICTE nor affiliated to state technical board.',
      complainantType: 'Public',
      source: 'RTI',
      daysAgo: 28,
      dueInDays: 2,
      assignedOfficerEmail: 'officer.sharma@aicte.gov.in',
      remarks: 'Notice issued under Section 10(k) of AICTE Act 1987.',
      crossBureauLinked: false,
    },
    {
      complaintNo: 'AICTE/GRV/2026/0014',
      aicteId: '1-324150697',
      bureauCode: 'RGRB',
      category: 'Excess Fee & Capitation',
      priority: 'MEDIUM',
      status: 'UNDER_REVIEW',
      title: 'Forced payment of ₹25,000 annual library and Wi-Fi amenity fee despite online examinations',
      description: 'Students forced to pay mandatory miscellaneous fees under threat of debarment from semester examination admit cards.',
      complainantType: 'Student',
      source: 'DIRECT_PORTAL',
      daysAgo: 12,
      dueInDays: 18,
      assignedOfficerEmail: 'officer.nair@aicte.gov.in',
      remarks: 'Management asked to provide itemized fee breakup.',
      crossBureauLinked: false,
    },
    {
      complaintNo: 'AICTE/GRV/2026/0015',
      aicteId: '1-435261708',
      bureauCode: 'PAPB',
      category: 'Infrastructure Deficiencies',
      priority: 'LOW',
      status: 'RESOLVED',
      title: 'Shortage of subscribed IEEE/ScienceDirect journals in departmental digital library',
      description: 'PG research scholars reported lack of active access to mandatory national/international e-journal databases.',
      complainantType: 'Student',
      source: 'DIRECT_PORTAL',
      daysAgo: 45,
      dueInDays: -15,
      assignedOfficerEmail: 'officer.deshmukh@aicte.gov.in',
      remarks: 'State technical university renewed e-shodh sindhu consortium access.',
      crossBureauLinked: false,
    },
    {
      complaintNo: 'AICTE/GRV/2026/0016',
      aicteId: '1-546372819',
      bureauCode: 'ROAC',
      category: 'Admission Irregularities',
      priority: 'MEDIUM',
      status: 'UNDER_REVIEW',
      title: 'Discrepancy in Centralized Admission Counseling vacancy seat matrix reporting',
      description: 'Allegation that institute concealed 15 vacant seats in Computer Science to convert them to institutional level quota after round 3.',
      complainantType: 'Whistleblower',
      source: 'REGIONAL_OFFICE',
      daysAgo: 9,
      dueInDays: 21,
      assignedOfficerEmail: 'regional.south@aicte.gov.in',
      remarks: 'Central regional officer conducting data audit.',
      crossBureauLinked: false,
    },
    {
      complaintNo: 'AICTE/GRV/2026/0017',
      aicteId: '1-657483920',
      bureauCode: 'RGRB',
      category: 'Faculty Salary & Service Matters',
      priority: 'URGENT',
      status: 'UNDER_REVIEW',
      title: 'Non-disbursement of DA increments and PF contribution deposits for past 18 months',
      description: 'Provident Fund commissioner notice forwarded indicating ₹1.2 Crore employer PF default while salaries remain frozen at pre-2016 rates.',
      complainantType: 'Faculty',
      source: 'CPGRAMS',
      daysAgo: 20,
      dueInDays: 10,
      assignedOfficerEmail: 'officer.nair@aicte.gov.in',
      remarks: 'EPFO verification requested.',
      crossBureauLinked: false,
    },
    {
      complaintNo: 'AICTE/GRV/2026/0018',
      aicteId: '1-768594031',
      bureauCode: 'AB',
      category: 'Infrastructure Deficiencies',
      priority: 'HIGH',
      status: 'OVERDUE',
      title: 'Encroachment of mandated institutional playground and green area for commercial parking',
      description: 'Inspection revealed 2.5 acres of designated sports ground converted into commercial transport parking without municipal or AICTE approval.',
      complainantType: 'Public',
      source: 'COURT_ORDER',
      daysAgo: 42,
      dueInDays: -12,
      assignedOfficerEmail: 'officer.sharma@aicte.gov.in',
      remarks: 'Overdue. Second notice pending dispatch.',
      crossBureauLinked: false,
    },
    {
      complaintNo: 'AICTE/GRV/2026/0019',
      aicteId: '1-879605142',
      bureauCode: 'RGRB',
      category: 'Harassment & Victimization',
      priority: 'HIGH',
      status: 'COMMITTEE_HEARING',
      title: 'Anti-Ragging committee inaction regarding senior hostel intimidation incident',
      description: 'First year MBA student lodged ragging grievance. College Anti-Ragging squad failed to file FIR within 24 hours as mandated by Hon’ble Supreme Court directives.',
      complainantType: 'Parent',
      source: 'DIRECT_PORTAL',
      daysAgo: 11,
      dueInDays: 4,
      assignedOfficerEmail: 'officer.nair@aicte.gov.in',
      remarks: 'National Anti-Ragging Monitoring Agency alerted. Hearing in progress.',
      crossBureauLinked: false,
    },
    {
      complaintNo: 'AICTE/GRV/2026/0020',
      aicteId: '1-980716253',
      bureauCode: 'PAPB',
      category: 'Faculty Salary & Service Matters',
      priority: 'LOW',
      status: 'RESOLVED',
      title: 'Lack of PhD research seed grant distribution from AICTE sanctioned MODROBS scheme',
      description: 'Research scholars complained of administrative delays in procuring spectrometer equipment under sanctioned funding.',
      complainantType: 'Faculty',
      source: 'DIRECT_PORTAL',
      daysAgo: 50,
      dueInDays: -20,
      assignedOfficerEmail: 'officer.deshmukh@aicte.gov.in',
      remarks: 'Fund utilization certificate submitted and verified.',
      crossBureauLinked: false,
    },
    {
      complaintNo: 'AICTE/GRV/2026/0021',
      aicteId: '1-091827364',
      bureauCode: 'AB',
      category: 'Unapproved Intake & Courses',
      priority: 'MEDIUM',
      status: 'PENDING',
      title: 'Closure of Civil Engineering branch without fulfilling teach-out commitments for 3rd year students',
      description: 'College abruptly discontinued faculty recruitment for Civil department, leaving enrolled 3rd and 4th year batches without specialized elective professors.',
      complainantType: 'Student',
      source: 'DIRECT_PORTAL',
      daysAgo: 6,
      dueInDays: 24,
      assignedOfficerEmail: 'officer.sharma@aicte.gov.in',
      remarks: 'Teach-out plan demanded from Dean.',
      crossBureauLinked: false,
    },
    {
      complaintNo: 'AICTE/GRV/2026/0022',
      aicteId: '1-192837465',
      bureauCode: 'RGRB',
      category: 'Excess Fee & Capitation',
      priority: 'URGENT',
      status: 'SHOW_CAUSE_ISSUED',
      title: 'Demand of ₹1,50,000 for granting internal assessment and attendance clearance for semester finals',
      description: 'Serious allegation by final year students regarding HOD demanding monetary payments to condone attendance shortages below 75%.',
      complainantType: 'Student',
      source: 'WHISTLEBLOWER',
      daysAgo: 13,
      dueInDays: 2,
      assignedOfficerEmail: 'officer.nair@aicte.gov.in',
      remarks: 'Vigilance inquiry initiated. Fact-finding committee deputed.',
      crossBureauLinked: false,
    },
    {
      complaintNo: 'AICTE/GRV/2026/0023',
      aicteId: '1-293847566',
      bureauCode: 'AB',
      category: 'Infrastructure Deficiencies',
      priority: 'HIGH',
      status: 'UNDER_REVIEW',
      title: 'Deficient machine room and animal house facilities for Pharmacy diploma validation',
      description: 'PCI and AICTE joint norms violation regarding lack of climate-controlled pharmaceutical formulation laboratory.',
      complainantType: 'Public',
      source: 'DIRECT_PORTAL',
      daysAgo: 15,
      dueInDays: 15,
      assignedOfficerEmail: 'officer.sharma@aicte.gov.in',
      remarks: 'Inspection team appointed for spot audit.',
      crossBureauLinked: false,
    },
    {
      complaintNo: 'AICTE/GRV/2026/0024',
      aicteId: '1-394857677',
      bureauCode: 'ROAC',
      category: 'Faculty Salary & Service Matters',
      priority: 'MEDIUM',
      status: 'RESOLVED',
      title: 'Delays in reimbursement of AICTE Quality Improvement Program (QIP) travel stipends',
      description: 'Faculty deputed for doctoral coursework in IIT Guwahati faced 9-month administrative hold on approved travel grants.',
      complainantType: 'Faculty',
      source: 'DIRECT_PORTAL',
      daysAgo: 70,
      dueInDays: -40,
      assignedOfficerEmail: 'regional.south@aicte.gov.in',
      remarks: 'Finance officer cleared all outstanding bills.',
      crossBureauLinked: false,
    },
  ];

  // Generate additional complaints programmatically up to 50
  const complaintTitles = [
    { title: 'Non-refund of hostel deposit upon early vacating due to academic internship', cat: 'Excess Fee & Capitation', b: 'RGRB', pri: 'LOW' },
    { title: 'Unqualified adjunct lecturers conducting master degree core lectures', cat: 'Faculty Salary & Service Matters', b: 'PAPB', pri: 'MEDIUM' },
    { title: 'Failure to provide safe drinking water and functional sanitation in girls hostel', cat: 'Infrastructure Deficiencies', b: 'AB', pri: 'HIGH' },
    { title: 'Refusal to issue migration certificate after completion of course without backlog', cat: 'Admission Irregularities', b: 'ROAC', pri: 'MEDIUM' },
    { title: 'Misleading placement statistics and fake recruitment offers published on prospectus', cat: 'Harassment & Victimization', b: 'RGRB', pri: 'MEDIUM' },
    { title: 'Non-constitution of Student Grievance Redressal Committee (SGRC) on campus', cat: 'Admission Irregularities', b: 'RGRB', pri: 'HIGH' },
    { title: 'Delay in forwarding National Scholarship Portal (NSP) post-matric verification forms', cat: 'Admission Irregularities', b: 'ROAC', pri: 'URGENT' },
    { title: 'Sub-letting college premises for non-educational commercial exhibitions during semesters', cat: 'Infrastructure Deficiencies', b: 'AB', pri: 'MEDIUM' },
    { title: 'Arbitrary grading and non-disclosure of internal mid-semester answer scripts', cat: 'Admission Irregularities', b: 'PAPB', pri: 'LOW' },
    { title: 'Illegal deduction of 1 day salary every month under unauthorized welfare trust fund', cat: 'Faculty Salary & Service Matters', b: 'RGRB', pri: 'HIGH' },
    { title: 'Operating unapproved distance-learning MCA programs in collaboration with overseas entity', cat: 'Unapproved Intake & Courses', b: 'AB', pri: 'URGENT' },
    { title: 'Overcrowded classrooms exceeding AICTE square meter per student space specifications', cat: 'Infrastructure Deficiencies', b: 'AB', pri: 'MEDIUM' },
    { title: 'Failure to provide mandatory medical room and qualified nurse on campus', cat: 'Infrastructure Deficiencies', b: 'RGRB', pri: 'LOW' },
  ];

  const instIds = Object.keys(institutions);
  for (let i = 25; i <= 50; i++) {
    const t = complaintTitles[(i - 25) % complaintTitles.length];
    const instAicteId = instIds[(i * 3) % instIds.length];
    const daysAgo = (i * 2) % 45 + 3;
    const dueInDays = 30 - daysAgo;
    let status = 'UNDER_REVIEW';
    if (dueInDays < 0) status = 'OVERDUE';
    else if (i % 7 === 0) status = 'RESOLVED';
    else if (i % 5 === 0) status = 'ACTION_INITIATED';
    else if (i % 3 === 0) status = 'PENDING';

    rawComplaints.push({
      complaintNo: `AICTE/GRV/2026/00${i < 10 ? '0' + i : i}`,
      aicteId: instAicteId,
      bureauCode: t.b,
      category: t.cat,
      priority: t.pri,
      status: status,
      title: `${t.title} [Ref-${i}]`,
      description: `Comprehensive formal representation received regarding ${t.title.toLowerCase()}. Multiple affected parties submitted documentary evidence regarding breach of AICTE regulatory mandates.`,
      complainantType: i % 2 === 0 ? 'Student' : 'Faculty',
      source: i % 3 === 0 ? 'CPGRAMS' : (i % 4 === 0 ? 'RTI' : 'DIRECT_PORTAL'),
      daysAgo: daysAgo,
      dueInDays: dueInDays,
      assignedOfficerEmail: t.b === 'AB' ? 'officer.sharma@aicte.gov.in' : (t.b === 'RGRB' ? 'officer.nair@aicte.gov.in' : 'officer.deshmukh@aicte.gov.in'),
      remarks: 'Matter assigned for preliminary verification.',
      crossBureauLinked: false,
    });
  }

  const createdComplaints: Record<string, any> = {};

  for (const c of rawComplaints) {
    const inst = institutions[c.aicteId];
    const bureau = bureaus[c.bureauCode];
    const officer = users.find(u => u.email === c.assignedOfficerEmail);

    const dateRec = new Date(Date.now() - c.daysAgo * 24 * 60 * 60 * 1000);
    const dateDue = new Date(Date.now() + c.dueInDays * 24 * 60 * 60 * 1000);

    const comp = await prisma.complaint.create({
      data: {
        complaintNo: c.complaintNo,
        institutionId: inst.id,
        bureauId: bureau.id,
        assignedOfficerId: officer ? officer.id : null,
        complainantType: c.complainantType,
        complainantName: c.complainantType === 'Whistleblower' ? 'Protected Whistleblower (AICTE Sec. 12)' : `Complainant ${c.complaintNo.slice(-4)}`,
        complainantEmail: `complainant.${c.complaintNo.slice(-4)}@gmail.com`,
        complainantPhone: '+91-98' + Math.floor(10000000 + Math.random() * 90000000),
        category: c.category,
        priority: c.priority,
        status: c.status,
        title: c.title,
        description: c.description,
        dateReceived: dateRec,
        dueDate: dateDue,
        resolvedAt: c.status === 'RESOLVED' ? new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) : null,
        source: c.source,
        remarks: c.remarks,
        crossBureauLinked: c.crossBureauLinked,
      },
    });

    createdComplaints[c.complaintNo] = comp;

    // Create Initial Action / Timeline entry
    await prisma.complaintAction.create({
      data: {
        complaintId: comp.id,
        performedById: officer ? officer.id : null,
        performerName: officer ? officer.name : 'System Inward Desk',
        performerRole: officer ? officer.role : 'SUPER_ADMIN',
        actionType: 'STATUS_UPDATE',
        previousStatus: 'NEW_INWARD',
        newStatus: comp.status,
        remarks: c.remarks || 'Case registered and queued for bureau review.',
        createdAt: dateRec,
      },
    });

    // Create Document sample
    await prisma.complaintDocument.create({
      data: {
        complaintId: comp.id,
        title: 'Initial Grievance Submission Petition & Annexures',
        fileName: `${c.complaintNo.replace(/\//g, '_')}_Grievance_Petition.pdf`,
        fileUrl: `/uploads/${c.complaintNo.replace(/\//g, '_')}_Grievance_Petition.pdf`,
        fileType: 'application/pdf',
        fileSize: `${(Math.random() * 2 + 1.2).toFixed(1)} MB`,
        uploadedBy: 'Central Inward Registration Portal',
        createdAt: dateRec,
      },
    });
  }

  // 5. Update Institution Complaint Counters
  for (const inst of Object.values(institutions)) {
    const total = await prisma.complaint.count({ where: { institutionId: inst.id } });
    const pending = await prisma.complaint.count({
      where: {
        institutionId: inst.id,
        status: { in: ['PENDING', 'UNDER_REVIEW', 'ACTION_INITIATED', 'SHOW_CAUSE_ISSUED', 'COMMITTEE_HEARING', 'OVERDUE'] },
      },
    });
    const resolved = await prisma.complaint.count({ where: { institutionId: inst.id, status: 'RESOLVED' } });

    await prisma.institution.update({
      where: { id: inst.id },
      data: {
        totalComplaints: total,
        pendingComplaints: pending,
        resolvedComplaints: resolved,
      },
    });
  }

  // 6. Seed Cross-Bureau Overlaps!
  const overlapsData = [
    {
      c1: 'AICTE/GRV/2026/0001', // Apex - AB
      c2: 'AICTE/GRV/2026/0002', // Apex - RGRB
      matchScore: 96,
      reasons: JSON.stringify([
        'Same Institution: Apex Institute of Technology & Management (1-332458901)',
        'Different Assigned Bureaus: Approval Bureau (AB) vs Regulation & Grievance Bureau (RGRB)',
        'Connected Root Cause: Fraudulent ghost faculty on EoA portal correlates directly with 42 faculty unpaid salaries and illegal terminations',
        'Keyword Overlap: "faculty", "payroll", "termination", "ratio", "inspection"',
        'Received within 4-day window: Concurrent institutional crisis',
      ]),
      status: 'CONFIRMED',
      reviewedByName: 'Dr. Abhay Jere',
      decision: 'Confirmed Cross-Bureau Collision. Joint inquiry committee constituted under Approval Bureau and RGRB. Case tagged for combined hearing.',
    },
    {
      c1: 'AICTE/GRV/2026/0003', // Horizon - RGRB
      c2: 'AICTE/GRV/2026/0004', // Horizon - AB
      matchScore: 92,
      reasons: JSON.stringify([
        'Same Institution: Horizon Institute of Technology & Science (1-558291044)',
        'Different Assigned Bureaus: Regulation & Grievance Bureau (RGRB) vs Approval Bureau (AB)',
        'Correlated Regulatory Violations: Demanding cash capitation fee matches unapproved 60-seat surplus intake in B.Tech AIML',
        'High Financial Risk: Unapproved seats monetized via illegal management quota',
        'Keywords: "capitation fee", "unapproved", "intake", "admissions", "receipt"',
      ]),
      status: 'POTENTIAL',
      reviewedByName: null,
      decision: null,
    },
    {
      c1: 'AICTE/GRV/2026/0005', // Dronacharya - RGRB
      c2: 'AICTE/GRV/2026/0006', // Dronacharya - ROAC
      matchScore: 88,
      reasons: JSON.stringify([
        'Same Institution: Dronacharya Technical Campus (1-669102941)',
        'Different Assigned Bureaus: Regulation & Grievance Bureau (RGRB) vs Regional Office Affairs Cell (ROAC)',
        'Related Student Rights Violation: Withholding original 10th/12th marksheet certificates coincides with refusal of fee refund upon admission withdrawal',
        'Systemic Pattern: Coercive institutional retention of students and funds',
        'Keywords: "certificates", "marksheets", "refund", "cancellation", "transfer"',
      ]),
      status: 'POTENTIAL',
      reviewedByName: null,
      decision: null,
    },
    {
      c1: 'AICTE/GRV/2026/0007', // Vanguard - PAPB
      c2: 'AICTE/GRV/2026/0008', // Vanguard - AB
      matchScore: 85,
      reasons: JSON.stringify([
        'Same Institution: Vanguard College of Engineering (1-441298032)',
        'Different Assigned Bureaus: Policy & Academic Planning (PAPB) vs Approval Bureau (AB)',
        'Connected Infrastructure Failure: Unapproved evening diploma shifts using day labs relates directly to Missing Fire NOC and CAD/CAM laboratory deficit in Block C',
        'Keywords: "laboratory", "evening shift", "infrastructure", "Fire NOC", "equipment"',
      ]),
      status: 'UNDER_REVIEW',
      reviewedByName: 'Prof. Sunita Sundaram',
      decision: 'Marked for Joint Academic-Infrastructure inspection committee report.',
    },
  ];

  for (const ov of overlapsData) {
    const comp1 = createdComplaints[ov.c1];
    const comp2 = createdComplaints[ov.c2];
    if (comp1 && comp2) {
      await prisma.caseOverlap.create({
        data: {
          originalComplaintId: comp1.id,
          relatedComplaintId: comp2.id,
          institutionId: comp1.institutionId,
          originalBureauId: comp1.bureauId,
          relatedBureauId: comp2.bureauId,
          matchScore: ov.matchScore,
          reasons: ov.reasons,
          status: ov.status,
          reviewedByName: ov.reviewedByName,
          reviewedAt: ov.reviewedByName ? new Date() : null,
          reviewDecisionRemarks: ov.decision,
        },
      });
    }
  }

  // 7. Seed Notifications
  const sampleNotifications = [
    {
      title: 'High Severity Overlap Alert Detected',
      message: 'Rule engine identified 96% cross-bureau overlap for Apex Institute of Technology between Approval Bureau (AB) and Regulation Bureau (RGRB).',
      type: 'OVERLAP_ALERT',
      isRead: false,
      linkUrl: '/overlaps',
    },
    {
      title: 'Potential Overlap: Horizon Institute',
      message: 'Potential correlation (92%) detected between unapproved intake (AB) and capitation fee extortion (RGRB).',
      type: 'OVERLAP_ALERT',
      isRead: false,
      linkUrl: '/overlaps',
    },
    {
      title: 'Complaint Escalation: Overdue Case',
      message: 'Complaint AICTE/GRV/2026/0018 has exceeded the 30-day resolution SLA in Approval Bureau.',
      type: 'DUE_DATE_WARNING',
      isRead: false,
      linkUrl: '/complaints',
    },
    {
      title: 'New Case Assigned to Regulation Desk',
      message: 'Urgent grievance AICTE/GRV/2026/0022 assigned to Officer Priya Nair for prompt verification.',
      type: 'COMPLAINT_ASSIGNED',
      isRead: true,
      linkUrl: '/complaints',
    },
    {
      title: 'Show Cause Response Received',
      message: 'Apex Institute has submitted reply to Show Cause Notice AICTE/RGRB/2026/SC-88.',
      type: 'STATUS_CHANGE',
      isRead: true,
      linkUrl: '/complaints',
    },
  ];

  for (const n of sampleNotifications) {
    await prisma.notification.create({ data: n });
  }

  // 8. Seed Audit Logs
  const sampleAuditLogs = [
    {
      userName: 'Dr. Abhay Jere',
      userRole: 'SUPER_ADMIN',
      action: 'OVERLAP_CONFIRMED',
      entityType: 'Overlap',
      entityId: 'OV-APEX-001',
      details: 'Confirmed Cross-Bureau Overlap between AICTE/GRV/2026/0001 (AB) and AICTE/GRV/2026/0002 (RGRB). Joint inquiry tagged.',
      ipAddress: '10.12.4.15',
    },
    {
      userName: 'Dr. Anand K. Kulkarni',
      userRole: 'BUREAU_HEAD',
      action: 'COMPLAINT_STATUS_UPDATED',
      entityType: 'Complaint',
      entityId: 'AICTE/GRV/2026/0002',
      details: 'Status upgraded from UNDER_REVIEW to SHOW_CAUSE_ISSUED following preliminary scrutiny.',
      ipAddress: '10.12.4.88',
    },
    {
      userName: 'Dr. Ramesh Chandra Verma',
      userRole: 'BUREAU_HEAD',
      action: 'OFFICER_REASSIGNED',
      entityType: 'Complaint',
      entityId: 'AICTE/GRV/2026/0001',
      details: 'Assigned primary investigation responsibility to Dr. Manoj Sharma (Approval Officer).',
      ipAddress: '10.12.4.45',
    },
    {
      userName: 'Prof. Sunita Sundaram',
      userRole: 'BUREAU_HEAD',
      action: 'OVERLAP_REVIEW_SUBMITTED',
      entityType: 'Overlap',
      entityId: 'OV-VANGUARD-004',
      details: 'Marked overlap between PAPB and AB for joint inspection report before committee hearing.',
      ipAddress: '10.12.4.92',
    },
    {
      userName: 'Dr. Abhay Jere',
      userRole: 'SUPER_ADMIN',
      action: 'LOGIN',
      entityType: 'Auth',
      entityId: 'admin@aicte.gov.in',
      details: 'Authorized secure console session initiated from Central Vigilance Node.',
      ipAddress: '10.12.4.15',
    },
  ];

  for (const al of sampleAuditLogs) {
    await prisma.auditLog.create({ data: al });
  }

  console.log('✅ Seeding completed successfully!');
  console.log('📊 4 Bureaus, 20 Institutions, 10 Users, 50 Complaints, 4 Cross-Bureau Overlaps seeded.');
}

seedDatabase()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

