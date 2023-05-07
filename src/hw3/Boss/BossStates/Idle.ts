import { BossStates, BossAnimations } from "../BossController";
import BossState from "./BossState";
import Input from "../../../Wolfie2D/Input/Input";
import { HW3Controls } from "../../HW3Controls";

export default class Idle extends BossState {

	public onEnter(options: Record<string, any>): void {
        // console.log("IDLE ENTER");
        this.owner.animation.play(BossAnimations.IDLE);
		this.parent.speed = this.parent.MIN_SPEED;
        /* this.parent.velocity.x = 0; */
        this.parent.velocity.y = 0;
	}

	public update(deltaT: number): void {
        // Adjust the direction the boss is facing
		super.update(deltaT);

        // Get the direction of the boss's movement
		let dir = this.parent.inputDir;

        // If the boss is moving along the x-axis, transition to the walking state
		if (!dir.isZero() && dir.y === 0){
			this.finished(BossStates.WALK);
		} 
        // If the boss is jumping, transition to the jumping state
        /* else if (Input.isJustPressed(HW3Controls.JUMP)) {
            this.finished(BossStates.JUMP);
        } */
        // If the boss is not on the ground, transition to the falling state
        else if (!this.owner.onGround && this.parent.velocity.y > 0) {
            this.finished(BossStates.FALL);
        } 
        // Otherwise, do nothing (keep idling)
        else {
            // Update the horizontal velocity of the boss
            const friction = this.owner.onGround ? 7 : 3;
            this.parent.velocity.x = (this.parent.velocity.x > 0) ? Math.max(this.parent.velocity.x - friction, 0) : Math.min(this.parent.velocity.x + friction, 0);
            // Update the vertical velocity of the boss
            if (this.owner.onGround && this.parent.velocity.y > 0) {
                this.parent.velocity.y = 0;
            }
            if (this.owner.onCeiling && this.parent.velocity.y < 0) this.parent.velocity.y = Math.min(-this.parent.velocity.y, 20);
            this.parent.velocity.y += (this.owner.frozen) ? 0 : this.gravity*deltaT;
            // Move the boss
            this.owner.move(this.parent.velocity.scaled(deltaT));
        }
	}

	public onExit(): Record<string, any> {
        // console.log("IDLE EXIT");
		this.owner.animation.stop();
		return {};
	}
}