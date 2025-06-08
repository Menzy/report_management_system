import { supabase } from "../../lib/supabase";

interface Report {
  student: any;
  class: any;
  school: any;
  academicYear: any;
  term: any;
  subjects: SubjectData[];
  attendance: { present: number; total: number };
  position: string;
}

interface SubjectData {
  subject_id: string;
  subject_name: string;
  continuous_assessment: number;
  exam_score: number;
  total_score: number;
  grade: string;
  position: string;
  remark: string;
  raw_scores: { [key: string]: number };
}

export const generateStudentReport = async (
  student: any,
  subjects: any[],
  classItem: any,
  school: any,
  academicYear: any,
  term: any
): Promise<Report> => {
  // Initialize the report object
  const report: Report = {
    student,
    class: classItem,
    school,
    academicYear,
    term,
    subjects: [],
    attendance: { present: 0, total: 0 },
    position: 'N/A',
  };

  // Calculate attendance (placeholder - would need actual attendance data)
  report.attendance = { present: Math.floor(Math.random() * 60) + 20, total: 64 };

  try {
    // Batch fetch all scores for this student across all subjects in one query
    const subjectIds = subjects.map((subject) => subject.id);

    // Build query with filters
    let query = supabase
      .from('scores')
      .select('*')
      .eq('student_id', student.id)
      .in('subject_id', subjectIds);

    // Add term filter if provided
    if (term) {
      query = query.eq('term', term);
    }

    // Add academic year filter if provided
    if (academicYear) {
      query = query.eq('academic_year', academicYear);
    }

    // Execute query to get all scores at once
    const { data: allScores, error: scoresError } = await query;

    if (scoresError) throw scoresError;

    // Process each subject using the batch-fetched scores
    for (const subject of subjects) {
      // Filter scores for this specific subject
      const subjectScores = allScores.filter((score) => score.subject_id === subject.id);

      // Initialize subject data
      const subjectData: SubjectData = {
        subject_id: subject.id,
        subject_name: subject.name,
        continuous_assessment: 0,
        exam_score: 0,
        total_score: 0,
        grade: '',
        position: 'N/A',
        remark: '',
        raw_scores: {},
      };

      // Process scores if available
      if (subjectScores && subjectScores.length > 0) {
        // Find exam score
        const examScore = subjectScores.find((s) => s.assessment_type.toUpperCase().includes('EXAM'));

        // Find class assessment scores (tests, quizzes, etc.)
        const classAssessmentScores = subjectScores.filter((s) => !s.assessment_type.toUpperCase().includes('EXAM'));

        // Store raw scores for detailed view
        subjectScores.forEach((score) => {
          subjectData.raw_scores[score.assessment_type] = score.score;
        });

        // Calculate continuous assessment (50% of total)
        let caScore = 0;
        if (classAssessmentScores.length > 0) {
          // Sum all class assessment scores
          const totalClassScore = classAssessmentScores.reduce((acc, score) => acc + score.score, 0);

          // Calculate 50% of the total class score
          caScore = totalClassScore * 0.5;
        }

        // Calculate exam score (50% of total)
        let finalExamScore = 0;
        if (examScore) {
          finalExamScore = examScore.score * 0.5;
        }

        // Calculate total score
        const totalScore = caScore + finalExamScore;

        // Update subject data
        subjectData.continuous_assessment = Math.round(caScore);
        subjectData.exam_score = Math.round(finalExamScore);
        subjectData.total_score = Math.round(totalScore);

        // Get grade and remark
        const { grade, remark } = getGradeAndRemark(totalScore);
        subjectData.grade = grade;
        subjectData.remark = remark;
      }

      // Add to report
      report.subjects.push(subjectData);
    }
  } catch (error) {
    console.error('Error generating student report:', error);
  }

  return report;
};

