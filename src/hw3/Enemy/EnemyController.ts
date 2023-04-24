import ControllerAI from "../../Wolfie2D/AI/ControllerAI";
import StateMachineAI from "../../Wolfie2D/AI/StateMachineAI";
import Vec2 from "../../Wolfie2D/DataTypes/Vec2";
import GameEvent from "../../Wolfie2D/Events/GameEvent";
import Receiver from "../../Wolfie2D/Events/Receiver";
import GameNode from "../../Wolfie2D/Nodes/GameNode";
import { HW3Events } from "../HW3Events";
import { HW3PhysicsGroups } from "../HW3PhysicsGroups";
import HW3AnimatedSprite from "../Nodes/HW3AnimatedSprite";

export default class EnemyController extends ControllerAI {

  protected owner: HW3AnimatedSprite;

  protected _velocity: Vec2;
  protected _speed: number;
  protected _dead: boolean;

  protected receiver: Receiver;

  // todo: add reference to player

  initializeAI(owner: HW3AnimatedSprite, options: Record<string, any>): void {
    this.owner = owner;
    this.owner.setGroup(HW3PhysicsGroups.PLAYER);
    this.receiver = new Receiver();
  }

  activate(options: Record<string, any>): void {
    console.log("Activated enemy controller (i have no idea what this does)");
  }

  handleEvent(event: GameEvent): void {
    switch (event.type) {
      default:
        console.log("unhandled event in enemy controller");
    }
  }

  update(deltaT: number): void {
    console.log("updating enemy controller");
  }

}