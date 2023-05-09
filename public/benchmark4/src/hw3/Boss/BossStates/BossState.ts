import State from "../../../Wolfie2D/DataTypes/State/State";
import GameEvent from "../../../Wolfie2D/Events/GameEvent";
import MathUtils from "../../../Wolfie2D/Utils/MathUtils";
import { HW3PhysicsGroups } from "../../HW3PhysicsGroups";
import HW3AnimatedSprite from "../../Nodes/HW3AnimatedSprite";
import BossController from "../BossController";

/**
 * An abstract state for the BossController 
 */
export default abstract class BossState extends State {

    protected parent: BossController;
	protected owner: HW3AnimatedSprite;
	protected gravity: number;

	public constructor(parent: BossController, owner: HW3AnimatedSprite){
		super(parent);
		this.owner = owner;
        this.owner.setGroup(this.parent.final_boss ? HW3PhysicsGroups.FINAL_BOSS : HW3PhysicsGroups.BOSS);
        this.gravity = this.parent.final_boss ? 0 : 500;
	}

    public abstract onEnter(options: Record<string, any>): void;

    /**
     * Handle game events from the parent.
     * @param event the game event
     */
	public handleInput(event: GameEvent): void {
        switch(event.type) {
            // Default - throw an error
            default: {
                throw new Error(`Unhandled event in BossState of type ${event.type}`);
            }
        }
	}

	public update(deltaT: number): void {
        // This updates the direction the boss sprite is facing (left or right)
        let direction = this.parent.inputDir;
        if (direction === undefined) return;
		if(direction.x !== 0){
			this.owner.invertX = MathUtils.sign(direction.x) < 0;
		}
    }

    public abstract onExit(): Record<string, any>;
}