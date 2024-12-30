// import sheets from '../../utils/sheets';
// const spreadsheetId = "1ydqgJCMkvp1ctuvk7pKS7-UFbIbrleUivnl4c5scWPQ";
export const maxDuration = 60 // 60sec max duration
export async function GET(request: Request) {
    // Access the query string parameters from the URL
    const url = new URL(request.url); // `request.url` is the full URL
    const startDate = url.searchParams.get('startDate');
    const endDate = url.searchParams.get('endDate');
    const brandName = url.searchParams.get('brandName');
    const brand = JSON.parse(process.env[brandName!] || '');
    let campaignProductId = url.searchParams.get('campaignProductId');
    let campaignIds=url.searchParams.get('campaignId');
    let total = url.searchParams.get('total');
    if (!startDate || !endDate) return apiResponse({ result: "Error", message: "Missing startDate or endDate" });

    const requestOptions = {
        method: "POST"
    };
    if (total == '1') {

        const statuses = ["COMPLETE", "REFUNDED", "CANCELLED"];

        const fetchTotalResults = async (orderStatus:any) => {
            const response = await fetch(
                `https://api.checkoutchamp.com/order/query/?loginId=${brand.loginId}&password=${brand.password}&startDate=${startDate}&endDate=${endDate}&campaignId=${campaignIds}&reportType=campaign&orderStatus=${orderStatus}&orderType=NEW_SALE`,
                requestOptions
            )
                .then((result) => result.json())
                .catch((error) => ({ result: "ERROR", error }));

            if (response.result === "SUCCESS") {
                return response.message.totalResults || 0;
            }

            // Default to 0 if there's an error
            return 0;
        };

        // Fetch results for all statuses in parallel
        const results = await Promise.all(statuses.map((status) => fetchTotalResults(status)));

        // Calculate the sum of totalResults
        const totalSum = results.reduce((sum, count) => sum + count, 0);

        // Return the API response
        return apiResponse({
            result: "SUCCESS",
            message: {
                date: `${startDate} - ${endDate}`,
                salesCount: totalSum,
            },
        });
    }
    const response = await fetch(`https://api.checkoutchamp.com/transactions/summary/?loginId=${brand.loginId}&password=${brand.password}&startDate=${startDate}&endDate=${endDate}&campaignProductId=${campaignProductId}&reportType=product`, requestOptions).then(result => result.json()).catch(error => apiResponse(error));
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
                date: startDate + " - " + endDate,
                salesCount: data[0].newSaleCnt,
                salesRev: +data[0].newSaleRev
            }
        });
    }


}

const apiResponse = (message: object, status: number = 200) => {
    //addDataToSheet(message);
    return new Response(JSON.stringify(message), {
        status: status,
        headers: { 'Content-Type': 'application/json' },
    });
}
