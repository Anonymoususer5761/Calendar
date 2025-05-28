# Calendar

## Introduction
This is my submission for CS50x's final project.<br> I aimed to make a calendar app that stores data regarding holidays in the state of Karnataka India.

### Process:
My first step was to make a basic html website that imported data from a SQLite3 database displayed it on the website.<br>
The website was simple enough, but the database took me a while to make.

#### Calendar Database in SQL
1. Create a calendar.csv that would be imported into SQL:
<br> I created a Python script that would generate the id, date, and day's name id and write it to a csv.<br>
The day's name id would be a foreign key that would be defined in another SQL table called days (The days table was created by converting a manually typed days.csv file).  

