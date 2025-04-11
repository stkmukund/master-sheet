import { apiResponse } from "@/lib/utils";

// Define types
interface Order {
    totalAmount: string;
    refundRemaining?: string;
    paySource: string;
}

interface Totals {
    totalAmount: number;
    refundedAmount: number;
}

interface PaySources {
    creditCard: number;
    payPal: number;
}

interface QueryParams {
    id: string;
    startDate: string;
    endDate: string;
}

// Utility function to add one day to a date
// const addOneDay = (dateStr: string): string => {
//     const date = new Date(dateStr);
//     date.setDate(date.getDate() + 1);
//     return date.toISOString().split('T')[0]; // Returns YYYY-MM-DD format
// };

// Order query API with conditional time parameters
const orderQuery = async (
    brand: { loginId: string; password: string },
    query: QueryParams,
    status: string,
    page: number,
    brandName: string,
    resultsPerPage: number = 200
): Promise<{ message: string; totalResults: number; data: Order[] }> => {
    try {
        // Adjust endDate by adding 1 day
        // const adjustedEndDate = addOneDay(query.endDate);

        // Conditionally include startTime and endTime for HELIKON
        const timeParams = brandName.toUpperCase() === 'HELIKON'
            ? 'startTime=03:00&endTime=02:59'
            : '';

        const response = await fetch(
            `https://api.checkoutchamp.com/order/query/?loginId=${brand.loginId}&password=${brand.password}&campaignId=${query.id}&orderStatus=${status}&startDate=${query.startDate}&endDate=${query.endDate}${timeParams}&resultsPerPage=${resultsPerPage}&orderType=NEW_SALE&page=${page}`
        );

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        // console.log("Order Query Response:", data); // Debugging line

        if (data.result === "SUCCESS") {
            return {
                message: "SUCCESS",
                totalResults: data.message.totalResults,
                data: data.message.data || []
            };
        } else {
            console.error(`Error fetching ${status} orders:`, data.message);
            return { message: "ERROR", totalResults: 0, data: [] };
        }
        // throw new Error(data.message);
    } catch (error) {
        console.error(`Error fetching ${status} orders on page ${page}:`, error);
        return { message: "ERROR", totalResults: 0, data: [] };
    }
    return { message: "ERROR", totalResults: 0, data: [] }; // Ensure a return statement in all paths
}

// Process orders
const processOrders = (orders: Order[], totals: Totals, paySources: PaySources, status: string) => {
    orders.forEach((item) => {
        const totalAmount = Number(item.totalAmount);
        totals.totalAmount += totalAmount;

        if (status === "REFUNDED") {
            const refundedAmount = totalAmount - Number(item.refundRemaining);
            totals.refundedAmount += refundedAmount;
        }

        if (item.paySource === "CREDITCARD") {
            paySources.creditCard++;
        } else if (item.paySource === "PAYPAL") {
            paySources.payPal++;
        }
    });

    return orders.length;
};

// Fetch all pages
const fetchAllPages = async (
    brand: { loginId: string; password: string },
    query: QueryParams,
    status: string,
    totals: Totals,
    paySources: PaySources,
    brandName: string
) => {
    let page = 1;
    let totalResults = 0;
    let ordersProcessed = 0;

    const initialData = await orderQuery(brand, query, status, page, brandName);
    if (initialData.message === "SUCCESS") {
        totalResults = initialData.totalResults;
        const orders = initialData.data;

        if (orders.length > 0) {
            ordersProcessed += processOrders(orders, totals, paySources, status);
        }

        while (totalResults > 200) {
            page++;
            const nextData = await orderQuery(brand, query, status, page, brandName);

            if (nextData.message === "SUCCESS" && nextData.data.length > 0) {
                ordersProcessed += processOrders(nextData.data, totals, paySources, status);
            }

            totalResults -= 200;
        }
    }

    return ordersProcessed;
};

// Fetch single page data (for declined and partial)
const fetchSinglePage = async (
    brand: { loginId: string; password: string },
    query: QueryParams,
    status: string,
    brandName: string
) => {
    const data = await orderQuery(brand, query, status, 1, brandName, 1);
    return data.totalResults || 0;
};

export async function GET(request: Request) {
    try {
        const url = new URL(request.url);
        const brandName = url.searchParams.get("brandName");
        const startDate = url.searchParams.get("startDate");
        const endDate = url.searchParams.get("endDate");
        const id = url.searchParams.get("id");

        // Validate parameters
        if (!startDate || !endDate || !brandName || !id) {
            return apiResponse({
                result: "ERROR",
                message: "Missing required parameters: brandName, startDate, endDate, or id"
            }, 400);
        }

        const brandConfig = process.env[brandName];
        if (!brandConfig) {
            return apiResponse({
                result: "ERROR",
                message: "Invalid brand configuration"
            }, 400);
        }

        const brand = JSON.parse(brandConfig);
        const query: QueryParams = { id, startDate, endDate };

        // Initialize metrics
        const totals: Totals = { totalAmount: 0, refundedAmount: 0 };
        const paySources: PaySources = { creditCard: 0, payPal: 0 };
        let completeCount = 0;
        let refundCount = 0;
        const cancelCount = 0;

        // Fetch data for all statuses
        completeCount = await fetchAllPages(brand, query, "COMPLETE", totals, paySources, brandName);
        refundCount = await fetchAllPages(brand, query, "REFUNDED", totals, paySources, brandName);
        // cancelCount = await fetchAllPages(brand, query, "CANCELLED", totals, paySources, brandName);

        // Fetch single-page statuses
        const declined = await fetchSinglePage(brand, query, "DECLINED", brandName);
        const partial = await fetchSinglePage(brand, query, "PARTIAL", brandName);

        // Calculate additional metrics
        const initialSales = completeCount + refundCount + cancelCount;

        const declinePerc = initialSales + declined > 0
            ? Number((declined / (initialSales + declined)).toFixed(4))
            : 0;

        const avgTicket = initialSales > 0
            ? Number((totals.totalAmount / initialSales).toFixed(2))
            : 0;

        const frontendRefundPerc = totals.totalAmount > 0
            ? Number((totals.refundedAmount / totals.totalAmount).toFixed(4))
            : 0;

        return apiResponse(
            {
                result: "SUCCESS",
                message: {
                    totalAmount: Number(totals.totalAmount.toFixed(2)),
                    refundedAmount: Number(totals.refundedAmount.toFixed(2)),
                    initialSales,
                    declined,
                    declinePerc,
                    partial,
                    avgTicket,
                    frontendRefundPerc,
                    creditCard: paySources.creditCard,
                    payPal: paySources.payPal
                }
            }
        );
    } catch (error) {
        console.error("API Error:", error);
        return apiResponse({
            result: "ERROR",
            message: "Internal server error"
        }, 500);
    }
}