import React, { useEffect, useState } from 'react';
import { supabase, Class, Subject } from '../../lib/supabase';
import { Plus, Trash2, ArrowLeft, FileSpreadsheet, X, Pen, Eye, CheckCircle, Upload } from 'lucide-react';
import PreviousUploads from './PreviousUploads';
import { confirmDelete } from '../../services/modalService';

type SubjectManagementProps = {
  schoolId: string;
  classItem: Class;
  onBack: () => void;
  onOpenBulkUpload?: (schoolId: string, classItem: any) => void;
};

const SubjectManagement: React.FC<SubjectManagementProps> = ({ schoolId, classItem, onBack, onOpenBulkUpload }) => {
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
    confirmDelete(
      'Are you sure you want to delete this subject and all associated scores? This action cannot be undone.',
      async () => {
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
      }
    );
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
      <div className="glass-card p-8 text-center glass-fade-in">
        <div className="inline-block w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
        <p className="ml-2 text-text-glass-secondary">Loading subjects...</p>
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
    <div className="glass-card p-6 glass-fade-in">
      <div className="flex items-center mb-6">
        <button
          onClick={onBack}
          className="glass-button glass-button-secondary mr-3 p-2"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="text-xl font-semibold text-text-glass-primary">
          Subjects for {classItem.name}
        </h2>
        <div className="ml-auto flex space-x-2">
          {onOpenBulkUpload && (
            <button
              onClick={() => onOpenBulkUpload(schoolId, classItem)}
              className="glass-button glass-button-accent flex items-center"
            >
              <Upload className="w-4 h-4 mr-2" />
              Bulk Upload
            </button>
          )}
          <button
            onClick={() => setIsAddingSubject(true)}
            className="glass-button glass-button-primary flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Subject
          </button>
        </div>
      </div>

      {error && (
        <div className="glass-alert glass-alert-error mb-4">
          <p className="text-text-glass-primary text-sm">{error}</p>
        </div>
      )}

      {isAddingSubject && (
        <div className="glass-card mb-6 p-4 glass-slide-up">
          <h3 className="text-lg font-medium text-text-glass-primary mb-3">Add New Subjects</h3>
          <div className="space-y-3">
            {newSubjectFields.map((field, index) => (
              <div key={index} className="flex items-center">
                <input
                  type="text"
                  value={field}
                  onChange={(e) => handleFieldChange(index, e.target.value)}
                  placeholder="Subject name (e.g., Mathematics, English, Science)"
                  className="glass-input flex-1"
                />
                {newSubjectFields.length > 1 && (
                  <button
                    onClick={() => handleRemoveField(index)}
                    className="glass-button glass-button-danger ml-2 p-2"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
                {index === newSubjectFields.length - 1 && (
                  <button
                    onClick={handleAddField}
                    className="glass-button glass-button-secondary ml-2 p-2"
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
              className="glass-button glass-button-secondary"
            >
              Cancel
            </button>
            <button
              onClick={handleAddSubjects}
              className="glass-button glass-button-primary"
            >
              Add Subjects
            </button>
          </div>
        </div>
      )}

      {subjects.length === 0 ? (
        <div className="text-center py-8 glass-fade-in">
          <div className="mx-auto w-12 h-12 glass-bg-subtle rounded-full flex items-center justify-center mb-4">
            <FileSpreadsheet className="w-6 h-6 text-text-glass-secondary" />
          </div>
          <h3 className="text-lg font-medium text-text-glass-primary mb-1">No Subjects Added</h3>
          <p className="text-text-glass-secondary mb-4">Start by adding your first subject for {classItem.name}</p>
          {!isAddingSubject && (
            <button
              onClick={() => setIsAddingSubject(true)}
              className="glass-button glass-button-primary inline-flex items-center"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Subject
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {subjects.map((subject, index) => (
            <div
              key={subject.id}
              className="glass-card p-4 hover:scale-105 transition-all duration-300 glass-slide-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex justify-between items-start mb-2">
                {editingSubject?.id === subject.id ? (
                  <input
                    type="text"
                    value={editingSubject.name}
                    onChange={(e) => setEditingSubject({ ...editingSubject, name: e.target.value })}
                    className="glass-input flex-1"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleEditSubject();
                      if (e.key === 'Escape') setEditingSubject(null);
                    }}
                    autoFocus
                  />
                ) : (
                  <h3 className="text-lg font-medium text-text-glass-primary">{subject.name}</h3>
                )}
                <div className="flex space-x-2">
                  {editingSubject?.id === subject.id ? (
                    <>
                      <button
                        onClick={handleEditSubject}
                        className="glass-button glass-button-success p-1"
                      >
                        <CheckCircle className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setEditingSubject(null)}
                        className="glass-button glass-button-secondary p-1"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => setEditingSubject({ id: subject.id, name: subject.name })}
                        className="glass-button glass-button-secondary p-1"
                      >
                        <Pen className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteSubject(subject.id)}
                        className="glass-button glass-button-danger p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>
              <button
                onClick={() => handleSelectSubject(subject)}
                className="glass-button glass-button-secondary w-full mt-2 flex items-center justify-center"
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