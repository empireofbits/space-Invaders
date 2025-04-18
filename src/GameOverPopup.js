import {
  AdvancedDynamicTexture,
  Rectangle,
  TextBlock,
  Button,
  Control,
} from "@babylonjs/gui";
import State from "./State";

export class GameOverPopup {
  constructor(scene, onRedirect) {
    this.scene = scene;
    this.onRedirect = onRedirect;
    this.isVisible = false;
    this.createPopup();
  }

  createPopup() {
    // Create fullscreen UI
    this.advancedTexture =
      AdvancedDynamicTexture.CreateFullscreenUI("CustomGameOverUI");

    // Create background rectangle
    this.background = new Rectangle("gameOverBg");
    this.background.width = "450px";
    this.background.height = "350px";
    this.background.cornerRadius = 20;
    this.background.color = "#4CAF50";
    this.background.thickness = 4;
    this.background.background = "#222222";
    this.background.alpha = 0.95;
    this.background.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
    this.advancedTexture.addControl(this.background);

    // Game over text
    this.gameOverText = new TextBlock("gameOverText");
    this.gameOverText.text = "GAME SUMMARY";
    this.gameOverText.color = "#4CAF50";
    this.gameOverText.fontSize = 32;
    this.gameOverText.fontWeight = "bold";
    this.gameOverText.top = "-120px";
    this.background.addControl(this.gameOverText);

    // Score text
    this.scoreText = new TextBlock("scoreText");
    this.scoreText.text = `Final Score: ${State.score}`;
    this.scoreText.color = "white";
    this.scoreText.fontSize = 28;
    this.scoreText.top = "-60px";
    this.background.addControl(this.scoreText);

    // Level text
    this.levelText = new TextBlock("levelText");
    this.levelText.text = `Level Reached: ${State.level}`;
    this.levelText.color = "white";
    this.levelText.fontSize = 22;
    this.levelText.top = "-20px";
    this.background.addControl(this.levelText);

    // Points earned text
    this.pointsText = new TextBlock("pointsText");
    this.pointsText.text = "Points earned: Calculating...";
    this.pointsText.color = "#FFD700";
    this.pointsText.fontSize = 24;
    this.pointsText.top = "20px";
    this.background.addControl(this.pointsText);

    // Redirect message
    this.redirectText = new TextBlock("redirectText");
    this.redirectText.text = "Returning to dashboard in 5 seconds...";
    this.redirectText.color = "#CCCCCC";
    this.redirectText.fontSize = 18;
    this.redirectText.top = "60px";
    this.background.addControl(this.redirectText);

    // Redirect button
    this.redirectButton = Button.CreateSimpleButton(
      "redirectButton",
      "Return to Dashboard"
    );
    this.redirectButton.width = "220px";
    this.redirectButton.height = "50px";
    this.redirectButton.color = "white";
    this.redirectButton.fontSize = 18;
    this.redirectButton.background = "#4CAF50";
    this.redirectButton.cornerRadius = 10;
    this.redirectButton.top = "110px";
    this.redirectButton.onPointerUpObservable.add(() => {
      if (this.onRedirect) {
        this.onRedirect();
      }
    });
    this.background.addControl(this.redirectButton);

    // Hide the popup initially
    this.hide();
  }

  updatePointsEarned(pointsEarned) {
    if (this.pointsText) {
      this.pointsText.text = `Points earned: ${pointsEarned}`;
    }
  }

  updateRedirectCountdown(seconds) {
    if (this.redirectText) {
      this.redirectText.text = `Returning to dashboard in ${seconds} seconds...`;
    }
  }

  show(score, level) {
    this.scoreText.text = `Final Score: ${score}`;
    this.levelText.text = `Level Reached: ${level}`;
    this.background.isVisible = true;
    this.isVisible = true;
  }

  hide() {
    this.background.isVisible = false;
    this.isVisible = false;
  }

  dispose() {
    this.advancedTexture.dispose();
  }
}
