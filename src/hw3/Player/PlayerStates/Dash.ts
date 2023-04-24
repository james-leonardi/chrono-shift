import GameEvent from "../../../Wolfie2D/Events/GameEvent";
import { GameEventType } from "../../../Wolfie2D/Events/GameEventType";
import { PlayerStates, PlayerTweens } from "../PlayerController";
import Input from "../../../Wolfie2D/Input/Input";
import { HW3Controls } from "../../HW3Controls";

import PlayerState from "./PlayerState";

export default class Dash extends PlayerState {

	public onEnter(options: Record<string, any>): void {
        // console.log("DASH ENTER");
        if(Input.isPressed(HW3Controls.MOVE_RIGHT)) {
            this.parent.velocity.x = 1000;
            this.parent.velocity.y = 0;
        }
        else if (Input.isPressed(HW3Controls.MOVE_LEFT)) {
            this.parent.velocity.x = -1000;
            this.parent.velocity.y = 0;
        } else {
            if (this.parent.velocity.x < 0) this.parent.velocity.x = -1000;
            else this.parent.velocity.x = 1000;
        }
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
        // Otherwise move the player
        else {
            // Get the input direction from the player
            let dir = this.parent.inputDir;
            // Update the horizontal velocity of the player
            if (dir.x !== 0) this.parent.velocity.x += dir.x * this.parent.speed / 3.5 - 0.3 * this.parent.velocity.x;
            // Update the vertical velocity of the player
            this.parent.velocity.y += this.gravity*deltaT;
            // Move the player
            this.owner.move(this.parent.velocity.scaled(deltaT));
        }
	}

	public onExit(): Record<string, any> {
        // console.log("DASH EXIT");
		this.owner.animation.stop();
		return {};
	}
}