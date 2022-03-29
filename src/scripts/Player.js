
import * as PIXI from "pixi.js";
import {config } from "./appConfig";
import { Automation } from "./Automation";
import { DebugCircle } from "./DebugCircle";
import { DebugText } from "./DebugText";
import { Globals } from "./Globals";
import TWEEN, { Tween } from "@tweenjs/tween.js";

export class Player
{
    constructor(id, horizontalIndex = 0, verticalIndex = 0, ludoBoard, hasAutomation = false)
    {
        this.playerID = id;
        this.playerDataUpdated = false;
        this.squeezeAnchor = {};
        this.pawnsID = [];
        this.activePawnsId = [];
        this.hasTurn = false;
        this.container = new PIXI.Container();

       

        this.container.x = (horizontalIndex == 0) ? config.logicalWidth * 0.0043: config.logicalWidth/2 + ludoBoard.container.width * 0.07;
        if(verticalIndex == 0)
            this.container.y = (config.logicalHeight/2) + (ludoBoard.container.height * 0.347);
        else
            this.container.y = (config.logicalHeight/2) - (ludoBoard.container.height * 0.248);

        this.container.scale.set(0.66);
        
        this.container.sortableChildren = true;

        this.playerSide = horizontalIndex;
        this.playerVerticalSide = verticalIndex;

        this.createHeartBlock();
        this.createAvatar();
        this.createDice();
        this.createScore();
        

        this.hasAutomation = hasAutomation;

        if(this.hasAutomation)
            this.createAutomation();
        
        

        this.currentHealth = 3;
        
        this.lastProgress = {x : 0};


    }
    
    setStartIndex(index)
    {
        this.startIndex = index;
    }

    createHeartBlock()
    {
        const heartBlock = new PIXI.Sprite(Globals.resources.heartBlock.texture);
            
        //heartBlock.anchor.set(0, 0);
        heartBlock.x += 180;
        heartBlock.y -= 20;

        this.heartList = new PIXI.Container();
        this.heartList.filledHeart = [];
        this.heartList.unfilledHeart = [];

        for (let i = -1; i <= 1; i++) {
            const heartFilled = new PIXI.Sprite(Globals.resources.heartFilled.texture);
            heartFilled.anchor.set(0.5);
            heartFilled.x = i * (heartFilled.width + heartFilled.width * 0.1) + heartFilled.width * 0.2;

            const heartUnfilled = new PIXI.Sprite(Globals.resources.heartUnfilled.texture);
            heartUnfilled.anchor.set(0.5);
            heartUnfilled.x = i * (heartUnfilled.width + heartUnfilled.width * 0.1) + heartUnfilled.width * 0.2;

            this.heartList.filledHeart.push(heartFilled);
            this.heartList.unfilledHeart.push(heartUnfilled);
            
            this.heartList.addChild(heartUnfilled);
            this.heartList.addChild(heartFilled);
            
        }

        
        this.heartList.x = heartBlock.x + heartBlock.width/2 ;
        this.heartList.y = heartBlock.y + heartBlock.height/2;


        this.infoButton = new PIXI.Sprite(Globals.resources["info"+this.playerID].texture);
        this.infoButton.interactive = true;

        this.infoButton.on("pointerdown", () => {
           if(this.heartSkipBlock.renderable)
            this.deactivateHeartSkipBlock();
           else
            this.activateHeartSkipBlock();
        }, this);
        this.infoButton.zIndex = 1;

        this.infoButton.anchor.set(0.5);
        
        this.infoButton.x = heartBlock.x + heartBlock.width - this.infoButton.width/4;
        this.infoButton.y = heartBlock.y;

   
        this.container.addChild(heartBlock);
        this.container.addChild(this.heartList);
        this.container.addChild(this.infoButton);
    }



    updateHearts(noOfHearts)
    {
        //console.log(this.heartList.filledHeart.length);

        if(noOfHearts == 3)
        {
            this.heartList.filledHeart.forEach(heart => {
                heart.renderable = true;
            });
        } else
        {
            for (let i = 2; i >= noOfHearts; i--) {
           
            
                this.heartList.filledHeart[i].renderable = false
                this.heartSkipBlock.hearts[i].renderable = false;
            }
        }
    }

    assignHeartSkipBlock(heartElement)
    {
        this.heartSkipBlock = heartElement;
    }



