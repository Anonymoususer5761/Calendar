from datetime import datetime, timedelta

import sqlite3

year, month, day, hour, minutes, seconds = 1970, 1, 1, 0, 0, 0
date_var = datetime(year, month, day, hour, minutes, seconds)

db = sqlite3.connect("calendar.db")

db.execute("DELETE FROM calendar")

id = 1
day_id = 4
while date_var.year != 2100:
    db.execute("INSERT INTO calendar(id, day_id, unix_time) VALUES (?, ?, unixepoch(?))",
        (id, day_id, date_var.strftime("%Y-%m-%d"))       
    )

    id += 1
    if (day_id + 1) > 7:
        day_id = 1
    else:
        day_id += 1
    date_var = date_var + timedelta(days=1)

db.commit()
db.close()
