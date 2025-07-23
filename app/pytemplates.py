from app.calendar_db import get_events

from datetime import timedelta

SECONDS_IN_DAY = 86400
SCALE = 36 # 36 = 86400 (number of seconds in a day) / 2400 (the difference in pixels between 00:00 and 24:00 is exactly 2400px, i.e., 2600 - 200).
OFFSET = 200 # The timeline starts at y=200px.

def get_events_and_format_events_svg(date_id: int | str, user_id: int | str) -> str:
    date_id = int(date_id)
    events = get_events(date_id, user_id)

    if events:
        date = timedelta(days=date_id - 1)
        html = []
        x2 = 75
        if len(events) <= 9:
            increment = 100
        else:
            increment = 925 / len(events)
        x1 = x2 + increment
        for event in events:
            start = timedelta(seconds=event["timings_start"])
            end = timedelta(seconds=event["timings_end"])
            y1 = 100
            possible_y1 = start.seconds / SCALE + OFFSET
            y2 = 2599
            possible_y2 = end.seconds / SCALE + OFFSET
            if start.days == date.days:
                y1 = possible_y1
            elif start - date >= timedelta(seconds=3600):
                y1 = possible_y1 - 2400
            if end.days == date.days:
                y2 = possible_y2
            elif end - date <= timedelta(seconds=3600):
                y2 = possible_y2 - 2400
            html.append(f'<polyline value="{event["id"]}" class="custom-lines" points="{x1},{y1} {x2},{y1} {x2},{y2} {x1},{y2}" fill={event["color"]} stroke={event["color"]} opacity="0.35" stroke-width="2px"></polyline>')
            x1 += increment
            x2 += increment
        return events, ''.join(html)
    else:
        return "No Events Today", ""