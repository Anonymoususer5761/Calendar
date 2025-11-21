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
        getCalendar().then(() => {
            addToolbar();
        });
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
        category = 'no-holidays';
    }
    return category;
}

function createCalendarElement(elementToCreate, id, extraClasses) {
    switch(elementToCreate) {
        case 'row':
            const row = document.createElement('div');
            row.classList.add('row', 'flex-nowrap', 'calendar-row', ...(extraClasses ?? []));
            return row;
        case 'col':
            const cell = document.createElement('div');
            cell.id = id ? id : 'empty-cell'
            cell.classList.add('col', 'border', 'calendar-col', ...(extraClasses ?? []));
            return cell;
    }
}

async function getCalendar() {
    const additionalClasses = new Map();

    document.querySelector('.caption').textContent = `${month.textContent} ${year.getAttribute('value')}`;
    let datesResponse = await fetch(`/api/index/dates?month=${month.getAttribute('value')}&year=${year.getAttribute('value')}`, {
        headers: {
            'Request-Source': 'JS-AJAX',
        }
    });
    let dates = await datesResponse.json();

    const datesContainer = document.getElementById('dates-container');
    datesContainer.innerHTML = '';

    let dayOfWeek = 1;
    let preceedingDate = '00';
    let rows = []
    let rowIndex = 0;
    for (let date of dates) {
        // If current element is the first.
        if (date['date'] === '01') {
            rows.push(createCalendarElement('row'));
        }

        // To differentiate different types of holidays.
        if (preceedingDate === date['date']) {
            additionalClasses.set(date['id'], convertToCSSFormat(date['category']));
            continue;
        }
        preceedingDate = date['date'];

        // Prints empty cells if the starting day of the month and the calendar format do not match.  
        while (dayOfWeek != date['day_id']) {
            let emptyCell = createCalendarElement('col');
            rows[rowIndex].append(emptyCell);
            if (dayOfWeek <= daysInAWeek) {
                dayOfWeek++;
            } else {
                rows.push(createCalendarElement('row'));
                rowIndex++;
                dayOfWeek = 1;
            }
        }

        // Prints the date otherwise.
        if (dayOfWeek === date['day_id']) {
            let extraClasses = [];
            if (date['date'] ===  currentDay && month.getAttribute('value') === currentMonth && year.getAttribute('value') == currentYear) {
                extraClasses = ['calendar-col-data', convertToCSSFormat(date['category']), 'today', 'bg-today'];
            } else {
                extraClasses = ['calendar-col-data', convertToCSSFormat(date['category'])];
            }
            let id = String(date['id']);
            let cell = createCalendarElement('col', id, extraClasses);
            cell.textContent = date['date'];
            rows[rowIndex].append(cell);
            if (date['date'] === dates[dates.length -1]['date']) {
                let range = daysInAWeek - dayOfWeek;
                for (let i = 0; i < range; i++) {
                    let emptyCell = createCalendarElement('col');
                    rows[rowIndex].append(emptyCell); 
                }
            }
        }

        if (dayOfWeek < daysInAWeek) {
            dayOfWeek++;
        } else {
            rows.push(createCalendarElement('row'));
            rowIndex++;
            dayOfWeek = 1;
        }
    }

    for (let row of rows) {
        datesContainer.append(row);
    }

    for (let additionalClass of additionalClasses.entries()) {
        document.getElementById(additionalClass[0]).classList.add(convertToCSSFormat(additionalClass[1]))
    }
}

const dateTooltip = document.getElementById('date-tooltip')
const dateTitle = document.getElementById('date-title');
const holidayParagraph = document.getElementById('holiday-paragraph');
const tooltipTitle = document.getElementById('toolbar-title');

getCalendar().then(() => {
    addToolbar();
});

async function fillDateToolBar(dateCell) {
    // const ProductivityHeader = document.getElementById('productivity-header');
    // const productivityParagraph = document.getElementById('productivity-paragraph');
    let holidays = await getHolidays(dateCell.id);
    // let events = await getEvents(dateCell.id);
    let todayString = dateCell.classList.contains('today') ? ' | Today' : '';
    dateTitle.textContent = `${year.getAttribute('value')}-${month.getAttribute('value')}-${dateCell.textContent}${todayString}`;
    holidayParagraph.innerHTML = 'No Holidays';
    if (holidays) {
        let unorderedList = document.createElement('ul');
        for (let holiday of holidays) {
            let listItem = document.createElement('li');
            listItem.textContent = `${holiday["holiday"]} ${holiday["category"]}`;
            unorderedList.append(listItem);
        }
        holidayParagraph.append(unorderedList);
    }
    return;
}

function addToolbar() {
    document.querySelectorAll('.calendar-col-data').forEach(date => {
        date.addEventListener('mouseover', (event) => {
            fillDateToolBar(event.target);
            dateTooltip.style.display = 'grid';
        });
    });
}
async function getHolidays(dayId) {
    let response = await fetch(`/api/index/holidays?id=${dayId}`, {
        headers: {
            'Request-Source': 'JS-AJAX',
        }
    });
    return await response.json();
}
async function getEvents(dayId) {
    let response = await fetch(`/api/index/events?id=${dayId}`, {
        headers: {
            'Request-Source': 'JS-AJAX',
        }
    });
    return await response.json();
}
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