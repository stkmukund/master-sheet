import { campaignCategory } from "@/lib/campaign-details";
import { apiResponse, summaryToSheet } from "@/lib/utils";
import axios from "axios";
import { NextRequest } from "next/server";
import { sampleResponse } from ".";

// Helper function to format date to MM/DD/YYYY
function formatDate(date: Date): string {
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
}

// Helper function to get yesterday's date
function getYesterday(): Date {
    const date = new Date();
    date.setDate(date.getDate() - 1);
    return date;
}

// Helper function to get date N days ago
function getDateDaysAgo(days: number): Date {
    const date = new Date();
    date.setDate(date.getDate() - days);
    return date;
}

// Helper function to calculate date ranges for summary
function getSummaryDateRanges(): { startDate: string; endDate: string }[] {
    const yesterday = getYesterday();
    const yesterdayStr = formatDate(yesterday);

    return [
        // Yesterday
        { startDate: yesterdayStr, endDate: yesterdayStr },
        // Last 7 days
        { startDate: formatDate(getDateDaysAgo(7)), endDate: yesterdayStr },
        // Last 30 days (modified from 30)
        { startDate: formatDate(getDateDaysAgo(30)), endDate: yesterdayStr },
    ];
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

const fetchApiData = async <T>(
    apiUrl: string,
    method: string = 'POST'
): Promise<T> => {
    const requestId = Math.random().toString(36).substring(2, 15);
    // console.log(`[${requestId}] Fetching API URL: ${apiUrl}`);

    // Check cache
    const cached = cache.get(apiUrl);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        // console.log(`[${requestId}] Returning cached data for ${apiUrl}`);
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
        const response = await axios({
            method,
            url: apiUrl,
            timeout: 0, // No timeout for long-running requests
            headers: {
                'Content-Type': 'application/json',
                'X-Request-ID': requestId,
            },
        });

        // console.log(`[${requestId}] API Response:`, response.data);

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

export async function POST(request: NextRequest): Promise<Response> {
    const requestId = Math.random().toString(36).substring(2, 15);
    // console.log(`[${requestId}] Received ${request.method} request to ${request.url}`);

    const url = new URL(request.url);
    const startDate = url.searchParams.get('startDate');
    const endDate = url.searchParams.get('endDate');
    const reportType = url.searchParams.get('reportType');
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    // console.log(`[${requestId}] Using baseUrl: ${baseUrl}`);

    // Handle case when startDate and endDate are not provided
    if (!startDate || !endDate) {
        if (reportType === 'summary') {
            const dateRanges = getSummaryDateRanges();
            const finalData: {
                result: string;
                message: {
                    period: string;
                    data: object;
                }[][];
            } = {
                result: "SUCCESS",
                message: [],
            };

            try {
                const campaignData = Object.values(campaignCategory.NYMBUS).map((campaign) => campaign.apiEndpoint);
                // const campaignData = ['floralSecrets']; // Hardcoded for now

                // for (const endpoint of campaignData) {
                //     const rangeData: {
                //         period: string;
                //         data: object;
                //     }[] = new Array(dateRanges.length).fill(null).map(() => ({ period: "", data: {} }));
                //     for (let index = 0; index < dateRanges.length; index++) {
                //         const range = dateRanges[index];
                //         console.log(`Fetching data for range (index ${index}):`, range);

                //         const apiUrl = `${baseUrl}/api/dash-sheet/NYMBUS/${endpoint}?startDate=${range.startDate}&endDate=${range.endDate}`;
                //         const data = await fetchApiData<object>(apiUrl);

                //         rangeData[index].period = `${range.startDate} - ${range.endDate}`;
                //         rangeData[index].data = data;

                //         console.log(`data rangeData (index ${index})`, rangeData);
                //     }

                //     finalData.message.push(rangeData);
                //     // console.log(`[${requestId}] Range data:`, rangeData);
                // }

                // Write to Google Sheets
                const sheetResponse = await summaryToSheet(baseUrl, sampleResponse, {
                    sheetId: "1w0RZBZChXhOZGf73FYcO78bNZmUrYI-FcEaXMgEssYo",
                    sheetName: "API-Overview",
                });
                console.log(`[${requestId}] Sheet write response:`, sheetResponse);
                return apiResponse(sampleResponse);
            } catch (error: unknown) {
                const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
                console.error(`[${requestId}] Summary Error:`, errorMessage);
                return apiResponse({
                    result: "ERROR",
                    message: errorMessage,
                }, 500);
            }
        }
        return apiResponse({ result: "ERROR", message: "Missing startDate or endDate" }, 400);
    } else {
        // Original logic for when dates are provided
        const finalData: {
            result: string;
            message: object[];
        } = {
            result: "SUCCESS",
            message: [],
        };

        try {
            const campaignData = Object.values(campaignCategory.NYMBUS).map((campaign) => campaign.apiEndpoint);

            for (const endpoint of campaignData) {
                const apiUrl = `${baseUrl}/api/dash-sheet/NYMBUS/${endpoint}?startDate=${startDate}&endDate=${endDate}`;
                // console.log(`[${requestId}] Fetching endpoint: ${apiUrl}`);
                const data = await fetchApiData<object>(apiUrl);
                finalData.message.push(data);
            }

            return apiResponse(finalData);
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
            console.error(`[${requestId}] API Error:`, errorMessage);
            return apiResponse({
                result: "ERROR",
                message: errorMessage,
            }, 500);
        }
    }
}

export async function GET(request: NextRequest): Promise<Response> {
    console.warn(`[${request.url}] Unexpected GET request to ${request.url}`);
    return apiResponse({
        result: "ERROR",
        message: "This endpoint only supports POST requests",
    }, 405);
}