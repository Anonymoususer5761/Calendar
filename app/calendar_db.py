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
