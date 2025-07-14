import React, { useState, useRef, useEffect } from 'react';
import { supabase, Class, TERMS, getCurrentAcademicYear } from '../../lib/supabase';
import { ArrowLeft, Upload, FileSpreadsheet, Download, CheckCircle, AlertCircle, X, Trash2 } from 'lucide-react';
import * as XLSX from 'xlsx';
import { showError, showSuccess } from '../../services/modalService';

type BulkSubjectUploadProps = {
  schoolId: string;
  classItem: Class;
  onBack: () => void;
  onSuccess: () => void;
};

type FileData = {
  file: File;
  subjectName: string;
  studentRecords: StudentRecord[];
  validationErrors: ValidationError[];
  isValid: boolean;
};

type StudentRecord = {
  student_id: string;
  name: string;
  scores: { [key: string]: number };
  term: string;
  academic_year: string;
  attendance?: number;
};

type ValidationError = {
  row: number;
  column: string;
  message: string;
};

const BulkSubjectUpload: React.FC<BulkSubjectUploadProps> = ({ 
  schoolId, 
  classItem, 
  onBack, 
  onSuccess 
}) => {
  const [files, setFiles] = useState<FileData[]>([]);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'validating' | 'uploading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedTerm, setSelectedTerm] = useState<string>(TERMS[0]);
  const [academicYear, setAcademicYear] = useState<string>(getCurrentAcademicYear());
  const fileInputRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // Handle escape key and click outside to close
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onBack();
      }
    };

    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onBack();
      }
    };

    document.addEventListener('keydown', handleEscKey);
    document.addEventListener('mousedown', handleClickOutside);
    
    // Prevent body scrolling when modal is open
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleEscKey);
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'unset';
    };
  }, [onBack]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      processFiles(selectedFiles);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const droppedFiles = Array.from(e.dataTransfer.files);
    if (droppedFiles.length > 0) {
      processFiles(droppedFiles);
    }
  };

  const processFiles = async (selectedFiles: File[]) => {
    setUploadStatus('validating');
    setErrorMessage(null);
    
    const processedFiles: FileData[] = [];
    
    for (const file of selectedFiles) {
      // Check file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        setErrorMessage(`File ${file.name} exceeds 10MB limit`);
        setUploadStatus('error');
        return;
      }
      
      // Check file type
      const fileType = file.name.split('.').pop()?.toLowerCase();
      if (fileType !== 'xlsx' && fileType !== 'csv') {
        setErrorMessage(`File ${file.name} is not supported. Only .xlsx and .csv files are allowed.`);
        setUploadStatus('error');
        return;
      }
      
      // Extract subject name from filename (remove extension)
      const subjectName = file.name.replace(/\.(xlsx|csv)$/i, '').trim();
      
      try {
        const fileData = await parseFile(file, subjectName);
        processedFiles.push(fileData);
      } catch (error) {
        setErrorMessage(`Error processing file ${file.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        setUploadStatus('error');
        return;
      }
    }
    
    setFiles(processedFiles);
    
    // Check if all files are valid
    const allValid = processedFiles.every(f => f.isValid);
    setUploadStatus(allValid ? 'idle' : 'error');
  };

  const parseFile = async (file: File, subjectName: string): Promise<FileData> => {
    const data = await file.arrayBuffer();
    const workbook = XLSX.read(data);
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: "" });
    
    const errors: ValidationError[] = [];
    const records: StudentRecord[] = [];
    
    // Check if the file has any data
    if (jsonData.length === 0) {
      errors.push({
        row: 1,
        column: 'File',
        message: 'The file appears to be empty or has no valid data'
      });
      return {
        file,
        subjectName,
        studentRecords: [],
        validationErrors: errors,
        isValid: false
      };
    }
    
    // Check if we have the necessary columns
    const firstRow = jsonData[0] as any;
    const hasStudentId = Object.keys(firstRow).some(key => 
      key.toUpperCase().includes('STUDENT') && key.toUpperCase().includes('ID') ||
      key.toUpperCase().includes('REGISTER') && key.toUpperCase().includes('ID')
    );
    
    const hasStudentName = Object.keys(firstRow).some(key => 
      key.toUpperCase().includes('STUDENT') && key.toUpperCase().includes('NAME')
    );
    
    // Find the actual column names for student ID and name
    const studentIdColumn = Object.keys(firstRow).find(key => 
      key.toUpperCase().includes('STUDENT') && key.toUpperCase().includes('ID') ||
      key.toUpperCase().includes('REGISTER') && key.toUpperCase().includes('ID')
    ) || 'STUDENT REGISTER ID';
    
    const studentNameColumn = Object.keys(firstRow).find(key => 
      key.toUpperCase().includes('STUDENT') && key.toUpperCase().includes('NAME')
    ) || 'STUDENT NAME';
    
    if (!hasStudentId) {
      errors.push({
        row: 1,
        column: 'Header',
        message: 'Missing student ID column. Please include a column with "Student ID" or "Register ID" in the name.'
      });
    }
    
    if (!hasStudentName) {
      errors.push({
        row: 1,
        column: 'Header',
        message: 'Missing student name column. Please include a column with "Student Name" in the name.'
      });
    }
    
    // Find all possible assessment columns (any column that's not student ID or name)
    const possibleAssessmentColumns = Object.keys(firstRow).filter(key => 
      key !== studentIdColumn && 
      key !== studentNameColumn && 
      key.toUpperCase() !== 'ATTENDANCE' &&
      key.toUpperCase() !== 'TERM' &&
      key.toUpperCase() !== 'ACADEMIC YEAR'
    );
    
    // Process each row
    jsonData.forEach((row: any, index) => {
      const studentId = row[studentIdColumn];
      const studentName = row[studentNameColumn];
      
      // Skip rows without both student ID and name
      if (!studentId || !studentName) {
        return;
      }
      
      // Create student record
      const record: StudentRecord = {
        student_id: studentId.toString(),
        name: studentName.toString(),
        scores: {},
        term: row['TERM'] || selectedTerm,
        academic_year: row['ACADEMIC YEAR'] || academicYear
      };
      
      // Process all possible assessment columns
      possibleAssessmentColumns.forEach(key => {
        if (row[key] !== "") {
          const score = Number(row[key]);
          if (!isNaN(score)) {
            record.scores[key] = score;
            
            // Validate score range
            if (score < 0 || score > 100) {
              errors.push({
                row: index + 2,
                column: key,
                message: 'Score must be between 0 and 100'
              });
            }
          } else {
            // Non-numeric value in a score column
            errors.push({
              row: index + 2,
              column: key,
              message: 'Score must be a number'
            });
          }
        } else {
          // Fill missing assessment data with zeros
          record.scores[key] = 0;
        }
      });
      
      // Handle attendance if present
      if (Object.keys(row).includes('ATTENDANCE')) {
        const attendance = Number(row['ATTENDANCE']);
        if (!isNaN(attendance)) {
          record.attendance = attendance;
        } else if (row['ATTENDANCE'] !== "") {
          errors.push({
            row: index + 2,
            column: 'ATTENDANCE',
            message: 'Attendance must be a number'
          });
        }
      }
      
      records.push(record);
    });
    
    return {
      file,
      subjectName,
      studentRecords: records,
      validationErrors: errors,
      isValid: errors.length === 0 && records.length > 0
    };
  };

  const handleUpload = async () => {
    if (files.length === 0 || !files.every(f => f.isValid)) return;
    
    setUploadStatus('uploading');
    setUploadProgress(0);
    
    try {
      let totalOperations = 0;
      let completedOperations = 0;
      
      // Calculate total operations for progress tracking
      files.forEach(fileData => {
        totalOperations += 1; // Creating subject
        totalOperations += fileData.studentRecords.length; // Processing each student
      });
      
      for (const fileData of files) {
        // Create or get subject
        let subjectId: string;
        
        // Check if subject already exists
        const { data: existingSubjects, error: subjectLookupError } = await supabase
          .from('subjects')
          .select('id')
          .eq('name', fileData.subjectName)
          .eq('class_id', classItem.id)
          .eq('school_id', schoolId);
        
        if (subjectLookupError) throw subjectLookupError;
        
        if (existingSubjects && existingSubjects.length > 0) {
          subjectId = existingSubjects[0].id;
        } else {
          // Create new subject
          const { data: newSubject, error: subjectError } = await supabase
            .from('subjects')
            .insert({
              name: fileData.subjectName,
              class_id: classItem.id,
              school_id: schoolId
            })
            .select('id')
            .single();
          
          if (subjectError) throw subjectError;
          subjectId = newSubject.id;
        }
        
        completedOperations++;
        setUploadProgress(Math.round((completedOperations / totalOperations) * 100));
        
        // Process each student record
        for (const record of fileData.studentRecords) {
          // Check if student exists in this school
          let studentId: string;
          const { data: existingStudents, error: lookupError } = await supabase
            .from('students')
            .select('id, class_id')
            .eq('student_id', record.student_id)
            .eq('school_id', schoolId);
          
          if (lookupError) throw lookupError;
          
          if (existingStudents && existingStudents.length > 0) {
            // Student exists in this school
            studentId = existingStudents[0].id;
            
            // Update the student's class if needed
            const existingClassId = existingStudents[0].class_id as string;
            if (existingClassId !== classItem.id) {
              const { error: updateError } = await supabase
                .from('students')
                .update({ class_id: classItem.id, name: record.name })
                .eq('id', studentId);
                
              if (updateError) throw updateError;
            }
          } else {
            // Create new student
            try {
              const { data: newStudent, error: studentError } = await supabase
                .from('students')
                .insert({
                  student_id: record.student_id,
                  name: record.name,
                  class_id: classItem.id,
                  school_id: schoolId
                })
                .select('id')
                .single();
              
              if (studentError) throw studentError;
              studentId = newStudent.id;
            } catch (error: any) {
              // Handle race conditions
              if (error.code === '23505') {
                const { data: retryStudents, error: retryError } = await supabase
                  .from('students')
                  .select('id')
                  .eq('student_id', record.student_id)
                  .eq('school_id', schoolId);
                  
                if (retryError) throw retryError;
                if (retryStudents && retryStudents.length > 0) {
                  studentId = retryStudents[0].id;
                } else {
                  throw error;
                }
              } else {
                throw error;
              }
            }
          }
          
          // Delete existing scores for this student/subject/term/year
          const { error: deleteError } = await supabase
            .from('scores')
            .delete()
            .eq('student_id', studentId)
            .eq('subject_id', subjectId)
            .eq('term', selectedTerm)
            .eq('academic_year', academicYear);
          
          if (deleteError) throw deleteError;
          
          // Insert new scores
          const scoreInserts = Object.entries(record.scores).map(([assessmentType, score]) => ({
            student_id: studentId,
            subject_id: subjectId,
            assessment_type: assessmentType,
            score: score,
            max_score: 100,
            term: selectedTerm,
            academic_year: academicYear
          }));
          
          if (scoreInserts.length > 0) {
            const { error: scoresError } = await supabase
              .from('scores')
              .insert(scoreInserts);
            
            if (scoresError) throw scoresError;
          }
          
          completedOperations++;
          setUploadProgress(Math.round((completedOperations / totalOperations) * 100));
        }
      }
      
      setUploadStatus('success');
    } catch (error) {
      console.error('Error uploading data:', error);
      setErrorMessage('Failed to upload data. Please try again.');
      setUploadStatus('error');
    }
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const resetUpload = () => {
    setFiles([]);
    setErrorMessage(null);
    setUploadStatus('idle');
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const generateTemplateFiles = () => {
    // Create a sample template based on the provided sample
    const wb = XLSX.utils.book_new();
    
    const headers = [
      'STUDENT REGISTER ID',
      'STUDENT NAME',
      'TEST 1',
      'GW',
      'PW',
      'TEST 2',
      'EXAM',
      'ATTENDANCE'
    ];
    
    const data = [
      headers,
      ['', '', 30, 20, 20, 30, 100, ''], // Header row with max scores
      ['EFFORT00000000000000000002375430', 'ABBEY TRYPHOSA SHADEBI NAA YABORLE', 30, 20, 20, 30, 100, ''],
      ['EFFORT00000000000000000002375541', 'ADDAI ANNA EWURABENA', 30, 20, 20, 30, 100, ''],
      ['EFFORT00000000000000000002376207', 'AHLIJAH NINA MAWULORM', 30, 20, 20, 30, 100, ''],
      ['EFFORT00000000000000000002375652', 'ASIO KARIS ENAM AFI', 28, 20, 20, 28, 100, ''],
      ['EFFORT00000000000000000002375763', 'CHURCHER VALENCIA EKUA AKYEDZI', 25, 20, 20, 28, 100, ''],
      ['EFFORT00000000000000000002375874', 'DARKWAH STEPHANIE NANA FOSUA', 30, 20, 20, 30, 93, ''],
      ['EFFORT00000000000000000002375985', 'KORANKYE ANUOYAM SERWAA', 30, 20, 20, 30, 100, ''],
      ['EFFORT00000000000000000002376096', 'NORTEY MIKAYLA NORLEY-FIO', 20, 18, 17, 25, 74, '']
    ];
    
    const ws = XLSX.utils.aoa_to_sheet(data);
    XLSX.utils.book_append_sheet(wb, ws, 'Mathematics');
    
    XLSX.writeFile(wb, 'bulk_upload_template.xlsx');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 overflow-y-auto">
      <div className="min-h-full flex items-center justify-center p-4">
        <div ref={modalRef} className="bg-white rounded-lg shadow-xl w-full max-w-6xl my-8">
          <div className="flex justify-between items-center p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              Bulk Subject & Score Upload for {classItem.name}
            </h2>
            <button 
              onClick={onBack} 
              className="bg-gray-100 hover:bg-gray-200 text-gray-600 p-2 rounded transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="p-6">

      {errorMessage && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4 flex items-center">
          <AlertCircle className="w-5 h-5 mr-2 text-red-500" />
          <p className="text-red-800 text-sm">{errorMessage}</p>
        </div>
      )}

      {uploadStatus === 'success' ? (
        <div className="text-center py-8">
          <div className="mx-auto w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-1">Upload Successful!</h3>
          <p className="text-gray-600 mb-6">
            {files.length} subjects and their scores have been uploaded successfully.
          </p>
          <div className="flex justify-center space-x-4">
            <button
              onClick={resetUpload}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition-colors"
            >
              Upload More Files
            </button>
            <button
              onClick={onSuccess}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="bg-blue-50 border border-blue-200 rounded-lg mb-4 p-4">
            <h3 className="text-md font-medium text-gray-900 mb-3">Bulk Upload Instructions</h3>
            <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700">
              <li>Upload multiple Excel (.xlsx) or CSV (.csv) files at once</li>
              <li>Each file should contain data for one subject</li>
              <li>Subject names will be automatically detected from filenames (e.g., "Mathematics.xlsx" → "Mathematics")</li>
              <li>Required columns: <span className="font-mono text-xs bg-gray-100 px-1 py-0.5 rounded">STUDENT REGISTER ID</span>, <span className="font-mono text-xs bg-gray-100 px-1 py-0.5 rounded">STUDENT NAME</span></li>
              <li>Include any assessment columns with numeric scores (e.g., TEST 1, TEST 2, EXAM)</li>
              <li>Scores must be numbers between 0 and 100</li>
              <li>Maximum file size: 10MB per file</li>
            </ul>
            <div className="mt-3">
              <button
                onClick={generateTemplateFiles}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded flex items-center text-sm transition-colors"
              >
                <Download className="w-4 h-4 mr-1" />
                Download Template
              </button>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Upload Files
            </label>
            <div 
              className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg mt-1 flex justify-center px-4 pt-4 pb-4 cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors duration-200"
              onClick={() => fileInputRef.current?.click()}
              onDragOver={handleDragOver}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <div className="space-y-1 text-center">
                <Upload className="mx-auto h-10 w-10 text-gray-500" />
                <div className="flex text-sm text-gray-600">
                  <span className="font-medium text-gray-900">Click to upload files</span>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-gray-500">
                  Multiple XLSX or CSV files up to 10MB each
                </p>
              </div>
              <input
                id="file-upload"
                name="file-upload"
                type="file"
                className="sr-only"
                accept=".xlsx,.csv"
                multiple
                onChange={handleFileChange}
                ref={fileInputRef}
              />
            </div>
          </div>

          {/* Term and Academic Year selectors moved here */}
          <div className="bg-white border border-gray-200 rounded-lg mb-4 p-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">Term</label>
                <select
                  value={selectedTerm}
                  onChange={(e) => setSelectedTerm(e.target.value)}
                  className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {TERMS.map((term) => (
                    <option key={term} value={term}>{term}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">Academic Year</label>
                <input
                  type="text"
                  value={academicYear}
                  onChange={(e) => setAcademicYear(e.target.value)}
                  placeholder="e.g. 2024/2025"
                  className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="text-xs text-gray-600 mt-1">Format: YYYY/YYYY (e.g. 2024/2025)</p>
              </div>
            </div>
          </div>

          {uploadStatus === 'validating' && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4 flex items-center">
              <div className="mr-3">
                <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
              <p className="text-blue-800 text-sm">Validating files...</p>
            </div>
          )}

          {uploadStatus === 'uploading' && (
            <div className="bg-white border border-gray-200 rounded-lg mb-4 p-3">
              <div className="flex justify-between text-sm font-medium text-gray-900 mb-1">
                <span>Uploading...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-blue-500 h-3 rounded-full transition-all duration-300 shadow-sm"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            </div>
          )}

          {files.length > 0 && (
            <div className="mb-4">
              <h3 className="text-md font-medium text-gray-900 mb-3">Files to Upload</h3>
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {files.map((fileData, index) => (
                  <div key={index} className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <FileSpreadsheet className="w-4 h-4 text-gray-500 mr-2" />
                        <div>
                          <h4 className="font-medium text-sm text-gray-900">{fileData.subjectName}</h4>
                          <p className="text-xs text-gray-600">{fileData.file.name}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {fileData.isValid ? (
                          <CheckCircle className="w-4 h-4 text-green-400" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-red-400" />
                        )}
                        <button
                          onClick={() => removeFile(index)}
                          className="bg-red-500 hover:bg-red-600 text-white p-1 rounded transition-colors"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="text-xs text-gray-600 mb-1">
                      {fileData.studentRecords.length} students found
                    </div>
                    
                    {fileData.validationErrors.length > 0 && (
                      <div className="bg-red-50 border border-red-200 rounded p-2">
                        <h5 className="text-xs font-medium text-red-800 mb-1">Validation Errors:</h5>
                        <ul className="list-disc pl-4 space-y-1 text-red-700 text-xs">
                          {fileData.validationErrors.slice(0, 2).map((error, errorIndex) => (
                            <li key={errorIndex}>
                              Row {error.row}, Column "{error.column}": {error.message}
                            </li>
                          ))}
                          {fileData.validationErrors.length > 2 && (
                            <li>... and {fileData.validationErrors.length - 2} more errors</li>
                          )}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-2">
            <button
              onClick={onBack}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded text-sm transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleUpload}
              disabled={files.length === 0 || !files.every(f => f.isValid) || uploadStatus === 'uploading' || uploadStatus === 'validating'}
              className={`flex items-center text-sm px-4 py-2 rounded transition-colors ${
                files.length === 0 || !files.every(f => f.isValid) || uploadStatus === 'uploading' || uploadStatus === 'validating'
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-500 hover:bg-blue-600 text-white'
              }`}
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload All Subjects
            </button>
          </div>
        </>
      )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BulkSubjectUpload; 