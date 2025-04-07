import { campaignCategory } from "@/lib/campaign-details";
import { apiResponse } from "@/lib/utils";

interface OrderQueryResponse {
    result: string;
    message: any; // You can define a more specific type here if necessary
}

export async function POST(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const startDate = url.searchParams.get('startDate');
    const endDate = url.searchParams.get('endDate');

    // Ensure both startDate and endDate are provided
    if (!startDate || !endDate) {
        return apiResponse({ result: "ERROR", message: "Missing startDate or endDate" });
    }

    const finalData: {
        result: string;
        message: any[]; // You can define a more specific type here if necessary
    } = {
        result: "SUCCESS",
        message: []
    }

    try {
        // Assuming you want to use an environment variable for the API base URL
        // const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/dash-sheet/report/order-summary/?startDate=${startDate}&endDate=${endDate}&brandName=NYMBUS`;

        const campaignData = Object.values(campaignCategory.NYMBUS).map((campaign) => campaign.apiEndpoint);
        // console.log("Campaign Data:", campaignData);
        for (let index = 0; index < campaignData.length; index++) {
            console.log("Campaign Data:", campaignData[index]);
            const response: { message: object } = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/dash-sheet/NYMBUS/${campaignData[index]}?startDate=${startDate}&endDate=${endDate}`, {
                method: "POST",
            }).then((res) => res.json())
            finalData.message.push(response.message)
            console.log("Campaign Data:", finalData);
        }

        return apiResponse({ result: "SUCCESS", message: finalData });
    } catch (error: unknown) {
        // Handle the error gracefully
        const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
        return apiResponse({
            result: "ERROR",
            message: errorMessage,
        });
    }
}
