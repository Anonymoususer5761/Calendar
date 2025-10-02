import sqlite3
import os

def main():
    db = get_db()


def get_db():
    path = os.path.abspath("calendar.db")
    if not os.path.exists(path):
        with open(path) as database_creation:
            pass
    connection = sqlite3.connect(path)
    connection.row_factory = sqlite3.Row

if __name__ == "__main__":
    main()