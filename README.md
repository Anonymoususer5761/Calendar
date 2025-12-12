# Calendar

## Introduction
This is my submission for CS50x's final project.<br>
A calendar app with the typical functionality expected of such an app, adding events, displaying national holidays, a clock, among other features. Initially, I intended the project to support multiple nations and national calendar systems, but decided to scale it back due to time constraints.

## Files
<ul>
    <li>
        <h3><code>calendar_app.py</code></h3>
        The file runs the app when <code>flask_run</code> is called by importing the app
    </li>
    <li>
        <h3><code>.flaskenv</code></h3>
        A config file that tells Flask where the main app file is located. 
    </li>
    <li>
        <h3><code>requirements.txt</code></h3>
        Responsible for recording all external Python modules used for making the project. Updated using pip freeze.
    </li>
    <li>
        <h3><code>config.py</code></h3>
        Sets or imports important website configurations such as secret keys, etc.
    </li>
    <li>
        <h3><code>calendar.db</code></h3>
        This file contains all user data as well data related to dates, events and holidays.<br>
        <h5>Schema</h5>
        The calendar table is an important table that is related to almost all other tables, it stores each day from January 1<sup>st</sup> 1970 (the Unix epoch) to December 31<sup>st</sup> 2099 in Unix time.<br>
        Event timings are also stored in Unix time. To retrieve the events for any given day, the database is queried for the Unix time for the end of the day and the beginning of the day. If the event starts before the day ends and the event ends before the day starts, the event is returned.<br>
        The database is also used to store settings such as pomodoro settings.
    </li>
    <li>
        <h3><code>sass/main.scss</code></h3>
        This is file compiles my custom Bootstrap CSS. It primarly used to define custom theme colors.
    </li>
    <li>
        <h3><code>app/__init__.py</code></h3>
        A very important file that initializes the app by creating an app Object, a login manager, loads all configurations, and performs a circular import of routes to activate all app route decorators.
    </li>
    <li>
        <h3><code>app/calendar_db.py</code></h3>
        This file is used for retrieving data from the database. Most calls from the server to the database are made through this file.
    </li>
    <li>
        <h3><code>app/database_manager.py</code></h3>
        All other files that interact with the database retrieve the sqlite3 database object from here.
    </li>
    <li>
        <h3><code>app/forms.py</code></h3>
        Handles all web forms using WTForms Flask extension.<br>
        Follows a consistent format for all forms. The form parameters are defined first along with any Flask provided validators. Custom validator methods are then used to validate the data further, then, each form has a <code>submit_to_db()</code> method that submits the data to the database. All custom validation and database submission was previously done in <code>calendar_db.py</code>, but I soon realized that was not the best practice.
    </li>
    <li>
        <h3><code>app/helpers.py</code></h3>
        Small and helful helper functions and useful shared constructs used throughout the app. Consists of possible color choices when making events, function for padding digits, and a function for making changes that persist in nested dictionaries in flask sessions.
    </li>
    <li>
        <h3><code>app/pytemplates.py</code></h3>
        Creates plain text HTML that is sent to the client to render.<br> Calculates event timings and creates SVGs that represent them in a day timeline. The start or end time of an event in seconds is divided by the pixels in the timeline and multiplied by seconds in day and finally offset by the start of day in pixels.
    </li>
    <li>
        <h3><code>app/routes.py</code></h3>
        By far the most important file. Defines all app routes and APIs.<br>
        <ul>
            <li><h6>index</h6>
            Renders the index.html page with the all months, years, today, and an edit event form.
            </li>
            <li><h6>dates</h6>
            Has two forms, one to add events, and the other to edit them. The user is returned to index if no valid date id was sent. The date, day name, and SVGs are all rendered with the dates.html page.
            </li>
            <li><h6>clock</h6>
            Consists of two pages, stopwatch and pomodoro. The stopwatch route is simple. The pomodoro page has settings form.
            </li>
            <li><h6>register</h6>
            Renders a registration html form.
            </li>
            <li><h6>login</h6>
            Renders a sign in html form.
            </li>
            <li><h6>logout</h6>
            After the user is logged in through Flask, they can be logged out using this route. Only visible to logged users.
            </li>
            <li><h6>About</h6>
            Provides a simple description about the website and provides all necessar credits.
            </li>
        </ul>
    </li>
    <li>
        <h3><code>database_initializer/initiate_db.py</code></h3>
        A script that automatically configures the database. It creates a database using a schema defined in database_initializer/read.sql. It then imports data from csv files in datasets directory.
    </li>
    <li>
        <h3><code>app/templates/404.html</code></h3>
        The error page displayed when a user types a non existant route.
    </li>
    <li>
        <h3><code>app/templates/500.html</code></h3>
        The error page displayed when a user experiences an internal server error.
    </li>
    <li>
        <h3><code>app/templates/layout.html</code></h3>
        Defines the base template that will be used throughout the website. All other .html files will inherit from this file using Jinja2.
    </li>
    <li>
        <h3><code>app/templates/index.html</code></h3>
        The home page. Displays an interactive calendar.
    </li>
    <li>
        <h3><code>app/templates/dates.html</code></h3>
        The user can see a timeline that showcases all their events. There is a button to add events, and users can interact with the events by clicking on it.
    </li>
    <li>
        <h3><code>app/templates/clock.html</code></h3>
        A template file inherited by stopwatch.html and pomodoro.html.
    </li>
    <li>
        <h3><code>app/templates/pomodoro.html</code></h3>
        Displays a countdown. A Red countdown means a pomodoro session is active, whearas a blue countdown means it is break time. You find the settings on the top middle right.
    </li>
    <li>
        <h3><code>app/templates/stopwatch.html</code></h3>
        Consists of a timer that can be paused, lapped, or reset.
    </li>
</ul>