    deactivateHeartSkipBlock()
    {
        this.heartSkipBlock.renderable = false;
    }

    activateHeartSkipBlock()
    {
        this.heartSkipBlock.renderable = true;
    }
    

    createAvatar()
    {
        this.avatar = new PIXI.Sprite(Globals.resources.avatar.texture);
        
        this.avatar.interactive = true;


        this.avatar.on("pointerdown", () => {

            
            try {
                if (JSBridge != undefined) {
                    JSBridge.sendMessageToNative(JSON.stringify({"t" :"pClicked", "data":Globals.gameData.players[this.playerID].pDefaultId}));
                }
            } catch {
                console.log("JS Bridge Not Found!");
            }
        });



        this.avatarImage = PIXI.Sprite.from(Globals.gameData.players[this.playerID].pImage);
       //this.avatarImage.renderable = false;

        this.playerBlock = new PIXI.Sprite(Globals.resources["border"+this.playerID].texture);
        this.playerBlock.scale.set(0.98);
        
        this.playerBlock.y +=  80;

        this.playerName = new PIXI.Text(Globals.gameData.players[this.playerID].pName);
        this.playerName.zIndex = 1;
        this.playerName.anchor.set(0.5);
        this.playerName.style = {
            fontFamily: "Luckiest Guy",
            fontWeight: "bold",
            stroke : "black",
            strokeThickness : 4,
            fontSize: 38,
            fill: ["#fff"]
        };

        this.avatar.anchor.set(0, 0.5);
        this.avatarImage.anchor.set(0, 0.5);
        const avatarRatio = (this.avatarImage.height/this.avatarImage.width);
        this.avatarImage.width = this.avatar.width;
        this.avatarImage.height = this.avatar.width *  avatarRatio;

        
        this.avatar.x += 60;
        this.avatarImage.x = this.avatar.x;

        this.playerName.y = this.playerBlock.y + this.playerBlock.height/2;
        this.playerName.x += 220;
        if(this.playerSide == 1)
        {
            this.playerBlock.x += 40;
            //this.playerName.anchor.y = 0;
            //this.playerName.y += 115;
        } else
        {
            this.playerBlock.x += 43;
            //this.playerName.anchor.y = 1;
            //this.playerName.y -= 120;
        }

        //this.avatar.anchor.set(0.5);
        //this.avatar.x = 0;
        this.avatar.y = 0;

         const maskGraphic = new PIXI.Graphics();
         maskGraphic.beginFill(0xFF3300);

         const widthPadding = (this.avatar.width * 0.07);
         const heightPadding = (this.avatar.height * 0.07);


         maskGraphic.drawRect((this.avatar.x) + widthPadding, (this.avatar.y - (this.avatar.height)/2) + heightPadding, this.avatar.width - (widthPadding * 2), this.avatar.height - (heightPadding * 2) );
         maskGraphic.endFill();
        
        this.avatarImage.mask = maskGraphic;
        
        this.container.addChild(this.avatar);
        this.container.addChild(this.playerBlock);
        this.container.addChild(this.avatarImage);
        
        this.container.addChild(maskGraphic);

        this.container.addChild(this.playerName);

        
        

        
    }

    createScore()
    {
        this.scoreText = new PIXI.Container();
        this.scoreText.textElement = new DebugText("0", 0, 0, "#fff", 64, "Luckiest Guy");
        this.scoreText.textElement.y += this.scoreText.textElement.height/2 + 20;
        
        switch(parseInt(this.playerID))
        {
            case 0:
                this.scoreText.textElement.style.stroke = "#988f40";
                break;
            case 1:
                this.scoreText.textElement.style.stroke = "#2a7092";
                break;
            case 2:
                this.scoreText.textElement.style.stroke = "#973a3b";
                break;
            case 3:
                this.scoreText.textElement.style.stroke = "#307040";
                break;
        }

        this.scoreText.textElement.style.strokeThickness = 10;
        const score = new PIXI.Sprite(Globals.resources.scoreText.texture);
        score.anchor.set(0.5);
        this.scoreText.addChild(score);

        this.scoreText.x += (110 + this.scoreText.width/2);
        this.scoreText.y -= 190;
        
 
      
        this.scoreText.addChild(this.scoreText.textElement);
        this.container.addChild(this.scoreText);
    }

