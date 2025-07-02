from flask import redirect, url_for

from app.database_manager import get_db

def verify_request_source(request_header_source, redirect_to):
    if request_header_source != "JS-AJAX":
        return redirect(url_for(redirect_to))
    

def date_to_id(date: str) -> int:
    """Expects a date string in YYYY-MM-DD format"""
    db = get_db()
    year, month_id, day = date.split("-")
    date_id = db.execute("SELECT id FROM calendar WHERE date = ? AND month_id = ? AND year = ?", (day, month_id, year,)).fetchone()["id"]
    db.close()

    return date_id