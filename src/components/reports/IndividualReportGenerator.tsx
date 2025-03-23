import React from "react";
import { FileText } from "lucide-react";

const IndividualReportGenerator = () => {
  return (
    <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
      <FileText className="mx-auto h-12 w-12 text-gray-400" />
      <h3 className="mt-2 text-sm font-medium text-gray-900">Individual Report Generation</h3>
      <p className="mt-1 text-sm text-gray-500">
        This feature is coming soon. Please use the Batch Reports tab to generate reports for an entire class.
      </p>
    </div>
  );
};

export default IndividualReportGenerator;