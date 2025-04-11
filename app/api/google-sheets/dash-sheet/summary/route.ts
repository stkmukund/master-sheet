import { GoogleAuth, JWT } from "google-auth-library";
import { google, sheets_v4 } from "googleapis";
import { JSONClient } from "google-auth-library/build/src/auth/googleauth";
import { NextRequest, NextResponse } from "next/server";

// Define the type for the Google JSON credentials object
interface GoogleCredentials {
    type: string;
    project_id: string;
    private_key_id: string;
    private_key: string;
    client_email: string;
    client_id: string;
    auth_uri: string;
    token_uri: string;
    auth_provider_x509_cert_url: string;
    client_x509_cert_url: string;
    universe_domain: string;
}

const googleJSON: GoogleCredentials = {
    type: "service_account",
    project_id: "nymbus-vips",
    private_key_id: "00657fe7bb1750259710a821ebe319f7659f72c8",
    private_key:
        "-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQDW1hs1r9GI+NN0\nwfLIo1M2QIvczkdxTdeu9i/8KQ33CoNEvw0X70oWa1I5EvepIw6xAQI5DaVxFDBX\nj8wNv8hfEgzeSyouA7Zbywne1Oh2A9oXEwdT1q4DNG/3lQY1uoJTa26Fx0jLiQnW\nar6pbLB5gF3tUl7cAALbW6r6o4rkZG0WcP2AiYNgF1YhA1544cH0gJIHoETBpIdV\n/9mBM6LJZuANKDR3ut07km16fsUTQY3o7qbmbVnlqk9Da8eEytKj4Lq5yjAWN5tu\n+Daxiq1vPAzNdzxXVK06y/8DSc7ubmFn5uyz6P5M3KTkZ+j5di27cihm36c/mUS8\nUGsFjd5/AgMBAAECggEAG+JxvlfSED+OYALlz/RK/P6xvfjUPbjx0WweMaeOgCMl\ng0sc7Z9fHrvSp0UhT3BqcWpabyyomEhw4dybNVRQM0QfgXbWGbTc+tscA900naTF\nrjsHt3Jk5wDrtiyUlW1eNGpRpRwxrvaxh9rBC908pqM/uGmkQFU2tGFt4YGlVHFr\nn2xAILs7FLlu2AAzR1n+3rjPlJock8iY0Qe84MrfuFShVXSPURkg/i67gsxoxjKR\negmctpHSMXsnqV0USEbgFrZq0B5zHKhEsZ3oat3TH15UY0MEPTO+qYxGdkbCK6Wm\n4CIabHltJNYRJ6DZeuuVhJdTFRlaJKOftTKJoxxPgQKBgQDr3wwj2LNpC/cneYsj\nEwvn42Jec0qm0F+UTrxFe3tTD8d5J6YrKvDHn2534XoMJPCJ1GTQeoFUZFFQsdrZ\n8xW5DUphjcR01cO6bJSa/UAObwz8jS/JAoOTHUm1/53qoxaUYk7jcjmOkPOTqaXs\nXmL/rgjQJgymMQlURwY7GM35vwKBgQDpK4Uqe11oFgOGR0Yil767ZfdMoFTmOWwi\no+SXJXU0JtZ0ybQC49LrbVczYJUP2QTQifozWaNZQt6XxI4jykBo5svAZHken3tf\nQyLKx6zxSQfgdk7ULmK8pAbDmw3HMKdjErS9gnRpQXJU9oWP8ukxo3NyTY0tCUrm\ngxYJg4nLQQKBgHqSsZNbRHidcDXCUszKVBCQOIlOroebl1/RvsL41XCnrYhHU3Hx\nYajLMDP6J1tyQtHNXwp77wN1ElC17D4AtdQxlOq3KlVw1MLnNB6K5qPZj80aba+u\nr8Nen/SFPoI1eEFqCQbnUAPHTdz5dzErJ5Uo0omgjEg9CVUTh6hkTn2vAoGAK3AJ\nGdXrm8VmGLDUdwNP6/dd7696wXz3ESj5H9NBl1qY3x7oYxVwKJ2w/ghDHLWwOO1L\naB+N18YmU52xYSd/gktkr83H5pWNVTzbkW1LYZPaXM2Nd+fASyY/gFc1ZONCe6lz\ndE6GQ0mG9B8M2LlHChFKI4QhBb/SbUkEZPdVR0ECgYBHgTJA1meIUgrapx6X+SXj\npLM5eQ+FhlD92CVe9r1JZW65zkMxjy2LG6587Oqoi4KRRSwy+o/LZrSuuaXKqdxX\n3dy89C0t55RFHiWaoqmXbG4SFnQ3r3e2BQMsEiyRHrACb9bzoSsYMV9LN/Cnj8rg\niuA7+/TjjKTwZ7jaRwWrsg==\n-----END PRIVATE KEY-----\n",
    client_email: "nymbus-vips@nymbus-vips.iam.gserviceaccount.com",
    client_id: "102506474609318836645",
    auth_uri: "https://accounts.google.com/o/oauth2/auth",
    token_uri: "https://oauth2.googleapis.com/token",
    auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
    client_x509_cert_url:
        "https://www.googleapis.com/robot/v1/metadata/x509/nymbus-vips%40nymbus-vips.iam.gserviceaccount.com",
    universe_domain: "googleapis.com",
};

