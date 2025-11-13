CREATE TABLE IF NOT EXISTS "days" (
    "id" INTEGER,
    "day" TEXT NOT NULL,
    PRIMARY KEY ("id")
);
CREATE TABLE IF NOT EXISTS "calendar" ( 
    "id" INTEGER,
    "day_id" INTEGER NOT NULL,
    "unix_time" INTEGER NOT NULL,
    FOREIGN KEY ("day_id") REFERENCES days("id"),
    PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "calendar_index" ON "calendar" (
    "id", "date" 
);

CREATE TABLE IF NOT EXISTS "users" (
    "id" INTEGER,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "user_index" ON "users" (
    "id", "username", "email"
);
CREATE TABLE IF NOT EXISTS "settings_name" (
        "id"            INTEGER,
        "setting"       TEXT NOT NULL UNIQUE,
        PRIMARY KEY("id")
);
CREATE TABLE IF NOT EXISTS "settings_options" (
        "id"            INTEGER,
        "setting_id"    INTEGER NOT NULL,
        "option"        TEXT NOT NULL,
        PRIMARY KEY("id", "setting_id"),
        FOREIGN KEY("setting_id") REFERENCES "settings_name"("id")
);
CREATE TABLE IF NOT EXISTS "settings" (
        "setting_id"    INTEGER,
        "option_id"     INTEGER DEFAULT 1,
        "user_id"       INTEGER,
        PRIMARY KEY("option_id","setting_id","user_id"),
        FOREIGN KEY("option_id") REFERENCES "settings_options"("id"),
        FOREIGN KEY("setting_id") REFERENCES "settings_name"("id"),
        FOREIGN KEY("user_id") REFERENCES "users"("id")
);

CREATE TABLE IF NOT EXISTS "events" (
        "id" INTEGER,
        "name" TEXT NOT NULL,
        "description" TEXT NOT NULL,
        "start_time" INTEGER NOT NULL,
        "end_time" INTEGER NOT NULL,
        "color" TEXT NOT NULL,
        "user_id" INTEGER,
        PRIMARY KEY("id"),
        FOREIGN KEY("user_id") REFERENCES "users"("id")
);

CREATE INDEX IF NOT EXISTS "events_index" ON "events" (
    "id", "start_time", "end_time", "user_id"
);

CREATE TABLE IF NOT EXISTS "indian_holidays" (
        "id" INTEGER,
        "holiday" TEXT NOT NULL,
        "category" TEXT NOT NULL,
        "date_id" INTEGER,
        PRIMARY KEY("id"),
        FOREIGN KEY("date_id") REFERENCES "calendar"("id")
);