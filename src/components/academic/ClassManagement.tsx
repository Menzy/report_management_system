import React, { useEffect, useState } from 'react';
import { supabase, Class } from '../../lib/supabase';
import { Plus, Trash2, Edit, BookOpen, X, Pen, CheckCircle } from 'lucide-react';
import SubjectManagement from './SubjectManagement';
import { confirmDelete } from '../../services/modalService';

type ClassManagementProps = {
  schoolId: string;
  onOpenBulkUpload?: (schoolId: string, classItem: any) => void;
};

const ClassManagement: React.FC<ClassManagementProps> = ({ schoolId, onOpenBulkUpload }) => {
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newClassFields, setNewClassFields] = useState<string[]>(['']);
  const [isAddingClass, setIsAddingClass] = useState(false);
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const [editingClass, setEditingClass] = useState<{id: string, name: string} | null>(null);
  


  useEffect(() => {
    if (!schoolId) return;
    
    const fetchClasses = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('classes')
          .select('*')
          .eq('school_id', schoolId)
          .order('name', { ascending: true });

        if (error) throw error;
        setClasses(data as Class[]);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load classes');
        console.error('Error fetching classes:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchClasses();
  }, [schoolId]);

  const handleAddField = () => {
    setNewClassFields([...newClassFields, '']);
  };

  const handleRemoveField = (index: number) => {
    setNewClassFields(newClassFields.filter((_, i) => i !== index));
  };

  const handleFieldChange = (index: number, value: string) => {
    const updatedFields = [...newClassFields];
    updatedFields[index] = value;
    setNewClassFields(updatedFields);
  };

  const handleAddClasses = async () => {
    const validClasses = newClassFields.filter(name => name.trim() !== '');
    if (validClasses.length === 0) return;

    try {
      const { data, error } = await supabase
        .from('classes')
        .insert(
          validClasses.map(name => ({
            name: name.trim(),
            school_id: schoolId
          }))
        )
        .select();

      if (error) throw error;
      
      setClasses([...classes, ...(data as Class[])]);
      setNewClassFields(['']);
      setIsAddingClass(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add classes');
      console.error('Error adding classes:', err);
    }
  };

  const handleEditClass = async () => {
    if (!editingClass) return;

    try {
      const { error } = await supabase
        .from('classes')
        .update({ name: editingClass.name.trim() })
        .eq('id', editingClass.id);

      if (error) throw error;
      
      setClasses(classes.map(c => 
        c.id === editingClass.id 
          ? { ...c, name: editingClass.name.trim() } 
          : c
      ));
      setEditingClass(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update class');
      console.error('Error updating class:', err);
    }
  };

  const handleDeleteClass = async (classId: string) => {
    confirmDelete(
      'Are you sure you want to delete this class? This will also delete all associated subjects, students, and scores.',
      async () => {
        try {
          const { error } = await supabase
            .from('classes')
            .delete()
            .eq('id', classId);

          if (error) throw error;
          
          setClasses(classes.filter(c => c.id !== classId));
          if (selectedClass?.id === classId) {
            setSelectedClass(null);
          }
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Failed to delete class');
          console.error('Error deleting class:', err);
        }
      }
    );
  };

  const handleSelectClass = (classItem: Class) => {
    setSelectedClass(classItem);
  };

  const handleBackToClasses = () => {
    setSelectedClass(null);
  };

  if (loading && classes.length === 0) {
    return (
      <div className="glass-card p-8 text-center glass-fade-in">
        <div className="inline-block w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
        <p className="ml-2 text-text-glass-secondary">Loading classes...</p>
      </div>
    );
  }

  if (selectedClass) {
    return (
      <SubjectManagement 
        schoolId={schoolId} 
        classItem={selectedClass} 
        onBack={handleBackToClasses}
        onOpenBulkUpload={onOpenBulkUpload}
      />
    );
  }

  return (
    <div className="glass-card p-6 glass-fade-in">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-text-glass-primary">Class Management</h2>
        <button
          onClick={() => setIsAddingClass(true)}
          className="glass-button glass-button-primary flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Class
        </button>
      </div>

      {error && (
        <div className="glass-alert glass-alert-error mb-4">
          <p className="text-text-glass-primary text-sm">{error}</p>
        </div>
      )}

      {isAddingClass && (
        <div className="glass-card mb-6 p-4 glass-slide-up">
          <h3 className="text-lg font-medium text-text-glass-primary mb-3">Add New Classes</h3>
          <div className="space-y-3">
            {newClassFields.map((field, index) => (
              <div key={index} className="flex items-center">
                <input
                  type="text"
                  value={field}
                  onChange={(e) => handleFieldChange(index, e.target.value)}
                  placeholder="Class name (e.g., Grade 1, JSS 1, Primary 1)"
                  className="glass-input flex-1"
                />
                {newClassFields.length > 1 && (
                  <button
                    onClick={() => handleRemoveField(index)}
                    className="glass-button glass-button-danger ml-2 p-2"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
                {index === newClassFields.length - 1 && (
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
                setNewClassFields(['']);
                setIsAddingClass(false);
              }}
              className="glass-button glass-button-secondary"
            >
              Cancel
            </button>
            <button
              onClick={handleAddClasses}
              className="glass-button glass-button-primary"
            >
              Add Classes
            </button>
          </div>
        </div>
      )}

      {classes.length === 0 ? (
        <div className="text-center py-8 glass-fade-in">
          <div className="mx-auto w-12 h-12 glass-bg-subtle rounded-full flex items-center justify-center mb-4">
            <BookOpen className="w-6 h-6 text-text-glass-secondary" />
          </div>
          <h3 className="text-lg font-medium text-text-glass-primary mb-1">No Classes Added</h3>
          <p className="text-text-glass-secondary mb-4">Start by adding your first class</p>
          {!isAddingClass && (
            <button
              onClick={() => setIsAddingClass(true)}
              className="glass-button glass-button-primary inline-flex items-center"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Class
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {classes.map((classItem, index) => (
            <div
              key={classItem.id}
              className="glass-card p-4 hover:scale-105 transition-all duration-300 glass-slide-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex justify-between items-start mb-2">
                {editingClass?.id === classItem.id ? (
                  <input
                    type="text"
                    value={editingClass.name}
                    onChange={(e) => setEditingClass({ ...editingClass, name: e.target.value })}
                    className="glass-input flex-1"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleEditClass();
                      if (e.key === 'Escape') setEditingClass(null);
                    }}
                    autoFocus
                  />
                ) : (
                  <h3 className="text-lg font-medium text-text-glass-primary">{classItem.name}</h3>
                )}
                <div className="flex space-x-2">
                  {editingClass?.id === classItem.id ? (
                    <>
                      <button
                        onClick={handleEditClass}
                        className="glass-button glass-button-success p-1"
                      >
                        <CheckCircle className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setEditingClass(null)}
                        className="glass-button glass-button-secondary p-1"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => setEditingClass({ id: classItem.id, name: classItem.name })}
                        className="glass-button glass-button-secondary p-1"
                      >
                        <Pen className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteClass(classItem.id)}
                        className="glass-button glass-button-danger p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>
              <button
                onClick={() => handleSelectClass(classItem)}
                className="glass-button glass-button-primary mt-3 w-full flex items-center justify-center"
              >
                <BookOpen className="w-4 h-4 mr-2" />
                Manage Subjects
              </button>
            </div>
          ))}
        </div>
      )}


    </div>
  );
};

export default ClassManagement;