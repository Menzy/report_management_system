import { forwardRef } from "react";
import ReportCardTemplate from "./ReportCardTemplate";
import ReportCardSecondPage from "./ReportCardSecondPage";

interface ReportCardWithAnalysisProps {
  report: any;
  classId: string;
}

const ReportCardWithAnalysis = forwardRef<HTMLDivElement, ReportCardWithAnalysisProps>(({ report, classId }, ref) => {
  return (
    <div ref={ref}>
      {/* First Page - Original Report Card */}
      <div className="page-break">
        <ReportCardTemplate report={report} />
      </div>
      
      {/* Page Break for PDF */}
      <div className="page-break-before"></div>
      
      {/* Second Page - Performance Analysis */}
      <div className="page-break">
        <ReportCardSecondPage report={report} classId={classId} />
      </div>
    </div>
  );
});

export default ReportCardWithAnalysis; 