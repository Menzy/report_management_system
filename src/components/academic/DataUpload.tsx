import React, { useState, useRef } from 'react';
import { supabase, Class, Subject, StudentRecord, ASSESSMENT_TYPES, TERMS, getCurrentAcademicYear } from '../../lib/supabase';
import { ArrowLeft, Upload, FileSpreadsheet, Download, CheckCircle, AlertCircle } from 'lucide-react';
import * as XLSX from 'xlsx';
import PreviousUploads from './PreviousUploads';

type DataUploadProps = {
  schoolId: string;
  classItem: Class;
  subject: Subject;
  onBack: () => void;
  onDataChanged?: () => void;
};

type ValidationError = {
  row: number;
  column: string;
  message: string;
};

const DataUpload: React.FC<DataUploadProps> = ({ schoolId, classItem, subject, onBack, onDataChanged }) => {
  const [file, setFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<StudentRecord[]>([]);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'validating' | 'uploading' | 'success' | 'error'>('idle');
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedTerm, setSelectedTerm] = useState<string>(TERMS[0]);
  const [academicYear, setAcademicYear] = useState<string>(getCurrentAcademicYear());
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      
      // Check file size (10MB limit)
      if (selectedFile.size > 10 * 1024 * 1024) {
        setErrorMessage('File size exceeds 10MB limit');
        return;
      }
      
      // Check file type
      const fileType = selectedFile.name.split('.').pop()?.toLowerCase();
      if (fileType !== 'xlsx' && fileType !== 'csv') {
        setErrorMessage('Only .xlsx and .csv files are supported');
        return;
      }
      
      setFile(selectedFile);
      setErrorMessage(null);
      parseFile(selectedFile);
    }
  };

  const parseFile = async (file: File) => {
    setUploadStatus('validating');
    setValidationErrors([]);
    
    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: "" });
      
      // Validate the data structure
      const errors: ValidationError[] = [];
      const records: StudentRecord[] = [];
      
      // Check if the file has any data
      if (jsonData.length === 0) {
        setErrorMessage('The file appears to be empty or has no valid data');
        setUploadStatus('error');
        return;
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
        key.toUpperCase() !== 'ATTENDANCE'
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
          // If the value exists and is a number, use it
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
      
      setValidationErrors(errors);
      setPreviewData(records);
      
      if (errors.length === 0) {
        setUploadStatus('idle');
      } else {
        setUploadStatus('error');
      }
      
      // If no records were found, show an error
      if (records.length === 0) {
        setErrorMessage('No valid student records found in the file. Make sure each row has both a student ID and name.');
        setUploadStatus('error');
      }
    } catch (error) {
      console.error('Error parsing file:', error);
      setErrorMessage('Failed to parse file. Please check the file format.');
      setUploadStatus('error');
    }
  };

  const handleUpload = async () => {
    if (!file || validationErrors.length > 0 || previewData.length === 0) return;
    
    setUploadStatus('uploading');
    setUploadProgress(0);
    
    try {
      // Process each student record
      for (let i = 0; i < previewData.length; i++) {
        const record = previewData[i];
        
        // Check if student exists in this school (regardless of class)
        let studentId: string;
        const { data: existingStudents, error: lookupError } = await supabase
          .from('students')
          .select('id, class_id')
          .eq('student_id', record.student_id)
          .eq('school_id', schoolId);
        
        if (lookupError) {
          console.error('Error looking up student:', lookupError);
          throw lookupError;
        }
        
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
              
            if (updateError) {
              console.error('Error updating student class:', updateError);
              throw updateError;
            }
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
            // If we get a duplicate key error, try to fetch the student again
            // This handles race conditions in case another upload just created this student
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
                throw error; // Re-throw if we still can't find the student
              }
            } else {
              throw error; // Re-throw other errors
            }
          }
        }
        
        // Delete existing scores for this student and subject
        await supabase
          .from('scores')
          .delete()
          .eq('student_id', studentId)
          .eq('subject_id', subject.id);
        
        // Insert new scores - without term and academic_year until database schema is updated
        const scoreInserts = Object.entries(record.scores).map(([assessmentType, score]) => ({
          student_id: studentId,
          subject_id: subject.id,
          assessment_type: assessmentType,
          score: score,
          max_score: 100,
          // term and academic_year fields are commented out until database schema is updated
          term: record.term,
          academic_year: record.academic_year
        }));
        
        if (scoreInserts.length > 0) {
          const { error: scoresError } = await supabase
            .from('scores')
            .insert(scoreInserts);
          
          if (scoresError) throw scoresError;
        }
        
        // Update progress
        setUploadProgress(Math.round(((i + 1) / previewData.length) * 100));
      }
      
      setUploadStatus('success');
      if (onDataChanged) {
        onDataChanged(); // Trigger data refresh after successful upload
      }
    } catch (error) {
      console.error('Error uploading data:', error);
      setErrorMessage('Failed to upload data. Please try again.');
      setUploadStatus('error');
    }
  };

  const generateTemplateFile = () => {
    // Create a new workbook
    const wb = XLSX.utils.book_new();
    
    // Create headers
    const headers = [
      'STUDENT REGISTER ID',
      'STUDENT NAME',
      ...ASSESSMENT_TYPES,
      'ATTENDANCE',
      'TERM',
      'ACADEMIC YEAR'
    ];
    
    // Create sample data
    const data = [
      headers,
      ['STD001', 'John Doe', 75, 80, 60, 90, 85, 90],
      ['STD002', 'Jane Smith', 82, 78, 71, 83, 88, 95]
    ];
    
    // Create worksheet
    const ws = XLSX.utils.aoa_to_sheet(data);
    
    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Template');
    
    // Generate file and trigger download
    XLSX.writeFile(wb, `${subject.name}_template.xlsx`);
  };

  const resetUpload = () => {
    setFile(null);
    setPreviewData([]);
    setValidationErrors([]);
    setErrorMessage(null);
    setUploadStatus('idle');
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDataChanged = () => {
    // Notify parent component that data has changed
    if (onDataChanged) {
      onDataChanged();
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex items-center mb-6">
        <button
          onClick={onBack}
          className="mr-3 p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="text-xl font-semibold text-gray-800">
          Upload Data for {subject.name} ({classItem.name})
        </h2>
      </div>

      {errorMessage && (
        <div className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-md flex items-center">
          <AlertCircle className="w-5 h-5 mr-2" />
          {errorMessage}
        </div>
      )}

      {uploadStatus === 'success' ? (
        <div className="text-center py-8">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-1">Upload Successful!</h3>
          <p className="text-gray-500 mb-6">
            {previewData.length} student records have been uploaded for {subject.name}.
          </p>
          <div className="flex justify-center space-x-4">
            <button
              onClick={resetUpload}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Upload Another File
            </button>
            <button
              onClick={onBack}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
            >
              Back to Subjects
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="mb-6 p-6 border border-gray-200 rounded-lg bg-gray-50">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Upload Instructions</h3>
            <ul className="list-disc pl-5 space-y-2 text-gray-600">
              <li>Upload an Excel (.xlsx) or CSV (.csv) file with student data</li>
              <li>Required columns: <span className="font-mono text-xs bg-gray-200 px-1 py-0.5 rounded">STUDENT REGISTER ID</span>, <span className="font-mono text-xs bg-gray-200 px-1 py-0.5 rounded">STUDENT NAME</span></li>
              <li>Include any assessment columns with numeric scores (e.g., <span className="font-mono text-xs bg-gray-200 px-1 py-0.5 rounded">TEST 1</span>, <span className="font-mono text-xs bg-gray-200 px-1 py-0.5 rounded">TEST 2</span>, <span className="font-mono text-xs bg-gray-200 px-1 py-0.5 rounded">EXAM</span>)</li>
              <li>Scores must be numbers between 0 and 100</li>
              <li>Maximum file size: 10MB</li>
            </ul>
            <div className="mt-4">
              <button
                onClick={generateTemplateFile}
                className="flex items-center text-blue-600 hover:text-blue-800"
              >
                <Download className="w-4 h-4 mr-1" />
                Download Template
              </button>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload File
            </label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
              <div className="space-y-1 text-center">
                {file ? (
                  <div>
                    <FileSpreadsheet className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="text-sm text-gray-600 mt-2">{file.name}</p>
                    <p className="text-xs text-gray-500">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                    <button
                      onClick={resetUpload}
                      className="mt-2 text-sm text-red-600 hover:text-red-800"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <>
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="flex text-sm text-gray-600">
                      <label
                        htmlFor="file-upload"
                        className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                      >
                        <span>Upload a file</span>
                        <input
                          id="file-upload"
                          name="file-upload"
                          type="file"
                          className="sr-only"
                          accept=".xlsx,.csv"
                          onChange={handleFileChange}
                          ref={fileInputRef}
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">
                      XLSX or CSV up to 10MB
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>

          {uploadStatus === 'validating' && (
            <div className="mb-6 p-4 bg-blue-50 text-blue-700 rounded-md flex items-center">
              <div className="mr-3">
                <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
              Validating file...
            </div>
          )}

          {uploadStatus === 'uploading' && (
            <div className="mb-6">
              <div className="flex justify-between text-sm font-medium text-gray-700 mb-1">
                <span>Uploading...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-blue-600 h-2.5 rounded-full"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            </div>
          )}

          {validationErrors.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-medium text-red-700 mb-2">Validation Errors</h3>
              <div className="bg-red-50 p-4 rounded-md max-h-60 overflow-y-auto">
                <ul className="list-disc pl-5 space-y-1 text-red-700">
                  {validationErrors.map((error, index) => (
                    <li key={index}>
                      Row {error.row}, Column "{error.column}": {error.message}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {previewData.length > 0 && validationErrors.length === 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Data Preview</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Student ID
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      {Object.keys(previewData[0]?.scores || {}).map((key) => (
                        <th key={key} scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {key}
                        </th>
                      ))}
                      {previewData[0]?.attendance !== undefined && (
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Attendance
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {previewData.slice(0, 5).map((record, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {record.student_id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {record.name}
                        </td>
                        {Object.entries(record.scores).map(([key, score]) => (
                          <td key={key} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {score}
                          </td>
                        ))}
                        {record.attendance !== undefined && (
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {record.attendance}
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
                {previewData.length > 5 && (
                  <p className="text-xs text-gray-500 mt-2 text-right">
                    Showing 5 of {previewData.length} records
                  </p>
                )}
              </div>
            </div>
          )}

          <div className="mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Term</label>
                <select
                  value={selectedTerm}
                  onChange={(e) => setSelectedTerm(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  {TERMS.map((term) => (
                    <option key={term} value={term}>{term}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Academic Year</label>
                <input
                  type="text"
                  value={academicYear}
                  onChange={(e) => setAcademicYear(e.target.value)}
                  placeholder="e.g. 2024/2025"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">Format: YYYY/YYYY (e.g. 2024/2025)</p>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <button
              onClick={onBack}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              onClick={handleUpload}
              disabled={!file || validationErrors.length > 0 || uploadStatus === 'uploading' || uploadStatus === 'validating'}
              className={`px-4 py-2 rounded-md flex items-center ${
                !file || validationErrors.length > 0 || uploadStatus === 'uploading' || uploadStatus === 'validating'
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload Data
            </button>
          </div>
        </>
      )}
      
      <PreviousUploads 
        schoolId={schoolId}
        classItem={classItem}
        subject={subject}
        onDataChanged={handleDataChanged}
        selectedTerm={selectedTerm}
        academicYear={academicYear}
      />
    </div>
  );
};

export default DataUpload;