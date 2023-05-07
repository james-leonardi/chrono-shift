import StateMachineAI from "../../Wolfie2D/AI/StateMachineAI";
import Vec2 from "../../Wolfie2D/DataTypes/Vec2";
import OrthogonalTilemap from "../../Wolfie2D/Nodes/Tilemaps/OrthogonalTilemap";
import GameEvent from "../../Wolfie2D/Events/GameEvent";
import { GameEventType } from "../../Wolfie2D/Events/GameEventType";

import Fall from "./EnemyStates/Fall";
import Idle from "./EnemyStates/Idle";
import Jump from "./EnemyStates/Jump";
import Walk from "./EnemyStates/Walk";
import Dash from "./EnemyStates/Dash";

import EnemyWeapon from "./EnemyWeapon";
import EnemyGrapple from "./EnemyGrapple";
import Input from "../../Wolfie2D/Input/Input";
import Receiver from "../../Wolfie2D/Events/Receiver";

import { HW3Controls } from "../HW3Controls";
import HW3AnimatedSprite from "../Nodes/HW3AnimatedSprite";
import MathUtils from "../../Wolfie2D/Utils/MathUtils";
import { HW3Events } from "../HW3Events";
import Dead from "./EnemyStates/Dead";
import { HW3PhysicsGroups } from "../HW3PhysicsGroups";
import Line from "../../Wolfie2D/Nodes/Graphics/Line";

// TODO play your heros animations

/**
 * Animation keys for the enemy spritesheet
 */
export const EnemyAnimations = {
    IDLE: "IDLE",
    WALK: "WALK",
    JUMP: "JUMP",
    TAKING_DAMAGE: "TAKING_DAMAGE",
    DYING: "DYING",
    DEATH: "DEAD",
    GRAPPLE: "GRAPPLE"
} as const

/**
 * Tween animations the enemy can play.
 */
/* export const EnemyTweens = {
    FLIP: "FLIP",
    FLIPL: "FLIPL",
    FLIPR: "FLIPR",
    DEATH: "DEATH"
} as const */

/**
 * Keys for the states the EnemyController can be in.
 */
export const EnemyStates = {
    IDLE: "IDLE",
    WALK: "WALK",
	JUMP: "JUMP",
    FALL: "FALL",
    DEAD: "DEAD",
    DASH: "DASH"
} as const

/**
 * The controller that controls the enemy.
 */
export default class EnemyController extends StateMachineAI {
    public readonly MAX_SPEED: number = 200;
    public readonly MIN_SPEED: number = 100;

    /** Health and max health for the enemy */
    protected _health: number;
    protected _maxHealth: number;

    /** The enemy's game node */
    protected owner: HW3AnimatedSprite;

    protected _velocity: Vec2;
	protected _speed: number;

    protected tilemap: OrthogonalTilemap;
    // protected cannon: Sprite;
    protected weapon: EnemyWeapon;
    protected grapple: EnemyGrapple;
    protected grapple_line: Line;
    protected grapple_last_used: number;
    protected grapple_cooldown: number = 750;
    protected grapple_enabled: boolean = true;

    protected mou_shindeiru: boolean = false;
    protected switchedQ: boolean = false;
    protected switch_last_used: number;
    protected switch_cooldown: number = 500;
    protected switch_dist_x: number = 0;
    protected switch_dist_y: number = 2240;

    protected peek_offset: number = 0;
    protected peeking: boolean = false;
    protected dash: boolean = true;
    protected invincible: boolean = false;
    protected receiver: Receiver;
    protected player: HW3AnimatedSprite;

