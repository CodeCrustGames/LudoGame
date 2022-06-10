import * as PIXI from "pixi.js";
import {config} from "./appConfig";
import { Background } from "./Background";
import { GameScene } from "./GameScene";
import { CurrentGameData, Globals, utf8_to_b64 } from "./Globals";
import TWEEN from "@tweenjs/tween.js";
import { DebugText } from "./DebugText";
import { Socket } from "./Socket";
import { Prompt } from "./Prompt";
import { GameEndScene } from "./GameEndScene";
import { Button } from "./Button";

export class MainScene {
	constructor(hasSwitched = false) {

		this.sceneContainer = new PIXI.Container();

	
		this.container = new PIXI.Container();
		this.container.scale.set(config.scaleFactor)
		this.container.y = config.topY;
		this.container.x = config.leftX;
		


		this.createBackground();


		// this.createButton();
		// global.activateScene = () =>  this.createButton();

		//  this.createWaitingScreen();
		// this.createAvatars();
		// {
		// 	const verText = new DebugText("Ver: 0.02", 0, 0, "#fff");
		// 	verText.x += verText.width/2;
		// 	verText.y += verText.height;
		// 	this.container.addChild(verText);
		// }

		this.sceneContainer.addChild(this.container);


		this.createTableGameID();

		const btnPos = {
			x: config.logicalWidth / 2,
			y: config.logicalHeight / 2 + 250
		}
		this.switchBtn = new Button(Globals.resources.yellowBtn.texture, "Switch", 0xffffff, btnPos);
		this.switchBtn.setActive(false);
		this.switchBtn.on("pointerdown", this.onSwitchBtnClick.bind(this));
		this.container.addChild(this.switchBtn);

		console.log("Scene Started : MainScene" )

		if(hasSwitched)
			this.triggerButtonActive();

	}

	onSwitchBtnClick()
	{
		if(this.tempPlId == undefined)
			return;

		this.switchBtn.setActive(false);


        const payload = {
            t : "switchGame",
            plId : this.tempPlId
        }

        Globals.socket?.sendMessage(payload);

		this.resetAllData();
        
		Globals.scene.start(new MainScene(true));
	}

	resetAllData()
	{
		Globals.hasJoinedTable = false;
	}

	createTableGameID()
	{
		
		this.tableIdText = new DebugText(utf8_to_b64(CurrentGameData.tableGameID), 0, 0, "#3657ff", 24, "Luckiest Guy");
		this.tableIdText.anchor.set(1);
		this.tableIdText.x  = config.logicalWidth;
		this.tableIdText.y = config.logicalHeight
		this.container.addChild(this.tableIdText);
	}

	updateTableGameID()
	{
		this.tableIdText.text = utf8_to_b64(CurrentGameData.tableGameID);
	}


	recievedMessage(msgType, msgParams) {
		if (msgType == "gameStart") {
			this.switchBtn.setActive(false);
			Globals.gameData.currentTurn = msgParams.turn;
			console.log("Turn :" + Globals.gameData.currentTurn);
			Globals.scene.start(new GameScene());

		} else if (msgType == "waitTimer") {

			
			if(!Globals.hasJoinedTable)
				return;


			if (Object.keys(Globals.gameData.tempPlayerData).length == 1)
			{
				this.waitingText.text = "Waiting for Others.. " + msgParams.data;
				this.switchBtn.setActive(false);
			}
			else
			{
				this.waitingText.text = "Game starting in.. " + msgParams.data;

				if(msgParams.data <= 2)
				{
					this.switchBtn.setActive(false);

				} else
				{
					this.switchBtn.setActive(true);
				}
			}


		} else if (msgType == "joined") {

			this.tempPlId = msgParams.plId;

			console.log(Globals.gameData.tempPlayerData);

			Object.values(Globals.gameData.tempPlayerData).forEach(player => {
				this.activateAvatarImage(player.pImage, this.avatars[player.plId]);
			});

			// this.switchBtn.setActive(true);
			//Init Avatars
		} else if (msgType == "playerJoined") {

			this.activateAvatarImage(Globals.gameData.tempPlayerData[msgParams.index].pImage, this.avatars[msgParams.index]);
			//init addon player avatar
		} else if (msgType == "playerLeft") {
			delete Globals.gameData.tempPlayerData[msgParams.id]
			this.removePlayerAvatar(msgParams.id);
		} else if (msgType == "gameEnd") {
			Globals.scene.start(new GameEndScene());
		} else if (msgType == "socketConnection") {
			this.triggerButtonActive();
		} else if (msgType == "updateTableGameID")
		{
			this.updateTableGameID();
		}
		
	}

