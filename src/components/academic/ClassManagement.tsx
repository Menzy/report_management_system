import React, { useEffect, useState } from 'react';
import { supabase, Class } from '../../lib/supabase';
import { Plus, Trash2, Edit, BookOpen } from 'lucide-react';
import SubjectManagement from './SubjectManagement';

type ClassManagementProps = {
  schoolId: string;
};

const ClassManagement: React.FC<ClassManagementProps> = ({ schoolId }) => {
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newClassName, setNewClassName] = useState('');
  const [isAddingClass, setIsAddingClass] = useState(false);
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);

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

  const handleAddClass = async () => {
    if (!newClassName.trim()) return;

    try {
      const { data, error } = await supabase
        .from('classes')
        .insert({
          name: newClassName.trim(),
          school_id: schoolId
        })
        .select();

      if (error) throw error;
      
      setClasses([...classes, data[0] as Class]);
      setNewClassName('');
      setIsAddingClass(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add class');
      console.error('Error adding class:', err);
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
          <h3 className="text-lg font-medium text-gray-900 mb-3">Add New Class</h3>
          <div className="flex">
            <input
              type="text"
              value={newClassName}
              onChange={(e) => setNewClassName(e.target.value)}
              placeholder="Class name (e.g., Grade 1, JSS 1, Primary 1)"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
            <button
              onClick={handleAddClass}
              className="ml-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Add
            </button>
            <button
              onClick={() => setIsAddingClass(false)}
              className="ml-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
            >
              Cancel
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
                <h3 className="text-lg font-medium text-gray-900">{classItem.name}</h3>
                <div className="flex space-x-1">
                  <button
                    onClick={() => handleDeleteClass(classItem.id)}
                    className="p-1 text-gray-400 hover:text-red-500"
                    title="Delete class"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
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