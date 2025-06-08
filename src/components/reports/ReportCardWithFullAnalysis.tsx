import { forwardRef } from "react";
import ReportCardTemplate from "./ReportCardTemplate";
import ReportCardSecondPage from "./ReportCardSecondPage";
import ReportCardThirdPage from "./ReportCardThirdPage";

interface ReportCardWithFullAnalysisProps {
  report: any;
  classId: string;
}

const ReportCardWithFullAnalysis = forwardRef<HTMLDivElement, ReportCardWithFullAnalysisProps>(({ report, classId }, ref) => {
  return (
    <div ref={ref}>
      {/* Page 1: Original Report Card */}
      <div className="page-break">
        <ReportCardTemplate report={report} />
      </div>
      
      {/* Page 2: Performance Analysis */}
      <div className="page-break">
        <ReportCardSecondPage report={report} classId={classId} />
      </div>
      
      {/* Page 3: Class and Examination Scores Analysis */}
      <div className="page-break">
        <ReportCardThirdPage report={report} classId={classId} />
      </div>
    </div>
  );
});

export default ReportCardWithFullAnalysis; 