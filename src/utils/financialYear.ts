
export interface FinancialYearData {
  year: string;
  startDate: Date;
  endDate: Date;
  invoices: any[];
  totalInvoices: number;
  totalAmount: number;
}

export const getCurrentFinancialYear = (): string => {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth(); // 0-based (March = 2)
  
  // Financial year in India runs from April 1 to March 31
  if (currentMonth >= 3) { // April onwards
    return `${currentYear}-${currentYear + 1}`;
  } else { // January to March
    return `${currentYear - 1}-${currentYear}`;
  }
};

export const getFinancialYearDates = (year: string) => {
  const [startYear, endYear] = year.split('-').map(Number);
  return {
    startDate: new Date(startYear, 3, 1), // April 1
    endDate: new Date(endYear, 2, 31) // March 31
  };
};

export const formatFinancialYear = (year: string): string => {
  const [startYear, endYear] = year.split('-');
  return `FY ${startYear}-${endYear.slice(2)}`;
};

export const isNewFinancialYear = (lastInvoiceDate: string): boolean => {
  const lastDate = new Date(lastInvoiceDate);
  const currentFY = getCurrentFinancialYear();
  const { startDate } = getFinancialYearDates(currentFY);
  
  return lastDate < startDate;
};
