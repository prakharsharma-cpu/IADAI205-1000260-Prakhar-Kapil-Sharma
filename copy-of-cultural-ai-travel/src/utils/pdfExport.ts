import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export const exportToPDF = async (elementId: string, fileName: string = 'itinerary.pdf'): Promise<void> => {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error(`Element with id "${elementId}" not found`);
  }

  try {
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#1a1c23',
      onclone: (clonedDoc) => {
        // html2canvas v1.4.1 and below cannot parse oklch/oklab colors used by Tailwind v4
        // This is a more aggressive approach to strip these functions from the entire cloned document
        
        // 1. Process all style tags and stylesheets
        const styleTags = clonedDoc.getElementsByTagName('style');
        for (let i = 0; i < styleTags.length; i++) {
          try {
            styleTags[i].innerHTML = styleTags[i].innerHTML
              .replace(/oklch\([^)]+\)/g, '#ffffff')
              .replace(/oklab\([^)]+\)/g, '#ffffff');
          } catch (e) {
            // Ignore errors for read-only or problematic style tags
          }
        }

        // 2. Process all elements with inline styles and computed styles
        const allElements = clonedDoc.querySelectorAll('*');
        allElements.forEach((node) => {
          const el = node as HTMLElement;
          
          // Inline styles
          if (el.getAttribute && el.getAttribute('style')) {
            const styleAttr = el.getAttribute('style')!;
            if (styleAttr.includes('oklch') || styleAttr.includes('oklab')) {
              el.setAttribute('style', styleAttr
                .replace(/oklch\([^)]+\)/g, '#ffffff')
                .replace(/oklab\([^)]+\)/g, '#ffffff')
              );
            }
          }

          // Computed styles - html2canvas uses these
          // We force override them to standard hex/rgb
          const colorProperties = [
            'color', 'background-color', 'border-color', 
            'border-top-color', 'border-right-color', 'border-bottom-color', 'border-left-color',
            'fill', 'stroke', 'outline-color'
          ];

          colorProperties.forEach(prop => {
            // Use getPropertyValue which is more reliable for some browsers
            const value = window.getComputedStyle(el).getPropertyValue(prop);
            if (value && (value.includes('oklch') || value.includes('oklab'))) {
              // Map specific colors if possible, otherwise fallback to white or dark
              if (prop === 'background-color') {
                if (el.classList.contains('bg-[#d4f870]/20')) el.style.setProperty(prop, 'rgba(212, 248, 112, 0.2)', 'important');
                else if (el.classList.contains('bg-[#242731]')) el.style.setProperty(prop, '#242731', 'important');
                else el.style.setProperty(prop, '#1a1c23', 'important');
              } else if (prop === 'color') {
                if (el.classList.contains('text-[#d4f870]')) el.style.setProperty(prop, '#d4f870', 'important');
                else if (el.classList.contains('text-gray-300')) el.style.setProperty(prop, '#d1d5db', 'important');
                else if (el.classList.contains('text-gray-400')) el.style.setProperty(prop, '#9ca3af', 'important');
                else el.style.setProperty(prop, '#ffffff', 'important');
              } else if (prop.includes('border')) {
                el.style.setProperty(prop, '#2a2d39', 'important');
              } else {
                el.style.setProperty(prop, '#ffffff', 'important');
              }
            }
          });
        });

        // 3. Inject a master override style tag to the cloned document
        const style = clonedDoc.createElement('style');
        style.innerHTML = `
          * { 
            oklch: none !important; 
            oklab: none !important;
          }
          #${elementId} { background-color: #1a1c23 !important; }
          #${elementId} * { 
            color-scheme: dark !important;
          }
          .text-gray-400 { color: #9ca3af !important; }
          .text-gray-300 { color: #d1d5db !important; }
          .bg-[#242731] { background-color: #242731 !important; }
          .border-[#2a2d39] { border-color: #2a2d39 !important; }
          .text-[#d4f870] { color: #d4f870 !important; }
          .bg-[#d4f870]/20 { background-color: rgba(212, 248, 112, 0.2) !important; }
        `;
        clonedDoc.head.appendChild(style);
      }
    });
    
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    
    let heightLeft = pdfHeight;
    let position = 0;
    const pageHeight = pdf.internal.pageSize.getHeight();

    pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
    heightLeft -= pageHeight;

    while (heightLeft >= 0) {
      position = heightLeft - pdfHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
      heightLeft -= pageHeight;
    }
    
    pdf.save(fileName);
  } catch (error) {
    console.error('PDF generation failed:', error);
    throw error;
  }
};
