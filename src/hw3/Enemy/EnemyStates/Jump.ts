import GameEvent from "../../../Wolfie2D/Events/GameEvent";
import { GameEventType } from "../../../Wolfie2D/Events/GameEventType";
import { PlayerAnimations, PlayerStates } from "../EnemyController";
import Input from "../../../Wolfie2D/Input/Input";
import { HW3Controls } from "../../HW3Controls";

import PlayerState from "./EnemyState";

export default class Jump extends PlayerState {

	public onEnter(options: Record<string, any>): void {
        // console.log("JUMP ENTER");
        // Get the jump audio key for the player
        let jumpAudio = this.owner.getScene().getJumpAudioKey();
        /* console.log(this.parent.velocity.x); */
        /* if (this.parent.velocity.x > 0) this.owner.tweens.play(PlayerTweens.FLIPL);
        else */ //this.owner.tweens.play(PlayerTweens.FLIPR);
        this.owner.animation.play(PlayerAnimations.JUMP);
        // Give the player a burst of upward momentum
        this.parent.velocity.y = -200;
        // Play the jump sound for the player
		this.emitter.fireEvent(GameEventType.PLAY_SOUND, {key: jumpAudio, loop: false, holdReference: false});
	}

	public update(deltaT: number): void {
        // Update the direction the player is facing
        super.update(deltaT);

        // If the player hit the ground, start idling
        if (this.owner.onGround) {
			this.finished(PlayerStates.IDLE);
		} 
        // If the player hit the ceiling or their velocity is >= to zero, 
        else if(this.owner.onCeiling || this.parent.velocity.y >= 0){
            this.finished(PlayerStates.FALL);
		}
        else if(Input.isJustPressed(HW3Controls.DASH) && (Input.isPressed(HW3Controls.MOVE_LEFT) || Input.isPressed(HW3Controls.MOVE_RIGHT)) && this.parent.has_dash) {
            this.parent.has_dash = false;
            this.finished(PlayerStates.DASH);
        }
        // Otherwise move the player
        else {
            // Get the input direction from the player
            let dir = this.parent.inputDir;
            // Update the horizontal velocity of the player
            if (dir.x !== 0) this.parent.velocity.x += dir.x * this.parent.speed/3.5 - 0.3*this.parent.velocity.x;
            // Update the vertical velocity of the player
            if (this.owner.onCeiling && this.parent.velocity.y < 0) this.parent.velocity.y = Math.min(-this.parent.velocity.y, 20);
            this.parent.velocity.y += this.gravity*deltaT;
            // Move the player
            this.owner.move(this.parent.velocity.scaled(deltaT));
        }
	}

	public onExit(): Record<string, any> {
        // console.log("JUMP EXIT");
		//this.owner.animation.stop();
		return {};
	}
}