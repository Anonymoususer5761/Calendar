from app.database_manager import get_db
from app.helpers import get_color_hex, pad_digit

def get_years():
    db = get_db()
    years = db.execute("SELECT DISTINCT substr(date(julian_date), 0, 5) AS year FROM calendar").fetchall()
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
    dates = db.execute("SELECT id, day_id, substr(date(julian_date), -2, 2) AS date FROM calendar WHERE julian_date >= julianday(?, 'start of month') AND julian_date <= julianday(?, 'start of month', '+1 month', '-1 day')",
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
    date:str = db.execute("SELECT date(julian_date) AS date FROM calendar WHERE calendar.id = ?", (date_id,)).fetchone()["date"]
    return date


def submit_event_form_to_db(form: dict, user_id: int):
    event_name = form.get("event-name")
    event_description = form.get("event-description")
    event_start_date = form.get("event-timings-date-start")
    event_start_time = form.get("event-timings-time-start")
    event_end_date = form.get("event-timings-date-end")
    event_end_time = form.get("event-timings-time-end")
    event_color = get_color_hex(form.get("event-color"))

    event_timings_start = f"{event_start_date} {event_start_time}"
    event_timings_end = f"{event_end_date} {event_end_time}"

    db = get_db()
    db.execute("""INSERT INTO events(event_name, event_description, event_timings_start, event_timings_end, event_color, user_id) VALUES (?, ?, julianday(?), julianday(?), ?, ?)""",
        (event_name, event_description, event_timings_start, event_timings_end, event_color, user_id,)
    )
    db.commit()
    db.close()
    return


def get_events(date_id, user_id):
    db = get_db()
    events = db.execute("""SELECT * FROM events JOIN users ON user_id = users.id WHERE user_id = ? AND (SELECT julian_date FROM calendar WHERE id = ?) BETWEEN event_timings_start AND event_timings_end""",
        (user_id, date_id,)           
    ).fetchall()
    return events