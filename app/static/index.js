const yearDropdown = document.querySelector('.year-dropdown');
const monthDropdown = document.querySelector('.month-dropdown');

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
        if (menuType === 'years') {
            yearDropdown.textContent = event.target.textContent;
            year = event.target;
        } else {
            monthDropdown.textContent = event.target.textContent;
            month = event.target;
        }
        removeActiveElements(menuType);
        event.target.classList.add('active');
        getCalendar();
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

const daysInAWeek = 7;

let CurrentDate = new Date();
let currentDay = String(CurrentDate.getDate());
let currentMonth = String(CurrentDate.getMonth() + 1);
let currentYear = String(CurrentDate.getFullYear());

let month = document.getElementById('current-month');
let year = document.getElementById('current-year');

function convertToCSSFormat(category) {
    if (category === "(G)") {
        category = 'bg-gazetted';
    } else if (category === "(R)") {
        category = 'bg-restricted';
    } else {
        category = 'none';
    }
    return category;
}

function createCalendarElement(elementToCreate, id, extraClasses) {
    switch(elementToCreate) {
        case 'tr':
            const row = document.createElement('tr');
            row.classList.add('calendar-tr', ...(extraClasses ?? []));
            return row;
        case 'td':
            const cell = document.createElement('td');
            cell.id = id;
            cell.classList.add('calendar-td', ...(extraClasses ?? []));
            return cell;
    }
}

async function getCalendar() {
    const additionalClasses = new Map();

    document.querySelector('caption').innerHTML = `${month.textContent} ${year.getAttribute('value')}`;
    let datesResponse = await fetch(`/api/index/dates?month=${month.getAttribute('value')}&year=${year.getAttribute('value')}`, {
        headers: {
            'Request-Source': 'JS-AJAX',
        }
    });
    let dates = await datesResponse.json();

    const tableBody = document.getElementById('calendar-tbody');
    tableBody.innerHTML = '';

    let dayOfWeek = 1;
    let preceedingDate = '00';
    let rows = []
    let rowIndex = 0;
    for (let date of dates) {
        // If current element is the first.
        if (date['date'] === '01') {
            rows.push(createCalendarElement('tr'));
        }

        // To differentiate different types of holidays.
        if (preceedingDate === date['date']) {
            additionalClasses.set(date['id'], convertToCSSFormat(date['category']));
            continue;
        }
        preceedingDate = date['date'];

        // Prints empty cells if the starting day of the month and the calendar format do not match.  
        while (dayOfWeek != date['day_id']) {
            let emptyCell = createCalendarElement('td');
            rows[rowIndex].append(emptyCell);
            if (dayOfWeek <= daysInAWeek) {
                dayOfWeek++;
            } else {
                rows.push(createCalendarElement('tr'));
                rowIndex++;
                dayOfWeek = 1
            }
        }

        // Prints the date otherwise.
        if (dayOfWeek === date['day_id']) {
            let extraClasses = [];
            if (date['date'] ===  currentDay && month.getAttribute('value') === currentMonth && year.getAttribute('value') == currentYear) {
                extraClasses = ['calendar-td-data', convertToCSSFormat(date['category']), 'today', 'bg-today'];
            } else {
                extraClasses = ['calendar-td-data', convertToCSSFormat(date['category'])];
            }
            let id = String(date['id']);
            let cell = createCalendarElement('td', id, extraClasses);
            cell.textContent = date['date'];
            rows[rowIndex].append(cell);
            if (date['date'] === dates[dates.length -1]['date']) {
                let range = daysInAWeek - dayOfWeek;
                for (let i = 0; i < range; i++) {
                    let emptyCell = createCalendarElement('td');
                    rows[rowIndex].append(emptyCell); 
                }
            }
        }

        if (dayOfWeek < daysInAWeek) {
            dayOfWeek++;
        } else {
            rows.push(createCalendarElement('tr'));
            rowIndex++;
            dayOfWeek = 1;
        }
    }

    for (let row of rows) {
        tableBody.append(row);
    }

    for (let additionalClass of additionalClasses.entries()) {
        document.getElementById(additionalClass[0]).classList.add(convertToCSSFormat(additionalClass[1]))
    }
}

getCalendar()
document.querySelectorAll('.dropdown-toggle').forEach(dropdown => {
    dropdown.addEventListener('change', () => {
        getCalendar();
    });
});


// async function getHolidays(day) {
//     let response = await fetch(`/api/index/holidays?id=${day.getAttribute('id')}`, {
//         headers: {
//             'Request-Source': 'JS-AJAX',
//         }
//     });
//     let holidays = await response.json();
//     let html = '';
//     if (holidays) {
//         for (let holiday of holidays) {
//             html += `<h1 class="${convertToCSSFormat(holiday["category"])}">${holiday["holiday"]} ${holiday["category"]}</h1>`;
//         }
//     } else {
//         html = '';
//     }
//     if (day.classList.contains('today')) {
//         html += '<h1 class="today">Today</h1>';
//     }
//     return html;
// }

// async function finishCalendar() {
//     let tooltipExists = false;
//     async function hideTooltip(event) {
//         if (tooltipExists) {
//             event.target.removeChild(event.target._divRef);
//             tooltipExists = false;
//         }
//     }
//     async function showTooltip(event, html) {
//         await hideTooltip();
//         let div = document.createElement('div');
//         div.className = 'calendar-td-data-tooltip card border-info mb-3';
//         event.target.appendChild(div);
//         event.target._divRef = div;
//         tooltipExists = true;
//         div.innerHTML = html;

//     }
//     let dayCells = document.getElementsByClassName('calendar-td-data');
//     for (let cell of dayCells) {
//         cell.addEventListener('click', (event) => {
//             document.location.href = `/dates?id=${event.target.getAttribute('id')}`;
//         });
//         getHolidays(cell).then((html) => {
//             if (html) {
//                 cell.addEventListener('mouseover', (event) => {
//                     showTooltip(event, html);
//                 });
//             }
//         });
//         cell.addEventListener('mouseout', hideTooltip);
//     }
// }