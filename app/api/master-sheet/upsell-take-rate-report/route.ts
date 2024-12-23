export const maxDuration = 60 // 60sec max duration
export async function GET(request: Request) {
    // Access the query string parameters from the URL
    const url = new URL(request.url); // `request.url` is the full URL
    const startDate = url.searchParams.get('startDate');
    const endDate = url.searchParams.get('endDate');
    const campaignProductId = url.searchParams.get('campaignProductId');
    const status = url.searchParams.get('status');
    let fetchStatus = "ACTIVE";
    if (status) fetchStatus = status;

    if (!startDate || !endDate) return apiResponse({ result: "Error", message: "Missing startDate or endDate" });

    const requestOptions = {
        method: "POST"
    };

    const response = await fetch(`https://api.checkoutchamp.com/transactions/summary/?loginId=revbdevdsg.helikon&password=yk5Z549ZN2KFz&startDate=${startDate}&endDate=${endDate}&campaignProductId=${campaignProductId}&reportType=product`, requestOptions).then(result => result.json()).catch(error => apiResponse(error));
    if (response.result === "ERROR") return apiResponse({
        result: "SUCCESS", message: {
            salesCount: 0,
            salesRev: 0
        }
    });
    if (response.result === "SUCCESS") {
        const data = response.message;
        return apiResponse({
            result: "SUCCESS", message: {
                salesCount: data[0].newSaleCnt,
                salesRev: +data[0].newSaleRev
            }
        });
    }
}

const apiResponse = (message: object, status: number = 200) => {
    return new Response(JSON.stringify(message), {
        status: status,
        headers: { 'Content-Type': 'application/json' },
    });
}