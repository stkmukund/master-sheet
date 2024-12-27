import { addOneDay, calculateEndDate } from '@/lib/date-utils';
import { apiResponse, projectedTableHead } from '@/lib/utils';
import { ReportData } from '../interface';
const spreadsheetId = "1ViQHXWJaaHzn_9XYrgzwy1eOzQVGFdEapYeuEpBBjNY";

export async function GET(request: Request) {
    // Access the query string parameters from the URL
    const url = new URL(request.url); // `request.url` is the full URL
    const reportDate = url.searchParams.get('startDate');
    const startDate = addOneDay(reportDate!);
    let endDate = url.searchParams.get('endDate');
    if (!endDate) endDate = calculateEndDate(startDate!);
    const brandName = url.searchParams.get('brandName');
    const brand = JSON.parse(process.env[brandName!] || '');

    if (!startDate || !endDate) return apiResponse({ result: "Error", message: "Missing startDate or endDate" });

    const tableHead = projectedTableHead(brandName!);
    const reportData: ReportData = {
        heading: tableHead,
        values: [[`${startDate} - ${endDate}`]]
    }
    let totalCount = 0;
    let totalRevenue: number = 0;

    const requestOptions = {
        method: "POST"
    };

    const response = await fetch(`https://api.checkoutchamp.com/reports/projected-billing/?loginId=${brand.loginId}&password=${brand.password}&startDate=${startDate}&endDate=${endDate}&reportType=campaign&cycle1Attrition=80&cycle2Attrition=80&cycle3Attrition=80&cycle4PlusAttrition=80`, requestOptions).then(result => result.json()).catch(error => apiResponse(error));
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
        reportData.values[0].push(totalRevenue); // added totalRevenue
        reportData.values[0].push(reportDate!); // added reportDate
        reportData.values[0].push(totalCount); // added totalCount
    }
    return apiResponse({ result: "SUCCESS", message: reportData });
}