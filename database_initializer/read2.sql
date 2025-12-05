SELECT (events.id) AS event_id, (events.name) AS event_name, (events.description) AS description, start_time, end_time, (events.color) AS color
FROM events JOIN users ON user_id = users.id 
WHERE user_id = 2 
AND (start_time <= (SELECT (unix_time -1) AS unix_time FROM calendar WHERE id = (20440 + 1))
AND end_time > (SELECT (unix_time - 0) AS unix_time FROM calendar WHERE id = 20440))