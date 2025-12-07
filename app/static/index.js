const yearDropdown = document.querySelector('.year-dropdown');
const monthDropdown = document.querySelector('.month-dropdown');

function removeActiveElements(itemCategory) {
    document.querySelectorAll(`.active.${itemCategory}`).forEach(activeElement => {
        if (activeElement.length != 0) {
            activeElement.classList.remove('active');
        }
    });
}
const dropdownItems = document.querySelectorAll('.dropdown-item')
dropdownItems.forEach(dropdownItem => {
    dropdownItem.addEventListener('click', (event) => {
        let menuType = event.target.getAttribute('type');
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
            toggleDetailsCard();
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

const previousButton = document.getElementById('previous-month');
const nextButton = document.getElementById('next-month');
const noOfMonths = 12;
const janIndex = 1;
const decIndex = 12;

document.querySelectorAll('.arrows').forEach(changeMonthButton => {
    let changeValueBy = changeMonthButton.id === 'next-month' ? 1 : -1;
    changeMonthButton.addEventListener('click', () => {
        let activeMonthItem = monthDropdown.parentElement.querySelector('.dropdown-menu').querySelector('.active');
        let monthValue = parseInt(activeMonthItem.getAttribute('value'));
        if (monthValue + changeValueBy > noOfMonths || monthValue + changeValueBy < janIndex) {
            let activeYearItem = yearDropdown.parentElement.querySelector('.dropdown-menu').querySelector('.active');
            let yearValue = parseInt(activeYearItem.getAttribute('value')); 
            monthValue = changeValueBy > 0 ? janIndex : decIndex;
            yearValue += changeValueBy;
            removeActiveElements('years');
            removeActiveElements('months');
            let newActiveYearElement = document.querySelector(`.year-${yearValue}`);
            newActiveYearElement.classList.add('active');
            let newActiveMonthElement = document.querySelector(`.month-${monthValue}`);
            newActiveMonthElement.classList.add('active');
            yearDropdown.textContent = newActiveYearElement.textContent;
            year = newActiveYearElement;
            monthDropdown.textContent = newActiveMonthElement.textContent;
            month = newActiveMonthElement;
            getCalendar().then(() => {
                toggleDetailsCard();
            });
            return;
        }
        monthValue += changeValueBy;
        removeActiveElements('months');
        let newActiveMonthElement = document.querySelector(`.month-${monthValue}`);
        newActiveMonthElement.classList.add('active');
        monthDropdown.textContent = newActiveMonthElement.textContent;
        month = newActiveMonthElement;
        getCalendar().then(() => {
            toggleDetailsCard();
        });
        return;
    });
});

const daysInAWeek = 7;

let CurrentDate = new Date();
let currentDay = String(CurrentDate.getDate());
let currentMonth = String(CurrentDate.getMonth() + 1);
let currentYear = String(CurrentDate.getFullYear());

let month = document.getElementById('current-month');
let year = document.getElementById('current-year');

function toCSSClass(category, prefix) {
    if (category === "(G)") {
        category = `${prefix}-gazetted`;
    } else if (category === "(R)") {
        category = `${prefix}-restricted`;
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
            additionalClasses.set(date['id'], toCSSClass(date['category'], 'bg'));
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
            if (date['date'] ===  padNumber(currentDay, 2) && month.getAttribute('value') === currentMonth && year.getAttribute('value') == currentYear) {
                extraClasses = ['calendar-col-data', toCSSClass(date['category'], 'bg'), 'today', 'bg-today'];
            } else {
                extraClasses = ['calendar-col-data', toCSSClass(date['category'], 'bg')];
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
        document.getElementById(additionalClass[0]).classList.add(toCSSClass(additionalClass[1], 'bg'))
    }
}

const dateDetailsCardUI = {
    masterDiv: document.getElementById('date-tooltip'),
    dateTitle: document.getElementById('date-title'),
    holidayParagraph: document.getElementById('holiday-paragraph'),
    tooltipTitle: document.getElementById('toolbar-title'),
    eventsParagraph: document.getElementById('events-paragraph'),
    async fill(dateCell) {
        let holidays = await getHolidays(dateCell.id);
        let todayString = dateCell.classList.contains('today') ? ' | Today' : '';
        this.dateTitle.textContent = `${year.getAttribute('value')}-${month.getAttribute('value')}-${dateCell.textContent}${todayString}`;
        this.dateTitle.setAttribute('value', dateCell.id);
        this.holidayParagraph.innerHTML = '';
        if (holidays) {
            let unorderedList = document.createElement('ul');
            for (let holiday of holidays) {
                let listItem = document.createElement('li');
                let spanHoliday = document.createElement('span');
                spanHoliday.textContent = holiday['holiday'];
                let spanCategory = document.createElement('span');
                spanCategory.textContent = ` ${holiday['category']}`;
                spanCategory.classList.add(toCSSClass(holiday['category'], 'text'))
                listItem.append(spanHoliday);
                listItem.append(spanCategory);
                unorderedList.append(listItem);
            }
            this.holidayParagraph.append(unorderedList);
        }

        let events = await getEvents(dateCell.id);
        this.eventsParagraph.innerHTML = '';
        if (events) {
            let unorderedList = document.createElement('ul');
            for (let userEvent of events) {
                let listItem = document.createElement('li');
                listItem.classList.add('event-list-item');
                listItem.textContent = userEvent['name'];
                listItem.addEventListener('click', (clickEvent) => {
                    eventDetailsCard.eventID = userEvent['id'];
                    if (!eventDetailsCard.display || eventDetailsCard.previousEventID != eventDetailsCard.eventID) {
                        eventDetailsCard.show(clickEvent, userEvent);
                    } else {
                        eventDetailsCard.hide();
                    }
                });
                unorderedList.append(listItem);
            }
            this.eventsParagraph.append(unorderedList);
        }
        return;
    }
}

const editEventFormEl = {
    id: document.getElementById('edit_event_id'),
    name:  document.getElementById('edit_name'),
    desc:  document.getElementById('edit_description'),
    start:  document.getElementById('edit_start_time'),
    end:    document.getElementById('edit_end_time'),
    color: document.getElementById('edit_event_color'),
    colorDisplay: document.getElementById('edit_event_color_display'),
    fill(serverEvent) {
        this.name.value = serverEvent['name'];
        this.desc.value = serverEvent['desc'];
        this.start.value = formatDateTime(serverEvent['start_time'] * 1000);
        this.end.value = formatDateTime(serverEvent['end_time'] * 1000);
        this.id.value = serverEvent['id'];
        this.color.value = serverEvent['color'];
        this.colorDisplay.style.backgroundColor = serverEvent['color'];
    }
}
function displaySelectedColor(target, display) {
    display.style.backgroundColor = target.value;
}
editEventFormEl.color.addEventListener('change', (event) => {
    displaySelectedColor(event.target, editEventFormEl.colorDisplay);
});
displaySelectedColor(editEventFormEl.color, editEventFormEl.colorDisplay);

const eventDetailsCard = {
    masterEL: document.getElementById('event-details-popup'),
    header: document.getElementById('card-header'),
    editIcon: document.getElementById('edit-icon'),
    title: document.getElementById('event-title'),
    desc: document.getElementById('description-card'),
    duration: document.getElementById('duration'),
    timings: document.getElementById('timings'),
    eventID: 0,
    previousEventID: 0,
    display: false,
    show(event, serverEvent) {
        // AI Usage Disclaimer: Required some help to understand how to set the x and y coordinates of the popup.
        let eventRect = event.target.getBoundingClientRect();
        let yMouse = event.pageY - 65;
        let xRightPlusPadding = Math.floor(eventRect.right + 20);
        this.masterEL.style.top = `${yMouse}px`;
        this.masterEL.style.left = `${xRightPlusPadding}px`;
        this.title.textContent = serverEvent['name'];
        this.desc.textContent = serverEvent['desc'];
        this.duration.textContent = formatTimestampDifference((serverEvent['end_time'] - serverEvent['start_time']) * 1000);
        this.timings.textContent = formatDateTime(serverEvent['start_time'] * 1000) + ' - ' + formatDateTime(serverEvent['end_time'] * 1000);
        this.editIcon.setAttribute('value', serverEvent['id']);
        editEventFormEl.fill(serverEvent);
        this.header.style.backgroundColor = serverEvent['color'];
        this.masterEL.style.display = 'inline';
        this.display = true;
        this.previousEventID = this.eventID;
    },
    hide() {
        this.masterEL.style.display = 'none';
        this.display = false;
        this.previousEventID = 0;
    }
}

getCalendar().then(() => {
    toggleDetailsCard();
});

function toggleDetailsCard() {
    let displayStyle = 'grid';
    let previousCellId = 0;
    document.querySelectorAll('.calendar-col-data').forEach(date => {
        date.addEventListener('click', (event) => {
            if (previousCellId === event.target.id) {
                previousCellId = 0;
                displayStyle = 'none';
                dateDetailsCardUI.masterDiv.style.display = displayStyle;
                return;
            }
            displayStyle = 'grid';
            dateDetailsCardUI.fill(event.target);
            previousCellId = event.target.id;
            dateDetailsCardUI.masterDiv.style.display = displayStyle;
            return;
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

function goToDate(event) {
    let dateId = event.target.getAttribute('value');
    window.location.href = `/dates?id=${dateId}`
}

dateDetailsCardUI.dateTitle.addEventListener('click', goToDate);