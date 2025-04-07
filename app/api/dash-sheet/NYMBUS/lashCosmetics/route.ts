import { campaignCategory } from "@/lib/campaign-details";
import { apiResponse } from "@/lib/utils";
import { NextRequest } from "next/server";

// Define interfaces for type safety
interface QueryParams {
    startDate: string;
    endDate: string;
    brandName: string;
    id: string | number;
}

interface Campaign {
    campaignId: string;
    name: string; // Added for campaign name
}

interface ApiConfig {
    baseUrl: string;
}

// Define specific response types for each API
interface OrderSummaryResponse {
    totalAmount: number;
    refundedAmount: number;
    initialSales: number;
    declined: number;
    declinePerc: number;
    partial: number;
    avgTicket: number;
    creditCard: number;
    payPal: number;
    frontendRefundPerc: number;
}

interface TransactionSummaryResponse {
    rebillRevenue: number;
    rebillApproval: number;
    rebillDeclines: number;
    rebillApprovedPerc: number; // Already in decimal form (0-1)
    rebillRefundRev: number;
    billableRebillRev: number;
    rebillRefundPerc: number;
    chargebackCnt: number;
}

interface SalesContinuityResponse {
    vipInitial: {
        totalInitialVip: number;
        creditCardVip: number;
        payPalVip: number;
    };
    vipDeclined: number;
    vipTotal: number;
    vipRecycleRebill: number;
}

// Combined response type
interface CombinedResponse {
    campaignName: string;
    startDate: string;
    totalAmount: number;
    initialSales: number;
    declined: number;
    declinePerc: number;
    partial: number;
    avgTicket: number;
    rebillRevenue: number;
    rebillApproval: number;
    rebillDeclines: number;
    rebillApprovedPerc: number;
    rebillRefundRev: number;
    billableRebillRev: number;
    refundedAmount: number;
    frontendRefundPerc: number;
    rebillRefundPerc: number;
    chargebackCnt: number;
    totalInitialVip: number;
    vipDeclined: number;
    creditCardVip: number;
    ccOptVip: number;
    creditCard: number;
    payPal: number;
    payPalVip: number;
    ppOptVip: number;
    totalOptPPCC: number;
    vipTotal: number;
    vipRecycleRebill: number;
}

// Utility function to construct the dynamic URL
const constructApiUrl = (
    config: ApiConfig,
    dynamicPath: string,
    params: QueryParams
): string => {
    const { baseUrl } = config;
    const { startDate, endDate, brandName, id } = params;
    return `${baseUrl}/api/dash-sheet/report/${dynamicPath}/?startDate=${startDate}&endDate=${endDate}&brandName=${brandName}&id=${id}`;
};

