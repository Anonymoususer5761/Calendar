from datetime import date, timedelta

year, month, day = 1971, 1, 1
date_var = date(year, month, day)

with open("calendar.csv", "w") as file:
    file.write("id,day_id,date,month_id,year_id\n")
    id = 1
    day_id = 5
    while date_var.year != 2100:
        file.write(f"{id},{day_id},{date_var.day},{date_var.month},{date_var.year}\n")
        date_var = date_var + timedelta(days=1)
        id += 1
        if (day_id + 1) > 7:
            day_id = 1
        else:
            day_id += 1
            