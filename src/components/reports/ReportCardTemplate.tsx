import React, { forwardRef } from "react";

const ReportCardTemplate = forwardRef(({ report }, ref) => {
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
        <div className="grid grid-cols-2 gap-4 mt-4 border-b-2 border-gray-300 pb-4">
          <div>
            <p><span className="font-semibold">Student ID:</span> {report.student.student_id}</p>
            <p><span className="font-sem ibold">Student Name:</span> {report.student.name}</p>
            <p><span className="font-semibold">Class:</span> {report.class.name}</p>
          </div>
          <div>
            <p><span className="font-semibold">Attendance:</span> {report.attendance.present}/{report.attendance.total} days</p>
            <p><span className="font-semibold">Position:</span> {report.position}</p>
            <p><span className="font-semibold">Academic Year:</span> {report.academicYear}</p>
          </div>
        </div>

        {/* Academic Performance */}
        <div className="mt-4">
          <h3 className="text-lg font-semibold mb-2">Academic Performance</h3>
          <table className="min-w-full border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 px-4 py-2 text-left">Subject</th>
                <th className="border border-gray-300 px-4 py-2 text-center">CA (50%)</th>
                <th className="border border-gray-300 px-4 py-2 text-center">Exam (50%)</th>
                <th className="border border-gray-300 px-4 py-2 text-center">Total (100%)</th>
                <th className="border border-gray-300 px-4 py-2 text-center">Grade</th>
                <th className="border border-gray-300 px-4 py-2 text-center">Position</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Remark</th>
              </tr>
            </thead>
            <tbody>
              {report.subjects.map((subject, index) => (
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

        {/* Grading System */}
        <div className="mt-6 grid grid-cols-2 gap-4">
          <div>
            <h3 className="text-md font-semibold mb-2">Grading System</h3>
            <table className="min-w-full border border-gray-300 text-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 px-2 py-1">Score Range</th>
                  <th className="border border-gray-300 px-2 py-1">Grade</th>
                  <th className="border border-gray-300 px-2 py-1">Remark</th>
                </tr>
              </thead>
              <tbody className="text-xs">
                <tr><td className="border border-gray-300 px-2 py-1">80-100</td><td className="border border-gray-300 px-2 py-1">1</td><td className="border border-gray-300 px-2 py-1">Excellent</td></tr>
                <tr><td className="border border-gray-300 px-2 py-1">75-79</td><td className="border border-gray-300 px-2 py-1">2</td><td className="border border-gray-300 px-2 py-1">Very Good</td></tr>
                <tr><td className="border border-gray-300 px-2 py-1">70-74</td><td className="border border-gray-300 px-2 py-1">3</td><td className="border border-gray-300 px-2 py-1">Good</td></tr>
                <tr><td className="border border-gray-300 px-2 py-1">65-69</td><td className="border border-gray-300 px-2 py-1">4</td><td className="border border-gray-300 px-2 py-1">Credit</td></tr>
                <tr><td className="border border-gray-300 px-2 py-1">60-64</td><td className="border border-gray-300 px-2 py-1">5</td><td className="border border-gray-300 px-2 py-1">Average</td></tr>
                <tr><td className="border border-gray-300 px-2 py-1">50-59</td><td className="border border-gray-300 px-2 py-1">6</td><td className="border border-gray-300 px-2 py-1">Below Average</td></tr>
                <tr><td className="border border-gray-300 px-2 py-1">45-49</td><td className="border border-gray-300 px-2 py-1">7</td><td className="border border-gray-300 px-2 py-1">Pass</td></tr>
                <tr><td className="border border-gray-300 px-2 py-1">40-44</td><td className="border border-gray-300 px-2 py-1">8</td><td className="border border-gray-300 px-2 py-1">Developing</td></tr>
                <tr><td className="border border-gray-300 px-2 py-1">0-39</td><td className="border border-gray-300 px-2 py-1">9</td><td className="border border-gray-300 px-2 py-1">Emerging</td></tr>
              </tbody>
            </table>
          </div>
          
          <div>
            <h3 className="text-md font-semibold mb-2">Comments</h3>
            <div className="border border-gray-300 p-2 h-40">
              <p className="text-sm mb-2"><span className="font-semibold">Class Teacher's Comment:</span> </p>
              <p className="text-sm mt-6"><span className="font-semibold">Principal's Comment:</span> </p>
            </div>
            
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="border-t border-gray-400 pt-1 mt-8">
                  <p className="text-sm">Class Teacher's Signature</p>
                </div>
              </div>
              <div className="text-center">
                <div className="border-t border-gray-400 pt-1 mt-8">
                  <p className="text-sm">Principal's Signature</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center border-t border-gray-300 pt-4">
          <p className="text-sm text-gray-600">Report generated on {new Date().toLocaleDateString()}</p>
        </div>
      </div>
    </div>
  );
});

export default ReportCardTemplate;