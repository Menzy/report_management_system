// Grading system utility based on the school's official grading scale
export interface GradeScale {
  range: string;
  grade: string;
  remark: string;
  minScore: number;
  maxScore: number;
}

export const GRADING_SCALE: GradeScale[] = [
  { range: '80-100', grade: '1', remark: 'Excellent', minScore: 80, maxScore: 100 },
  { range: '75-79', grade: '2', remark: 'Very Good', minScore: 75, maxScore: 79 },
  { range: '70-74', grade: '3', remark: 'Good', minScore: 70, maxScore: 74 },
  { range: '65-69', grade: '4', remark: 'Credit', minScore: 65, maxScore: 69 },
  { range: '60-64', grade: '5', remark: 'Average', minScore: 60, maxScore: 64 },
  { range: '50-59', grade: '6', remark: 'Below Average', minScore: 50, maxScore: 59 },
  { range: '45-49', grade: '7', remark: 'Pass', minScore: 45, maxScore: 49 },
  { range: '40-44', grade: '8', remark: 'Developing', minScore: 40, maxScore: 44 },
  { range: '0-39', grade: '9', remark: 'Emerging', minScore: 0, maxScore: 39 },
];

/**
 * Convert a numerical score to the corresponding grade
 * @param score - The numerical score (0-100)
 * @returns The grade string (1-9)
 */
export const getGradeFromScore = (score: number): string => {
  for (const scale of GRADING_SCALE) {
    if (score >= scale.minScore && score <= scale.maxScore) {
      return scale.grade;
    }
  }
  return '9'; // Default to lowest grade if score is invalid
};

/**
 * Get the remark for a given score
 * @param score - The numerical score (0-100)
 * @returns The remark string
 */
export const getRemarkFromScore = (score: number): string => {
  for (const scale of GRADING_SCALE) {
    if (score >= scale.minScore && score <= scale.maxScore) {
      return scale.remark;
    }
  }
  return 'Emerging'; // Default to lowest remark if score is invalid
};

/**
 * Get the full grade information for a given score
 * @param score - The numerical score (0-100)
 * @returns The complete grade scale object
 */
export const getGradeInfo = (score: number): GradeScale => {
  for (const scale of GRADING_SCALE) {
    if (score >= scale.minScore && score <= scale.maxScore) {
      return scale;
    }
  }
  return GRADING_SCALE[GRADING_SCALE.length - 1]; // Default to lowest grade
};

 