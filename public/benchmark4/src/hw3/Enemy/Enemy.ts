import AABB from "../../Wolfie2D/DataTypes/Shapes/AABB";
import Vec2 from "../../Wolfie2D/DataTypes/Vec2";
import AnimatedSprite from "../../Wolfie2D/Nodes/Sprites/AnimatedSprite";
import HW3Level, { HW3Layers } from "../Scenes/HW3Level";
import EnemyController from "./EnemyController";
import EnemyGrapple from "./EnemyGrapple";
import EnemyWeapon from "./EnemyWeapon";


export default class Enemy {
  protected weaponSystem: EnemyWeapon;
  protected grappleSystem: EnemyGrapple;

  protected level: HW3Level;

  protected enemy: AnimatedSprite;

  public constructor(key: string, level: HW3Level, location: Vec2, player: AnimatedSprite, in_present: boolean, walk_distance: number = 0) {
    this.level = level;
    this.grappleSystem = new EnemyGrapple(1, Vec2.ZERO, 1000, 2, 0, 1);
    this.grappleSystem.initializePool(this.level, HW3Layers.PRIMARY);
    /* this.grappleLine = <Line>this.add.graphic(GraphicType.LINE, HW3Layers.PRIMARY, {"start": Vec2.ZERO, "end": Vec2.ZERO}) */
    this.grappleSystem.initializeLine(this.level, HW3Layers.PRIMARY);

    this.weaponSystem = new EnemyWeapon(10, Vec2.ZERO, 1000, 3, 0, 50);
    this.weaponSystem.initializePool(this.level, HW3Layers.PRIMARY);

    // Add the boss to the scene
    this.enemy = this.level.add.animatedSprite(key, HW3Layers.PRIMARY);
    this.enemy.scale.set(0.5, 0.5);
    this.enemy.position.copy(location);
    
    // Give the boss physics
    this.enemy.addPhysics(new AABB(this.enemy.position.clone(), this.enemy.boundary.getHalfSize().clone()));

    this.enemy.addAI(EnemyController, {
        weaponSystem: this.weaponSystem,
        grappleSystem: this.grappleSystem,
        tilemap: "Destructable",
        player: player,
        enemy_in_present: in_present,
        walk_distance: walk_distance
    });
  }
}