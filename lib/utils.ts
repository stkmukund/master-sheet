import { ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { tableDetails } from "./campaign-details";
import { object } from "framer-motion/client";
import { console } from "inspector";

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
export const getupsellProductIds = (brandName: string,campignName:string)=>{
console.log('ssaddasdasd',brandName)
    const brandCampaignIds: object = tableDetails.upsellTakeRateReport.productIds![brandName]![campignName];
    const values = Object.values(brandCampaignIds);
    return [values];
}
export const getupsellCampaignIds = (brandName: string)=>{
    const brandCampaignIds: object = tableDetails.totalVipTracking.campaignIds![brandName]!;
    return [brandCampaignIds];
}
export const getupsellCampaignIdsbkend = (brandName: string,campignName:string)=>{
    const brandCampaignIds: object = tableDetails.totalVipTracking.campaignIds![brandName]![campignName];
    return [brandCampaignIds];
}
export const getupsellTableHeading = (brandName: string,campignName:string)=>{
    const brandCampaignIds: object = tableDetails.upsellTakeRateReport.tableHeading![brandName]![campignName];
    const values = Object.values(brandCampaignIds);
    return [values];
}
export const prepareupsellData = async(data: any, total: number) => {
    // Calculate sales percentages and revenue earnings
    const salesCountper = data.message.map((item: any) =>
      percentageData(item.salesCount, total)
    );

    const salesRev = data.message.map((item: any) =>
      parseFloat(earningsData(item.salesRev, total))
    );

    // Calculate total sales revenue
    const totalSalesRev = salesRev.reduce((sum: number, item: number) => sum + item, 0);

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
