import React, { useEffect, useState } from 'react';
import { supabase, Class, Subject } from '../../lib/supabase';
import { CheckCircle, Circle, AlertCircle } from 'lucide-react';

type ProgressIndicatorProps = {
  schoolId: string;
  classId: string;
  requiredSubjects?: string[];
};

type SubjectStatus = {
  id: string;
  name: string;
  hasData: boolean;
};

const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({ schoolId, classId, requiredSubjects = [] }) => {
  const [subjects, setSubjects] = useState<SubjectStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSubjectsStatus = async () => {
      try {
        setLoading(true);
        
        // Fetch all subjects for this class
        const { data: subjectsData, error: subjectsError } = await supabase
          .from('subjects')
          .select('id, name')
          .eq('class_id', classId)
          .eq('school_id', schoolId)
          .order('name', { ascending: true });
        
        if (subjectsError) throw subjectsError;
        
        // Check which subjects have data
        const subjectStatuses: SubjectStatus[] = [];
        
        for (const subject of subjectsData) {
          // Check if there are any scores for this subject
          const { count, error: countError } = await supabase
            .from('scores')
            .select('id', { count: 'exact', head: true })
            .eq('subject_id', subject.id);
          
          if (countError) throw countError;
          
          subjectStatuses.push({
            id: subject.id,
            name: subject.name,
            hasData: count > 0
          });
        }
        
        setSubjects(subjectStatuses);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load subjects status');
        console.error('Error fetching subjects status:', err);
      } finally {
        setLoading(false);
      }
    };

    if (schoolId && classId) {
      fetchSubjectsStatus();
    }
  }, [schoolId, classId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mr-2"></div>
        <span className="text-sm text-gray-600">Loading progress...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-sm text-red-700 bg-red-100 rounded-md flex items-center">
        <AlertCircle className="w-5 h-5 mr-2" />
        {error}
      </div>
    );
  }

  const completedSubjects = subjects.filter(s => s.hasData);
  const progress = subjects.length > 0 ? Math.round((completedSubjects.length / subjects.length) * 100) : 0;
  
  // Check if all required subjects have data
  const requiredSubjectsComplete = requiredSubjects.length === 0 || 
    requiredSubjects.every(req => 
      subjects.some(s => s.name.toLowerCase() === req.toLowerCase() && s.hasData)
    );

  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200">
      <h3 className="text-sm font-medium text-gray-700 mb-3">Upload Progress</h3>
      
      <div className="mb-4">
        <div className="flex justify-between text-xs font-medium text-gray-700 mb-1">
          <span>{completedSubjects.length} of {subjects.length} subjects uploaded</span>
          <span>{progress}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full ${
              progress === 100 ? 'bg-green-500' : 'bg-blue-500'
            }`}
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>
      
      <div className="space-y-2 max-h-40 overflow-y-auto mb-4">
        {subjects.map((subject) => (
          <div key={subject.id} className="flex items-center text-sm">
            {subject.hasData ? (
              <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
            ) : (
              <Circle className="w-4 h-4 text-gray-300 mr-2" />
            )}
            <span className={subject.hasData ? 'text-gray-700' : 'text-gray-500'}>
              {subject.name}
            </span>
            {requiredSubjects.includes(subject.name) && !subject.hasData && (
              <span className="ml-2 text-xs bg-red-100 text-red-800 px-2 py-0.5 rounded-full">
                Required
              </span>
            )}
          </div>
        ))}
      </div>
      
      {requiredSubjects.length > 0 && (
        <div className={`text-xs ${requiredSubjectsComplete ? 'text-green-600' : 'text-red-600'} mb-4`}>
          {requiredSubjectsComplete 
            ? 'All required subjects have been uploaded' 
            : 'Some required subjects are missing data'}
        </div>
      )}
      
      {progress === 100 && (
        <button
          className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center justify-center"
        >
          <CheckCircle className="w-4 h-4 mr-2" />
          Complete
        </button>
      )}
    </div>
  );
};

export default ProgressIndicator;