import { FinalScene } from "./FinalScene";
import { CurrentGameData, GameEndStates, Globals } from "./Globals";

export class Socket {
	constructor(uuid, name, entryFee, tableTypeID, useravatar, url = null) {

		console.log("Socket Created");

		const queryString = window.location.search;
		const urlParams = new URLSearchParams(queryString);
		const servAddress = urlParams.get('debug');

		if (url != null) {
			this.socket = new WebSocket(url);
		} else {

			const connectionData = {
				playerId: uuid,
				entryFee: entryFee,
				tableTypeId: tableTypeID
			}

			const apiURL = "https://api.gamesappludo.com/api/getserver";
			// const apiURL = "https://apiuat.gamesappludo.com/api/getserver";
			// const apiURL = "http://localhost:8081/api/getserver";

			this.socket = null
			console.log(connectionData)
			fetch(apiURL, {
					method: 'POST', // or 'PUT'
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify(connectionData),
				})
				.then(response => response.json())
				.then(data => {
					console.log(data);
					if (data.code != 200) {
						Globals.scene.start(new FinalScene(data.result));
						return;
					}

					// data.result.address = "ws://localhost:8082";
					this.socket = new WebSocket(data.result.address);

					this.socket.onopen = e => {
						console.log("Connection with socket made");

						const distmsg = {
							t: "connect",
							gid: uuid,
							tableGameId: data.result.tableGameId,
							tableTypeID : connectionData.tableTypeId,
							entryFee: data.result.entryFee,
							pName: name,
							pImage: useravatar
						}

						this.sendMessage(distmsg);

						this.pingIntervalId = setInterval(() => {
							this.sendMessage({ t: "ping" });
						}, 2000);
					};



					this.socket.onmessage = e => {
						let type;

						console.log("Message Recieved : " + e.data);

						const msg = JSON.parse(e.data);
						if (msg.t == "joined") {
							
							Globals.hasJoinedTable = true;

							Globals.gameData.tempPlayerData = {

							};

							CurrentGameData.tableGameID = msg.tID;
							Globals.emitter?.Call("updateTableGameID");

							Globals.gameData.bal = msg.bal;


							Object.keys(msg.snap).forEach(key => {
								const data = msg.snap[key];

								Globals.gameData.tempPlayerData[data.plId] = data;



								// if(!(data.plId in Globals.gameData.players))
								// {
								//     Globals.gameData.players[data.plId] = data;
								// } else
								// {
								//     const mergeData = {...Globals.gameData.players[data.plId], ...data};
								//     Globals.gameData.players[data.plId] = mergeData;
								// }
							});

							Globals.emitter.Call("joined", {plId : msg.plId});

						} else if (msg.t == "pAdd") {
							const plData = {
								pName: msg.pName,
								pImage: msg.pImage,
								plId: msg.plId
							};

			

							Globals.gameData.tempPlayerData[msg.plId] = plData;


							// Globals.gameData.players[msg.plId] = {
							//     balance : msg.bal,
							//     plId : msg.plId,
							//     pName : msg.pName,
							//     pImage : msg.pImage
							// };

							Globals.emitter.Call("playerJoined", { index: msg.plId });

						} else if (msg.t == "gameStart") {
							Globals.gameData.plId = msg.plId;
							Globals.gameData.players = {};

							msg.snap.forEach(plData => {
								Globals.gameData.players[plData.plId] = plData;
							});

							Globals.potData = msg.pot;


							Globals.emitter.Call("gameStart", { turn: msg.turn });
						} else if (msg.t == "pLeft") {

							Globals.emitter.Call("playerLeft", { id: msg.data });



							//Update Board with Player Left if game is running
						} else if (msg.t == "RollDiceResult") {
							//stop dice rolling animation

							if (msg.nextroll == null || msg.nextroll == undefined) {
								Globals.emitter.Call("rollDiceResult", { id: msg.plId, value: msg.dice, pawnArr: msg.movable });
							} else {
								Globals.emitter.Call("noValidMove", { nextRoll: msg.nextroll, plId: msg.plId, value: msg.dice });
							}

							//
						} else if (msg.t == "moveToken") {
							//cutId: msg.data[1].tokenId, cutMoveArr : msg.data[1].moveArr
							const cutData = msg.data.filter(data => data["isCut"] == true);
							console.log("Filtered Data : ");
							console.log(cutData);

							Globals.gameData.currentTurn = msg.nextroll;
							Globals.gameData.isCut = (cutData.length > 0);
							if (Globals.gameData.isCut) {
								Globals.gameData.cutPawn = cutData[0];
								console.log(Globals.gameData.cutPawn);
							}

							Globals.emitter.Call("movePawn", { id: msg.data[cutData.length].tokenId, moveArr: msg.data[cutData.length].pos, scoreObj: msg.gState.score });


						} else if (msg.t == "turnSkipped") {

							Globals.emitter.Call("turnChanged", { nextRoll: msg.nextRoll, plId: msg.plId });

						} else if (msg.t == "turnTimer") {
							Globals.emitter.Call("turnTimer", { time: msg.data, id: msg.currPlTurn });
						} else if (msg.t == "timer") {
							Globals.emitter.Call("timer", { time: msg.data });
						} else if (msg.t == "threeSix") {

							Globals.emitter.Call("threeSix", { id: msg.plId, nextRoll: msg.nextRoll });
						} else if (msg.t == "invalidMove") {
							Globals.emitter.Call("choosePawnAgain", {});
						} else if (msg.t == "gameEnded") {

							Globals.gameData.winData = msg.winData
								//console.log(Globals.gameData.winData);



							if (msg.data == null || Object.keys(msg.data).length == 0) {

								let responseMsg = ""

								if (msg.msg == "moveToken") {
									responseMsg = "Token Moved.";
								} else if (msg.msg == "threeSix") {
									responseMsg = "Rolled Six Three Times.";
								} else if (msg.msg == "turnSkipped") {
									responseMsg = "Timer Ended.";
								} else if (msg.msg == "noValidMove") {
									responseMsg = "No valid move.";
								} else if (msg.msg == "allTokensIn") {
									responseMsg = "Reached Home.";
								} else if (msg.msg == "allOpponentLeft") {
									responseMsg = "All opponents left.";
								} else if (msg.msg == "allTokensIn") {
									responseMsg = "All Tokens In.";
								}


								Globals.emitter.Call("gameEnd", { reason: responseMsg });
								return;
							}

							if (msg.msg == "allTokensIn") {
								Globals.gameEndState = GameEndStates.ALLTOKENSIN;
							}


							const cutData = msg.data.filter(data => data["isCut"] == true);
							console.log("Filtered Data : ");
							console.log(cutData);

							Globals.gameData.currentTurn = -1;
							Globals.gameData.isCut = (cutData.length > 0);
							if (Globals.gameData.isCut) {
								Globals.gameData.cutPawn = cutData[0];
								console.log(Globals.gameData.cutPawn);
							}


							Globals.emitter.Call("movePawn", { id: msg.data[cutData.length].tokenId, moveArr: msg.data[cutData.length].pos, scoreObj: msg.gState.score });

						} else if (msg.t == "diceRollNotif") {
							Globals.emitter.Call("diceRollNotif", { id: msg.plId });
						} else if (msg.t == "waitTimer") {
							Globals.emitter.Call("waitTimer", { data: msg.data });
						} else if (msg.t == "threeSkips") {
							Globals.gameEndState = GameEndStates.THREESKIPS;
							this.socket.close();
							// Globals.scene.start(new FinalScene());
						} else if (msg.t == "error") {
							Globals.scene.start(new FinalScene(msg.data));
						}
					};





					this.socket.onclose = e => {
						clearInterval(this.pingIntervalId);
						if (e.wasClean) {
							console.log(`[close] Connection closed cleanly, code=${e.code} reason=${e.reason}`);
						} else {
							console.log(`[close] Connection Died`);
						}

						if (Globals.gameEndState == GameEndStates.THREESKIPS) {
							setTimeout(() => {
								Globals.scene.start(new FinalScene("You skipped three times!\nGet back."));
							}, 2000);
							Globals.gameEndState = GameEndStates.NONE;
						} else
							Globals.scene.start(new FinalScene());
					};



					this.socket.onerror = e => {
						console.log(`[error] ${e.message}`);
					};
				}, this)
				.catch((error) => {
					console.error('Error:', error);
				});

			//this.socket = new WebSocket("ws://209.250.232.65:4400");
			//  this.socket = new WebSocket("ws://3060-2405-201-5006-10c7-a587-e8df-de84-a6e1.ngrok.io");
		}



	
	}


	

	sendMessage(msg) {
		console.log("Message Sent : " + JSON.stringify(msg));
		this.socket.send(JSON.stringify(msg));
	}
}


