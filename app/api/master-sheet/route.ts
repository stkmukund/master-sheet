import { formatDateMMDDYYYY, isMonday } from "@/lib/date-utils";
import { addToSheet, apiResponse, getupsellCampaignIds, prepareupsellData } from "@/lib/utils";

export async function GET(request: Request) {
    // Access the query string parameters from the URL
    const url = new URL(request.url); // `request.url` is the full URL
    const startDate = url.searchParams.get('startDate');
    // const endDate = url.searchParams.get('endDate');

    const brandName: string = url.searchParams.get('brandName')!;
    if (!brandName) return apiResponse({ result: "ERROR", message: "Please provide a brand name" });
    const brandSheet = JSON.parse(process.env.BRAND_SHEETS! || '');
    let [campaignNames]: [Campaigns] = getupsellCampaignIds(brandName);
    const campaignsToFilter: string[] = ["secretLane", "scarlettEnvy", "Mangolift", "checkoutChamp", "bankSites"];
    const filteredData: Campaigns = Object.keys(campaignNames).reduce((acc: Campaigns, key: string) => {
        if (!campaignsToFilter.includes(key)) {
            acc[key] = campaignNames[key];
        }
        return acc;
    }, {});
    campaignNames = filteredData;


    // Get today's date
    const today = new Date();

    // Check if today is Monday using the utility function
    const isTodayMonday = isMonday();

    // If it's Monday, format the date in MM/DD/YYYY format
    let mondayDate: string | null = null;
    if (isTodayMonday) {
        mondayDate = formatDateMMDDYYYY(today); // Format the date
    } else {
        return apiResponse({
            result: "ERROR",
            message: "Today is not a Monday"
        })
    }
    // const projectedRebillRevenue = 'test';
    // Projected Rebill Revenue
    const projectedRebillRevenue = await fetch(`${url.origin}/api/master-sheet/projected-rebill-revenue/?startDate=${startDate ? startDate : mondayDate}&brandName=${brandName}&startTime=00:00:00&endTime=23:59:59&backend=${true}`).then(result => result.json()).then(async response => {
        if (response.result === "SUCCESS") await addToSheet(url.origin, response.message.values[0], brandSheet.projectedRebillRevenue[brandName]);
        else return response;
    });
    // Total VIP Tracking
    const totalVipTracking = await fetch(`${url.origin}/api/master-sheet/total-vip-tracking/?endDate=${startDate ? startDate : mondayDate}&brandName=${brandName}&startTime=00:00:00&endTime=23:59:59`).then(result => result.json()).then(async response => {
        if (response.result === "SUCCESS") await addToSheet(url.origin, response.message.values[0], brandSheet.totalVipTracking[brandName]);
        else return response;
    });
    // const totalVipTracking = 'test';
    // Upsell take report

    async function processKeys() {
        for (const key of Object.keys(campaignNames)) {

            const upsellTakeReport = await fetch(`${url.origin}/api/master-sheet/upsell-take-rate-report/?endDate=${startDate ? startDate : mondayDate}&brandName=${brandName}&CampaignName=${key}`).then(result => result.json());

            await fetch(`${url.origin}/api/master-sheet/upsell-take-rate-report/?endDate=${startDate ? startDate : mondayDate}&brandName=${brandName}&CampaignName=${key}&total=1`)
                .then(result => result.json())
                .then(async response => {
                    if (response.result === 'SUCCESS') {
                        const upsellData = await prepareupsellData(upsellTakeReport, response.message.salesCount);
                        await addToSheet(url.origin, upsellData[0], brandSheet.upsellTakeRateReport[brandName][key]);
                        await addToSheet(url.origin, upsellData[1], brandSheet.upsellTakeRateReport[brandName][key]);
                        await addToSheet(url.origin, upsellData[2], brandSheet.upsellTakeRateReport[brandName][key]);
                    }
                });
        }
    }

    processKeys();

    // Return the response data
    return apiResponse({
        result: "SUCCESS",
        message: {
            projectedRebillRevenue,
            totalVipTracking,
            mondayDate
        }
    })
}

type Campaigns = {
    [key: string]: string | undefined;
};