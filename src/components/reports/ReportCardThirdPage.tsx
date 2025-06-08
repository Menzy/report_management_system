import { forwardRef, useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend } from 'recharts';

interface ReportCardThirdPageProps {
  report: any;
  classId: string;
}

const ReportCardThirdPage = forwardRef<HTMLDivElement, ReportCardThirdPageProps>(({ report, classId }, ref) => {
  const [previousScores, setPreviousScores] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPreviousScores = async () => {
      setLoading(true);
      try {
        // For now, we'll use zeros for previous scores since we don't have previous data
        // In the future, this would fetch actual previous term data
        const mockPreviousScores = report.subjects.map((subject: any) => ({
          subject_id: subject.subject_id,
          subject_name: subject.subject_name,
          previous_class_total: 0, // Would be fetched from previous term
          previous_exam_total: 0,  // Would be fetched from previous term
        }));
        
        setPreviousScores(mockPreviousScores);
      } catch (error) {
        console.error('Error fetching previous scores:', error);
      } finally {
        setLoading(false);
      }
    };

    if (report && classId) {
      fetchPreviousScores();
    }
  }, [report, classId]);

  // Function to get current scores breakdown
  const getCurrentScores = (subject: any) => {
    const rawScores = subject.raw_scores || {};
    
    let classTotal = 0;
    let examTotal = 0;

    // Extract scores from raw_scores
    Object.keys(rawScores).forEach(key => {
      const lowerKey = key.toLowerCase();
      if (lowerKey.includes('exam')) {
        examTotal = rawScores[key];
      } else {
        // Sum up all non-exam scores for class total
        if (!lowerKey.includes('exam')) {
          classTotal += rawScores[key] || 0;
        }
      }
    });

    return {
      classTotal: classTotal,  // Full score out of 100
      examTotal: examTotal     // Full score out of 100
    };
  };

  if (loading) {
    return (
      <div ref={ref} className="report-card">
        <div className="max-w-4xl mx-auto p-8">
          <div className="text-center">Loading class and examination scores analysis...</div>
        </div>
      </div>
    );
  }

  return (
    <div ref={ref} className="report-card">
      <div className="max-w-4xl mx-auto">
        {/* Student Information - Simplified */}
        <div className="text-center border-b-2 border-gray-300 pb-4 mb-6">
          <h2 className="text-xl font-semibold text-blue-600">CLASS AND EXAMINATION SCORES ANALYSIS</h2>
          <p className="text-sm text-blue-500 mt-2">{report.term} - {report.academicYear}</p>
          <div className="mt-4 text-sm">
            <p><span className="font-bold">Student:</span> {report.student.name} ({report.student.student_id})</p>
            <p><span className="font-bold">Class:</span> {report.class.name}</p>
          </div>
        </div>

        {/* Class and Examination Scores Analysis Table */}
        <div className="mt-6 mb-8">
          <div className="overflow-x-auto">
            <table className="min-w-full border-2 border-gray-400">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-400 px-2 py-2 text-xs font-bold text-center" rowSpan={2}></th>
                  <th className="border border-gray-400 px-2 py-2 text-xs font-bold text-center" rowSpan={2}>Subject</th>
                  <th className="border border-gray-400 px-2 py-2 text-xs font-bold text-center">Previous<br/>Class Total<br/>(100)</th>
                  <th className="border border-gray-400 px-2 py-2 text-xs font-bold text-center">Previous<br/>Exams Total<br/>(100)</th>
                  <th className="border border-gray-400 px-2 py-2 text-xs font-bold text-center">Current<br/>Class Total<br/>(100)</th>
                  <th className="border border-gray-400 px-2 py-2 text-xs font-bold text-center">Current<br/>Exams Total<br/>(100)</th>
                </tr>
              </thead>
              <tbody>
                {report.subjects.map((subject: any, index: number) => {
                  const currentScores = getCurrentScores(subject);
                  const previousScore = previousScores.find(p => p.subject_id === subject.subject_id);
                  
                  return (
                    <tr key={subject.subject_id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="border border-gray-400 px-2 py-2 text-xs text-center font-bold">{index + 1}</td>
                      <td className="border border-gray-400 px-2 py-2 text-xs font-medium">{subject.subject_name}</td>
                      <td className="border border-gray-400 px-2 py-2 text-xs text-center">
                        {previousScore?.previous_class_total || 0}
                      </td>
                      <td className="border border-gray-400 px-2 py-2 text-xs text-center">
                        {previousScore?.previous_exam_total || 0}
                      </td>
                      <td className="border border-gray-400 px-2 py-2 text-xs text-center font-semibold bg-blue-50">
                        {currentScores.classTotal}
                      </td>
                      <td className="border border-gray-400 px-2 py-2 text-xs text-center font-semibold bg-blue-50">
                        {currentScores.examTotal}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>



        {/* Class Score Analysis Chart */}
        <div className="mt-8">
          <h4 className="text-lg font-semibold mb-4 text-center text-red-600">CLASS SCORE ANALYSIS</h4>
          <div className="h-80 mb-8">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={report.subjects.map((subject: any, index: number) => {
                  const currentScores = getCurrentScores(subject);
                  const previousScore = previousScores.find(p => p.subject_id === subject.subject_id);
                  return {
                    subject: index + 1, // Use subject number for x-axis
                    subjectName: subject.subject_name,
                    "Previous Class Total (100)": previousScore?.previous_class_total || 0,
                    "Current Class Total (100)": currentScores.classTotal
                  };
                })}
                margin={{
                  top: 20,
                  right: 30,
                  left: 20,
                  bottom: 20,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis 
                  dataKey="subject" 
                  fontSize={12}
                  stroke="#333"
                  domain={[1, 10]}
                />
                <YAxis 
                  fontSize={12}
                  stroke="#333"
                  domain={[0, 100]}
                />
                <Legend />
                <Line 
                  type="linear" 
                  dataKey="Previous Class Total (100)" 
                  stroke="#82ca9d" 
                  strokeWidth={3}
                  dot={{ fill: '#82ca9d', strokeWidth: 2, r: 4 }}
                />
                <Line 
                  type="linear" 
                  dataKey="Current Class Total (100)" 
                  stroke="#1f4e79" 
                  strokeWidth={3}
                  dot={{ fill: '#1f4e79', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Examination Scores Analysis Chart */}
        <div className="mt-8">
          <h4 className="text-lg font-semibold mb-4 text-center text-red-600">EXAMINATION SCORES ANALYSIS</h4>
          <div className="h-80 mb-8">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={report.subjects.map((subject: any, index: number) => {
                  const currentScores = getCurrentScores(subject);
                  const previousScore = previousScores.find(p => p.subject_id === subject.subject_id);
                  return {
                    subject: index + 1, // Use subject number for x-axis
                    subjectName: subject.subject_name,
                    "Previous Exams Total (100)": previousScore?.previous_exam_total || 0,
                    "Current Exams Total (100)": currentScores.examTotal
                  };
                })}
                margin={{
                  top: 20,
                  right: 30,
                  left: 20,
                  bottom: 20,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis 
                  dataKey="subject" 
                  fontSize={12}
                  stroke="#333"
                  domain={[1, 10]}
                />
                <YAxis 
                  fontSize={12}
                  stroke="#333"
                  domain={[0, 100]}
                />
                <Legend />
                <Line 
                  type="linear" 
                  dataKey="Previous Exams Total (100)" 
                  stroke="#4682b4" 
                  strokeWidth={3}
                  dot={{ fill: '#4682b4', strokeWidth: 2, r: 4 }}
                />
                <Line 
                  type="linear" 
                  dataKey="Current Exams Total (100)" 
                  stroke="#ff8c42" 
                  strokeWidth={3}
                  dot={{ fill: '#ff8c42', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Note about Previous Scores */}
        <div className="mt-6 text-center text-xs text-gray-500 italic">
          * Previous scores are currently set to 0 as no historical data is available. 
          Future implementations will display actual previous term scores.
        </div>
      </div>
    </div>
  );
});

export default ReportCardThirdPage; 