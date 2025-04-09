import { campaignCategory } from "@/lib/campaign-details";
import { apiResponse } from "@/lib/utils";

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
        {
            startDate: yesterdayStr,
            endDate: yesterdayStr
        },
        // Last 7 days
        {
            startDate: formatDate(getDateDaysAgo(7)),
            endDate: yesterdayStr
        },
        // Last 30 days
        {
            startDate: formatDate(getDateDaysAgo(30)),
            endDate: yesterdayStr
        }
    ];
}

export async function POST(request: Request): Promise<Response> {
    const url = new URL(request.url);
    let startDate = url.searchParams.get('startDate');
    let endDate = url.searchParams.get('endDate');
    const reportType = url.searchParams.get('reportType');

    // Handle case when startDate and endDate are not provided
    if (!startDate || !endDate) {
        if (reportType === 'summary') {
            const dateRanges = getSummaryDateRanges();
            const finalData: {
                result: string;
                message: any[];
            } = {
                result: "SUCCESS",
                message: []
            };

            try {
                // const campaignData = Object.values(campaignCategory.NYMBUS).map((campaign) => campaign.apiEndpoint);
                const campaignData = ['browPro'];


                // Process all date ranges
                for (const range of dateRanges) {
                    const rangeData: any[] = [];
                    console.log("Fetching data for range:", range);
                    for (const endpoint of campaignData) {
                        console.log("Fetching endpoint:", `${process.env.NEXT_PUBLIC_API_URL}/api/dash-sheet/NYMBUS/${endpoint}?startDate=${range.startDate}&endDate=${range.endDate}`);
                        const response: { message: object } = await fetch(
                            `${process.env.NEXT_PUBLIC_API_URL}/api/dash-sheet/NYMBUS/${endpoint}?startDate=${range.startDate}&endDate=${range.endDate}`,
                            {
                                method: "POST",
                            }
                        ).then((res) => res.json());
                        rangeData.push(response.message);
                    }
                    finalData.message.push({
                        period: `${range.startDate} - ${range.endDate}`,
                        data: rangeData
                    });
                    console.log("Range data:", rangeData);
                }

                return apiResponse({ result: "SUCCESS", message: finalData });
            } catch (error: unknown) {
                const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
                return apiResponse({
                    result: "ERROR",
                    message: errorMessage,
                });
            }
        }
        return apiResponse({ result: "ERROR", message: "Missing startDate or endDate" });
    }

    // Original logic for when dates are provided
    const finalData: {
        result: string;
        message: any[];
    } = {
        result: "SUCCESS",
        message: []
    };

    try {
        const campaignData = Object.values(campaignCategory.NYMBUS).map((campaign) => campaign.apiEndpoint);

        for (const endpoint of campaignData) {
            const response: { message: object } = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api/dash-sheet/NYMBUS/${endpoint}?startDate=${startDate}&endDate=${endDate}`,
                {
                    method: "POST",
                }
            ).then((res) => res.json());
            finalData.message.push(response.message);
        }

        return apiResponse({ result: "SUCCESS", message: finalData });
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
        return apiResponse({
            result: "ERROR",
            message: errorMessage,
        });
    }
}