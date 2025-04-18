export class ScoreService {
  static async submitScore(score) {
    try {
      // Replace with your actual API endpoint
      const response = await fetch("/api/submit-score", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ score }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit score");
      }

      return await response.json();
    } catch (error) {
      console.error("Error submitting score:", error);
      return { success: false, error: error.message };
    }
  }
}