    protected enable: boolean;
    protected paused: boolean = false;

    
    public initializeAI(owner: HW3AnimatedSprite, options: Record<string, any>) {
        this.owner = owner;
        this.player = options.player;
        this.enable = options.enemy_in_present;

        this.weapon = options.weaponSystem;
        this.grapple = options.grappleSystem;
        this.grapple_last_used = 0;
        this.switch_last_used = 0;
        // todo: remove
        // this.owner.setGroup(HW3PhysicsGroups.ENEMY);
        // this.owner.setTrigger(HW3PhysicsGroups.PLAYER_WEAPON, HW3Events.KILL_BOSS, undefined);

        this.receiver = new Receiver();
        this.receiver.subscribe(HW3Events.LEVEL_CHANGE);  // todo: unload on level change?
        this.receiver.subscribe(HW3Events.PERSPECTIVE);
        this.receiver.subscribe(HW3Events.KILL_ENEMY);
        this.receiver.subscribe(HW3Events.ENEMY_DEAD);
        this.receiver.subscribe("ENEMY_CLOSE");
        // this.receiver.subscribe(HW3Events.GRAPPLE_HIT);
        // this.receiver.subscribe("DYING");
        this.tilemap = this.owner.getScene().getTilemap(options.tilemap) as OrthogonalTilemap;
        this.speed = 400;
        this.velocity = Vec2.ZERO;

        this.health = 5
        this.maxHealth = 5;

        // Add the different states the enemy can be in to the EnemyController 
		this.addState(EnemyStates.IDLE, new Idle(this, this.owner));
		this.addState(EnemyStates.WALK, new Walk(this, this.owner));
        this.addState(EnemyStates.JUMP, new Jump(this, this.owner));
        this.addState(EnemyStates.FALL, new Fall(this, this.owner));
        this.addState(EnemyStates.DEAD, new Dead(this, this.owner));
        this.addState(EnemyStates.DASH, new Dash(this, this.owner))
        
        // Start the enemy in the Idle state
        this.initialize(EnemyStates.IDLE);
    }

    handleEvent(event: GameEvent): void {
        switch (event.type) {
            case HW3Events.PERSPECTIVE: {  // Todo: potentially differentiate peeking and switching
                if (this.enable) {
                    this.enable = false;
                    this.owner.freeze();
                    this.owner.disablePhysics();
                    this.owner.visible = false;
                } else {
                    this.enable = true;
                    this.owner.unfreeze();
                    this.owner.enablePhysics();
                    this.owner.visible = true;
                }
            }
            case "ENEMY_CLOSE": {
                if (this.enable && !this.weapon.isSystemRunning()) {
                    const playerPos: Vec2 = event.data.get("playerPos");
                    if (playerPos !== undefined && this.owner.position.distanceTo(playerPos) > 100) break;
                    this.weapon.setPlayerPos(playerPos?.clone());
                    this.weapon.startSystem(500, 0, this.owner.position.clone());
                }
                break;
            }
            case HW3Events.KILL_ENEMY: {
                if (event.data.get("node") !== this.owner.id) break;
                console.log("KILL ENEMY RECEIVED");
                this.changeState(EnemyStates.DEAD);
                this.owner.setAIActive(false, undefined);
                break;
            }
            case HW3Events.ENEMY_DEAD: {
                // this.owner.position.set(-1000, -1000);
                /* this.owner.setAIActive(false, undefined); */
                break;
            }
            // case HW3Events.GRAPPLE_HIT: {
            //     console.log("Grapple!");
            //     //if (this.owner.onGround || this.velocity.y < 0) this.velocity.y = 0;
            //     this.emitter.fireEvent(GameEventType.PLAY_SOUND, { key: "ZIP_" + Math.floor(Math.random() * 2), loop: false, holdReference: false });
            //     this.velocity.mult(Vec2.ZERO);
            //     this.velocity.add(event.data.get('velocity'));
            //     /* if (this.owner.onGround || this.velocity.y < 0) this.velocity = event.data.get('velocity');
            //     else {
            //         this.velocity.x += event.data.get('velocity').x;
            //         this.velocity.y += event.data.get('velocity').y*2;
            //     } */
            //     /* this.changeState(EnemyStates.IDLE); */
            //     /* this.owner.move(event.data.get('velocity')); */
            //     break;
            // }
            // case "DYING": {
            //     if(!this.invincible) this.changeState(EnemyStates.DEAD);
            //     break;
            // }
            default: {
                // console.log("DEFAULT");
            }
        }
    }

    /** 
	 * Get the inputs from the keyboard, or Vec2.Zero if nothing is being pressed
	 */
    public get inputDir(): Vec2 {
        let direction = Vec2.ZERO;
		// direction.x = (Input.isPressed(HW3Controls.MOVE_LEFT) ? -1 : 0) + (Input.isPressed(HW3Controls.MOVE_RIGHT) ? 1 : 0);
		// direction.y = (Input.isJustPressed(HW3Controls.JUMP) ? -1 : 0);
		return direction;
    }
    /** 
     * Gets the direction of the mouse from the enemy's position as a Vec2
     */
    public get faceDir(): Vec2 { return this.owner.position.dirTo(this.player.position); }

