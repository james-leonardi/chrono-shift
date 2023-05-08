import Vec2 from "../../Wolfie2D/DataTypes/Vec2";
import { GameEventType } from "../../Wolfie2D/Events/GameEventType";
import Button from "../../Wolfie2D/Nodes/UIElements/Button";
import Label from "../../Wolfie2D/Nodes/UIElements/Label";
import { UIElementType } from "../../Wolfie2D/Nodes/UIElements/UIElementTypes";
import Scene from "../../Wolfie2D/Scene/Scene";
import Sprite from "../../Wolfie2D/Nodes/Sprites/Sprite";
import Color from "../../Wolfie2D/Utils/Color";
import Layer from "../../Wolfie2D/Scene/Layer";
import Level1 from "./HW3Level1";
import Level2 from "./HW3Level2";
import Level3 from "./HW3Level3";
import Level4 from "./HW3Level4";
import Level5 from "./HW3Level5";
import Level6 from "./HW3Level6";
import HW3Level from "./HW3Level";


// Layers for the main menu scene
export const MenuLayers = {
    SPLASH: "SPLASH",
    MAIN: "MAIN",
    LEVELSELECT: "LEVELSELECT",
    CONTROLS: "CONTROLS",
    ABOUT: "ABOUT"
} as const;

export default class MainMenu extends Scene {

    public static readonly MUSIC_KEY = "MAIN_MENU_MUSIC";
    public static readonly MUSIC_PATH = "hw4_assets/music/menu.mp3";
    public static readonly SPLASH_KEY = "SPLASH";
    public static readonly SPLASH_PATH = "hw4_assets/Splash.png";
    public static readonly LOGO_KEY = "MAIN_MENU_LOGO";
    public static readonly LOGO_PATH = "hw4_assets/Logo.png";
    public static readonly CHRONO_KEY = "CHRONO";
    public static readonly CHRONO_PATH = "hw4_assets/Chrono.png";
    public static readonly SWITCH_KEY = "SWITCH";
    public static readonly SWITCH_PATH = "hw4_assets/Switch.png";
    public static readonly BACKGROUND_KEY = "MAIN_MENU_BACKGROUND";
    public static readonly BACKGROUND_PATH = "hw4_assets/Background.png";
    public static readonly CONTROLS_KEY = "CONTROLS";
    public static readonly CONTROLS_PATH = "hw4_assets/Controls.png";

    // Unlocked versions
    public static readonly L1PREVIEW_KEY = "L1PREVIEW";
    public static readonly L1PREVIEW_PATH = "hw4_assets/tilemaps/L1Preview.jpg";
    public static readonly L2PREVIEW_KEY = "L2PREVIEW";
    public static readonly L2PREVIEW_PATH = "hw4_assets/tilemaps/L2Preview.jpg";
    public static readonly L3PREVIEW_KEY = "L3PREVIEW";
    public static readonly L3PREVIEW_PATH = "hw4_assets/tilemaps/L3Preview.jpg";
    public static readonly L4PREVIEW_KEY = "L4PREVIEW";
    public static readonly L4PREVIEW_PATH = "hw4_assets/tilemaps/L4Preview.jpg";
    public static readonly L5PREVIEW_KEY = "L5PREVIEW";
    public static readonly L5PREVIEW_PATH = "hw4_assets/tilemaps/L5Preview.jpg";
    public static readonly L6PREVIEW_KEY = "L6PREVIEW";
    public static readonly L6PREVIEW_PATH = "hw4_assets/tilemaps/L6Preview.jpg";
    // Locked versions
    public static readonly L1LOCK_KEY = "L1LOCK";
    public static readonly L1LOCK_PATH = "hw4_assets/tilemaps/L1Lock.png";
    public static readonly L2LOCK_KEY = "L2LOCK";
    public static readonly L2LOCK_PATH = "hw4_assets/tilemaps/L2Lock.png";
    public static readonly L3LOCK_KEY = "L3LOCK";
    public static readonly L3LOCK_PATH = "hw4_assets/tilemaps/L3Lock.png";
    public static readonly L4LOCK_KEY = "L4LOCK";
    public static readonly L4LOCK_PATH = "hw4_assets/tilemaps/L4Lock.png";
    public static readonly L5LOCK_KEY = "L5LOCK";
    public static readonly L5LOCK_PATH = "hw4_assets/tilemaps/L5Lock.png";
    public static readonly L6LOCK_KEY = "L6LOCK";
    public static readonly L6LOCK_PATH = "hw4_assets/tilemaps/L6Lock.png";

