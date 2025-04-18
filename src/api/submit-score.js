// This would typically be in your server-side code
// For Next.js, this would be in pages/api/submit-score.js or app/api/submit-score/route.js

export async function POST(request) {
  try {
    const { score } = await request.json();

    // Here you would typically save the score to your database
    console.log(`Received score: ${score}`);

    // For demonstration, we're just returning a success response
    return new Response(
      JSON.stringify({
        success: true,
        message: "Score submitted successfully",
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Error processing score submission:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: "Failed to process score submission",
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
}
