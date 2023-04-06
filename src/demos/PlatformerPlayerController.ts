import ControllerAI from "../Wolfie2D/AI/ControllerAI";
import AI from "../Wolfie2D/DataTypes/Interfaces/AI";
import Emitter from "../Wolfie2D/Events/Emitter";
import Receiver from "../Wolfie2D/Events/Receiver";
import GameEvent from "../Wolfie2D/Events/GameEvent";
import { GameEventType } from "../Wolfie2D/Events/GameEventType";
import Input from "../Wolfie2D/Input/Input";
import AnimatedSprite from "../Wolfie2D/Nodes/Sprites/AnimatedSprite";
import { HW3Events } from "../hw3/HW3Events";

export default class PlayerController extends ControllerAI {
    public owner: AnimatedSprite;
    protected jumpSoundKey: string;
    protected emitter: Emitter;
    protected receiver: Receiver;

    initializeAI(owner: AnimatedSprite, options: Record<string, any>): void {
        this.owner = owner;
        this.jumpSoundKey = options.jumpSoundKey;
        this.emitter = new Emitter();
        this.receiver = new Receiver();
        this.receiver.subscribe(HW3Events.GRAPPLE_HIT);
    }

    activate(options: Record<string, any>): void {}

    handleEvent(event: GameEvent): void {
        switch(event.type) {
            case HW3Events.GRAPPLE_HIT: {
                console.log("Grapple!");
                this.owner.move(event.data.get('velocity'));
                break;
            }
            default: {
                console.log("DEFAULT");
            }
        }
    }

    update(deltaT: number): void {
        console.log("UPDATE!");
        while (this.receiver.hasNextEvent()) {
            this.handleEvent(this.receiver.getNextEvent());
        }
        // Get the direction from key presses
        const x = (Input.isPressed("left") ? -1 : 0) + (Input.isPressed("right") ? 1 : 0);
        
        // Get last velocity and override x
        const velocity = this.owner.getLastVelocity();
        velocity.x = x * 100 * deltaT;

        // Check for jump condition
        if(this.owner.onGround && Input.isJustPressed("jump")){
            // We are jumping
            velocity.y = -250*deltaT;

            // Loop our jump animation
            this.owner.animation.play("JUMP", true);

            // Play the jump sound
            this.emitter.fireEvent(GameEventType.PLAY_SOUND, {key: this.jumpSoundKey, loop: false});
        } else {
            velocity.y += 10*deltaT;
        }

        if(this.owner.onGround && !Input.isJustPressed("jump")){
            // If we're on the ground, but aren't jumping, show walk animation
            if(velocity.x === 0){
                    this.owner.animation.playIfNotAlready("IDLE", true);
            } else {
                this.owner.animation.playIfNotAlready("WALK", true);
            }
        }

        // If we're walking left, flip the sprite
        this.owner.invertX = velocity.x < 0;
        
        this.owner.move(velocity);
    }
}