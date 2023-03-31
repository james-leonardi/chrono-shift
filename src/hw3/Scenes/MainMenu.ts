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
    CONTROLS: "CONTROLS",
    ABOUT: "ABOUT"
} as const;

export default class MainMenu extends Scene {

    public static readonly MUSIC_KEY = "MAIN_MENU_MUSIC";
    public static readonly MUSIC_PATH = "hw4_assets/music/menu.mp3";
    public static readonly LOGO_KEY = "MAIN_MENU_LOGO";
    public static readonly LOGO_PATH = "hw4_assets/logo.png";
    private mainMenu: Layer;
    private controls: Layer;
    private about: Layer;
    private logo: Sprite;

    public loadScene(): void {
        // Load the menu song
        this.load.image(MainMenu.LOGO_KEY, MainMenu.LOGO_PATH)
        this.load.audio(MainMenu.MUSIC_KEY, MainMenu.MUSIC_PATH);
    }

    public startScene(): void {
        this.mainMenu = this.addUILayer(MenuLayers.MAIN);

        this.controls = this.addUILayer(MenuLayers.CONTROLS);
        this.controls.setHidden(true);

        this.about = this.addUILayer(MenuLayers.ABOUT);
        this.about.setHidden(true);

        // Center the viewport
        let size = this.viewport.getHalfSize();
        this.viewport.setFocus(size);
        this.viewport.setZoomLevel(1);

        this.logo = this.add.sprite(MainMenu.LOGO_KEY, MenuLayers.MAIN);
        this.logo.position.set(size.x, size.y - 200);
        this.logo.scale.set(0.6, 0.6);
        // Create a play button
        let playBtn = <Button>this.add.uiElement(UIElementType.BUTTON, MenuLayers.MAIN, {position: new Vec2(size.x, size.y), text: "PLAY"});
        playBtn.backgroundColor = Color.WHITE;
        playBtn.borderColor = Color.WHITE;
        playBtn.textColor = Color.BLACK;
        playBtn.borderRadius = 10;
        playBtn.size = new Vec2(240, 80);
        playBtn.fontSize = 42;
        playBtn.setPadding(new Vec2(50, 15));
        playBtn.font = "MyFont";

        // Create a LevelSelect button
        let levelSelect = <Button>this.add.uiElement(UIElementType.BUTTON, MenuLayers.MAIN, { position: new Vec2(size.x, size.y + 80), text: "LEVELS" });
        levelSelect.backgroundColor = Color.WHITE;
        levelSelect.borderColor = Color.WHITE;
        levelSelect.textColor = Color.BLACK;
        levelSelect.borderRadius = 10;
        levelSelect.size = new Vec2(185, 55);
        levelSelect.fontSize = 30;
        levelSelect.setPadding(new Vec2(50, 15));
        levelSelect.font = "MyFont";

        // Create a controls button
        let controls = <Button>this.add.uiElement(UIElementType.BUTTON, MenuLayers.MAIN, { position: new Vec2(size.x-130, size.y + 160), text: "CONTROLS" });
        controls.backgroundColor = Color.WHITE;
        controls.borderColor = Color.WHITE;
        controls.textColor = Color.BLACK;
        controls.borderRadius = 10;
        controls.size = new Vec2(205, 55);
        controls.fontSize = 30;
        controls.setPadding(new Vec2(50, 15));
        controls.font = "MyFont";

        // Create an about button
        let about = <Button>this.add.uiElement(UIElementType.BUTTON, MenuLayers.MAIN, { position: new Vec2(size.x+130, size.y + 160), text: "ABOUT" });
        about.backgroundColor = Color.WHITE;
        about.borderColor = Color.WHITE;
        about.textColor = Color.BLACK;
        about.borderRadius = 10;
        about.size = new Vec2(205, 55);
        about.fontSize = 30;
        about.setPadding(new Vec2(50, 15));
        about.font = "MyFont";

        // When the play button is clicked, go to the next scene
        playBtn.onClick = () => {
            this.sceneManager.changeToScene(Level1);
        }

        // Scene has started, so start playing music
        this.emitter.fireEvent(GameEventType.PLAY_SOUND, {key: MainMenu.MUSIC_KEY, loop: true, holdReference: true});
    }

    public unloadScene(): void {
        // The scene is being destroyed, so we can stop playing the song
        this.emitter.fireEvent(GameEventType.STOP_SOUND, {key: MainMenu.MUSIC_KEY});
    }
}

