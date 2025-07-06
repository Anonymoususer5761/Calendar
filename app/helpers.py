from werkzeug.datastructures import ImmutableMultiDict
import random

from app.database_manager import get_db

def date_to_id(date: str) -> int:
    """Expects a date string in YYYY-MM-DD format"""
    db = get_db()
    year, month_id, day = date.split("-")
    date_id = db.execute("SELECT id FROM calendar WHERE date = ? AND month_id = ? AND year = ?", (day, month_id, year,)).fetchone()["id"]
    db.close()

    return date_id


def validate_form(form: type[ImmutableMultiDict[str, str]], required_fields: tuple[str, ...]) -> bool:
    for fields in required_fields:
        if form[fields] == None or form[fields] == "":
            return False
    return True


def get_color_hex(color: str) -> str:
    color_dict = {
        "red": "#ff0000",
        "blue": "#0000ff",
        "green": "#00ff00",
        "yellow": "#ffff00",
        "purple": "#800080",
    }
    color_hex = color_dict.get(color, "#%02x%02x%02x" % (random.randrange(0, 256), random.randrange(0, 256), random.randrange(0, 256)))
    return color_hex