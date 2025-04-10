import { campaignCategory } from "@/lib/campaign-details";
import { apiResponse } from "@/lib/utils";
import axios from "axios";
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
    name: string;
}

interface ApiConfig {
    baseUrl: string;
}

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
    rebillApprovedPerc: number;
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

// Cache and Rate Limit Setup
interface CacheEntry<T> {
    data: T;
    timestamp: number;
}

const cache = new Map<string, CacheEntry<any>>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes TTL

const rateLimit = new Map<string, { count: number; lastReset: number }>();
const RATE_LIMIT = 5; // Max 5 requests per minute per URL
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute

const constructApiUrl = (
    config: ApiConfig,
    dynamicPath: string,
    params: QueryParams
): string => {
    const { baseUrl } = config;
    const { startDate, endDate, brandName, id } = params;
    return `${baseUrl}/api/dash-sheet/report/${dynamicPath}/?startDate=${startDate}&endDate=${endDate}&brandName=${brandName}&id=${id}`;
};

const fetchApiData = async <T>(
    apiUrl: string,
    customHeaders: Record<string, string> = {}
): Promise<T> => {
    const requestId = Math.random().toString(36).substring(2, 15);
    console.log(`[${requestId}] Fetching API URL: ${apiUrl}`);

    // Check cache
    const cached = cache.get(apiUrl);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        console.log(`[${requestId}] Returning cached data for ${apiUrl}`);
        return cached.data;
    }

    // Rate limiting
    const now = Date.now();
    const rateLimitKey = apiUrl;
    let rateLimitEntry = rateLimit.get(rateLimitKey);

    if (!rateLimitEntry || now - rateLimitEntry.lastReset > RATE_LIMIT_WINDOW) {
        rateLimitEntry = { count: 0, lastReset: now };
        rateLimit.set(rateLimitKey, rateLimitEntry);
    }

    if (rateLimitEntry.count >= RATE_LIMIT) {
        throw new Error(`Rate limit exceeded for ${apiUrl}. Try again later.`);
    }

    rateLimitEntry.count += 1;

    try {
        const response = await axios.get(apiUrl, {
            timeout: 0, // No timeout for long-running requests
            headers: {
                'Content-Type': 'application/json',
                'X-Request-ID': requestId,
                ...customHeaders,
            },
        });

        console.log(`[${requestId}] API Response:`, response.data);

        if (response.data.result !== "SUCCESS") {
            throw new Error(`API error: ${response.data.message}`);
        }

        const data = response.data.message;
        cache.set(apiUrl, { data, timestamp: Date.now() });
        return data;
    } catch (error) {
        console.error(`[${requestId}] Fetch failed:`, error);
        throw error instanceof Error ? error : new Error("Unknown fetch error");
    }
};

const fetchOrderSummary = async (params: QueryParams, config: ApiConfig): Promise<OrderSummaryResponse> => {
    const apiUrl = constructApiUrl(config, 'order-summary', params);
    return await fetchApiData<OrderSummaryResponse>(apiUrl);
};

const fetchTransactionSummary = async (params: QueryParams, config: ApiConfig): Promise<TransactionSummaryResponse> => {
    const apiUrl = constructApiUrl(config, 'transaction-summary', params);
    return await fetchApiData<TransactionSummaryResponse>(apiUrl);
};

const fetchSalesContinuity = async (params: QueryParams, config: ApiConfig): Promise<SalesContinuityResponse> => {
    const apiUrl = constructApiUrl(config, 'continuity', params);
    return await fetchApiData<SalesContinuityResponse>(apiUrl);
};

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

export async function POST(request: NextRequest): Promise<Response> {
    const requestId = Math.random().toString(36).substring(2, 15);
    console.log(`[${requestId}] Received ${request.method} request to ${request.url}`);

    try {
        const url = new URL(request.url);
        const startDate = url.searchParams.get('startDate');
        const endDate = url.searchParams.get('endDate');

        if (!startDate || !endDate) {
            return apiResponse({
                result: "ERROR",
                message: "Missing startDate or endDate",
            }, 400);
        }

        const brandName = 'NYMBUS';
        const categoryId = 10;
        const campaign: Campaign = campaignCategory.NYMBUS[categoryId];
        const id = campaign.campaignId;

        if (!id) {
            return apiResponse({
                result: "ERROR",
                message: "Invalid campaign ID",
            }, 400);
        }

        const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
        console.log(`[${requestId}] Using baseUrl: ${baseUrl}`);
        const apiConfig: ApiConfig = { baseUrl };
        const queryParams: QueryParams = { startDate, endDate, brandName, id };

        const [orders, transaction, sales] = await Promise.all([
            fetchOrderSummary(queryParams, apiConfig),
            fetchTransactionSummary({ startDate, endDate, brandName, id: categoryId }, apiConfig),
            fetchSalesContinuity(queryParams, apiConfig),
        ]);

        const { ccOptVip, ppOptVip, totalOptPPCC } = calculateMetrics(orders, sales);

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

        return apiResponse({
            result: "SUCCESS",
            message: combinedResponse,
        });
    } catch (error: unknown) {
        console.error(`[${requestId}] API Error:`, error);
        const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
        return apiResponse({
            result: "ERROR",
            message: errorMessage,
        }, 500);
    }
}

export async function GET(request: NextRequest): Promise<Response> {
    console.warn(`[${request.url}] Unexpected GET request to ${request.url}`);
    return apiResponse({
        result: "ERROR",
        message: "This endpoint only supports POST requests",
    }, 405);
}