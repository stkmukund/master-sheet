import { apiResponse } from "@/lib/utils";

export async function GET(request: Request) {
    // Access the query string parameters from the URL
    const url = new URL(request.url); // `request.url` is the full URL
    const startDate = url.searchParams.get('startDate');
    console.log("startDate", startDate)
    return apiResponse({ result: 'SUCCESS', message: ["Hello from Dash Sheet"], url })
}