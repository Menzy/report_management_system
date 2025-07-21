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
            className="border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => onViewReport(report)}
          >
            <h5 className="font-medium text-gray-900 mb-1">{report.student.name}</h5>
            <p className="text-xs text-gray-500 mb-2">ID: {report.student.student_id}</p>
            <div className="flex justify-between items-center text-xs">
              <span className="text-blue-600">Position: {report.position}</span>
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
                  className="p-1 text-gray-500 hover:text-green-600"
                  title="Download as PDF"
                >
                  <Download className="w-4 h-4" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onViewReport(report);
                  }}
                  className="p-1 text-gray-500 hover:text-blue-600"
                  title="View report"
                >
                  <Printer className="w-4 h-4" />
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