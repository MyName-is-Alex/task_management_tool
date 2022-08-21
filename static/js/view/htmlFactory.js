export const htmlTemplates = {
    board: 1,
    card: 2,
    modal: 3,
    status: 4
}

export const builderFunctions = {
    [htmlTemplates.board]: boardBuilder,
    [htmlTemplates.card]: cardBuilder,
    [htmlTemplates.modal]: createNewBoardModal,
    [htmlTemplates.status]: columnBuilder
};

export function htmlFactory(template) {
    if (builderFunctions.hasOwnProperty(template)) {
        return builderFunctions[template];
    }

    console.error("Undefined template: " + template);

    return () => {
        return "";
    };
}

function boardBuilder(board) {
    return `<div class="board-container">
                <section class="board" data-board-id=${board.id}>
                    <div class="board-header"><span class="board-title">${board.title}</span>
                        <button type="button" id="addCardBtn" class="board-add">Add Card</button>
                        <button class="board-toggle"><i class="fas fa-chevron-down"></i></button>
                    </div>
                    <div class="board-columns">
                        <button id="addColumnBtn" style="border-radius:30px; height: 50%; margin: auto" type="button">+ col</button>
                    </div>
                </section>
            </div>`;
}

function columnBuilder(status) {
    return `<div class="board-column" data-status-id="${status.id}">
                <div class="board-column-title">${status.title}</div>
                <div class="board-column-content board-column-content${status.id}"></div>
            </div>`
}

function cardBuilder(card) {
    return `<div class="card" data-card-id="${card.id}" data-card-order="${card.card_order}">
                <div class="card-remove"><i class="fas fa-trash-alt"></i></div>
                <div class="card-title">${card.title}</div>
            </div>`;
}

function createNewBoardModal(objectName) {
    return `<div class="newBoardModalBackground"></div>
            <div class="newBoardModal">
                <p>${objectName} Title:</p>
                <input type="text" id="inputBoardTitle" name="inputBoardTitle">
                <button type="button" id="saveNewBoardBtn">Save</button>
            </div>`
}


