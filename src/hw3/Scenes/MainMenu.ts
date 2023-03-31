import Vec2 from "../../Wolfie2D/DataTypes/Vec2";
import { GameEventType } from "../../Wolfie2D/Events/GameEventType";
import Button from "../../Wolfie2D/Nodes/UIElements/Button";
import { UIElementType } from "../../Wolfie2D/Nodes/UIElements/UIElementTypes";
import Scene from "../../Wolfie2D/Scene/Scene";
import Sprite from "../../Wolfie2D/Nodes/Sprites/Sprite";
import Color from "../../Wolfie2D/Utils/Color";
import Layer from "../../Wolfie2D/Scene/Layer";
import Level1 from "./HW3Level1";


// Layers for the main menu scene
export const MenuLayers = {
    MAIN: "MAIN",
    LEVELSELECT: "LEVELSELECT",
    CONTROLS: "CONTROLS",
    ABOUT: "ABOUT"
} as const;

export default class MainMenu extends Scene {

    public static readonly MUSIC_KEY = "MAIN_MENU_MUSIC";
    public static readonly MUSIC_PATH = "hw4_assets/music/menu.mp3";
    public static readonly LOGO_KEY = "MAIN_MENU_LOGO";
    public static readonly LOGO_PATH = "hw4_assets/Logo.png";
    public static readonly CHRONO_KEY = "CHRONO";
    public static readonly CHRONO_PATH = "hw4_assets/Chrono.png";
    public static readonly SWITCH_KEY = "SWITCH";
    public static readonly SWITCH_PATH = "hw4_assets/Switch.png";
    public static readonly BACKGROUND_KEY = "MAIN_MENU_BACKGROUND";
    public static readonly BACKGROUND_PATH = "hw4_assets/Background.png";
    private mainMenu: Layer;
    private controls: Layer;
    private levelSelect: Layer;
    private about: Layer;
    private logo: Sprite;
    private chrono: Sprite;
    private switch: Sprite;

    public loadScene(): void {
        // Load the menu song
        this.load.image(MainMenu.LOGO_KEY, MainMenu.LOGO_PATH);
        this.load.image(MainMenu.CHRONO_KEY, MainMenu.CHRONO_PATH);
        this.load.image(MainMenu.SWITCH_KEY, MainMenu.SWITCH_PATH);
        this.load.image(MainMenu.BACKGROUND_KEY, MainMenu.BACKGROUND_PATH);
        this.load.audio(MainMenu.MUSIC_KEY, MainMenu.MUSIC_PATH);
    }

    public startScene(): void {
        this.mainMenu = this.addUILayer(MenuLayers.MAIN);

        this.controls = this.addUILayer(MenuLayers.CONTROLS);
        this.controls.setHidden(true);

        this.levelSelect = this.addUILayer(MenuLayers.LEVELSELECT);
        this.levelSelect.setHidden(true);

        this.about = this.addUILayer(MenuLayers.ABOUT);
        this.about.setHidden(true);

        // Center the viewport
        let size = this.viewport.getHalfSize();
        this.viewport.setFocus(size);
        this.viewport.setZoomLevel(1);

        // Background
        for (const scene of [MenuLayers.MAIN, MenuLayers.CONTROLS, MenuLayers.ABOUT, MenuLayers.LEVELSELECT]) {
            const background = this.add.sprite(MainMenu.BACKGROUND_KEY, scene);
            background.position.set(size.x, size.y);
            background.scale.set(0.7, 0.7);
        }

        // Logo stuff
        this.chrono = this.add.sprite(MainMenu.CHRONO_KEY, MenuLayers.MAIN);
        this.chrono.position.set(size.x - 355, size.y - 220);
        this.chrono.scale.set(0.65, 0.65);
        this.switch = this.add.sprite(MainMenu.SWITCH_KEY, MenuLayers.MAIN);
        this.switch.position.set(size.x + 355, size.y - 220);
        this.switch.scale.set(0.65, 0.65);

        const defaultProperties = { backgroundColor: Color.WHITE, borderColor: Color.WHITE, textColor: Color.BLACK, borderRadius: 10, font: "MyFont" }

        {   /* Main Menu */
            // Create a play button
            let playBtn = <Button>this.add.uiElement(UIElementType.BUTTON, MenuLayers.MAIN, {position: new Vec2(size.x, size.y+10), text: "PLAY"});
            Object.assign(playBtn, defaultProperties);
            playBtn.size = new Vec2(240, 80);
            playBtn.fontSize = 42;
            playBtn.setPadding(new Vec2(50, 15));

            // Create a LevelSelect button
            let levelSelect = <Button>this.add.uiElement(UIElementType.BUTTON, MenuLayers.MAIN, { position: new Vec2(size.x, size.y + 90), text: "LEVELS" });
            Object.assign(levelSelect, defaultProperties);
            levelSelect.size = new Vec2(185, 55);
            levelSelect.fontSize = 30;
            levelSelect.setPadding(new Vec2(50, 15));

            // Create a controls button
            let controls = <Button>this.add.uiElement(UIElementType.BUTTON, MenuLayers.MAIN, { position: new Vec2(size.x - 130, size.y + 160), text: "CONTROLS" });
            Object.assign(controls, defaultProperties);
            controls.size = new Vec2(205, 55);
            controls.fontSize = 30;
            controls.setPadding(new Vec2(50, 15));

            // Create an about button
            let about = <Button>this.add.uiElement(UIElementType.BUTTON, MenuLayers.MAIN, { position: new Vec2(size.x + 130, size.y + 160), text: "ABOUT" });
            Object.assign(about, defaultProperties);
            about.size = new Vec2(205, 55);
            about.fontSize = 30;
            about.setPadding(new Vec2(50, 15));
            // When the play button is clicked, go to the next scene

            playBtn.onClick = () => {
                this.sceneManager.changeToScene(Level1);
            }
            levelSelect.onClick = () => {
                this.mainMenu.setHidden(true);
                this.levelSelect.setHidden(false);
            }
            controls.onClick = () => {
                this.mainMenu.setHidden(true);
                this.controls.setHidden(false);
            }
            about.onClick = () => {
                this.mainMenu.setHidden(true);
                this.about.setHidden(false);
            }
        }

        // Scene has started, so start playing music
        this.emitter.fireEvent(GameEventType.PLAY_SOUND, {key: MainMenu.MUSIC_KEY, loop: true, holdReference: true});
    }

    public unloadScene(): void {
        // The scene is being destroyed, so we can stop playing the song
        this.emitter.fireEvent(GameEventType.STOP_SOUND, {key: MainMenu.MUSIC_KEY});
    }
}

