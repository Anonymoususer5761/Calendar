const millisecondsInADay = 86400000;
const pixelsInTimeline = 2400;
const scale = pixelsInTimeline / millisecondsInADay;

const millisecondsInSecond = 1000;

function pad(singleDigit) {
    singleDigit = singleDigit.toString().padStart(2, '0');
    return singleDigit;
}

function formatTimestampDifference(timestamp) {
    const unixEpochStartYear = 1970;
    timestamp = parseInt(timestamp);
    let date = new Date(timestamp);
    const dateTimeObject = {
        minutes: date.getUTCMinutes() != 0 ? `${date.getUTCMinutes()} minutes` : '',
        hours: date.getUTCHours() != 0 ? `${date.getUTCHours()} hours` : '',
        days: date.getUTCDate() -1 != 0 ? `${date.getUTCDate() - 1} days` : '',
        months: date.getUTCMonth() != 0 ? `${date.getUTCMonth()} months` : '',
        years: date.getUTCFullYear() - unixEpochStartYear != 0 ? `${date.getUTCFullYear() - unixEpochStartYear} years` : '',
    }
    let returnString = `${dateTimeObject.years} ${dateTimeObject.months} ${dateTimeObject.days} ${dateTimeObject.hours} ${dateTimeObject.minutes}`;
    return returnString.trim();
}

// Used ChatGPT because I couldn't figure out that I had to convert the timestamp into milliseconds.
function formatDateTime(timestamp) {
    timestamp = parseInt(timestamp);
    let date = new Date(timestamp);
    let datetime = date.toISOString();
    datetime = datetime.replace('T', ' ').split('.')[0].slice(0, 16);
    return datetime;
}

function displayNowLine() {
    let nowLine = document.querySelector('.now-line');
    let now = new Date();
    let dayStart = new Date();
    dayStart.setHours(0, 0, 0, 0);
    let time = now.getTime() - dayStart.getTime();
    let y_axis = time * scale;
    nowLine.setAttribute('y1', y_axis);
    nowLine.setAttribute('y2', y_axis);
    nowLine.style.display = 'block';
}

selectedDate = document.getElementById('selected-date').textContent;
let today = new Date();
let todayDate = today.toISOString().split('T')[0];
if (todayDate === selectedDate) {
    document.addEventListener('DOMContentLoaded', displayNowLine);
    setInterval(displayNowLine, 1000);
}

const popup = document.getElementById('event-details-popup');
async function displayEventTooltip(event, eventId) {
    let response = await fetch(`/api/dates/event?event_id=${eventId}`, {
        headers: {
            'Request-Source': 'JS-AJAX',
        }
    });
    serverEvent = await response.json();
    // AI Usage Disclaimer: Required some help to understand how to set the x and y coordinates of the popup.
    let eventRect = event.target.getBoundingClientRect();
    let yMouse = event.pageY;
    let xRightPlusPadding = Math.floor(eventRect.right + 10);
    popup.style.top = `${yMouse}px`;
    popup.style.left = `${xRightPlusPadding}px`;
    const eventTitle = document.getElementById('event-title');
    eventTitle.textContent = serverEvent['name'];
    const description = document.getElementById('description-card');
    description.textContent = serverEvent['desc'];
    const duration = document.getElementById('duration');
    duration.textContent = formatTimestampDifference((serverEvent['end'] - serverEvent['start']) * 1000);
    const timings = document.getElementById('timings');
    timings.textContent = formatDateTime(serverEvent['start'] * 1000) + ' - ' + formatDateTime(serverEvent['end'] * 1000);
    popup.style.display = 'inline';
}

document.querySelectorAll('.event-rects').forEach(async rect => {
    rect.addEventListener('click', async (event) => {
        let popupDisplay = false;
        let previousPopupId = 0;
        let eventId = 0;
        eventId = parseInt(rect.getAttribute('value'));
        if (!popupDisplay || previousPopupId != eventId) {
            await displayEventTooltip(event, eventId)
            popupDisplay = true;
            previousPopupId = eventId;
        } else {
            popup.style.display = 'none';
            popupDisplay = false;
            previousPopupId = 0;
        }
    });
});

document.querySelectorAll('.change-date-arrow').forEach(arrow => {
    arrow.addEventListener('click', (event) => {
        let date_id = parseInt(document.getElementById('selected-date').getAttribute('value'));
        date_id = event.target.id === 'go-forward' ? date_id + 1 : date_id - 1;
        window.location.href = window.location.href.split('=')[0] + `=${date_id}`;
    });
});

// let eventPopupStarts = document.getElementsByClassName('event-popup-start');
// let eventPopupEnds = document.getElementsByClassName('event-popup-end');
// let convertToMilliseconds = 1000
// for (let i = 0; i < eventPopupStarts.length; i++) {
//     eventPopupStarts[i].innerHTML = formatDateTime(eventPopupStarts[i].innerHTML * convertToMilliseconds);
//     eventPopupEnds[i].innerHTML = formatDateTime(eventPopupEnds[i].innerHTML * convertToMilliseconds);
// }

// let customLines = document.getElementsByClassName('custom-lines');
// function svgHoverEffect(eventId, event, active=false) {
//     if (active === true) {
//         popup = document.getElementById(`event-popup-${eventId}`);
//         popup.classList.add('event-popup-hover');
//     }
//     else {
//         document.getElementById(`event-popup-${eventId}`).classList.remove('event-popup-hover');
//     }
//     return
// }

// function hoverEventListeners() {
//     for (let customLine of customLines) {
//         customLine.addEventListener('mouseenter', (event) => {
//             svgHoverEffect(customLine.getAttribute('value'), event, active=true)
//             customLine.classList.add('custom-lines-hover');
//         });
//         customLine.addEventListener('mouseleave', () => {
//             svgHoverEffect(customLine.getAttribute('value'), event, active=false)
//             customLine.classList.remove('custom-lines-hover');
//         });
//     }
// }

// hoverEventListeners();

// let addFormButton = document.getElementById('add-event-button');
// addFormButton.addEventListener('click', () => {
//     if (authorised) {
//         document.getElementById('add-event-div').style.display = 'flex';
//     } else {
//         alert("User not authenticated. You must sign in to add events.");
//     }
// });
// let removeFormButtons = document.getElementsByClassName('close-add-event-form');
// for (let removeFormButton of removeFormButtons) {
//     removeFormButton.addEventListener('click', () => {
//         document.getElementById('add-event-div').style.display = 'none';
//     });
// }

// let previousDay = {
//     "Monday": "Sunday",
//     "Tuesday": "Monday",
//     "Wednesday": "Tuesday",
//     "Thursday": "Wednesday",
//     "Friday": "Thursday",
//     "Saturday": "Friday",
//     "Sunday": "Saturday",
// }

// document.getElementById('yesterday').innerHTML = previousDay[document.getElementById('day-name').innerHTML.trim()]