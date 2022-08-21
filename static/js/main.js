import {boardsManager} from "./controller/boardsManager.js";

function init() {
    boardsManager.loadBoards().then(() => {
        boardsManager.addBoard();
        boardsManager.addCard();
    });
}

init();
