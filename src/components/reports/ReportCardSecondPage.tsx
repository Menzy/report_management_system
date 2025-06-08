import { forwardRef, useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, LabelList } from 'recharts';
import { getPerformanceComparisonData } from "./reportUtils";
import { getGradeFromScore } from "../../utils/gradingSystem";

interface ReportCardSecondPageProps {
  report: any;
  classId: string;
}

const ReportCardSecondPage = forwardRef<HTMLDivElement, ReportCardSecondPageProps>(({ report, classId }, ref) => {
  const [comparisonData, setComparisonData] = useState<Array<{
    subject: string;
    student: number;
    highest: number;
    lowest: number;
    average: number;
  }>>([]);
  
  const [overallStats, setOverallStats] = useState({
    studentAverage: 0,
    classAverage: 0,
    highestInClass: 0,
    lowestInClass: 0,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchComparisonData = async () => {
      setLoading(true);
      try {
        const data = await getPerformanceComparisonData(report, classId);
        setComparisonData(data.comparisonData);
        setOverallStats(data.overallStats);
      } catch (error) {
        console.error('Error fetching comparison data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (report && classId) {
      fetchComparisonData();
    }
  }, [report, classId]);

  // Custom label component to show values on top of bars
  const renderCustomLabel = (props: any) => {
    const { x, y, width, value } = props;
    return (
      <text 
        x={x + width / 2} 
        y={y - 5} 
        fill="#000" 
        textAnchor="middle" 
        fontSize="10"
        fontWeight="bold"
      >
        {value}
      </text>
    );
  };

  // Function to get assessment breakdown from raw scores
  const getAssessmentBreakdown = (subject: any) => {
    const rawScores = subject.raw_scores || {};
    
    // Common assessment types and their typical max scores
    const assessmentTypes = [
      { key: 'test1', label: 'Test 1', maxScore: 30 },
      { key: 'groupwork', label: 'Group Work', maxScore: 20 },
      { key: 'project', label: 'Project Work', maxScore: 20 },
      { key: 'test2', label: 'Test 2', maxScore: 30 },
      { key: 'exam', label: 'End of Exam', maxScore: 100 }
    ];

    const breakdown = {
      test1: 0,
      groupwork: 0,
      project: 0,
      test2: 0,
      total: 0,
      scaling50: 0,
      exam: 0,
      scaling50Exam: 0,
      overall: 0
    };

    // Extract scores from raw_scores
    Object.keys(rawScores).forEach(key => {
      const lowerKey = key.toLowerCase();
      if (lowerKey.includes('test') && lowerKey.includes('1')) {
        breakdown.test1 = rawScores[key];
      } else if (lowerKey === 'gw' || lowerKey.includes('group')) {
        breakdown.groupwork = rawScores[key];
      } else if (lowerKey === 'pw' || lowerKey.includes('project')) {
        breakdown.project = rawScores[key];
      } else if (lowerKey.includes('test') && lowerKey.includes('2')) {
        breakdown.test2 = rawScores[key];
      } else if (lowerKey.includes('exam')) {
        breakdown.exam = rawScores[key];
      }
    });

    // Calculate totals
    breakdown.total = breakdown.test1 + breakdown.groupwork + breakdown.project + breakdown.test2;
    breakdown.scaling50 = Math.round(breakdown.total * 0.5);
    breakdown.scaling50Exam = Math.round(breakdown.exam * 0.5);
    breakdown.overall = breakdown.scaling50 + breakdown.scaling50Exam;

    return breakdown;
  };

  if (loading) {
    return (
      <div ref={ref} className="report-card">
        <div className="max-w-4xl mx-auto p-8">
          <div className="text-center">Loading performance comparison...</div>
        </div>
      </div>
    );
  }

  return (
    <div ref={ref} className="report-card">
      <div className="max-w-4xl mx-auto">
        {/* Student Information - Simplified */}
        <div className="text-center border-b-2 border-gray-300 pb-4 mb-6">
          <h2 className="text-xl font-semibold text-blue-600">PERFORMANCE ANALYSIS</h2>
          <p className="text-sm text-blue-500 mt-2">{report.term} - {report.academicYear}</p>
          <div className="mt-4 text-sm">
            <p><span className="font-bold">Student:</span> {report.student.name} ({report.student.student_id})</p>
            <p><span className="font-bold">Class:</span> {report.class.name}</p>
          </div>
        </div>

        {/* Cumulative Scores Table */}
        <div className="mt-6 mb-8">
          <h3 className="text-lg font-semibold mb-4 text-center text-blue-600">
            CUMULATIVE SCORES FOR THE TERM BETWEEN {report.term.toUpperCase()} - {report.academicYear}
          </h3>
          
          <div className="overflow-x-auto">
            <table className="min-w-full border-2 border-gray-400">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-400 px-2 py-2 text-xs font-bold text-center" rowSpan={2}></th>
                  <th className="border border-gray-400 px-2 py-2 text-xs font-bold text-center" rowSpan={2}>Subject</th>
                  <th className="border border-gray-400 px-2 py-2 text-xs font-bold text-center">Test 1<br/>(30)</th>
                  <th className="border border-gray-400 px-2 py-2 text-xs font-bold text-center">Group<br/>Work<br/>(20)</th>
                  <th className="border border-gray-400 px-2 py-2 text-xs font-bold text-center">Project<br/>Work<br/>(20)</th>
                  <th className="border border-gray-400 px-2 py-2 text-xs font-bold text-center">Test 2<br/>(30)</th>
                  <th className="border border-gray-400 px-2 py-2 text-xs font-bold text-center">Total<br/>(100)</th>
                  <th className="border border-gray-400 px-2 py-2 text-xs font-bold text-center">Scaling<br/>(50%)</th>
                  <th className="border border-gray-400 px-2 py-2 text-xs font-bold text-center">End of<br/>Exam<br/>(100)</th>
                  <th className="border border-gray-400 px-2 py-2 text-xs font-bold text-center">Scaling<br/>(50%)</th>
                  <th className="border border-gray-400 px-2 py-2 text-xs font-bold text-center">Overall</th>
                </tr>
              </thead>
              <tbody>
                {report.subjects.map((subject: any, index: number) => {
                  const breakdown = getAssessmentBreakdown(subject);
                  return (
                    <tr key={subject.subject_id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="border border-gray-400 px-2 py-2 text-xs text-center font-bold">{index + 1}</td>
                      <td className="border border-gray-400 px-2 py-2 text-xs font-medium">{subject.subject_name}</td>
                      <td className="border border-gray-400 px-2 py-2 text-xs text-center">{breakdown.test1}</td>
                      <td className="border border-gray-400 px-2 py-2 text-xs text-center">{breakdown.groupwork}</td>
                      <td className="border border-gray-400 px-2 py-2 text-xs text-center">{breakdown.project}</td>
                      <td className="border border-gray-400 px-2 py-2 text-xs text-center">{breakdown.test2}</td>
                      <td className="border border-gray-400 px-2 py-2 text-xs text-center font-semibold">{breakdown.total}</td>
                      <td className="border border-gray-400 px-2 py-2 text-xs text-center font-semibold">{breakdown.scaling50}</td>
                      <td className="border border-gray-400 px-2 py-2 text-xs text-center">{breakdown.exam}</td>
                      <td className="border border-gray-400 px-2 py-2 text-xs text-center font-semibold">{breakdown.scaling50Exam}</td>
                      <td className="border border-gray-400 px-2 py-2 text-xs text-center font-bold bg-blue-50">{breakdown.overall}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Subject Statistics Table */}
        <div className="mt-6 mb-8">
          <h3 className="text-lg font-semibold mb-4 text-center text-blue-600">
            SUBJECT STATISTICS FOR {report.term.toUpperCase()} -{report.academicYear}
          </h3>
          
          <div className="overflow-x-auto">
            <table className="min-w-full border-2 border-gray-400">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-400 px-2 py-2 text-xs font-bold text-center" rowSpan={2}></th>
                  <th className="border border-gray-400 px-2 py-2 text-xs font-bold text-center" rowSpan={2}>Subject</th>
                  <th className="border border-gray-400 px-2 py-2 text-xs font-bold text-center">Learner's<br/>Mark</th>
                  <th className="border border-gray-400 px-2 py-2 text-xs font-bold text-center">Learner's<br/>Grade</th>
                  <th className="border border-gray-400 px-2 py-2 text-xs font-bold text-center">Lowest<br/>Class<br/>Mark</th>
                  <th className="border border-gray-400 px-2 py-2 text-xs font-bold text-center">Lowest<br/>Class<br/>Grade</th>
                  <th className="border border-gray-400 px-2 py-2 text-xs font-bold text-center">Highest<br/>Class<br/>Mark</th>
                  <th className="border border-gray-400 px-2 py-2 text-xs font-bold text-center">Highest<br/>Class<br/>Grade</th>
                </tr>
              </thead>
              <tbody>
                {comparisonData.map((subject, index) => {
                  // Use the school's official grading system
                  const learnerGrade = getGradeFromScore(subject.student);
                  const lowestGrade = getGradeFromScore(subject.lowest);
                  const highestGrade = getGradeFromScore(subject.highest);

                  return (
                    <tr key={subject.subject} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="border border-gray-400 px-2 py-2 text-xs text-center font-bold">{index + 1}</td>
                      <td className="border border-gray-400 px-2 py-2 text-xs font-medium">{subject.subject}</td>
                      <td className="border border-gray-400 px-2 py-2 text-xs text-center font-semibold">{subject.student}</td>
                      <td className="border border-gray-400 px-2 py-2 text-xs text-center font-semibold">{learnerGrade}</td>
                      <td className="border border-gray-400 px-2 py-2 text-xs text-center">{subject.lowest}</td>
                      <td className="border border-gray-400 px-2 py-2 text-xs text-center">{lowestGrade}</td>
                      <td className="border border-gray-400 px-2 py-2 text-xs text-center">{subject.highest}</td>
                      <td className="border border-gray-400 px-2 py-2 text-xs text-center">{highestGrade}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Performance Comparison Chart */}
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-4 text-center">Subject Performance Comparison</h3>
          
          {/* Bar Chart */}
          <div className="mb-8">
            <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={comparisonData}
                  margin={{
                    top: 30,
                    right: 30,
                    left: 20,
                    bottom: 60,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                  <XAxis 
                    dataKey="subject" 
                    angle={-45}
                    textAnchor="end"
                    height={80}
                    fontSize={10}
                    stroke="#333"
                  />
                  <YAxis 
                    fontSize={10}
                    stroke="#333"
                    domain={[0, 100]}
                  />
                  <Bar dataKey="student" fill="#3B82F6" name="Student Score">
                    <LabelList dataKey="student" content={renderCustomLabel} />
                  </Bar>
                  <Bar dataKey="highest" fill="#F59E0B" name="Highest Score">
                    <LabelList dataKey="highest" content={renderCustomLabel} />
                  </Bar>
                  <Bar dataKey="lowest" fill="#EF4444" name="Lowest Score">
                    <LabelList dataKey="lowest" content={renderCustomLabel} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            
            {/* Legend */}
            <div className="flex justify-center mt-4 space-x-6 text-sm">
              <div className="flex items-center">
                <div className="w-4 h-4 bg-blue-500 mr-2"></div>
                <span>Student Score</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-yellow-500 mr-2"></div>
                <span>Highest Score</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-red-500 mr-2"></div>
                <span>Lowest Score</span>
              </div>
            </div>
          </div>


        </div>
      </div>
    </div>
  );
});

export default ReportCardSecondPage; 