    private mainMenu: Layer;
    private splash: Layer;
    private controls: Layer;
    private levelSelect: Layer;
    private about: Layer;
    private logo: Sprite;
    private chrono: Sprite;
    private switch: Sprite;

    private lastClick: Date = new Date();

    public loadScene(): void {
        // Load the menu song
        this.load.image(MainMenu.SPLASH_KEY, MainMenu.SPLASH_PATH);
        this.load.image(MainMenu.LOGO_KEY, MainMenu.LOGO_PATH);
        this.load.image(MainMenu.CHRONO_KEY, MainMenu.CHRONO_PATH);
        this.load.image(MainMenu.SWITCH_KEY, MainMenu.SWITCH_PATH);
        this.load.image(MainMenu.BACKGROUND_KEY, MainMenu.BACKGROUND_PATH);
        this.load.image(MainMenu.CONTROLS_KEY, MainMenu.CONTROLS_PATH);
        this.viewport?.setZoomLevel(4);
        this.viewport?.disableZoom();
        this.viewport?.setCurrentZoom(0);

        this.load.image(MainMenu.L1PREVIEW_KEY, MainMenu.L1PREVIEW_PATH);
        this.load.image(MainMenu.L2PREVIEW_KEY, MainMenu.L2PREVIEW_PATH);
        this.load.image(MainMenu.L3PREVIEW_KEY, MainMenu.L3PREVIEW_PATH);
        this.load.image(MainMenu.L4PREVIEW_KEY, MainMenu.L4PREVIEW_PATH);
        this.load.image(MainMenu.L5PREVIEW_KEY, MainMenu.L5PREVIEW_PATH);
        this.load.image(MainMenu.L6PREVIEW_KEY, MainMenu.L6PREVIEW_PATH);
        this.load.image(MainMenu.L1LOCK_KEY, MainMenu.L1LOCK_PATH);
        this.load.image(MainMenu.L2LOCK_KEY, MainMenu.L2LOCK_PATH);
        this.load.image(MainMenu.L3LOCK_KEY, MainMenu.L3LOCK_PATH);
        this.load.image(MainMenu.L4LOCK_KEY, MainMenu.L4LOCK_PATH);
        this.load.image(MainMenu.L5LOCK_KEY, MainMenu.L5LOCK_PATH);
        this.load.image(MainMenu.L6LOCK_KEY, MainMenu.L6LOCK_PATH);
        this.load.audio(MainMenu.MUSIC_KEY, MainMenu.MUSIC_PATH);
    }

