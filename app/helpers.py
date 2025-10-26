from werkzeug.datastructures import ImmutableMultiDict

from app.database_manager import get_db

from datetime import datetime
import random

color_choices = (("#ff0000", "Red"), ("#0000ff", "Blue"), ("#00ff00", "Green"), ("#ffff00", "Yellow"), ("#800080", "Purple"))

def date_to_id(date: str) -> int:
    """Expects a date string in YYYY-MM-DD format"""
    db = get_db()
    year, month_id, day = date.split("-")
    date_id = db.execute("SELECT id FROM calendar WHERE date = ? AND month_id = ? AND year = ?", (day, month_id, year,)).fetchone()["id"]
    db.close()

    return date_id


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


def pad_digit(digit: int | str, pad_length: int) -> str:
    digit = str(digit)
    padded_digit = f"{"0" * (pad_length - len(digit))}{digit}"
    return padded_digit


def format_datetime(timestamp: str | int) -> str:
    timestamp = int(timestamp)
    return datetime.fromtimestamp(timestamp).strftime("%Y-%m-%d %H:%M")


def modulate_color(hex_code: str, factor: float =0.2) -> str:
    rgb = [int(hex_code[1:3], 16), int(hex_code[3:5], 16), int(hex_code[5:7], 16)]
    rgb[0] += round(255 * factor)
    rgb[1] += round(255 * factor)
    rgb[2] += round(255 * factor)
    for i in range(len(rgb)):
        if rgb[i] > 255:
            rgb[i] = 255
        elif rgb[i] < 0:
            rgb[i] = 0
    print("#%02x%02x%02x" % (rgb[0], rgb[1], rgb[2]))
    return "#%02x%02x%02x" % (rgb[0], rgb[1], rgb[2])


def update_dictionary(dictionary: dict, **kwargs) -> dict:
    dictionary.update(kwargs)
    return dictionary