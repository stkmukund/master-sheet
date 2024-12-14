
export async function GET(request: Request) {
    // Example of making an external GET request (if needed)
    // You can use fetch or any other HTTP client to fetch data
    // const response = await fetch('https://api.example.com/data');
    // const data = await response.json();

    // Return the response data
    return new Response(JSON.stringify("data"), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
    });
}
