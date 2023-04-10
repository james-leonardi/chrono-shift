import MathUtils from "../../../Wolfie2D/Utils/MathUtils";
import { PlayerStates } from "../PlayerController";
import { GameEventType } from "../../../Wolfie2D/Events/GameEventType";
import PlayerState from "./PlayerState";
import Input from "../../../Wolfie2D/Input/Input";
import { HW3Controls } from "../../HW3Controls";

export default class Fall extends PlayerState {

    onEnter(options: Record<string, any>): void {
        // If we're falling, the vertical velocity should be >= 0
        this.parent.velocity.y = 0;
    }

    update(deltaT: number): void {

        // If the player hits the ground, start idling and check if we should take damage
        if (this.owner.onGround) {
            let nhealth = this.parent.health - Math.floor(this.parent.velocity.y / 300);
            if (nhealth != this.parent.health) {
                this.parent.health = nhealth;
                let damagedAudio = this.owner.getScene().getDamagedAudioKey();
                this.emitter.fireEvent(GameEventType.PLAY_SOUND, {key: damagedAudio, loop: false, holdReference: false});
            }
            /* this.parent.health -= Math.floor(this.parent.velocity.y / 200); */
            // replenish dash
            this.parent.has_dash = true;
            this.finished(PlayerStates.IDLE);
        } 
        else if(Input.isJustPressed(HW3Controls.DASH) && (Input.isPressed(HW3Controls.MOVE_LEFT) || Input.isPressed(HW3Controls.MOVE_RIGHT)) && this.parent.has_dash) {
            this.parent.has_dash = false;
            this.finished(PlayerStates.DASH);
        }
        // Otherwise, keep moving
        else {
            // Get the movement direction from the player 
            let dir = this.parent.inputDir;
            // Update the horizontal velocity of the player
            if (dir.x !== 0) this.parent.velocity.x += dir.x * this.parent.speed / 3.5 - 0.3 * this.parent.velocity.x;
            // Update the vertical velocity of the player
            this.parent.velocity.y += (this.owner.frozen) ? 0 : this.gravity*deltaT;
            // Move the player
            this.owner.move(this.parent.velocity.scaled(deltaT));
        }

    }

    onExit(): Record<string, any> {
        return {};
    }
}