// Define the API response structure based on the provided API
interface ApiResponse {
    result: string;
    message: {
        period: string;
        data: {
            campaignName: string;
            startDate: string;
            totalAmount: number;
            initialSales: number;
            declined: number;
            declinePerc: number;
            partial: number;
            avgTicket: number;
            rebillRevenue: number;
            rebillApproval: number;
            rebillDeclines: number;
            rebillApprovedPerc: number;
            rebillDeclinedPerc: number;
            rebillRefundRev: number;
            billableRebillRev: number;
            refundedAmount: number;
            frontendRefundPerc: number;
            rebillRefundPerc: number;
            chargebackCnt: number;
            totalInitialVip: number;
            vipDeclined: number;
            creditCardVip: number;
            ccOptVip: number;
            creditCard: number;
            payPal: number;
            payPalVip: number;
            ppOptVip: number;
            totalOptPPCC: number;
            vipTotal: number;
            vipRecycleRebill: number;
        };
    }[][]; // message is an array of arrays of period/data objects
}

interface SheetDetails {
    sheetId: string;
    sheetName: string;
}

// Function to determine filter from period
function getFilterFromPeriod(period: string): string {
    const today = new Date().toLocaleDateString("en-US");
    const [start, end] = period.split(" - ");
    if (start === end && start === today) return "Yesterday"; // This need to be modify
    const daysDiff = Math.floor((new Date(end).getTime() - new Date(start).getTime()) / (1000 * 60 * 60 * 24)) + 1;
    if (daysDiff === 7) return "Last 7 days";
    if (daysDiff === 30) return "Last 30 days";
    return "Yesterday"; // Default case
}

// Function to write data to Google Sheets
async function writeToSheet(
    values: (string | number)[][],
    spreadsheetID: string,
    range: string,
    auth: GoogleAuth<JSONClient> | JWT
): Promise<sheets_v4.Schema$AppendValuesResponse> {
    const sheets = google.sheets({ version: "v4", auth });
    try {
        // console.log("Values", JSON.stringify(values, null, 2));
        const response = await sheets.spreadsheets.values.append({
            spreadsheetId: spreadsheetID,
            range,
            valueInputOption: "USER_ENTERED",
            requestBody: { values },
        });
        return response.data;
    } catch (error) {
        console.error("Error appending data to Google Sheets:", error);
        throw new Error("Error appending data to Google Sheets");
    }
}

