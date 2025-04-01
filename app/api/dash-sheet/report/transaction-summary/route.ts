import { NextRequest } from 'next/server';
import { apiResponse } from '@/lib/utils';

// Define interfaces for type safety
interface TransactionSummary {
    rebillRev: string;
    rebillApprovedPerc: string;
    refundRev: string;
    chargebackCnt: string;
}

interface ResponseData {
    rebillRevenue: number;
    rebillApprovedPerc: number;
    rebillRefundRev: number;
    billableRebillRev: number;
    rebillRefundPerc: number;
    chargebackCnt: number;
}

interface BrandConfig {
    loginId: string;
    password: string;
}

interface QueryParams {
    startDate?: string;
    endDate?: string;
    id?: string;
}

// Utility function to add one day to a date
const addOneDay = (dateStr: string): string => {
    const date = new Date(dateStr);
    date.setDate(date.getDate() + 1);
    return date.toISOString().split('T')[0]; // Returns YYYY-MM-DD format
};

// API fetch function with conditional time parameters
const fetchTransactionSummary = async (
    brand: BrandConfig,
    query: QueryParams,
    brandName: string
): Promise<ResponseData> => {
    try {
        // Adjust endDate by adding 1 day
        const adjustedEndDate = addOneDay(query.endDate!);

        // Conditionally include startTime and endTime for HELIKON
        const timeParams = brandName.toUpperCase() === 'HELIKON'
            ? '&startTime=03:00&endTime=02:59'
            : '';

        const url = `https://api.checkoutchamp.com/transactions/summary/?loginId=${brand.loginId}&password=${brand.password}&startDate=${query.startDate}&endDate=${adjustedEndDate}&${timeParams}&reportType=currency&productId=RECURRING&campaignCategory=${query.id}`;

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data.result !== 'SUCCESS' || !Array.isArray(data.message) || data.message.length === 0) {
            throw new Error(data.message || 'Invalid response format');
        }

        // Process the response data
        const summary: TransactionSummary = data.message[0];
        const rebillRevenue = Number(summary.rebillRev);
        const rebillApprovedPerc = Number(summary.rebillApprovedPerc);
        const rebillRefundRev = Number(summary.refundRev);
        const chargebackCnt = Number(summary.chargebackCnt);

        const billableRebillRev = Number((rebillRevenue - rebillRefundRev).toFixed(2));
        const rebillRefundPercRaw = rebillRevenue > 0
            ? Number((rebillRefundRev / rebillRevenue).toFixed(4))
            : 0;

        return {
            rebillRevenue,
            rebillApprovedPerc: rebillApprovedPerc / 100, // Convert to decimal
            rebillRefundRev,
            billableRebillRev,
            rebillRefundPerc: rebillRefundPercRaw,
            chargebackCnt,
        };
    } catch (error) {
        console.error('Error fetching transaction summary:', error);
        throw error;
    }
};

// API handler
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');
        const id = searchParams.get('id');
        const brandName = searchParams.get('brandName');

        // Validate required parameters
        if (!startDate || !endDate) {
            return apiResponse({
                result: 'ERROR',
                message: 'Provide startDate and endDate',
            }, 400);
        }

        if (!id) {
            return apiResponse({
                result: 'ERROR',
                message: 'Provide id for campaignCategory',
            }, 400);
        }

        if (!brandName) {
            return apiResponse({
                result: 'ERROR',
                message: 'Provide brandName',
            }, 400);
        }

        // Get brand configuration from environment
        const brandConfig = process.env[brandName];
        if (!brandConfig) {
            return apiResponse({
                result: 'ERROR',
                message: 'Invalid brand configuration',
            }, 400);
        }

        const brand: BrandConfig = JSON.parse(brandConfig);
        const query: QueryParams = { startDate, endDate, id };

        // Fetch and process data
        const data = await fetchTransactionSummary(brand, query, brandName);

        return apiResponse({
            result: 'SUCCESS',
            message: data,
        });
    } catch (error) {
        console.error('API Handler Error:', error);
        return apiResponse({
            result: 'ERROR',
            message: error instanceof Error ? error.message : 'Internal server error',
        }, 500);
    }
}

// Export config (optional)
export const config = {
    runtime: 'edge', // Optional: use edge runtime for better performance
};