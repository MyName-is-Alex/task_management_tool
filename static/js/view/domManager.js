import {dataHandler} from "../data/dataHandler.js";
import {htmlFactory, htmlTemplates} from "./htmlFactory.js";
import {cardsManager} from "../controller/cardsManager.js";

export let domManager = {
    addChild(parentIdentifier, childContent, position) {
        const parent = document.querySelector(parentIdentifier);
        if (parent) {
            parent.insertAdjacentHTML(position, childContent);
        } else {
            console.error("could not find such html element: " + parentIdentifier);
        }
    },
    removeElement(elementIdentifier) {
        const element = document.querySelector(elementIdentifier);
        if (element) {
            element.remove()
        } else {
            console.log("could not find such html element: " + elementIdentifier)
        }
    },
    addEventListener(parentIdentifier, eventType, eventHandler) {
        const parent = document.querySelector(parentIdentifier);
        if (parent) {
            parent.addEventListener(eventType, eventHandler);
        } else {
            console.error("could not find such html element: " + parentIdentifier);
        }
    },
    startChangeBoardName: function (boardId) {
        const boardTitle = document.querySelector(`.board[data-board-id="${boardId}"] .board-title`)
        const boardTitleInput = document.createElement('input')
        boardTitleInput.value = boardTitle.textContent
        boardTitle.innerHTML = ''
        boardTitle.appendChild(boardTitleInput)
        boardTitleInput.focus()

        boardTitleInput.onblur = function () {
            if (boardTitleInput.value.length > 2) {
                dataHandler.updateBoard(boardTitleInput.value, boardId)
            } else {
                dataHandler.updateBoard('New Board', boardId)
            }
        }
    },
    startChangeStatusName: function (statusTitleIdentifier, boardId, statusId) {
        const statusTitle = document.querySelector(statusTitleIdentifier);
        const statusTitleInput = document.createElement('input');
        statusTitleInput.value = statusTitle.textContent;
        statusTitle.innerHTML = '';
        statusTitle.appendChild(statusTitleInput)
        statusTitleInput.focus()

        statusTitleInput.onblur = function () {
            if (statusTitleInput.value.length > 2) {
                dataHandler.updateStatus(statusTitleInput.value, boardId, statusId)
            } else {
                dataHandler.updateStatus('New Status', boardId, statusId)
            }
        }
    },
    toggleBoardVisibility(boardId) {
        const boardColumns = document.querySelector(`.board[data-board-id="${boardId}"] .board-columns`)
        boardColumns.classList.toggle('board-columns-inactive')
    },
    addNewBoardToScreen: function (board) {
        const boardBuilder = htmlFactory(htmlTemplates.board);
        const content = boardBuilder(board);
        domManager.addChild("#root", content, 'beforebegin');
        cardsManager.loadCards(board.id)
    },
    addNewCardToScreen: function (results) {
        console.log(results)
        const cardBuilder = htmlFactory(htmlTemplates.card);
        const content = cardBuilder(results);
        const parentIdentifier = `.board[data-board-id="${results.boardId}"] .board-column[data-status-id="${results.statusId}"] .board-column-content`
        domManager.addChild(parentIdentifier, content, 'beforeend')
    },
    dragAndDrop: function (boardId) {
        const elementIdentifier = `.board[data-board-id="${boardId}"] .board-column-content`
        const containers = document.querySelectorAll(elementIdentifier)

        let containersIdentifier = []

        for (let container of containers) {
            const string = `.board[data-board-id="${boardId}"]` + ' .' + container.classList[container.classList.length - 1]
            const containerIdentifier = document.querySelector(string)
            containersIdentifier.push(containerIdentifier)
        }

        // DRAGULA LIBRARIE FOR DRAG AND DROP
        dragula(containersIdentifier).on('drag', function (el) {

        }).on('drop', function (el) {
            const statusId = el.parentElement.parentElement.dataset.statusId
            const cardId = el.dataset.cardId

            const parent = el.parentNode
            const childIndex = Array.prototype.indexOf.call(parent.children, el)
            const cardOrder = childIndex + 1

            dataHandler.updateCardStatusAndOrder(cardId, statusId, cardOrder)
        }).on('over', function (el, container) {

        }).on('out', function (el, container) {

        });
    }
};