export const calculateSubjectPositions = async (report: Report, classId: string): Promise<void> => {
  try {
    // 1. Get all students in this class in one query
    const { data: students, error: studentsError } = await supabase
      .from('students')
      .select('id, name')
      .eq('class_id', classId);

    if (studentsError) throw studentsError;
    if (!students || students.length === 0) return;

    const studentIds = students.map((s) => s.id);
    const subjectIds = report.subjects.map((s) => s.subject_id);

    // 2. Batch fetch all scores for all subjects and all students in one query
    let scoresQuery = supabase
      .from('scores')
      .select('student_id, subject_id, assessment_type, score')
      .in('subject_id', subjectIds)
      .in('student_id', studentIds);

    if (report.term) {
      scoresQuery = scoresQuery.eq('term', report.term);
    }

    if (report.academicYear) {
      scoresQuery = scoresQuery.eq('academic_year', report.academicYear);
    }

    const { data: allScores, error: scoresError } = await scoresQuery;

    if (scoresError) throw scoresError;
    if (!allScores || allScores.length === 0) return;

    // 3. Process each subject using the batch-fetched data
    for (const subject of report.subjects) {
      // Filter scores for this specific subject
      const subjectScores = allScores.filter((score) => score.subject_id === subject.subject_id);
      if (subjectScores.length === 0) continue;

      // Group scores by student
      const scoresByStudent: Record<string, { examScores: any[]; classAssessmentScores: any[] }> = {};

      for (const score of subjectScores) {
        const studentId = score.student_id;
        if (!scoresByStudent[studentId]) {
          scoresByStudent[studentId] = {
            examScores: [],
            classAssessmentScores: [],
          };
        }

        if (score.assessment_type.toUpperCase().includes('EXAM')) {
          scoresByStudent[studentId].examScores.push(score);
        } else {
          scoresByStudent[studentId].classAssessmentScores.push(score);
        }
      }

      // Calculate total score for each student
      const studentScores: { studentId: string; totalScore: number }[] = [];

      for (const [studentId, scores] of Object.entries(scoresByStudent)) {
        // Calculate CA score (50%)
        let caScore = 0;
        if (scores.classAssessmentScores.length > 0) {
          const totalClassScore = scores.classAssessmentScores.reduce((acc, score) => acc + score.score, 0);
          caScore = totalClassScore * 0.5;
        }

        // Calculate exam score (50%)
        let examScore = 0;
        if (scores.examScores.length > 0) {
          examScore = scores.examScores[0].score * 0.5;
        }

        studentScores.push({
          studentId,
          totalScore: caScore + examScore,
        });
      }

      // Sort by total score (descending)
      studentScores.sort((a, b) => b.totalScore - a.totalScore);

      // Find position of our student
      const position = studentScores.findIndex((s) => s.studentId === report.student.id);

      if (position !== -1) {
        subject.position = `${position + 1}`;

      } else {
        subject.position = 'N/A';
      }
    }
  } catch (err) {
    console.error('Error calculating subject positions:', err);
    for (const subject of report.subjects) {
      subject.position = 'Error';
    }
  }
};

export const calculateOverallPosition = async (report: Report, classId: string): Promise<void> => {
  try {
    // 1. Get all students and subjects for this class in parallel
    const [studentsResult, subjectsResult] = await Promise.all([
      supabase.from('students').select('id, name').eq('class_id', classId),
      supabase.from('subjects').select('id, name').eq('class_id', classId),
    ]);

    if (studentsResult.error) throw studentsResult.error;
    if (subjectsResult.error) throw subjectsResult.error;

    const students = studentsResult.data;
    const subjects = subjectsResult.data;

    if (!students || students.length === 0 || !subjects || subjects.length === 0) {
      report.position = 'N/A';
      return;
    }

    const studentIds = students.map((s) => s.id);
    const subjectIds = subjects.map((s) => s.id);

    // 2. Batch fetch all scores for all students and subjects in one query
    let scoresQuery = supabase
      .from('scores')
      .select('student_id, subject_id, assessment_type, score')
      .in('student_id', studentIds)
      .in('subject_id', subjectIds);

    if (report.term) {
      scoresQuery = scoresQuery.eq('term', report.term);
    }

    if (report.academicYear) {
      scoresQuery = scoresQuery.eq('academic_year', report.academicYear);
    }

    const { data: allScores, error: scoresError } = await scoresQuery;

    if (scoresError) throw scoresError;

    // 3. Process all students in memory using the batch-fetched data
    const studentAverages: { studentId: string; name: string; averageScore: number }[] = [];

    for (const student of students) {
      // Filter scores for this student
      const studentScores = allScores?.filter((score) => score.student_id === student.id) || [];

      if (studentScores.length === 0) {
        studentAverages.push({
          studentId: student.id,
          name: student.name,
          averageScore: 0,
        });
        continue;
      }

      // Group scores by subject
      const scoresBySubject: Record<string, { examScores: any[]; classAssessmentScores: any[] }> = {};

      for (const score of studentScores) {
        const subjectId = score.subject_id;
        if (!scoresBySubject[subjectId]) {
          scoresBySubject[subjectId] = {
            examScores: [],
            classAssessmentScores: [],
          };
        }

        if (score.assessment_type.toUpperCase().includes('EXAM')) {
          scoresBySubject[subjectId].examScores.push(score);
        } else {
          scoresBySubject[subjectId].classAssessmentScores.push(score);
        }
      }

      // Calculate total score for each subject
      let totalScoreSum = 0;
      let subjectCount = 0;

      for (const [subjectId, subjectScores] of Object.entries(scoresBySubject)) {
        // Calculate CA score (50%)
        let caScore = 0;
        if (subjectScores.classAssessmentScores.length > 0) {
          const totalClassScore = subjectScores.classAssessmentScores.reduce((acc, score) => acc + score.score, 0);
          caScore = totalClassScore * 0.5;
        }

        // Calculate exam score (50%)
        let examScore = 0;
        if (subjectScores.examScores.length > 0) {
          examScore = (subjectScores.examScores[0].score / 100) * 50;
        }

        totalScoreSum += caScore + examScore;
        subjectCount++;
      }

      // Calculate average
      const averageScore = subjectCount > 0 ? totalScoreSum / subjectCount : 0;

      studentAverages.push({
        studentId: student.id,
        name: student.name,
        averageScore,
      });
    }

    // 4. Sort by average score (descending)
    studentAverages.sort((a, b) => b.averageScore - a.averageScore);

    // 5. Find position of our student
    const position = studentAverages.findIndex((s) => s.studentId === report.student.id);

    if (position !== -1) {
      report.position = `${position + 1}`;
    } else {
      report.position = 'N/A';
    }
  } catch (err) {
    console.error('Error calculating overall position:', err);
    report.position = 'Error';
  }
};

