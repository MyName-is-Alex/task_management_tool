import {dataHandler} from "../data/dataHandler.js";
import {htmlFactory, htmlTemplates} from "../view/htmlFactory.js";
import {domManager} from "../view/domManager.js";
import {cardsManager} from "./cardsManager.js";

export let boardsManager = {
    drake: dragula({}),

    loadBoards: async function () {
        const boards = await dataHandler.getBoards();
        for (let board of boards) {
            //add boards
            const boardBuilder = htmlFactory(htmlTemplates.board);
            const content = boardBuilder(board);
            domManager.addChild("#root", content, 'beforeend');

            //add statuses
            await this.addStatuses(board)
            domManager.addEventListener(`.board[data-board-id="${board.id}"] #addColumnBtn`,
                'click',
                () => {
                    dataHandler.createNewStatus('New Status', board.id, this.displayNewStatus)
                })

            //add cards
            await cardsManager.loadCards(board.id)

            domManager.addEventListener(`.board[data-board-id="${board.id}"] .board-title`,
                'click', function (event) {
                    if (event.target.tagName != 'INPUT') {
                        domManager.startChangeBoardName(board.id)
                    }
                })
            domManager.addEventListener(`.board[data-board-id="${board.id}"] .board-toggle`,
                'click', () => {
                    domManager.toggleBoardVisibility(board.id)
                })
            this.dragAndDrop(board.id);
        }
    },
    addStatuses: async function (board) {
        const statuses = await dataHandler.getStatuses();
        const boardStatuses = board['statuses_id'].split(',')
        for (let i = 0; i < statuses.length; i++) {
            if (boardStatuses.includes(statuses[i]['id'].toString())) {
                const columnBuilder = htmlFactory(htmlTemplates.status);
                const columnContent = columnBuilder(statuses[i]);
                domManager.addChild(`.board[data-board-id="${board.id}"] .board-columns`, columnContent, 'afterbegin');
            }
        }
        for (let status of boardStatuses) {
            const statusTitleIdentifier = `.board[data-board-id="${board.id}"] .board-column[data-status-id="${status}"] .board-column-title`;
            domManager.addEventListener(statusTitleIdentifier, 'click', function (event) {
                if (event.target.tagName != 'INPUT') {
                    domManager.startChangeStatusName(statusTitleIdentifier, board.id, status)
                }
            })
        }
    },
    displayNewBoardModal: function (objectName, boardId = 0) {
        const createNewBoardModal = htmlFactory(htmlTemplates.modal);
        const content = createNewBoardModal(objectName);
        domManager.addChild("#root", content, 'beforeend');

        domManager.addEventListener('#saveNewBoardBtn', 'click', () => {
            const objectTitle = document.getElementById('inputBoardTitle').value
            if (objectName === 'Board') {
                dataHandler.createNewBoard(objectTitle, domManager.addNewBoardToScreen)
            } else if (objectName === 'Card') {
                dataHandler.createNewCard(objectTitle, boardId, domManager.addNewCardToScreen)
            }
            domManager.removeElement(".newBoardModalBackground");
            domManager.removeElement(".newBoardModal");
            location.reload();
        })
    },
    addBoard: function () {
        domManager.addEventListener('#addBoard', 'click', () => {
            this.displayNewBoardModal('Board')
        })
    },
    addCard: async function () {
        const boards = await dataHandler.getBoards();
        for (let board of boards) {
            const elementIdentifier = `.board[data-board-id="${board.id}"] .board-header #addCardBtn`
            domManager.addEventListener(elementIdentifier, 'click', () => {
                this.displayNewBoardModal('Card', board.id)
            })
        }
    },
    displayNewStatus: function (status) {
        const statusBuilder = htmlFactory(htmlTemplates.status);
        const content = statusBuilder(status);
        domManager.addChild(`.board[data-board-id="${status.boardId}"] #addColumnBtn`, content, 'beforebegin');
        const statusTitleIdentifier = `.board[data-board-id="${status.boardId}"] .board-column[data-status-id="${status.id}"] .board-column-title`;
        domManager.addEventListener(statusTitleIdentifier, 'click', () => {
            domManager.startChangeStatusName(statusTitleIdentifier, status.boardId, status.id)
        })
        location.reload();
    },
    dragAndDrop: function (boardId) {
        const elementIdentifier = `.board[data-board-id="${boardId}"] .board-column-content`
        const containers = document.querySelectorAll(elementIdentifier)

        for (let container of containers) {
            const string = `.board[data-board-id="${boardId}"]` + ' .' + container.classList[container.classList.length - 1]
            const containerIdentifier = document.querySelector(string)
            this.drake.containers.push(containerIdentifier)
        }

        // DRAGULA LIBRARIE FOR DRAG AND DROP
        this.drake.on("drop", function (el) {
            const statusId = el.parentElement.parentElement.dataset.statusId;

            let cardsOrder = [];
            const statusElement = el.parentElement.children;
            for (let i = 0; i < statusElement.length; i++) {
                const cardIdAndOrder = {
                    cardId: parseInt(statusElement[i].dataset.cardId),
                    cardOrder: i + 1,
                };
                cardsOrder.push(cardIdAndOrder);
            }
            dataHandler.updateCardStatusAndOrder(cardsOrder, statusId, boardId);
        });
    }
};

function showHideButtonHandler(clickEvent) {
    const boardId = clickEvent.target.dataset.boardId;
    cardsManager.loadCards(boardId);
}
