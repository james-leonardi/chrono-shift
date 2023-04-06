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
export default class PlayerGrapple extends ParticleSystem {

    private grapple_length: number = 175;

    private direction: Vec2;

    public getPool(): Readonly<Array<Particle>> {
        return this.particlePool;
    }

    /**
     * @returns true if the particle system is running; false otherwise.
     */
    public isSystemRunning(): boolean { return this.systemRunning; }

    public setDir(newDirection: Vec2) {
        this.direction = newDirection;
    }

    /**
     * Sets the animations for a particle in the player's weapon
     * @param particle the particle to give the animation to
     */
    public setParticleAnimation(particle: Particle) {
        // Give the particle a random velocity.
        let cpos: Vec2 = particle.position;
        let vec = new Vec2(this.direction.x - cpos.x, this.direction.y - cpos.y).normalize().scale(this.grapple_length);
        const rand = Math.random()*1.5;
        particle.vel = new Vec2(rand*vec.x, rand*vec.y);
        particle.color = Color.CYAN;

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
                    end: 10*Math.PI,
                    ease: EaseFunctionType.IN_OUT_SINE
                }
            ]
        });
    }

}