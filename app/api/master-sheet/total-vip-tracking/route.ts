export const maxDuration = 60 // 60sec max duration
export async function GET(request: Request) {
    // Access the query string parameters from the URL
    const url = new URL(request.url); // `request.url` is the full URL
    const startDate = url.searchParams.get('startDate');
    const endDate = url.searchParams.get('endDate');
    const campaignId = url.searchParams.get('campaignId');
    const status = url.searchParams.get('status');
    let fetchStatus = "ACTIVE";
    if (status) fetchStatus = status;

    if (!startDate || !endDate) return apiResponse({ result: "Error", message: "Missing startDate or endDate" });

    const requestOptions = {
        method: "POST"
    };

    const response = await fetch(`https://api.checkoutchamp.com/purchase/query/?loginId=revboostapirs.nymbus&password=RSsfFrR2nN5PcC6L1pSRs&startDate=${startDate}&endDate=${endDate}&status=${fetchStatus}&campaignId=${campaignId}&resultsPerPage=1`, requestOptions).then(result => result.json()).catch(error => apiResponse(error));
    if (response.result === "ERROR") return apiResponse({ result: "ERROR", message: response.message });
    if (response.result === "SUCCESS") {
        const data = response.message;

        return apiResponse({ result: "SUCCESS", message: { totalResults: data.totalResults } });

    }
}

const apiResponse = (message: object, status: number = 200) => {
    return new Response(JSON.stringify(message), {
        status: status,
        headers: { 'Content-Type': 'application/json' },
    });
}