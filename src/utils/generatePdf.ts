import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import * as React from 'react';
import * as ReactDOM from 'react-dom/client';
import ReportCardWithFullAnalysis from '../components/reports/ReportCardWithFullAnalysis';

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

export const generatePdfFromReport = async (report: Report, classId: string): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    // Create a temporary container for the report
    const container = document.createElement('div');
    container.style.position = 'absolute';
    container.style.left = '-9999px';
    container.style.width = '210mm';
    container.style.padding = '20mm';
    container.style.backgroundColor = 'white';
    document.body.appendChild(container);

    // Create a root and render the ReportCardWithFullAnalysis
    const root = ReactDOM.createRoot(container);
    root.render(
      React.createElement('div', { className: 'report-print' },
        React.createElement(ReportCardWithFullAnalysis, { report, classId })
      )
    );

    const generatePdf = async () => {
      try {
        // Wait for the component to render and charts to load
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Get all page elements
        const pageElements = container.querySelectorAll('.page-break');
        
        if (pageElements.length === 0) {
          throw new Error('No pages found to generate PDF');
        }

        // Create a new PDF
        const pdf = new jsPDF({
          orientation: 'portrait',
          unit: 'mm',
          format: 'a4',
        });

        const pdfWidth = pdf.internal.pageSize.getWidth();
        
        // Process each page
        for (let i = 0; i < pageElements.length; i++) {
          const pageElement = pageElements[i] as HTMLElement;
          
          // Convert the page to a canvas
          const canvas = await html2canvas(pageElement, {
            scale: 2,
            useCORS: true,
            logging: false,
            allowTaint: true,
            scrollX: 0,
            scrollY: 0,
            backgroundColor: '#ffffff',
            windowWidth: document.documentElement.offsetWidth,
            windowHeight: document.documentElement.offsetHeight
          } as any);

          const imgData = canvas.toDataURL('image/png');
          const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

          // Add a new page if not the first page
          if (i > 0) {
            pdf.addPage();
          }

          // Add the image to the PDF
          pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');
        }

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

export const downloadPdf = async (report: Report, classId: string): Promise<void> => {
  try {
    const pdfBlob = await generatePdfFromReport(report, classId);
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
