import GameEvent from "../../../Wolfie2D/Events/GameEvent";
import { GameEventType } from "../../../Wolfie2D/Events/GameEventType";
import EnemyState from "./EnemyState";
import { HW3Events } from "../../HW3Events";

/**
 * The Dead state for the enemy's FSM AI. 
 */
export default class Dead extends EnemyState {

    // Trigger the enemy's death animation when we enter the dead state
    public onEnter(options: Record<string, any>): void {
        this.owner.freeze();
        this.owner.animation.stop();
        this.owner.animation.play("DYING", false, undefined);
        this.owner.animation.queue("DEAD", false, HW3Events.ENEMY_DEAD);
        //let deadgeAudio = this.owner.getScene().getDeadgeAudioKey();
        //this.emitter.fireEvent(GameEventType.PLAY_SOUND, {key: deadgeAudio, loop: false, holdReference: false});
    }

    // Ignore all events from the rest of the game
    public handleInput(event: GameEvent): void {}

    // Empty update method - if the enemy is dead, don't update anything
    public update(deltaT: number): void {
        
        // if (this.parent.velocity.x > 100) this.parent.velocity.x += 1 * this.parent.speed / 3.5 - 0.3 * this.parent.velocity.x;
        // else if (this.parent.velocity.x < -100) this.parent.velocity.x += -1 * this.parent.speed / 3.5 - 0.3 * this.parent.velocity.x;
        // // Update the vertical velocity of the enemy
        // if (this.owner.onCeiling && this.parent.velocity.y < 0) this.parent.velocity.y = Math.min(-this.parent.velocity.y, 20);
        // this.parent.velocity.y += (this.owner.frozen) ? 0 : this.gravity*deltaT;
        // // Move the enemy
        // this.owner.move(this.parent.velocity.scaled(deltaT));
    }

    public onExit(): Record<string, any> { return {}; }
    
}