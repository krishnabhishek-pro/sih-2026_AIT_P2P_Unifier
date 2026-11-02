import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Related category taxonomy mapping
const CATEGORY_CLUSTERS: Record<string, string[]> = {
  'FACULTY_MATTERS': [
    'Faculty Salary & Service Matters',
    'Harassment & Victimization',
    'Unapproved Intake & Courses', // Often linked through ghost faculty / unapproved faculty
  ],
  'FINANCIAL_ADMISSION': [
    'Excess Fee & Capitation',
    'Admission Irregularities',
    'Unapproved Intake & Courses',
  ],
  'INFRASTRUCTURE_ACADEMIC': [
    'Infrastructure Deficiencies',
    'Unapproved Intake & Courses',
    'Admission Irregularities',
  ],
};

// Common keywords indicating regulatory concerns
const KEYWORD_TAXONOMY = [
  'salary', 'payroll', 'termination', 'ghost', 'faculty', '7th cpc',
  'capitation', 'cash', 'excess fee', 'refund', 'caution deposit', 'receipt',
  'unapproved', 'intake', 'seats', 'sanction', 'affiliation',
  'laboratory', 'lab', 'equipment', 'fire safety', 'building', 'library',
  'marksheet', 'certificate', 'retention', 'transfer', 'ragging', 'harassment'
];

interface OverlapMatchResult {
  complaint1Id: string;
  complaint2Id: string;
  institutionId: string;
  bureau1Id: string;
  bureau2Id: string;
  matchScore: number;
  reasons: string[];
}

export function calculateComplaintSimilarity(c1: any, c2: any): OverlapMatchResult | null {
  // RULE 1: Must be the same institution
  if (c1.institutionId !== c2.institutionId) {
    return null;
  }

  // RULE 2: Must be different Bureaus (cross-bureau overlap detection)
  if (c1.bureauId === c2.bureauId) {
    return null;
  }

  let score = 0;
  const reasons: string[] = [];

  // Base score for same institution across different bureaus
  score += 35;
  reasons.push(`Same Institution: Both grievances target ${c1.institution?.name || 'the same institution'}`);
  reasons.push(`Cross-Bureau Collision: Handled separately by ${c1.bureau?.name || 'Bureau A'} and ${c2.bureau?.name || 'Bureau B'}`);

  // Category matching
  if (c1.category === c2.category) {
    score += 25;
    reasons.push(`Identical Category: Both cases filed under "${c1.category}"`);
  } else {
    // Check if categories are in the same cluster
    let relatedFound = false;
    for (const [clusterName, categories] of Object.entries(CATEGORY_CLUSTERS)) {
      if (categories.includes(c1.category) && categories.includes(c2.category)) {
        score += 18;
        reasons.push(`Related Category Cluster: "${c1.category}" & "${c2.category}" indicate connected institutional non-compliance`);
        relatedFound = true;
        break;
      }
    }
    if (!relatedFound) {
      score += 5;
    }
  }

  // Keyword / Text semantic overlap
  const text1 = `${c1.title} ${c1.description}`.toLowerCase();
  const text2 = `${c2.title} ${c2.description}`.toLowerCase();

  const matchedKeywords: string[] = [];
  for (const kw of KEYWORD_TAXONOMY) {
    if (text1.includes(kw) && text2.includes(kw)) {
      matchedKeywords.push(kw);
    }
  }

  if (matchedKeywords.length > 0) {
    const kwScore = Math.min(25, matchedKeywords.length * 6);
    score += kwScore;
    reasons.push(`Common Grievance Keywords: [${matchedKeywords.slice(0, 5).join(', ')}] appear in both complaints`);
  }

  // Time window proximity
  const d1 = new Date(c1.dateReceived).getTime();
  const d2 = new Date(c2.dateReceived).getTime();
  const diffDays = Math.abs(d1 - d2) / (1000 * 60 * 60 * 24);

  if (diffDays <= 30) {
    score += 15;
    reasons.push(`Close Temporal Proximity: Received within ${Math.round(diffDays)} days of each other`);
  } else if (diffDays <= 90) {
    score += 10;
    reasons.push(`Medium Temporal Proximity: Received within ${Math.round(diffDays)} days`);
  } else if (diffDays <= 180) {
    score += 5;
    reasons.push(`Received within 6 months`);
  }

  // Cap score between 0 and 99 (never 100% since automated rule is only an indication)
  const finalScore = Math.min(98, Math.max(0, score));

  // Threshold: Only return if matchScore >= 60
  if (finalScore >= 60) {
    return {
      complaint1Id: c1.id,
      complaint2Id: c2.id,
      institutionId: c1.institutionId,
      bureau1Id: c1.bureauId,
      bureau2Id: c2.bureauId,
      matchScore: finalScore,
      reasons,
    };
  }

  return null;
}

export async function runFullOverlapScan() {
  console.log('🔍 Executing Cross-Bureau Overlap Detection Scan...');

  // Fetch all active or under-review complaints with relations
  const complaints = await prisma.complaint.findMany({
    include: {
      institution: true,
      bureau: true,
    },
  });

  let detectedCount = 0;
  let newOverlapsCount = 0;

  for (let i = 0; i < complaints.length; i++) {
    for (let j = i + 1; j < complaints.length; j++) {
      const c1 = complaints[i];
      const c2 = complaints[j];

      const match = calculateComplaintSimilarity(c1, c2);
      if (match) {
        detectedCount++;

        // Check if overlap already exists
        const existing = await prisma.caseOverlap.findFirst({
          where: {
            OR: [
              { originalComplaintId: c1.id, relatedComplaintId: c2.id },
              { originalComplaintId: c2.id, relatedComplaintId: c1.id },
            ],
          },
        });

        if (!existing) {
          await prisma.caseOverlap.create({
            data: {
              originalComplaintId: c1.id,
              relatedComplaintId: c2.id,
              institutionId: match.institutionId,
              originalBureauId: match.bureau1Id,
              relatedBureauId: match.bureau2Id,
              matchScore: match.matchScore,
              reasons: JSON.stringify(match.reasons),
              status: 'POTENTIAL',
            },
          });
          newOverlapsCount++;

          // Create notification for senior officials
          await prisma.notification.create({
            data: {
              title: `Potential Overlap Detected (${match.matchScore}%)`,
              message: `Cross-bureau overlap identified for ${c1.institution.name} between ${c1.bureau.name} and ${c2.bureau.name}.`,
              type: 'OVERLAP_ALERT',
              linkUrl: '/overlaps',
            },
          });
        }
      }
    }
  }

  console.log(`Scan completed. ${detectedCount} potential cross-bureau correlations detected (${newOverlapsCount} newly indexed).`);
  return { detectedCount, newOverlapsCount };
}

