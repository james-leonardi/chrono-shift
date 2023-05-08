import StateMachineAI from "../../Wolfie2D/AI/StateMachineAI";
import Vec2 from "../../Wolfie2D/DataTypes/Vec2";
import OrthogonalTilemap from "../../Wolfie2D/Nodes/Tilemaps/OrthogonalTilemap";
import GameEvent from "../../Wolfie2D/Events/GameEvent";
import { GameEventType } from "../../Wolfie2D/Events/GameEventType";

import Fall from "./PlayerStates/Fall";
import Idle from "./PlayerStates/Idle";
import Jump from "./PlayerStates/Jump";
import Walk from "./PlayerStates/Walk";
import Dash from "./PlayerStates/Dash";

import PlayerWeapon from "./PlayerWeapon";
import PlayerGrapple from "./PlayerGrapple";
import Input from "../../Wolfie2D/Input/Input";
import Receiver from "../../Wolfie2D/Events/Receiver";

import { HW3Controls } from "../HW3Controls";
import HW3AnimatedSprite from "../Nodes/HW3AnimatedSprite";
import MathUtils from "../../Wolfie2D/Utils/MathUtils";
import { HW3Events } from "../HW3Events";
import Dead from "./PlayerStates/Dead";
import { HW3PhysicsGroups } from "../HW3PhysicsGroups";
import Line from "../../Wolfie2D/Nodes/Graphics/Line";

/**
 * Animation keys for the player spritesheet
 */
export const PlayerAnimations = {
    IDLE: "IDLE",
    WALK: "WALK",
    JUMP: "JUMP",
    TAKING_DAMAGE: "TAKING_DAMAGE",
    DYING: "DYING",
    DEATH: "DEAD",
    GRAPPLE: "GRAPPLE",
    ATTACKING: "ATTACKING"
} as const

/**
 * Keys for the states the PlayerController can be in.
 */
export const PlayerStates = {
    IDLE: "IDLE",
    WALK: "WALK",
	JUMP: "JUMP",
    FALL: "FALL",
    DEAD: "DEAD",
    DASH: "DASH"
} as const

/**
 * The controller that controls the player.
 */
export default class PlayerController extends StateMachineAI {
    public readonly MAX_SPEED: number = 200;
    public readonly MIN_SPEED: number = 100;

    protected _health: number;
    protected _maxHealth: number;

    protected owner: HW3AnimatedSprite;

    protected _velocity: Vec2;
	protected _speed: number;

    protected tilemap: OrthogonalTilemap;
    protected weapon: PlayerWeapon;
    protected weapon_last_used: number;
    protected weapon_cooldown: number = 500;
    protected grapple: PlayerGrapple;
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
    protected paused: boolean = false;

    protected lastHitTime: Date = new Date();

    protected receiver: Receiver;

    
    public initializeAI(owner: HW3AnimatedSprite, options: Record<string, any>){
        this.owner = owner;

        this.weapon = options.weaponSystem;
        this.grapple = options.grappleSystem;
        this.grapple_last_used = 0;
        this.weapon_last_used = 0;
        this.switch_last_used = 0;
        this.owner.setGroup(HW3PhysicsGroups.PLAYER);

        this.receiver = new Receiver();
        this.receiver.subscribe(HW3Events.GRAPPLE_HIT);
        this.receiver.subscribe(HW3Events.BULLET);
        this.receiver.subscribe("HIT_PLAYER");
        this.receiver.subscribe("DYING");
        this.tilemap = this.owner.getScene().getTilemap(options.tilemap) as OrthogonalTilemap;
        this.speed = 400;
        this.velocity = Vec2.ZERO;

        this.health = 5
        this.maxHealth = 5;

		this.addState(PlayerStates.IDLE, new Idle(this, this.owner));
		this.addState(PlayerStates.WALK, new Walk(this, this.owner));
        this.addState(PlayerStates.JUMP, new Jump(this, this.owner));
        this.addState(PlayerStates.FALL, new Fall(this, this.owner));
        this.addState(PlayerStates.DEAD, new Dead(this, this.owner));
        this.addState(PlayerStates.DASH, new Dash(this, this.owner))
        
        this.initialize(PlayerStates.IDLE);
    }

