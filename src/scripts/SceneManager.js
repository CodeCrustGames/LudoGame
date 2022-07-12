import * as PIXI from "pixi.js";
import TWEEN from "@tweenjs/tween.js";
import { Background } from "./Background";
import { Globals } from "./Globals";
import { DebugText } from "./DebugText";
import { config } from "./appConfig";

export class SceneManager {
    constructor() {
        this.container = new PIXI.Container();

        this.container.sortableChildren = true;
        this.scene = null;


        this.showTableId  = new DebugText("", 0, 0, "#fff");
        this.showTableId.x += this.showTableId.width/2;
        this.showTableId.y += this.showTableId.height;
        this.container.addChild(this.showTableId);

        this.showVersionID  = new DebugText("v0.6", 0, 0, "#fff", 12);
        this.showVersionID.anchor.set(0);
        this.showVersionID.zIndex = 99;
        this.container.addChild(this.showVersionID);
    }

    start(scene) {
        if (this.scene) {
            this.scene.sceneContainer.destroy();
            this.scene = null;
        }

        this.scene = scene;
        this.container.addChild(this.scene.sceneContainer);


        if( window.orientation == 90 || window.orientation == -90)
            {
                
                this.drawImageAbove();
            }
    }

    resize()
    {
        if(this.scene && this.scene.resize)
        {
            this.scene.resize();
        }
    }



    update(dt) {
        TWEEN.update();
        
        if (this.scene && this.scene.update) {
            this.scene.update(dt);
        }
    }

    recievedMessage(msgType, msgParams)
    {
		if(this.scene && this.scene.recievedMessage)
        {
            this.scene.recievedMessage(msgType, msgParams);
        }
    }

    drawImageAbove()
    {
        this.aboveBackground = new Background(Globals.resources.cover.texture,Globals.resources.cover.texture);
        this.labelText = new DebugText("Move Back To Portrait Mode", config.logicalWidth/2, config.logicalHeight/2, "#FFF");
        this.container.addChild(this.aboveBackground.container);
        this.container.addChild(this.labelText);
    }

    removeImageAbove()
    {
        if(this.aboveBackground)
        {
            this.aboveBackground.container.destroy();
            this.labelText.destroy();
            this.labelText = null;
            this.aboveBackground = null;
        }
    }
}