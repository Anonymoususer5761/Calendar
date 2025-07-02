from app.database_manager import get_db

def get_years():
    db = get_db()
    years = db.execute("SELECT DISTINCT year FROM calendar").fetchall()
    db.close()
    return years

def get_months():
    db = get_db()
    menses = db.execute("SELECT DISTINCT month_id, month FROM calendar JOIN months ON month_id = months.id").fetchall()
    db.close()
    return menses


def get_dates(month, year):
    db = get_db()
    dates = db.execute("SELECT id, day_id, date FROM calendar WHERE year = ? AND month_id = ?", (year, month,)).fetchall()
    db.close()

    dict_dates = [{"id": date["id"], "day_id": date["day_id"], "date": date["date"]} for date in dates]
    return dict_dates


def get_day_name(date_id: int) -> str:
    db = get_db()
    cell = db.execute("SELECT day FROM days JOIN calendar ON days.id = calendar.day_id WHERE calendar.id = ?", (date_id,)).fetchone()
    if cell == None:
        name = "fake-name"
    else:
        name = cell["day"]
    db.close()
    return name


def get_date(date_id):
    db = get_db()
    cell = db.execute("SELECT printf('%04d-%02d-%02d', year, month_id, date) as formatted_date FROM calendar WHERE calendar.id = ?", (date_id,)).fetchone()
    if cell == None:
        date = "fake-date"
    else:
        date = cell["formatted_date"]
    return date


def submit_event_form_to_db(form: dict, user_id: int):
    event_name = form.get("event-name")
    event_description = form.get("event-description")
    event_start_date = form.get("event-timings-date-start")
    event_start_time = form.get("event-timings-time-start")
    event_end_date = form.get("event-timings-date-end")
    event_end_time = form.get("event-timings-time-end")
    event_color = form.get("event-color")

    event_timings_start = f"{event_start_date} {event_start_time}"
    event_timings_end = f"{event_end_date} {event_end_time}"

    db = get_db()
    db.execute("""INSERT INTO events(event_name, event_description, event_timings_start, event_timings_end, event_color, user_id) VALUES (?, ?, julianday(?), julianday(?), ?, ?)""",
        (event_name, event_description, event_timings_start, event_timings_end, event_color, user_id,)
    )
    db.commit()
    db.close()
    return


