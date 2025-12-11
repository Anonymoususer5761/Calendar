from app.database_manager import get_db
from app.helpers import  pad_digit

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


def get_events(date_id, user_id, include_yesterday=True):
    db = get_db()
    hours = 3600 if include_yesterday else 0
    try:
        events = db.execute(f"""
            SELECT (events.id) AS event_id, (events.name) AS event_name, (events.description) AS description, start_time, end_time, (events.color) AS color
            FROM events
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


def get_event(event_id: int | str, user_id: int | str) -> None:
    db = get_db()
    try:
        event = db.execute("""
        SELECT events.id AS id, name, description, start_time, end_time, color
        FROM events
        JOIN users
        ON users.id = user_id
        WHERE events.id = ?
        AND
        user_id = ?            
    """,
            (event_id, user_id)
        ).fetchone()
    finally:
        db.close()

    event_dict = {"id": event["id"], "name": event["name"], "desc": event["description"], "start": event["start_time"], "end": event["end_time"], "color": event["color"]}
    return event_dict


def get_specific_holidays(date_id):
    db = get_db()
    try:
        holidays = db.execute(f"""
            SELECT DISTINCT (indian_holidays.id) AS id, holiday, category
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
        dict_day = [{"id": holiday["id"], "holiday": holiday["holiday"], "category": holiday["category"]} for holiday in holidays]
        return dict_day
    return None

def get_pomodoro_values(user_id):
    db = get_db()

    try:
        pomodoro_values = db.execute("""SELECT pomodoro_duration, short_break, long_break, long_break_interval
        FROM pomodoro_settings
        WHERE user_id = ?""", (user_id,)).fetchone()
    finally:
        db.close()
    return pomodoro_values
