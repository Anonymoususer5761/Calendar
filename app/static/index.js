function removeActiveElements(itemCategory) {
    document.querySelectorAll(`.active.${itemCategory}`).forEach(activeElement => {
        if (activeElement.length != 0) {
            activeElement.classList.remove('active');
        }
    });
}
document.querySelectorAll('.dropdown-item').forEach(dropdownItem => {
    dropdownItem.addEventListener('click', (event) => {
        let menuType = event.target.classList.contains('years') ? 'years' : 'months'
        removeActiveElements(menuType);
        event.target.classList.add('active');
    });
});

document.addEventListener('shown.bs.dropdown', (event) => {
    const dropdownMenu = event.target.parentElement.querySelector('.dropdown-menu');

    const activeItem = dropdownMenu.querySelector('.active')

    if (activeItem) {
        activeItem.scrollIntoView(
            {
                block: 'center'
            }
        );
    }
})

let CurrentDate = new Date();
let currentDay = CurrentDate.getDate();
let currentMonth = CurrentDate.getMonth() + 1;
let currentYear = CurrentDate.getFullYear();

let month = document.getElementById('current-month');
let year = document.getElementById('current-year');

function convertToCSSFormat(category) {
    if (category === "(G)") {
        category = 'gazetted';
    } else if (category === "(R)") {
        category = 'restricted';
    }
    return category;
}

function createCalendarElement(elementToCreate, extraClasses) {
    switch(elementToCreate) {
        case 'tr':
            const row = document.createElement('tr');
            row.classList.add('calendar-tr', ...(extraClasses ?? []));
            return row;
        case 'td':
            const cell = document.createElement('td');
            cell.classList.add('calendar-td', ...(extraClasses ?? []));
            return cell;
    }
}

async function getCalendar() {
    const additionalClasses = new Map()
    document.querySelector('caption').innerHTML = `${month.textContent} ${year.getAttribute('value')}`;
    let datesResponse = await fetch(`/api/index/dates?month=${month.getAttribute('value')}&year=${year.getAttribute('value')}`, {
        headers: {
            'Request-Source': 'JS-AJAX',
        }
    });
    let dates = await datesResponse.json();
    const tableBody = document.getElementById('calendar-tbody');

    for (let date of dates) {
        // If current element is the first.
        if (date['date'] === '01') {
            tableBody.append(createCalendarElement('tr'));
        }
    }

    // let tableRowStart = '<tr class="calendar-tr">';
    // let tableRowEnd = '</tr>';
    // let emptyCells = '<td class="calendar-td"></td>';
    // let cellEnd = `</td>`;
    // let cell_class = 'class="calendar-td calendar-td-data"';
    let html = '';
    let dayOfWeek = 1;
    let preceedingDate = "00";
    for (let date of dates) {
        tableBody.append(tableRow)
        if (date['date'] === "01") {
            html += tableRowStart;
        }
        if (preceedingDate == date['date']) {
            additionalClasses.set(date['id'], convertToCSSFormat(date['category']))
        //     // document.getElementById(date['date']).classList.add(date["category"])
            continue;
        } else {
            preceedingDate = date['date'];
        }
        // Prints empty cells if the starting day of the month and the calendar format do not match.  
        while (dayOfWeek != date['day_id']) {
            html += emptyCells;
            if (dayOfWeek + 1 < 8) {
                dayOfWeek = dayOfWeek + 1;
            } else {
                html += tableRowEnd;
                html += tableRowStart;
                dayOfWeek = 1;
            }
        }
        // Prints the date otherwise.
        if (dayOfWeek === date['day_id']) {
            if (date['date'] == currentDay && month.value == currentMonth && year.value == currentYear) {
                html += `<td id="${date['id']}"" class="today calendar-td calendar-td-data ${convertToCSSFormat(date['category'])}">`;
                html += date['date'];
                html += cellEnd;
            } else {
                html += `<td id="${date['id']}" class="calendar-td calendar-td-data ${convertToCSSFormat(date["category"])}">`;
                html += date['date'];
                html += cellEnd;
            }
            if (date['date'] === dates[dates.length - 1]['date']) {
                let range = 7 - dayOfWeek;
                for (let i = 0; i < range; i++) {
                    html += emptyCells;
                }
            }
        }
        if (dayOfWeek + 1 < 8) {
            dayOfWeek = dayOfWeek + 1;
        } else {
            html += tableRowEnd;
            html += tableRowStart;
            dayOfWeek = 1;
        }
    }

    document.getElementById('calendar-tbody').innerHTML = html;

    for (let additionalClass of additionalClasses.entries()) {
        document.getElementById(additionalClass[0]).classList.add(convertToCSSFormat(additionalClass[1]))
    }
}

getCalendar().then( () => {
    finishCalendar();
});
month.addEventListener('change', () => {
    getCalendar().then( () => {
        finishCalendar();
    });
});
year.addEventListener('change', () => {
    getCalendar().then( () => {
        finishCalendar();
    });
});

async function getHolidays(day) {
    let response = await fetch(`/api/index/holidays?id=${day.getAttribute('id')}`, {
        headers: {
            'Request-Source': 'JS-AJAX',
        }
    });
    let holidays = await response.json();
    let html = '';
    if (holidays) {
        for (let holiday of holidays) {
            html += `<h1 class="${convertToCSSFormat(holiday["category"])}">${holiday["holiday"]} ${holiday["category"]}</h1>`;
        }
    } else {
        html = '';
    }
    if (day.classList.contains('today')) {
        html += '<h1 class="today">Today</h1>';
    }
    return html;
}

async function finishCalendar() {
    let tooltipExists = false;
    async function hideTooltip(event) {
        if (tooltipExists) {
            event.target.removeChild(event.target._divRef);
            tooltipExists = false;
        }
    }
    async function showTooltip(event, html) {
        await hideTooltip();
        let div = document.createElement('div');
        div.className = 'calendar-td-data-tooltip card border-info mb-3';
        event.target.appendChild(div);
        event.target._divRef = div;
        tooltipExists = true;
        div.innerHTML = html;

    }
    let dayCells = document.getElementsByClassName('calendar-td-data');
    for (let cell of dayCells) {
        cell.addEventListener('click', (event) => {
            document.location.href = `/dates?id=${event.target.getAttribute('id')}`;
        });
        getHolidays(cell).then((html) => {
            if (html) {
                cell.addEventListener('mouseover', (event) => {
                    showTooltip(event, html);
                });
            }
        });
        cell.addEventListener('mouseout', hideTooltip);
    }
}