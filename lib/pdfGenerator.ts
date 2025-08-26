// lib/pdfGenerator.ts
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// The function now accepts an array of HTMLElements
export const downloadPdf = async (elements: (HTMLElement | null)[], fileName: string) => {
    const validElements = elements.filter(el => el !== null) as HTMLElement[];
    if (validElements.length === 0) {
        console.error("No valid elements provided for PDF generation.");
        return;
    }

    // 1. Create a container for the clones that will be rendered off-screen
    const pdfContainer = document.createElement('div');
    pdfContainer.style.position = 'absolute';
    pdfContainer.style.left = '-9999px';
    pdfContainer.style.top = '0';
    pdfContainer.style.width = '1024px'; // A fixed width helps stabilize layout
    pdfContainer.style.padding = '20px'; // Add padding to mimic the page
    pdfContainer.style.backgroundColor = 'white';

    // 2. Clone each element and append it to our off-screen container
    validElements.forEach(el => {
        const clone = el.cloneNode(true) as HTMLElement;
        pdfContainer.appendChild(clone);
    });

    // --- Start Cleanup and Style Normalization on the Cloned Content ---

    // 3. Remove the buttons from the cloned header
    const buttonsToRemove = pdfContainer.querySelector('#pdf-exclude');
    if (buttonsToRemove) {
        buttonsToRemove.remove();
    }
    
    // 4. Fix the grid layout for vertical stacking in the PDF
    const gridContainer = pdfContainer.querySelector('.grid') as HTMLElement;
    if (gridContainer) {
        gridContainer.style.display = 'block'; // Remove grid behavior
        const gridChildren = Array.from(gridContainer.children) as HTMLElement[];
        gridChildren.forEach(child => {
            child.style.position = 'relative'; // Override sticky positioning
            child.style.top = 'auto';
            child.style.width = '100%';
            child.style.marginBottom = '24px'; // Add space between stacked items
            child.style.breakInside = 'avoid'; // Try to prevent items from splitting across pages
        });
    }

    // --- End Cleanup ---

    // 5. Append the container to the body to be rendered by html2canvas
    document.body.appendChild(pdfContainer);

    try {
        const canvas = await html2canvas(pdfContainer, {
            scale: 2,
            useCORS: true,
            backgroundColor: '#ffffff',
            windowWidth: pdfContainer.scrollWidth,
            windowHeight: pdfContainer.scrollHeight,
        });

        const imgData = canvas.toDataURL('image/png', 1.0);
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        
        const ratio = canvas.width / pdfWidth;
        const imgHeight = canvas.height / ratio;

        let heightLeft = imgHeight;
        let position = 0;

        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
        heightLeft -= pdfHeight;

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
        // 6. IMPORTANT: Always remove the container from the DOM
        document.body.removeChild(pdfContainer);
    }
};