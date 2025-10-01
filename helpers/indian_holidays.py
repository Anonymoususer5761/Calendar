from bs4 import BeautifulSoup

import requests
import time
import random

with open("indian_holidays.csv", "a") as file:
    file.write("date,day,holiday,category\n")
    for i in range(1, 13):
        html_text = requests.get(f"https://www.india.gov.in/calendar?date=2025-{i:02d}").text
        soup = BeautifulSoup(html_text, 'lxml')
        cells = soup.select("td.single-day:not(.empty):not(.no-entry)")
        for cell in cells:
            cell_data = cell.text.strip().split("\n")
            for text in cell_data:
                if text.strip() != "":
                    category = text[-3:]
                    file.write(f"{cell["data-date"]},{cell["headers"]},{text[0:-4]},{text[-3:]}\n")
        wait_time = random.randint(0, 3)
        time.sleep(wait_time)
        print(f"Please wait {wait_time} seconds for the next request.")