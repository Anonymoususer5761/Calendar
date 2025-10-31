const stopwatchSwitcher = document.getElementById('clock-options-stopwatch');
const pomodoroSwitcher = document.getElementById('clock-options-pomodoro');

const webpage_path = window.location.href.split('/').pop();

if (webpage_path === 'clock' | webpage_path === 'stopwatch') {
    stopwatchSwitcher.classList.add('current-clock-option');
} else {
    pomodoroSwitcher.classList.add('current-clock-option');
}