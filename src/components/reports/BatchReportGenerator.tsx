import React, { useState } from "react";
import { supabase } from "../../lib/supabase";
import { Users, CheckCircle, AlertCircle, Clock, Folder, ChevronDown, ChevronUp, Download } from "lucide-react";
import ClassReportList from "./ClassReportList";
import ReportCardModal from "./ReportCardModal";
import { generateStudentReport, calculateSubjectPositions, calculateOverallPosition } from "./reportUtils";
import JSZip from "jszip";

const BatchReportGenerator = ({ school, classes }) => {
  const [selectedClassId, setSelectedClassId] = useState("");
  const [academicYear, setAcademicYear] = useState(new Date().getFullYear() + "/" + (new Date().getFullYear() + 1));
  const [term, setTerm] = useState("First Term");
  const [classReports, setClassReports] = useState([]);
  const [expandedClass, setExpandedClass] = useState(null);
  const [selectedReport, setSelectedReport] = useState(null);

  const handleClassChange = (e) => {
    setSelectedClassId(e.target.value);
  };

  const handleGenerateBatchReports = async () => {
    if (!selectedClassId) return;

    try {
      // Find the class name
      const classItem = classes.find(c => c.id === selectedClassId);
      if (!classItem) throw new Error("Class not found");

      // Check if we already have a report for this class
      const existingReportIndex = classReports.findIndex(r => r.classId === selectedClassId);
      
      // Create or update the class report entry
      const newClassReport = {
        classId: selectedClassId,
        className: classItem.name,
        status: "generating",
        progress: 0,
        reports: [],
        academicYear,
        term
      };

      if (existingReportIndex >= 0) {
        // Update existing report
        const updatedReports = [...classReports];
        updatedReports[existingReportIndex] = newClassReport;
        setClassReports(updatedReports);
      } else {
        // Add new report
        setClassReports([...classReports, newClassReport]);
      }

      // Set this class as expanded
      setExpandedClass(selectedClassId);

      // Fetch all students in this class
      const { data: students, error: studentsError } = await supabase
        .from("students")
        .select("*")
        .eq("class_id", selectedClassId)
        .order("name", { ascending: true });

      if (studentsError) throw studentsError;

      if (!students || students.length === 0) {
        throw new Error("No students found in this class");
      }

      // Fetch all subjects for this class
      const { data: subjects, error: subjectsError } = await supabase
        .from("subjects")
        .select("*")
        .eq("class_id", selectedClassId)
        .order("name", { ascending: true });

      if (subjectsError) throw subjectsError;

      if (!subjects || subjects.length === 0) {
        throw new Error("No subjects found for this class");
      }

      // Generate reports for each student
      const generatedReports = [];
      
      for (let i = 0; i < students.length; i++) {
        const student = students[i];
        
        // Update progress
        const progress = Math.round(((i + 1) / students.length) * 100);
        updateClassReportProgress(selectedClassId, progress);
        
        // Generate student report
        try {
          const report = await generateStudentReport(student, subjects, classItem, school, academicYear, term);
          
          // Calculate positions
          await calculateSubjectPositions(report, student.class_id);
          await calculateOverallPosition(report, student.class_id);
          
          generatedReports.push(report);
        } catch (err) {
          console.error(`Error generating report for student ${student.name}:`, err);
          // Continue with other students
        }
      }

      // Sort reports by position
      generatedReports.sort((a, b) => {
        const aPosition = parseInt(a.position.split(" ")[0]);
        const bPosition = parseInt(b.position.split(" ")[0]);
        return aPosition - bPosition;
      });

      // Update the class report with the generated reports
      updateClassReportCompleted(selectedClassId, generatedReports);
    } catch (err) {
      console.error("Error generating batch reports:", err);
      updateClassReportError(selectedClassId, err.message);
    }
  };

  const updateClassReportProgress = (classId, progress) => {
    setClassReports(prevReports => 
      prevReports.map(report => 
        report.classId === classId 
          ? { ...report, progress } 
          : report
      )
    );
  };

  const updateClassReportCompleted = (classId, reports) => {
    setClassReports(prevReports => 
      prevReports.map(report => 
        report.classId === classId 
          ? { 
              ...report, 
              status: "completed", 
              reports,
              progress: 100
            } 
          : report
      )
    );
  };

  const updateClassReportError = (classId, errorMessage) => {
    setClassReports(prevReports => 
      prevReports.map(report => 
        report.classId === classId 
          ? { 
              ...report, 
              status: "error", 
              error: errorMessage
            } 
          : report
      )
    );
  };

  const toggleClassExpansion = (classId) => {
    if (expandedClass === classId) {
      setExpandedClass(null);
    } else {
      setExpandedClass(classId);
    }
  };

  const viewReport = (report) => {
    setSelectedReport(report);
  };

  const downloadAllReports = (classId) => {
    const classReport = classReports.find(r => r.classId === classId);
    if (!classReport || classReport.status !== "completed") return;
    
    // Create a zip file with all reports
    const zip = new JSZip();
    
    // Add each report to the zip file
    classReport.reports.forEach(report => {
      // Generate HTML content for the report
      const reportHtml = generateReportHtml(report);
      
      // Add the report to the zip file
      const fileName = `${report.student.name.replace(/\s+/g, '_')}_${classReport.term}_${classReport.academicYear}.html`;
      zip.file(fileName, reportHtml);
    });
    
    // Generate the zip file
    zip.generateAsync({ type: 'blob' }).then(content => {
      // Create a download link
      const url = URL.createObjectURL(content);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${classReport.className}_Reports_${classReport.term}_${classReport.academicYear}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
  };

  const generateReportHtml = (report) => {
    // Generate HTML content for the report
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Report Card - ${report.student.name}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
          .report-card { max-width: 800px; margin: 0 auto; }
          .header { text-align: center; border-bottom: 2px solid #ccc; padding-bottom: 15px; display: flex; justify-content: space-between; align-items: center; }
          .school-info { text-align: center; }
          .school-name { font-size: 24px; font-weight: bold; color: #8B0000; }
          .school-address, .school-contact { font-size: 14px; color: #666; }
          .report-title { margin-top: 15px; }
          .report-title h2 { font-size: 20px; color: #0066cc; margin: 0; }
          .report-title p { font-size: 14px; color: #0066cc; margin: 5px 0 0; }
          .student-info { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 15px; border-bottom: 2px solid #ccc; padding-bottom: 15px; }
          .student-info p { margin: 5px 0; }
          .student-info .label { font-weight: bold; }
          .academic-performance { margin-top: 15px; }
          .academic-performance h3 { font-size: 18px; margin-bottom: 10px; }
          table { width: 100%; border-collapse: collapse; }
          th, td { border: 1px solid #ccc; padding: 8px; }
          th { background-color: #f5f5f5; text-align: left; }
          tr:nth-child(even) { background-color: #f9f9f9; }
          .footer { margin-top: 20px; text-align: center; border-top: 1px solid #ccc; padding-top: 10px; font-size: 14px; color: #666; }
          .grading-system { margin-top: 20px; display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
          .comments { border: 1px solid #ccc; padding: 10px; height: 150px; }
          .signatures { margin-top: 15px; display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
          .signature { text-align: center; }
          .signature-line { border-top: 1px solid #444; padding-top: 5px; margin-top: 40px; }
        </style>
      </head>
      <body>
        <div class="report-card">
          <div class="header">
            <div class="logo">${report.school.crest_url ? `<img src="${report.school.crest_url}" alt="School Crest" height="80">` : ''}</div>
            <div class="school-info">
              <div class="school-name">${report.school.name}</div>
              <div class="school-address">${report.school.address}</div>
              <div class="school-contact">
                Tel: ${report.school.phone || 'N/A'}<br>
                Email: ${report.school.email || 'N/A'}
              </div>
            </div>
            <div class="logo">${report.school.crest_url ? `<img src="${report.school.crest_url}" alt="School Crest" height="80">` : ''}</div>
          </div>
          
          <div class="report-title">
            <h2>STUDENT'S REPORT CARD</h2>
            <p>${report.term} - ${report.academicYear}</p>
          </div>
          
          <div class="student-info">
            <div>
              <p><span class="label">Student ID:</span> ${report.student.student_id}</p>
              <p><span class="label">Student Name:</span> ${report.student.name}</p>
              <p><span class="label">Class:</span> ${report.class.name}</p>
            </div>
            <div>
              <p><span class="label">Attendance:</span> ${report.attendance.present}/${report.attendance.total} days</p>
              <p><span class="label">Position:</span> ${report.position}</p>
              <p><span class="label">Academic Year:</span> ${report.academicYear}</p>
            </div>
          </div>
          
          <div class="academic-performance">
            <h3>Academic Performance</h3>
            <table>
              <thead>
                <tr>
                  <th>Subject</th>
                  <th>CA (50%)</th>
                  <th>Exam (50%)</th>
                  <th>Total (100%)</th>
                  <th>Grade</th>
                  <th>Position</th>
                  <th>Remark</th>
                </tr>
              </thead>
              <tbody>
                ${report.subjects.map((subject, index) => `
                  <tr>
                    <td>${subject.subject_name}</td>
                    <td align="center">${subject.continuous_assessment * 0.5}</td>
                    <td align="center">${subject.exam_score * 0.5}</td>
                    <td align="center"><strong>${subject.total_score}</strong></td>
                    <td align="center">${subject.grade}</td>
                    <td align="center">${subject.position}</td>
                    <td>${subject.remark}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
          
          <div class="grading-system">
            <div>
              <h3>Grading System</h3>
              <table>
                <thead>
                  <tr>
                    <th>Score Range</th>
                    <th>Grade</th>
                    <th>Remark</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td>80-100</td><td>1</td><td>Highly Proficient (HP)</td></tr>
                  <tr><td>75-79</td><td>2</td><td>Highly Proficient (HP)</td></tr>
                  <tr><td>70-74</td><td>3</td><td>Proficient (P)</td></tr>
                  <tr><td>65-69</td><td>4</td><td>Proficient (P)</td></tr>
                  <tr><td>60-64</td><td>5</td><td>Proficient (P)</td></tr>
                  <tr><td>50-59</td><td>6</td><td>Approaching Proficiency (AP)</td></tr>
                  <tr><td>45-49</td><td>7</td><td>Developing (D)</td></tr>
                  <tr><td>40-44</td><td>8</td><td>Developing (D)</td></tr>
                  <tr><td>0-39</td><td>9</td><td>Emerging (E)</td></tr>
                </tbody>
              </table>
            </div>
            
            <div>
              <h3>Comments</h3>
              <div class="comments">
                <p><strong>Class Teacher's Comment:</strong> </p>
                <p style="margin-top: 30px;"><strong>Principal's Comment:</strong> </p>
              </div>
              
              <div class="signatures">
                <div class="signature">
                  <div class="signature-line">Class Teacher's Signature</div>
                </div>
                <div class="signature">
                  <div class="signature-line">Principal's Signature</div>
                </div>
              </div>
            </div>
          </div>
          
          <div class="footer">
            <p>Report generated on ${new Date().toLocaleDateString()}</p>
          </div>
        </div>
      </body>
      </html>
    `;
  };

  return (
    <>
      <div className="mb-6 p-6 border border-gray-200 rounded-lg bg-gray-50">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Generate Batch Report Cards</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label htmlFor="batchClass" className="block text-sm font-medium text-gray-700 mb-1">
              Select Class
            </label>
            <select
              id="batchClass"
              value={selectedClassId}
              onChange={handleClassChange}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value="">-- Select Class --</option>
              {classes.map((classItem) => (
                <option key={classItem.id} value={classItem.id}>
                  {classItem.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="batchAcademicYear" className="block text-sm font-medium text-gray-700 mb-1">
              Academic Year
            </label>
            <input
              id="batchAcademicYear"
              type="text"
              value={academicYear}
              onChange={(e) => setAcademicYear(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="e.g., 2024/2025"
            />
          </div>

          <div>
            <label htmlFor="batchTerm" className="block text-sm font-medium text-gray-700 mb-1">
              Term/Semester
            </label>
            <select
              id="batchTerm"
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value="First Term">First Term</option>
              <option value="Second Term">Second Term</option>
              <option value="Third Term">Third Term</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            onClick={handleGenerateBatchReports}
            disabled={!selectedClassId}
            className={`px-4 py-2 rounded-md flex items-center ${
              !selectedClassId
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            <Users className="w-4 h-4 mr-2" />
            Generate Class Reports
          </button>
        </div>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Class Report Cards</h3>
        
        {classReports.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
            <Folder className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No reports generated yet</h3>
            <p className="mt-1 text-sm text-gray-500">
              Select a class and generate reports to see them here.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {classReports.map((classReport) => (
              <div key={classReport.classId} className="border border-gray-200 rounded-lg overflow-hidden">
                <div 
                  className="flex items-center justify-between p-4 bg-gray-50 cursor-pointer"
                  onClick={() => toggleClassExpansion(classReport.classId)}
                >
                  <div className="flex items-center">
                    <div className="mr-3">
                      {classReport.status === 'generating' ? (
                        <Clock className="w-5 h-5 text-blue-500 animate-pulse" />
                      ) : classReport.status === 'completed' ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : classReport.status === 'error' ? (
                        <AlertCircle className="w-5 h-5 text-red-500" />
                      ) : (
                        <Folder className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">{classReport.className}</h4>
                      <p className="text-xs text-gray-500">
                        {classReport.status === 'generating' 
                          ? `Generating reports (${classReport.progress}%)` 
                          : classReport.status === 'completed'
                          ? `${classReport.reports.length} reports generated`
                          : classReport.status === 'error'
                          ? 'Error generating reports'
                          : 'Pending generation'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    {classReport.status === 'completed' && (
                      <>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            downloadAllReports(classReport.classId);
                          }}
                          className="mr-2 px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 flex items-center"
                        >
                          <Download className="w-3 h-3 mr-1" />
                          Download All
                        </button>
                      </>
                    )}
                    {expandedClass === classReport.classId ? (
                      <ChevronUp className="w-5 h-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                </div>
                
                {classReport.status === 'generating' && (
                  <div className="px-4 py-2 border-t border-gray-200">
                    <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
                      <div
                        className="bg-blue-600 h-2.5 rounded-full"
                        style={{ width: `${classReport.progress}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500 text-right">
                      {classReport.progress}% complete
                    </p>
                  </div>
                )}
                
                {classReport.status === 'error' && (
                  <div className="p-4 border-t border-gray-200 bg-red-50 text-red-700 text-sm">
                    {classReport.error || 'An error occurred while generating reports.'}
                  </div>
                )}
                
                {expandedClass === classReport.classId && classReport.status === 'completed' && (
                  <ClassReportList 
                    reports={classReport.reports} 
                    onViewReport={viewReport} 
                  />
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedReport && (
        <ReportCardModal 
          report={selectedReport} 
          onClose={() => setSelectedReport(null)} 
        />
      )}
    </>
  );
};

export default BatchReportGenerator;