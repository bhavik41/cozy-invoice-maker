
import { Invoice, InvoiceItem } from '@/types';

export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2
  }).format(amount);
};

export const formatDate = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

export const calculateInvoiceTotal = (items: InvoiceItem[]): number => {
  return items.reduce((total, item) => total + item.amount, 0);
};

export const calculateTaxAmount = (invoice: Invoice): number => {
  let taxAmount = 0;
  
  invoice.items.forEach(item => {
    const itemTax = (item.amount * item.gstRate) / 100;
    taxAmount += itemTax;
  });
  
  return taxAmount;
};

export const calculateCgstSgstAmount = (invoice: Invoice): { cgst: number, sgst: number } => {
  let totalTax = 0;
  
  invoice.items.forEach(item => {
    const itemTax = (item.amount * item.gstRate) / 100;
    totalTax += itemTax;
  });
  
  // Split the tax equally between CGST and SGST
  return {
    cgst: totalTax / 2,
    sgst: totalTax / 2
  };
};

export const numberToWords = (num: number): string => {
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  const convertLessThanOneThousand = (num: number): string => {
    if (num === 0) {
      return '';
    }
    
    if (num < 20) {
      return ones[num];
    }
    
    const ten = Math.floor(num / 10) % 10;
    const one = num % 10;
    
    return (ten > 0 ? tens[ten] + (one > 0 ? ' ' + ones[one] : '') : ones[one]);
  };

  if (num === 0) {
    return 'Zero';
  }

  let words = '';
  
  // Handle crores (10 million)
  if (num >= 10000000) {
    words += convertLessThanOneThousand(Math.floor(num / 10000000)) + ' Crore ';
    num %= 10000000;
  }
  
  // Handle lakhs (100,000)
  if (num >= 100000) {
    words += convertLessThanOneThousand(Math.floor(num / 100000)) + ' Lakh ';
    num %= 100000;
  }
  
  // Handle thousands
  if (num >= 1000) {
    words += convertLessThanOneThousand(Math.floor(num / 1000)) + ' Thousand ';
    num %= 1000;
  }
  
  // Handle hundreds
  if (num >= 100) {
    words += convertLessThanOneThousand(Math.floor(num / 100)) + ' Hundred ';
    num %= 100;
  }
  
  // Handle tens and ones
  if (num > 0) {
    if (words !== '') {
      words += 'and ';
    }
    words += convertLessThanOneThousand(num);
  }
  
  return words.trim();
};

export const handleFileUpload = (callback: (data: any) => void) => {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json';
  
  input.onchange = (e: any) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        callback(data);
      } catch (err) {
        console.error('Error parsing JSON', err);
        alert('Invalid file format');
      }
    };
    
    reader.readAsText(file);
  };
  
  input.click();
};

export const printInvoice = () => {
  // Add a small delay to ensure styles are applied
  setTimeout(() => {
    window.print();
  }, 100);
};

export const exportInvoiceToJson = (invoice: Invoice) => {
  const dataStr = JSON.stringify(invoice, null, 2);
  const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
  
  const exportFileDefaultName = `invoice-${invoice.invoiceNumber}-${new Date().toISOString().slice(0, 10)}.json`;
  
  const linkElement = document.createElement('a');
  linkElement.setAttribute('href', dataUri);
  linkElement.setAttribute('download', exportFileDefaultName);
  linkElement.click();
};

export const exportToCsv = (filename: string, rows: Array<Object>) => {
  if (!rows || !rows.length) {
    return;
  }
  
  const separator = ',';
  const keys = Object.keys(rows[0] as Object);
  const csvContent = 
    keys.join(separator) +
    '\n' +
    rows.map(row => {
      return keys.map(k => {
        let cell = (row as any)[k] === null || (row as any)[k] === undefined ? '' : (row as any)[k];
        cell = cell instanceof Date ? cell.toLocaleString() : cell.toString();
        if (cell.includes(separator) || cell.includes('"') || cell.includes('\n')) {
          cell = `"${cell.replace(/"/g, '""')}"`;
        }
        return cell;
      }).join(separator);
    }).join('\n');
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportInvoiceToPdf = async (elementId: string, filename: string) => {
  try {
    // This is a placeholder - in a real app, you might use a library like jsPDF or html2pdf
    // For now, we'll use the print functionality which allows saving as PDF
    printInvoice();
  } catch (error) {
    console.error('Failed to export PDF:', error);
    alert('PDF export failed. Try using Print to PDF option instead.');
  }
};
