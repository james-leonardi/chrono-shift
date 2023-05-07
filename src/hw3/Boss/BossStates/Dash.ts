import GameEvent from "../../../Wolfie2D/Events/GameEvent";
import { GameEventType } from "../../../Wolfie2D/Events/GameEventType";
import { BossStates } from "../BossController";
import Input from "../../../Wolfie2D/Input/Input";
import { HW3Controls } from "../../HW3Controls";

import BossState from "./BossState";

export default class Dash extends BossState {

	public onEnter(options: Record<string, any>): void {
        return;
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
        // Otherwise move the boss
        else {
            // Get the input direction from the boss
            let dir = this.parent.inputDir;  // todo: change?
            // Update the horizontal velocity of the boss
            if (dir.x !== 0) this.parent.velocity.x += dir.x * this.parent.speed / 3.5 - 0.3 * this.parent.velocity.x;
            // Update the vertical velocity of the boss
            this.parent.velocity.y += this.gravity*deltaT;
            // Move the boss
            this.owner.move(this.parent.velocity.scaled(deltaT));
        }
	}

	public onExit(): Record<string, any> {
        // console.log("DASH EXIT");
		this.owner.animation.stop();
		return {};
	}
}