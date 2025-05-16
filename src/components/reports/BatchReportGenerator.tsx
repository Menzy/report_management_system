import React, { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { CheckCircle, AlertCircle, Clock, Folder, ChevronDown, ChevronUp, Download } from "lucide-react";
import ClassReportList from "./ClassReportList";
import ReportCardModal from "./ReportCardModal";
import { generateStudentReport, calculateSubjectPositions, calculateOverallPosition } from "./reportUtils";
import JSZip from "jszip";

type ClassReport = {
  classId: string;
  className: string;
  status: 'pending' | 'generating' | 'completed' | 'error';
  progress: number;
  reports: any[];
  academicYear: string;
  term: string;
  error?: string;
};

type Props = {
  school: any;
  classes: any[];
};

const BatchReportGenerator = ({ school, classes }: Props) => {
  const [selectedClassId, setSelectedClassId] = useState("");
  const [academicYear, setAcademicYear] = useState(new Date().getFullYear() + "/" + (new Date().getFullYear() + 1));
  const [term, setTerm] = useState("First Term");
  const [classReports, setClassReports] = useState<ClassReport[]>([]);
  const [expandedClass, setExpandedClass] = useState<string | null>(null);
  const [selectedReport, setSelectedReport] = useState<any | null>(null);
  const [availableAcademicYears, setAvailableAcademicYears] = useState<string[]>([]);
  const [availableTerms, setAvailableTerms] = useState<string[]>([]);
  const [dataAvailable, setDataAvailable] = useState(false);
  const [loading, setLoading] = useState(false);

  // Fetch available terms and academic years when component mounts or class changes
  useEffect(() => {
    if (selectedClassId) {
      fetchAvailableData();
    }
  }, [selectedClassId]);

  // Check if data is available for the current selection
  useEffect(() => {
    if (selectedClassId) {
      checkDataAvailability();
    }
  }, [selectedClassId, term, academicYear]);

  // Fetch available terms and academic years for the selected class
  const fetchAvailableData = async () => {
    setLoading(true);
    try {
      // Fetch all scores for the selected class to determine available terms and years
      const { data: subjects, error: subjectsError } = await supabase
        .from("subjects")
        .select("id")
        .eq("class_id", selectedClassId);

      if (subjectsError) throw subjectsError;
      if (!subjects || subjects.length === 0) {
        setAvailableTerms([]);
        setAvailableAcademicYears([]);
        setDataAvailable(false);
        setLoading(false);
        return;
      }

      const subjectIds = subjects.map(s => s.id);

      const { data: scores, error: scoresError } = await supabase
        .from("scores")
        .select("term, academic_year")
        .in("subject_id", subjectIds);

      if (scoresError) throw scoresError;

      if (scores && scores.length > 0) {
        // Extract unique terms and academic years
        const terms = [...new Set(scores.map(s => s.term).filter(Boolean))];
        const years = [...new Set(scores.map(s => s.academic_year).filter(Boolean))];

        setAvailableTerms(terms);
        setAvailableAcademicYears(years);

        // Set default values if current selection is not available
        if (terms.length > 0 && !terms.includes(term)) {
          setTerm(terms[0]);
        }

        if (years.length > 0 && !years.includes(academicYear)) {
          setAcademicYear(years[0]);
        }
      } else {
        setAvailableTerms([]);
        setAvailableAcademicYears([]);
      }
    } catch (err) {
      console.error("Error fetching available data:", err);
    } finally {
      setLoading(false);
    }
  };

  // Check if data is available for the current selection
  const checkDataAvailability = async () => {
    if (!selectedClassId || !term || !academicYear) {
      setDataAvailable(false);
      return;
    }

    setLoading(true);
    try {
      // Fetch subjects for this class
      const { data: subjects, error: subjectsError } = await supabase
        .from("subjects")
        .select("id")
        .eq("class_id", selectedClassId);

      if (subjectsError) throw subjectsError;
      if (!subjects || subjects.length === 0) {
        setDataAvailable(false);
        return;
      }

      const subjectIds = subjects.map(s => s.id);

      // Check if scores exist for the selected term and academic year
      const { data: scores, error: scoresError } = await supabase
        .from("scores")
        .select("id")
        .in("subject_id", subjectIds)
        .eq("term", term)
        .eq("academic_year", academicYear);

      if (scoresError) throw scoresError;

      // Data is available if we have scores for the selected criteria
      setDataAvailable(scores && scores.length > 0);
    } catch (err) {
      console.error("Error checking data availability:", err);
      setDataAvailable(false);
    } finally {
      setLoading(false);
    }
  };

  const handleClassChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedClassId(e.target.value);
  };
  
  const handleTermChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setTerm(e.target.value);
  };
  
  const handleAcademicYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setAcademicYear(e.target.value);
  };

  const handleGenerateBatchReports = async () => {
    if (!selectedClassId) return;

    try {
      // Find the selected class
      const selectedClass = classes.find((c: any) => c.id === selectedClassId);
      if (!selectedClass) return;

      // Check if we already have a report for this class
      const existingReportIndex = classReports.findIndex(report => report.classId === selectedClassId);
      
      // Create or update the class report
      if (existingReportIndex === -1) {
        // Create a new report entry
        setClassReports([
          ...classReports,
          {
            classId: selectedClassId,
            className: selectedClass.name,
            status: "generating" as const,
            progress: 0,
            reports: [],
            academicYear,
            term
          }
        ]);
      } else {
        // Update existing report
        setClassReports(classReports.map((report, index) => 
          index === existingReportIndex ? {
            ...report,
            status: "generating" as const,
            progress: 0,
            reports: [],
            academicYear,
            term
          } : report
        ));
      }

      // Set this class as expanded
      setExpandedClass(selectedClassId);

      // Fetch students for this class
      const { data: students, error: studentsError } = await supabase
        .from("students")
        .select("*")
        .eq("class_id", selectedClassId)
        .order("name", { ascending: true });

      if (studentsError) throw studentsError;

      if (!students || students.length === 0) {
        updateClassReportError(selectedClassId, "No students found in this class");
        return;
      }

      // Update progress
      updateClassReportProgress(selectedClassId, 10);

      // Fetch subjects for this class
      const { data: subjects, error: subjectsError } = await supabase
        .from("subjects")
        .select("*")
        .eq("class_id", selectedClassId);

      if (subjectsError) throw subjectsError;

      if (!subjects || subjects.length === 0) {
        updateClassReportError(selectedClassId, "No subjects found for this class");
        return;
      }

      // Update progress
      updateClassReportProgress(selectedClassId, 20);

      // Generate reports for each student
      const generatedReports = [];
      let progress = 20;
      const progressIncrement = 70 / students.length;

      for (const student of students) {
        try {
          // Find the selected class object
          const selectedClass = classes.find((c: any) => c.id === selectedClassId);
          if (!selectedClass) continue;
          
          // Call generateStudentReport with all required parameters in the correct order
          const report = await generateStudentReport(student, subjects, selectedClass, school, academicYear, term);
          
          // Calculate positions for the report
          await calculateSubjectPositions(report, selectedClassId);
          await calculateOverallPosition(report, selectedClassId);
          generatedReports.push(report);
          progress += progressIncrement;
          updateClassReportProgress(selectedClassId, Math.min(90, Math.round(progress)));
        } catch (err) {
          console.error(`Error generating report for student ${student.name}:`, err);
          // Continue with other students even if one fails
        }
      }

      // Update the class report with the generated reports
      updateClassReportCompleted(selectedClassId, generatedReports);

    } catch (err: unknown) {
      console.error("Error generating batch reports:", err);
      updateClassReportError(selectedClassId, "Error generating reports");
    }
  };

  const updateClassReportProgress = (classId: string, progress: number) => {
    setClassReports(prevReports => 
      prevReports.map(report => 
        report.classId === classId ? 
          { ...report, progress } : 
          report
      )
    );
  };

  const updateClassReportCompleted = (classId: string, reports: any[]) => {
    setClassReports(prevReports => 
      prevReports.map(report => 
        report.classId === classId ? 
          { 
            ...report, 
            status: 'completed' as const, 
            progress: 100, 
            reports 
          } : 
          report
      )
    );
  };

  const updateClassReportError = (classId: string, errorMessage: string) => {
    setClassReports(prevReports => 
      prevReports.map(report => 
        report.classId === classId ? 
          { 
            ...report, 
            status: 'error' as const, 
            error: errorMessage 
          } : 
          report
      )
    );
  };

  const toggleClassExpansion = (classId: string) => {
    if (expandedClass === classId) {
      setExpandedClass(null);
    } else {
      setExpandedClass(classId);
    }
  };

  const viewReport = (report: any) => {
    setSelectedReport(report);
  };

  const downloadAllReports = async (classId: string) => {
    const classReport = classReports.find(report => report.classId === classId);
    if (!classReport || classReport.status !== 'completed') return;

    try {
      const zip = new JSZip();
      
      // Add each report to the zip file
      classReport.reports.forEach(report => {
        const html = generateReportHtml(report);
        zip.file(`${report.student.name.replace(/\s+/g, '_')}_Report.html`, html);
      });
      
      // Generate the zip file
      const content = await zip.generateAsync({ type: 'blob' });
      
      // Create a download link and trigger the download
      const link = document.createElement('a');
      link.href = URL.createObjectURL(content);
      link.download = `${classReport.className}_${classReport.term}_${classReport.academicYear}_Reports.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error downloading reports:', error);
      alert('Error downloading reports. Please try again.');
    }
  };

  const generateReportHtml = (report: any) => {
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
    <div className="mb-6 p-6 border border-gray-200 rounded-lg bg-gray-50">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Generate Batch Report Cards</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
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
            {classes.map((classItem: any) => (
              <option key={classItem.id} value={classItem.id}>
                {classItem.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="batchTerm" className="block text-sm font-medium text-gray-700 mb-1">
            Term/Semester
          </label>
          <select
            id="batchTerm"
            value={term}
            onChange={handleTermChange}
            disabled={availableTerms.length === 0 || !selectedClassId}
            className={`block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${(availableTerms.length === 0 || !selectedClassId) ? 'bg-gray-100 cursor-not-allowed' : ''}`}
          >
            {availableTerms.length > 0 ? (
              availableTerms.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))
            ) : (
              <option value="">No terms available</option>
            )}
          </select>
        </div>

        <div>
          <label htmlFor="batchAcademicYear" className="block text-sm font-medium text-gray-700 mb-1">
            Academic Year
          </label>
          <select
            id="batchAcademicYear"
            value={academicYear}
            onChange={handleAcademicYearChange}
            disabled={availableAcademicYears.length === 0 || !selectedClassId}
            className={`block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${(availableAcademicYears.length === 0 || !selectedClassId) ? 'bg-gray-100 cursor-not-allowed' : ''}`}
          >
            {availableAcademicYears.length > 0 ? (
              availableAcademicYears.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))
            ) : (
              <option value="">No academic years available</option>
            )}
          </select>
        </div>
      </div>

      {loading && (
        <div className="flex justify-center my-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
        </div>
      )}

      {selectedClassId && !loading && !dataAvailable && (
        <div className="mb-4 p-3 bg-yellow-50 text-yellow-700 rounded-md">
          No data available for the selected term and academic year. Please select different criteria or upload data first.
        </div>
      )}

      <div className="flex justify-end">
        <button
          onClick={handleGenerateBatchReports}
          disabled={!selectedClassId || !dataAvailable || loading}
          className={`px-4 py-2 rounded-md flex items-center ${!selectedClassId || !dataAvailable || loading ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
        >
          Generate Class Reports
        </button>
      </div>

      {classReports.length > 0 && (
        <div className="mt-8">
          <h4 className="text-lg font-medium text-gray-900 mb-4">Generated Reports</h4>
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
                      <button
                        onClick={(e: React.MouseEvent) => {
                          e.stopPropagation();
                          downloadAllReports(classReport.classId);
                        }}
                        className="mr-2 px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 flex items-center"
                      >
                        <Download className="w-3 h-3 mr-1" />
                        Download All
                      </button>
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
        </div>
      )}

      {selectedReport && (
        <ReportCardModal 
          report={selectedReport} 
          onClose={() => setSelectedReport(null)} 
        />
      )}
    </div>
  );
};

export default BatchReportGenerator;