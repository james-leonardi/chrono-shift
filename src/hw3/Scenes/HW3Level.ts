import AABB from "../../Wolfie2D/DataTypes/Shapes/AABB";
import Vec2 from "../../Wolfie2D/DataTypes/Vec2";
import GameEvent from "../../Wolfie2D/Events/GameEvent";
import { GameEventType } from "../../Wolfie2D/Events/GameEventType";
import Input from "../../Wolfie2D/Input/Input";
import { TweenableProperties } from "../../Wolfie2D/Nodes/GameNode";
import { GraphicType } from "../../Wolfie2D/Nodes/Graphics/GraphicTypes";
import Rect from "../../Wolfie2D/Nodes/Graphics/Rect";
import AnimatedSprite from "../../Wolfie2D/Nodes/Sprites/AnimatedSprite";
import OrthogonalTilemap from "../../Wolfie2D/Nodes/Tilemaps/OrthogonalTilemap";
import Label from "../../Wolfie2D/Nodes/UIElements/Label";
import { UIElementType } from "../../Wolfie2D/Nodes/UIElements/UIElementTypes";
import RenderingManager from "../../Wolfie2D/Rendering/RenderingManager";
import Scene from "../../Wolfie2D/Scene/Scene";
import SceneManager from "../../Wolfie2D/Scene/SceneManager";
import Viewport from "../../Wolfie2D/SceneGraph/Viewport";
import Timer from "../../Wolfie2D/Timing/Timer";
import Color from "../../Wolfie2D/Utils/Color";
import { EaseFunctionType } from "../../Wolfie2D/Utils/EaseFunctions";
import PlayerController from "../Player/PlayerController";
import PlayerWeapon from "../Player/PlayerWeapon";
import PlayerGrapple from "../Player/PlayerGrapple";

import { HW3Events } from "../HW3Events";
import { HW3PhysicsGroups } from "../HW3PhysicsGroups";
import HW3FactoryManager from "../Factory/HW3FactoryManager";
import MainMenu from "./MainMenu";
import Particle from "../../Wolfie2D/Nodes/Graphics/Particle";
import Line from "../../Wolfie2D/Nodes/Graphics/Line";
import EnemyController from "../Enemy/EnemyController";
import HW3AnimatedSprite from "../Nodes/HW3AnimatedSprite";
import Sprite from "../../Wolfie2D/Nodes/Sprites/Sprite";
import Button from "../../Wolfie2D/Nodes/UIElements/Button";
import EnemyWeapon from "../Enemy/EnemyWeapon";

/**
 * A const object for the layer names
 */
export const HW3Layers = {
    // The primary layer
    PRIMARY: "PRIMARY",
    // The UI layer
    UI: "UI"
} as const;

// The layers as a type
export type HW3Layer = typeof HW3Layers[keyof typeof HW3Layers]

/**
 * An abstract HW4 scene class.
 */
export default abstract class HW3Level extends Scene {

    /** Overrride the factory manager */
    public add: HW3FactoryManager;

    private won: boolean = false;

    protected playerWeaponSystem: PlayerWeapon
    protected playerGrappleSystem: PlayerGrapple;
    protected grappleLine: Line
    protected playerSpriteKey: string;
    protected player: AnimatedSprite;
    protected playerSpawn: Vec2;
    /** Enemy sprite */
    protected enemySpriteKey: string;
    protected enemy: AnimatedSprite;
    protected enemySpawn: Vec2;

    private healthLabel: Label;
	private healthBar: Label;
    private healthBarBg: Label;
    private healthFrame: Sprite;
    public static readonly healthFrameKey = "HEALTH_FRAME";
    public static readonly healthFramePath = "hw4_assets/HealthFrame.png";


    /** The end of level stuff */

    protected levelEndPosition: Vec2;
    protected levelEndHalfSize: Vec2;
    protected levelEndArea: Rect;
    protected levelEnd2Position: Vec2;
    protected levelEnd2HalfSize: Vec2;
    protected levelEnd2Area: Rect;
    protected nextLevel: new (...args: any) => Scene;
    protected levelEndTimer: Timer;
    protected levelEndLabel: Label;

