from app.database_manager import get_db
from app.helpers import get_color_hex, pad_digit
from app.forms import AddEventForm

from datetime import datetime

def get_years():
    db = get_db()
    years = db.execute("SELECT DISTINCT CAST(strftime('%Y', unix_time, 'unixepoch') AS INTEGER) AS year FROM calendar").fetchall()
    db.close()
    return years

def get_months():
    months = {
        1: "January",
        2: "February",
        3: "March",
        4: "April",
        5: "May",
        6: "June",
        7: "July",
        8: "August",
        9: "September",
        10: "October",
        11: "November",
        12: "December"
    }
    return months

def get_holidays():
    db = get_db()

    db.execute(
        "SELECT * FROM indian_holidays"
    ).fetchall()


def get_calendar(month: int | str, year: int | str):
    year_pad = 4
    month_pad = 2
    date = f"{pad_digit(year, year_pad)}-{pad_digit(month, month_pad)}-01"
    db = get_db()
    try:
        calendar = db.execute("""
            SELECT (calendar.id) AS id, day_id, substr(date(unix_time, 'unixepoch'), -2, 2) AS date, holiday, category
            FROM calendar
            LEFT JOIN indian_holidays
            ON calendar.id = indian_holidays.date_id
            WHERE
                unix_time >= unixepoch(?, 'start of month')
                AND
                unix_time < unixepoch(?, 'start of month', '+1 month')
            """, (
                date,
                date,
            )
        ).fetchall()
    finally:
        db.close()

    dict_calendar = [{"id": date["id"], "day_id": date["day_id"], "date": date["date"], "holiday": date["holiday"], "category": date["category"]} for date in calendar]
    return dict_calendar


def get_day_name(date_id: int) -> str:
    db = get_db()
    name: str = db.execute("SELECT day FROM days JOIN calendar ON days.id = calendar.day_id WHERE calendar.id = ?", (date_id,)).fetchone()["day"]
    return name


def get_date(date_id: int) -> str:
    db = get_db()
    date: str = db.execute("SELECT date(unix_time, 'unixepoch') AS date FROM calendar WHERE calendar.id = ?", (date_id,)).fetchone()["date"]
    return date


def submit_event_form_to_db(form: AddEventForm, user_id: int):
    name = form.name.data
    description = form.description.data
    start_time = form.start_time.data
    end_time = form.end_time.data
    color = form.event_color.data

    if start_time > end_time:
        return False

    db = get_db()
    db.execute("""INSERT INTO events(name, description, start_time, end_time, color, user_id) VALUES (?, ?, unixepoch(?), unixepoch(?), ?, ?)""",
        (name, description, start_time, end_time, color, user_id,)
    )
    db.commit()
    db.close()
    return True


def get_events(date_id, user_id, include_yesterday=True):
    db = get_db()
    hours = 3600
    if not include_yesterday:
        hours = 0
    try:
        events = db.execute(f"""
            SELECT (events.id) AS event_id, (events.name) AS event_name, (events.description) AS description, start_time, end_time, (events.color) AS color
            FROM events JOIN users ON user_id = users.id 
            WHERE user_id = ? 
            AND (start_time <= (SELECT (unix_time -1) AS unix_time FROM calendar WHERE id = (? + 1))
            AND end_time >= (SELECT (unix_time - {hours}) AS unix_time FROM calendar WHERE id = ?))
    """,
            (user_id, date_id, date_id)
        ).fetchall()
    finally:
        db.close()

    if events:
        dict_events = [{"id": event["event_id"], "name": event["event_name"], "desc": event["description"], "start_time": event["start_time"], "end_time": event["end_time"], "color": event["color"]} for event in events]
        return dict_events

    return None


def get_specific_holidays(date_id):
    db = get_db()
    try:
        holidays = db.execute(f"""
            SELECT holiday, category
            FROM calendar 
            JOIN indian_holidays 
                ON calendar.id = indian_holidays.date_id 
            WHERE calendar.id = ?
    """,
            (date_id,)
        ).fetchall()
    finally:
        db.close()

    if holidays:
        dict_day = [{"holiday": holiday["holiday"], "category": holiday["category"]} for holiday in holidays]
        return dict_day
    return None

