import { domManager } from "../view/domManager.js";
import { boardsManager } from "../controller/boardsManager.js";

export let dataHandler = {
  getBoards: async function () {
    return await apiGet("/api/boards");
  },
  getBoard: async function (boardId) {
    // the board is retrieved and then the callback function is called with the board
  },
  getStatuses: async function () {
    // the statuses are retrieved and then the callback function is called with the statuses
    return await apiGet("/api/statuses");
  },
  getStatus: async function (statusId) {
    // the status is retrieved and then the callback function is called with the status
  },
  getCardsByBoardId: async function (boardId) {
    return await apiGet(`/api/boards/${boardId}/cards/`);
  },
  getCard: async function (cardId) {
    // the card is retrieved and then the callback function is called with the card
  },
  createNewBoard: async function (boardTitle = "New Board", displayNewBoard) {
    // creates new board, saves it and calls the callback function with its data

    const server_data = [
      {
        title: boardTitle,
      },
    ];

    $.ajax({
      type: "POST",
      url: "/create-board",
      data: JSON.stringify(server_data),
      contentType: "application/json",
      dataType: "json",
      success: async function (results) {
        displayNewBoard(results);
        domManager.addEventListener(
          `.board[data-board-id="${results.id}"] .board-title`,
          "click",
          function (event) {
            if (event.target.tagName != "INPUT") {
              domManager.startChangeBoardName(results.id);
            }
          }
        );
        domManager.addEventListener(
          `.board[data-board-id="${results.id}"] .board-toggle`,
          "click",
          () => {
            domManager.toggleBoardVisibility(results.id);
          }
        );

        domManager.addEventListener(
          `.board[data-board-id="${results.id}"] #addColumnBtn`,
          "click",
          () => {
            dataHandler.createNewStatus(
              "New Status",
              results.id,
              boardsManager.displayNewStatus
            );
          }
        );

        const elementIdentifier = `.board[data-board-id="${results.id}"] .board-header #addCardBtn`;
        domManager.addEventListener(elementIdentifier, "click", () => {
          boardsManager.displayNewBoardModal("Card", results.id);
        });

        await boardsManager.addStatuses(results);
        await domManager.dragAndDrop(results.id);
      },
    });
  },
  updateBoard: async function (newTitle, boardId) {
    const serverData = [
      {
        id: boardId,
        title: newTitle,
      },
    ];

    $.ajax({
      type: "POST",
      url: "/update-board-title",
      data: JSON.stringify(serverData),
      contentType: "application/json",
      dataType: "json",
      success: function (result) {
        const boardTitle = document.querySelector(
          `.board[data-board-id="${boardId}"] .board-title`
        );
        const boardTitleInput = document.querySelector(
          `.board[data-board-id="${boardId}"] input`
        );
        boardTitle.removeChild(boardTitleInput);
        boardTitle.textContent = result["title"];
      },
    });
  },
  createNewStatus: async function (statusTitle, boardId, displayNewStatus) {
    const server_data = [
      {
        title: statusTitle,
        boardId: boardId,
      },
    ];

    $.ajax({
      type: "POST",
      url: "/create-status",
      data: JSON.stringify(server_data),
      contentType: "application/json",
      dataType: "json",
      success: function (results) {
        displayNewStatus(results);
      },
    });
  },
  updateStatus: async function (newTitle, boardId, statusId) {
    const server_data = [
      {
        title: newTitle,
        board_id: boardId,
        status_id: statusId,
      },
    ];

    $.ajax({
      type: "POST",
      url: "/update-status-title",
      data: JSON.stringify(server_data),
      contentType: "application/json",
      dataType: "json",
      success: function (results) {
        const parentIdentifier = `.board[data-board-id="${boardId}"] .board-column[data-status-id="${statusId}"]`;
        const elementIdentifier = `.board[data-board-id="${boardId}"] .board-column[data-status-id="${statusId}"] .board-column-title`;
        const statusTitle = document.querySelector(elementIdentifier);
        const statusTitleInput = document.querySelector(
          elementIdentifier + ` input`
        );
        statusTitle.removeChild(statusTitleInput);
        statusTitle.textContent = results["status_title"];

        const parentElement = document.querySelector(parentIdentifier);
        parentElement.dataset.statusId = `${results["status_id"]}`;
      },
    });
  },
  createNewCard: async function (cardTitle, boardId, addNewCardToScreen) {
    // creates new card, saves it and calls the callback function with its data
    const elementIdentifier = `.board[data-board-id="${boardId}"] .board-columns`;
    const firstStatusElement =
      document.querySelector(elementIdentifier).firstElementChild;
    const statusId = firstStatusElement.dataset.statusId;

    const server_data = [
      {
        title: cardTitle,
        board_id: boardId,
        status_id: statusId,
      },
    ];

    $.ajax({
      type: "POST",
      url: "/create-card",
      data: JSON.stringify(server_data),
      contentType: "application/json",
      dataType: "json",
      success: function (results) {
        addNewCardToScreen(results);
      },
    });
  },
};

async function apiGet(url) {
  let response = await fetch(url, {
    method: "GET",
  });
  if (response.ok) {
    return await response.json();
  }
}

async function apiPost(url, payload) {}

async function apiDelete(url) {}

async function apiPut(url) {}

async function apiPatch(url) {}
