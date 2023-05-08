import AABB from "../../Wolfie2D/DataTypes/Shapes/AABB";
import Vec2 from "../../Wolfie2D/DataTypes/Vec2";
import HW3Level from "./HW3Level";
import RenderingManager from "../../Wolfie2D/Rendering/RenderingManager";
import { GameEventType } from "../../Wolfie2D/Events/GameEventType";
import SceneManager from "../../Wolfie2D/Scene/SceneManager";
import Viewport from "../../Wolfie2D/SceneGraph/Viewport";
import HW4Level2 from "./HW3Level2";
import { HW3Events } from "../HW3Events";
import GameEvent from "../../Wolfie2D/Events/GameEvent";
import Level1 from "./HW3Level1";
import Level2 from "./HW3Level2";
import Level4 from "./HW3Level4";
import Level5 from "./HW3Level5";
import Level6 from "./HW3Level6";

/**
 * The first level for HW4 - should be the one with the grass and the clouds.
 */
export default class Level3 extends HW3Level {

    public static readonly PLAYER_SPAWN = new Vec2(32, 608);
    public static readonly PLAYER_SPRITE_KEY = "PLAYER_SPRITE_KEY";
    public static readonly PLAYER_SPRITE_PATH = "hw4_assets/spritesheets/Tepster.json";

    public static readonly ENEMY_SPRITE_KEY = "ENEMY_SPRITE_KEY";
    public static readonly ENEMY_SPRITE_PATH = "hw4_assets/spritesheets/Enemy.json";

    public static readonly BOSS_SPAWN = new Vec2(2004, 1414);
    public static readonly BOSS_SPRITE_KEY = "BOSS_SPRITE_KEY";
    public static readonly BOSS_SPRITE_PATH = "hw4_assets/spritesheets/Tepster.json";

    public static readonly TILEMAP_KEY = "LEVEL3";
    public static readonly TILEMAP_PATH = "hw4_assets/tilemaps/L3.json";
    public static readonly TILEMAP_SCALE = new Vec2(2, 2);
    public static readonly DESTRUCTIBLE_LAYER_KEY = "Main";
    public static readonly DEATH_LAYER_KEY = "Death";
    public static readonly WALLS_LAYER_KEY = "Main";
    public static readonly GRAPPLE_ONLY_LAYER_KEY = "OnlyGrapple";

    public static readonly LEVEL_MUSIC_KEY = "LEVEL_MUSIC";
    public static readonly LEVEL_MUSIC_PATH = "hw4_assets/music/jungle.mp3";

    public static readonly JUMP_AUDIO_KEY = "PLAYER_JUMP";
    public static readonly JUMP_AUDIO_PATH = "hw4_assets/sounds/jump.wav";

    public static readonly DASH_AUDIO_KEY = "PLAYER_DASH";
    public static readonly DASH_AUDIO_PATH = "hw4_assets/sounds/dash.mp3";
    
    public static readonly DAMAGED_AUDIO_KEY = "PLAYER_DAMAGED";
    public static readonly DAMAGED_AUDIO_PATH = "hw4_assets/sounds/takedamage.mp3";

    public static readonly DEADGE_AUDIO_KEY = "PLAYER_DEADGE";
    public static readonly DEADGE_AUDIO_PATH = "hw4_assets/sounds/deadge.mp3";

    public static readonly ENEMY_KILL_AUDIO_KEY = "ENEMY_KILL";
    public static readonly ENEMY_KILL_AUDIO_PATH = "hw4_assets/sounds/enemykill.mp3";

    public static readonly ENEMY_SHOOT_AUDIO1_KEY = "ENEMY_SHOOT1";
    public static readonly ENEMY_SHOOT_AUDIO1_PATH = "hw4_assets/sounds/shotgun.mp3";

    public static readonly ENEMY_SHOOT_AUDIO2_KEY = "ENEMY_SHOOT2";
    public static readonly ENEMY_SHOOT_AUDIO2_PATH = "hw4_assets/sounds/shotgun2.mp3";

    public static readonly ENEMY_SHOOT_AUDIO3_KEY = "ENEMY_SHOOT3";
    public static readonly ENEMY_SHOOT_AUDIO3_PATH = "hw4_assets/sounds/shotgun3.mp3";

    public static readonly BOSS_KILL_AUDIO_KEY = "BOSS_KILL";
    public static readonly BOSS_KILL_AUDIO_PATH = "hw4_assets/sounds/bosskill.mp3";

    public static readonly TILE_DESTROYED_KEY = "TILE_DESTROYED";
    public static readonly TILE_DESTROYED_PATH = "hw4_assets/sounds/switch.wav";

