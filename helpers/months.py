menses = {
    "1": "January",
    "2": "February",
    "3": "March",
    "4": "April",
    "5": "May",
    "6": "June",
    "7": "July",
    "8": "August",
    "9": "September",
    "10": "October",
    "11": "November",
    "12": "December"
}

with open("months.csv", "w") as months:
    for index, mensis in menses.items():
        months.write(f"{index},{mensis}\n")