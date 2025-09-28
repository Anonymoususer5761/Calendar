from app.database_manager import get_db
from app.helpers import get_color_hex, pad_digit

from datetime import datetime

def get_years():
    db = get_db()
    years = db.execute("SELECT DISTINCT substr(date(unix_time, 'unixepoch'), 0, 5) AS year FROM calendar").fetchall()
    db.close()
    return years

def get_months():
    menses = {
        "1": "January",
        "2": "February",
        "3": "March",
        "4": "April",
        "5": "May",
        "6": "June",
        "7": "July",
        "8": "August",
        "9": "September",
        "10": "October",
        "11": "November",
        "12": "December"
    }
    return menses


def get_dates(month: int | str, year: int | str):
    date = f"{pad_digit(year, 4)}-{pad_digit(month, 2)}-01"
    db = get_db()
    dates = db.execute("SELECT id, day_id, substr(date(unix_time, 'unixepoch'), -2, 2) AS date FROM calendar WHERE unix_time >= unixepoch(?, 'start of month') AND unix_time <= unixepoch(?, 'start of month', '+1 month', '-1 day')",
        (date, date,)
    ).fetchall()
    db.close()

    dict_dates = [{"id": date["id"], "day_id": date["day_id"], "date": date["date"]} for date in dates]
    return dict_dates


def get_day_name(date_id: int) -> str:
    db = get_db()
    name:str = db.execute("SELECT day FROM days JOIN calendar ON days.id = calendar.day_id WHERE calendar.id = ?", (date_id,)).fetchone()["day"]
    return name


def get_date(date_id: int) -> str:
    db = get_db()
    date:str = db.execute("SELECT date(unix_time, 'unixepoch') AS date FROM calendar WHERE calendar.id = ?", (date_id,)).fetchone()["date"]
    return date


def submit_event_form_to_db(form: dict, user_id: int):
    name = form.name.data
    description = form.description.data
    start_time = form.start_time.data
    end_time = form.end_time.data
    color = get_color_hex(form.event_color.data)

    if start_time > end_time:
        return False

    db = get_db()
    db.execute("""INSERT INTO events(name, description, start_time, end_time, color, user_id) VALUES (?, ?, unixepoch(?), unixepoch(?), ?, ?)""",
        (name, description, start_time, end_time, color, user_id,)
    )
    db.commit()
    db.close()
    return True


def get_events(date_id, user_id):
    db = get_db()
    events = db.execute("""
                        SELECT (events.id) AS event_id, (events.name) AS event_name, (events.description) AS description, start_time, end_time, (events.color) AS color
                        FROM events JOIN users ON user_id = users.id 
                        WHERE user_id = ? 
                        AND (start_time <= (SELECT (unix_time -1) AS unix_time FROM calendar WHERE id = (? + 1))
                        AND end_time >= (SELECT (unix_time - 3600) AS unix_time FROM calendar WHERE id = ?))
""",
        (user_id, date_id, date_id)
    ).fetchall()

    if events:
        dict_events = [{"id": event["event_id"], "name": event["event_name"], "desc": event["description"], "start_time": event["start_time"], "end_time": event["end_time"], "color": event["color"]} for event in events]
        return dict_events

    return None