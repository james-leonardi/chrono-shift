import Particle from "../../Wolfie2D/Nodes/Graphics/Particle";
import ParticleSystem from "../../Wolfie2D/Rendering/Animations/ParticleSystem";
import Color from "../../Wolfie2D/Utils/Color";
import { EaseFunctionType } from "../../Wolfie2D/Utils/EaseFunctions";
import RandUtils from "../../Wolfie2D/Utils/RandUtils";
import Vec2 from "../../Wolfie2D/DataTypes/Vec2";
import Input from "../../Wolfie2D/Input/Input";

 

/**
 * // TODO get the particles to move towards the mouse when the player attacks
 * 
 * The particle system used for the player's attack. Particles in the particle system should
 * be spawned at the player's position and fired in the direction of the mouse's position.
 */
export default class PlayerWeapon extends ParticleSystem {

    public getPool(): Readonly<Array<Particle>> {
        return this.particlePool;
    }

    /**
     * @returns true if the particle system is running; false otherwise.
     */
    public isSystemRunning(): boolean { return this.systemRunning; }

    /**
     * Sets the animations for a particle in the player's weapon
     * @param particle the particle to give the animation to
     */
    public setParticleAnimation(particle: Particle) {
        // Give the particle a random velocity.
        let mpos: Vec2 = Input.getGlobalMousePosition();
        let cpos: Vec2 = particle.position;
        /* console.log(`mpos: ${mpos.x}, ${mpos.y}, cpos: ${cpos.x}, ${cpos.y}`); */
        /* particle.vel = RandUtils.randVec(100, 200, -32, 32); */
        let vec = new Vec2(mpos.x - cpos.x, mpos.y-cpos.y);
        vec.normalize().scale(150);
        particle.vel = RandUtils.randVec(vec.x-50, vec.x+50, vec.y-32, vec.y+32);
        /* particle.vel = new Vec2(mpos.x - cpos.x, mpos.y-cpos.y); */
        particle.color = Color.MAGENTA;
        /* particle.setGroup("WEAPON"); */
        /* particle.setTrigger("DESTRUCTABLE", "PARTICLE", undefined); */

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