    handleEvent(event: GameEvent): void {
        switch (event.type) {
            case HW3Events.GRAPPLE_HIT: {
                console.log("Grapple!");
                this.emitter.fireEvent(GameEventType.PLAY_SOUND, { key: "ZIP_" + Math.floor(Math.random() * 2), loop: false, holdReference: false });
                this.velocity.mult(Vec2.ZERO);
                const scale = event.data.get("distance") / 100 * 0.25 + 0.75;
                this.velocity.add(event.data.get('velocity').scale(scale));
                break;
            }
            case "HIT_PLAYER": {
                if(!this.invincible) {
                    if (this.lastHitTime.getTime() + 1000 >= Date.now()) break;
                    console.log("Player hit!");
                    this.lastHitTime = new Date();
                    this.health--;
                    this.emitter.fireEvent(GameEventType.PLAY_SOUND, { key: "player_hit", loop: false, holdReference: false });
                    this.owner.animation.play(PlayerAnimations.TAKING_DAMAGE);
                    this.owner.animation.queue("IDLE", false, undefined);
                    if(this.health <= 0) {
                        this.changeState(PlayerStates.DEAD);
                    }

                }
                break;
            }
            case HW3Events.BULLET: {
                console.log("Bullet collision!");
                // TODO Replace with bullet collision sfx?
                //this.emitter.fireEvent(GameEventType.PLAY_SOUND, { key: "ZIP_" + Math.floor(Math.random() * 2), loop: false, holdReference: false });
                break;
            }
            case "DYING": {
                if(!this.invincible) this.changeState(PlayerStates.DEAD);
                break;
            }
        }
    }

    public get inputDir(): Vec2 {
        let direction = Vec2.ZERO;
		direction.x = (Input.isPressed(HW3Controls.MOVE_LEFT) ? -1 : 0) + (Input.isPressed(HW3Controls.MOVE_RIGHT) ? 1 : 0);
		direction.y = (Input.isJustPressed(HW3Controls.JUMP) ? -1 : 0);
		return direction;
    }

    public get faceDir(): Vec2 { return this.owner.position.dirTo(Input.getGlobalMousePosition()); }