export const getGradeAndRemark = (score: number): { grade: string; remark: string } => {
  // Based on the provided grading system
  if (score >= 80) {
    return { grade: '1', remark: 'Excellent' };
  } else if (score >= 75) {
    return { grade: '2', remark: 'Very Good' };
  } else if (score >= 70) {
    return { grade: '3', remark: 'Good' };
  } else if (score >= 65) {
    return { grade: '4', remark: 'Credit' };
  } else if (score >= 60) {
    return { grade: '5', remark: 'Average' };
  } else if (score >= 50) {
    return { grade: '6', remark: 'Below Average' };
  } else if (score >= 45) {
    return { grade: '7', remark: 'Pass' };
  } else if (score >= 40) {
    return { grade: '8', remark: 'Developing' };
  } else {
    return { grade: '9', remark: 'Emerging' };
  }
};

export const getPerformanceComparisonData = async (
  report: Report,
  classId: string
): Promise<{
  comparisonData: Array<{
    subject: string;
    student: number;
    highest: number;
    lowest: number;
    average: number;
  }>;
  overallStats: {
    studentAverage: number;
    classAverage: number;
    highestInClass: number;
    lowestInClass: number;
  };
}> => {
  try {
    // Get all students in this class
    const { data: students, error: studentsError } = await supabase
      .from('students')
      .select('id, name')
      .eq('class_id', classId);

    if (studentsError) throw studentsError;
    if (!students || students.length === 0) {
      return {
        comparisonData: [],
        overallStats: {
          studentAverage: 0,
          classAverage: 0,
          highestInClass: 0,
          lowestInClass: 0,
        },
      };
    }

    const studentIds = students.map((s) => s.id);
    const subjectIds = report.subjects.map((s) => s.subject_id);

    // Batch fetch all scores for all subjects and all students
    let scoresQuery = supabase
      .from('scores')
      .select('student_id, subject_id, assessment_type, score')
      .in('subject_id', subjectIds)
      .in('student_id', studentIds);

    if (report.term) {
      scoresQuery = scoresQuery.eq('term', report.term);
    }

    if (report.academicYear) {
      scoresQuery = scoresQuery.eq('academic_year', report.academicYear);
    }

    const { data: allScores, error: scoresError } = await scoresQuery;

    if (scoresError) throw scoresError;
    if (!allScores || allScores.length === 0) {
      return {
        comparisonData: [],
        overallStats: {
          studentAverage: 0,
          classAverage: 0,
          highestInClass: 0,
          lowestInClass: 0,
        },
      };
    }

    const comparisonData: Array<{
      subject: string;
      student: number;
      highest: number;
      lowest: number;
      average: number;
    }> = [];

    let studentTotalScore = 0;
    let classTotalScore = 0;
    let subjectCount = 0;

    // Process each subject
    for (const subject of report.subjects) {
      const subjectScores = allScores.filter((score) => score.subject_id === subject.subject_id);
      
      if (subjectScores.length === 0) continue;

      // Group scores by student for this subject
      const scoresByStudent: Record<string, number> = {};

      // Calculate total score for each student in this subject
      const studentScoreMap: Record<string, { examScores: any[]; classAssessmentScores: any[] }> = {};

      for (const score of subjectScores) {
        const studentId = score.student_id;
        if (!studentScoreMap[studentId]) {
          studentScoreMap[studentId] = {
            examScores: [],
            classAssessmentScores: [],
          };
        }

        if (score.assessment_type.toUpperCase().includes('EXAM')) {
          studentScoreMap[studentId].examScores.push(score);
        } else {
          studentScoreMap[studentId].classAssessmentScores.push(score);
        }
      }

      // Calculate final scores for each student
      const finalScores: number[] = [];
      let currentStudentScore = 0;

      for (const [studentId, scores] of Object.entries(studentScoreMap)) {
        // Calculate CA score (50%)
        let caScore = 0;
        if (scores.classAssessmentScores.length > 0) {
          const totalClassScore = scores.classAssessmentScores.reduce((acc, score) => acc + score.score, 0);
          caScore = totalClassScore * 0.5;
        }

        // Calculate exam score (50%)
        let examScore = 0;
        if (scores.examScores.length > 0) {
          examScore = scores.examScores[0].score * 0.5;
        }

        const totalScore = caScore + examScore;
        finalScores.push(totalScore);

        // Track current student's score
        if (studentId === report.student.id) {
          currentStudentScore = totalScore;
        }
      }

      if (finalScores.length > 0) {
        const highest = Math.max(...finalScores);
        const lowest = Math.min(...finalScores);
        const average = finalScores.reduce((sum, score) => sum + score, 0) / finalScores.length;

        comparisonData.push({
          subject: subject.subject_name,
          student: Math.round(currentStudentScore),
          highest: Math.round(highest),
          lowest: Math.round(lowest),
          average: Math.round(average),
        });

        studentTotalScore += currentStudentScore;
        classTotalScore += average;
        subjectCount++;
      }
    }

    // Calculate overall statistics
    const studentAverage = subjectCount > 0 ? studentTotalScore / subjectCount : 0;
    const classAverage = subjectCount > 0 ? classTotalScore / subjectCount : 0;

    // Get highest and lowest performing students overall
    const allStudentAverages: number[] = [];
    
    for (const student of students) {
      const studentScores = allScores.filter((score) => score.student_id === student.id);
      
      if (studentScores.length === 0) continue;

      const scoresBySubject: Record<string, { examScores: any[]; classAssessmentScores: any[] }> = {};

      for (const score of studentScores) {
        const subjectId = score.subject_id;
        if (!scoresBySubject[subjectId]) {
          scoresBySubject[subjectId] = {
            examScores: [],
            classAssessmentScores: [],
          };
        }

        if (score.assessment_type.toUpperCase().includes('EXAM')) {
          scoresBySubject[subjectId].examScores.push(score);
        } else {
          scoresBySubject[subjectId].classAssessmentScores.push(score);
        }
      }

      let totalScoreSum = 0;
      let subjectCountForStudent = 0;

      for (const [subjectId, subjectScores] of Object.entries(scoresBySubject)) {
        let caScore = 0;
        if (subjectScores.classAssessmentScores.length > 0) {
          const totalClassScore = subjectScores.classAssessmentScores.reduce((acc, score) => acc + score.score, 0);
          caScore = totalClassScore * 0.5;
        }

        let examScore = 0;
        if (subjectScores.examScores.length > 0) {
          examScore = subjectScores.examScores[0].score * 0.5;
        }

        totalScoreSum += caScore + examScore;
        subjectCountForStudent++;
      }

      if (subjectCountForStudent > 0) {
        allStudentAverages.push(totalScoreSum / subjectCountForStudent);
      }
    }

    const highestInClass = allStudentAverages.length > 0 ? Math.max(...allStudentAverages) : 0;
    const lowestInClass = allStudentAverages.length > 0 ? Math.min(...allStudentAverages) : 0;

    return {
      comparisonData,
      overallStats: {
        studentAverage: Math.round(studentAverage),
        classAverage: Math.round(classAverage),
        highestInClass: Math.round(highestInClass),
        lowestInClass: Math.round(lowestInClass),
      },
    };
  } catch (error) {
    console.error('Error getting performance comparison data:', error);
    return {
      comparisonData: [],
      overallStats: {
        studentAverage: 0,
        classAverage: 0,
        highestInClass: 0,
        lowestInClass: 0,
      },
    };
  }
};