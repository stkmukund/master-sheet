// import sheets from '../../utils/sheets';
// const spreadsheetId = "1ydqgJCMkvp1ctuvk7pKS7-UFbIbrleUivnl4c5scWPQ";
export const maxDuration = 60 // 60sec max duration
export async function GET(request: Request) {
    // Access the query string parameters from the URL
    const url = new URL(request.url); // `request.url` is the full URL
    const startDate = url.searchParams.get('startDate');
    const endDate = url.searchParams.get('endDate');
    const campaignProductId = url.searchParams.get('campaignProductId');
    // const status = url.searchParams.get('status');
    // let fetchStatus = "ACTIVE";
    // if (status) fetchStatus = status;

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

const addDataToSheet = async (message: object) => {
    let data = message.message;
    console.log('addDataToSheet', data.salesCount);
    let value = await prepreRowData(data);
    const resource = {
        value

    };



}

const prepreRowData = async (message: object) => {
    let total = 1000;
    const values = [
        [], ["Date", "", "Expedited Shipping", "Discounted Expedited Shipping", "FlexiKnee™️ - Natural Knee Pain Patches - Offer 2", "FlexiKnee™️ - Natural Knee Pain Patches - Offer 2_1", "Knee Relieve Pro™️ - Nano-Fiber Compression Sleeve - Offer 3", "mLab™️ - Side Sleeper Knee Pillow - Offer", "Total"],
        [message.date, "% of people taking the upsell",calPplPer(message.salesCount,total)]
    ];
    return values;
}
const calPplPer = (amount: number, total: number) => {
    return ((amount / total) * 100).toFixed(2);
}