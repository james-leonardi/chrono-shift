import Particle from "../../Wolfie2D/Nodes/Graphics/Particle";
import ParticleSystem from "../../Wolfie2D/Rendering/Animations/ParticleSystem";
import Color from "../../Wolfie2D/Utils/Color";
import { EaseFunctionType } from "../../Wolfie2D/Utils/EaseFunctions";
import RandUtils from "../../Wolfie2D/Utils/RandUtils";
import Vec2 from "../../Wolfie2D/DataTypes/Vec2";
import Input from "../../Wolfie2D/Input/Input";
import { HW3PhysicsGroups } from "../HW3PhysicsGroups";

 

/**
 * // TODO get the particles to move towards the mouse when the enemy attacks
 * 
 * The particle system used for the enemy's attack. Particles in the particle system should
 * be spawned at the enemy's position and fired in the direction of the mouse's position.
 */
export default class EnemyWeapon extends ParticleSystem {

    protected playerPos: Vec2;
    public getPool(): Readonly<Array<Particle>> {
        return this.particlePool;
    }

    /**
     * @returns true if the particle system is running; false otherwise.
     */
    public isSystemRunning(): boolean { return this.systemRunning; }

    public setPlayerPos(pos: Vec2) {
        this.playerPos = pos;
    }

    /**
     * Sets the animations for a particle in the enemy's weapon
     * @param particle the particle to give the animation to
     */
    public setParticleAnimation(particle: Particle) {
        // Give the particle a random velocity.
        let mpos: Vec2 = this.playerPos;
        let cpos: Vec2 = particle.position;
        let vec = new Vec2(mpos.x - cpos.x, mpos.y-cpos.y);
        vec.normalize().scale(150);
        particle.vel = RandUtils.randVec(vec.x-50, vec.x+50, vec.y-32, vec.y+32);
        particle.color = Color.MAGENTA;
        // todo: change to enemy weapon eventually
        // particle.setGroup(HW3PhysicsGroups.PLAYER_WEAPON);
        // particle.setTrigger("DESTRUCTABLE", "PARTICLE", undefined);

        // Give the particle tweens
        particle.tweens.add("active", {
            startDelay: 0,
            duration: this.lifetime,
            effects: [
                {
                    property: "alpha",
                    start: 1,
                    end: 0,
                    ease: EaseFunctionType.IN_OUT_SINE
                },
                {
                    property: "rotation",
                    start: 0,
                    end: 4*Math.PI,
                    ease: EaseFunctionType.IN_OUT_SINE
                }
            ]
        });
    }

}