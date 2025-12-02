const pomodoroTimer = document.getElementById('pomodoro-timer');
const startButton = document.getElementById('start-button');
const pauseButton = document.getElementById('stop-button');
const resetButton = document.getElementById('reset-button');

const pomodoroDurationInputForm = document.getElementById('pomodoro_duration');
const shortBreakDurationInputForm = document.getElementById('short_break');
const longBreakDurationInputForm = document.getElementById('long_break');
const longBreakIntervalInputForm = document.getElementById('long_break_interval');

const millisecondsInMinute = 60000;

class Pomodoro {
    constructor(pomodoroDuration, shortBreakDuration, longBreakDuration, longBreakInterval) {
        this.pomodoroDuration = pomodoroDuration;
        this.shortBreakDuration = shortBreakDuration;
        this.longBreakDuration = longBreakDuration
        this.sessionDuration = pomodoroDuration;
        this.remainingDuration = pomodoroDuration;
        this.startTime = 0;
        this.elapsedTime = 0;
        this.paused = true;
        this.pausedAt = 0;
        this.breakTime = false;
        this.sessionCounter = 0;
        this.breakCounter = 0;
        this.longBreakInterval = longBreakInterval;
        this.intervalId = null;
    }
    startTimer() {
        if (this.paused) {
            this.intervalId = setInterval(() => {
                this.elapsedTime = Date.now() - this.startTime;
                this.remainingDuration = this.sessionDuration - (this.elapsedTime * 8);
                if (this.remainingDuration <= 0) {
                    if (!this.breakTime) {
                        this.sessionCounter++;
                        this.sessionDuration = this.sessionCounter % this.longBreakInterval === 0 ? this.longBreakDuration : this.shortBreakDuration;
                        this.startTime = Date.now();
                        this.breakTime = true;
                    } else {
                        this.breakCounter++;
                        this.sessionDuration = this.pomodoroDuration;
                        this.startTime = Date.now();
                        this.breakTime = false;
                    }
                    this.updateClockBackground();
                    this.syncWithServer('switch_session');
                }
                this.updateDisplay();
            }, 25)
            this.paused = false;
            this.syncWithServer('start');
        }
    }
    stopTimer() {
        if (!this.paused) {
            clearInterval(this.intervalId);
            this.paused = true;
            this.pausedAt = this.elapsedTime;
            this.syncWithServer('stop');
        }
    }
    resetTimer() {
        clearInterval(this.intervalId);
        this.startTime = 0;
        this.elapsedTime = 0;
        this.pausedAt = 0;
        this.paused = true;
        this.breakTime = false;
        this.sessionCounter = 0;
        this.breakCounter = 0;
        this.sessionDuration = this.pomodoroDuration
        this.remainingDuration = this.sessionDuration;
        this.updateClockBackground();
        this.syncWithServer('reset');
    }
    updateDisplay() {
        pomodoroTimer.innerHTML = formatTimeValue(this.remainingDuration);
    }
    updateClockOptions() {
        if (this.paused) {
            startButton.style.display = 'inline-block';
            pauseButton.style.display = 'none';
        } else {
            startButton.style.display = 'none';
            pauseButton.style.display = 'inline-block';
        }
    }
    updateClockBackground() {
        if (this.breakTime) {
            clock.classList.remove('pomodoro-background');
            clock.classList.add('break-background');
        } else {
            clock.classList.remove('break-background');
            clock.classList.add('pomodoro-background');
        }
    }
    async syncWithServer(apiRoute='') {
        switch(apiRoute) {
            case 'start':
                await fetch(`/api/clock/pomodoro/${apiRoute}?start_time=${this.startTime}&session_duration=${this.sessionDuration}`, {
                    headers: {
                        "Request-Source": "JS-AJAX",
                    }
                });
                return;
            case 'stop':
                await fetch(`/api/clock/pomodoro/${apiRoute}?paused_at=${this.pausedAt}&remaining_duration=${this.remainingDuration}`, {
                    headers: {
                        "Request-Source": "JS-AJAX",
                    }
                });
                return;
            case 'reset':
                await fetch(`/api/clock/pomodoro/${apiRoute}?`, {
                    headers: {
                        "Request-Source": "JS-AJAX",
                    }
                });
                return;
            case 'switch_session':
                await fetch(`/api/clock/pomodoro/${apiRoute}?start_time=${this.startTime}&session_duration=${this.sessionDuration}&break_time=${this.breakTime}&`, {
                    headers: {
                        "Request-Source": "JS-AJAX",
                    }
                });
                return;
            default:
                let response = await fetch('/api/clock/pomodoro/', {
                    headers: {
                        "Request-Source": "JS-AJAX",
                    }
                });          
                const serverPomodoro = await response.json();
                return serverPomodoro;
        }
    }
}

let pomodoro = new Pomodoro(
    parseInt(pomodoroDurationInputForm.value) * millisecondsInMinute,
    parseInt(shortBreakDurationInputForm.value) * millisecondsInMinute,
    parseInt(longBreakDurationInputForm.value) * millisecondsInMinute,
    parseInt(longBreakIntervalInputForm.value)
)
pomodoro.updateDisplay()
pomodoro.updateClockBackground();

const saveButton = document.querySelector('.save-pomodoro-settings-button');
function togglePomodoroSettings() {
    if (!pomodoro.paused) {
        saveButton.classList.add('disabled');
    } else {
        saveButton.removeAttribute('disabled');
    }
}
document.addEventListener('DOMContentLoaded', togglePomodoroSettings);

startButton.addEventListener('click', () => {
    pomodoro.startTime = Date.now() - pomodoro.pausedAt;
    pomodoro.startTimer();
    pomodoro.updateClockOptions();
    togglePomodoroSettings();
});
pauseButton.addEventListener('click', () => {
    pomodoro.stopTimer();
    pomodoro.updateClockOptions();
    togglePomodoroSettings();
});
resetButton.addEventListener('click', () => {
    pomodoro.resetTimer();
    pomodoro.updateDisplay();
    pomodoro.updateClockOptions();
    togglePomodoroSettings();
});

pomodoro.syncWithServer().then(serverPomodoro => {
    if (serverPomodoro["_exists"]) {
        pomodoro.startTime = serverPomodoro.start_time;
        pomodoro.sessionDuration = serverPomodoro.session_duration;
        pomodoro.remainingDuration = serverPomodoro.remaining_duration;
        pomodoro.pausedAt = serverPomodoro.paused_at;
        pomodoro.breakTime = serverPomodoro.break_time;
        pomodoro.sessionCounter = serverPomodoro.session_counter;
        pomodoro.breakCounter = serverPomodoro.break_counter;
        if (!serverPomodoro.paused) {
            pomodoro.startTimer();
        }
        pomodoro.updateDisplay();
        pomodoro.updateClockOptions();
        pomodoro.updateClockBackground();
    }
});