    public startScene(): void {
        this.splash = this.addUILayer(MenuLayers.SPLASH);
        this.mainMenu = this.addUILayer(MenuLayers.MAIN);
        this.mainMenu.setHidden(true);
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
        const splashbg = this.add.sprite(MainMenu.SPLASH_KEY, MenuLayers.SPLASH);
        splashbg.position.set(size.x, size.y);
        splashbg.scale.set(0.85, 0.85);

        // Logo stuff
        this.chrono = this.add.sprite(MainMenu.CHRONO_KEY, MenuLayers.MAIN);
        this.chrono.position.set(size.x - 355, size.y - 220);
        this.chrono.scale.set(0.65, 0.65);
        this.switch = this.add.sprite(MainMenu.SWITCH_KEY, MenuLayers.MAIN);
        this.switch.position.set(size.x + 355, size.y - 220);
        this.switch.scale.set(0.65, 0.65);

        const defaultProperties = { backgroundColor: Color.WHITE, borderColor: Color.WHITE, textColor: Color.BLACK, borderRadius: 10, font: "MyFont" }

        {   /* Splash Screen */
            let clickAnywhere = <Label>this.add.uiElement(UIElementType.LABEL, MenuLayers.SPLASH, {position: new Vec2(size.x, size.y), text: ""});
            clickAnywhere.size = new Vec2(1000,1000);
            clickAnywhere.onClick = () => {
                if (Date.now() - this.lastClick.getTime() < 100) return;
                this.lastClick = new Date();
                this.splash.setHidden(true);
                this.mainMenu.setHidden(false);
                this.emitter.fireEvent(GameEventType.PLAY_SOUND, {key: MainMenu.MUSIC_KEY, loop: true, holdReference: true});
            }
        }

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
                if (Date.now() - this.lastClick.getTime() < 100) return;
                this.lastClick = new Date();
                this.sceneManager.changeToScene(Level1);
            }
            levelSelect.onClick = () => {
                if (Date.now() - this.lastClick.getTime() < 100) return;
                this.lastClick = new Date();
                this.mainMenu.setHidden(true);
                this.levelSelect.setHidden(false);
            }
            controls.onClick = () => {
                if (Date.now() - this.lastClick.getTime() < 100) return;
                this.lastClick = new Date();
                this.mainMenu.setHidden(true);
                this.controls.setHidden(false);
            }
            about.onClick = () => {
                if (Date.now() - this.lastClick.getTime() < 100) return;
                this.lastClick = new Date();
                this.mainMenu.setHidden(true);
                this.about.setHidden(false);
            }
        }

        {   /* Level Select */
            // Create a back button
            let bacc = <Button>this.add.uiElement(UIElementType.BUTTON, MenuLayers.LEVELSELECT, { position: new Vec2(size.x, size.y + 350), text: "BACK" });
            Object.assign(bacc, defaultProperties);
            bacc.size = new Vec2(185, 50);
            bacc.fontSize = 28;
            bacc.setPadding(new Vec2(50, 15));

            let preview1 = <Sprite>this.add.sprite(HW3Level.unlocked[0] ? MainMenu.L1PREVIEW_KEY : MainMenu.L1LOCK_KEY, MenuLayers.LEVELSELECT);
            preview1.position.set(size.x - 325, size.y + 35);
            preview1.scale.set(0.28, 0.29);
            let lvl1 = <Button>this.add.uiElement(UIElementType.BUTTON, MenuLayers.LEVELSELECT, { position: new Vec2(size.x - 325, size.y + 35), text: "" });
            lvl1.backgroundColor = Color.TRANSPARENT;
            lvl1.borderColor = Color.TRANSPARENT;
            lvl1.size = new Vec2(280, 155);
            const changeToLvl1 = () => {
                if (Date.now() - this.lastClick.getTime() < 100) return;
                this.lastClick = new Date();
                this.sceneManager.changeToScene(Level1);
            }
            if (HW3Level.unlocked[0]) lvl1.onClick = changeToLvl1;

            let preview2 = <Sprite>this.add.sprite(HW3Level.unlocked[1] ? MainMenu.L2PREVIEW_KEY : MainMenu.L2LOCK_KEY, MenuLayers.LEVELSELECT);
            preview2.position.set(size.x, size.y + 35);
            preview2.scale.set(0.28, 0.29);
            let lvl2 = <Button>this.add.uiElement(UIElementType.BUTTON, MenuLayers.LEVELSELECT, { position: new Vec2(size.x, size.y + 35), text: "" });
            lvl2.backgroundColor = Color.TRANSPARENT;
            lvl2.borderColor = Color.TRANSPARENT;
            lvl2.size = new Vec2(280, 155);
            const changeToLvl2 = () => {
                if (Date.now() - this.lastClick.getTime() < 100) return;
                this.lastClick = new Date();
                this.sceneManager.changeToScene(Level2);
            }
            if (HW3Level.unlocked[1]) lvl2.onClick = changeToLvl2;

            let preview3 = <Sprite>this.add.sprite(HW3Level.unlocked[2] ? MainMenu.L3PREVIEW_KEY : MainMenu.L3LOCK_KEY, MenuLayers.LEVELSELECT);
            preview3.position.set(size.x + 325, size.y + 35);
            preview3.scale.set(0.28, 0.29);
            let lvl3 = <Button>this.add.uiElement(UIElementType.BUTTON, MenuLayers.LEVELSELECT, { position: new Vec2(size.x + 325, size.y + 35), text: "" });
            lvl3.backgroundColor = Color.TRANSPARENT;
            lvl3.borderColor = Color.TRANSPARENT;
            lvl3.size = new Vec2(280, 155);
            const changeToLvl3 = () => {
                if (Date.now() - this.lastClick.getTime() < 100) return;
                this.lastClick = new Date();
                this.sceneManager.changeToScene(Level3);
            }
            if (HW3Level.unlocked[2]) lvl3.onClick = changeToLvl3;

            let preview4 = <Sprite>this.add.sprite(HW3Level.unlocked[3] ? MainMenu.L4PREVIEW_KEY : MainMenu.L4LOCK_KEY, MenuLayers.LEVELSELECT);
            preview4.position.set(size.x - 325, size.y + 220);
            preview4.scale.set(0.28, 0.29);
            let lvl4 = <Button>this.add.uiElement(UIElementType.BUTTON, MenuLayers.LEVELSELECT, { position: new Vec2(size.x - 325, size.y + 220), text: "" });
            lvl4.backgroundColor = Color.TRANSPARENT;
            lvl4.borderColor = Color.TRANSPARENT;
            lvl4.size = new Vec2(280, 155);
            const changeToLvl4 = () => {
                if (Date.now() - this.lastClick.getTime() < 100) return;
                this.lastClick = new Date();
                this.sceneManager.changeToScene(Level4);
            }
            if (HW3Level.unlocked[3]) lvl4.onClick = changeToLvl4;

            let preview5 = <Sprite>this.add.sprite(HW3Level.unlocked[4] ? MainMenu.L5PREVIEW_KEY : MainMenu.L5LOCK_KEY, MenuLayers.LEVELSELECT);
            preview5.position.set(size.x, size.y + 220);
            preview5.scale.set(0.28, 0.29);
            let lvl5 = <Button>this.add.uiElement(UIElementType.BUTTON, MenuLayers.LEVELSELECT, { position: new Vec2(size.x, size.y + 220), text: "" });
            lvl5.backgroundColor = Color.TRANSPARENT;
            lvl5.borderColor = Color.TRANSPARENT;
            lvl5.size = new Vec2(280, 155);
            const changeToLvl5 = () => {
                if (Date.now() - this.lastClick.getTime() < 100) return;
                this.lastClick = new Date();
                this.sceneManager.changeToScene(Level5);
            }
            if (HW3Level.unlocked[4]) lvl5.onClick = changeToLvl5;

            let preview6 = <Sprite>this.add.sprite(HW3Level.unlocked[5] ? MainMenu.L6PREVIEW_KEY : MainMenu.L6LOCK_KEY, MenuLayers.LEVELSELECT);
            preview6.position.set(size.x + 325, size.y + 220);
            preview6.scale.set(0.28, 0.29);
            let lvl6 = <Button>this.add.uiElement(UIElementType.BUTTON, MenuLayers.LEVELSELECT, { position: new Vec2(size.x + 325, size.y + 220), text: "" });
            lvl6.backgroundColor = Color.TRANSPARENT;
            lvl6.borderColor = Color.TRANSPARENT;
            lvl6.size = new Vec2(280, 155);
            const changeToLvl6 = () => {
                if (Date.now() - this.lastClick.getTime() < 100) return;
                this.lastClick = new Date();
                this.sceneManager.changeToScene(Level6);
            }
            if (HW3Level.unlocked[5]) lvl6.onClick = changeToLvl6;


            bacc.onClick = () => {
                if (Date.now() - this.lastClick.getTime() < 100) return;
                this.lastClick = new Date();
                this.mainMenu.setHidden(false);
                this.levelSelect.setHidden(true);
            }
        }

        {   /* Controls */
            // Create a back button
            let bacc = <Button>this.add.uiElement(UIElementType.BUTTON, MenuLayers.CONTROLS, { position: new Vec2(size.x, size.y + 350), text: "BACK" });
            Object.assign(bacc, defaultProperties);
            bacc.size = new Vec2(185, 50);
            bacc.fontSize = 28;
            bacc.setPadding(new Vec2(50, 15));

            let main = <Label>this.add.uiElement(UIElementType.LABEL, MenuLayers.CONTROLS, { position: new Vec2(size.x, size.y + 100), text: "" });
            Object.assign(main, defaultProperties);
            main.size = new Vec2(900, 320);
            main.fontSize = 20;
            main.setPadding(new Vec2(50, 15));

            let ctrlsImage = this.add.sprite(MainMenu.CONTROLS_KEY, MenuLayers.CONTROLS);
            ctrlsImage.position.set(size.x - 25, size.y + 95);
            ctrlsImage.scale.set(0.78, 0.78);

            bacc.onClick = () => {
                if (Date.now() - this.lastClick.getTime() < 100) return;
                this.lastClick = new Date();
                this.mainMenu.setHidden(false);
                this.controls.setHidden(true);
            }
        }

        {   /* About */
            // Create a back button
            let bacc = <Button>this.add.uiElement(UIElementType.BUTTON, MenuLayers.ABOUT, { position: new Vec2(size.x, size.y + 350), text: "BACK" });
            Object.assign(bacc, defaultProperties);
            bacc.size = new Vec2(185, 50);
            bacc.fontSize = 28;
            bacc.setPadding(new Vec2(50, 15));

            let main = <Label>this.add.uiElement(UIElementType.LABEL, MenuLayers.ABOUT, { position: new Vec2(size.x, size.y + 100), text: "" });
            Object.assign(main, defaultProperties);
            main.size = new Vec2(900, 320);
            main.fontSize = 20;
            main.setPadding(new Vec2(50, 15));

            let line1 = <Label>this.add.uiElement(UIElementType.LABEL, MenuLayers.ABOUT, {
                position: new Vec2(size.x, size.y - 15), text: "Tepster Tomsper is a distinguished and capable hitman. One day while out"
            });
            let line2 = <Label>this.add.uiElement(UIElementType.LABEL, MenuLayers.ABOUT, {
                position: new Vec2(size.x, size.y + 15), text: "running errands at Trader Joe's, he stumbled upon the Chrono-Switch,"
            });
            let line3 = <Label>this.add.uiElement(UIElementType.LABEL, MenuLayers.ABOUT, {
                position: new Vec2(size.x, size.y + 45), text: "a device that, when activated, allows him to travel back in time. However,"
            });
            let line4 = <Label>this.add.uiElement(UIElementType.LABEL, MenuLayers.ABOUT, {
                position: new Vec2(size.x, size.y + 75), text: "when he touched the device, it unleashed several anomalous time clones."
            });
            let line5 = <Label>this.add.uiElement(UIElementType.LABEL, MenuLayers.ABOUT, {
                position: new Vec2(size.x, size.y + 105), text: "Using his newfound god-like powers, he decided that it is his duty"
            });
            let line6 = <Label>this.add.uiElement(UIElementType.LABEL, MenuLayers.ABOUT, {
                position: new Vec2(size.x, size.y + 135), text: "to eliminate the anachronistic fiends that are now infesting the past."
            });
            line1.font = "MyFont"; line1.fontSize = 20;
            line2.font = "MyFont"; line2.fontSize = 20;
            line3.font = "MyFont"; line3.fontSize = 20;
            line4.font = "MyFont"; line4.fontSize = 20;
            line5.font = "MyFont"; line5.fontSize = 20;
            line6.font = "MyFont"; line6.fontSize = 20;

            let madeBy = <Label>this.add.uiElement(UIElementType.LABEL, MenuLayers.ABOUT, {
                position: new Vec2(size.x, size.y + 210), text: "Made by: Kevin Tao, James Leonardi, and Kyle Yee"
            });
            madeBy.font = "MyFont"; madeBy.fontSize = 22;

            bacc.onClick = () => {
                if (Date.now() - this.lastClick.getTime() < 100) return;
                this.lastClick = new Date();
                this.mainMenu.setHidden(false);
                this.about.setHidden(true);
            }
        }
        // Scene has started, so start playing music
        /* this.emitter.fireEvent(GameEventType.PLAY_SOUND, {key: MainMenu.MUSIC_KEY, loop: true, holdReference: true}); */
    }

    public unloadScene(): void {
        // The scene is being destroyed, so we can stop playing the song
        this.emitter.fireEvent(GameEventType.STOP_SOUND, {key: MainMenu.MUSIC_KEY});
    }
}

