import { Resource, Sprite, Texture } from "pixi.js";
import { DebugText } from "./DebugText";


export class Button extends Sprite
{


    constructor(texture, text, color , position)
    {
        super(texture);
        this.interactive = false;
        this.anchor.set(0.5);
        this.tint = color;
        
        this.buttonLabel = new DebugText(text, 0, -5, color, 36, "Luckiest Guy");
        this.buttonLabel.style.stroke = "#7e3e01";
        this.buttonLabel.style.strokeThickness = 5;
        this.x = position.x;
        this.y = position.y;
        this.addChild(this.buttonLabel);
    }

    setActive(active)
    {
        this.renderable = active;
        this.interactive = active;
    }
}