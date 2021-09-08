import { Globals } from "./Globals";

export class Socket
{
    constructor()
    {
        const queryString = window.location.search;
        const urlParams = new URLSearchParams(queryString);
        const servAddress = urlParams.get('debug');

        this.socket = new WebSocket("ws://4dd6-2405-201-5006-10c7-e17a-df0-d2a2-9691.ngrok.io");
        console.log("Socket Created");
        this.socket.onopen = e => {
            console.log("Connection with socket made");

            const distmsg = {
                t : "connect",
                gid : "230869",
                tableTypeID : "2",
                entryFee : "6",
                pName : "Abhishek",
                pImage : "../src/sprites/68.png"
                //pImage : "https://sguru.org/wp-content/uploads/2017/06/steam-avatar-profile-picture-1974.jpg"
            }

            this.sendMessage(distmsg);
        };

        this.socket.onmessage = e => {
            let type;

            console.log("Message Recieved : "  + e.data);

            const msg = JSON.parse(e.data);
            if(msg.t == "joined")
            {
                Globals.gameData.plId = msg.data;
                Globals.gameData.players[msg.data] = {
                    balance : msg.bal
                };

                Object.keys(msg.snap).forEach(key => {
                    const data = msg.snap[key];
                    if(!(data.plId in Globals.gameData.players))
                    {
                        Globals.gameData.players[data.plId] = data;
                    } else
                    {
                        const mergeData = {...Globals.gameData.players[data.plId], ...data};
                        Globals.gameData.players[data.plId] = mergeData;
                    }
                });
                
                console.log(Globals.gameData.players);

            } else if (msg.t == "pAdd")
            {
                Globals.gameData.players[msg.plId] = {
                    balance : msg.bal,
                    plId : msg.plId,
                    pName : msg.pName,
                    pImage : msg.pImage
                };

                console.log(Globals.gameData.players);

            } else if(msg.t == "gameStart")
            {
                Globals.emitter.emit("gameStart", msg.turn);
            } 
            else if (msg.t == "pLeft")
            {
                delete Globals.gameData.players[msg.data.plId];

                //Update Board with Player Left if game is running
            } else if (msg.t == "RollDiceResult")
            {   
                //stop dice rolling animation
                Globals.emitter.emit("rollDiceResult", {id : msg.plId, value : msg.dice});
                //
            } else if (msg.t == "moveToken")
            {
              
                Globals.emitter.emit("movePawn", {id: msg.data[0].tokenId, moveArr : msg.data[0].pos, nextTurn : msg.data[0].nextroll});
                Globals.gameData.currentTurn = msg.nextroll;

            } else if (msg.t == "turnSkipped")
            {

            } else if (msg.t == "turnTimer")
            {
                Globals.emitter.emit("turnTimer", msg.data);
            } else if (msg.t = "timer")
            {
                Globals.emitter.emit("timer", msg.data);
            }
        };

        this.socket.onclose = e => {
            if(e.wasClean)
            {
                console.log(`[close] Connection closed cleanly, code=${e.code} reason=${e.reason}`);
            } else
            {
                console.log(`[close] Connection Died`);
            }
        };

        this.socket.onerror = e => {
            console.log(`[error] ${e.message}`);
        };
    }



    sendMessage(msg)
    {
        console.log("Message Sent : " + JSON.stringify(msg));
        this.socket.send(JSON.stringify(msg));
    }
}