    /* The Past */
    protected pastPosition: Vec2 = new Vec2(0,0);
    protected pastHalfSize: Vec2 = new Vec2(2752, 2048);
    protected pastArea: Rect;

    // Level end transition timer and graphic
    protected levelTransitionTimer: Timer;
    protected levelTransitionScreen: Rect;

    /** The keys to the tilemap and different tilemap layers */
    protected tilemapKey: string;
    protected destructibleLayerKey: string;
    protected wallsLayerKey: string;
    protected deathLayerKey: string;
    protected grappleOnlyLayerKey: string;
    protected iceLayerKey: string;
    protected tilemapScale: Vec2;

    protected destructable: OrthogonalTilemap;
    protected walls: OrthogonalTilemap;
    protected death: OrthogonalTilemap;
    protected grappleOnly: OrthogonalTilemap;

    protected ice: OrthogonalTilemap;

    /** Sound and music */
    protected levelMusicKey: string;
    protected jumpAudioKey: string;
    protected damagedAudioKey: string;
    protected tileDestroyedAudioKey: string;
    protected deadgeAudioKey: string;

    protected tutorialText: Label;

    protected playerInvincible: boolean = false;
    
    protected enemyWeaponSystem: PlayerWeapon;
    protected enemyGrappleSystem: PlayerGrapple;
    protected enemy_in_present: boolean;

    protected lastZoom: number;
    protected pauseButton: Button;
    protected pauseMenu: Rect;

    public constructor(viewport: Viewport, sceneManager: SceneManager, renderingManager: RenderingManager, options: Record<string, any>) {
        super(viewport, sceneManager, renderingManager, {...options, physics: {
            groupNames: ["GROUND", "PLAYER", "ENEMY", "WEAPON", "DESTRUCTABLE", "DEATH", "GRAPPLE_ONLY", "ICE"],
            collisions: [
            /* GROUND   */  [0,1,1,1,0,0,0,0],
            /* PLAYER   */  [1,0,1,0,1,1,0,1],
            /* ENEMY    */  [1,1,0,0,1,1,0,1], // eventually add grapple to enemy
            /* WEAPON   */  [1,0,0,0,1,0,1,1], // decouple grapple and weapon
            /* DESTRUCT */  [0,1,1,1,0,0,0,0],
            /* DEATH    */  [0,1,1,0,0,0,0,0],
            /* GRAPPLE  */  [0,0,0,1,0,0,0,0], // eventually add grapple to enemy
            /* ICE      */  [0,1,1,1,0,0,0,0]]
         }});
        this.add = new HW3FactoryManager(this, this.tilemaps);
    }

    public startScene(): void {
        this.initLayers();
        this.initializeTilemap();
        this.initializeWeaponSystem();
        this.initializeGrappleSystem();
        this.initializeUI();
        this.initializePlayer(this.playerSpriteKey);

        this.initializeEnemy(this.enemySpriteKey);

        // Initialize the viewport - this must come after the player has been initialized
        this.initializeViewport();
        this.subscribeToEvents();
        this.initializeLevelEnds();
        this.initializeThePast();

        this.levelTransitionTimer = new Timer(500);
        this.levelEndTimer = new Timer(3000, () => {
            // After the level end timer ends, fade to black and then go to the next scene
            this.levelTransitionScreen.tweens.play("fadeIn");
        });

        // Initially disable player movement
        Input.disableInput();

        // Start the black screen fade out
        this.levelTransitionScreen.tweens.play("fadeOut");

        // Start playing the level music for the HW4 level
        this.emitter.fireEvent(GameEventType.PLAY_SOUND, {key: this.levelMusicKey, loop: true, holdReference: true});
    }

