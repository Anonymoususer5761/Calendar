import os
import sqlite3

def get_db(): 
    connection = sqlite3.connect(os.path.abspath("calendar.db"))
    connection.row_factory = sqlite3.Row
    return connection
