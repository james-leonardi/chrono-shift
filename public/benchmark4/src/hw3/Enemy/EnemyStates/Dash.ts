import GameEvent from "../../../Wolfie2D/Events/GameEvent";
import { GameEventType } from "../../../Wolfie2D/Events/GameEventType";
import { EnemyStates } from "../EnemyController";
import Input from "../../../Wolfie2D/Input/Input";
import { HW3Controls } from "../../HW3Controls";

import EnemyState from "./EnemyState";

export default class Dash extends EnemyState {

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
            let dir = this.parent.inputDir;  // todo: change?
            if (dir === undefined) return;
            // Update the horizontal velocity of the enemy
            if (dir.x !== 0) this.parent.velocity.x += dir.x * this.parent.speed / 3.5 - 0.3 * this.parent.velocity.x;
            // Update the vertical velocity of the enemy
            this.parent.velocity.y += this.gravity*deltaT;
            // Move the enemy
            this.owner.move(this.parent.velocity.scaled(deltaT));
        }
	}

	public onExit(): Record<string, any> {
        // console.log("DASH EXIT");
		this.owner.animation.stop();
		return {};
	}
}