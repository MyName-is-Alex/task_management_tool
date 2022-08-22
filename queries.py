import data_manager


def get_card_status(status_id):
    """
    Find the first status matching the given id
    :param status_id:
    :return: str
    """
    status = data_manager.execute_select(
        """
        SELECT * FROM statuses s
        WHERE s.id = %(status_id)s
        ;
        """
        , {"status_id": status_id})

    return status


def get_boards():
    """
    Gather all boards
    :return:
    """
    return data_manager.execute_select(
        """
        SELECT * FROM boards
        ORDER BY id DESC
        ;
        """
    )


def get_statuses():
    """
    Gather all statuses
    :return:
    """
    return data_manager.execute_select(
        """
        SELECT * FROM statuses
        ORDER BY id DESC
        ;
        """
    )


def get_cards_for_board(board_id):
    matching_cards = data_manager.execute_select(
        """
        SELECT * FROM cards
        WHERE cards.board_id = %(board_id)s
        ORDER BY card_order ASC
        ;
        """
        , {"board_id": board_id})

    return matching_cards


@data_manager.connection_handler
def add_new_board(cursor, board_title):
    cursor.execute(
        """
        INSERT INTO boards (title, statuses_id)
        VALUES (%(board_title)s, '1,2,3,4')
        """, {'board_title': board_title}
    )


def get_last_board_id():
    return data_manager.execute_select("""
        SELECT id, statuses_id FROM boards
        ORDER BY id DESC
        LIMIT 1
        """, fetchall=False)


@data_manager.connection_handler
def update_board_title(cursor, newTitle, boardId):
    cursor.execute("""
        UPDATE boards
        SET title = %(newTitle)s 
        WHERE id = %(boardId)s;
        """, {'newTitle': newTitle, 'boardId': boardId})


def check_if_status_allready_exists(status_title):
    return data_manager.execute_select("""
        SELECT * FROM statuses
        WHERE title LIKE %(status_title)s
        """, {"status_title": status_title}, fetchall=False)


@data_manager.connection_handler
def create_status(cursor, status_title):
    cursor.execute("""
    INSERT INTO statuses (title)
    VALUES (%(status_title)s)
    """, {'status_title': status_title})


def get_last_status_id(status_title):
    return data_manager.execute_select("""
        SELECT id FROM statuses
        WHERE title like %(status_title)s
        ORDER BY id DESC
        LIMIT 1
        """, {'status_title': status_title})


def get_board_statuses(board_id):
    return data_manager.execute_select("""
        SELECT statuses_id FROM boards
        WHERE id = %(board_id)s
        """, {'board_id': board_id}, fetchall=False)


@data_manager.connection_handler
def update_board_statuses(cursor, statuses, board_id):
    cursor.execute("""
        UPDATE boards
        SET statuses_id = %(statuses)s 
        WHERE id = %(board_id)s;
        """, {'statuses': statuses, 'board_id': board_id})


@data_manager.connection_handler
def update_cards_position(cursor, board_id, previous_status_id, status_id):
    cursor.execute("""
        UPDATE cards 
        SET status_id = %(status_id)s
        WHERE status_id = %(previous_status_id)s AND board_id = %(board_id)s
        """, {'board_id': board_id,
              'previous_status_id': previous_status_id,
              'status_id': status_id
              })


def get_last_card_from_column(board_id, status_id):
    return data_manager.execute_select("""
        SELECT card_order FROM cards
        WHERE status_id = %(status_id)s AND board_id = %(board_id)s
        ORDER BY card_order DESC
        LIMIT 1
        """, {'board_id': board_id, 'status_id': status_id}, fetchall=False)


@data_manager.connection_handler
def add_new_card(cursor, card_title, board_id, status_id, card_order):
    cursor.execute("""
        INSERT INTO cards (board_id, status_id, title, card_order)
        VALUES (%(board_id)s, %(status_id)s, %(card_title)s, %(card_order)s)
        """, {'card_title': card_title,
              'board_id': board_id,
              'status_id': status_id,
              'card_order': card_order
              })


def get_last_card_id():
    return data_manager.execute_select("""
        SELECT id FROM cards
        ORDER BY id DESC
        LIMIT 1
        """)


def update_card_status_and_order(card_id, card_order, status_id):
    return data_manager.execute_select("""
        UPDATE cards 
        SET card_order = %(card_order)s, status_id = %(status_id)s
        WHERE id = %(card_id)s
        RETURNING id
        """, {'card_id': card_id,
              'card_order': card_order,
              'status_id': status_id}, fetchall=False)
