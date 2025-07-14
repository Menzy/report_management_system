import { Printer, Download } from "lucide-react";
import { Report } from '../../utils/generatePdf';

interface ClassReportListProps {
  reports: Report[];
  onViewReport: (report: Report) => void;
  classId: string;
}

const ClassReportList = ({ reports, onViewReport, classId }: ClassReportListProps) => {
  return (
    <div className="p-4 border-t border-gray-200">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {reports.map((report) => (
          <div 
            key={report.student.id} 
            className="bg-white border border-gray-200 rounded-lg p-4 hover:bg-blue-50 hover:border-blue-300 hover:shadow-lg transition-all duration-300 cursor-pointer shadow-sm"
            onClick={() => onViewReport(report)}
          >
            <h5 className="font-medium text-gray-900 mb-1">{report.student.name}</h5>
            <p className="text-xs text-gray-600 mb-2">ID: {report.student.student_id}</p>
            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-700">Position: {report.position}</span>
              <div className="flex space-x-1">
                <button
                  onClick={async (e) => {
                    e.stopPropagation();
                    try {
                      const { downloadPdf } = await import('../../utils/generatePdf');
                      await downloadPdf(report, classId);
                    } catch (error) {
                      console.error('Error downloading PDF:', error);
                    }
                  }}
                  className="bg-green-500 hover:bg-green-600 text-white p-1 rounded transition-colors"
                  title="Download as PDF"
                >
                  <Download className="w-3 h-3" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onViewReport(report);
                  }}
                  className="bg-blue-500 hover:bg-blue-600 text-white p-1 rounded transition-colors"
                  title="View report"
                >
                  <Printer className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ClassReportList;