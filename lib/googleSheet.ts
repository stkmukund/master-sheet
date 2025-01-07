// app/sheet-data/page.js

export default async function SheetDataPage(brandName: string, report: string) {
    const apiKey = process.env.GOOGLE_SHEET_API_KEY || '';
    const brandSheet = JSON.parse(process.env.BRAND_SHEETS || '');
    const brand = brandSheet[report][brandName];
    const sheetId = brand.sheetId; // Replace with your Google Sheet ID
    const range = brand.sheetName + '!A:Z';  // Adjust column range as needed


    const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${range}?key=${apiKey}`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        const last10Rows = data.values ? data.values.slice(-10) : [];
        return last10Rows;
    } catch (error) {
        console.error('Error fetching data from Google Sheets:', error);
        return error;
    }
}
