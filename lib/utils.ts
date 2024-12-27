import { ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { tableDetails } from "./campaign-details";

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
    const raw = JSON.stringify(sheetData);

    const response = await fetch(baseUrl + '/api/google-sheets', {
        method: "POST",
        headers: myHeaders,
        body: raw,
        redirect: "follow"
    }).then(result => result.json());
    return response;
}

// Total VIP Tracking
// Calculate campaignIDs
export const calculateVIPid = (brandName: string) => {
    const brandCampaignIds: object = tableDetails.totalVipTracking.campaignIds![brandName]!;
    const brandCampaignHead = tableDetails.totalVipTracking.tableHeading[brandName];
    const values = Object.values(brandCampaignIds);
    return [brandCampaignHead, values];
}

// Calculate projected billed revenue - Table Details
export const projectedTableHead = (brandName: string) => {
    return tableDetails.projectedRebillRevenue.tableHeading[brandName];
}