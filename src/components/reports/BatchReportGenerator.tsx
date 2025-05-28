import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { CheckCircle, AlertCircle, Clock, Folder, ChevronDown, ChevronUp, Download, Trash2, Loader2 } from "lucide-react";
import ClassReportList from "./ClassReportList";
import ReportCardModal from "./ReportCardModal";
import { generateStudentReport, calculateSubjectPositions, calculateOverallPosition } from "./reportUtils";
import JSZip from "jszip";
import * as React from "react";
import * as ReactDOM from "react-dom/client";
import ReportCardTemplate from "./ReportCardTemplate";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

// Report type used for PDF generation
type Report = {
  student: {
    id: string;
    name: string;
    student_id: string;
    [key: string]: any; // Allow additional student properties
  };
  term: string;
  academicYear: string;
  class: {
    id: string;
    name: string;
    [key: string]: any; // Allow additional class properties
  };
  attendance: {
    present: number;
    total: number;
  };
  position: string;
  subjects: Array<{
    subject_id: string;
    subject_name: string;
    continuous_assessment: number;
    exam_score: number;
    total_score: number;
    grade: string;
    position: string;
    remark: string;
    raw_scores: { [key: string]: number };
  }>;
  school: {
    id: string;
    name: string;
    address: string;
    phone?: string;
    email?: string;
    crest_url?: string;
    [key: string]: any; // Allow additional school properties
  };
};

type ClassReport = {
  classId: string;
  className: string;
  status: 'pending' | 'generating' | 'completed' | 'error';
  progress: number;
  reports: Report[];
  academicYear: string;
  term: string;
  error?: string;
};

type Props = {
  school: any;
  classes: any[];
};

// Helper function to save reports to localStorage with better organization
const saveReportsToLocalStorage = (schoolId: string, reports: ClassReport[]) => {
  try {
    // Get existing stored reports
    const existingReportsStr = localStorage.getItem(`reports_${schoolId}`);
    let allReportGroups: ReportGroup[] = [];
    
    if (existingReportsStr) {
      try {
        // Try to parse as the new format (array of ReportGroup objects)
        const parsed = JSON.parse(existingReportsStr);
        
        // Validate that it's an array
        if (Array.isArray(parsed)) {
          // Filter out any invalid entries
          allReportGroups = parsed.filter(group => 
            group && typeof group === 'object' && group.classReport
          );
        }
      } catch (parseError) {
        console.error('Error parsing existing reports:', parseError);
        // If parsing fails, start with empty array
        allReportGroups = [];
      }
    }
    
    // Process each new report
    for (const report of reports) {
      // Format the timestamp for better readability
      const now = new Date();
      const timestamp = now.toISOString();
      const formattedDate = new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(now);
      
      // Create a unique group ID based on class, term, and academic year
      const groupId = `${report.classId}_${report.term}_${report.academicYear}`;
      
      // Create a descriptive name for the report group
      const groupName = `${report.className} - ${report.term} ${report.academicYear} (Generated ${formattedDate})`;
      
      // Remove any existing reports with the same class, term, and academic year
      allReportGroups = allReportGroups.filter(group => 
        group.id !== groupId
      );
      
      // Add the new report group
      if (report.status === 'completed') {
        allReportGroups.push({
          id: groupId,
          name: groupName,
          timestamp,
          classReport: report
        });
      }
    }
    
    // Sort report groups by timestamp (newest first)
    allReportGroups.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    
    // Save all report groups back to localStorage
    localStorage.setItem(`reports_${schoolId}`, JSON.stringify(allReportGroups));
    console.log('Reports saved to localStorage with organization');
  } catch (error) {
    console.error('Error saving reports to localStorage:', error);
  }
};

// Define a type for organized report groups
type ReportGroup = {
  id: string;           // Unique ID based on class, term, and academic year
  name: string;         // Descriptive name including class, term, academic year, and generation time
  timestamp: string;    // ISO timestamp when the report was generated
  classReport: ClassReport; // The actual report data
};

// Helper function to load reports from localStorage
const loadReportsFromLocalStorage = (schoolId: string): ClassReport[] => {
  try {
    const savedReports = localStorage.getItem(`reports_${schoolId}`);
    if (savedReports) {
      try {
        // Parse the saved report groups
        const reportGroups: ReportGroup[] = JSON.parse(savedReports);
        
        // Extract just the ClassReport objects from each group and filter out any invalid entries
        return reportGroups
          .filter(group => group && group.classReport) // Ensure group and classReport exist
          .map(group => group.classReport);
      } catch (parseError) {
        console.error('Error parsing report groups:', parseError);
        // If we can't parse the new format, try parsing the old format directly
        const oldFormatReports = JSON.parse(savedReports);
        if (Array.isArray(oldFormatReports)) {
          return oldFormatReports;
        }
      }
    }
  } catch (error) {
    console.error('Error loading reports from localStorage:', error);
  }
  return [];
};

