import GameEvent from "../../../Wolfie2D/Events/GameEvent";
import { GameEventType } from "../../../Wolfie2D/Events/GameEventType";
import BossState from "./BossState";
import { HW3Events } from "../../HW3Events";

/**
 * The Dead state for the boss's FSM AI. 
 */
export default class Dead extends BossState {

    // Trigger the boss's death animation when we enter the dead state
    public onEnter(options: Record<string, any>): void {
        this.owner.freeze();
        /* this.owner.animation.play("DYING", false, undefined);
        this.owner.animation.queue("DEATH", false, HW3Events.BOSS_DEAD); */
        let deadgeAudio = this.owner.getScene().getDeadgeAudioKey();
        //this.emitter.fireEvent(GameEventType.PLAY_SOUND, {key: deadgeAudio, loop: false, holdReference: false});
    }

    // Ignore all events from the rest of the game
    public handleInput(event: GameEvent): void { }

    // Empty update method - if the boss is dead, don't update anything
    public update(deltaT: number): void {}

    public onExit(): Record<string, any> { return {}; }
    
}