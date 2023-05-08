import { EnemyStates, EnemyAnimations } from "../EnemyController";
import Input from "../../../Wolfie2D/Input/Input";
import { HW3Controls } from "../../HW3Controls";
import EnemyState from "./EnemyState";
import Vec2 from "../../../Wolfie2D/DataTypes/Vec2";

export default class Walk extends EnemyState {

    protected lastPos: Vec2;

	onEnter(options: Record<string, any>): void {
        // console.log("WALK ENTER");
		this.parent.speed = this.parent.MIN_SPEED;
        this.owner.animation.playIfNotAlready(EnemyAnimations.WALK);
	}

	update(deltaT: number): void {
        // Call the update method in the parent class - updates the direction the enemy is facing
        super.update(deltaT);

        // Get the input direction from the enemy controller
		let dir = this.parent.inputDir;
        if (dir === undefined) return;

        // If the enemy is not moving - transition to the Idle state
		if(dir.isZero()){
			this.finished(EnemyStates.IDLE);
		} 
        // If the enemy hits the jump key - transition to the Jump state
        /*else if (dir.y > 0) {
            this.finished(EnemyStates.JUMP);
        }*/
        // If the enemy is not on the ground, transition to the fall state
        else if (!this.owner.onGround && this.parent.velocity.y !== 0) {
            this.finished(EnemyStates.FALL);
        }
        // Otherwise, move the enemy
        else {
            // Update the vertical velocity of the enemy
            if (this.lastPos !== undefined && this.lastPos.equals(this.owner.position)) this.parent.raiseStuck();  // if enemy is stuck, raise stuck flag
            this.parent.velocity.y += this.gravity*deltaT; 
            this.parent.velocity.x = dir.x * this.parent.speed
            this.owner.move(this.parent.velocity.scaled(deltaT));
            this.lastPos = this.owner.position.clone();  // update lastPos
        }
        if (this.owner.onCeiling && this.parent.velocity.y < 0) this.parent.velocity.y = Math.min(-this.parent.velocity.y, 20);
	}

	onExit(): Record<string, any> {
        // console.log("WALK EXIT");
		this.owner.animation.stop();
		return {};
	}
}