// Function to initialize the game with a redirect URL
export function initGameWithRedirect(gameController, redirectUrl) {
  if (gameController) {
    gameController.setRedirectUrl(redirectUrl);

    gameController.initializeGameWithApi();
  }
}

// Example usage:
// const gameController = new GameController(...);
// initGameWithRedirect(gameController, "https://your-redirect-url.com");
