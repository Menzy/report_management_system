import React, { useRef, useEffect } from "react";
import { Printer, Download } from "lucide-react";
import { useReactToPrint } from "react-to-print";
import ReportCardWithFullAnalysis from "./ReportCardWithFullAnalysis";

interface ReportCardModalProps {
  report: any;
  onClose: () => void;
  classId: string;
}

const ReportCardModal: React.FC<ReportCardModalProps> = ({ report, onClose, classId }) => {
  const reportRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  const handleDownloadPdf = async () => {
    try {
      const { downloadPdf } = await import('../../utils/generatePdf');
      await downloadPdf(report, classId);
    } catch (error) {
      console.error('Error downloading PDF:', error);
    }
  };

  const handlePrint = useReactToPrint({
    content: () => reportRef.current,
    documentTitle: `Report_${report?.student?.name || 'Student'}_${report.term}_${report.academicYear}`,
    pageStyle: `
      @page {
        size: A4;
        margin: 10mm;
      }
      @media print {
        .page-break-before {
          page-break-before: always;
        }
        .page-break {
          page-break-inside: avoid;
        }
        .print-preview {
          background: white !important;
          padding: 0 !important;
        }
        .print-preview .page-break {
          box-shadow: none !important;
          margin: 0 !important;
          border: none !important;
          border-radius: 0 !important;
          width: auto !important;
          max-width: none !important;
          min-height: auto !important;
        }
        .print-preview .page-break::before {
          display: none !important;
        }
      }
    `
  });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={(e) => e.stopPropagation()}>
      <div ref={modalRef} className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-900">
            Report Card with Performance Analysis: {report.student.name}
          </h3>
          <div className="flex space-x-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center text-sm mr-2"
            >
              <Printer className="w-4 h-4 mr-1" />
              Print
            </button>
            <button
              onClick={handleDownloadPdf}
              className="px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center text-sm"
            >
              <Download className="w-4 h-4 mr-1" />
              Save as PDF
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
          <div className="print-preview">
            <ReportCardWithFullAnalysis ref={reportRef} report={report} classId={classId} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportCardModal;