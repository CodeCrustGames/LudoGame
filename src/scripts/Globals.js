export const Globals = {
    resources: {},
    soundResources : {},
    gridPoints : {},
    pawns : {},
    gameData : {
        players : {},
        isCut : false,
        cutPawn : {},
        winData : []
    },
    debug :
    {
        sound : true
    },
    gameEndState : GameEndStates.NONE
};

export const GameEndStates = {
    NONE : 0,
    ALLTOKENSIN : 1
};