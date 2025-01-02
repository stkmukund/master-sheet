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
export const calculateVIPid = (brandName: string): [string[] | object, string[]] => {
    const brandCampaignIds: object = tableDetails.totalVipTracking.campaignIds![brandName]!;
    const brandCampaignHead = tableDetails.totalVipTracking.tableHeading[brandName];
    const values: string[] = Object.values(brandCampaignIds);
    return [brandCampaignHead, values];
}
// Calculate projected billed revenue - Table Details
export const projectedTableHead = (brandName: string) => {
    return tableDetails.projectedRebillRevenue.tableHeading[brandName];
}
export const getUpsellProductIds = (brandName: string, campaignName: string): string[] => {
    // Ensure productIds is properly typed and accessed
    const productIds = tableDetails.upsellTakeRateReport.productIds;

    // Safely access the brand's campaign product IDs
    const brandCampaignIds = productIds?.[brandName]?.[campaignName];

    if (!brandCampaignIds) {
        throw new Error(`No product IDs found for brand: ${brandName}, campaign: ${campaignName}`);
    }

    // Extract the values of the product IDs object
    const values = Object.values(brandCampaignIds);

    return values;
};

export const getupsellCampaignIds = (brandName: string): [CampaignName] => {
    const brandCampaignIds: CampaignName = tableDetails.totalVipTracking.campaignIds![brandName]!;
    return [brandCampaignIds];
}
export const getupsellCampaignIdsbkend = (brandName: string, campaignName: string) => {
    // Make sure `campaignIds` is defined and of the correct shape
    const campaignIds = tableDetails.totalVipTracking.campaignIds;

    // Ensure `campaignIds` is defined and access the right campaign IDs
    if (campaignIds && campaignIds[brandName] && campaignIds[brandName][campaignName]) {
        const brandCampaignIds = campaignIds[brandName][campaignName];
        return [brandCampaignIds]; // Return an array with the campaign IDs
    } else {
        throw new Error(`Campaign ID not found for brand: ${brandName}, campaign: ${campaignName}`);
    }
};

export const getupsellTableHeading = (brandName: string, campaignName: string) => {
    // Access the table heading data
    const tableHeading = tableDetails.upsellTakeRateReport.tableHeading;

    // Ensure that the brand name exists in the tableHeading
    if (tableHeading && tableHeading[brandName]) {
        const brandData = tableHeading[brandName];

        // If brandData is an array, return it directly
        if (Array.isArray(brandData)) {
            return [brandData]; // Return the values as an array of arrays
        }

        // If brandData is an object (campaign name to array mapping)
        if (brandData[campaignName]) {
            return [brandData[campaignName]]; // Return the campaign-specific array as an array of arrays
        } else {
            throw new Error(`Campaign name not found for brand: ${brandName}, campaign: ${campaignName}`);
        }
    } else {
        throw new Error(`Brand name not found: ${brandName}`);
    }
};

export const prepareupsellData = async (
    data: PrepareUpsellData,
    total: number
): Promise<string[][]> => {
    // Calculate sales percentages and revenue earnings
    const salesCountper = data.message.map((item) =>
        percentageData(item.salesCount, total)
    );

    const salesRev = data.message.map((item) =>
        parseFloat(earningsData(+item.salesRev, total))
    );

    // Calculate total sales revenue
    const totalSalesRev = salesRev.reduce((sum, item) => sum + item, 0);

    // Prepare the result
    const result: string[][] = [
        data.heading,
        [
            `${data.message[0].date}`,
            '% of people taking the upsell',
            ...salesCountper,
            `${total}`,
        ],
        [
            '',
            'Upsell earnings per customer',
            ...salesRev.map((rev) => rev.toFixed(2)),
            totalSalesRev.toFixed(2),
        ],
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

interface DataItem {
    salesCount: number;
    salesRev: string; // Assuming salesRev is a string that can be parsed into a float
    date: string;
}

interface PrepareUpsellData {
    heading: string[];
    message: DataItem[];
}