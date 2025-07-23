from app.calendar_db import get_events

from decimal import Decimal, getcontext

getcontext().prec = 10

SECONDS_IN_DAY = 86400
SCALE = 36 # 36 = 86400 (number of seconds in a day) / 2400 (the difference in pixels between 00:00 and 24:00 is exactly 2400px, i.e., 2600 - 200).
OFFSET = 200 # The timeline starts at y=200px.
ONE_TWENTY_FOURTH = Decimal(1) / Decimal(24)

def get_events_and_format_events_svg(date_id: int | str, user_id: int | str) -> str:
    date_id = int(date_id)
    events = get_events(date_id, user_id)

    if events:
        date = date_id - 1
        html = []
        x2 = 75
        if len(events) <= 9:
            increment = 100
        else:
            increment = 925 / len(events)
        x1 = x2 + increment
        for event in events:
            start = event["timings_start"]
            end = event["timings_end"]
            start_date_difference = date - Decimal(start) / Decimal(SECONDS_IN_DAY)
            end_date_difference = Decimal(end) / Decimal(SECONDS_IN_DAY) - date
            y1 = 100
            possible_y1 = Decimal(start % SECONDS_IN_DAY) / Decimal(SCALE) + OFFSET
            y2 = 2599
            possible_y2 = Decimal(end % SECONDS_IN_DAY) / Decimal(SCALE) + OFFSET
            if start_date_difference <= 0:
                y1 = possible_y1
            elif float(start_date_difference) <= float(ONE_TWENTY_FOURTH):
                y1 = possible_y1 - 2400
            if end_date_difference >= 0:
                y2 = possible_y2 if end_date_difference < 1 else 2599
            elif float(end_date_difference) >= float(-ONE_TWENTY_FOURTH):
                y2 = possible_y2 - 2400
            html.append(f'<polyline value="{event["id"]}" class="custom-lines" points="{x1},{y1} {x2},{y1} {x2},{y2} {x1},{y2}" fill={event["color"]} stroke={event["color"]} opacity="0.35" stroke-width="2px"></polyline>')
            x1 += increment
            x2 += increment
        return events, ''.join(html)
    else:
        return "No Events Today", ""