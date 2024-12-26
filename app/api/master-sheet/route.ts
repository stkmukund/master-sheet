import { formatDateMMDDYYYY, isMonday } from "@/lib/date-utils";
import { addToSheet, apiResponse } from "@/lib/utils";
import { json } from "stream/consumers";

export async function GET(request: Request) {
    // Access the query string parameters from the URL
    const url = new URL(request.url); // `request.url` is the full URL
    const startDate = url.searchParams.get('startDate');
    const brandName = url.searchParams.get('brandName');
    if (!brandName) return apiResponse({ result: "ERROR", message: "Please provide a brand name" });
    console.log("process.env.BRAND_SHEETS",process.env.BRAND_SHEETS);
    const brandSheet = JSON.parse(process.env.BRAND_SHEETS! || '');

    // Get today's date
    const today = new Date();

    // Check if today is Monday using the utility function
    const isTodayMonday = isMonday();

    // If it's Monday, format the date in MM/DD/YYYY format
    let mondayDate: string | null = null;
    if (!isTodayMonday) {
        mondayDate = formatDateMMDDYYYY(today); // Format the date
    } else {
        return apiResponse({
            result: "ERROR",
            message: "Today is not a Monday"
        })
    }

    // Projected Rebill Revenue
    const projectedRebillRevenue = await fetch(`${url.origin}/api/master-sheet/projected-rebill-revenue/?startDate=${startDate ? startDate : mondayDate}&brandName=${brandName}`).then(result => result.json());
    if (projectedRebillRevenue) await addToSheet(url.origin, projectedRebillRevenue.message, brandSheet.projectedRebillRevenue[brandName]);

    // Return the response data
    return apiResponse({
        result: "SUCCESS",
        message: {
            projectedRebillRevenue,
            mondayDate
        }
    })
}
