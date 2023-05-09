import Particle from "../../Wolfie2D/Nodes/Graphics/Particle";
import ParticleSystem from "../../Wolfie2D/Rendering/Animations/ParticleSystem";
import Color from "../../Wolfie2D/Utils/Color";
import { EaseFunctionType } from "../../Wolfie2D/Utils/EaseFunctions";
import RandUtils from "../../Wolfie2D/Utils/RandUtils";
import Vec2 from "../../Wolfie2D/DataTypes/Vec2";
import Input from "../../Wolfie2D/Input/Input";
import Line from "../../Wolfie2D/Nodes/Graphics/Line";
import { GraphicType } from "../../Wolfie2D/Nodes/Graphics/GraphicTypes";
import Scene from "../../Wolfie2D/Scene/Scene";



/**
 * // TODO get the particles to move towards the mouse when the enemy attacks
 * 
 * The particle system used for the enemy's attack. Particles in the particle system should
 * be spawned at the enemy's position and fired in the direction of the mouse's position.
 */
export default class EnemyGrapple extends ParticleSystem {

    private grapple_length: number = 225;

    private grapple_line: Line

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
     * Sets the animations for a particle in the enemy's weapon
     * @param particle the particle to give the animation to
     */
    public setParticleAnimation(particle: Particle) {
        // Give the particle a random velocity.
        let cpos: Vec2 = particle.position;
        let vec = new Vec2(this.direction.x - cpos.x, this.direction.y - cpos.y).normalize().scale(this.grapple_length);
        particle.vel = vec;
        particle.color = Color.BLACK;
        particle.setGroup("WEAPON");
        particle.setTrigger("DESTRUCTABLE", "PARTICLE", undefined);

        // Give the particle tweens
        particle.tweens.add("active", {
            startDelay: 0,
            duration: this.lifetime,
            effects: [
                {
                    property: "rotation",
                    start: 0,
                    end: 10*Math.PI,
                    ease: EaseFunctionType.IN_OUT_SINE
                }
            ]
        });
    }

    public initializeLine(scene: Scene, layer: string) {
        this.grapple_line = <Line>scene.add.graphic(GraphicType.LINE, layer, { "start": Vec2.ZERO, "end": Vec2.ZERO })
        this.grapple_line.color = Color.BLACK;
        this.grapple_line.thickness = 8;
    }

    public renderLine(start: Vec2/* , alpha: number */) {
        this.grapple_line.alpha = (this.particlePool[0].visible) ? 1 : 0;
        if (!this.grapple_line.alpha) return;
        this.grapple_line.start = start.clone();
        this.grapple_line.end = this.particlePool[0].position.clone();
    }
}