    public updateScene(deltaT: number) {
        while (this.receiver.hasNextEvent()) this.handleEvent(this.receiver.getNextEvent());

        if (this.enemy.position.distanceTo(this.player.position) < 100) {
            console.log("enemy is close");
            this.emitter.fireEvent("ENEMY_CLOSE", {playerPos: this.player.position.clone()});
        }

        const zoomLevel: number = 5-this.viewport.getZoomLevel();
        if (zoomLevel == this.lastZoom) return; // no need to update if zoom level hasn't changed
        this.lastZoom = zoomLevel;

        /* Calculate the zoom factor */
        let zoomfactor: number = 1/1.2; // 0.8333 is the default zoom factor
        for (const condition of [0.98, 1.6, 2.2, 2.6, 3.0, 3.3, 3.6, 3.8]) { // these are the zoom levels at which the UI elements should be scaled
            if (zoomLevel > condition) zoomfactor *= 1.2; // 1.2^zoomLevel
            else break;
        }
        
        /* Scale the UI elements to their new positions */
        const scaleFactor = (x: number, y: number) => new Vec2(x, y).scale(zoomfactor);
        /* this.healthLabel.position = scaleFactor(15, 15); */
        this.healthBar.position = scaleFactor(81, 24);
        this.healthBarBg.position = scaleFactor(81, 24);
        this.levelEndLabel.position = scaleFactor(-300, 100);
        this.tutorialText.position = scaleFactor(220, 30);
        this.levelTransitionScreen.position = scaleFactor(300, 200);
        this.healthFrame.position = scaleFactor(60, 27);
        this.healthFrame.scale = scaleFactor(0.12, 0.12);
    }

    protected handleEvent(event: GameEvent): void {
        switch (event.type) {
            case HW3Events.PLAYER_ENTERED_LEVEL_END: {
                if (this.won) return;
                this.won = true;
                this.emitter.fireEvent(GameEventType.STOP_SOUND, { key: "LEVEL_MUSIC" });
                this.handleEnteredLevelEnd();
                break;
            }
            // When the level starts, reenable user input
            case HW3Events.LEVEL_START: {
                Input.enableInput();
                break;
            }
            // When the level ends, change the scene to the next level
            case HW3Events.LEVEL_END: {
                this.sceneManager.changeToScene(this.nextLevel);
                break;
            }
            case "PARTICLE": {
                this.handleParticleHit(event.data.get("node"));
                break;
            }
            case "DYING": {
                console.log("invince: " + this.playerInvincible);
                if(!this.playerInvincible) {
                    this.player.animation.play("DYING", true, undefined);
                    setTimeout(() => {
                        this.player.animation.play("DEAD", false, undefined);
                    }, 300);
                    setTimeout(() => {
                        this.emitter.fireEvent(HW3Events.PLAYER_DEAD);
                    }, 1000);
                }
                break;
            }
            case HW3Events.KILL_BOSS: {
                console.log("ENEMY HIT");
                this.enemy.animation.play("DYING", true, undefined);
                setTimeout(() => {
                    this.enemy.animation.play("DEAD", false, undefined);
                }, 300);
                this.emitter.fireEvent(HW3Events.PLAYER_ENTERED_LEVEL_END);
                break;
            }
            case HW3Events.HEALTH_CHANGE: {
                this.player.animation.play("TAKING_DAMAGE", false, undefined);
                this.player.animation.queue("IDLE", false, undefined);
                this.handleHealthChange(event.data.get("curhp"), event.data.get("maxhp"));
                break;
            }
            case HW3Events.PLAYER_DEAD: {
                console.log("Player dead event");
                this.sceneManager.changeToScene(MainMenu);
                break;
            }
            case HW3Events.INVINCIBILITY: {
                this.playerInvincible = event.data.get("value");
                break;
            }
            case "PAUSE": {
                this.pauseMenu.tweens.play("fadeIn");
                break;
            }
            case "UNPAUSE": {
                this.pauseMenu.tweens.play("fadeOut");
                break;
            }
        }
    }

