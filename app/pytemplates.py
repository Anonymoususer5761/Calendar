from app.calendar_db import get_events

from math import trunc

SECONDS_IN_DAY = 86400
SCALE = 36 # 36 = 86400 (number of seconds in a day) / 2400 (the difference in pixels between 00:00 and 24:00 is exactly 2400px, i.e., 2600 - 200).
OFFSET = 200 # The timeline starts at y=200px.

def events_svg(date_id: int | str, user_id: int | str) -> str:
    date_id = int(date_id)
    events = get_events(date_id, user_id)
    html = []
    x1 = 175
    x2 = 75
    if events:
        for event in events:
            start = event["timings_start"]
            end = event["timings_end"]
            y1 = 200
            possible_y1 = start % SECONDS_IN_DAY / SCALE + OFFSET
            y2 = 2599
            if trunc(start / SECONDS_IN_DAY) + 1 == date_id: # Checks if event starts today.
                y1 = possible_y1
            elif possible_y1 == 200:
                y1 = possible_y1 - 100
            elif possible_y1 > 2400:
                y1 = possible_y1 - 2400
            elif possible_y1 > 200:
                y1 = 100
            if trunc(end / SECONDS_IN_DAY) + 1 == date_id: # Checks if event starts today.
                y2 = end % SECONDS_IN_DAY / SCALE + OFFSET
            html.append(f'<polyline id="event-{event["id"]}" class="custom-lines" name="{event["name"]}" points="{x1},{y1} {x2},{y1} {x2},{y2} {x1},{y2}" fill={event["color"]} stroke={event["color"]} opacity="0.25" stroke-linecap="round"></polyline>')
            x1 += 100
            x2 += 100
        return ''.join(html)
    else:
        return "No Events Today"