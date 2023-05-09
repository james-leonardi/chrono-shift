import GameEvent from "../../../Wolfie2D/Events/GameEvent";
import { GameEventType } from "../../../Wolfie2D/Events/GameEventType";
import { BossAnimations, BossStates } from "../BossController";
import Input from "../../../Wolfie2D/Input/Input";
import { HW3Controls } from "../../HW3Controls";

import BossState from "./BossState";

export default class Jump extends BossState {

	public onEnter(options: Record<string, any>): void {
        // console.log("JUMP ENTER");
        // Get the jump audio key for the boss
        let jumpAudio = this.owner.getScene().getJumpAudioKey();
        /* console.log(this.parent.velocity.x); */
        /* if (this.parent.velocity.x > 0) this.owner.tweens.play(BossTweens.FLIPL);
        else */ //this.owner.tweens.play(BossTweens.FLIPR);
        this.owner.animation.play(BossAnimations.JUMP);
        // Give the boss a burst of upward momentum
        this.parent.velocity.y = -200;
        // Play the jump sound for the boss
		this.emitter.fireEvent(GameEventType.PLAY_SOUND, {key: jumpAudio, loop: false, holdReference: false});
	}

	public update(deltaT: number): void {
        // Update the direction the boss is facing
        super.update(deltaT);

        // If the boss hit the ground, start idling
        if (this.owner.onGround) {
			this.finished(BossStates.IDLE);
		} 
        // If the boss hit the ceiling or their velocity is >= to zero, 
        else if(this.owner.onCeiling || this.parent.velocity.y >= 0){
            this.finished(BossStates.FALL);
		}
        else if(Input.isJustPressed(HW3Controls.DASH) && (Input.isPressed(HW3Controls.MOVE_LEFT) || Input.isPressed(HW3Controls.MOVE_RIGHT)) && this.parent.has_dash) {
            this.parent.has_dash = false;
            this.finished(BossStates.DASH);
        }
        // Otherwise move the boss
        else {
            // Get the input direction from the boss
            let dir = this.parent.inputDir;
            if (dir === undefined) return;
            // Update the horizontal velocity of the boss
            if (dir.x !== 0) this.parent.velocity.x += dir.x * this.parent.speed/3.5 - 0.3*this.parent.velocity.x;
            // Update the vertical velocity of the boss
            if (this.owner.onCeiling && this.parent.velocity.y < 0) this.parent.velocity.y = Math.min(-this.parent.velocity.y, 20);
            this.parent.velocity.y += this.gravity*deltaT;
            // Move the boss
            this.owner.move(this.parent.velocity.scaled(deltaT));
        }
	}

	public onExit(): Record<string, any> {
        // console.log("JUMP EXIT");
		//this.owner.animation.stop();
		return {};
	}
}