from app.calendar_db import get_events

from datetime import timedelta

SECONDS_IN_DAY = 86400
PIXELS_IN_TIMELINE = 2400
SCALE = SECONDS_IN_DAY / PIXELS_IN_TIMELINE

SECONDS_IN_HOUR = 3600
ONE_DAY_IN_PIXELS = 2400
DAY_START_IN_PIXELS = 100

def get_event_svg(date_id: int | str, user_id: int | str) -> str:
    date_id = int(date_id)
    events = get_events(date_id, user_id)

    if events:
        selected_date = timedelta(days=date_id - 1)
        html = []
        x1_percent = 0
        width_increment = 10
        if len(events) > 10:
            width_increment = 100 / len(events)
        x2_percent = width_increment
        for event in events:
            event_start = timedelta(seconds=event["start_time"])
            event_end = timedelta(seconds=event["end_time"])
            y1 = 0
            y2 = 2499
            if event_start.days == selected_date.days:
                y1 = event_start.seconds / SCALE + DAY_START_IN_PIXELS
            elif event_start - selected_date >= timedelta(seconds=SECONDS_IN_HOUR):
                y1 = event_start.seconds / SCALE + DAY_START_IN_PIXELS - ONE_DAY_IN_PIXELS
            if event_end.days == selected_date.days:
                y2 = event_end.seconds / SCALE + DAY_START_IN_PIXELS - y1
            elif event_end - selected_date <= timedelta(seconds=SECONDS_IN_HOUR):
                y2 = event_end.seconds / SCALE + DAY_START_IN_PIXELS - ONE_DAY_IN_PIXELS - y1
            if y2 == 0:
                y2 = 1
            html.append(
                f'<rect value="{event["id"]}" color-value="{event["color"]}"class="event-rects" x="{x1_percent}%" y="{y1}" width="{x2_percent}%" height="{y2}" fill="{event["color"]}" stroke="{event["color"]}"></rect>'
            )
            x1_percent += width_increment
        return ''.join(html)
    return ""