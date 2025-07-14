import React, { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { ArrowLeft, Users, FileText } from "lucide-react";
import BatchReportGenerator from "./BatchReportGenerator";
import IndividualReportGenerator from "./IndividualReportGenerator";

type ReportCardGeneratorProps = {
  schoolId: string;
  onBack: () => void;
  onOpenReportPreview?: (report: any, classId: string) => void;
};

const ReportCardGenerator: React.FC<ReportCardGeneratorProps> = ({ schoolId, onBack, onOpenReportPreview }) => {
  const [school, setSchool] = useState<any>(null);
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("batch"); // "individual" or "batch"

  useEffect(() => {
    const fetchSchoolData = async () => {
      try {
        // Fetch school data
        const { data: schoolData, error: schoolError } = await supabase
          .from("schools")
          .select("*")
          .eq("id", schoolId)
          .single();

        if (schoolError) throw schoolError;
        setSchool(schoolData);

        // Fetch classes
        const { data: classesData, error: classesError } = await supabase
          .from("classes")
          .select("*")
          .eq("school_id", schoolId)
          .order("name", { ascending: true });

        if (classesError) throw classesError;
        setClasses(classesData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load data");
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };

    if (schoolId) {
      fetchSchoolData();
    }
  }, [schoolId]);

  if (loading) {
    return (
      <div className="glass-card p-8 text-center glass-fade-in">
        <div className="inline-block w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
        <p className="ml-2 text-text-glass-secondary">Loading report card generator...</p>
      </div>
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
          Report Card Generator
        </h2>
      </div>

      {error && (
        <div className="glass-alert glass-alert-error mb-4">
          <p className="text-text-glass-primary text-sm">{error}</p>
        </div>
      )}

      <div className="mb-6">
        <div className="glass-card p-1 glass-slide-up">
          <nav className="flex space-x-2">
            <button
              onClick={() => setActiveTab("batch")}
              className={`${
                activeTab === "batch"
                  ? "glass-nav-item active"
                  : "glass-nav-item"
              } whitespace-nowrap py-3 px-4 font-medium text-sm flex items-center rounded-lg`}
            >
              <Users className="w-5 h-5 mr-2" />
              Batch Reports
            </button>
            <button
              onClick={() => setActiveTab("individual")}
              className={`${
                activeTab === "individual"
                  ? "glass-nav-item active"
                  : "glass-nav-item"
              } whitespace-nowrap py-3 px-4 font-medium text-sm flex items-center rounded-lg`}
            >
              <FileText className="w-5 h-5 mr-2" />
              Individual Reports
            </button>
          </nav>
        </div>
      </div>

      {activeTab === "batch" ? (
        <BatchReportGenerator 
          school={school} 
          classes={classes}
          onOpenReportPreview={onOpenReportPreview}
        />
      ) : (
        <IndividualReportGenerator />
      )}
    </div>
  );
};

export default ReportCardGenerator;