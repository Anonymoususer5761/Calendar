from app.calendar_db import get_events

from datetime import timedelta

SECONDS_IN_DAY = 86400
PIXELS_IN_TIMELINE = 2500
SCALE = SECONDS_IN_DAY / PIXELS_IN_TIMELINE

SECONDS_IN_HOUR = 3600
ONE_DAY_IN_PIXELS = 2400

def get_svg_polylines(date_id: int | str, user_id: int | str) -> str:
    date_id = int(date_id)
    events = get_events(date_id, user_id)

    if events:
        date = timedelta(days=date_id - 1)
        html = []
        x2 = 75
        if len(events) <= 9:
            increment = 100
        else:
            increment = 600 / len(events)
        x1 = x2 + increment
        for event in events:
            start = timedelta(seconds=event["start_time"])
            end = timedelta(seconds=event["end_time"])
            y1 = 0
            possible_y1 = start.seconds / SCALE
            y2 = 2599
            possible_y2 = end.seconds / SCALE
            if start.days == date.days:
                y1 = possible_y1
            elif start - date >= timedelta(seconds=SECONDS_IN_HOUR):
                y1 = possible_y1 - ONE_DAY_IN_PIXELS
            if end.days == date.days:
                y2 = possible_y2
            elif end - date <= timedelta(seconds=SECONDS_IN_HOUR):
                y2 = possible_y2 - ONE_DAY_IN_PIXELS
            html.append(f'<polyline value="{event["id"]}" class="custom-lines" points="{x1},{y1} {x2},{y1} {x2},{y2} {x1},{y2}" fill={event["color"]} stroke={event["color"]} opacity="0.35" stroke-width="2px"></polyline>')
            x1 += increment
            x2 += increment
        return ''.join(html)
    return False