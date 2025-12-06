const stopwatchSwitcher = document.getElementById('clock-options-stopwatch');
const pomodoroSwitcher = document.getElementById('clock-options-pomodoro');

const webpage_path = window.location.href.split('/').pop();

const clockUpdateInterval = 25;

const timerMultiplierForDebugging = 1;

const clock = document.getElementById('clock');

if (webpage_path === 'clock' | webpage_path === 'stopwatch') {
    stopwatchSwitcher.classList.add('current-clock-option');
} else {
    pomodoroSwitcher.classList.add('current-clock-option');
}

function formatTimeValue(timeValue, format) {
    let hours = padNumber(Math.floor(timeValue / 3600000), 2);
    let minutes = padNumber(Math.floor((timeValue / 60000) % 60), 2);
    let seconds = padNumber(Math.floor((timeValue / 1000) % 60), 2);
    let milliseconds = padNumber(Math.floor(timeValue % 1000), 3);
    
    return format.replace('%H', hours).replace('%M', minutes).replace('%S', seconds).replace('%MS', milliseconds);

}