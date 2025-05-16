import React, { useEffect, useState } from 'react';
import { supabase, Class, Subject } from '../../lib/supabase';
import { Plus, Trash2, ArrowLeft, FileSpreadsheet, X, Pen, Eye, CheckCircle } from 'lucide-react';
import PreviousUploads from './PreviousUploads';

type SubjectManagementProps = {
  schoolId: string;
  classItem: Class;
  onBack: () => void;
};

const SubjectManagement: React.FC<SubjectManagementProps> = ({ schoolId, classItem, onBack }) => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newSubjectFields, setNewSubjectFields] = useState<string[]>(['']);
  const [isAddingSubject, setIsAddingSubject] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [editingSubject, setEditingSubject] = useState<{id: string, name: string} | null>(null);

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

  useEffect(() => {
    fetchSubjects();
  }, [classItem.id]);

  const handleAddField = () => {
    setNewSubjectFields([...newSubjectFields, '']);
  };

  const handleRemoveField = (index: number) => {
    setNewSubjectFields(newSubjectFields.filter((_, i) => i !== index));
  };

  const handleFieldChange = (index: number, value: string) => {
    const updatedFields = [...newSubjectFields];
    updatedFields[index] = value;
    setNewSubjectFields(updatedFields);
  };

  const handleAddSubjects = async () => {
    const validSubjects = newSubjectFields.filter(name => name.trim() !== '');
    if (validSubjects.length === 0) return;

    try {
      const { data, error } = await supabase
        .from('subjects')
        .insert(
          validSubjects.map(name => ({
            name: name.trim(),
            class_id: classItem.id,
            school_id: schoolId
          }))
        )
        .select();

      if (error) throw error;
      
      setSubjects([...subjects, ...(data as Subject[])]);
      setNewSubjectFields(['']);
      setIsAddingSubject(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add subjects');
      console.error('Error adding subjects:', err);
    }
  };

  const handleDeleteSubject = async (subjectId: string) => {
    if (!confirm('Are you sure you want to delete this subject and all associated scores? This action cannot be undone.')) {
      return;
    }
    
    try {
      // First, delete all scores associated with this subject
      const { error: scoresError } = await supabase
        .from('scores')
        .delete()
        .eq('subject_id', subjectId);

      if (scoresError) {
        console.error('Error deleting associated scores:', scoresError);
        throw scoresError;
      }
      
      // Then delete the subject itself
      const { error: subjectError } = await supabase
        .from('subjects')
        .delete()
        .eq('id', subjectId);

      if (subjectError) throw subjectError;
      
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

  const handleEditSubject = async () => {
    if (!editingSubject) return;

    try {
      const { error } = await supabase
        .from('subjects')
        .update({ name: editingSubject.name.trim() })
        .eq('id', editingSubject.id);

      if (error) throw error;
      
      setSubjects(subjects.map(s => 
        s.id === editingSubject.id 
          ? { ...s, name: editingSubject.name.trim() } 
          : s
      ));
      setEditingSubject(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update subject');
      console.error('Error updating subject:', err);
    }
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
      <PreviousUploads 
        schoolId={schoolId}
        classItem={classItem}
        subject={selectedSubject}
        onDataChanged={() => fetchSubjects()}
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
          <h3 className="text-lg font-medium text-gray-900 mb-3">Add New Subjects</h3>
          <div className="space-y-3">
            {newSubjectFields.map((field, index) => (
              <div key={index} className="flex items-center">
                <input
                  type="text"
                  value={field}
                  onChange={(e) => handleFieldChange(index, e.target.value)}
                  placeholder="Subject name (e.g., Mathematics, English, Science)"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
                {newSubjectFields.length > 1 && (
                  <button
                    onClick={() => handleRemoveField(index)}
                    className="ml-2 p-2 text-gray-500 hover:text-red-500 hover:bg-gray-100 rounded-full"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
                {index === newSubjectFields.length - 1 && (
                  <button
                    onClick={handleAddField}
                    className="ml-2 p-2 text-blue-500 hover:text-blue-700 hover:bg-gray-100 rounded-full"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
          <div className="mt-4 flex justify-end space-x-2">
            <button
              onClick={() => {
                setNewSubjectFields(['']);
                setIsAddingSubject(false);
              }}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              onClick={handleAddSubjects}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Add Subjects
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
                {editingSubject?.id === subject.id ? (
                  <input
                    type="text"
                    value={editingSubject.name}
                    onChange={(e) => setEditingSubject({ ...editingSubject, name: e.target.value })}
                    className="flex-1 px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleEditSubject();
                      if (e.key === 'Escape') setEditingSubject(null);
                    }}
                    autoFocus
                  />
                ) : (
                  <h3 className="text-lg font-medium text-gray-900">{subject.name}</h3>
                )}
                <div className="flex space-x-2">
                  {editingSubject?.id === subject.id ? (
                    <>
                      <button
                        onClick={handleEditSubject}
                        className="p-1 text-green-600 hover:text-green-700 hover:bg-gray-100 rounded-full"
                      >
                        <CheckCircle className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setEditingSubject(null)}
                        className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => setEditingSubject({ id: subject.id, name: subject.name })}
                        className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full"
                      >
                        <Pen className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteSubject(subject.id)}
                        className="p-1 text-red-500 hover:text-red-700 hover:bg-gray-100 rounded-full"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>
              <button
                onClick={() => handleSelectSubject(subject)}
                className="w-full mt-2 flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                <Eye className="w-4 h-4 mr-2" />
                View
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SubjectManagement;