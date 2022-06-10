import * as PIXI from "pixi.js";
import TWEEN from "@tweenjs/tween.js";
import { Loader } from "./Loader";
import { MainScene } from "./MainScene";

import { Globals } from "./Globals";
import { SceneManager } from "./SceneManager";
import { config } from "./appConfig";
import { GameScene } from "./GameScene";
import { MyEmitter } from "./MyEmitter";
import { GameEndScene } from "./GameEndScene";
import { FinalScene } from "./FinalScene";


export class App {
	run() {
		// create canvas
		PIXI.settings.RESOLUTION = window.devicePixelRatio || 1;

		console.log(PIXI.settings.RESOLUTION)
		console.log(window.innerWidth + "x" + window.innerHeight)
		let logicalWidth = 720
		let logicalHeight = 1280

		//{width : (window.innerWidth > gameConfig.maxWidth) ? gameConfig.maxWidth : window.innerWidth, height : window.innerHeight}
		this.app = new PIXI.Application({ width: window.innerWidth, height: window.innerHeight });
		document.body.appendChild(this.app.view);
		const scaleFactor = Math.min(
			window.innerWidth / logicalWidth,
			window.innerHeight / logicalHeight
		);
			
		config.scaleFactor = scaleFactor
		console.log("scale " + scaleFactor)
		const newWidth = Math.ceil(logicalWidth * scaleFactor);
		const newHeight = Math.ceil(logicalHeight * scaleFactor);

		//this.app.renderer.view.style.width = `${newWidth}px`;
		//this.app.renderer.view.style.height = `${newHeight}px`;
		this.app.renderer.view.style.width = `${window.innerWidth}px`;
		this.app.renderer.view.style.height = `${window.innerHeight}px`;
		this.app.renderer.resize(window.innerWidth, window.innerHeight);
		console.log(window.innerHeight)
		console.log(this.app.renderer.view);





		Globals.emitter = new MyEmitter();


		Globals.scene = new SceneManager();
		this.app.stage.addChild(Globals.scene.container);
		this.app.ticker.add(dt => Globals.scene.update(dt));

		// load sprites
		const loaderContainer = new PIXI.Container();
		this.app.stage.addChild(loaderContainer);

		//loaderContainer.scale.set(scaleFactor);

		this.loader = new Loader(this.app.loader, loaderContainer);

		//  this.pushSampleData();

		this.loader.preload().then(() => {
			setTimeout(() => {
				loaderContainer.destroy();



				Globals.scene.start(new MainScene());
				// Globals.scene.start(new FinalScene());
				// Globals.scene.start(new GameScene());
				//    Globals.scene.start(new GameEndScene());

				try {
					if (JSBridge != undefined) {

						JSBridge.showMessageInNative("loadSuccess");
					}
				} catch {
					console.log("JS Bridge Not Found!");
				}

			}, 1000);


		});

		this.loader.preloadSounds();

	}

	pushSampleData() {
		Globals.gameData.plId = 0;
		for (let i = 0; i < 4; i++) {

			Globals.gameData.players[i] = {
				balance: "12",
				plId: i,
				pName: "Player " + i,
				pImage: "https://cccdn.b-cdn.net/1584464368856.png"
			};
		}

		Globals.gameData.currentTurn = 0;



	}

	addOrientationCheck() {
		if (PIXI.utils.isMobile) {
			// console.log(window.orientation);



			window.addEventListener("orientationchange", function() {
				if (window.orientation == 90 || window.orientation == -90) {
					Globals.scene.drawImageAbove();
				} else {
					Globals.scene.removeImageAbove();
				}
			});
		}
	}

}