    public update(deltaT: number): void {
        if (this.mou_shindeiru) return;
		super.update(deltaT);
        while (this.receiver.hasNextEvent()) {
            this.handleEvent(this.receiver.getNextEvent());
        }

        // DO AI STUFF HERE
        if (this.enable) {
            // console.log(this.owner.position.x + " " + this.owner.position.y);
        }

        if (Input.isJustPressed(HW3Controls.PAUSE)) {
            if (this.paused) {
                this.owner.unfreeze(); this.owner.enablePhysics(); this.paused = false;
                this.grapple.resumeSystem(); this.weapon.resumeSystem();
            } else {
                this.owner.freeze(); this.owner.disablePhysics(); this.paused = true;
                if (this.grapple.isSystemRunning()) this.grapple.pauseSystem();
                if (this.weapon.isSystemRunning()) this.weapon.pauseSystem();
            }
        }
        // const tile = this.tilemap.getColRowAt(this.owner.position);
        // if (!this.peeking && !this.invincible && (this.owner.getScene().getTilemap("Main") as OrthogonalTilemap).isTileCollidable(tile.x, tile.y)) {
        //     this.emitter.fireEvent("DYING"); this.changeState(EnemyStates.DEAD); this.mou_shindeiru = true; return;
        // }

        // // If the enemy hits the attack button and the weapon system isn't running, restart the system and fire!

        // // Detect right-click and handle with grapple firing
        // if (this.grapple_enabled && Input.isMouseJustPressed(2) && !this.grapple.isSystemRunning()) {
        //     if (!this.grapple_last_used || (Date.now() - this.grapple_last_used) > this.grapple_cooldown) {
        //         this.grapple_last_used = Date.now();
        //         this.grapple.setDir(Input.getGlobalMousePosition());
        //         this.grapple.startSystem(500, 0, this.owner.position);
        //         //this.grapple.render_line(this.owner.position);
        //         this.owner.animation.play("GRAPPLE", false, undefined);
        //         this.owner.animation.queue("IDLE", false, undefined);
        //         /* console.log("GRAPPLE_" + Math.floor(Math.random() * 3)); */
        //         /* this.emitter.fireEvent(GameEventType.PLAY_SOUND, { key: "GRAPPLE_" + Math.floor(Math.random()*3), loop: false, holdReference: false }); */

        //         this.emitter.fireEvent(GameEventType.PLAY_SOUND, { key: "PSHH", loop: false, holdReference: false });
        //     } else console.log("CD!");
        // } else if ((Input.isPressed(HW3Controls.ATTACK) || Input.isMouseJustPressed(0)) && !this.weapon.isSystemRunning()) {
        //     // Start the particle system at the enemy's current position
        //     this.weapon.startSystem(500, 0, this.owner.position);
        //     this.owner.animation.play((this.faceDir.x < 0) ? "ATTACKING_LEFT" : "ATTACKING_RIGHT", false, undefined);
        //     this.owner.animation.queue("IDLE", false, undefined);
        // }
        
        // /* if (this.grapple.isSystemRunning())  */this.grapple.renderLine(this.owner.position/* , 1 */);

        // /* this.grapple.isSystemRunning() ?
        //     this.grapple.renderLine(this.owner.position, 1) :
        //     this.grapple.renderLine(this.owner.position, 0) */

        // // Handle switching when the switch key is pressed
        // if (Input.isPressed(HW3Controls.SWITCH) && !this.peeking && !this.grapple.isSystemRunning()) {
        //     if (!this.switch_last_used || (Date.now() - this.switch_last_used) > this.switch_cooldown) {
        //         if (!this.switchedQ) { this.switchedQ = true; return }
        //         this.switchedQ = false;
        //         this.switch_last_used = Date.now();
        //         this.emitter.fireEvent("SWITCH");
        //         this.emitter.fireEvent(GameEventType.PLAY_SOUND, { key: ((this.owner.position.y < this.switch_dist_y) ? "SWITCH_1" : "SWITCH_2"), loop: false, holdReference: false });
        //         const newPos = (this.owner.position.y < this.switch_dist_y) ? this.switch_dist_y : -this.switch_dist_y;
        //         console.log(`New pos: ${newPos}`);
        //         const tile = this.tilemap.getColRowAt(new Vec2(this.owner.position.x, this.owner.position.y + newPos));
        //         if ((this.owner.getScene().getTilemap("Main") as OrthogonalTilemap).isTileCollidable(tile.x, tile.y)) {
        //             console.log("COLLIDABLE!");
        //         } else {
        //             console.log("Switch!");
        //             console.log(`Old coordinates: ${this.owner.position.x} ${this.owner.position.y}`)
        //             this.owner.position.y += newPos;
        //             console.log(`New coordinates: ${this.owner.position.x} ${this.owner.position.y}`)
        //         }
        //         /* this.owner.position.x += (this.owner.position.x < this.switch_dist_x) ? this.switch_dist_x : -this.switch_dist_x; */
        //     } else console.log("CD!");
        // }

        // // Handle peeking
        // if (Input.isPressed(HW3Controls.PEEK) && !this.peeking && !this.grapple.isSystemRunning()) {
            
        //     const newPos = (this.owner.position.y < this.switch_dist_y) ? this.switch_dist_y : -this.switch_dist_y;
        //     const tile = this.tilemap.getColRowAt(new Vec2(this.owner.position.x, this.owner.position.y + newPos));
        //     /* if (!(this.owner.getScene().getTilemap("Main") as OrthogonalTilemap).isTileCollidable(tile.x, tile.y)) { */
        //         this.peeking = true
        //         this.owner.position.y += (this.owner.position.y < this.switch_dist_y) ? this.switch_dist_y : -this.switch_dist_y;
        //         this.owner.freeze(); this.owner.disablePhysics(); this.owner.visible = false;
        //     /* } */
        // } 
        // if (!Input.isPressed(HW3Controls.PEEK) && this.peeking) {
        //     this.peeking = false;
        //     this.owner.position.y += (this.owner.position.y < this.switch_dist_y) ? this.switch_dist_y : -this.switch_dist_y;
        //     this.owner.unfreeze(); this.owner.enablePhysics(); this.owner.visible = true;
        // }

        // // Invincibility Cheat
        // if (Input.isJustPressed(HW3Controls.INVINCIBLE)) {
        //     this.is_invincible = !this.is_invincible;
        //     console.log("Invincibility: " + this.invincible);
        // }

        // // Level Change Cheats
        // if (Input.isJustPressed(HW3Controls.LEVEL1)) {
        //     this.emitter.fireEvent(HW3Events.LEVEL_CHANGE, { level: "1"});
        // }
        // else if(Input.isJustPressed(HW3Controls.LEVEL2)) {
        //     this.emitter.fireEvent(HW3Events.LEVEL_CHANGE, { level: "2"});
        // }
        // else if(Input.isJustPressed(HW3Controls.LEVEL3)) {
        //     this.emitter.fireEvent(HW3Events.LEVEL_CHANGE, { level: "3"});
        // }
        // else if(Input.isJustPressed(HW3Controls.LEVEL4)) {
        //     this.emitter.fireEvent(HW3Events.LEVEL_CHANGE, { level: "4"});
        // }
        // else if(Input.isJustPressed(HW3Controls.LEVEL5)) {
        //     this.emitter.fireEvent(HW3Events.LEVEL_CHANGE, { level: "5"});
        // }
        // else if(Input.isJustPressed(HW3Controls.LEVEL6)) {
        //     this.emitter.fireEvent(HW3Events.LEVEL_CHANGE, { level: "6"});
        // }
	}

