import os
import sqlite3

def get_db(row_factory=True): 
    connection = sqlite3.connect(os.path.abspath("calendar.db"))
    if row_factory:
        connection.row_factory = sqlite3.Row
        return connection
    else:
        cursor = connection.cursor()
        return cursor