    protected handleParticleHit(particleId: number): void {
        const particles = this.playerGrappleSystem.isSystemRunning() ? this.playerGrappleSystem.getPool() : this.playerWeaponSystem.getPool();
        const particle = particles.find(particle => particle.id === particleId);
        if (particle !== undefined) {
            const tilemap = this.destructable;
            const tilemap2 = this.grappleOnly;

            const min = new Vec2(particle.sweptRect.left, particle.sweptRect.top);
            const max = new Vec2(particle.sweptRect.right, particle.sweptRect.bottom);

            // Convert the min/max x/y to the min and max row/col in the tilemap array
            const minIndex = tilemap.getColRowAt(min);
            const maxIndex = tilemap.getColRowAt(max);

            // Loop over all possible tiles the particle could be colliding with 
            for (let col = minIndex.x; col <= maxIndex.x; col++) {
                for (let row = minIndex.y; row <= maxIndex.y; row++) {
                    // If the tile is collideable -> check if this particle is colliding with the tile
                    if (tilemap.isTileCollidable(col, row) || tilemap2?.isTileCollidable(col, row)) {
                        particle.visible = false;
                        const dir = this.player.position.dirTo(particle.position).scale(250, 350).scale(1.2);
                        if (this.playerGrappleSystem.isSystemRunning()) {
                            this.emitter.fireEvent(HW3Events.GRAPPLE_HIT, { velocity: dir, distance: this.player.position.distanceTo(particle.position) });
                            this.playerGrappleSystem.stopSystem();
                        }
                        else if (this.playerWeaponSystem.isSystemRunning()) {
                            this.playerWeaponSystem.stopSystem();
                        }
                    }
                }
            }
            return;
        }
    }

    protected handleEnteredLevelEnd(): void {
        // If the timer hasn't run yet, start the end level animation
        if (!this.levelEndTimer.hasRun() && this.levelEndTimer.isStopped()) {
            this.levelEndTimer.start();
            this.levelEndLabel.tweens.play("slideIn");
        }
    }

    protected handleHealthChange(currentHealth: number, maxHealth: number): void {
		let unit = this.healthBarBg.size.x / maxHealth;
        
		this.healthBar.size.set(this.healthBarBg.size.x - unit * (maxHealth - currentHealth), this.healthBarBg.size.y);
		this.healthBar.position.set(this.healthBarBg.position.x - (unit / 2 / this.getViewScale()) * (maxHealth - currentHealth), this.healthBarBg.position.y);

		this.healthBar.backgroundColor = currentHealth < maxHealth * 1/4 ? Color.RED: currentHealth < maxHealth * 3/4 ? Color.YELLOW : Color.GREEN;
	}

    protected initLayers(): void {
        // Add a layer for UI
        this.addUILayer(HW3Layers.UI);
        // Add a layer for players and enemies
        this.addLayer(HW3Layers.PRIMARY);
    }

    protected initializeTilemap(): void {
        if (this.tilemapKey === undefined || this.tilemapScale === undefined) {
            throw new Error("Cannot add the homework 4 tilemap unless the tilemap key and scale are set.");
        }
        // Add the tilemap to the scene
        this.add.tilemap(this.tilemapKey, this.tilemapScale);

        if (this.destructibleLayerKey === undefined || this.wallsLayerKey === undefined) {
            throw new Error("Make sure the keys for the destuctible layer and wall layer are both set");
        }

        this.walls = this.getTilemap(this.wallsLayerKey) as OrthogonalTilemap;
        this.destructable = this.getTilemap(this.destructibleLayerKey) as OrthogonalTilemap;
        this.death = this.getTilemap(this.deathLayerKey) as OrthogonalTilemap;
        if (this.grappleOnlyLayerKey) this.grappleOnly = this.getTilemap(this.grappleOnlyLayerKey) as OrthogonalTilemap;
        if (this.iceLayerKey) this.ice = this.getTilemap(this.iceLayerKey) as OrthogonalTilemap;
        this.walls.addPhysics();
        this.destructable.addPhysics();
        this.destructable.setGroup("DESTRUCTABLE");
        this.destructable.setTrigger("WEAPON", "PARTICLE", undefined);
        this.walls.setGroup("GROUND");
        this.death.addPhysics();
        this.death.setGroup("DEATH");
        this.death.setTrigger("PLAYER", "DYING", undefined);
        if (this.grappleOnlyLayerKey) {
            console.log("Adding physics to grapple only layer")
            this.grappleOnly.addPhysics();
            this.grappleOnly.setGroup("GRAPPLE_ONLY");
            this.grappleOnly.setTrigger("WEAPON", "PARTICLE", undefined);
        }
        if (this.iceLayerKey) {
            console.log("Adding physics to ice layer")
            this.ice.addPhysics();
            this.ice.setGroup("ICE");
        }
    }

