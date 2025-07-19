from app.calendar_db import get_events

from math import trunc

def events_svg(date_id: int|str, user_id: int|str):
    events = get_events(date_id, user_id)
    html = ""
    for event in events:
        start = event["timings_start"]
        end = event["timings_end"]
        seconds_in_day = 86400
        seconds_in_day_by_scale_of_timeline = 36
        offset = 200
        y1 = 100
        possible_y1 = start % seconds_in_day / seconds_in_day_by_scale_of_timeline + offset
        y2 = 2599
        if trunc(start / seconds_in_day) + 1 == int(date_id):
            y1 = possible_y1
        elif possible_y1 > 2400:
            y1 = possible_y1 - 2400
        if trunc(end / seconds_in_day) + 1 == int(date_id):
            y1 = end % seconds_in_day / seconds_in_day_by_scale_of_timeline + offset
        html += f'<polyline id="event-{event["id"]}" class="custom-lines" name="{event["name"]}" points="975,{y1} 75,{y1} 75,{y2} 975,{y2}" fill={event["color"]} stroke={event["color"]} opacity="0.25"></polyline>'
    return html