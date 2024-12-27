// app/api/google-sheets/route.ts
import { google, sheets_v4 } from "googleapis";

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

// Type for the request body structure
interface RequestBody {
    sheetDetails: {
        sheetId: string;
        sheetName: string;
    };
    values: any[]; // Can be more specific based on the data you expect
}

// Function to write data to Google Sheets
async function writeToSheet(
    values: any[],
    spreadsheetID: string,
    range: string,
    auth: any
): Promise<sheets_v4.Schema$AppendValuesResponse | void> {
    const sheets = google.sheets({ version: "v4", auth });
    
    try {
        const response = await sheets.spreadsheets.values.append({
            spreadsheetId: spreadsheetID,
            range: range,
            valueInputOption: "USER_ENTERED", // or "RAW" depending on how you want to format the data
            requestBody: { values }, // Pass values directly in the requestBody
        });

        return response.data; // The response data is what you want to return
    } catch (error) {
        console.error("Error appending data to Google Sheets:", error);
        throw new Error("Error appending data to Google Sheets");
    }
}

// Export POST handler
export async function POST(req: Request): Promise<Response> {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");
    const body: RequestBody = await req.json();
    const spreadsheetID = body.sheetDetails.sheetId;
    const sheetName = body.sheetDetails.sheetName;

    const auth = new google.auth.GoogleAuth({
        credentials: googleJSON,
        scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    try {
        const response = await writeToSheet(
            [body.values], // Pass the actual values here (not wrapped in an array)
            spreadsheetID,
            `${sheetName}!A:A`, // Specify the range correctly
            auth
        );

        return new Response(
            JSON.stringify({ success: true, data: response }),
            { status: 200 }
        );
    } catch (error) {
        console.error("Error in POST handler:", error);
        return new Response(
            JSON.stringify({ success: false, error: error }),
            { status: 500 }
        );
    }
}
