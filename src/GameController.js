import { AlienFormationController } from "./AlienFormationController";
import State from "./State";
import { PlayerController } from "./PlayerController";
import config from "../spaceinvaders.config";
import { Color3 } from "@babylonjs/core";
import { GameGUI } from "./GameGUI";

import { ScoreService } from "./ScoreService";
import { GameOverPopup } from "./GameOverPopup";
import { ApiService } from "./ApiService";

export class GameController {
  constructor(environment, inputController, gameAssets = null, UI) {
    this.UI = UI;
    this.environment = environment;
    this.scene = environment.scene;
    this.inputController = inputController;
    this.gameAssets = gameAssets;
    this.playerController = new PlayerController(environment, this.gameAssets);
    this.redirectUrl = "http://localhost:3000";
    this.gameInitialized = false;
  }

  initialise() {
    State.lives = config.startingLives;
    State.level = config.startingLevel;
    State.score = 0;
    State.highScore = this.getHighScore();
    State.gameOverStep = 0;
    State.gameOverStep = 0;

    if (!this.gameInitialized) {
      this.initializeGameWithApi();
    }
  }

  async initializeGameWithApi() {
    try {
      const result = await ApiService.initializeGame();
      console.log(result);
      if (result.success) {
        console.log("Game initialized successfully:", result.data);
        this.gameInitialized = true;
      } else {
        console.error("Failed to initialize game:", result.error);
      }
    } catch (error) {
      console.error("Error initializing game:", error);
    }
  }

  setHighScore(score) {
    window.localStorage.setItem("highScore", score);
    State.highScore = score;
  }

  getHighScore() {
    return parseInt(window.localStorage.getItem("highScore") ?? 0);
  }

  startGame() {
    //this.fullScreen();
    this.initialise();
    this.nextLevel();
    this.loadGameGUI();
  }

  loadGameGUI() {
    this.UI.disable();
    this.gameGUI = new GameGUI();
    this.playerController.mobileInputs.enable(this.gameGUI.texture);
  }

