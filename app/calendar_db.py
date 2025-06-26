from app.database_manager import get_db

from collections import namedtuple

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
    dates = db.execute("SELECT day_id, date FROM calendar WHERE year = ? AND month_id = ?", (year, month,)).fetchall()
    db.close()

    Date = namedtuple("date", ["day_id", "date"])
    my_dates = []
    for date in dates:
        my_dates.append(Date(date["day_id"], date["date"])._asdict())
    return my_dates


def get_day_name(year: str, month: str, day: str) -> str:
    db = get_db()
    name: str = db.execute("SELECT day FROM days JOIN calendar ON days.id = calendar.day_id WHERE year = ? AND month_id = ? AND date = ?", (year, month, day,)).fetchone()[0]
    db.close()
    return name