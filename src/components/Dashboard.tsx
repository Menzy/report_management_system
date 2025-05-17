import React, { useEffect, useState } from 'react';
import { supabase, School } from '../lib/supabase';
import { Building2, LogOut, BookOpen, Users, FileSpreadsheet, FileText, Settings } from 'lucide-react';
import MapPin from './MapPin';
import ClassManagement from './academic/ClassManagement';
import ReportCardGenerator from './reports/ReportCardGenerator';
import SchoolProfileManagement from './school/SchoolProfileManagement';

type DashboardProps = {
  userId: string;
  onSignOut: () => void;
};

const Dashboard: React.FC<DashboardProps> = ({ userId, onSignOut }) => {
  const [school, setSchool] = useState<School | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'academic-records' | 'report-cards' | 'school-profile'>('overview');

  useEffect(() => {
    const fetchSchoolData = async () => {
      try {
        const { data, error } = await supabase
          .from('schools')
          .select('*')
          .eq('user_id', userId)
          .single();

        if (error) throw error;
        setSchool(data as School);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load school data');
        console.error('Error fetching school data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSchoolData();
  }, [userId]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    onSignOut();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="p-8 text-center">
          <div className="inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-2 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="p-8 max-w-md bg-white rounded-lg shadow-md">
          <div className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-md">
            {error}
          </div>
          <button
            onClick={handleSignOut}
            className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
          >
            Sign Out
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="px-4 py-6 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900">School Report Management System</h1>
            <button
              onClick={handleSignOut}
              className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <main className="py-10">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          {school && (
            <div className="overflow-hidden bg-white rounded-lg shadow">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center space-x-6">
                  {school.crest_url ? (
                    <img
                      src={school.crest_url}
                      alt={`${school.name} crest`}
                      className="w-24 h-24 object-contain"
                    />
                  ) : (
                    <div className="flex items-center justify-center w-24 h-24 bg-gray-100 rounded-md">
                      <Building2 className="w-12 h-12 text-gray-400" />
                    </div>
                  )}
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{school.name}</h2>
                    <p className="mt-1 text-sm italic text-gray-600">"{school.slogan}"</p>
                    <div className="flex items-start mt-2 text-sm text-gray-500">
                      <MapPin className="flex-shrink-0 w-5 h-5 mr-1 text-gray-400" />
                      <span>{school.address}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="mt-8">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`${
                    activeTab === 'overview'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
                >
                  <Building2 className="w-5 h-5 mr-2" />
                  Overview
                </button>
                <button
                  onClick={() => setActiveTab('academic-records')}
                  className={`${
                    activeTab === 'academic-records'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
                >
                  <BookOpen className="w-5 h-5 mr-2" />
                  Academic Records
                </button>
                <button
                  onClick={() => setActiveTab('report-cards')}
                  className={`${
                    activeTab === 'report-cards'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
                >
                  <FileText className="w-5 h-5 mr-2" />
                  Report Cards
                </button>
                <button
                  onClick={() => setActiveTab('school-profile')}
                  className={`${
                    activeTab === 'school-profile'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
                >
                  <Settings className="w-5 h-5 mr-2" />
                  School Profile
                </button>
              </nav>
            </div>

            <div className="mt-6">
              {activeTab === 'overview' ? (
                <div className="bg-white shadow rounded-lg p-6">
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">School Dashboard</h2>
                  <p className="text-gray-600 mb-4">
                    Welcome to your school management dashboard. Here you can manage your school's academic records,
                    generate reports, and track student performance.
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                    <div 
                      className="bg-blue-50 p-6 rounded-lg shadow-sm border border-blue-100 flex items-center cursor-pointer hover:bg-blue-100 transition-colors"
                      onClick={() => setActiveTab('academic-records')}
                    >
                      <div className="bg-blue-100 p-3 rounded-full mr-4">
                        <FileSpreadsheet className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-blue-900">Academic Records</h3>
                        <p className="text-sm text-blue-700">Manage student scores and assessments</p>
                      </div>
                    </div>
                    
                    <div className="bg-green-50 p-6 rounded-lg shadow-sm border border-green-100 flex items-center cursor-pointer hover:bg-green-100 transition-colors">
                      <div className="bg-green-100 p-3 rounded-full mr-4">
                        <Users className="w-6 h-6 text-green-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-green-900">Student Management</h3>
                        <p className="text-sm text-green-700">View and manage student information</p>
                      </div>
                    </div>
                    
                    <div 
                      className="bg-purple-50 p-6 rounded-lg shadow-sm border border-purple-100 flex items-center cursor-pointer hover:bg-purple-100 transition-colors"
                      onClick={() => setActiveTab('report-cards')}
                    >
                      <div className="bg-purple-100 p-3 rounded-full mr-4">
                        <FileText className="w-6 h-6 text-purple-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-purple-900">Report Cards</h3>
                        <p className="text-sm text-purple-700">Generate and print student report cards</p>
                      </div>
                    </div>
                    
                    <div 
                      className="bg-amber-50 p-6 rounded-lg shadow-sm border border-amber-100 flex items-center cursor-pointer hover:bg-amber-100 transition-colors"
                      onClick={() => setActiveTab('school-profile')}
                    >
                      <div className="bg-amber-100 p-3 rounded-full mr-4">
                        <Settings className="w-6 h-6 text-amber-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-amber-900">School Profile</h3>
                        <p className="text-sm text-amber-700">Update your school's information and contact details</p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : activeTab === 'academic-records' ? (
                <ClassManagement schoolId={school?.id || ''} />
              ) : activeTab === 'report-cards' ? (
                <ReportCardGenerator schoolId={school?.id || ''} onBack={() => setActiveTab('overview')} />
              ) : (
                <SchoolProfileManagement schoolId={school?.id || ''} onBack={() => setActiveTab('overview')} />
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;