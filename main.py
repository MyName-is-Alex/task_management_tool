from flask import Flask, render_template, url_for, request, jsonify
from dotenv import load_dotenv
from util import json_response
import mimetypes
import queries

mimetypes.add_type('application/javascript', '.js')
app = Flask(__name__)
load_dotenv()


@app.route("/")
def index():
    """
    This is a one-pager which shows all the boards and cards
    """
    return render_template('index.html')


@app.route("/api/boards")
@json_response
def get_boards():
    """
    All the boards
    """
    return queries.get_boards()


@app.route("/api/statuses")
@json_response
def get_statuses():
    """
    All the statuses
    """
    return queries.get_statuses()


@app.route("/api/boards/<int:board_id>/cards/")
@json_response
def get_cards_for_board(board_id: int):
    """
    All cards that belongs to a board
    :param board_id: id of the parent board
    """
    return queries.get_cards_for_board(board_id)


@app.route('/create-board', methods=['POST', 'GET'])
def create_board():
    if request.method == 'POST':
        server_data = request.get_json()
        queries.add_new_board(server_data[0]['title'])
        board_id = queries.get_last_board_id()['id']
        statuses = queries.get_last_board_id()['statuses_id']
        results = {'id': board_id,
                   "title": server_data[0]['title'],
                   "statuses_id": statuses}
        return jsonify(results)


@app.route('/update-board-title', methods=['POST', 'GET'])
def update_board():
    if request.method == 'POST':
        server_data = request.get_json()
        new_title = server_data[0]['title']
        board_id = server_data[0]['id']
        queries.update_board_title(new_title, board_id)
        results = {'id': board_id,
                   'title': new_title}
        return jsonify(results)


@app.route('/create-status', methods=['POST', 'GET'])
def create_status():
    if request.method == 'POST':
        server_data = request.get_json()
        status_title = server_data[0]['title']
        status_in_table = queries.check_if_status_allready_exists(status_title)
        status_exists = True if status_in_table else False

        if not status_exists:
            queries.create_status(status_title)

        status_id = queries.get_last_status_id(status_title)[0]['id']
        board_id = server_data[0]['boardId']
        board_id_statuses = queries.get_board_statuses(board_id)['statuses_id'].split(",")

        if str(status_id) not in board_id_statuses:
            board_id_statuses.append(str(status_id))
            board_id_statuses = ','.join(board_id_statuses)
            queries.update_board_statuses(board_id_statuses, board_id)

        results = {'id': status_id, 'title': status_title, 'boardId': board_id}
        return jsonify(results)


@app.route('/update-status-title', methods=['POST', 'GET'])
def update_status_title():
    if request.method == 'POST':
        server_data = request.get_json()
        status_title = server_data[0]['title']
        board_id = server_data[0]['board_id']
        preview_status_id = server_data[0]['status_id']

        status_in_db = queries.check_if_status_allready_exists(status_title)
        status_exists = True if status_in_db else False

        if status_exists:
            status_id = status_in_db['id']
            board_statuses = queries.get_board_statuses(board_id)['statuses_id']
            board_statuses = board_statuses.split(',')
            board_statuses.append(str(status_id))
            try:
                board_statuses.remove(str(preview_status_id))
            except ValueError:
                pass
            board_statuses = ",".join(board_statuses)
            queries.update_board_statuses(board_statuses, board_id)
            queries.update_cards_position(board_id, preview_status_id, status_id)
        else:
            queries.create_status(status_title)
            board_statuses = queries.get_board_statuses(board_id)['statuses_id']
            board_statuses = board_statuses.split(',')
            status_id = queries.check_if_status_allready_exists(status_title)['id']
            board_statuses.append(str(status_id))
            board_statuses.remove(str(preview_status_id))
            board_statuses = ",".join(board_statuses)
            queries.update_board_statuses(board_statuses, board_id)

            queries.update_cards_position(board_id, preview_status_id, status_id)

        results = {'status_title': status_title, 'status_id': status_id}
        return jsonify(results)


@app.route('/create-card', methods=['POST', 'GET'])
def create_new_card():
    if request.method == 'POST':
        server_data = request.get_json()
        card_title = server_data[0]['title']
        board_id = int(server_data[0]['board_id'])
        status_id = int(server_data[0]['status_id'])

        try:
            last_card = queries.get_last_card_from_column(board_id, status_id)['card_order']
        except TypeError:
            last_card = 0
        card_order = int(last_card) + 1

        queries.add_new_card(card_title, board_id, status_id, card_order)

        card_id = queries.get_last_card_id()

        results = {'title': card_title,
                   'id': card_id[0]['id'],
                   'boardId': board_id,
                   'statusId': status_id,
                   'card_order':card_order
                   }
        return jsonify(results)


@app.route("/update-card-status-order", methods=['PUT', 'GET'])
def set_card_status_and_order():
    if request.method == 'PUT':
        server_data = request.get_json()
        status_id = server_data[0]['status']
        cards_order = server_data[0]['cardsOrder']
        board_id = server_data[0]['boardId']

        for card in cards_order:
            card_id = int(card['cardId'])
            card_order = int(card['cardOrder'])
            queries.update_card_status_and_order(card_id, card_order, status_id)

        results = {'id': status_id, 'card_id': cards_order, 'board_id': board_id}
        return jsonify(results)


def main():
    app.run(debug=True)

    # Serving the favicon
    with app.app_context():
        app.add_url_rule('/favicon.ico', redirect_to=url_for('static', filename='favicon/favicon.ico'))


if __name__ == '__main__':
    main()
