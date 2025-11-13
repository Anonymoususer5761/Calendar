import csv
import sqlite3
import os
import sys
from datetime import datetime, timedelta
import json

settings_path = os.path.abspath("app_settings.json")
with open(settings_path) as settings_file:
    settings_and_options = json.load(settings_file)["settings"]

days = ("Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday")

def main() -> int:
    db = get_db()

    try:
        with open("database_initializer/read.sql", "r") as sql_script_file:
            script = sql_script_file.read()
            db.executescript(script)
    except sqlite3.Error as e:
        print(f"Error while importing: {e}")
        db.close()
        sys.exit(1)

    fill_calendar_table(db)
    fill_settings_table(db)
    fill_days_table(db)
    import_csv_data(db)

    db.close()

    sys.exit(0)


def get_db(test: bool = False) -> sqlite3.Connection:
    if test:
        path = os.path.abspath("database_initializer/test.db")
    else:
        path = os.path.abspath("calendar.db")
    with open(path, "w") as database_creation:
        pass
    connection = sqlite3.connect(path)
    connection.row_factory = sqlite3.Row
    return connection


def fill_calendar_table(db: sqlite3.Connection | sqlite3.Cursor) -> None:
    year, month, day, hour, minutes, seconds = 1970, 1, 1, 0, 0, 0
    date_var = datetime(year, month, day, hour, minutes, seconds)
    db.execute("DELETE FROM calendar")

    id = 1
    day_id = 4
    while date_var.year != 2100:
        db.execute("INSERT INTO calendar(id, day_id, unix_time) VALUES (?, ?, unixepoch(?))",
            (id, day_id, date_var.strftime("%Y-%m-%d"))       
        )

        id += 1
        if (day_id + 1) > 7:
            day_id = 1
        else:
            day_id += 1
        date_var = date_var + timedelta(days=1)

    db.commit()


def fill_settings_table(db: sqlite3.Connection | sqlite3.Cursor) -> None:
    for setting_id, (setting, options) in enumerate(settings_and_options.items(), start=1):
        db.execute("INSERT INTO settings_name (id, setting) VALUES (?, ?)", (setting_id, setting,))
        option_id = 1
        for option in options:
            db.execute("INSERT INTO settings_options (id, setting_id, option) VALUES (?, ?, ?)", (option_id, setting_id, option,))
            option_id += 1

    db.commit()


def fill_days_table(db: sqlite3.Connection | sqlite3.Cursor) -> None:
    for day in days:
        db.execute("INSERT INTO days (day) VALUES (?)", (day,))
    
    db.commit()


def import_csv_data(db: sqlite3.Connection | sqlite3.Cursor) -> None:
    csv_path = os.path.abspath("datasets/indian_holidays.csv")
    with open(csv_path, "r") as csv_file:
        csv_reader = csv.DictReader(csv_file)
        for line in csv_reader:
            db.execute(
                "INSERT INTO indian_holidays (id, holiday, category, date_id) VALUES (?, ?, ?, ?)",
                (line["id"], line["holiday"], line["category"], line["date_id"])           
            )

    db.commit()

if __name__ == "__main__":
    main()