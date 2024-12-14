export async function GET(request: Request) {
    // Access the query string parameters from the URL
    const url = new URL(request.url); // `request.url` is the full URL
    const startDate = url.searchParams.get('startDate');
    const endDate = url.searchParams.get('endDate');

    if (!startDate || !endDate) return apiResponse({ result: "Error", message: "Missing startDate or endDate" });
    let totalCount = 0;
    let totalRevenue: number = 0;

    const requestOptions = {
        method: "POST"
    };

    const response = await fetch(`https://api.checkoutchamp.com/reports/projected-billing/?loginId=revboostapirs.nymbus&password=RSsfFrR2nN5PcC6L1pSRs&startDate=${startDate}&endDate=${endDate}&reportType=campaign&cycle1Attrition=80&cycle2Attrition=80&cycle3Attrition=80&cycle4PlusAttrition=80`, requestOptions).then(result => result.json()).catch(error => apiResponse(error));
    if (response.result === "ERROR") return apiResponse({ result: "ERROR", message: response.message });
    if (response.result === "SUCCESS") {
        const data = response.message;
        Object.keys(data).map(key => {
            const finalData = data[key];
            for (const date in finalData) {
                if (date != 'id') {
                    const { count, revenue } = finalData[date];
                    totalCount += count;
                    totalRevenue += parseFloat(revenue.replace('$', '').replace(',', ''));;
                }
            }
        });
        // console.log(JSON.stringify(campaignData, null, 2));
        totalRevenue = +totalRevenue.toFixed(2);
    }
    const message = { date: startDate + " - " + endDate, totalRevenue, reportDate: "need to add", totalCount };
    return apiResponse({ result: "SUCCESS", message });
}

const apiResponse = (message: object, status: number = 200) => {
    return new Response(JSON.stringify(message), {
        status: status,
        headers: { 'Content-Type': 'application/json' },
    });
}