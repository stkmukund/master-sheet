import { CalendarDateTime, getLocalTimeZone, today } from "@internationalized/date";
import { ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { tableDetails } from "./campaign-details";
import { CampaignName } from "./interface";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

// for backend api
export const apiResponse = (message: object, status: number = 200) => {
    return new Response(JSON.stringify(message), {
        status: status,
        headers: { 'Content-Type': 'application/json' },
    });
}

export const addToSheet = async (baseUrl: string, data: (string | number)[], sheetDetails: object) => {
    // const finalValues = Object.values(data);
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    const sheetData = {
        sheetDetails,
        values: data
    }
    const raw = await JSON.stringify(sheetData);

    const response = await fetch(baseUrl + '/api/google-sheets', {
        method: "POST",
        headers: myHeaders,
        body: raw,
        redirect: "follow"
    }).then(result => result.json());
    return response;
}

interface SheetDetails {
    sheetId: string;
    sheetName: string;
}

interface ApiResponse {
    result: string;
    message: {
        period: string;
        data: object;
    }[][];
}

export const summaryToSheet = async (
    baseUrl: string,
    data: ApiResponse,
    sheetDetails: SheetDetails
): Promise<{ success: boolean; message: string }> => {
    const requestId = Math.random().toString(36).substring(2, 15);
    // console.log(`[${requestId}] Sending data to Google Sheets`, { sheetDetails, data });

    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    const sheetData = {
        sheetDetails,
        apiResponse: data,
    };

    try {
        const response = await fetch(`${baseUrl}/api/google-sheets/dash-sheet/summary`, {
            method: "POST",
            headers: myHeaders,
            body: JSON.stringify(sheetData),
            redirect: "follow",
        });

        if (!response.ok) {
            throw new Error(`Google Sheets API request failed: ${response.status} ${response.statusText}`);
        }

        const result = await response.json();
        // console.log(`[${requestId}] Google Sheets response:`, result);
        return result;
    } catch (error) {
        console.error(`[${requestId}] Error in summaryToSheet:`, error);
        return {
            success: false,
            message: error instanceof Error ? error.message : "Unknown error in summaryToSheet",
        };
    }
};

// Total VIP Tracking
// Calculate campaignIDs
export const calculateVIPid = async (brandName: string): Promise<[string[] | object, string[]]> => {
    const brandCampaignIds: object = tableDetails.totalVipTracking.campaignIds![brandName]!;
    const brandCampaignHead = tableDetails.totalVipTracking.tableHeading[brandName];
    const values: string[] = Object.values(brandCampaignIds);
    return [brandCampaignHead, values];
}
// Calculate projected billed revenue - Table Details
export const projectedTableHead = (brandName: string) => {
    return tableDetails.projectedRebillRevenue.tableHeading[brandName];
}
export const getupsellProductIds = (brandName: string, campignName: string): [string[]] => {
    const brandCampaignIds: object = tableDetails.upsellTakeRateReport.productIds![brandName]![campignName];
    const values: string[] = Object.values(brandCampaignIds);
    return [values];
}
export const getupsellCampaignIds = (brandName: string): [CampaignName] => {
    const brandCampaignIds: CampaignName = tableDetails.totalVipTracking.campaignIds![brandName]!;
    return [brandCampaignIds];
}
export const getupsellCampaignIdsbkend = (brandName: string, campignName: string) => {
    const brandCampaignIds = tableDetails.totalVipTracking.campaignIds![brandName]![campignName];
    return [brandCampaignIds];
}
export const getupsellTableHeading = (brandName: string, campaignName: string) => {
    const brand = tableDetails.upsellTakeRateReport.tableHeading?.[brandName];

    if (Array.isArray(brand)) {
        // If `brand` is an array, return it as is (or handle it as needed).
        return [brand];
    }

    if (typeof brand === 'object' && brand !== null) {
        const brandCampaignIds = brand[campaignName];

        if (Array.isArray(brandCampaignIds)) {
            return [brandCampaignIds];
        }

        if (typeof brandCampaignIds === 'object' && brandCampaignIds !== null) {
            const values = Object.values(brandCampaignIds);
            return [values];
        }
    }

    // Default return value in case no matching structure is found
    return [];
};

export const prepareupsellData = async (data: { message: { date: string; salesCount: number; salesRev: number; }[]; heading: string[] }, total: number) => {
    // Calculate sales percentages and revenue earnings
    const salesCountper = data.message.map((item) =>
        percentageData(item.salesCount, total)
    );

    const salesRev = data.message.map((item) =>
        parseFloat(earningsData(item.salesRev, total))
    );

    // Calculate total sales revenue
    const totalSalesRev = salesRev.reduce((sum, item) => sum + item, 0);

    // Prepare the result
    const result = [
        data.heading,
        [`${data.message[0].date}`, '% of people taking the upsell', ...salesCountper, `${total}`],
        ['', 'Upsell earnings per customer', ...salesRev.map((rev) => rev.toFixed(2)), totalSalesRev.toFixed(2)],
    ];

    return result;
};

const percentageData = (amount: number, total: number) => {
    if (amount === 0) return '0.00%';
    return `${((amount / total) * 100).toFixed(2)}%`;
};
const earningsData = (amount: number, total: number) => {
    if (amount === 0) return '0.00';
    return (amount / total).toFixed(2);
};
// Date range picker
export function calculateDateRange(option: string) {
    const timeZone = getLocalTimeZone(); // Get the current local timezone
    const currentDate = today(timeZone); // Get today's date

    // Utility to calculate the difference in days
    const addDays = (date: CalendarDateTime, days: number): CalendarDateTime => {
        return date.add({ days });
    };

    // Helper function to create a CalendarDateTime
    const createDateTime = (date: typeof currentDate, hour: number, minute: number, second: number, millisecond: number = 0) =>
        new CalendarDateTime(timeZone, date.year, date.month, date.day, hour, minute, second, millisecond);

    let startDate: CalendarDateTime;
    let endDate: CalendarDateTime;

    switch (option) {
        case 'Today':
            startDate = createDateTime(currentDate, 0, 0, 0);
            endDate = createDateTime(currentDate, 23, 59, 59, 999); // Last millisecond of the day
            break;

        case 'Yesterday':
            const yesterday = currentDate.subtract({ days: 1 });
            startDate = createDateTime(yesterday, 0, 0, 0);
            endDate = createDateTime(yesterday, 23, 59, 59, 999);
            break;

        case 'This Month':
            startDate = createDateTime(
                currentDate.subtract({ days: currentDate.day - 1 }), // First day of the month
                0,
                0,
                0
            );
            endDate = createDateTime(
                currentDate.add({ days: currentDate.calendar.getDaysInMonth(currentDate) - currentDate.day }), // Last day of the month
                23,
                59,
                59,
                999
            );
            break;

        case 'Last Month':
            const firstDayLastMonth = currentDate.subtract({ months: 1, days: currentDate.day - 1 });
            const lastDayLastMonth = firstDayLastMonth.add({
                days: firstDayLastMonth.calendar.getDaysInMonth(firstDayLastMonth) - 1,
            });
            startDate = createDateTime(firstDayLastMonth, 0, 0, 0);
            endDate = createDateTime(lastDayLastMonth, 23, 59, 59, 999);
            break;

        case 'Last Week':
            // Get today's date using CalendarDateTime
            const currentJSDate = new Date(currentDate.year, currentDate.month - 1, currentDate.day);
            const currentDayLast = currentJSDate.getDay(); // Sunday - 0, Monday - 1, ..., Saturday - 6

            // Calculate the start of last week (previous Monday)
            const daysToLastMonday = currentDayLast === 0 ? 6 : currentDayLast - 1; // Days to last week's Monday (0 -> Sunday, 1 -> Monday)
            const lastWeekStartDate = currentDate.subtract({ days: daysToLastMonday + 7 }); // Subtract additional 7 days to get last Monday

            // Set the start date to the last Monday at the beginning of the day
            startDate = createDateTime(lastWeekStartDate, 0, 0, 0);

            // Set the end date to the previous Sunday (last Monday + 6 days)
            const lastWeekEndDate = lastWeekStartDate.add({ days: 6 });
            endDate = createDateTime(lastWeekEndDate, 23, 59, 59, 999);
            break;

        case 'Past Week':
            startDate = createDateTime(currentDate.subtract({ days: 7 }), 0, 0, 0);
            endDate = createDateTime(currentDate, 23, 59, 59, 999);
            break;

        case 'Past 2 Weeks':
            startDate = createDateTime(currentDate.subtract({ weeks: 2 }), 0, 0, 0);
            endDate = createDateTime(currentDate, 23, 59, 59, 999);
            break;

        case 'Past 30 Days':
            startDate = createDateTime(currentDate.subtract({ days: 30 }), 0, 0, 0);
            endDate = createDateTime(currentDate, 23, 59, 59, 999);
            break;

        case 'Past 3 Months':
            const threeMonthsAgo = currentDate.subtract({ months: 3 });
            startDate = createDateTime(
                threeMonthsAgo.subtract({ days: threeMonthsAgo.day - 1 }), // First day of three months ago
                0,
                0,
                0
            );
            endDate = createDateTime(currentDate, 23, 59, 59, 999);
            break;

        case 'Past 6 Months':
            const sixMonthsAgo = currentDate.subtract({ months: 6 });
            startDate = createDateTime(
                sixMonthsAgo.subtract({ days: sixMonthsAgo.day - 1 }), // First day of six months ago
                0,
                0,
                0
            );
            endDate = createDateTime(currentDate, 23, 59, 59, 999);
            break;

        case 'Past Year':
            const oneYearAgo = currentDate.subtract({ years: 1 });
            startDate = createDateTime(
                oneYearAgo.subtract({ days: oneYearAgo.day - 1 }), // First day of the year
                0,
                0,
                0
            );
            endDate = createDateTime(currentDate, 23, 59, 59, 999);
            break;

        // for projected rebill revenue
        case "Next Month":
            const nextMonth = currentDate.add({ months: 1 });
            startDate = createDateTime(nextMonth, 0, 0, 0);  // First day of next month at midnight
            const nextMonthEnd = nextMonth.add({ months: 1 }).subtract({ days: 1 });
            endDate = createDateTime(nextMonthEnd, 23, 59, 59, 999);  // Last moment of next month
            break;

        case "Tomorrow":
            startDate = addDays(new CalendarDateTime(timeZone, currentDate.year, currentDate.month, currentDate.day, 0, 0, 0), 1);
            endDate = addDays(new CalendarDateTime(timeZone, currentDate.year, currentDate.month, currentDate.day, 23, 59, 59), 1);
            break;

        case "Coming Week":
            // Get today's date using CalendarDateTime
            const currentJSDateComingWeek = new CalendarDateTime(timeZone, currentDate.year, currentDate.month, currentDate.day, 0, 0, 0);

            // Create a Date object from CalendarDateTime to get the day of the week
            const jsDateComingWeek = new Date(currentJSDateComingWeek.year, currentJSDateComingWeek.month - 1, currentJSDateComingWeek.day);
            const currentDayComingWeek = jsDateComingWeek.getDay(); // Sunday - 0, Monday - 1, ..., Saturday - 6

            // Calculate the number of days until the next Monday
            const daysToNextMonday = (8 - currentDayComingWeek) % 7;

            // Move current date to next Monday
            const nextMondayComingWeek = currentJSDateComingWeek.add({ days: daysToNextMonday });

            // Set the start date to the next Monday at the beginning of the day
            startDate = new CalendarDateTime(timeZone, nextMondayComingWeek.year, nextMondayComingWeek.month, nextMondayComingWeek.day, 0, 0, 0);

            // Set the end date to the following Sunday (next Monday + 6 days)
            const nextSundayComingWeek = nextMondayComingWeek.add({ days: 6 });
            endDate = new CalendarDateTime(timeZone, nextSundayComingWeek.year, nextSundayComingWeek.month, nextSundayComingWeek.day, 23, 59, 59);
            break;

        case "Next 2 Weeks":
            startDate = addDays(new CalendarDateTime(timeZone, currentDate.year, currentDate.month, currentDate.day, 0, 0, 0), 7);
            endDate = addDays(startDate, 13); // 2 weeks later
            break;

        case "Next 30 Days":
            startDate = addDays(new CalendarDateTime(timeZone, currentDate.year, currentDate.month, currentDate.day, 0, 0, 0), 1);
            endDate = addDays(startDate, 29); // 30 days from now
            break;

        case "Next 3 Months":
            const next3Months = currentDate.add({ months: 3 });
            startDate = new CalendarDateTime(timeZone, next3Months.year, next3Months.month, 1, 0, 0, 0);
            // Calculate the last day of next 3 months
            const end3Months = startDate.add({ months: 1 }).add({ days: -1 });
            endDate = new CalendarDateTime(timeZone, end3Months.year, end3Months.month, end3Months.day, 23, 59, 59);
            break;

        case "Next 6 Months":
            const next6Months = currentDate.add({ months: 6 });
            startDate = new CalendarDateTime(timeZone, next6Months.year, next6Months.month, 1, 0, 0, 0);
            // Calculate the last day of next 6 months
            const end6Months = startDate.add({ months: 1 }).add({ days: -1 });
            endDate = new CalendarDateTime(timeZone, end6Months.year, end6Months.month, end6Months.day, 23, 59, 59);
            break;

        case "Coming Year":
            const nextYear = currentDate.add({ years: 1 });
            startDate = new CalendarDateTime(timeZone, nextYear.year, 1, 1, 0, 0, 0); // First day of next year
            endDate = new CalendarDateTime(timeZone, nextYear.year, 12, 31, 23, 59, 59); // Last day of next year
            break;

        default:
            startDate = new CalendarDateTime(timeZone, currentDate.year, currentDate.month, currentDate.day, 0, 0, 0);
            endDate = new CalendarDateTime(timeZone, currentDate.year, currentDate.month, currentDate.day, 23, 59, 59, 999);
            break;
    }

    return { startDate, endDate };
}