    public static readonly LEVEL_END = new AABB(new Vec2(928, 3632), new Vec2(24, 16));

    public constructor(viewport: Viewport, sceneManager: SceneManager, renderingManager: RenderingManager, options: Record<string, any>) {
        super(viewport, sceneManager, renderingManager, options);

        this.tilemapKey = Level3.TILEMAP_KEY;
        this.tilemapScale = Level3.TILEMAP_SCALE;
        this.destructibleLayerKey = Level3.DESTRUCTIBLE_LAYER_KEY;
        this.wallsLayerKey = Level3.WALLS_LAYER_KEY;
        this.deathLayerKey = Level3.DEATH_LAYER_KEY;
        this.grappleOnlyLayerKey = Level3.GRAPPLE_ONLY_LAYER_KEY;

        this.playerSpriteKey = Level3.PLAYER_SPRITE_KEY;
        this.playerSpawn = Level3.PLAYER_SPAWN;

        this.bossSpriteKey = Level3.BOSS_SPRITE_KEY;
        this.bossSpawn = Level3.BOSS_SPAWN;
        this.boss_in_present = true;

        this.levelMusicKey = Level3.LEVEL_MUSIC_KEY
        this.jumpAudioKey = Level3.JUMP_AUDIO_KEY;
        this.dashAudioKey = Level3.DASH_AUDIO_KEY;
        this.tileDestroyedAudioKey = Level3.TILE_DESTROYED_KEY;
        this.damagedAudioKey = Level3.DAMAGED_AUDIO_KEY;
        this.deadgeAudioKey = Level3.DEADGE_AUDIO_KEY;
        this.enemyKillAudioKey = Level3.ENEMY_KILL_AUDIO_KEY;
        this.bossKillAudioKey = Level3.BOSS_KILL_AUDIO_KEY;
        this.enemyShootAudioKey1 = Level3.ENEMY_SHOOT_AUDIO1_KEY;
        this.enemyShootAudioKey2 = Level3.ENEMY_SHOOT_AUDIO2_KEY;
        this.enemyShootAudioKey3 = Level3.ENEMY_SHOOT_AUDIO3_KEY;

        this.levelEndPosition = new Vec2(-1006, -685).mult(this.tilemapScale);
        this.levelEndHalfSize = new Vec2(32, 32).mult(this.tilemapScale);
        this.levelEnd2Position = new Vec2(-54, -132).mult(this.tilemapScale);
        this.levelEnd2HalfSize = new Vec2(32, 32).mult(this.tilemapScale);
        this.pastPosition = new Vec2(688, 1584).mult(this.tilemapScale);
    }

    public loadScene(): void {
        this.viewport.setCurrentZoom(0);
        this.load.tilemap(this.tilemapKey, Level3.TILEMAP_PATH);
        this.load.spritesheet(this.playerSpriteKey, Level3.PLAYER_SPRITE_PATH);
        this.load.spritesheet(this.bossSpriteKey, Level3.BOSS_SPRITE_PATH);
        this.load.spritesheet(Level3.ENEMY_SPRITE_KEY, Level3.ENEMY_SPRITE_PATH);
        // Audio and music
        this.load.audio(this.levelMusicKey, Level3.LEVEL_MUSIC_PATH);
        this.load.audio(this.jumpAudioKey, Level3.JUMP_AUDIO_PATH);
        this.load.audio(this.dashAudioKey, Level1.DASH_AUDIO_PATH);
        this.load.audio(this.tileDestroyedAudioKey, Level3.TILE_DESTROYED_PATH);
        this.load.audio(this.damagedAudioKey, Level3.DAMAGED_AUDIO_PATH);
        this.load.audio(this.deadgeAudioKey, Level3.DEADGE_AUDIO_PATH);
        this.load.audio(this.enemyKillAudioKey, Level3.ENEMY_KILL_AUDIO_PATH);
        this.load.audio(this.enemyShootAudioKey1, Level3.ENEMY_SHOOT_AUDIO1_PATH);
        this.load.audio(this.enemyShootAudioKey2, Level3.ENEMY_SHOOT_AUDIO2_PATH);
        this.load.audio(this.enemyShootAudioKey3, Level3.ENEMY_SHOOT_AUDIO3_PATH);
        this.load.audio(this.bossKillAudioKey, Level3.BOSS_KILL_AUDIO_PATH);

        this.load.image(HW3Level.healthFrameKey, HW3Level.healthFramePath);
        this.load.image(HW3Level.healthFrame2Key, HW3Level.healthFrame2Path);
        this.load.image(HW3Level.cswitchKey, HW3Level.cswitchPath);
        //this.load.audio("GRAPPLE_0", "hw4_assets/sounds/grapple_0.mp3");
        //this.load.audio("GRAPPLE_1", "hw4_assets/sounds/grapple_1.mp3");
        //this.load.audio("GRAPPLE_2", "hw4_assets/sounds/grapple_2.mp3");
        this.load.audio("ZIP_0", "hw4_assets/sounds/zip1.mp3");
        this.load.audio("ZIP_1", "hw4_assets/sounds/zip2.mp3");
        this.load.audio("PSHH", "hw4_assets/sounds/pshh.mp3");
        this.load.audio("SHOOT", "hw4_assets/sounds/gunshot.mp3");
        this.load.audio("SWITCH_1", "hw4_assets/sounds/switch1.wav");
        this.load.audio("SWITCH_2", "hw4_assets/sounds/switch2.wav");
        //this.load.audio("WIN", "hw4_assets/sounds/imsosorry.mp3");
    }

