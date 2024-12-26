import sheets from '../../utils/sheets';
const spreadsheetId = "1ViQHXWJaaHzn_9XYrgzwy1eOzQVGFdEapYeuEpBBjNY";

export async function GET(request: Request) {
    // Access the query string parameters from the URL
    const url = new URL(request.url); // `request.url` is the full URL
    const startDate = url.searchParams.get('startDate');
    const endDate = url.searchParams.get('endDate');
    const brandName = url.searchParams.get('brandName');
    const brand = JSON.parse(process.env[brandName!] || '');

    if (!startDate || !endDate) return apiResponse({ result: "Error", message: "Missing startDate or endDate" });
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
    }
    const message = { date: startDate + " - " + endDate, totalRevenue, reportDate: "need to add", totalCount };
   // addDataToSheet(message);
    return apiResponse({ result: "SUCCESS", message });
}

const apiResponse = (message: object, status: number = 200) => {
    return new Response(JSON.stringify(message), {
        status: status,
        headers: { 'Content-Type': 'application/json' },
    });
}
const addDataToSheet=async(message: object)=>
{
    const resource = {
        values: [
            [message.date, message.totalRevenue, message.reportDate, message.totalCount] // Correct structure
        ]

    };
    const response = await sheets.spreadsheets.values.append({
        spreadsheetId, range: "Projected Rebill Revenue - Next 30 Days!A:A",
        valueInputOption: "USER_ENTERED",
        resource
    });
    const updates = response.data.updates;
    async function getStartingRow(range:string) {
        // Split the range into sheet name and cell range
        const cellRange = range.split('!')[1];
        // Extract the starting row number
        const startRow = cellRange.split(':')[0].match(/\d+/)[0];
        return await parseInt(startRow, 10);
    }

    const updatedRange = updates.updatedRange;
    let startingRowIndex = await getStartingRow(updatedRange);
        // Add borders to the appended cells
        const batchUpdateRequest = {
            requests: [
                {
                    updateBorders: {
                        range: {
                            sheetId: 98572450,
                            startRowIndex: startingRowIndex-1, // Adjust based on your appended rows
                            endRowIndex: startingRowIndex, // Adjust to the end of appended rows
                            startColumnIndex: 0,
                            endColumnIndex: 4, // Adjust based on the number of columns
                        },
                        top: { style: "SOLID", width: 1, color: { red: 0, green: 0, blue: 0 } },
                        bottom: { style: "SOLID", width: 1, color: { red: 0, green: 0, blue: 0 } },
                        left: { style: "SOLID", width: 1, color: { red: 0, green: 0, blue: 0 } },
                        right: { style: "SOLID", width: 1, color: { red: 0, green: 0, blue: 0 } },
                        innerHorizontal: { style: "SOLID", width: 1, color: { red: 0, green: 0, blue: 0 } },
                        innerVertical: { style: "SOLID", width: 1, color: { red: 0, green: 0, blue: 0 } },
                    },

                },
            ],
        };

        const batchUpdateResponse = await sheets.spreadsheets.batchUpdate({
            spreadsheetId,
            resource: batchUpdateRequest,
        });
console.log('batchUpdateResponse',batchUpdateResponse)
}