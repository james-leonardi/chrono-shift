import GameEvent from "../../../Wolfie2D/Events/GameEvent";
import { GameEventType } from "../../../Wolfie2D/Events/GameEventType";
import { EnemyAnimations, EnemyStates } from "../EnemyController";
import Input from "../../../Wolfie2D/Input/Input";
import { HW3Controls } from "../../HW3Controls";

import EnemyState from "./EnemyState";

export default class Jump extends EnemyState {

	public onEnter(options: Record<string, any>): void {
        console.log("JUMP ENTER");
        // Get the jump audio key for the enemy
        let jumpAudio = this.owner.getScene().getJumpAudioKey();
        /* console.log(this.parent.velocity.x); */
        /* if (this.parent.velocity.x > 0) this.owner.tweens.play(EnemyTweens.FLIPL);
        else */ //this.owner.tweens.play(EnemyTweens.FLIPR);
        this.owner.animation.play(EnemyAnimations.JUMP);
        // Give the enemy a burst of upward momentum
        this.parent.velocity.y = -200;
        // Play the jump sound for the enemy
		this.emitter.fireEvent(GameEventType.PLAY_SOUND, {key: jumpAudio, loop: false, holdReference: false});
	}

	public update(deltaT: number): void {
        // Update the direction the enemy is facing
        super.update(deltaT);

        // If the enemy hit the ground, start idling
        if (this.owner.onGround) {
			this.finished(EnemyStates.IDLE);
		} 
        // If the enemy hit the ceiling or their velocity is >= to zero, 
        else if(this.owner.onCeiling || this.parent.velocity.y >= 0){
            this.finished(EnemyStates.FALL);
		}
        // Otherwise move the enemy
        else {
            // Get the input direction from the enemy
            let dir = this.parent.inputDir;
            if (dir === undefined) return;
            // Update the horizontal velocity of the enemy
            if (dir.x !== 0) this.parent.velocity.x += dir.x * this.parent.speed/3.5 - 0.3*this.parent.velocity.x;
            // Update the vertical velocity of the enemy
            if (this.owner.onCeiling && this.parent.velocity.y < 0) this.parent.velocity.y = Math.min(-this.parent.velocity.y, 20);
            this.parent.velocity.y += this.gravity*deltaT;
            // Move the enemy
            this.owner.move(this.parent.velocity.scaled(deltaT));
        }
	}

	public onExit(): Record<string, any> {
        // console.log("JUMP EXIT");
		//this.owner.animation.stop();
		return {};
	}
}