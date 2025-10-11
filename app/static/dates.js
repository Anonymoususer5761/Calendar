function pad(singleDigit) {
    singleDigit = singleDigit.toString().padStart(2, '0');
    return singleDigit;
}


    function setColorMenuColor() {
    document.getElementById('event-form-color-picker').setAttribute('fill', document.getElementById('event-color').value);
}

if (document.getElementById('event-form-color-picker')) {
    let eventColorMenu = document.getElementById('event-color');
    document.addEventListener('DOMContentLoaded', setColorMenuColor);
    eventColorMenu.addEventListener('change', setColorMenuColor);
}


selectedDate = document.querySelector('h1').innerHTML;
// Used ChatGPT to fix a bug where time wouldn't not update dynamically.
function moveDayLine() {
    let svg = document.getElementById('now');
    let now = new Date();
    let dayStart = new Date();
    dayStart.setHours(0, 0, 0, 0);
    let time = now.getTime() - dayStart.getTime()
    let offset = 200 // 00:00 Starts at y=200px.
    let y_axis = (time / 36000) + offset; // 36000 = milliseconds in a day (86.4M) / scale of svg in pixels (2400).
    svg.setAttribute("y1", y_axis);
    svg.setAttribute("y2", y_axis);
    svg.removeAttribute("display");
}

if (localStorage.getItem('today').split("T")[0] === selectedDate) {
    document.addEventListener('DOMContentLoaded', moveDayLine())
    let interval = setInterval(moveDayLine, 1000);
}

// Events imported from Fetch API.
let dayId = document.location.href.split('?')[1].split('=')[1];

// Used ChatGPT because I couldn't figure out that I had to convert the timestamp into milliseconds.
function formatDateTime(timestamp) {
    timestamp = parseInt(timestamp);
    let date = new Date(timestamp);
    let datetime = date.toISOString();
    datetime = datetime.replace('T', ' ').split('.')[0].slice(0, 16);
    return datetime;
}

let eventPopupStarts = document.getElementsByClassName('event-popup-start');
let eventPopupEnds = document.getElementsByClassName('event-popup-end');
let convertToMilliseconds = 1000
for (let i = 0; i < eventPopupStarts.length; i++) {
    eventPopupStarts[i].innerHTML = formatDateTime(eventPopupStarts[i].innerHTML * convertToMilliseconds);
    eventPopupEnds[i].innerHTML = formatDateTime(eventPopupEnds[i].innerHTML * convertToMilliseconds);
}

let customLines = document.getElementsByClassName('custom-lines');
function svgHoverEffect(eventId, event, active=false) {
    if (active === true) {
        popup = document.getElementById(`event-popup-${eventId}`);
        popup.classList.add('event-popup-hover');
    }
    else {
        document.getElementById(`event-popup-${eventId}`).classList.remove('event-popup-hover');
    }
    return
}

function hoverEventListeners() {
    for (let customLine of customLines) {
        customLine.addEventListener('mouseenter', (event) => {
            svgHoverEffect(customLine.getAttribute('value'), event, active=true)
            customLine.classList.add('custom-lines-hover');
        });
        customLine.addEventListener('mouseleave', () => {
            svgHoverEffect(customLine.getAttribute('value'), event, active=false)
            customLine.classList.remove('custom-lines-hover');
        });
    }
}

hoverEventListeners();

let auth = localStorage.getItem('auth');

let addFormButton = document.getElementById('add-event-button');
addFormButton.addEventListener('click', () => {
    if (auth === "1") {
        document.getElementById('add-event-div').style.display = 'flex';
        // addFormButton.classList.add('close-add-event-form');
    } else {
        alert("User not authenticated. You must sign in to add events.");
    }
});
let removeFormButtons = document.getElementsByClassName('close-add-event-form');
for (let removeFormButton of removeFormButtons) {
    removeFormButton.addEventListener('click', () => {
        document.getElementById('add-event-div').style.display = 'none';
        // addFormButton.classList.remove('close-add-event-form');
    });
}

let previousDay = {
    "Monday": "Sunday",
    "Tuesday": "Monday",
    "Wednesday": "Tuesday",
    "Thursday": "Wednesday",
    "Friday": "Thursday",
    "Saturday": "Friday",
    "Sunday": "Saturday",
}

document.getElementById('yesterday').innerHTML = previousDay[document.getElementById('day-name').innerHTML.trim()]