import { Boot } from "./scenes/Boot";
import { GameOver } from "./scenes/GameOver";
import { Game as MainGame } from "./scenes/Game";
import { MainMenu } from "./scenes/MainMenu";
import { AUTO, Game } from "phaser";
import { Preloader } from "./scenes/Preloader";
import { TacticalBattle } from "./scenes/TacticalBattle";

// Find out more information about the Game Config at:
// https://docs.phaser.io/api-documentation/typedef/types-core#gameconfig
const config: Phaser.Types.Core.GameConfig = {
    type: AUTO,
    width: 1470,
    height: 956,
    parent: "game-container",
    backgroundColor: "#000000",
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: 1470,
        height: 956,
        min: {
            width: 800,
            height: 600,
        },
    },
    scene: [Boot, Preloader, MainMenu, MainGame, GameOver, TacticalBattle],
};

const StartGame = (parent: string) => {
    return new Game({ ...config, parent });
};

export default StartGame;
