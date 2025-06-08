import { forwardRef } from "react";
import { toOrdinal } from "../../utils/format";
import { GRADING_SCALE } from "../../utils/gradingSystem";

const ReportCardTemplate = forwardRef<HTMLDivElement, { report: any }>(({ report }, ref) => {
  return (
    <div ref={ref} className="report-card">
      {/* Report Card Template */}
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center border-b-2 border-gray-300 pb-4">
          <div className="flex justify-between items-center">
            {report.school.crest_url ? (
              <img 
                src={report.school.crest_url} 
                alt="School Crest" 
                className="h-20 w-auto"
              />
            ) : (
              <div className="h-20 w-20"></div>
            )}
            <div>
              <h1 className="text-2xl font-bold text-red-800">{report.school.name}</h1>
              <p className="text-sm text-gray-600">{report.school.address}</p>
              <p className="text-sm text-gray-600">Tel: {report.school.phone || 'N/A'}</p>
              <p className="text-sm text-gray-600">Email: {report.school.email || 'N/A'}</p>
            </div>
            {report.school.crest_url ? (
              <img 
                src={report.school.crest_url} 
                alt="School Crest" 
                className="h-20 w-auto"
              />
            ) : (
              <div className="h-20 w-20"></div>
            )}
          </div>
          <div className="mt-4">
            <h2 className="text-xl font-semibold text-blue-600">STUDENT'S REPORT CARD</h2>
            <p className="text-sm text-blue-500">{report.term} - {report.academicYear}</p>
          </div>
        </div>

        {/* Student Information */}
        <div className="grid grid-cols-2 gap-4 mt-4 border-b-2 border-gray-300 pb-4 text-sm">
          <div>
            <p><span className="font-bold">Student ID:</span> {report.student.student_id}</p>
            <p><span className="font-bold">Student Name:</span> {report.student.name}</p>
            <p><span className="font-bold">Class:</span> {report.class.name}</p>
          </div>
          <div>
            <p><span className="font-bold">Attendance:</span> {report.attendance.present}/{report.attendance.total} days</p>
            <p><span className="font-bold">Position:</span> {toOrdinal(report.position)}</p>
            <p><span className="font-semibold">Academic Year:</span> {report.academicYear}</p>
          </div>
        </div>

        {/* Academic Performance */}
        <div className="mt-4">
          <h3 className="text-lg font-semibold mb-2">Academic Performance</h3>
          <table className="min-w-full border border-gray-300">
            <thead>
              <tr className="bg-gray-100 text-xs font-normal">
                <th className="border border-gray-300 px-4 py-2 text-center font-normal">Subject</th>
                <th className="border border-gray-300 px-4 py-2 text-center font-normal">
                  Class Score<br /><span className="block text-[10px] font-normal">(50%)</span>
                </th>
                <th className="border border-gray-300 px-4 py-2 text-center font-normal">
                  Exam Score<br /><span className="block text-[10px] font-normal">(50%)</span>
                </th>
                <th className="border border-gray-300 px-4 py-2 text-center font-normal">
                  Overall<br /><span className="block text-[10px] font-normal">(100%)</span>
                </th>
                <th className="border border-gray-300 px-4 py-2 text-center font-normal">Grade</th>
                <th className="border border-gray-300 px-4 py-2 text-center font-normal">Position</th>
                <th className="border border-gray-300 px-4 py-2 text-center font-normal">Remark</th>
              </tr>
            </thead>
            <tbody className="text-xs">
              {report.subjects.map((subject: any, index: any) => (
                <tr key={subject.subject_id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="border border-gray-300 px-4 py-2">{subject.subject_name}</td>
                  <td className="border border-gray-300 px-4 py-2 text-center">{subject.continuous_assessment}</td>
                  <td className="border border-gray-300 px-4 py-2 text-center">{subject.exam_score}</td>
                  <td className="border border-gray-300 px-4 py-2 text-center font-semibold">{subject.total_score}</td>
                  <td className="border border-gray-300 px-4 py-2 text-center">{subject.grade}</td>
                  <td className="border border-gray-300 px-4 py-2 text-center">{subject.position}</td>
                  <td className="border border-gray-300 px-4 py-2">{subject.remark}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Grading System and Comments */}
        <div className="mt-6 grid grid-cols-2 gap-6 items-start">
          {/* Left Section - Grading System */}
          <div className="flex flex-col h-full">
            <h3 className="text-md font-semibold mb-2">Grading System</h3>
            <div className="border border-gray-300 rounded flex-1 flex flex-col">
              <div className="overflow-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border border-gray-300 px-3 py-2 text-sm font-medium">Score Range</th>
                      <th className="border border-gray-300 px-3 py-2 text-sm font-medium">Grade</th>
                      <th className="border border-gray-300 px-3 py-2 text-sm font-medium">Remark</th>
                    </tr>
                  </thead>
                  <tbody className="text-xs">
                    {GRADING_SCALE.map((row, index) => (
                      <tr key={index}>
                        <td className="border border-gray-300 px-3 py-1.5">{row.range}</td>
                        <td className="border border-gray-300 px-3 py-1.5 text-center">{row.grade}</td>
                        <td className="border border-gray-300 px-3 py-1.5">{row.remark}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          
          {/* Right Section - Comments */}
          <div className="flex flex-col h-full">
            <h3 className="text-md font-semibold mb-2">Comments</h3>
            <div className="border border-gray-300 rounded flex-1 flex flex-col">
              <div className="flex-1 p-3 border-b border-gray-200">
                <p className="text-sm font-medium mb-1">Class Teacher's Comment:</p>
                <div className="h-16"></div>
              </div>
              <div className="flex-1 p-3">
                <p className="text-sm font-medium mb-1">HeadTeacher's Comment:</p>
                <div className="h-16"></div>
              </div>
            </div>
            
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="border-t border-gray-400 pt-2 mt-6">
                  <p className="text-xs text-gray-600">Class Teacher's Signature</p>
                </div>
              </div>
              <div className="text-center">
                <div className="border-t border-gray-400 pt-2 mt-6">
                  <p className="text-xs text-gray-600">HeadTeacher's Signature</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

export default ReportCardTemplate;