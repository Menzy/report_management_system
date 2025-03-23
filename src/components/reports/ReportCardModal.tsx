import React, { useRef } from "react";
import { Printer } from "lucide-react";
import { useReactToPrint } from "react-to-print";
import ReportCardTemplate from "./ReportCardTemplate";

const ReportCardModal = ({ report, onClose }) => {
  const reportRef = useRef(null);

  const handlePrint = useReactToPrint({
    content: () => reportRef.current,
    documentTitle: `Report_${report?.student?.name || 'Student'}_${report.term}_${report.academicYear}`,
    pageStyle: `
      @page {
        size: A4;
        margin: 10mm;
      }
      @media print {
        .page-break {
          page-break-after: always;
        }
      }
    `
  });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-900">
            Report Card: {report.student.name}
          </h3>
          <div className="flex space-x-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center text-sm"
            >
              <Printer className="w-4 h-4 mr-1" />
              Print
            </button>
            <button
              onClick={onClose}
              className="p-1 text-gray-500 hover:text-gray-700"
            >
              &times;
            </button>
          </div>
        </div>
        <div className="p-6">
          <ReportCardTemplate ref={reportRef} report={report} />
        </div>
      </div>
    </div>
  );
};

export default ReportCardModal;