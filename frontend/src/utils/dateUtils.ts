export const formatDate = (
  format: 'YYYY-MM-DD' | 'MM/DD/YYYY',
  date: Date | string = new Date()
): string => {
  date = typeof date === 'string' ? new Date(date) : date;

  // Get date components
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');

  // Return formatted string based on requested format
  if (format === 'MM/DD/YYYY') {
    return `${month}/${day}/${year}`;
  } else {
    // 'YYYY-MM-DD'
    return `${year}-${month}-${day}`;
  }
};

export function isValidMdy(mdy: string) {
  return mdy.match(/^\d{1,2}\/\d{1,2}\/\d{4}$/) && !isNaN(new Date(mdy).getTime());
}

export function ymdToDate(ymd: string) {}
