import React from "react";
import { Printer } from "lucide-react";

const ClassReportList = ({ reports, onViewReport }) => {
  return (
    <div className="p-4 border-t border-gray-200">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {reports.map((report) => (
          <div 
            key={report.student.id} 
            className="border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => onViewReport(report)}
          >
            <h5 className="font-medium text-gray-900 mb-1">{report.student.name}</h5>
            <p className="text-xs text-gray-500 mb-2">ID: {report.student.student_id}</p>
            <div className="flex justify-between items-center text-xs">
              <span className="text-blue-600">Position: {report.position}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onViewReport(report);
                }}
                className="p-1 text-gray-500 hover:text-blue-600"
              >
                <Printer className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ClassReportList;