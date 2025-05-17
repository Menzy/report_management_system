import React, { useEffect, useState } from 'react';
import { supabase, Class } from '../../lib/supabase';
import { Plus, Trash2, Edit, BookOpen, X, Pen, CheckCircle } from 'lucide-react';
import SubjectManagement from './SubjectManagement';

type ClassManagementProps = {
  schoolId: string;
};

const ClassManagement: React.FC<ClassManagementProps> = ({ schoolId }) => {
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
    if (!confirm('Are you sure you want to delete this class? This will also delete all associated subjects, students, and scores.')) {
      return;
    }

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
  };

  const handleSelectClass = (classItem: Class) => {
    setSelectedClass(classItem);
  };

  const handleBackToClasses = () => {
    setSelectedClass(null);
  };

  if (loading && classes.length === 0) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="ml-2 text-gray-600">Loading classes...</p>
      </div>
    );
  }

  if (selectedClass) {
    return (
      <SubjectManagement 
        schoolId={schoolId} 
        classItem={selectedClass} 
        onBack={handleBackToClasses} 
      />
    );
  }

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Class Management</h2>
        <button
          onClick={() => setIsAddingClass(true)}
          className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Class
        </button>
      </div>

      {error && (
        <div className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-md">
          {error}
        </div>
      )}

      {isAddingClass && (
        <div className="mb-6 p-4 border border-gray-200 rounded-md bg-gray-50">
          <h3 className="text-lg font-medium text-gray-900 mb-3">Add New Classes</h3>
          <div className="space-y-3">
            {newClassFields.map((field, index) => (
              <div key={index} className="flex items-center">
                <input
                  type="text"
                  value={field}
                  onChange={(e) => handleFieldChange(index, e.target.value)}
                  placeholder="Class name (e.g., Grade 1, JSS 1, Primary 1)"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
                {newClassFields.length > 1 && (
                  <button
                    onClick={() => handleRemoveField(index)}
                    className="ml-2 p-2 text-gray-500 hover:text-red-500 hover:bg-gray-100 rounded-full"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
                {index === newClassFields.length - 1 && (
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
                setNewClassFields(['']);
                setIsAddingClass(false);
              }}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              onClick={handleAddClasses}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Add Classes
            </button>
          </div>
        </div>
      )}

      {classes.length === 0 ? (
        <div className="text-center py-8">
          <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <BookOpen className="w-6 h-6 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-1">No Classes Added</h3>
          <p className="text-gray-500 mb-4">Start by adding your first class</p>
          {!isAddingClass && (
            <button
              onClick={() => setIsAddingClass(true)}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Class
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {classes.map((classItem) => (
            <div
              key={classItem.id}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start mb-2">
                {editingClass?.id === classItem.id ? (
                  <input
                    type="text"
                    value={editingClass.name}
                    onChange={(e) => setEditingClass({ ...editingClass, name: e.target.value })}
                    className="flex-1 px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleEditClass();
                      if (e.key === 'Escape') setEditingClass(null);
                    }}
                    autoFocus
                  />
                ) : (
                  <h3 className="text-lg font-medium text-gray-900">{classItem.name}</h3>
                )}
                <div className="flex space-x-2">
                  {editingClass?.id === classItem.id ? (
                    <>
                      <button
                        onClick={handleEditClass}
                        className="p-1 text-green-600 hover:text-green-700 hover:bg-gray-100 rounded-full"
                      >
                        <CheckCircle className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setEditingClass(null)}
                        className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => setEditingClass({ id: classItem.id, name: classItem.name })}
                        className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full"
                      >
                        <Pen className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteClass(classItem.id)}
                        className="p-1 text-red-500 hover:text-red-700 hover:bg-gray-100 rounded-full"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>
              <button
                onClick={() => handleSelectClass(classItem)}
                className="mt-3 w-full px-4 py-2 text-sm text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 flex items-center justify-center"
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