    protected subscribeToEvents(): void {
        this.receiver.subscribe(HW3Events.PLAYER_ENTERED_LEVEL_END);
        this.receiver.subscribe(HW3Events.LEVEL_START);
        this.receiver.subscribe(HW3Events.LEVEL_END);
        this.receiver.subscribe(HW3Events.HEALTH_CHANGE);
        this.receiver.subscribe(HW3Events.PLAYER_DEAD);
        this.receiver.subscribe("PARTICLE");
        this.receiver.subscribe("DYING");
        this.receiver.subscribe(HW3Events.INVINCIBILITY);
        this.receiver.subscribe(HW3Events.KILL_BOSS);
        this.receiver.subscribe("PAUSE");
        this.receiver.subscribe("UNPAUSE");
    }

    protected initializeUI(): void {

        /* // HP Label
		this.healthLabel = <Label>this.add.uiElement(UIElementType.LABEL, HW3Layers.UI, {position: new Vec2(15, 15), text: "HP "});
		this.healthLabel.size.set(300, 30);
		this.healthLabel.fontSize = 24;
        this.healthLabel.font = "MyFont"; */

        // HealthBar
        this.healthBar = <Label>this.add.uiElement(UIElementType.LABEL, HW3Layers.UI, { position: new Vec2(81, 24), text: ""});
		this.healthBar.size = new Vec2(265, 38);
		this.healthBar.backgroundColor = Color.CYAN;
        this.healthBar.borderRadius = 20;

        // HealthBar Border
		this.healthBarBg = <Label>this.add.uiElement(UIElementType.LABEL, HW3Layers.UI, {position: new Vec2(81, 24), text: ""});
		this.healthBarBg.size = new Vec2(265, 38);
        this.healthBarBg.borderColor = Color.BLACK;
        this.healthBarBg.borderRadius = 20;
        this.healthBarBg.borderWidth = 2;

        // HealthBar Frame
        this.healthFrame = this.add.sprite(HW3Level.healthFrameKey, HW3Layers.UI);
        this.healthFrame.position.set(60, 27);
        this.healthFrame.scale.set(0.12, 0.12);

        // End of level label (start off screen)
        this.levelEndLabel = <Label>this.add.uiElement(UIElementType.LABEL, HW3Layers.UI, { position: new Vec2(-300, 100), text: "Level Complete" });
        this.levelEndLabel.size.set(1200, 60);
        this.levelEndLabel.borderRadius = 0;
        this.levelEndLabel.backgroundColor = new Color(34, 32, 52);
        this.levelEndLabel.textColor = Color.WHITE;
        this.levelEndLabel.fontSize = 48;
        this.levelEndLabel.font = "MyFont";

        // Tutorial Textbox
        this.tutorialText = <Label>this.add.uiElement(UIElementType.LABEL, HW3Layers.UI, { position: new Vec2(220, 30), text: "Use A and D to move left and right." });
        this.tutorialText.size.set(550, 180);
        this.tutorialText.borderRadius = 25;
        this.tutorialText.backgroundColor = new Color(34, 32, 52, 0);
        this.tutorialText.textColor = Color.WHITE;
        this.tutorialText.textColor.a = 0;
        this.tutorialText.fontSize = 24;
        this.tutorialText.font = "MyFont";

        this.tutorialText.tweens.add("fadeIn", {
            startDelay: 0,
            duration: 500,
            effects: [
                {
                    property: "backgroundColor.alpha",
                    start: 0,
                    end: 1,
                    ease: EaseFunctionType.IN_OUT_QUAD
                }, 
                {
                    property: "textColor.alpha",
                    start: 0,
                    end: 1,
                    ease: EaseFunctionType.IN_OUT_QUAD
                }
            ]
        });
        this.tutorialText.tweens.add("fadeOut", {
            startDelay: 0,
            duration: 500,
            effects: [
                {
                    property: "backgroundColor.alpha",
                    start: 1,
                    end: 0,
                    ease: EaseFunctionType.IN_OUT_QUAD
                },
                {
                    property: "textColor.alpha",
                    start: 1,
                    end: 0,
                    ease: EaseFunctionType.IN_OUT_QUAD
                }
            ]
        });

        // Add a tween to move the label on screen
        this.levelEndLabel.tweens.add("slideIn", {
            startDelay: 0,
            duration: 1000,
            effects: [
                {
                    property: TweenableProperties.posX,
                    start: -300,
                    end: 150,
                    ease: EaseFunctionType.OUT_SINE
                }
            ]
        });

        this.levelTransitionScreen = <Rect>this.add.graphic(GraphicType.RECT, HW3Layers.UI, { position: new Vec2(300, 200), size: new Vec2(600, 400) });
        this.levelTransitionScreen.color = new Color(34, 32, 52);
        this.levelTransitionScreen.alpha = 1;

        this.levelTransitionScreen.tweens.add("fadeIn", {
            startDelay: 0,
            duration: 1000,
            effects: [
                {
                    property: TweenableProperties.alpha,
                    start: 0,
                    end: 1,
                    ease: EaseFunctionType.IN_OUT_QUAD
                }
            ],
            onEnd: HW3Events.LEVEL_END
        });
        this.levelTransitionScreen.tweens.add("fadeOut", {
            startDelay: 0,
            duration: 1000,
            effects: [
                {
                    property: TweenableProperties.alpha,
                    start: 1,
                    end: 0,
                    ease: EaseFunctionType.IN_OUT_QUAD
                }
            ],
            onEnd: HW3Events.LEVEL_START
        });

        this.pauseMenu = <Rect>this.add.graphic(GraphicType.RECT, HW3Layers.UI, { position: new Vec2(300, 200), size: new Vec2(600, 400) });
        this.pauseMenu.color = new Color(34, 32, 52);
        this.pauseMenu.alpha = 0;

        this.pauseMenu.tweens.add("fadeIn", {
            startDelay: 0,
            duration: 200,
            effects: [
                {
                    property: TweenableProperties.alpha,
                    start: 0,
                    end: 0.5,
                    ease: EaseFunctionType.IN_OUT_QUAD
                }
            ]
        });
        this.pauseMenu.tweens.add("fadeOut", {
            startDelay: 0,
            duration: 200,
            effects: [
                {
                    property: TweenableProperties.alpha,
                    start: 0.5,
                    end: 0,
                    ease: EaseFunctionType.IN_OUT_QUAD
                }
            ]
        });
    }

