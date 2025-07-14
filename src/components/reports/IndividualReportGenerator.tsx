import { FileText } from "lucide-react";

const IndividualReportGenerator = () => {
  return (
    <div className="glass-card text-center py-8 glass-fade-in">
      <FileText className="mx-auto h-12 w-12 text-text-glass-secondary" />
      <h3 className="mt-2 text-sm font-medium text-text-glass-primary">Individual Report Generation</h3>
      <p className="mt-1 text-sm text-text-glass-secondary">
        This feature is coming soon. Please use the Batch Reports tab to generate reports for an entire class.
      </p>
    </div>
  );
};

export default IndividualReportGenerator;