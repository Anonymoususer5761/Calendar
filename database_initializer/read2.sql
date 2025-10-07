SELECT (calendar.id) AS id, day_id, substr(date(unix_time, 'unixepoch'), -2, 2) AS date, holiday, category
FROM calendar
LEFT JOIN indian_holidays
ON calendar.id = indian_holidays.date_id
WHERE
    unix_time >= unixepoch("2025-10-01", 'start of month')
    AND
    unix_time <= unixepoch("2025-10-01", 'start of month', '+1 month', '-1 day')