    protected initializeWeaponSystem(): void {
        this.playerWeaponSystem = new PlayerWeapon(1, Vec2.ZERO, 1000, 2, 0, 1);
        this.playerWeaponSystem.initializePool(this, HW3Layers.PRIMARY);
    }

    protected initializeGrappleSystem(): void {
        this.playerGrappleSystem = new PlayerGrapple(1, Vec2.ZERO, 1000, 2, 0, 1);
        this.playerGrappleSystem.initializePool(this, HW3Layers.PRIMARY);
        /* this.grappleLine = <Line>this.add.graphic(GraphicType.LINE, HW3Layers.PRIMARY, {"start": Vec2.ZERO, "end": Vec2.ZERO}) */
        this.playerGrappleSystem.initializeLine(this, HW3Layers.PRIMARY);
    }

    protected initializePlayer(key: string): void {
        if (this.playerWeaponSystem === undefined) {
            throw new Error("Player weapon system must be initialized before initializing the player!");
        }
        if (this.playerSpawn === undefined) {
            throw new Error("Player spawn must be set before initializing the player!");
        }

        this.player = this.add.animatedSprite(key, HW3Layers.PRIMARY);
        this.player.scale.set(0.5, 0.5);
        this.player.position.copy(this.playerSpawn);
        
        this.player.addPhysics(new AABB(this.player.position.clone(), this.player.boundary.getHalfSize().clone()));

        this.player.addAI(PlayerController, { 
            weaponSystem: this.playerWeaponSystem, 
            grappleSystem: this.playerGrappleSystem,
            tilemap: "Destructable" 
        });
    }
    protected initializeEnemy(key: string): void {
        this.enemyGrappleSystem = new PlayerGrapple(1, Vec2.ZERO, 1000, 2, 0, 1);
        this.enemyGrappleSystem.initializePool(this, HW3Layers.PRIMARY);
        /* this.grappleLine = <Line>this.add.graphic(GraphicType.LINE, HW3Layers.PRIMARY, {"start": Vec2.ZERO, "end": Vec2.ZERO}) */
        this.enemyGrappleSystem.initializeLine(this, HW3Layers.PRIMARY);

        this.enemyWeaponSystem = new EnemyWeapon(50, Vec2.ZERO, 1000, 3, 0, 50);
        this.enemyWeaponSystem.initializePool(this, HW3Layers.PRIMARY);

        // Add the enemy to the scene
        this.enemy = this.add.animatedSprite(key, HW3Layers.PRIMARY);
        this.enemy.scale.set(0.5, 0.5);
        this.enemy.position.copy(this.enemySpawn);
        
        // Give the enemy physics
        this.enemy.addPhysics(new AABB(this.enemy.position.clone(), this.enemy.boundary.getHalfSize().clone()));

        this.enemy.addAI(EnemyController, {
            weaponSystem: this.enemyWeaponSystem,
            grappleSystem: this.enemyGrappleSystem,
            tilemap: "Destructable",
            player: this.player,
            enemy_in_present: this.enemy_in_present
        });
    }
    /**
     * Initializes the viewport
     */
    protected initializeViewport(): void {
        if (this.player === undefined) {
            throw new Error("Player must be initialized before setting the viewport to folow the player");
        }
        this.viewport.follow(this.player);
        this.viewport.setZoomLevel(4);
        this.viewport.enableZoom();
        this.viewport.setBounds(0, 0, 512, 512);
    }