    public unloadScene(): void {
        super.unlockLevel(3);
        this.emitter.fireEvent(GameEventType.STOP_SOUND, {key: Level3.LEVEL_MUSIC_KEY});
        this.load.keepAudio(this.jumpAudioKey);
        this.load.keepAudio(this.tileDestroyedAudioKey);
        this.load.keepAudio(this.damagedAudioKey);
        this.load.keepAudio(this.deadgeAudioKey);
        this.load.keepSpritesheet(this.playerSpriteKey);
        this.load.keepAudio("ZIP_0");
        this.load.keepAudio("ZIP_1");
        this.load.keepAudio("PSHH");
        this.load.keepAudio("SWITCH_1");
        this.load.keepAudio("SWITCH_2");
        this.load.keepImage(HW3Level.healthFrameKey);
        this.load.keepImage(HW3Level.healthFrame2Key);
        this.load.keepImage(HW3Level.cswitchKey);
    }

    public startScene(): void {
        super.startScene();
        this.nextLevel = Level4;
        this.currentLevel = Level3;

        this.receiver.subscribe(HW3Events.LEVEL_CHANGE);

        const presentPositions = [
            [211, 648, 15],[374, 632, 12],
            [766, 600, 8],[1030, 648, 0],
            [816, 1032, 10],[445, 1432, 10],
            [1090, 1432, 8],[990, 1432, 8],
            [1625, 1320, 6],[1665, 1320, 6],
            [1288, 920, 14],[1180, 728, 18],
            [2307, 1384, 8],[2184, 1400, 20]];
        for (const pos of presentPositions) {
            super.addNewEnemy(Level3.ENEMY_SPRITE_KEY, new Vec2(pos[0], pos[1]), true, pos[2]);
        }

        const pastPositions = [
            [417, 2872, 8],[704, 2824, 6],
            [227, 3416, 10],[202, 3416, 10],
            [175, 3416, 10],[150, 3416, 10],
            [126, 3416, 10],[100, 3416, 10],
            [76, 3416, 10],[131, 3704, 20],
            [151, 3704, 20],[1177, 3656, 8],
            [1448, 3528, 10],[1508, 3224, 0],
            [1437, 2968, 6],[1458, 2840, 8],
            [2420, 3608, 4],[2088, 3640, 0]];
        for (const pos of pastPositions) {
            super.addNewEnemy(Level3.ENEMY_SPRITE_KEY, new Vec2(pos[0], pos[1]), false, pos[2]);
        }
    }

    protected initializeViewport(): void {
        super.initializeViewport();
        this.viewport.setBounds(0, 0, 2752, 4096);
    }

    protected handleEvent(event: GameEvent): void {
        super.handleEvent(event);
        if(event.type == HW3Events.LEVEL_CHANGE) {
            switch(event.data.get("level")) {
                case "1": {
                    console.log("CHEAT: Changing to Level 1");
                    this.sceneManager.changeToScene(Level1);
                    break;
                }
                case "2": {
                    console.log("CHEAT: Changing to Level 2");
                    this.sceneManager.changeToScene(Level2);
                    break;
                }
                case "3": {
                    console.log("CHEAT: Changing to Level 3");
                    this.sceneManager.changeToScene(Level3);
                    break;
                }
                case "4": {
                    console.log("CHEAT: Changing to Level 4");
                    this.sceneManager.changeToScene(Level4);
                    break;
                }
                case "5": {
                    console.log("CHEAT: Changing to Level 5");
                    this.sceneManager.changeToScene(Level5);
                    break;
                }
                case "6": {
                    console.log("CHEAT: Changing to Level 6");
                    this.sceneManager.changeToScene(Level6);
                    break;
                }
            }
        }
    }

}