	createWaitingScreen() {
		

		const timerContainer = new PIXI.Container();
		const block = new PIXI.Sprite(Globals.resources.waitingTextBlock.texture);
		block.anchor.set(0.5);

		this.waitingText = new DebugText("Waiting for Others..", 0, 0, "#fff", 48, "Luckiest Guy");
		this.waitingText.style.fontWeight = 'normal'

		timerContainer.x = config.logicalWidth / 2;
		timerContainer.y = config.logicalHeight / 2;

		timerContainer.addChild(block);
		timerContainer.addChild(this.waitingText);

		timerContainer.scale.set(0.66);
		// this.container.addChild(darkBackground);
		this.container.addChild(timerContainer);
	}

	createAvatars() {



		this.avatars = [];

		for (let i = 1; i <= 4; i++) {


			const avatar = new PIXI.Sprite(Globals.resources.avatar.texture);
			avatar.anchor.set(0.5);
			avatar.scale.set(0.66);

			avatar.x = (i * (config.logicalWidth / 5))// + config.logicalWidth/10;
			avatar.y = config.logicalHeight / 2;

			//avatar.x += i * (config.logicalWidth / 5);
			avatar.y += (avatar.height * 1.2);

			const searchingText = new DebugText("Searching..", avatar.x, avatar.y, "#000", 12, "Luckiest Guy");

			this.avatars.push(avatar);

			this.container.addChild(avatar);
			this.container.addChild(searchingText);


			// this.activateAvatarImage("https://cccdn.b-cdn.net/1584464368856.png", avatar);


		}

		const logo = new PIXI.Sprite(Globals.resources.logo.texture);
		logo.scale.set(0.66);
		logo.anchor.set(0.5);
		logo.x = config.logicalWidth / 2;
		logo.y = config.logicalHeight * 0.38;

		this.container.addChild(logo);
	}
	activateAvatarImage(url, avatarParent)
    {
        avatarParent.plImage = PIXI.Sprite.from(url);
        avatarParent.plImage.anchor.set(0.5);
        avatarParent.plImage.x = avatarParent.x;
        avatarParent.plImage.y = avatarParent.y;
        avatarParent.plImage.width = avatarParent.width;
        avatarParent.plImage.height = avatarParent.height;


        const maskGraphic = new PIXI.Graphics();
        maskGraphic.beginFill(0xFF3300);

        const widthPadding = (avatarParent.width * 0.07);
        const heightPadding = (avatarParent.height * 0.07);


        maskGraphic.drawRect(avatarParent.plImage.x - avatarParent.plImage.width/2  + widthPadding, (avatarParent.y - avatarParent.height/2) + heightPadding, avatarParent.width - widthPadding*2, avatarParent.height - heightPadding*2);
        maskGraphic.endFill();

        avatarParent.plImage.mask = maskGraphic;

        this.container.addChild(avatarParent.plImage);    
        this.container.addChild(maskGraphic);

    }

	removePlayerAvatar(index) {
		if (this.avatars[index] != undefined && this.avatars[index] != null) {
			const avatar = this.avatars[index];

			avatar.plImage.destroy();
		}
	}