    protected initializeLevelEnds(): void {
        if (!this.layers.has(HW3Layers.PRIMARY)) {
            throw new Error("Can't initialize the level ends until the primary layer has been added to the scene!");
        }
        
        this.levelEndArea = <Rect>this.add.graphic(GraphicType.RECT, HW3Layers.PRIMARY, { position: this.levelEndPosition, size: this.levelEndHalfSize });
        this.levelEndArea.addPhysics(undefined, undefined, false, true);
        this.levelEndArea.setTrigger(HW3PhysicsGroups.PLAYER, HW3Events.PLAYER_ENTERED_LEVEL_END, null);
        this.levelEndArea.color = new Color(255, 0, 255, .20);

        this.levelEnd2Area = <Rect>this.add.graphic(GraphicType.RECT, HW3Layers.PRIMARY, { position: this.levelEnd2Position, size: this.levelEnd2HalfSize });
        this.levelEnd2Area.addPhysics(undefined, undefined, false, true);
        this.levelEnd2Area.setTrigger(HW3PhysicsGroups.PLAYER, HW3Events.PLAYER_ENTERED_LEVEL_END, null);
        this.levelEnd2Area.color = new Color(255, 0, 255, .20);
        
    }

    protected initializeThePast(): void {
        if (!this.layers.has(HW3Layers.PRIMARY)) {
            throw new Error("Can't initialize the past until the primary layer has been added to the scene!");
        }
        this.pastArea = <Rect>this.add.graphic(GraphicType.RECT, HW3Layers.PRIMARY, { position: this.pastPosition, size: this.pastHalfSize });
        this.pastArea.color = new Color(184, 177, 53, .25);
    }

    public getJumpAudioKey(): string {
        return this.jumpAudioKey;
    }
    public getDamagedAudioKey(): string {
        return this.damagedAudioKey;
    }
    public getDeadgeAudioKey(): string {
        return this.deadgeAudioKey;
    }
}