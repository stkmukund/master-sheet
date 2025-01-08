// app/sheet-data/page.js

export default async function SheetDataPage(brandName: string, report: string) {
    const apiKey = process.env.GOOGLE_SHEET_API_KEY || '';
    const brandSheet = JSON.parse(process.env.BRAND_SHEETS || '');
    const brand = brandSheet[report][brandName];
    const sheetId = brand.sheetId; // Replace with your Google Sheet ID
    const range = brand.sheetName + '!A:Z';  // Adjust column range as needed
    // console.log(brandName, brand, sheetId, range);


    const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${range}?key=${apiKey}`;

    return fetch(url).then((response) => response.json())
        .then(data => data.values ? data.values.slice(-10) : [])
        .catch(error => {
            console.error('Error fetching data from Google Sheets:', error);
            return error;
        })
}
