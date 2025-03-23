import React, { useEffect, useState } from 'react';
import { supabase, Class, Subject } from '../../lib/supabase';
import { Plus, Trash2, ArrowLeft, FileSpreadsheet, Upload } from 'lucide-react';
import DataUpload from './DataUpload';

type SubjectManagementProps = {
  schoolId: string;
  classItem: Class;
  onBack: () => void;
};

const SubjectManagement: React.FC<SubjectManagementProps> = ({ schoolId, classItem, onBack }) => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newSubjectName, setNewSubjectName] = useState('');
  const [isAddingSubject, setIsAddingSubject] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('subjects')
          .select('*')
          .eq('class_id', classItem.id)
          .order('name', { ascending: true });

        if (error) throw error;
        setSubjects(data as Subject[]);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load subjects');
        console.error('Error fetching subjects:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSubjects();
  }, [classItem.id]);

  const handleAddSubject = async () => {
    if (!newSubjectName.trim()) return;

    try {
      const { data, error } = await supabase
        .from('subjects')
        .insert({
          name: newSubjectName.trim(),
          class_id: classItem.id,
          school_id: schoolId
        })
        .select();

      if (error) throw error;
      
      setSubjects([...subjects, data[0] as Subject]);
      setNewSubjectName('');
      setIsAddingSubject(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add subject');
      console.error('Error adding subject:', err);
    }
  };

  const handleDeleteSubject = async (subjectId: string) => {
    if (!confirm('Are you sure you want to delete this subject? This will also delete all associated scores.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('subjects')
        .delete()
        .eq('id', subjectId);

      if (error) throw error;
      
      setSubjects(subjects.filter(s => s.id !== subjectId));
      if (selectedSubject?.id === subjectId) {
        setSelectedSubject(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete subject');
      console.error('Error deleting subject:', err);
    }
  };

  const handleSelectSubject = (subject: Subject) => {
    setSelectedSubject(subject);
  };

  const handleBackToSubjects = () => {
    setSelectedSubject(null);
  };

  if (loading && subjects.length === 0) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="ml-2 text-gray-600">Loading subjects...</p>
      </div>
    );
  }

  if (selectedSubject) {
    return (
      <DataUpload 
        schoolId={schoolId}
        classItem={classItem}
        subject={selectedSubject}
        onBack={handleBackToSubjects}
      />
    );
  }

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
          Subjects for {classItem.name}
        </h2>
        <button
          onClick={() => setIsAddingSubject(true)}
          className="ml-auto flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Subject
        </button>
      </div>

      {error && (
        <div className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-md">
          {error}
        </div>
      )}

      {isAddingSubject && (
        <div className="mb-6 p-4 border border-gray-200 rounded-md bg-gray-50">
          <h3 className="text-lg font-medium text-gray-900 mb-3">Add New Subject</h3>
          <div className="flex">
            <input
              type="text"
              value={newSubjectName}
              onChange={(e) => setNewSubjectName(e.target.value)}
              placeholder="Subject name (e.g., Mathematics, English, Science)"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
            <button
              onClick={handleAddSubject}
              className="ml-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Add
            </button>
            <button
              onClick={() => setIsAddingSubject(false)}
              className="ml-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {subjects.length === 0 ? (
        <div className="text-center py-8">
          <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <FileSpreadsheet className="w-6 h-6 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-1">No Subjects Added</h3>
          <p className="text-gray-500 mb-4">Start by adding your first subject for {classItem.name}</p>
          {!isAddingSubject && (
            <button
              onClick={() => setIsAddingSubject(true)}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Subject
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {subjects.map((subject) => (
            <div
              key={subject.id}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-medium text-gray-900">{subject.name}</h3>
                <div className="flex space-x-1">
                  <button
                    onClick={() => handleDeleteSubject(subject.id)}
                    className="p-1 text-gray-400 hover:text-red-500"
                    title="Delete subject"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <button
                onClick={() => handleSelectSubject(subject)}
                className="mt-3 w-full px-4 py-2 text-sm text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 flex items-center justify-center"
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload Data
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SubjectManagement;