// Base API fetch function with generic typing
const fetchApiData = async <T>(
    apiUrl: string,
    method: string = 'GET'
): Promise<T> => {
    const response = await fetch(apiUrl, {
        method,
        headers: {
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        throw new Error(`API error: ${response.status} - ${response.statusText}`);
    }

    const data = await response.json();
    return data.result === "SUCCESS" ? data.message : Promise.reject(data.message);
};

// Specific API handlers
const fetchOrderSummary = async (params: QueryParams, config: ApiConfig): Promise<OrderSummaryResponse> => {
    const apiUrl = constructApiUrl(config, 'order-summary', params);
    return await fetchApiData<OrderSummaryResponse>(apiUrl, 'GET');
};

const fetchTransactionSummary = async (params: QueryParams, config: ApiConfig): Promise<TransactionSummaryResponse> => {
    const apiUrl = constructApiUrl(config, 'transaction-summary', params);
    return await fetchApiData<TransactionSummaryResponse>(apiUrl, 'GET');
};

const fetchSalesContinuity = async (params: QueryParams, config: ApiConfig): Promise<SalesContinuityResponse> => {
    const apiUrl = constructApiUrl(config, 'continuity', params);
    return await fetchApiData<SalesContinuityResponse>(apiUrl, 'GET');
};

// Utility function to calculate metrics
const calculateMetrics = (
    orders: OrderSummaryResponse,
    sales: SalesContinuityResponse
): { ccOptVip: number; ppOptVip: number; totalOptPPCC: number } => {
    const ccOptVip = orders.creditCard > 0
        ? Number((sales.vipInitial.creditCardVip / orders.creditCard).toFixed(4))
        : 0;
    const ppOptVip = orders.payPal > 0
        ? Number((sales.vipInitial.payPalVip / orders.payPal).toFixed(4))
        : 0;
    const totalOptPPCC = orders.initialSales > 0
        ? Number((sales.vipInitial.totalInitialVip / orders.initialSales).toFixed(4))
        : 0;

    return { ccOptVip, ppOptVip, totalOptPPCC };
};

// Main API handler
export async function POST(request: NextRequest): Promise<Response> {
    try {
        const url = new URL(request.url);
        const startDate = url.searchParams.get('startDate');
        const endDate = url.searchParams.get('endDate');

        // Validate required query parameters
        if (!startDate || !endDate) {
            return apiResponse({
                result: "ERROR",
                message: "Missing startDate or endDate",
            }, 400);
        }

        // Get brand-specific data
        const brandName = 'NYMBUS'; // Could be made dynamic via query param
        const categoryId = 12
        const campaign: Campaign = campaignCategory.NYMBUS[categoryId];
        const id = campaign.campaignId;

        // Validate campaign ID
        if (!id) {
            return apiResponse({
                result: "ERROR",
                message: "Invalid campaign ID",
            }, 400);
        }

        // Get API base URL from environment variables
        const baseUrl = process.env.NEXT_PUBLIC_API_URL;
        if (!baseUrl) {
            throw new Error("API base URL is not configured in environment variables");
        }

        const apiConfig: ApiConfig = { baseUrl };
        const queryParams: QueryParams = { startDate, endDate, brandName, id };

        // Fetch data from all APIs concurrently
        const [orders, transaction, sales] = await Promise.all([
            fetchOrderSummary(queryParams, apiConfig),
            fetchTransactionSummary({ startDate, endDate, brandName, id: categoryId }, apiConfig),
            fetchSalesContinuity(queryParams, apiConfig),
        ]);

        // Calculate additional metrics
        const { ccOptVip, ppOptVip, totalOptPPCC } = calculateMetrics(orders, sales);

        // Combine all data into a single response
        const combinedResponse: CombinedResponse = {
            campaignName: campaign.name,
            startDate,
            totalAmount: orders.totalAmount || 0,
            initialSales: orders.initialSales || 0,
            declined: orders.declined || 0,
            declinePerc: orders.declinePerc || 0,
            partial: orders.partial || 0,
            avgTicket: orders.avgTicket || 0,
            rebillRevenue: transaction.rebillRevenue || 0,
            rebillApproval: transaction.rebillApproval || 0,
            rebillDeclines: transaction.rebillDeclines || 0,
            rebillApprovedPerc: transaction.rebillApprovedPerc || 0,
            rebillRefundRev: transaction.rebillRefundRev || 0,
            billableRebillRev: transaction.billableRebillRev || 0,
            refundedAmount: orders.refundedAmount || 0,
            frontendRefundPerc: orders.frontendRefundPerc || 0,
            rebillRefundPerc: transaction.rebillRefundPerc || 0,
            chargebackCnt: transaction.chargebackCnt || 0,
            totalInitialVip: sales.vipInitial.totalInitialVip || 0,
            vipDeclined: sales.vipDeclined || 0,
            creditCardVip: sales.vipInitial.creditCardVip || 0,
            ccOptVip,
            creditCard: orders.creditCard || 0,
            payPal: orders.payPal || 0,
            payPalVip: sales.vipInitial.payPalVip || 0,
            ppOptVip,
            totalOptPPCC,
            vipTotal: sales.vipTotal || 0,
            vipRecycleRebill: sales.vipRecycleRebill || 0,
        };

        // Here you could add logic to update a Google Sheet if needed
        // const response = await updateSheet(Object.values(combinedResponse), queryParams.type);

        return apiResponse({
            result: "SUCCESS",
            message: combinedResponse,
        });
    } catch (error: any) {
        console.error("API Error:", error);
        const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
        return apiResponse({
            result: "ERROR",
            message: errorMessage,
        }, 500);
    }
}

// Export config for edge runtime (optional)
export const config = {
    runtime: 'edge', // Uncomment to use edge runtime for better performance
};