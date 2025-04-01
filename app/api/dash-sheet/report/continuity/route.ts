// app/api/vips/route.ts
import { NextRequest, NextResponse } from 'next/server';

// Response interface
interface ApiResponse {
    vipInitial: {
        totalInitialVip: number;
        creditCardVip: number;
        payPalVip: number;
    };
    vipDeclined: number;
    vipRecycleRebill: number;
    vipTotal: number;
}

interface BrandConfig {
    loginId: string;
    password: string;
}

// Helper function to create API responses
const apiResponse = (data: any, status: number = 200) => {
    return NextResponse.json(data, { status });
};

// Fetch helper with error handling
const fetchWithErrorHandling = async (url: string) => {
    try {
        const response = await fetch(url).then(res => res.json());
        return response;
    } catch (error) {
        console.error('Fetch error:', error);
        throw error;
    }
};

export async function GET(request: NextRequest) {
    try {
        // Get query parameters
        const { searchParams } = new URL(request.url);
        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');
        const campaignId = searchParams.get('id');
        const brandName = searchParams.get('brandName');

        // Validate parameters
        if (!startDate || !endDate) {
            return apiResponse(
                { result: 'ERROR', message: 'Provide startDate and endDate' },
                400
            );
        }

        if (!campaignId) {
            return apiResponse(
                { result: 'ERROR', message: 'Provide id for campaignCategory' },
                400
            );
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
        // Fetch Initial VIPs (with pagination)
        const fetchInitialVip = async () => {
            let page = 1;
            let count = 1;
            let creditCardVip = 0;
            let payPalVip = 0;
            let intialResults = 0;

            while (page <= count) {
                const url = `https://api.checkoutchamp.com/purchase/query/?loginId=${brand.loginId}&password=${brand.password}&status=ACTIVE&campaignId=${campaignId}&startDate=${startDate}&endDate=${endDate}&resultsPerPage=200&page=${page}`;

                const response = await fetchWithErrorHandling(url);
                if (response.result === 'SUCCESS') {
                    intialResults = response.message.totalResults;
                    count = Math.ceil(intialResults / 200);
                    const orders: Vip[] = response.message.data;
                    const { creditCardVips, payPalVips } = await filterVipsByStatus(orders);
                    creditCardVip += creditCardVips;
                    payPalVip += payPalVips;
                } else {
                    intialResults = 0; // Handle error case
                    creditCardVip += 0;
                    payPalVip += 0;
                }
                page++;
            }

            return {
                totalInitialVip: intialResults, // Approximation based on last page
                creditCardVip,
                payPalVip,
            };
        };

        // Fetch Declined VIPs
        const fetchDeclinedVip = async () => {
            const url = `https://api.checkoutchamp.com/purchase/query/?loginId=${brand.loginId}&password=${brand.password}&dateRangeType=dateUpdated&campaignId=${campaignId}&status=CANCELLED&startDate=${startDate}&endDate=${endDate}&resultsPerPage=1`;
            const response = await fetchWithErrorHandling(url);
            if (response.result === 'SUCCESS') return response.message.totalResults;
            else return 0; // Handle error case
        };

        // Fetch Recycle Rebill
        const fetchRecycleRebill = async () => {
            const url = `https://api.checkoutchamp.com/purchase/query/?loginId=${brand.loginId}&password=${brand.password}&campaignId=${campaignId}&status=RECYCLE_BILLING&startDate=01/01/2010&endDate=${endDate}&resultsPerPage=1`;
            const response = await fetchWithErrorHandling(url);
            if (response.result === 'SUCCESS') return response.message.totalResults;
            else return 0; // Handle error case
        };

        // Fetch Total Active VIPs
        const fetchTotalActiveVip = async () => {
            const url = `https://api.checkoutchamp.com/purchase/query/?loginId=${brand.loginId}&password=${brand.password}&campaignId=${campaignId}&status=ACTIVE&startDate=01/01/2010&endDate=${endDate}&resultsPerPage=1`;
            const response = await fetchWithErrorHandling(url);
            if (response.result === 'SUCCESS') return response.message.totalResults;
            else return 0; // Handle error case
        };

        // Execute all requests concurrently
        const [vipInitial, vipDeclined, vipRecycleRebill, vipTotal] = await Promise.all([
            fetchInitialVip(),
            fetchDeclinedVip(),
            fetchRecycleRebill(),
            fetchTotalActiveVip(),
        ]);

        return apiResponse({
            result: "SUCCESS",
            message: {
                vipInitial,
                vipDeclined,
                vipRecycleRebill,
                vipTotal
            }
        });

    } catch (error: any) {
        console.error('API Error:', error.message || error);
        return apiResponse(
            { result: 'ERROR', message: 'Internal server error' },
            500
        );
    }
}

// types/vip.ts
export interface Vip {
    // Define your Vip interface properties here
    // Example:
    status?: string;
    paymentMethod?: string;
    transactions: [
        {
            paySource: string;
            // ... other properties
        }
    ]
    // ... other properties
}

// utils/vip-utils.ts
export function getCampaignIdById(id: number): string {
    // Your implementation
    return id.toString(); // Placeholder
}

export async function filterVipsByStatus(orders: Vip[]) {
    // Your implementation
    const creditCardVips = orders.filter(vip => vip.transactions[0].paySource === 'CREDITCARD').length;
    const payPalVips = orders.filter(vip => vip.transactions[0].paySource === 'PAYPAL').length;
    return { creditCardVips, payPalVips };
}