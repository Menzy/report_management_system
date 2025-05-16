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

  // Process each subject
  for (const subject of subjects) {
    // Fetch scores for this student and subject, filtered by term and academic year
    const query = supabase
      .from('scores')
      .select('*')
      .eq('student_id', student.id)
      .eq('subject_id', subject.id);
      
    // Add term filter if provided
    if (term) {
      query.eq('term', term);
    }
    
    // Add academic year filter if provided
    if (academicYear) {
      query.eq('academic_year', academicYear);
    }
    
    const { data: scores, error: scoresError } = await query;

    if (scoresError) throw scoresError;

    console.log('Scores for student:', student.id, 'subject:', subject.id, scores);

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
    if (scores && scores.length > 0) {
      // Find exam score
      const examScore = scores.find((s) => s.assessment_type.toUpperCase().includes('EXAM'));

      // Find class assessment scores (tests, quizzes, etc.)
      const classAssessmentScores = scores.filter((s) => !s.assessment_type.toUpperCase().includes('EXAM'));

      console.log('Class assessment scores:', classAssessmentScores);
      console.log('Exam score:', examScore);

      // Store raw scores for detailed view
      scores.forEach((score) => {
        subjectData.raw_scores[score.assessment_type] = score.score;
      });

      // Calculate continuous assessment (50% of total)
      let caScore = 0;
      if (classAssessmentScores.length > 0) {
        // Sum all class assessment scores (test1, test2, project work, group work)
        const totalClassScore = classAssessmentScores.reduce((acc, score) => acc + score.score, 0);
        
        // Calculate 50% of the total class score (multiply by 0.5 to get 50%)
        caScore = totalClassScore * 0.5;
        
        console.log('Class assessment scores:', classAssessmentScores);
        console.log('Total class score:', totalClassScore);
        console.log('CA score (50%):', caScore);
      }

      console.log('Calculated CA score (50%):', caScore);

      // Calculate exam score (50% of total)
      let finalExamScore = 0;
      if (examScore) {
        // Multiply exam score by 0.5 to get 50% of the total
        finalExamScore = examScore.score * 0.5;
        console.log('Original exam score:', examScore.score);
      }

      console.log('Calculated exam score:', finalExamScore);

      // Calculate total score
      const totalScore = caScore + finalExamScore;

      console.log('Total score:', totalScore);

      // Update subject data
      subjectData.continuous_assessment = Math.round(caScore);
      subjectData.exam_score = Math.round(finalExamScore);
      subjectData.total_score = Math.round(totalScore);

      // Determine grade and remark based on total score
      const { grade, remark } = getGradeAndRemark(totalScore);
      subjectData.grade = grade;
      subjectData.remark = remark;
    }

    report.subjects.push(subjectData);
  }

  return report;
};

export const calculateSubjectPositions = async (report: Report, classId: string): Promise<void> => {
  // For each subject, fetch all scores for all students in the class
  for (const subject of report.subjects) {
    try {
      // Get all students in this class
      const { data: students, error: studentsError } = await supabase
        .from('students')
        .select('id')
        .eq('class_id', classId);

      if (studentsError) throw studentsError;

      if (!students || students.length === 0) continue;

      // Get all scores for this subject for all students
      const studentIds = students.map((s) => s.id);

      // Fetch all scores for this subject, filtered by term and academic year
      let query = supabase
        .from('scores')
        .select('student_id, assessment_type, score')
        .eq('subject_id', subject.subject_id)
        .in('student_id', studentIds);
        
      // Add term filter if provided
      if (report.term) {
        query = query.eq('term', report.term);
      }
      
      // Add academic year filter if provided
      if (report.academicYear) {
        query = query.eq('academic_year', report.academicYear);
      }
      
      const { data: allScores, error: scoresError } = await query;

      if (scoresError) throw scoresError;

      if (!allScores || allScores.length === 0) {
        subject.position = 'N/A';
        continue;
      }

      // Group scores by student
      const scoresByStudent: { [key: string]: { examScores: any[]; classAssessmentScores: any[] } } = {};
      for (const score of allScores) {
        if (!scoresByStudent[score.student_id]) {
          scoresByStudent[score.student_id] = {
            examScores: [],
            classAssessmentScores: [],
          };
        }

        if (score.assessment_type.toUpperCase().includes('EXAM')) {
          scoresByStudent[score.student_id].examScores.push(score);
        } else {
          scoresByStudent[score.student_id].classAssessmentScores.push(score);
        }
      }

      // Calculate total scores for each student
      const studentTotalScores: { studentId: string; totalScore: number }[] = [];
      for (const [studentId, scores] of Object.entries(scoresByStudent)) {
        // Calculate CA score (50%)
        let caScore = 0;
        if (scores.classAssessmentScores.length > 0) {
          // Sum all class assessment scores
          const totalClassScore = scores.classAssessmentScores.reduce((acc, score) => acc + score.score, 0);

          // Calculate 50% of total class score
          caScore = totalClassScore * 0.5;
        }

        // Calculate exam score (50%)
        let examScore = 0;
        if (scores.examScores.length > 0) {
          examScore = (scores.examScores[0].score / 100) * 50;
        }

        // Calculate total
        const totalScore = caScore + examScore;

        studentTotalScores.push({
          studentId,
          totalScore,
        });
      }

      // Sort by total score (descending)
      studentTotalScores.sort((a, b) => b.totalScore - a.totalScore);

      // Find position of our student
      const position = studentTotalScores.findIndex((s) => s.studentId === report.student.id);

      if (position !== -1) {
        subject.position = `${position + 1} out of ${studentTotalScores.length}`;
      } else {
        subject.position = 'N/A';
      }
    } catch (err) {
      console.error(`Error calculating position for subject ${subject.subject_name}:`, err);
      subject.position = 'Error';
    }
  }
};

