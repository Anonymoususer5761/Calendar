-- SELECT (calendar.id) AS id, day_id, substr(date(unix_time, 'unixepoch'), -2, 2) AS date, holiday, category
-- FROM calendar
-- LEFT JOIN indian_holidays
-- ON calendar.id = indian_holidays.date_id
-- WHERE
--     unix_time >= unixepoch("2025-10-01", 'start of month')
--     AND
--     unix_time <= unixepoch("2025-10-01", 'start of month', '+1 month', '-1 day')

-- SELECT (events.id) AS event_id, (events.name) AS event_name, (events.description) AS description, start_time, end_time, (events.color) AS color
-- FROM events JOIN users ON user_id = users.id 
-- WHERE user_id = ? 
-- AND (start_time <= (SELECT (unix_time -1) AS unix_time FROM calendar WHERE id = (? + 1))
-- AND end_time >= (SELECT (unix_time - {hours}) AS unix_time FROM calendar WHERE id = ?))


SELECT * 
FROM calendar 
JOIN indian_holidays 
    ON calendar.id = indian_holidays.date_id 
WHERE calendar.id = 20382

