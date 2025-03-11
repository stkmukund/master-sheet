import { apiResponse } from "@/lib/utils";

export async function POST(request: Request) {
    // Access the query string parameters from the URL
    const url = new URL(request.url); // `request.url` is the full URL
    const startDate = url.searchParams.get('startDate');
    const endDate = url.searchParams.get('endDate');
    if (!startDate || !endDate) return apiResponse({ result: "ERROR", message: "Missing startDate or endDate" });
    const startTime = url.searchParams.get('startTime');
    const endTime = url.searchParams.get('endTime');
    const brandName = url.searchParams.get('brandName');
    const brand = JSON.parse(process.env[brandName!] || '');
    const body = await request.json()
    console.log("body", body);


    // Convert the array to a comma-separated string
    const campaignIdString = body.join(",");


    let page = 1;
    let count = 1;
    let totalAmount: number = 0;
    let refundedAmount: number = 0;
    let completeCount = 0;
    let refundCount = 0;
    let cancelCount = 0;
    let creditCard = 0;
    let payPal = 0;

    // Complete
    const fetchComplete = async () => {
        // const campaignIdString = campaignId.join(",");
        const { data } = await fetch(`https://api.checkoutchamp.com/order/query/?loginId=${brand.loginId}&password=${brand.password}&campaignId=${campaignIdString}&orderStatus=COMPLETE&startDate=${startDate}&endDate=${endDate}&resultsPerPage=200&orderType=NEW_SALE&page=${page}`).then(res => res.json())
        const orders: object[] = data.message.data;
        if (!data.message.data) {
            return 0;
        } else {
            orders.map((item) => {
                totalAmount += Number(item.totalAmount);
                if (item.paySource === "CREDITCARD") {
                    creditCard++;
                } else if (item.paySource === "PAYPAL") {
                    payPal++;
                }
            });
        }
        completeCount = Number(data.message.totalResults);
        if (data.message.totalResults > 200) {
            count = Math.ceil(data.message.totalResults / 200);
        }
        if (count > page) {
            page++;
            await fetchComplete();
        }

        page = 1;

        return totalAmount;
    };

    // Refunded
    const fetchRefunded = async () => {
        // const campaignIdString = campaignId.join(",");
        const { data } = await axios.post(
            `https://api.checkoutchamp.com/order/query/?loginId=${config.CC_LOGIN_ID}&password=${config.CC_PASSWORRD}&campaignId=${campaignIdString}&orderStatus=REFUNDED&startDate=${query.startDate}&endDate=${query.endDate}&resultsPerPage=200&orderType=NEW_SALE&page=${page}`
        );
        const orders: object[] = data.message.data;
        if (!data.message.data) {
            return 0;
        } else {
            orders.map((item) => {
                totalAmount += Number(item.totalAmount);
                refundedAmount += Number(item.totalAmount);
                if (item.paySource === "CREDITCARD") {
                    creditCard++;
                } else if (item.paySource === "PAYPAL") {
                    payPal++;
                }
            });
        }
        refundCount = Number(data.message.totalResults);
        if (data.message.totalResults > 200) {
            count = Math.ceil(data.message.totalResults / 200);
        }
        if (count > page) {
            page++;
            await fetchRefunded();
        }

        page = 1;

        return totalAmount;
    };

    // Cancelled
    const fetchCancelled = async () => {
        // const campaignIdString = campaignId.join(",");
        const { data } = await axios.post(
            `https://api.checkoutchamp.com/order/query/?loginId=${config.CC_LOGIN_ID}&password=${config.CC_PASSWORRD}&campaignId=${campaignIdString}&orderStatus=CANCELLED&startDate=${query.startDate}&endDate=${query.endDate}&resultsPerPage=200&orderType=NEW_SALE&page=${page}`
        );
        const orders: object[] = data.message.data;
        if (!data.message.data) {
            return 0;
        } else {
            orders.map((item) => {
                totalAmount += Number(item.totalAmount);
                if (item.paySource === "CREDITCARD") {
                    creditCard++;
                } else if (item.paySource === "PAYPAL") {
                    payPal++;
                }
            });
        }
        cancelCount = Number(data.message.totalResults);
        if (data.message.totalResults > 200) {
            count = Math.ceil(data.message.totalResults / 200);
        }
        if (count > page) {
            page++;
            await fetchCancelled();
        }

        page = 1;

        return totalAmount;
    };

    // DECLINED
    const fetchDeclined = async () => {
        // const campaignIdString = campaignId.join(",");
        const { data } = await axios.post(
            `https://api.checkoutchamp.com/order/query/?loginId=${config.CC_LOGIN_ID}&password=${config.CC_PASSWORRD}&campaignId=${campaignIdString}&orderStatus=DECLINED&startDate=${query.startDate}&endDate=${query.endDate}&resultsPerPage=1&orderType=NEW_SALE&page=${page}`
        );
        const orders: object[] = data.message.data;
        if (!data.message.data) {
            return 0;
        }
        let declineCount = Number(data.message.totalResults);
        return declineCount;
    };

    await fetchComplete();
    await fetchRefunded();
    await fetchCancelled();
    const declined = await fetchDeclined();

    if (!totalAmount) totalAmount = 0;
    let initialSales = completeCount + refundCount + cancelCount;

    return { totalAmount, refundedAmount, initialSales, declined, creditCard, payPal };
    return apiResponse({ result: "SUCCESS", message: "Hello from Sales Total" })
}