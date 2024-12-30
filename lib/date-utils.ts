// lib/date-utils.ts

/**
 * Check if today is Monday
 * @returns {boolean} true if today is Monday, false otherwise
 */
export function isMonday(): boolean {
    const today = new Date();
    return today.getDay() === 1; // 1 means Monday
}

/**
 * Get the date of today in MM/DD/YYYY format.
 * @param date - The date object to format.
 * @returns {string} Date formatted as MM/DD/YYYY
 */
export function formatDateMMDDYYYY(date: Date): string {
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Month is 0-based, so add 1
    const day = date.getDate().toString().padStart(2, '0');
    const year = date.getFullYear(); // Get the full year (e.g., 2024)
    return `${month}/${day}/${year}`;
}

//  Get endDate for Projected Rebill Revenue
// Helper function to check if a year is a leap year
function isLeapYear(year: number): boolean {
    return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
}


// Function to calculate the end date based on the start date
export function calculateEndDate(startDate: string): string {
    // Parse the startDate string into a Date object
    const [month, day, year] = startDate.split('/').map(num => parseInt(num, 10));
    const start = new Date(year, month - 1, day);  // Start date, year is already in YYYY format

    // length of report
    const daysToAdd: number = 29;

    // Add the appropriate number of days to the start date
    const endDate = new Date(start);
    endDate.setDate(start.getDate() + daysToAdd);

    // Format the end date as MM/DD/YYYY
    const endMonth = (endDate.getMonth() + 1).toString().padStart(2, '0');
    const endDay = endDate.getDate().toString().padStart(2, '0');
    const endYear = endDate.getFullYear();  // Full year (YYYY)

    // Return the end date in MM/DD/YYYY format
    return `${endMonth}/${endDay}/${endYear}`;
}

// Function to add one day to the given date
export function addOneDay(startDate: string): string {
    // Parse the startDate string into a Date object
    const [month, day, year] = startDate.split('/').map(num => parseInt(num, 10));
    const start = new Date(year, month - 1, day);  // Start date (year, month-1, day)

    // Add one day to the start date
    start.setDate(start.getDate() + 1);

    // Format the new date as MM/DD/YYYY
    const newMonth = (start.getMonth() + 1).toString().padStart(2, '0');
    const newDay = start.getDate().toString().padStart(2, '0');
    const newYear = start.getFullYear();  // Full year (YYYY)

    // Return the new date in MM/DD/YYYY format
    return `${newMonth}/${newDay}/${newYear}`;
}