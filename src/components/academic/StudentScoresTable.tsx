import React, { useState, useEffect } from 'react';
import { Edit2, Save, Trash2, X } from 'lucide-react';

type StudentScoreTableProps = {
  students: StudentData[];
  assessmentTypes: string[];
  title?: string;
  onEdit: (student: StudentData) => void;
  onCancelEdit: () => void;
  onSaveEdit: (student: StudentData) => void;
  onDelete: (studentId: string) => void;
  onToggleSelect: (studentId: string) => void;
  onToggleSelectAll: () => void;
  selectedStudents: string[];
  selectAll: boolean;
  editingStudentId: string | null;
  editData: {[key: string]: number};
  onScoreChange: (assessmentType: string, value: string) => void;
  // Default values for pagination
  initialStudentsPerPage?: number;
  tableId?: string; // Unique identifier for this table
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

const StudentScoresTable: React.FC<StudentScoreTableProps> = ({
  students,
  assessmentTypes,
  title,
  onEdit,
  onCancelEdit,
  onSaveEdit,
  onDelete,
  onToggleSelect,
  onToggleSelectAll,
  selectedStudents,
  selectAll,
  editingStudentId,
  editData,
  onScoreChange,
  initialStudentsPerPage = 10,
  tableId = 'default'
}) => {
  // Internal pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [studentsPerPage, setStudentsPerPage] = useState(initialStudentsPerPage);
  const [paginatedStudents, setPaginatedStudents] = useState<StudentData[]>([]);
  
  // Calculate total pages
  const totalPages = Math.ceil(students.length / studentsPerPage) || 1;
  
  // Update paginated students when the source data changes or pagination settings change
  useEffect(() => {
    const startIndex = (currentPage - 1) * studentsPerPage;
    const endIndex = startIndex + studentsPerPage;
    setPaginatedStudents(students.slice(startIndex, endIndex));
    
    // Reset to page 1 if we're past the last page after a data change
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [students, currentPage, studentsPerPage, totalPages]);
  
  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };
  
  // Handle students per page change
  const handleStudentsPerPageChange = (perPage: number) => {
    setStudentsPerPage(perPage);
    setCurrentPage(1); // Reset to first page when changing items per page
  };
  return (
    <div className="mt-6 bg-white shadow-sm rounded-lg overflow-hidden">
      {title && (
        <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
          <h3 className="text-md font-medium text-gray-700">{title}</h3>
        </div>
      )}
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-3 py-3">
                <input
                  type="checkbox"
                  checked={selectAll}
                  onChange={onToggleSelectAll}
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
            {paginatedStudents.map((student) => (
              <tr key={student.id} className={editingStudentId === student.id ? 'bg-blue-50' : ''}>
                <td className="px-3 py-4">
                  <input
                    type="checkbox"
                    checked={selectedStudents.includes(student.id)}
                    onChange={() => onToggleSelect(student.id)}
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
                          onChange={(e) => onScoreChange(type, e.target.value)}
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
                        onClick={() => onSaveEdit(student)}
                        className="text-green-600 hover:text-green-900"
                        title="Save changes"
                      >
                        <Save className="w-3 h-3" />
                      </button>
                      <button
                        onClick={onCancelEdit}
                        className="text-gray-600 hover:text-gray-900"
                        title="Cancel"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => onEdit(student)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Edit"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => onDelete(student.id)}
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
        
        {/* Pagination Controls */}
        <div className="mt-4 flex items-center justify-between p-4 border-t border-gray-200">
          <div className="flex items-center space-x-2">
            <label className="text-sm text-gray-600">Rows per page:</label>
            <select 
              value={studentsPerPage}
              onChange={(e) => handleStudentsPerPageChange(Number(e.target.value))}
              className="px-2 py-1 border border-gray-300 rounded-md text-sm"
            >
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="50">50</option>
            </select>
            
            <span className="text-sm text-gray-600 ml-4">
              Showing {paginatedStudents.length} of {students.length} records
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handlePageChange(1)}
              disabled={currentPage === 1}
              className={`px-2 py-1 rounded-md ${currentPage === 1 ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
            >
              &laquo; First
            </button>
            
            <button
              onClick={() => handlePageChange(Math.max(currentPage - 1, 1))}
              disabled={currentPage === 1}
              className={`px-2 py-1 rounded-md ${currentPage === 1 ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
            >
              &lsaquo; Prev
            </button>
            
            <span className="text-sm text-gray-600 mx-2">
              Page {currentPage} of {totalPages}
            </span>
            
            <button
              onClick={() => handlePageChange(Math.min(currentPage + 1, totalPages))}
              disabled={currentPage === totalPages}
              className={`px-2 py-1 rounded-md ${currentPage === totalPages ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
            >
              Next &rsaquo;
            </button>
            
            <button
              onClick={() => handlePageChange(totalPages)}
              disabled={currentPage === totalPages}
              className={`px-2 py-1 rounded-md ${currentPage === totalPages ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
            >
              Last &raquo;
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentScoresTable;
