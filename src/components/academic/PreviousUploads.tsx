import React, { useState, useEffect } from 'react';
import { supabase, Class, Subject, TERMS } from '../../lib/supabase';
import { Trash2, Edit2, Save, X, AlertCircle, RefreshCw, Download } from 'lucide-react';

type PreviousUploadsProps = {
  schoolId: string;
  classItem: Class;
  subject: Subject;
  onDataChanged: () => void;
  selectedTerm?: string;
  academicYear?: string;
};

type StudentData = {
  id: string;
  student_id: string;
  name: string;
  scores: {
    id: string;
    assessment_type: string;
    score: number;
    term?: string;
    academic_year?: string;
  }[];
};

const PreviousUploads: React.FC<PreviousUploadsProps> = ({ 
  schoolId, 
  classItem, 
  subject,
  onDataChanged,
  selectedTerm,
  academicYear
}) => {
  const [students, setStudents] = useState<StudentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingStudentId, setEditingStudentId] = useState<string | null>(null);
  const [editData, setEditData] = useState<{[key: string]: number}>({});
  const [assessmentTypes, setAssessmentTypes] = useState<string[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [filterTerm, setFilterTerm] = useState<string | undefined>(selectedTerm);
  const [filterAcademicYear, setFilterAcademicYear] = useState<string | undefined>(academicYear);
  const [availableTerms, setAvailableTerms] = useState<string[]>([]);
  const [availableAcademicYears, setAvailableAcademicYears] = useState<string[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<StudentData[]>([]);

  useEffect(() => {
    fetchStudentData();
  }, [schoolId, classItem.id, subject.id]);
  
  useEffect(() => {
    // When selectedTerm or academicYear props change, update the filter states
    setFilterTerm(selectedTerm);
    setFilterAcademicYear(academicYear);
  }, [selectedTerm, academicYear]);
  
  useEffect(() => {
    // Apply filters whenever filter states or students change
    if (students.length > 0) {
      applyFilters();
    } else {
      setFilteredStudents([]);
    }
  }, [filterTerm, filterAcademicYear, students]);
  
  // Refresh data when the component mounts or when selectedTerm/academicYear props change
  useEffect(() => {
    fetchStudentData();
  }, [selectedTerm, academicYear]);

  const fetchStudentData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Fetch students in this class
      const { data: studentsData, error: studentsError } = await supabase
        .from('students')
        .select('id, student_id, name')
        .eq('school_id', schoolId)
        .eq('class_id', classItem.id)
        .order('name');
      
      if (studentsError) throw studentsError;
      
      if (!studentsData || studentsData.length === 0) {
        setStudents([]);
        setLoading(false);
        return;
      }
      
      // Fetch scores for these students for this subject
      const { data: scoresData, error: scoresError } = await supabase
        .from('scores')
        .select('id, student_id, assessment_type, score, term, academic_year')
        .eq('subject_id', subject.id)
        .in('student_id', studentsData.map(s => s.id));
      
      if (scoresError) throw scoresError;
      
      // Collect all unique assessment types and academic years
      const uniqueAssessmentTypes = Array.from(
        new Set(scoresData?.map(score => score.assessment_type) || [])
      ).sort();
      
      // Always use the predefined terms
      // const uniqueTerms = Array.from(
      //   new Set(scoresData?.map(score => score.term).filter(Boolean) || [])
      // ).sort();
      
      const uniqueAcademicYears = Array.from(
        new Set(scoresData?.map(score => score.academic_year).filter(Boolean) || [])
      ).sort();
      
      setAssessmentTypes(uniqueAssessmentTypes);
      setAvailableTerms(TERMS); // Always use the predefined terms
      setAvailableAcademicYears(uniqueAcademicYears);
      
      // Organize data by student
      const studentDataMap: StudentData[] = studentsData.map(student => {
        const studentScores = scoresData?.filter(score => score.student_id === student.id) || [];
        return {
          id: student.id,
          student_id: student.student_id,
          name: student.name,
          scores: studentScores.map(score => ({
            id: score.id,
            assessment_type: score.assessment_type,
            score: score.score,
            term: score.term,
            academic_year: score.academic_year
          }))
        };
      }).filter(student => student.scores.length > 0); // Only show students with scores
      
      setStudents(studentDataMap);
    } catch (error) {
      console.error('Error fetching student data:', error);
      setError('Failed to load student data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (student: StudentData) => {
    // Initialize edit data with current scores
    const initialEditData: {[key: string]: number} = {};
    student.scores.forEach(score => {
      initialEditData[score.assessment_type] = score.score;
    });
    
    setEditData(initialEditData);
    setEditingStudentId(student.id);
  };

  const handleCancelEdit = () => {
    setEditingStudentId(null);
    setEditData({});
  };

  // Function to apply filters based on term and academic year
  const applyFilters = () => {
    let filtered = [...students];
    
    // If we have term or academic year filters, apply them
    // Otherwise show all data
    if (filterTerm) {
      filtered = filtered.filter(student => {
        // Check if any scores for this student match the selected term
        return student.scores.some(score => 
          // Handle both cases: when term is defined and when it's null/undefined
          score.term === filterTerm || (!score.term && !filterTerm)
        );
      });
    }
    
    if (filterAcademicYear) {
      filtered = filtered.filter(student => {
        // Check if any scores for this student match the selected academic year
        return student.scores.some(score => 
          // Handle both cases: when academic_year is defined and when it's null/undefined
          score.academic_year === filterAcademicYear || (!score.academic_year && !filterAcademicYear)
        );
      });
    }
    
    console.log('Filtered students:', filtered.length, 'out of', students.length);
    setFilteredStudents(filtered);
  };

  const handleSaveEdit = async (student: StudentData) => {
    try {
      // Update each score
      for (const assessmentType of assessmentTypes) {
        if (editData[assessmentType] !== undefined) {
          const scoreObj = student.scores.find(s => s.assessment_type === assessmentType);
          
          if (scoreObj) {
            // Update existing score
            const { error: updateError } = await supabase
              .from('scores')
              .update({ 
                score: editData[assessmentType],
                term: filterTerm,
                academic_year: filterAcademicYear
              })
              .eq('id', scoreObj.id);
            
            if (updateError) throw updateError;
          } else {
            // Create new score
            const { error } = await supabase
              .from('scores')
              .insert({
                student_id: student.id,
                subject_id: subject.id,
                assessment_type: assessmentType,
                score: editData[assessmentType],
                max_score: 100,
                term: filterTerm,
                academic_year: filterAcademicYear
              });
            
            if (error) throw error;
          }
        }
      }
      
      setEditingStudentId(null);
      setEditData({});
      fetchStudentData();
      onDataChanged();
    } catch (error) {
      console.error('Error saving student data:', error);
      setError('Failed to save changes. Please try again.');
    }
  };

  const handleScoreChange = (assessmentType: string, value: string) => {
    const numValue = Number(value);
    if (!isNaN(numValue) && numValue >= 0 && numValue <= 100) {
      setEditData({
        ...editData,
        [assessmentType]: numValue
      });
    }
  };

  const handleDeleteStudent = async (studentId: string) => {
    if (!confirm('Are you sure you want to delete all scores for this student?')) {
      return;
    }
    
    try {
      // Delete all scores for this student in this subject
      const { error } = await supabase
        .from('scores')
        .delete()
        .eq('student_id', studentId)
        .eq('subject_id', subject.id);
      
      if (error) throw error;
      
      fetchStudentData();
      onDataChanged();
    } catch (error) {
      console.error('Error deleting student data:', error);
      setError('Failed to delete student data. Please try again.');
    }
  };

  const toggleSelectStudent = (studentId: string) => {
    setSelectedStudents(prev => 
      prev.includes(studentId) 
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  const toggleSelectAll = () => {
    if (selectAll) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(students.map(s => s.id));
    }
    setSelectAll(!selectAll);
  };

  const handleBulkDelete = async () => {
    if (selectedStudents.length === 0) return;
    
    if (!confirm(`Are you sure you want to delete scores for ${selectedStudents.length} student(s)?`)) {
      return;
    }
    
    setIsDeleting(true);
    
    try {
      // Delete scores for selected students
      const { error } = await supabase
        .from('scores')
        .delete()
        .in('student_id', selectedStudents)
        .eq('subject_id', subject.id);
      
      if (error) throw error;
      
      setSelectedStudents([]);
      setSelectAll(false);
      fetchStudentData();
      onDataChanged();
    } catch (error) {
      console.error('Error deleting student data:', error);
      setError('Failed to delete student data. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <span className="ml-2 text-gray-700">Loading student data...</span>
      </div>
    );
  }

  if (students.length === 0) {
    return (
      <div className="bg-gray-50 p-6 rounded-lg text-center">
        <p className="text-gray-600 mb-4">No data has been uploaded for this subject yet.</p>
        <button 
          onClick={fetchStudentData}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg p-6 mt-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
        <h2 className="text-xl font-semibold text-gray-800">Previous Uploads</h2>
        
        <div className="flex flex-wrap gap-4">
          <div className="filter-section bg-gray-50 p-3 rounded-lg shadow-sm">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Filter Records</h3>
            <div className="flex flex-wrap gap-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Term</label>
                <select
                  value={filterTerm || ''}
                  onChange={(e) => setFilterTerm(e.target.value || undefined)}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm min-w-[120px]"
                >
                  <option value="">All Terms</option>
                  {TERMS.map(term => (
                    <option key={term} value={term}>{term}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-xs text-gray-500 mb-1">Academic Year</label>
                <select
                  value={filterAcademicYear || ''}
                  onChange={(e) => setFilterAcademicYear(e.target.value || undefined)}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm min-w-[120px]"
                >
                  <option value="">All Years</option>
                  {availableAcademicYears.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
              
              <div className="flex items-end">
                <button 
                  onClick={() => {
                    setFilterTerm(undefined);
                    setFilterAcademicYear(undefined);
                  }}
                  className="px-3 py-1 text-xs bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                >
                  Clear Filters
                </button>
              </div>
            </div>
            
            {(filterTerm || filterAcademicYear) && (
              <div className="mt-2 text-xs text-gray-500">
                Showing: {filterTerm ? filterTerm : 'All Terms'} | {filterAcademicYear ? filterAcademicYear : 'All Years'}
                <span className="ml-2 text-gray-400">({filteredStudents.length} records)</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800">
          Previously Uploaded Data
        </h2>

        <div className="flex space-x-2">
          <button
            onClick={fetchStudentData}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full"
            title="Refresh data"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
          {selectedStudents.length > 0 && (
            <button
              onClick={handleBulkDelete}
              disabled={selectedStudents.length === 0 || isDeleting}
              className={`px-3 py-1 rounded-md text-sm flex items-center ${selectedStudents.length === 0 || isDeleting ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-red-100 text-red-600 hover:bg-red-200'}`}
            >
              <Trash2 className="w-3 h-3 mr-1" />
              Delete Selected ({selectedStudents.length})
            </button>
          )}
          <button
            onClick={() => {
              // Generate CSV data
              const headers = ['Student ID', 'Student Name', ...assessmentTypes, 'Term', 'Academic Year'];
              
              // Create rows
              const rows = filteredStudents.map((student: StudentData) => {
                const row: (string | number)[] = [student.student_id, student.name];
                
                // Add scores
                for (const type of assessmentTypes) {
                  const scoreObj = student.scores.find((s) => s.assessment_type === type);
                  row.push(scoreObj ? scoreObj.score : '');
                }
                
                // Add term and academic year
                const firstScore = student.scores[0];
                row.push(firstScore?.term || '');
                row.push(firstScore?.academic_year || '');
                
                return row;
              });
              
              // Combine headers and rows
              const csvContent = [
                headers.join(','),
                ...rows.map((row) => row.join(','))
              ].join('\n');
              
              // Download CSV
              const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
              const url = URL.createObjectURL(blob);
              const link = document.createElement('a');
              link.setAttribute('href', url);
              link.setAttribute('download', `${subject.name}_${filterTerm || 'all-terms'}_${filterAcademicYear || 'all-years'}.csv`);
              link.style.visibility = 'hidden';
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            }}
            disabled={filteredStudents.length === 0}
            className={`px-3 py-1 rounded-md text-sm flex items-center ${filteredStudents.length === 0 ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-green-100 text-green-600 hover:bg-green-200'}`}
          >
            <Download className="w-3 h-3 mr-1" />
            Export Data ({filteredStudents.length})
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-md flex items-center">
          <AlertCircle className="w-5 h-5 mr-2" />
          {error}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-3 py-3 text-left">
                <input
                  type="checkbox"
                  checked={selectAll}
                  onChange={toggleSelectAll}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Student ID
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              {assessmentTypes.map((type) => (
                <th key={type} scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {type}
                </th>
              ))}
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredStudents.map((student) => (
              <tr key={student.id} className={editingStudentId === student.id ? 'bg-blue-50' : ''}>
                <td className="px-3 py-4">
                  <input
                    type="checkbox"
                    checked={selectedStudents.includes(student.id)}
                    onChange={() => toggleSelectStudent(student.id)}
                    disabled={editingStudentId === student.id}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {student.student_id}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {student.name}
                </td>
                {assessmentTypes.map((type) => {
                  const scoreObj = student.scores.find(s => s.assessment_type === type);
                  const score = scoreObj ? scoreObj.score : '-';
                  
                  return (
                    <td key={`${student.id}-${type}`} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {editingStudentId === student.id ? (
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={editData[type] !== undefined ? editData[type] : (scoreObj ? score : '')}
                          onChange={(e) => handleScoreChange(type, e.target.value)}
                          className="w-16 px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                      ) : (
                        score
                      )}
                    </td>
                  );
                })}
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  {editingStudentId === student.id ? (
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => handleSaveEdit(student)}
                        className="text-green-600 hover:text-green-900"
                        title="Save changes"
                      >
                        <Save className="w-3 h-3" />
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="text-gray-600 hover:text-gray-900"
                        title="Cancel"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => handleEdit(student)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Edit"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => handleDeleteStudent(student.id)}
                        className="text-red-600 hover:text-red-900"
                        title="Delete"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};





export default PreviousUploads;