    updateScore(score)
    {
        this.scoreText.textElement.text = score;
    }

    deductHealth()
    {
        this.currentHealth--;

        if(this.currentHealth < 0)
            console.log("KICKED : "+this.playerID);//Kick Him
        else
            this.updateHearts(this.currentHealth);
    }

    resetPawns()
    {
      
        
        this.pawnsID.forEach(element => {
            Globals.pawns[element].setPointIndex(this.startIndex);
            Globals.pawns[element].reachedFinalPosition();
           // Globals.pawns[element].setSqueezeAnchor(this.squeezeAnchor);
        });
    }

    createDice()
    {
        this.diceBG = new PIXI.Sprite(Globals.resources.diceBG.texture);

        this.diceBG.anchor.set(0.5);
        this.diceBG.x = (240 + this.diceBG.width/2);
        this.diceBG.y = -50 - this.diceBG.height/2;

        

        this.graphicRadial = new PIXI.Graphics();
        //this.diceBG.addChild(this.graphicRadial);

        this.graphicRadial.beginFill(0xff0000, 0);
        this.graphicRadial.lineStyle(40, 0x32CD32, 0.5);
        this.graphicRadial.arc(0, 0, 60, 2 * Math.PI , 2 * Math.PI, true);
        this.graphicRadial.endFill();
        
        this.diceBG.addChild(this.graphicRadial);
        this.diceBG.angle = -90;
       
                     

        this.diceContainer = new PIXI.Container();
        this.diceContainer.sortableChildren = true;
        this.diceContainer.position = new PIXI.Point(this.diceBG.x, this.diceBG.y);
        this.diceContainer.alpha = 0.2;

        this.dices = [];

        for (let i = 1; i <= 6; i++) {
            const dice = new PIXI.Sprite(Globals.resources[`dice${i}`].texture);
             
            dice.anchor.set(0.5);
            dice.width = this.diceBG.width * 0.6;
            dice.height = this.diceBG.height * 0.6;
            dice.renderable = false;
            this.dices.push(dice);
            this.diceContainer.addChild(dice);
        }

		const textureArrayOfAnimation = []

		for (let x = 1; x <= 6; x++) {
			textureArrayOfAnimation.push(Globals.resources[`diceEdge${x}`].texture);
		}

		this.animatedDice = new PIXI.AnimatedSprite(textureArrayOfAnimation);
        this.animatedDice.alpha = 0.2;
		this.animatedDice.anchor.set(0.5);
        this.animatedDice.position = new PIXI.Point(this.diceBG.x, this.diceBG.y);
		this.animatedDice.width = this.diceBG.width * 0.7;
		this.animatedDice.height = this.diceBG.height * 0.7;
		this.animatedDice.loop = true;
		this.animatedDice.animationSpeed = 0.2;


        this.animatedDice.on("pointerdown", () => {
			const distmsg = {
				t: "pDiceRoll"
			}
			Globals.socket.sendMessage(distmsg);
            if(Globals.debug.sound)
			Globals.soundResources.click.play();
			//Send Message to server
			this.container.emit("pressedDiceRoll");
			
		}, this);

		this.animatedDice.tween = new TWEEN.Tween(this.animatedDice)
			.to({ angle: 360 }, 800)
			.repeat(10);

        

        
        this.container.addChild(this.diceBG);
       
        this.container.addChild(this.diceContainer);
        this.container.addChild(this.animatedDice);
    }

    setDice(index)
    {
        index--;
        this.dices.forEach(dice => {

            if(this.dices.indexOf(dice) == index)
            {
                dice.zIndex = 1;
                dice.renderable = true;
            } else
            {
                dice.zIndex = 0;
                dice.renderable = false;
            }
        });
    }

    playDiceAnimation() {
        this.animatedDice.renderable = true;
        this.animatedDice.interactive = false;
        if(Globals.debug.sound)
		Globals.soundResources.dice.play();

		this.dices.forEach(dice => {
			dice.renderable = false;
		});

		this.animatedDice.play();
		this.animatedDice.tween.start();


	}

	stopDiceAnimation(diceValue) {
		this.animatedDice.stop();
		this.animatedDice.tween.stop();
		this.animatedDice.renderable = false;

		this.setDice(diceValue);
	}