    public get velocity(): Vec2 { return this._velocity; }
    public set velocity(velocity: Vec2) { this._velocity = velocity; }

    public get speed(): number { return this._speed; }
    public set speed(speed: number) { this._speed = speed; }

    public get maxHealth(): number { return this._maxHealth; }
    public set maxHealth(maxHealth: number) { 
        this._maxHealth = maxHealth; 
        // When the health changes, fire an event up to the scene.
        this.emitter.fireEvent(HW3Events.HEALTH_CHANGE, {curhp: this.health, maxhp: this.maxHealth});
    }

    public get health(): number { return this._health; }
    public set health(health: number) { 
        this._health = MathUtils.clamp(health, 0, this.maxHealth);
        // When the health changes, fire an event up to the scene.
        this.emitter.fireEvent(HW3Events.HEALTH_CHANGE, {curhp: this.health, maxhp: this.maxHealth});
        /* this.owner.animation.play("TAKING_DAMAGE");
        this.owner.animation.queue("IDLE", false, undefined); */
        // If the health hit 0, change the state of the enemy
        if (this.health === 0 && !this.invincible) { 
            this.changeState(EnemyStates.DEAD); 
            this.emitter.fireEvent("DYING");
        }
    }

    public get has_dash(): boolean { return this.dash; }
    public set has_dash(dash: boolean) { this.dash = dash; } 

    public get is_invincible(): boolean { return this.invincible; }
    public set is_invincible(invincible: boolean) {
        this.invincible = invincible;
        this.emitter.fireEvent(HW3Events.INVINCIBILITY, { "value": invincible });
    } 
}