const BatchReportGenerator = ({ school, classes }: Props) => {
  const [selectedClassId, setSelectedClassId] = useState("");
  const [academicYear, setAcademicYear] = useState(new Date().getFullYear() + "/" + (new Date().getFullYear() + 1));
  const [term, setTerm] = useState("First Term");
  const [classReports, setClassReports] = useState<ClassReport[]>([]);
  const [expandedClass, setExpandedClass] = useState<string | null>(null);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [availableAcademicYears, setAvailableAcademicYears] = useState<string[]>([]);
  const [availableTerms, setAvailableTerms] = useState<string[]>([]);
  const [dataAvailable, setDataAvailable] = useState(false);
  const [loading, setLoading] = useState(false);

  // Load saved reports when component mounts
  useEffect(() => {
    if (school?.id) {
      const savedReports = loadReportsFromLocalStorage(school.id);
      if (savedReports && savedReports.length > 0) {
        setClassReports(savedReports);
        
        // If we have completed reports, expand the first one
        // Add null check to prevent errors with undefined status
        const completedReports = savedReports.filter(r => r && r.status === 'completed');
        if (completedReports.length > 0) {
          setExpandedClass(completedReports[0].classId);
        }
      }
    }
  }, [school?.id]);
  
  // Function to get a descriptive name for a report
  const getReportGroupName = (report: ClassReport): string => {
    const formattedDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    
    return `${report.className} - ${report.term} ${report.academicYear} (Generated ${formattedDate})`;
  };

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
    if (!selectedClassId || !academicYear || !term) {
      alert("Please select a class, academic year, and term.");
      return;
    }

    try {
      // Find the class details
      const selectedClass = classes.find(c => c.id === selectedClassId);
      if (!selectedClass) {
        throw new Error("Selected class not found.");
      }

      // Initialize class report
      const newClassReport: ClassReport = {
        classId: selectedClassId,
        className: selectedClass.name,
        status: 'generating',
        progress: 0,
        reports: [],
        academicYear,
        term
      };

      // Add to class reports
      setClassReports(prev => {
        // Remove any existing report for this class
        const filteredReports = prev.filter(r => r.classId !== selectedClassId);
        const updatedReports = [...filteredReports, newClassReport];
        
        // Save to localStorage
        if (school?.id) {
          saveReportsToLocalStorage(school.id, updatedReports);
        }
        
        return updatedReports;
      });

      // Expand this class
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
      const generatedReports: Report[] = [];
      let progress = 20;
      const progressIncrement = 70 / students.length;

      for (const student of students) {
        try {
          // Find the selected class object
          const selectedClass = classes.find((c: any) => c.id === selectedClassId);
          if (!selectedClass) continue;
          
          // Call generateStudentReport with all required parameters in the correct order
          const report: Report = await generateStudentReport(student, subjects, selectedClass, school, academicYear, term);
          
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

  const updateClassReportCompleted = (classId: string, reports: Report[]) => {
    // Sort reports by position (1, 2, 3, etc.)
    const sortedReports = [...reports].sort((a, b) => {
      // Convert position to number for comparison, handle any non-numeric positions
      const posA = parseInt(a.position) || Number.MAX_SAFE_INTEGER;
      const posB = parseInt(b.position) || Number.MAX_SAFE_INTEGER;
      return posA - posB;
    });

    setClassReports(prevReports => {
      const updatedReports = prevReports.map(report => {
        if (report.classId === classId) {
          return {
            ...report,
            status: 'completed' as const,
            progress: 100,
            reports: sortedReports
          };
        }
        return report;
      });
      
      // Save to localStorage after updating
      if (school?.id) {
        saveReportsToLocalStorage(school.id, updatedReports);
      }
      
      return updatedReports;
    });
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

  const viewReport = (report: Report) => {
    setSelectedReport(report);
  };

  const deleteReportGroup = (classId: string) => {
    if (window.confirm('Are you sure you want to delete this report group? This action cannot be undone.')) {
      setClassReports(prevReports => {
        // Find the report to be deleted to get its details
        const reportToDelete = prevReports.find(report => report.classId === classId);
        if (!reportToDelete) return prevReports;

        // Filter out the deleted report
        const updatedReports = prevReports.filter(report => report.classId !== classId);
        
        // Update localStorage with the updated reports
        if (school?.id) {
          // First, get the existing saved reports
          const savedReports = localStorage.getItem(`reports_${school.id}`);
          if (savedReports) {
            try {
              const reportGroups: ReportGroup[] = JSON.parse(savedReports);
              // Filter out the deleted report group
              const updatedGroups = reportGroups.filter(group => 
                !(group.classReport.classId === classId && 
                  group.classReport.term === reportToDelete.term && 
                  group.classReport.academicYear === reportToDelete.academicYear)
              );
              // Save back to localStorage
              localStorage.setItem(`reports_${school.id}`, JSON.stringify(updatedGroups));
            } catch (error) {
              console.error('Error updating localStorage after deletion:', error);
              // If parsing fails, just save the updated reports directly
              saveReportsToLocalStorage(school.id, updatedReports);
            }
          } else {
            saveReportsToLocalStorage(school.id, updatedReports);
          }
        }
        
        // If the deleted report was expanded, collapse it
        if (expandedClass === classId) {
          setExpandedClass(null);
        }
        
        return updatedReports;
      });
    }
  };

  const [isGeneratingPdf, setIsGeneratingPdf] = useState<string | null>(null);

  const downloadAllReports = async (classId: string) => {
    const classReport = classReports.find(report => report.classId === classId);
    if (!classReport || classReport.status !== 'completed') return;

    try {
      setIsGeneratingPdf(classId);
      const zip = new JSZip();
      
      // Process reports one by one to avoid memory issues
      for (const report of classReport.reports) {
        try {
          // Create a temporary container for the report
          const container = document.createElement('div');
          container.style.position = 'absolute';
          container.style.left = '-9999px';
          container.style.width = '210mm';
          container.style.padding = '20mm';
          document.body.appendChild(container);

          // Create a root and render the ReportCardTemplate
          const root = ReactDOM.createRoot(container);
          root.render(
            React.createElement('div', { className: 'report-print' },
              React.createElement(ReportCardTemplate, { report })
            )
          );

          // Wait for the component to render
          await new Promise(resolve => setTimeout(resolve, 300));
          
          // Convert the component to a canvas
          const canvas = await html2canvas(container, {
            scale: 2, // Higher scale for better quality
            useCORS: true,
            logging: false,
            allowTaint: true,
          } as any); // Type assertion to bypass TypeScript error

          // Create a new PDF
          const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4',
          });

          // Add the image to the PDF
          const imgData = canvas.toDataURL('image/png');
          const pdfWidth = pdf.internal.pageSize.getWidth();
          const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
          pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');

          // Add PDF to zip
          const pdfBlob = pdf.output('blob');
          zip.file(`${report.student.name.replace(/\s+/g, '_')}_Report.pdf`, pdfBlob);
          
          // Clean up
          root.unmount();
          document.body.removeChild(container);
        } catch (error) {
          console.error(`Error generating PDF for ${report.student.name}:`, error);
        }
      }

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
      console.error('Error generating reports:', error);
      alert('Error generating reports. Please try again.');
    } finally {
      setIsGeneratingPdf(null);
    }
  };

  return (
    <div className="p-4">
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
              <div key={classReport.classId} className="mb-4 overflow-hidden border rounded-lg">
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
                          ? `${classReport.reports.length} reports - ${classReport.term} ${classReport.academicYear}`
                          : classReport.status === 'error'
                          ? 'Error generating reports'
                          : 'Pending generation'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    {classReport.status === 'completed' && (
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={(e: React.MouseEvent) => {
                            e.stopPropagation();
                            downloadAllReports(classReport.classId);
                          }}
                          disabled={isGeneratingPdf === classReport.classId}
                          className={`px-3 py-1 text-xs text-white rounded flex items-center ${
                            isGeneratingPdf === classReport.classId 
                              ? 'bg-green-400 cursor-not-allowed' 
                              : 'bg-green-600 hover:bg-green-700'
                          }`}
                          title="Download all reports as PDF"
                        >
                          {isGeneratingPdf === classReport.classId ? (
                            <>
                              <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                              Preparing...
                            </>
                          ) : (
                            <>
                              <Download className="w-3 h-3 mr-1" />
                              Download All
                            </>
                          )}
                        </button>
                        <button
                          onClick={(e: React.MouseEvent) => {
                            e.stopPropagation();
                            deleteReportGroup(classReport.classId);
                          }}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded-full transition-colors"
                          title="Delete report group"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
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