    updateTimer(progress)
    {
        console.log("Progress :" + progress);
        

        const lineColor = 0x32CD32;
        const altLineColor = 0xfb6163;

        const compareVal = 1 - 2/Globals.turnTimerVal;

        if(this.updateTimerTween != null && this.updateTimerTween != undefined && this.updateTimerTween.isPlaying)
            this.updateTimerTween.stop();    

        this.updateTimerTween = new TWEEN.Tween(this.lastProgress)
        .to({x : progress}, 900)
        .onUpdate(
            (value) => {
                this.graphicRadial.clear();
                this.graphicRadial.beginFill(0xff0000, 0);
                this.graphicRadial.lineStyle(35, value.x <= compareVal ? lineColor : altLineColor, 0.5);
                this.graphicRadial.arc(0, 0, 60, 2 * Math.PI , 2 * Math.PI * value.x, true);
                this.graphicRadial.endFill();
            }
        )
        .onComplete((value) => {
            this.lastProgress = value;
        })
        .start();

        
    }

    assignTurn()
    {
        this.animatedDice.interactive = true;
        
        this.diceContainer.alpha = 1;
        this.animatedDice.alpha = 1;
        this.hasTurn = true;
        this.lastProgress.x = 0;
    }

    removeTurn()
    {
        this.animatedDice.tween.stop();
        this.diceContainer.alpha = 0.2;
        this.animatedDice.alpha = 0.2;
        this.hasTurn = false;
        this.animatedDice.renderable = true;
        this.dices.forEach(dice => {
			dice.renderable = false;
		});

        if(this.updateTimerTween != null && this.updateTimerTween != undefined && this.updateTimerTween.isPlaying)
            this.updateTimerTween.stop();    

            
        this.graphicRadial.clear();
    }

    resetTimer()
    {
        if(this.updateTimerTween != null && this.updateTimerTween != undefined && this.updateTimerTween.isPlaying)
        this.updateTimerTween.stop();    

        
        this.graphicRadial.clear();
        this.graphicRadial.beginFill(0xff0000, 0);
        this.graphicRadial.lineStyle(35, 0x00ff00, 0.5);
        this.graphicRadial.arc(0, 0, 60, 2 * Math.PI , 2 * Math.PI * 0.0001, true);
        this.graphicRadial.endFill();

        this.lastProgress.x = 0;

    }

    
    ActivatePointerChoose(pawnsArr, classRef)
    {
        this.activePawnsId = [];
        

        // const gridPoint = Globals.pawns[this.pawnsID[0]].currentPointIndex;
        // const pawnAtSamePlace = this.pawnsID.filter(id => Globals.pawns[id].currentPointIndex == gridPoint);

        // if(pawnAtSamePlace.length == this.pawnsID.length || pawnsArr.length == 1)
        // {
        //     this.pawnSelected(pawnsArr[0]);
        // } else
        {
            classRef.playAnimation("info2");

            pawnsArr.forEach((id) => {
                Globals.pawns[id].setInteractive();
                this.activePawnsId.push(id);
            });

            // this.pawnsID.forEach((id) => {
            //     Globals.pawns[id].setInteractive();
            // });

            if(this.hasAutomation)
            {
                this.automation.selectPawn();
            }
        }

        

        
    }

    DeactivatePointerChoose()
    {
        this.pawnsID.forEach((id) => {
            Globals.pawns[id].removeInteractive();
        });
    }
    
    pawnSelected(id)
    {
        this.pawnsID.forEach((id) => {
            Globals.pawns[id].removeInteractive();
        });
        const distmsg = {
            t: "pTokenSelect",
            token : id
        }
        Globals.socket.sendMessage(distmsg);
    }

    createAutomation()
    {
        this.automation = new Automation(this);
    }

    destroy()
    {

        if(this.updateTimerTween != null && this.updateTimerTween != undefined && this.updateTimerTween.isPlaying)
            this.updateTimerTween.stop(); 


        this.pawnsID.forEach(element => {

                Globals.pawns[element].isRemoved = true;
                Globals.pawns[element].stopTweens();

        });

        this.pawnsID.forEach(element => {

            Globals.pawns[element].beginMoving();

            Globals.pawns[element].indication.destroy();
            Globals.pawns[element].destroy();

            delete Globals.pawns[element];
        });
        
        this.container.destroy();
    }
}