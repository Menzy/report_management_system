import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import * as React from 'react';
import * as ReactDOM from 'react-dom/client';
import ReportCardTemplate from '../components/reports/ReportCardTemplate';

export interface Report {
  student: {
    id: string;
    name: string;
    student_id: string;
    [key: string]: any;
  };
  term: string;
  academicYear: string;
  class: {
    id: string;
    name: string;
    [key: string]: any;
  };
  attendance: {
    present: number;
    total: number;
  };
  position: string;
  subjects: Array<{
    subject_id: string;
    subject_name: string;
    continuous_assessment: number;
    exam_score: number;
    total_score: number;
    grade: string;
    position: string;
    remark: string;
    raw_scores: { [key: string]: number };
  }>;
  school: {
    id: string;
    name: string;
    address: string;
    phone?: string;
    email?: string;
    crest_url?: string;
    [key: string]: any;
  };
}

export const generatePdfFromReport = async (report: Report): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    // Create a temporary container for the report
    const container = document.createElement('div');
    container.style.position = 'absolute';
    container.style.left = '-9999px';
    container.style.width = '210mm';
    container.style.padding = '20mm';
    document.body.appendChild(container);

    // Create a root and render the ReportCardTemplate
    const root = ReactDOM.createRoot(container);
    root.render(
      React.createElement('div', { className: 'report-print' },
        React.createElement(ReportCardTemplate, { report })
      )
    );

    const generatePdf = async () => {
      try {
        // Wait for the component to render
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Convert the component to a canvas with type assertion for options
        const canvas = await html2canvas(container, {
          scale: 2, // Higher scale for better quality
          useCORS: true,
          logging: false,
          allowTaint: true,
          scrollX: 0,
          scrollY: 0,
          windowWidth: document.documentElement.offsetWidth,
          windowHeight: document.documentElement.offsetHeight
        } as any); // Using type assertion as a last resort

        // Create a new PDF
        const pdf = new jsPDF({
          orientation: 'portrait',
          unit: 'mm',
          format: 'a4',
        });

        // Calculate the dimensions of the PDF page
        const imgData = canvas.toDataURL('image/png');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

        // Add the image to the PDF
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');

        // Get the PDF as a blob
        const pdfBlob = pdf.output('blob');
        resolve(pdfBlob);
      } catch (error) {
        console.error('Error generating PDF:', error);
        reject(error);
      } finally {
        // Clean up
        root.unmount();
        document.body.removeChild(container);
      }
    };

    generatePdf();
  });
};

export const downloadPdf = async (report: Report): Promise<void> => {
  try {
    const pdfBlob = await generatePdfFromReport(report);
    const url = URL.createObjectURL(pdfBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Report_${report.student.name}_${report.term}_${report.academicYear}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error downloading PDF:', error);
    throw error;
  }
};
