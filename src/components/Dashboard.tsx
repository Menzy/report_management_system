import React, { useEffect, useState } from 'react';
import { supabase, School } from '../lib/supabase';
import { Building2, LogOut, BookOpen, Users, FileSpreadsheet, FileText, Settings } from 'lucide-react';
import MapPin from './MapPin';
import ClassManagement from './academic/ClassManagement';
import ReportCardGenerator from './reports/ReportCardGenerator';
import SchoolProfileManagement from './school/SchoolProfileManagement';
import BulkSubjectUpload from './academic/BulkSubjectUpload';
import ReportCardModal from './reports/ReportCardModal';

type DashboardProps = {
  userId: string;
  onSignOut: () => void;
};

// Add bulk upload context type
type BulkUploadContext = {
  schoolId: string;
  classItem: any;
} | null;

// Add report preview context type
type ReportPreviewContext = {
  report: any;
  classId: string;
} | null;

const Dashboard: React.FC<DashboardProps> = ({ userId, onSignOut }) => {
  const [school, setSchool] = useState<School | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'academic-records' | 'report-cards' | 'school-profile'>('overview');
  
  // Add bulk upload state
  const [bulkUploadContext, setBulkUploadContext] = useState<BulkUploadContext>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // Add report preview state
  const [reportPreviewContext, setReportPreviewContext] = useState<ReportPreviewContext>(null);

  const fetchSchoolData = React.useCallback(async () => {
    try {
      setLoading(true);
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
  }, [userId]);

  useEffect(() => {
    fetchSchoolData();
  }, [fetchSchoolData]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    onSignOut();
  };

  // Add bulk upload handlers
  const handleOpenBulkUpload = (schoolId: string, classItem: any) => {
    setBulkUploadContext({ schoolId, classItem });
  };

  const handleCloseBulkUpload = () => {
    setBulkUploadContext(null);
  };

  const handleBulkUploadSuccess = () => {
    setBulkUploadContext(null);
    setRefreshKey(prev => prev + 1); // Force refresh of ClassManagement
  };

  // Add report preview handlers
  const handleOpenReportPreview = (report: any, classId: string) => {
    setReportPreviewContext({ report, classId });
  };

  const handleCloseReportPreview = () => {
    setReportPreviewContext(null);
  };

  if (loading) {
    return (
      <div className="page-bg-primary flex items-center justify-center min-h-screen">
        <div className="glass-card p-8 text-center glass-fade-in">
          <div className="inline-block w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-2 text-text-glass-secondary">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-bg-primary flex items-center justify-center min-h-screen">
        <div className="glass-card p-8 max-w-md glass-fade-in">
          <div className="glass-alert glass-alert-error mb-4">
            <p className="text-text-glass-primary text-sm">{error}</p>
          </div>
          <button
            onClick={handleSignOut}
            className="glass-button glass-button-primary w-full"
          >
            Sign Out
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-bg-primary min-h-screen">
      {/* Bulk Upload Top-Level Overlay */}
      {bulkUploadContext && (
        <BulkSubjectUpload
          schoolId={bulkUploadContext.schoolId}
          classItem={bulkUploadContext.classItem}
          onBack={handleCloseBulkUpload}
          onSuccess={handleBulkUploadSuccess}
        />
      )}

      {/* Report Preview Top-Level Overlay */}
      {reportPreviewContext && (
        <ReportCardModal
          report={reportPreviewContext.report}
          classId={reportPreviewContext.classId}
          onClose={handleCloseReportPreview}
        />
      )}

      <header className="glass-navbar">
        <div className="px-4 py-6 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-text-glass-primary">School Report Management System</h1>
            <button
              onClick={handleSignOut}
              className="glass-button glass-button-danger flex items-center"
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
            <div className="glass-card glass-fade-in overflow-hidden">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center space-x-6">
                  {school.crest_url ? (
                    <img
                      src={school.crest_url}
                      alt={`${school.name} crest`}
                      className="w-24 h-24 object-contain rounded-lg"
                    />
                  ) : (
                    <div className="flex items-center justify-center w-24 h-24 glass-bg-subtle rounded-lg">
                      <Building2 className="w-12 h-12 text-text-glass-secondary" />
                    </div>
                  )}
                  <div>
                    <h2 className="text-2xl font-bold text-text-glass-primary">{school.name}</h2>
                    <p className="mt-1 text-sm italic text-text-glass-secondary">"{school.slogan}"</p>
                    <div className="flex items-start mt-2 text-sm text-text-glass-muted">
                      <MapPin className="flex-shrink-0 w-5 h-5 mr-1 text-text-glass-secondary" />
                      <span>{school.address}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="mt-8">
            <div className="glass-card p-1 glass-slide-up">
              <nav className="flex space-x-2">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`${
                    activeTab === 'overview'
                      ? 'glass-nav-item active'
                      : 'glass-nav-item'
                  } whitespace-nowrap py-3 px-4 font-medium text-sm flex items-center rounded-lg`}
                >
                  <Building2 className="w-5 h-5 mr-2" />
                  Overview
                </button>
                <button
                  onClick={() => setActiveTab('academic-records')}
                  className={`${
                    activeTab === 'academic-records'
                      ? 'glass-nav-item active'
                      : 'glass-nav-item'
                  } whitespace-nowrap py-3 px-4 font-medium text-sm flex items-center rounded-lg`}
                >
                  <BookOpen className="w-5 h-5 mr-2" />
                  Academic Records
                </button>
                <button
                  onClick={() => setActiveTab('report-cards')}
                  className={`${
                    activeTab === 'report-cards'
                      ? 'glass-nav-item active'
                      : 'glass-nav-item'
                  } whitespace-nowrap py-3 px-4 font-medium text-sm flex items-center rounded-lg`}
                >
                  <FileText className="w-5 h-5 mr-2" />
                  Report Cards
                </button>
                <button
                  onClick={() => setActiveTab('school-profile')}
                  className={`${
                    activeTab === 'school-profile'
                      ? 'glass-nav-item active'
                      : 'glass-nav-item'
                  } whitespace-nowrap py-3 px-4 font-medium text-sm flex items-center rounded-lg`}
                >
                  <Settings className="w-5 h-5 mr-2" />
                  School Profile
                </button>
              </nav>
            </div>

            <div className="mt-6">
              {activeTab === 'overview' ? (
                <div className="glass-card p-6 glass-fade-in">
                  <h2 className="text-xl font-semibold text-text-glass-primary mb-4">School Dashboard</h2>
                  <p className="text-text-glass-secondary mb-4">
                    Welcome to your school management dashboard. Here you can manage your school's academic records,
                    generate reports, and track student performance.
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
                    <div 
                      className="glass-card p-6 flex items-center cursor-pointer hover:scale-105 transition-all duration-300 glass-slide-up"
                      onClick={() => setActiveTab('academic-records')}
                      style={{ animationDelay: '0.1s' }}
                    >
                      <div className="glass-bg-blue p-3 rounded-full mr-4">
                        <FileSpreadsheet className="w-6 h-6 text-text-glass-primary" />
                      </div>
                      <div>
                        <h3 className="font-medium text-text-glass-primary">Academic Records</h3>
                        <p className="text-sm text-text-glass-secondary">Manage student scores and assessments</p>
                      </div>
                    </div>
                    
                    <div 
                      className="glass-card p-6 flex items-center cursor-pointer hover:scale-105 transition-all duration-300 glass-slide-up"
                      style={{ animationDelay: '0.2s' }}
                    >
                      <div className="glass-bg-green p-3 rounded-full mr-4">
                        <Users className="w-6 h-6 text-text-glass-primary" />
                      </div>
                      <div>
                        <h3 className="font-medium text-text-glass-primary">Student Management</h3>
                        <p className="text-sm text-text-glass-secondary">View and manage student information</p>
                      </div>
                    </div>
                    
                    <div 
                      className="glass-card p-6 flex items-center cursor-pointer hover:scale-105 transition-all duration-300 glass-slide-up"
                      onClick={() => setActiveTab('report-cards')}
                      style={{ animationDelay: '0.3s' }}
                    >
                      <div className="glass-bg-purple p-3 rounded-full mr-4">
                        <FileText className="w-6 h-6 text-text-glass-primary" />
                      </div>
                      <div>
                        <h3 className="font-medium text-text-glass-primary">Report Cards</h3>
                        <p className="text-sm text-text-glass-secondary">Generate and print student report cards</p>
                      </div>
                    </div>
                    
                    <div 
                      className="glass-card p-6 flex items-center cursor-pointer hover:scale-105 transition-all duration-300 glass-slide-up"
                      onClick={() => setActiveTab('school-profile')}
                      style={{ animationDelay: '0.4s' }}
                    >
                      <div className="glass-bg-amber p-3 rounded-full mr-4">
                        <Settings className="w-6 h-6 text-text-glass-primary" />
                      </div>
                      <div>
                        <h3 className="font-medium text-text-glass-primary">School Profile</h3>
                        <p className="text-sm text-text-glass-secondary">Update your school's information and contact details</p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : activeTab === 'academic-records' ? (
                <ClassManagement 
                  key={refreshKey}
                  schoolId={school?.id || ''} 
                  onOpenBulkUpload={handleOpenBulkUpload}
                />
              ) : activeTab === 'report-cards' ? (
                <ReportCardGenerator 
                  schoolId={school?.id || ''} 
                  onBack={() => setActiveTab('overview')}
                  onOpenReportPreview={handleOpenReportPreview}
                />
              ) : (
                <SchoolProfileManagement 
                  schoolId={school?.id || ''} 
                  onBack={() => setActiveTab('overview')}
                  onUpdateSuccess={fetchSchoolData}
                />
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;