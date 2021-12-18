const board = {
    lightPlayersScore : 0,
    darkPlayersScore : 0,
    heldPiece : null,
    isJumpAvailableForCurrentPlayer : false,
    isHeldPieceLocked : false,
    isDarkPlayersTurn : true,
    boardContainer : document.getElementById('board-container'),
    blackBoxes : [],
    darkPieces : [],
    lightPieces : []
}

const updatePlayersScore = function (){
    document.getElementById('light-players-score').innerHTML = board.lightPlayersScore;
    document.getElementById('dark-players-score').innerHTML = board.darkPlayersScore;
}

for(let x=0;x<8;x++){
    for(let y=0; y<8; y++){
        let newBox = {
            position : [x,y],
            isEmpty : true,
            pieceContained : null,
            boxContainer : document.createElement('div'),
            isBoxSelected : false
        }
        newBox.boxContainer.className = 'box';
        newBox.boxContainer.id = x+' '+y;
        newBox.boxContainer.addEventListener('click', () => {boxClickHandler(newBox);});             
        if((x+y)%2===1){
            newBox.boxContainer.classList.add('black');
            board.blackBoxes.push(newBox);
        }
        board.boardContainer.appendChild(newBox.boxContainer);             
    }
}

const boxClickHandler = function (box){
    if(box.isBoxSelected){             
        let locationBox = getBoxInPosition(board.heldPiece.position[0], board.heldPiece.position[1]);
        locationBox.boxContainer.firstChild.remove
        locationBox.pieceContained = null;
        locationBox.isEmpty = true;
        box.boxContainer.appendChild(board.heldPiece.pieceContainer); 
        box.pieceContained = board.heldPiece; 
        board.heldPiece.position = box.position;
        box.isEmpty = false; 
        let isCurrentMoveAjumpMove = false; 
        if(board.isJumpAvailableForCurrentPlayer){
            let deadpieceBox = getBoxInPosition(locationBox.position[0]+(locationBox.position[0]<box.position[0]?1:-1)
            ,locationBox.position[1]+(locationBox.position[1]<box.position[1]?1:-1));
            let pieceToKill = deadpieceBox.pieceContained;
            deadpieceBox.pieceContained = null;
            deadpieceBox.boxContainer.innerHTML = '';
            deadpieceBox.isEmpty = true;
            isCurrentMoveAjumpMove = true;
            if(pieceToKill.isDarkPiece)
                board.darkPieces.splice(board.darkPieces.indexOf(pieceToKill), 1);
            else
                board.lightPieces.splice(board.lightPieces.indexOf(pieceToKill), 1);
        }

        if(box.position[0] ===  (board.isDarkPlayersTurn?(0):(7))&&!board.heldPiece.isKing){
            crownPiece(board.heldPiece);
            clearGreenBoxes();
            updateCurrentPlayer();
            board.isHeldPieceLocked = false;            
        }else if(isCurrentMoveAjumpMove){
            board.heldPiece.isSecondJump = true;
            if(getValidJumpsForPiece(board.heldPiece).length>0){
                board.isHeldPieceLocked = true;
                pieceClickHandler(board.heldPiece);
            }else{
                board.heldPiece.isSecondJump = false;
                board.isHeldPieceLocked = false;
                clearGreenBoxes();  
                updateCurrentPlayer();
            }
        }else{
            clearGreenBoxes();  
            updateCurrentPlayer();
        }
        updatePlayersScore();
        board.isJumpAvailableForCurrentPlayer = isJumpAvailableForCurrentPlayer(); 
        if(!board.isJumpAvailableForCurrentPlayer && !isStepAvailableForCurrentPlayer()){
            console.log(board);
            if(board.isDarkPlayersTurn)
                lightPlayersScore++;
            else
                darkPlayersScore++;
            console.log('after', board);
            populateBoard();
        }
    }
}

const isJumpAvailableForCurrentPlayer = function(){
    let currentPlayersPieces = board.isDarkPlayersTurn?board.darkPieces:board.lightPieces;
    let length = currentPlayersPieces.length;
    for(let i=0; i<length; i++){
        if(getValidJumpsForPiece(currentPlayersPieces[i]).length>0)
            return true;
    }
    return false
}

const isStepAvailableForCurrentPlayer = function(){
    let currentPlayersPieces = board.isDarkPlayersTurn?board.darkPieces:board.lightPieces;
    let length = currentPlayersPieces.length;
    for(let i=0; i<length; i++){
        if(getValidStepsForPiece(currentPlayersPieces[i]).length>0)
            return true;
    }
    return false;
}

const crownPiece = function(pieceToCrown){
    pieceToCrown.isKing = true;
    let crownPic = document.createElement('img');
    crownPic.className = 'king';
    crownPic.src = 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/25/Simple_gold_crown.svg/1200px-Simple_gold_crown.svg.png';
    pieceToCrown.pieceContainer.appendChild(crownPic);    
}

let startButton = document.getElementById('button-start');
startButton.addEventListener('click', () => {
    populateBoard();
})

