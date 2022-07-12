import * as PIXI from "pixi.js";
import {  config } from "./appConfig";
import { DebugText } from "./DebugText";
import { Globals } from "./Globals";

export class FinalScene {
    constructor(textToShow = null) {
        this.sceneContainer = new PIXI.Container();

        this.container = new PIXI.Container();
        this.container.x = config.leftX;
        this.container.y = config.topY;
        this.container.scale.set(config.scaleFactor);

        this.createBackground();
        
        this.sceneContainer.addChild(this.container);

        this.textBox = new PIXI.Graphics();
        this.textBox.beginFill(0xbdc8e3, 1);
        let w = 550 ; let h = 300;
        this.textBox.drawRoundedRect(-w/2, -h/2,w, h, 25);
        this.textBox.endFill();
        this.textBox.x = config.logicalWidth/2;
        this.textBox.y = config.logicalHeight/2;
        this.container.addChild(this.textBox);

        const text = new DebugText("You've been disconnected", this.textBox.x, this.textBox.y, "#fff", 48, "Luckiest Guy");
        text.style.stroke = 0x081228;
        text.style.letterSpacing = 2;
        text.style.strokeThickness = 5;
        text.style.align = "center";
        text.style.wordWrap = true; 
        text.style.wordWrapWidth = this.textBox.width * 0.9;


        // textToShow = "Could not join the table : insufficient balance!";

        


        if(textToShow != null)
            text.text = textToShow;


        // console.log(text.getBounds().height > this.textBox.height * 0.9);

        while(text.getBounds().height > this.textBox.height * 0.9)
        {
            text.style.fontSize *= 0.99;
        }

        this.container.addChild(text);

        if(text.width > config.logicalWidth)
        {
            text.style.fontSize *= config.logicalWidth/text.width  * 0.9;
        }
    

    }

    resize()
    {
        //TODO : resize functionality

        this.container.x = config.leftX;
        this.container.y = config.topY;
        this.container.scale.set(config.scaleFactor);

        this.fullbg.width = window.innerWidth;
        this.fullbg.height = window.innerHeight;



    }


    

    createBackground() {
		this.fullbg = new PIXI.Sprite(Globals.resources.background.texture);
		this.fullbg.width = window.innerWidth;
		this.fullbg.height = window.innerHeight;
		this.sceneContainer.addChild(this.fullbg);

		this.bg = new PIXI.Sprite(Globals.resources.background.texture);
		this.bg.width = config.logicalWidth;
		this.bg.height = config.logicalHeight;
		this.container.addChild(this.bg);
	}

  


}