	createButton() {
		
		const fontSize = 25 
		this.buttonContainer = new PIXI.Container();
		this.container.addChild(this.buttonContainer);

		const button1 = new PIXI.Graphics();
		let firstButnPos = {
			x: 10,
			y: config.logicalWidth / 8,
			width: config.logicalWidth / 4,
			height: config.logicalHeight / 8
		}
		button1.beginFill(0xDE3249);
		button1.drawRect(firstButnPos.x, firstButnPos.y, firstButnPos.width, firstButnPos.height);
		//button1.x = firstButnPos.x
		//button1.y = firstButnPos.y

		button1.endFill();
		console.log(button1)
		button1.textComponent = new DebugText("Player 1 \n230773", firstButnPos.x + firstButnPos.width / 2, firstButnPos.y + firstButnPos.height / 2, "#fff", fontSize, "Luckiest Guy");

		button1.addChild(button1.textComponent);

		button1.interactive = true;
		button1.on("pointerdown", () => {
			console.log("Clicked 1");
			Globals.automationOn = false;
			Globals.socket = new Socket("230773", "Player1", "2", "https://cccdn.b-cdn.net/1584464368856.png");
			this.triggerButtonActive();
		}, this);

		const button2 = new PIXI.Graphics();

		button2.beginFill(0xDE3249);
		button2.drawRect(firstButnPos.x + (firstButnPos.width * 1.2), firstButnPos.y, firstButnPos.width, firstButnPos.height);
		button2.endFill();

		button2.interactive = true;
		button2.on("pointerdown", () => {
			console.log("Clicked 2");
			Globals.automationOn = false;
			Globals.socket = new Socket("230774", "Player2", "2", "https://cccdn.b-cdn.net/1584464368856.png");
			this.triggerButtonActive();
		}, this);

		button2.textComponent = new DebugText("Player 2 \n230774", firstButnPos.x + (firstButnPos.width * 1.2) + firstButnPos.width / 2, firstButnPos.y + firstButnPos.height / 2, "#fff", fontSize, "Luckiest Guy");

		button2.addChild(button2.textComponent);


		const button3 = new PIXI.Graphics();

		button3.beginFill(0xDE3249);
		button3.drawRect(firstButnPos.x + (firstButnPos.width * 2.4), firstButnPos.y, firstButnPos.width, firstButnPos.height);
		button3.endFill();

		button3.interactive = true;
		button3.on("pointerdown", () => {
			console.log("Clicked 2");
			Globals.automationOn = false;
			Globals.socket = new Socket("230772", "Player3", "2", "https://cccdn.b-cdn.net/1584464368856.png");
			this.triggerButtonActive();
		}, this);



		button3.textComponent = new DebugText("Player 3 \n230772", firstButnPos.x + (firstButnPos.width * 2.4) + firstButnPos.width / 2, firstButnPos.y + firstButnPos.height / 2, "#fff", fontSize, "Luckiest Guy");

		button3.addChild(button3.textComponent);

		for (let i = 1; i <= 10; i++) {
			const button = new PIXI.Graphics();

			button.beginFill(0x00FF00);

			const xValue = (i % 2 == 0) ? config.logicalWidth - firstButnPos.width - 10 : 10;
			const xTextValue = (i % 2 == 0) ? xValue + firstButnPos.width / 2 : xValue + firstButnPos.width / 2;
			const yValue = firstButnPos.y + (firstButnPos.height * 1.1 * Math.ceil(i / 2))
			button.drawRect(xValue, yValue, firstButnPos.width, firstButnPos.height);
			button.endFill();

			const id = 230760 + i;

			button.textComponent = new DebugText("Player " + i + " \n" + id, xTextValue,
				yValue + firstButnPos.height / 2, "#000", fontSize, "Luckiest Guy");
			//	console.log(button.textComponent)
			//button.textComponent.scale.set(0.4)
			button.addChild(button.textComponent);





			button.interactive = true;
			button.on("pointerdown", () => {
				console.log("Clicked 1");
				Globals.automationOn = false;
				Globals.socket = new Socket(id.toString(), "Player " + i, "2", "https://cccdn.b-cdn.net/1584464368856.png");
				this.triggerButtonActive();

			}, this);

			this.buttonContainer.addChild(button);
		}






		this.buttonContainer.addChild(button1);
		this.buttonContainer.addChild(button2);
		this.buttonContainer.addChild(button3);

	}

	triggerButtonActive() {
		if (this.buttonContainer != null || this.buttonContainer != undefined)
			this.buttonContainer.destroy();


		this.createWaitingScreen();
		this.createAvatars();

	}

	createBackground() {
	//	this.background = new Background(Globals.resources.background.texture, Globals.resources.background.texture);
		this.background = new PIXI.Sprite(Globals.resources.background.texture);
		//this.background.scale.set(0.66 * config.scaleFactor);
		this.background.width = window.innerWidth;
		this.background.height = window.innerHeight;
		
		this.sceneContainer.addChild(this.background);
	}




	update(dt) {

	}
}