const populateBoard = function (){
    board.isDarkPlayersTurn = false;
    board.darkPieces = [];
    board.lightPieces = [];
    for(box of board.blackBoxes){
    box.boxContainer.innerHTML = ''; 
    box.isEmpty = true;
    box.pieceContained = null;
    box.isBoxSelected = false;
    box.boxContainer.classList.remove('green');
        if(box.position[0]<3||box.position[0]>4){                
            const newPiece = {
                pieceContainer : document.createElement('div'),
                isDarkPiece : box.position[0]>4,
                isKing : false,
                position : box.position,
                isPieceAfterJump : false
            }     
            newPiece.isDarkPiece ? board.darkPieces.push(newPiece) : board.lightPieces.push(newPiece);
            newPiece.pieceContainer.className = 'piece';
            newPiece.pieceContainer.classList.add(box.position[0]<3?'wheat':'red');            
            box.boxContainer.appendChild(newPiece.pieceContainer); 
            box.isEmpty = false;
            box.pieceContained = newPiece;
            newPiece.pieceContainer.addEventListener('click', () => {
                pieceClickHandler(newPiece);
            });
        } 
    }    
    updateCurrentPlayer();
}

const pieceClickHandler = function(piece){
    if(!board.isHeldPieceLocked||Object.is(piece, board.heldPiece)){
        clearGreenBoxes();
        board.heldPiece = piece;
        markGreenBoxes(getLegalMovesForPiece(piece));
    } 
}

const clearGreenBoxes = function (){
    for(box of board.blackBoxes){
        box.isBoxSelected = false;
        box.boxContainer.classList.remove('green');
    }
}

const markGreenBoxes = function (legalMoves){
    if(legalMoves!==undefined){
        for(box of legalMoves){
            box.isBoxSelected = true;
            box.boxContainer.classList.add('green');
        }
    }
}

const updateCurrentPlayer = function (){
    board.isDarkPlayersTurn = !board.isDarkPlayersTurn;    
    document.getElementById('current-player').innerHTML = 
    board.isDarkPlayersTurn?' Dark players turn':' Light players turn';
}

const getBoxInPosition = function(xPosition, yPosition){
    if(xPosition<8&&xPosition>=0&&yPosition<8&&yPosition>=0)
        return board.blackBoxes[(xPosition*8+yPosition)/2-((xPosition*8+yPosition)%2)/2];
    else
        return null;
}

const getJumpsByDirection = function(piece, isXdirectionDown, isYdirectionRight){
    let locationBox = getBoxInPosition(piece.position[0], piece.position[1]);
    let boxToJump = getBoxInPosition(locationBox.position[0]+(isXdirectionDown?1:-1), locationBox.position[1]+(isYdirectionRight?1:-1));
    let destinationBox = getBoxInPosition(locationBox.position[0]+(isXdirectionDown?2:-2), locationBox.position[1]+(isYdirectionRight?2:-2));
    let result = [];
    if(boxToJump!==null&&!boxToJump.isEmpty
        &&boxToJump.pieceContained.isDarkPiece!==piece.isDarkPiece
        &&destinationBox!==null&&destinationBox.isEmpty)
        result.push(destinationBox);
    return result;
}

const getValidJumpsForPiece = function(piece){ 
    let result = [];
    let isSecondJump = piece.isSecondJump;
    if(piece.isDarkPiece||piece.isKing||isSecondJump){
        result = result.concat(getJumpsByDirection(piece, false, true));
        result = result.concat(getJumpsByDirection(piece, false, false));
    }
    if(!piece.isDarkPiece||piece.isKing||isSecondJump){
        result = result.concat(getJumpsByDirection(piece, true, true));
        result = result.concat(getJumpsByDirection(piece, true, false));
    }
    return result;     
}

const getValidStepsForPiece = function(piece){
    let result = [];
    if(piece.isKing||piece.isDarkPiece){
        result = result.concat(getPiecesStepsForDirection(piece, false, true));
        result = result.concat(getPiecesStepsForDirection(piece, false, false));
    }
    if(piece.isKing||!piece.isDarkPiece){
        result = result.concat(getPiecesStepsForDirection(piece, true, true));
        result = result.concat(getPiecesStepsForDirection(piece, true, false));
    }
    return result;
}

const getPiecesStepsForDirection = function(piece, isXdirectionDown, isYdirectionRight){
    let result = [];
    let xPosition = piece.position[0];
    let yPosition = piece.position[1];
        xPosition+=isXdirectionDown?1:-1;
        yPosition+=isYdirectionRight?1:-1;
        let destinationBox = getBoxInPosition(xPosition, yPosition);
        if(destinationBox!==null&&destinationBox.isEmpty)
            result.push(destinationBox);
        else
            done = true;
    return result;
}

const getLegalMovesForPiece = function (pieceToTest){
    let legalMoves = [];
    if(!board.isHeldPieceLocked||Object.is(pieceToTest, board.heldPiece)){
        if(pieceToTest.isDarkPiece === board.isDarkPlayersTurn)
            if(board.isJumpAvailableForCurrentPlayer)
                legalMoves = getValidJumpsForPiece(pieceToTest);
            else
                legalMoves = getValidStepsForPiece(pieceToTest);   
    }    
    return legalMoves;
}