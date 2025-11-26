function pad(singleDigit) {
    singleDigit = singleDigit.toString().padStart(2, '0');
    return singleDigit;
}

const millisecondsInADay = 86400000;
const pixelsInTimeline = 2400;
const scale = pixelsInTimeline / millisecondsInADay;

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

// Used ChatGPT because I couldn't figure out that I had to convert the timestamp into milliseconds.
function formatDateTime(timestamp) {
    timestamp = parseInt(timestamp);
    let date = new Date(timestamp);
    let datetime = date.toISOString();
    datetime = datetime.replace('T', ' ').split('.')[0].slice(0, 16);
    return datetime;
}

document.querySelectorAll('.event-rects').forEach(rect => {
    rect.addEventListener('click', () => {
        event_id = rect.getAttribute('value');
        displayEventTooltip(event_id).then(returnValue => {
            if (returnValue) {
                // pass;
            }
        });
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