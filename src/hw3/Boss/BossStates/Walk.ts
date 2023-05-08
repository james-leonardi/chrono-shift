import { BossStates, BossAnimations } from "../BossController";
import Input from "../../../Wolfie2D/Input/Input";
import { HW3Controls } from "../../HW3Controls";
import BossState from "./BossState";

export default class Walk extends BossState {

	onEnter(options: Record<string, any>): void {
        // console.log("WALK ENTER");
		this.parent.speed = this.parent.MIN_SPEED;
        this.owner.animation.playIfNotAlready(BossAnimations.WALK);
	}

	update(deltaT: number): void {
        // Call the update method in the parent class - updates the direction the boss is facing
        super.update(deltaT);

        if (this.parent.final_boss) {
            // check if last hit was recent
            if (Date.now() - this.parent.lasthit.getTime() < 400) return;
        }

        // Get the input direction from the boss controller
		let dir = this.parent.inputDir;
        if (dir === undefined) return;

        // If the boss is not moving - transition to the Idle state
		if(dir.isZero()){
			this.finished(BossStates.IDLE);
		} 
        // If the boss hits the jump key - transition to the Jump state
        /* else if (Input.isJustPressed(HW3Controls.JUMP)) {
            this.finished(BossStates.JUMP);
        }  */
        // If the boss is not on the ground, transition to the fall state
        else if (!this.owner.onGround && this.parent.velocity.y !== 0) {
            this.finished(BossStates.FALL);
        }
        // Otherwise, move the boss
        else {
            // Update the vertical velocity of the boss
            this.parent.velocity.y += this.gravity*deltaT; 
            this.parent.velocity.x = dir.x * this.parent.speed
            this.owner.move(this.parent.velocity.scaled(deltaT));
        }
        if (this.owner.onCeiling && this.parent.velocity.y < 0) this.parent.velocity.y = Math.min(-this.parent.velocity.y, 20);
	}

	onExit(): Record<string, any> {
        // console.log("WALK EXIT");
		this.owner.animation.stop();
		return {};
	}
}