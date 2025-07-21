import React, { useState, useEffect } from 'react';
import { supabase, Class, Subject, TERMS } from '../../lib/supabase';
import { AlertCircle, RefreshCw, Download, Trash2, Upload, ArrowLeft } from 'lucide-react';
import StudentScoresTable from './StudentScoresTable';
import DataUpload from './DataUpload';
import Modal from '../ui/Modal';

type PreviousUploadsProps = {
  schoolId: string;
  classItem: Class;
  subject: Subject;
  onDataChanged: () => void;
  onBack?: () => void;
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
  onBack,
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
  const [groupedData, setGroupedData] = useState<{title: string; students: StudentData[]}[]>([]);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  
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
      // Generate grouped data tables
      const grouped = groupStudentsByFilter();
      setGroupedData(grouped);
    } else {
      setFilteredStudents([]);
      setGroupedData([]);
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

  // Function to group students by term and/or academic year
  const groupStudentsByFilter = () => {
    console.log('Grouping students - Term:', filterTerm, 'Academic Year:', filterAcademicYear);
    console.log('Total students before filtering:', students.length);
    
    // Start with all students
    let filtered = [...students];
    const groupedData: {
      title: string;
      students: StudentData[];
    }[] = [];
    
    // Case 1: Specific term & specific year - single table
    if (filterTerm && filterAcademicYear) {
      const studentsWithFilteredScores = filtered.map(student => {
        return {
          ...student,
          scores: student.scores.filter(score => 
            score.term === filterTerm && 
            score.academic_year === filterAcademicYear
          )
        };
      }).filter(student => student.scores.length > 0);
      
      if (studentsWithFilteredScores.length > 0) {
        groupedData.push({
          title: `${filterTerm} - ${filterAcademicYear}`,
          students: studentsWithFilteredScores
        });
      }
    }
    // Case 2: Specific term & all years - group by academic year
    else if (filterTerm && !filterAcademicYear) {
      // Get all unique academic years
      const uniqueYears = Array.from(new Set(
        filtered.flatMap(student => 
          student.scores
            .filter(score => score.term === filterTerm)
            .map(score => score.academic_year)
        ).filter(Boolean)
      )).sort();
      
      // Create a table for each academic year
      uniqueYears.forEach(year => {
        const studentsForYear = filtered.map(student => {
          return {
            ...student,
            scores: student.scores.filter(score => 
              score.term === filterTerm && 
              score.academic_year === year
            )
          };
        }).filter(student => student.scores.length > 0);
        
        if (studentsForYear.length > 0) {
          groupedData.push({
            title: `${filterTerm} - ${year}`,
            students: studentsForYear
          });
        }
      });
    }
    // Case 3: All terms & specific year - group by term
    else if (!filterTerm && filterAcademicYear) {
      // Get all unique terms
      const uniqueTerms = TERMS;
      
      // Create a table for each term
      uniqueTerms.forEach(term => {
        const studentsForTerm = filtered.map(student => {
          return {
            ...student,
            scores: student.scores.filter(score => 
              score.term === term && 
              score.academic_year === filterAcademicYear
            )
          };
        }).filter(student => student.scores.length > 0);
        
        if (studentsForTerm.length > 0) {
          groupedData.push({
            title: `${term} - ${filterAcademicYear}`,
            students: studentsForTerm
          });
        }
      });
    }
    // Case 4: All terms & all years - group by term and year
    else {
      // Get all unique terms and years combinations
      const uniqueTerms = TERMS;
      const uniqueYears = Array.from(new Set(
        filtered.flatMap(student => 
          student.scores.map(score => score.academic_year)
        ).filter(Boolean)
      )).sort();
      
      // Create a table for each term and year combination
      uniqueTerms.forEach(term => {
        uniqueYears.forEach(year => {
          const studentsForTermAndYear = filtered.map(student => {
            return {
              ...student,
              scores: student.scores.filter(score => 
                score.term === term && 
                score.academic_year === year
              )
            };
          }).filter(student => student.scores.length > 0);
          
          if (studentsForTermAndYear.length > 0) {
            groupedData.push({
              title: `${term} - ${year}`,
              students: studentsForTermAndYear
            });
          }
        });
      });
    }
    
    console.log('Created', groupedData.length, 'tables with filtered data');
    return groupedData;
  };
  
  // Function to apply filters based on term and academic year
  const applyFilters = () => {
    // For single table view (when both specific term and year are selected)
    // we still need the filteredStudents for pagination
    let filtered = [...students];
    
    if (filterTerm || filterAcademicYear) {
      filtered = filtered.map(student => {
        let filteredScores = [...student.scores];
        
        if (filterTerm) {
          filteredScores = filteredScores.filter(score => score.term === filterTerm);
        }
        
        if (filterAcademicYear) {
          filteredScores = filteredScores.filter(score => score.academic_year === filterAcademicYear);
        }
        
        return {
          ...student,
          scores: filteredScores
        };
      }).filter(student => student.scores.length > 0);
    }
    
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
    // Find the student in the filtered list to get their visible scores
    const studentToDelete = filteredStudents.find(s => s.id === studentId);
    if (!studentToDelete) return;
    
    // Get the IDs of the scores that are currently visible (match the filter)
    const scoreIdsToDelete = studentToDelete.scores.map(score => score.id);
    
    if (scoreIdsToDelete.length === 0) return;
    
    const confirmMessage = filterTerm || filterAcademicYear
      ? `Are you sure you want to delete the filtered scores (${scoreIdsToDelete.length}) for this student?`
      : 'Are you sure you want to delete all scores for this student?';
    
    if (!confirm(confirmMessage)) {
      return;
    }
    
    try {
      // Only delete the specific score records that match the current filters
      const { error } = await supabase
        .from('scores')
        .delete()
        .in('id', scoreIdsToDelete);
      
      if (error) throw error;
      
      console.log(`Deleted ${scoreIdsToDelete.length} scores for student ${studentId}`);
      fetchStudentData();
      onDataChanged();
    } catch (error) {
      console.error('Error deleting student data:', error);
      setError('Failed to delete student data. Please try again.');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedStudents.length === 0) return;
    
    if (!confirm(`Are you sure you want to delete scores for ${selectedStudents.length} student(s)?`)) {
      return;
    }
    
    setIsDeleting(true);
    
    try {
      // Get the IDs of the scores that are currently visible (match the filter) for each selected student
      const scoreIdsToDelete = selectedStudents.flatMap(studentId => {
        const student = filteredStudents.find(s => s.id === studentId);
        return student ? student.scores.map(score => score.id) : [];
      });
      
      if (scoreIdsToDelete.length === 0) return;
      
      // Only delete the specific score records that match the current filters
      const { error } = await supabase
        .from('scores')
        .delete()
        .in('id', scoreIdsToDelete);
      
      if (error) throw error;
      
      console.log(`Deleted ${scoreIdsToDelete.length} scores for ${selectedStudents.length} students`);
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

  // Bulk delete function is defined above

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
      <div className="bg-white p-8 rounded-lg shadow-md text-center max-w-2xl mx-auto">
        <div className="mb-6">
          <div className="bg-blue-100 rounded-full p-4 w-16 h-16 mx-auto flex items-center justify-center">
            <Upload className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Welcome to {subject.name}!</h2>
        <p className="text-gray-600 mb-6">Get started by uploading your first set of student scores for this subject.</p>
        
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <button 
            onClick={() => setIsUploadModalOpen(true)}
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <Upload className="w-5 h-5 mr-2" />
            Upload Scores
          </button>
          <button 
            onClick={fetchStudentData}
            className="inline-flex items-center px-6 py-3 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
          >
            <RefreshCw className="w-5 h-5 mr-2" />
            Refresh
          </button>
        </div>
        
        {/* Upload Modal */}
        <Modal
          isOpen={isUploadModalOpen}
          onClose={() => setIsUploadModalOpen(false)}
          title={`Upload Scores - ${subject.name}`}
          size="lg"
        >
          <DataUpload
            schoolId={schoolId}
            classItem={classItem}
            subject={subject}
            onBack={() => setIsUploadModalOpen(false)}
            onDataChanged={() => {
              setIsUploadModalOpen(false);
              fetchStudentData();
              onDataChanged();
            }}
            selectedTerm={filterTerm}
            academicYear={filterAcademicYear}
          />
        </Modal>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg p-6 mt-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
        <div className="flex items-center">
          {onBack && (
            <button
              onClick={onBack}
              className="mr-3 p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <h2 className="text-xl font-semibold text-gray-800">Previous Uploads</h2>
        </div>

        <button
          onClick={() => setIsUploadModalOpen(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
        >
          <Upload className="w-4 h-4 mr-2" />
          Upload Data
        </button>
      </div>
      
      {/* Upload Data Modal */}
      <Modal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        title="Upload Student Data"
        size="lg"
      >
        <DataUpload
          schoolId={schoolId}
          classItem={classItem}
          subject={subject}
          onBack={() => setIsUploadModalOpen(false)}
          onDataChanged={() => {
            fetchStudentData();
            onDataChanged();
          }}
          selectedTerm={filterTerm}
          academicYear={filterAcademicYear}
        />
      </Modal>
      
      <div className="mb-4">
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
              <span className="ml-2 text-gray-400">({filteredStudents.length} records total)</span>
            </div>
          )}
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

      {/* Display grouped tables when we have multiple groups */}
      {groupedData.length > 0 ? (
        <div className="space-y-8">
          {groupedData.map((group, index) => (
            <div key={index}>
              <StudentScoresTable
                students={group.students}
                assessmentTypes={assessmentTypes}
                title={group.title}
                onEdit={handleEdit}
                onCancelEdit={handleCancelEdit}
                onSaveEdit={handleSaveEdit}
                onDelete={handleDeleteStudent}
                onToggleSelect={toggleSelectStudent}
                onToggleSelectAll={toggleSelectAll}
                selectedStudents={selectedStudents}
                selectAll={selectAll}
                editingStudentId={editingStudentId}
                editData={editData}
                onScoreChange={handleScoreChange}
                initialStudentsPerPage={10}
                tableId={`table-${index}`}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-500">No data found for the selected filters.</p>
        </div>
      )}
    </div>
  );
};

export default PreviousUploads;