    public update(deltaT: number): void {
        if (this.mou_shindeiru) return;
		super.update(deltaT);
        while (this.receiver.hasNextEvent()) {
            this.handleEvent(this.receiver.getNextEvent());
        }
        const tile = this.tilemap.getColRowAt(this.owner.position);
        if (!this.peeking && !this.invincible && (this.owner.getScene().getTilemap("Main") as OrthogonalTilemap).isTileCollidable(tile.x, tile.y)) {
            this.emitter.fireEvent("DYING"); this.changeState(PlayerStates.DEAD); this.mou_shindeiru = true; return;
        }

        // Detect right-click and handle with grapple firing
        if (this.grapple_enabled && Input.isMouseJustPressed(2) && !this.grapple.isSystemRunning() && !this.paused) {
            if (!this.grapple_last_used || (Date.now() - this.grapple_last_used) > this.grapple_cooldown) {
                this.grapple_last_used = Date.now();
                this.grapple.setDir(Input.getGlobalMousePosition());
                this.grapple.startSystem(500, 0, this.owner.position);
                this.owner.animation.play("GRAPPLE", false, undefined);
                this.owner.animation.queue("IDLE", false, undefined);

                this.emitter.fireEvent(GameEventType.PLAY_SOUND, { key: "PSHH", loop: false, holdReference: false });
            } else console.log("CD!");
        } else if ((Input.isPressed(HW3Controls.ATTACK) || Input.isMouseJustPressed(0)) && !this.grapple.isSystemRunning() && !this.paused) {
            if (!this.weapon_last_used || (Date.now() - this.weapon_last_used) > this.weapon_cooldown) {
                this.weapon_last_used = Date.now();
                this.weapon.startSystem(500, 0, this.owner.position);
                this.owner.animation.play("ATTACKING", false, undefined);
                this.owner.animation.queue("IDLE", false, undefined);
                this.emitter.fireEvent(GameEventType.PLAY_SOUND, { key: "SHOOT", loop: false, holdReference: false });
            } else console.log("CD!");
        }
        
        this.grapple.renderLine(this.owner.position);

        // Handle switching when the switch key is pressed
        if (Input.isPressed(HW3Controls.SWITCH) && !this.peeking && !this.grapple.isSystemRunning() && !this.paused) {
            if (!this.switch_last_used || (Date.now() - this.switch_last_used) > this.switch_cooldown) {
                if (!this.switchedQ) { this.switchedQ = true; return }
                this.switchedQ = false;
                this.switch_last_used = Date.now();
                this.emitter.fireEvent("SWITCH");
                this.emitter.fireEvent(GameEventType.PLAY_SOUND, { key: ((this.owner.position.y < this.switch_dist_y) ? "SWITCH_1" : "SWITCH_2"), loop: false, holdReference: false });
                const newPos = (this.owner.position.y < this.switch_dist_y) ? this.switch_dist_y : -this.switch_dist_y;
                console.log(`New pos: ${newPos}`);
                const tile = this.tilemap.getColRowAt(new Vec2(this.owner.position.x, this.owner.position.y + newPos));
                if ((this.owner.getScene().getTilemap("Main") as OrthogonalTilemap).isTileCollidable(tile.x, tile.y)) {
                    console.log("COLLIDABLE!");
                } else {
                    console.log("Switch!");
                    console.log(`Old coordinates: ${this.owner.position.x} ${this.owner.position.y}`)
                    this.owner.position.y += newPos;
                    console.log(`New coordinates: ${this.owner.position.x} ${this.owner.position.y}`)
                    this.emitter.fireEvent(HW3Events.PERSPECTIVE, { y: this.owner.position.y});
                }
            } else console.log("CD!");
        }

        // Handle peeking
        if (Input.isPressed(HW3Controls.PEEK) && !this.peeking && !this.grapple.isSystemRunning() && !this.paused) {
            const newPos = (this.owner.position.y < this.switch_dist_y) ? this.switch_dist_y : -this.switch_dist_y;
            const tile = this.tilemap.getColRowAt(new Vec2(this.owner.position.x, this.owner.position.y + newPos));
            this.peeking = true
            this.owner.position.y += (this.owner.position.y < this.switch_dist_y) ? this.switch_dist_y : -this.switch_dist_y;
            this.owner.freeze(); this.owner.disablePhysics(); this.owner.visible = false;
            this.emitter.fireEvent(HW3Events.PERSPECTIVE, { y: this.owner.position.y });
        } 
        if (!Input.isPressed(HW3Controls.PEEK) && this.peeking && !this.paused) {
            this.peeking = false;
            this.owner.position.y += (this.owner.position.y < this.switch_dist_y) ? this.switch_dist_y : -this.switch_dist_y;
            this.owner.unfreeze(); this.owner.enablePhysics(); this.owner.visible = true;
            this.emitter.fireEvent(HW3Events.PERSPECTIVE, { y: this.owner.position.y });
        }

        if(Input.isJustPressed(HW3Controls.GETPOS) && !this.paused) {
            console.log("Player Position: " + this.owner.position.toString() + "\n" + 
                "Mouse Position: " + Input.getGlobalMousePosition().toString());
        }

        // Invincibility Cheat
        if (Input.isJustPressed(HW3Controls.INVINCIBLE)) {
            this.is_invincible = !this.is_invincible;
            console.log("Invincibility: " + this.invincible);
        }

        if (Input.isJustPressed("CHANGE_FRAME")) {
            this.emitter.fireEvent("CHANGE_FRAME");
        }

        if (Input.isJustPressed(HW3Controls.PAUSE)) {
            if (this.paused) { 
                this.owner.unfreeze(); this.owner.enablePhysics(); this.paused = false; 
                this.grapple.resumeSystem(); this.weapon.resumeSystem();
                this.emitter.fireEvent("UNPAUSE");
            } else { 
                this.owner.freeze(); this.owner.disablePhysics(); this.paused = true;
                if (this.grapple.isSystemRunning()) this.grapple.pauseSystem(); 
                if (this.weapon.isSystemRunning()) this.weapon.pauseSystem();
                this.emitter.fireEvent("PAUSE");
            }
        }

        // Level Change Cheats
        if (Input.isJustPressed(HW3Controls.LEVEL1)) {
            this.emitter.fireEvent(HW3Events.LEVEL_CHANGE, { level: "1"});
        } else if (Input.isJustPressed(HW3Controls.LEVEL2)) {
            this.emitter.fireEvent(HW3Events.LEVEL_CHANGE, { level: "2"});
        } else if (Input.isJustPressed(HW3Controls.LEVEL3)) {
            this.emitter.fireEvent(HW3Events.LEVEL_CHANGE, { level: "3"});
        } else if (Input.isJustPressed(HW3Controls.LEVEL4)) {
            this.emitter.fireEvent(HW3Events.LEVEL_CHANGE, { level: "4"});
        } else if (Input.isJustPressed(HW3Controls.LEVEL5)) {
            this.emitter.fireEvent(HW3Events.LEVEL_CHANGE, { level: "5"});
        } else if (Input.isJustPressed(HW3Controls.LEVEL6)) {
            this.emitter.fireEvent(HW3Events.LEVEL_CHANGE, { level: "6"});
        }

        // Teleport to Cursor Cheat (press 'o')
        if (Input.isJustPressed(HW3Controls.TELEPORT) && !this.paused) {
            //this.owner.move(Input.getGlobalMousePosition());
            this.owner.position = Input.getGlobalMousePosition();
        }
	}

    public get velocity(): Vec2 { return this._velocity; }
    public set velocity(velocity: Vec2) { this._velocity = velocity; }

    public get speed(): number { return this._speed; }
    public set speed(speed: number) { this._speed = speed; }

    public get maxHealth(): number { return this._maxHealth; }
    public set maxHealth(maxHealth: number) { 
        this._maxHealth = maxHealth; 
        this.emitter.fireEvent(HW3Events.HEALTH_CHANGE, {curhp: this.health, maxhp: this.maxHealth});
    }

    public get health(): number { return this._health; }
    public set health(health: number) { 
        this._health = MathUtils.clamp(health, 0, this.maxHealth);
        this.emitter.fireEvent(HW3Events.HEALTH_CHANGE, {curhp: this.health, maxhp: this.maxHealth});
        if (this.health === 0 && !this.invincible) { 
            this.changeState(PlayerStates.DEAD); 
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