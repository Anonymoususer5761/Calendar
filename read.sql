CREATE TABLE IF NOT EXISTS "months" (
    "id" INTEGER,
    month TEXT NOT NULL,
    PRIMARY KEY (id)
);
CREATE TABLE IF NOT EXISTS "days" (
    "id" INTEGER,
    "day" TEXT NOT NULL,
    PRIMARY KEY ("id")
);
CREATE TABLE IF NOT EXISTS "calendar" ( 
    "id" INTEGER,
    "day_id" INTEGER NOT NULL,
    "date" INTEGER NOT NULL,
    "month_id" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    FOREIGN KEY ("month_id") REFERENCES "months"("id"),
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
        "setting"       TEXT NOT NULL,
        PRIMARY KEY("id")
);
CREATE TABLE IF NOT EXISTS "settings_options" (
        "id"            INTEGER,
        "setting_id"    INTEGER,
        "option"        TEXT NOT NULL,
        PRIMARY KEY("id","setting_id"),
        FOREIGN KEY("setting_id") REFERENCES "settings_name"("id")
);
CREATE TABLE IF NOT EXISTS "settings" (
        "setting_id"    INTEGER,
        "option_id"     INTEGER,
        "user_id"       INTEGER,
        PRIMARY KEY("option_id","setting_id","user_id"),
        FOREIGN KEY("option_id") REFERENCES "settings_options"("id"),
        FOREIGN KEY("setting_id") REFERENCES "settings_name"("id"),
        FOREIGN KEY("user_id") REFERENCES "users"("id")
);

CREATE TABLE IF NOT EXISTS "events" (
        "id" INTEGER,
        "event_name" TEXT NOT NULL,
        "event_description" TEXT NOT NULL,
        "event_timings_start" REAL NOT NULL,
        "event_timings_end" REAL NOT NULL,
        "event_color" TEXT NOT NULL,
        "user_id" INTEGER,
        PRIMARY KEY("id"),
        FOREIGN KEY("user_id") REFERENCES "users"("id")
)

