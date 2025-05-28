import sqlite3

connection = sqlite3.connect("test.db")
connection.row_factory = sqlite3.Row
db = connection.cursor()

sql_stmt = """INSERT INTO settings (option_id, setting_id, user_id) 
VALUES ((SELECT option_id FROM settings_options WHERE option = ?), (SELECT id FROM settings_name WHERE setting = ?), ?)"""

db.execute("INSERT INTO users (id, username, email, password_hash) VALUES (3, 'create_account', 'account@email.com', 'skdjfkjf')")
db.execute(sql_stmt, ("ghn bhn h", "dark_mode", 4))

connection.commit()
db.close()