// Main API handler
export async function POST(req: NextRequest): Promise<NextResponse> {
    const requestId = Math.random().toString(36).substring(2, 15);
    console.log(`[${requestId}] Received POST request to ${req.url}`);

    try {
        // Parse the request body
        const body = await req.json();
        const { sheetDetails, apiResponse }: { sheetDetails: SheetDetails; apiResponse: ApiResponse } = body;

        if (!sheetDetails?.sheetId || !sheetDetails?.sheetName || !apiResponse) {
            return NextResponse.json(
                { success: false, error: "Missing sheetDetails or apiResponse" },
                { status: 400 }
            );
        }

        const auth = new GoogleAuth({
            credentials: googleJSON,
            scopes: ["https://www.googleapis.com/auth/spreadsheets"],
        });

        const sheets = google.sheets({ version: "v4", auth });
        let sheetResponse = await sheets.spreadsheets.get({
            spreadsheetId: sheetDetails.sheetId,
        });
        let sheet = sheetResponse.data.sheets?.find(s => s.properties?.title === sheetDetails.sheetName);

        // Initialize sheet if it doesn't exist
        if (!sheet) {
            await sheets.spreadsheets.batchUpdate({
                spreadsheetId: sheetDetails.sheetId,
                requestBody: {
                    requests: [{
                        addSheet: {
                            properties: {
                                title: sheetDetails.sheetName,
                            },
                        },
                    }],
                },
            });
            sheetResponse = await sheets.spreadsheets.get({
                spreadsheetId: sheetDetails.sheetId,
            });
            sheet = sheetResponse.data.sheets?.find(s => s.properties?.title === sheetDetails.sheetName);

            // Set headers
            await sheets.spreadsheets.values.update({
                spreadsheetId: sheetDetails.sheetId,
                range: `${sheetDetails.sheetName}!A1:M1`,
                valueInputOption: "USER_ENTERED",
                requestBody: {
                    values: [["Partner", "Brand", "Filter", "Sales Total", "Initial Sales", "Declines",
                        "Decline % of Initial Sales", "Partials", "AVG Ticket", "Rebill Revenue",
                        "RB Approval", "% Rebill Refunds", "Billable Rebill Revenue"]],
                },
            });
        }

        const partner = "Nymbus";
        const valuesToWrite: (string | number)[][] = [];

        // Process each campaign's array of periods
        for (const campaignPeriods of apiResponse.message) {
            for (const periodObj of campaignPeriods) {
                const filter = getFilterFromPeriod(periodObj.period);
                const brandData = periodObj.data;

                const row: (string | number)[] = [
                    partner,
                    brandData.campaignName,
                    filter,
                    brandData.totalAmount,
                    brandData.initialSales,
                    brandData.declined,
                    brandData.declinePerc,
                    brandData.partial,
                    brandData.avgTicket,
                    brandData.rebillRevenue,
                    brandData.rebillApproval,
                    brandData.rebillDeclines,
                    brandData.rebillApprovedPerc,
                    brandData.rebillDeclinedPerc,
                    brandData.rebillRefundRev,
                    brandData.billableRebillRev,
                    brandData.refundedAmount,
                    brandData.frontendRefundPerc,
                    brandData.rebillRefundPerc,
                    brandData.chargebackCnt,
                    brandData.totalInitialVip,
                    brandData.vipDeclined,
                    brandData.creditCardVip,
                    brandData.ccOptVip,
                    brandData.creditCard,
                    brandData.payPal,
                    brandData.payPalVip,
                    brandData.ppOptVip,
                    brandData.totalOptPPCC,
                    brandData.vipTotal,
                    brandData.vipRecycleRebill
                ];

                // Check for existing row
                const existingData = await sheets.spreadsheets.values.get({
                    spreadsheetId: sheetDetails.sheetId,
                    range: `${sheetDetails.sheetName}!A2:AG1000`, // Adjust range as needed
                });
                const existingRows = existingData.data.values || [];
                const existingRowIndex = existingRows.findIndex((rowData: (string | number)[]) =>
                    rowData[0] === partner && rowData[1] === brandData.campaignName && rowData[2] === filter
                );

                if (existingRowIndex !== -1) {
                    // console.log("Values", JSON.stringify(row, null, 2));
                    await sheets.spreadsheets.values.update({
                        spreadsheetId: sheetDetails.sheetId,
                        range: `${sheetDetails.sheetName}!A${existingRowIndex + 2}:AG${existingRowIndex + 2}`,
                        valueInputOption: "USER_ENTERED",
                        requestBody: { values: [row] },
                    });
                    console.log(`[${requestId}] Updated row for ${brandData.campaignName} - ${filter}`);
                } else {
                    valuesToWrite.push(row);
                    console.log(`[${requestId}] Prepared new row for ${brandData.campaignName} - ${filter}`);
                }
            }
        }

        if (valuesToWrite.length > 0) {
            // console.log("Writing new rows to Google Sheets:", valuesToWrite);
            await writeToSheet(valuesToWrite, sheetDetails.sheetId, `${sheetDetails.sheetName}!A:A`, auth);
            console.log(`[${requestId}] Appended ${valuesToWrite.length} new rows`);
        }

        return NextResponse.json({ success: true, message: "Data logged successfully" }, { status: 200 });
    } catch (error) {
        console.error(`[${requestId}] Error in POST handler:`, error instanceof Error ? error.message : error);
        return NextResponse.json(
            { success: false, error: error instanceof Error ? error.message : "Unknown error" },
            { status: 500 }
        );
    }
}