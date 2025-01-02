export interface ApiHandlerParams {
    endpoint: string; // API endpoint path after `/api/`
    queryParams?: Record<string, string | number | boolean>; // Optional query parameters
    method?: "GET" | "POST" | "PUT" | "DELETE"; // HTTP methods
    body?: Record<string, any> | null; // Optional body for POST/PUT requests
}

export async function apiHandler<T>({
    endpoint,
    queryParams = {},
    method = "GET",
    body = null,
}: ApiHandlerParams): Promise<T> {
    try {
        // Construct the query string from queryParams
        const queryString = new URLSearchParams(
            queryParams as Record<string, string>
        ).toString();

        // Construct the full URL 
        const url = `/api/${endpoint}${queryString ? `?${queryString}` : ""}`;

        // Set up fetch options
        const options: RequestInit = {
            method,
            headers: {
                "Content-Type": "application/json",
            },
        };

        if (body && method !== "GET") {
            options.body = JSON.stringify(body);
        }

        // Make the fetch request
        const response = await fetch(url, options);

        // Parse the response as JSON
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "Failed to fetch data");
        }

        const data: T = await response.json();
        return data;
    } catch (error: any) {
        console.error("API Handler Error:", error.message);
        throw error; // Re-throw the error so it can be handled by the caller
    }
}
