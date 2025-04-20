export class ApiService {
  // Extract userId from the URL query parameters (e.g. ?query=wallet-address-here)
  static getUserIdFromUrl() {
    const params = new URLSearchParams(window.location.search);
    console.log(params);
    const userId = params.get("query");

    console.log("Extracted userId:", userId); // Debugging line
    return userId;
  }

  // Initialize the game
  static async initializeGame() {
    const userId = this.getUserIdFromUrl();

    if (!userId) {
      console.error("User ID not found in URL");
      return { success: false, error: "User ID not found" };
    }

    try {
      const response = await fetch(
        "https://backend1.empireofbits.fun/api/v1/games/spaceinvaders",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ userId }),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to initialize game: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error initializing game:", error);
      return { success: false, error: error.message };
    }
  }

  // Record a game session
  static async recordGameSession(score, level = 1) {
    const userId = this.getUserIdFromUrl();

    if (!userId) {
      console.error("User ID not found in URL");
      return { success: false, error: "User ID not found" };
    }

    try {
      const response = await fetch(
        `https://backend1.empireofbits.fun/api/v1/games/spaceinvaders/${userId}/session`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            score,
            level,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(
          `Failed to record game session: ${response.statusText}`
        );
      }

      return await response.json();
    } catch (error) {
      console.error("Error recording game session:", error);
      return { success: false, error: error.message };
    }
  }
}
