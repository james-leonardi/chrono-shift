import Particle from "../../Wolfie2D/Nodes/Graphics/Particle";
import ParticleSystem from "../../Wolfie2D/Rendering/Animations/ParticleSystem";
import Color from "../../Wolfie2D/Utils/Color";
import { EaseFunctionType } from "../../Wolfie2D/Utils/EaseFunctions";
import RandUtils from "../../Wolfie2D/Utils/RandUtils";
import Vec2 from "../../Wolfie2D/DataTypes/Vec2";
import Input from "../../Wolfie2D/Input/Input";

export default class PlayerWeapon extends ParticleSystem {

    public getPool(): Readonly<Array<Particle>> { return this.particlePool; }
    public isSystemRunning(): boolean { return this.systemRunning; }

    public setParticleAnimation(particle: Particle) {
        // Give the particle a random velocity.
        let mpos: Vec2 = Input.getGlobalMousePosition();
        let cpos: Vec2 = particle.position;
        let vec = new Vec2(mpos.x - cpos.x, mpos.y-cpos.y);
        vec.normalize().scale(150);
        particle.vel = RandUtils.randVec(vec.x-50, vec.x+50, vec.y-32, vec.y+32);
        particle.color = Color.MAGENTA;
        particle.setGroup("WEAPON");
        particle.setTrigger("DESTRUCTABLE", "PARTICLE", undefined);

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