export const calculateOverallPosition = async (report: Report, classId: string): Promise<void> => {
  try {
    // Get all students in this class
    const { data: students, error: studentsError } = await supabase
      .from('students')
      .select('id, name')
      .eq('class_id', classId);

    if (studentsError) throw studentsError;

    if (!students || students.length === 0) {
      report.position = 'N/A';
      return;
    }

    // Calculate average score for each student
    const studentAverages: { studentId: string; name: string; averageScore: number }[] = [];

    for (const student of students) {
      // Get all subjects for this class
      const { data: subjects, error: subjectsError } = await supabase
        .from('subjects')
        .select('id')
        .eq('class_id', classId);

      if (subjectsError) throw subjectsError;

      if (!subjects || subjects.length === 0) continue;

      // Get all scores for this student
      const subjectIds = subjects.map((s) => s.id);

      // Fetch scores filtered by term and academic year
      let query = supabase
        .from('scores')
        .select('subject_id, assessment_type, score')
        .eq('student_id', student.id)
        .in('subject_id', subjectIds);
        
      // Add term filter if provided
      if (report.term) {
        query = query.eq('term', report.term);
      }
      
      // Add academic year filter if provided
      if (report.academicYear) {
        query = query.eq('academic_year', report.academicYear);
      }
      
      const { data: scores, error: scoresError } = await query;

      if (scoresError) throw scoresError;

      if (!scores || scores.length === 0) {
        studentAverages.push({
          studentId: student.id,
          name: student.name,
          averageScore: 0,
        });
        continue;
      }

      // Group scores by subject
      const scoresBySubject: { [key: string]: { examScores: any[]; classAssessmentScores: any[] } } = {};
      for (const score of scores) {
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
          // Sum all class assessment scores
          const totalClassScore = subjectScores.classAssessmentScores.reduce((acc, score) => acc + score.score, 0);

          // Calculate 50% of total class score
          caScore = totalClassScore * 0.5;
        }

        // Calculate exam score (50%)
        let examScore = 0;
        if (subjectScores.examScores.length > 0) {
          examScore = (subjectScores.examScores[0].score / 100) * 50;
        }

        // Add to total
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

    // Sort by average score (descending)
    studentAverages.sort((a, b) => b.averageScore - a.averageScore);

    // Find position of our student
    const position = studentAverages.findIndex((s) => s.studentId === report.student.id);

    if (position !== -1) {
      report.position = `${position + 1} out of ${studentAverages.length}`;
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
    return { grade: '1', remark: 'Highly Proficient (HP)' };
  } else if (score >= 75) {
    return { grade: '2', remark: 'Highly Proficient (HP)' };
  } else if (score >= 70) {
    return { grade: '3', remark: 'Proficient (P)' };
  } else if (score >= 65) {
    return { grade: '4', remark: 'Proficient (P)' };
  } else if (score >= 60) {
    return { grade: '5', remark: 'Proficient (P)' };
  } else if (score >= 50) {
    return { grade: '6', remark: 'Approaching Proficiency (AP)' };
  } else if (score >= 45) {
    return { grade: '7', remark: 'Developing (D)' };
  } else if (score >= 40) {
    return { grade: '8', remark: 'Developing (D)' };
  } else {
    return { grade: '9', remark: 'Emerging (E)' };
  }
};