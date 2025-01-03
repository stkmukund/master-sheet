import { calculateEndDateUpsell } from '@/lib/date-utils';
import { getupsellCampaignIdsbkend, getupsellProductIds, getupsellTableHeading } from "@/lib/utils";
// export const maxDuration = 60 // 60sec max duration
export async function GET(request: Request) {
    // Access the query string parameters from the URL
    const url = new URL(request.url); // `request.url` is the full URL
    const startDate = url.searchParams.get('startDate');
    let endDate = url.searchParams.get('endDate');
    if (!endDate) endDate = calculateEndDateUpsell(startDate!);
    const brandName = url.searchParams.get('brandName');
    const campaignName = url.searchParams.get('CampaignName');
    const brand = JSON.parse(process.env[brandName!] || '');
    const [campaignIds] = getupsellCampaignIdsbkend(brandName!, campaignName!);
    const [productIds] = getupsellProductIds(brandName!, campaignName!);
    const [tableHeading] = getupsellTableHeading(brandName!, campaignName!);
    const total = url.searchParams.get('total');
    if (!startDate || !endDate) return apiResponse({ result: "Error", message: "Missing startDate or endDate" });
    const requestOptions = {
        method: "POST"
    };
    if (total == '1') {
        const statuses = ["COMPLETE", "REFUNDED", "CANCELLED"];

        const fetchTotalResults = async (orderStatus: string) => {
            const response = await fetch(
                `https://api.checkoutchamp.com/order/query/?loginId=${brand.loginId}&password=${brand.password}&startDate=${startDate}&endDate=${endDate}&campaignId=${campaignIds}&reportType=campaign&orderStatus=${orderStatus}&orderType=NEW_SALE`,
                requestOptions
            )
                .then((result) => result.json())
                .catch((error) => ({ result: "ERROR", error }));
            if (response.result === "SUCCESS") {
                return response.message.totalResults || 0;
            }
            // Default to 0 if there's an error
            return 0;
        };
        // Fetch results for all statuses in parallel
        const results = await Promise.all(statuses.map((status) => fetchTotalResults(status)));
        // Calculate the sum of totalResults
        const totalSum = results.reduce((sum, count) => sum + count, 0);

        // Return the API response
        return apiResponse({
            result: "SUCCESS",
            message: {
                date: `${startDate} - ${endDate}`,
                salesCount: totalSum,
            },
        });
    }
    const fetchsalesRevResults = async (campaignProductId: string) => {
        const response = await fetch(
            `https://api.checkoutchamp.com/transactions/summary/?loginId=${brand.loginId}&password=${brand.password}&startDate=${startDate}&endDate=${endDate}&campaignProductId=${campaignProductId}&reportType=product&campaignId=${campaignIds}`,
            requestOptions
        )
            .then((result) => result.json())
            .catch((error) => ({ result: "ERROR", error }));

        if (response.result === "SUCCESS") {
            const data = response.message;
            return {
                date: startDate + " - " + endDate,
                salesCount: data[0].newSaleCnt,
                salesRev: +data[0].newSaleRev,

            };
        }
        if (response.result === "ERROR") {
            return {
                date: startDate + " - " + endDate,
                salesCount: 0,
                salesRev: 0,

            };
        }
    }
    const results = await Promise.all(productIds.map((status) => fetchsalesRevResults(status)));
    return apiResponse({
        result: "SUCCESS",
        message: results,
        heading: tableHeading
    });


}

const apiResponse = (message: object, status: number = 200) => {
    return new Response(JSON.stringify(message), {
        status: status,
        headers: { 'Content-Type': 'application/json' },
    });
}
