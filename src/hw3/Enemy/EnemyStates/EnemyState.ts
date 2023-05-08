import State from "../../../Wolfie2D/DataTypes/State/State";
import GameEvent from "../../../Wolfie2D/Events/GameEvent";
import MathUtils from "../../../Wolfie2D/Utils/MathUtils";
import { HW3PhysicsGroups } from "../../HW3PhysicsGroups";
import HW3AnimatedSprite from "../../Nodes/HW3AnimatedSprite";
import EnemyController from "../EnemyController";

/**
 * An abstract state for the EnemyController 
 */
export default abstract class EnemyState extends State {

    protected parent: EnemyController;
	protected owner: HW3AnimatedSprite;
	protected gravity: number;

	public constructor(parent: EnemyController, owner: HW3AnimatedSprite){
		super(parent);
		this.owner = owner;
        this.owner.setGroup(HW3PhysicsGroups.ENEMY);
        this.gravity = 500;
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
                throw new Error(`Unhandled event in EnemyState of type ${event.type}`);
            }
        }
	}

	public update(deltaT: number): void {
        if (this.owner.onGround) this.parent.velocity.y = 0;
        // This updates the direction the enemy sprite is facing (left or right)
        let direction = this.parent.inputDir;
        if (direction === undefined) return;
		if(direction.x !== 0){
			this.owner.invertX = MathUtils.sign(direction.x) < 0;
		}
    }

    public abstract onExit(): Record<string, any>;
}