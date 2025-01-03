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

export const prepareupsellData = async (data: { message: { date: string; salesCount: number; salesRev: number;}[]; heading: string[] }, total: number) => {
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

interface DataItem {
    salesCount: number;
    salesRev: string; // Assuming salesRev is a string that can be parsed into a float
    date: string;
}

interface PrepareUpsellData {
    heading: string[];
    message: DataItem[];
}