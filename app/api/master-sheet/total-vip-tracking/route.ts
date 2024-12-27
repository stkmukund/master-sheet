import { apiResponse, calculateVIPid } from "@/lib/utils";
import { ReportData } from "../interface";

export const maxDuration = 60 // 60sec max duration
export async function GET(request: Request) {
    // Access the query string parameters from the URL
    const url = new URL(request.url); // `request.url` is the full URL
    const endDate = url.searchParams.get('startDate');
    const startDate = '01/01/2010';
    if (!startDate || !endDate) return apiResponse({ result: "ERROR", message: "Missing startDate or endDate" });
    const brandName = url.searchParams.get('brandName');
    const [campaignHead, campaignId] = calculateVIPid(brandName!); // campaignIds and tableHeading
    const brand = JSON.parse(process.env[brandName!] || '');
    const reportData: ReportData = {
        heading: campaignHead,
        values: [[endDate]]
    }; // all data will be stored here
    let totalActiveVIP = 0; // total number of active_VIP
    let totalRecycleVIP = 0; // total number of RECYCLE_BILLING


    const requestOptions = {
        method: "POST"
    };

    // Loop to retrieve ACTIVE VIP for all campaigns
    for (const id of campaignId) {
        const response = await fetch(`https://api.checkoutchamp.com/purchase/query/?loginId=${brand.loginId}&password=${brand.password}&startDate=${startDate}&endDate=${endDate}&status=ACTIVE&campaignId=${id}&resultsPerPage=1`, requestOptions).then(result => result.json()).catch(error => apiResponse(error));
        if (response.result === "ERROR") {
            if (response.message === "No purchases matching those parameters could be found") {
                reportData.values[0].push(0);
                totalActiveVIP += 0;
            }
            else throw new Error(response.message);
        };
        if (response.result === "SUCCESS") {
            reportData.values[0].push(response.message.totalResults);
            totalActiveVIP += +response.message.totalResults;
        }
    }

    // Add total active_VIP to report data
    reportData.values[0].push(totalActiveVIP);

    // Loop to retrieve total VIP_RECYCLE for all campaigns
    for (const id of campaignId) {
        const response = await fetch(`https://api.checkoutchamp.com/purchase/query/?loginId=${brand.loginId}&password=${brand.password}&startDate=${startDate}&endDate=${endDate}&status=RECYCLE_BILLING&campaignId=${id}&resultsPerPage=1`, requestOptions).then(result => result.json()).catch(error => apiResponse(error));
        if (response.result === "ERROR") {
            if (response.message === "No purchases matching those parameters could be found") totalRecycleVIP += 0;
            else throw new Error(response.message);
        };
        if (response.result === "SUCCESS") totalRecycleVIP += +response.message.totalResults
    }

    // Add total RECYCLE_BILLING to report data
    reportData.values[0].push(totalRecycleVIP);

    return apiResponse({ result: "SUCCESS", message: reportData });
}