  fullScreen() {
    if (
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      )
    ) {
      let el = document.documentElement;
      if (el.requestFullscreen) {
        el.requestFullscreen();
      } else if (el.webkitRequestFullscreen) {
        /* Safari */
        el.webkitRequestFullscreen();
      } else if (el.msRequestFullscreen) {
        /* IE11 */
        el.msRequestFullscreen();
      }
    }
  }

  titleScreen() {
    this.UI.showTitleScreen();
    this.UI.hideLoadingScreen();
  }

  nextLevel() {
    State.level += 1;
    this.playerController.movementEnabled = false;
    this.buildAliensFormation();
    this.playerController.initPlayer();
    State.state = "GAMELOOP";
    this.gameAssets.sounds.levelStart.play();
  }

  checkStates() {
    this.playerController.actionCam();
    if (this.alienFormation.alienCount === 0) {
      State.state = "PLAYERWINS";
      this.playerController.disableMovement();
      setTimeout(() => {
        State.state = "CLEARLEVEL";
        this.gameAssets.sounds.clearLevel.play();
        this.UI.showGameUI();
        this.UI.showGameHints();
      }, 1500);
    }
    this.gameGUI.update();
  }

  aliensWin() {
    State.lives = 0;
    this.playerController.playerMesh.dispose();
  }

  setRedirectUrl(url) {
    this.redirectUrl = url;
  }

  gameOver() {
    switch (State.gameOverStep) {
      case 0:
        this.UI.showGameUI();

        // Show the original game over screen first
        setTimeout(() => {
          this.UI.showGameOver();
          this.checkForNewHighScore();
          this.gameAssets.sounds.gameOver.play();

          // Record the game session with the API
          this.recordGameSession();

          // Move to the next step after showing the original game over screen
          setTimeout(() => {
            State.gameOverStep = 5; // New step for our custom popup
          }, 3000); // Show original game over for 3 seconds
        }, 2000);

        // Still show the play again button as in the original
        setTimeout(() => {
          this.UI.showPlayAgain();
          State.gameOverStep = 1;
        }, 4000);

        State.gameOverStep = 1;
        break;

      case 1:
        // Wait for the timeout to move to step 5 or for play again to be pressed
        break;

      case 2:
        if (this.UI.playAgainPressed) {
          // Clear the redirect timeout if the user chooses to play again
          if (this.redirectTimeout) {
            clearTimeout(this.redirectTimeout);
          }

          // Dispose of the popup if it exists
          if (this.gameOverPopup) {
            this.gameOverPopup.dispose();
            this.gameOverPopup = null;
          }

          this.destroyGameGUI();
          this.UI.hideGameOver();
          this.UI.hidePlayAgain();
          this.UI.hideNewHighScore();
          State.gameOverStep = 3;
          this.gameAssets.sounds.clearLevel.play();
        }
        break;

      case 3:
        this.clearLevel();
        break;

      case 4:
        State.state = "TITLESCREEN";
        break;

      case 5: // New step for our custom popup
        // Create and show our custom game over popup
        if (!this.gameOverPopup) {
          this.gameOverPopup = new GameOverPopup(this.scene, () => {
            // Redirect to the specified URL
            window.location.href = this.redirectUrl;
          });

          this.gameOverPopup.show(State.score, State.level);

          // Start countdown for redirect
          let secondsLeft = 5;
          this.gameOverPopup.updateRedirectCountdown(secondsLeft);

          this.countdownInterval = setInterval(() => {
            secondsLeft--;
            if (secondsLeft <= 0) {
              clearInterval(this.countdownInterval);
              window.location.href =
                this.redirectUrl +
                `?pointsEarned=${State.score}&gameWon=true&gameName=spaceinvaders`;
            } else {
              this.gameOverPopup.updateRedirectCountdown(secondsLeft);
            }
          }, 1000);
        }
        break;

      default:
        break;
    }
  }

  async recordGameSession() {
    try {
      const result = await ApiService.recordGameSession(
        State.score,
        State.level
      );
      if (result.success) {
        console.log("Game session recorded successfully:", result.data);

        // If we have a popup, update it with the points earned
        if (this.gameOverPopup) {
          this.gameOverPopup.updatePointsEarned(
            result.pointsEarned || State.score
          );
        }
      } else {
        console.error("Failed to record game session:", result.error);
      }
    } catch (error) {
      console.error("Error recording game session:", error);
    }
  }

  destroyGameGUI() {
    this.gameGUI.texture.dispose();
    delete this.gameGUI.texture;
  }

  checkForNewHighScore() {
    if (State.score > this.getHighScore()) {
      this.setHighScore(State.score);
      this.UI.showNewHighScore();
      this.gameGUI.update();
    }
  }

  buildAliensFormation() {
    this.alienFormation = new AlienFormationController(
      this.scene,
      this.gameAssets
    );
  }

  clearLevel() {
    // Clear any intervals or timeouts
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }

    if (this.redirectTimeout) {
      clearTimeout(this.redirectTimeout);
    }

    // Dispose of the popup if it exists
    if (this.gameOverPopup) {
      this.gameOverPopup.dispose();
      this.gameOverPopup = null;
    }

    let clearSteps = 4;
    this.playerController.actionCam(0);
    this.gameGUI.update();
    // Step 1. All barriers must be destroyed.
    if (this.alienFormation.barriers.length) {
      this.alienFormation.destroyBarriers();
      clearSteps -= 1;
    }
    //Step 2. The player should be moved off-screen.
    this.playerController.disableMovement();
    if (this.playerController.moveOffScreen()) {
      clearSteps -= 1;
    }
    // Step 3. Move the mothership offscreen.
    if (this.alienFormation.motherShip.moveOffScreen()) {
      clearSteps -= 1;
    }
    // Step 4. Destroy remaining alien bullets.
    // Step 5. Destroy remaining aliens
    if (this.alienFormation.aliens.length) {
      const randID = Math.floor(
        Math.random() * this.alienFormation.aliens.length
      );
      this.alienFormation.aliens[randID].mesh.dispose();
      this.alienFormation.aliens.splice(randID, 1);
      clearSteps -= 1;
    }

    if (clearSteps === 4) {
      this.playerController.destroyPlayer();
      this.alienFormation.motherShip.destroyMotherShip();
      this.alienFormation.clearScene();
      delete this.alienFormation;
      // final cleanup to ensure everything has been disposed of.
      while (this.scene.meshes.length) {
        this.scene.meshes[0].dispose();
      }
      if (State.state === "GAMEOVER") {
        State.gameOverStep += 1;
      } else {
        State.state = "NEXTLEVEL";
      }
      this.UI.hideGameHints();
      this.UI.hideGameUI();
      this.UI.disable();
    }
  }
}
