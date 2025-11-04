const stopwatchSwitcher = document.getElementById('clock-options-stopwatch');
const pomodoroSwitcher = document.getElementById('clock-options-pomodoro');

const webpage_path = window.location.href.split('/').pop();

const clockUpdateInterval = 25;

const timerMultiplierForDebugging = 8;

if (webpage_path === 'clock' | webpage_path === 'stopwatch') {
    stopwatchSwitcher.classList.add('current-clock-option');
} else {
    pomodoroSwitcher.classList.add('current-clock-option');
}

function formatTimeValue(timeValue, hideHours=true) {
    let hours = padNumber(Math.floor(timeValue / 3600000), 2);
    let minutes = padNumber(Math.floor((timeValue / 60000) % 60), 2);
    let seconds = padNumber(Math.floor((timeValue / 1000) % 60), 2);
    let milliseconds = padNumber(Math.floor(timeValue % 1000), 3);
    if (!hideHours) {
        return `${hours}:${minutes}:${seconds}.${milliseconds}`;
    }
    if (hours != '00') {
        return `${hours}:${minutes}:${seconds}.${milliseconds}`;
    }
    return `${minutes}:${seconds}.${milliseconds}`;
}