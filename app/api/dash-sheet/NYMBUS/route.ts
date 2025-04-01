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

    try {
        // Assuming you want to use an environment variable for the API base URL
        const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/dash-sheet/report/order-summary/?startDate=${startDate}&endDate=${endDate}&brandName=NYMBUS`;

        // Fetch data from the external API
        const response = await fetch(apiUrl);

        // Check if the response is successful
        if (!response.ok) {
            throw new Error(`API error: ${response.statusText}`);
        }

        // Parse the JSON response
        const orderQuery: OrderQueryResponse = await response.json();

        return apiResponse({ result: "SUCCESS", message: orderQuery });
    } catch (error: unknown) {
        // Handle the error gracefully
        const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
        return apiResponse({
            result: "ERROR",
            message: errorMessage,
        });
    }
}
