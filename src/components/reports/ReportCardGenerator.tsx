import React, { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { ArrowLeft, Users, FileText } from "lucide-react";
import BatchReportGenerator from "./BatchReportGenerator";
import IndividualReportGenerator from "./IndividualReportGenerator";

const ReportCardGenerator = ({ schoolId, onBack }) => {
  const [school, setSchool] = useState(null);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
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
        setError(err.message || "Failed to load data");
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
      <div className="flex items-center justify-center p-8">
        <div className="inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="ml-2 text-gray-600">Loading report card generator...</p>
      </div>
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
          Report Card Generator
        </h2>
      </div>

      {error && (
        <div className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-md">
          {error}
        </div>
      )}

      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab("batch")}
              className={`${
                activeTab === "batch"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
            >
              <Users className="w-5 h-5 mr-2" />
              Batch Reports
            </button>
            <button
              onClick={() => setActiveTab("individual")}
              className={`${
                activeTab === "individual"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
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
        />
      ) : (
        <IndividualReportGenerator 
          school={school} 
          classes={classes} 
        />
      )}
    </div>
  );
};

export default ReportCardGenerator;