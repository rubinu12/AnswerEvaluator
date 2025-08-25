// lib/pdfGenerator.ts
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// The function now accepts an HTMLElement directly
export const downloadPdf = async (element: HTMLElement | null, fileName:string) => {
    // A small delay to ensure the DOM is fully painted, especially after state changes.
    await new Promise(resolve => setTimeout(resolve, 200));

    if (!element) {
        console.error("The element to be downloaded was not found.");
        return;
    }

    // Temporarily apply a class that removes box-shadow and borders for a cleaner PDF.
    element.classList.add('pdf-capture');

    try {
        const canvas = await html2canvas(element, {
            scale: 2, // Higher scale for better resolution
            useCORS: true,
            logging: false,
            backgroundColor: '#ffffff', // Explicitly set a white background
        });

        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        
        const canvasWidth = canvas.width;
        const canvasHeight = canvas.height;

        // Calculate the ratio to fit the image onto the PDF page width
        const ratio = canvasWidth / pdfWidth;
        const imgHeight = canvasHeight / ratio;

        let heightLeft = imgHeight;
        let position = 0;

        // Add the first page
        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
        heightLeft -= pdfHeight;

        // Add new pages if the content is longer than one page
        while (heightLeft > 0) {
            position = -heightLeft;
            pdf.addPage();
            pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
            heightLeft -= pdfHeight;
        }

        pdf.save(`${fileName}.pdf`);
    } catch (error) {
        console.error("Error generating PDF:", error);
    } finally {
        // IMPORTANT: Always remove the temporary class
        element.classList.remove('pdf-capture');
    }
};