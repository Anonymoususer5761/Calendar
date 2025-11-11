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
                this.remainingDuration = this.sessionDuration - (this.elapsedTime);
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
                    this.syncWithServer('switch_session');
                }
                this.updateTimer();
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
        this.remainingDuration = this.sessionDuration;
        this.startTime = 0;
        this.elapsedTime = 0;
        this.pausedAt = 0;
        this.paused = true;
        this.breakTime = false;
        this.sessionCounter = 0;
        this.breakCounter = 0;
    }
    updateTimer() {
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
    async syncWithServer(apiRoute='') {
        switch(apiRoute) {
            case 'start':
                await fetch(`/api/clock/pomodoro/${apiRoute}?start_time=${this.startTime}&session_duration=${this.sessionDuration}&break_time=${this.breakTime}`, {
                    headers: {
                        "Request-Source": "JS-AJAX",
                    }
                });
                return;
            case 'stop':
                await fetch(`/api/clock/pomodoro/${apiRoute}?start_time=${this.startTime}&paused_at=${this.pausedAt}&session_duration=${this.sessionDuration}&remaining_duration=${this.remainingDuration}`, {
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
                await fetch(`/api/clock/pomodoro/${apiRoute}?break_time=${this.breakTime}`, {
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
pomodoro.updateTimer()

startButton.addEventListener('click', () => {
    pomodoro.startTime = Date.now() - pomodoro.pausedAt;
    pomodoro.startTimer();
    pomodoro.updateClockOptions();
});
pauseButton.addEventListener('click', () => {
    pomodoro.stopTimer();
    pomodoro.updateClockOptions();
});
resetButton.addEventListener('click', () => {
    pomodoro.resetTimer();
    pomodoro.updateTimer();
    pomodoro.updateClockOptions();
});

pomodoro.syncWithServer().then(serverPomodoro => {
    console.log(serverPomodoro);
    if (serverPomodoro["_exists"]) {
        pomodoro.startTime = serverPomodoro.start_time;
        pomodoro.remainingDuration = serverPomodoro.remaining_duration;
        pomodoro.pausedAt = serverPomodoro.paused_at;
        pomodoro.breakTime = serverPomodoro.break_time;
        pomodoro.sessionCounter = serverPomodoro.session_counter;
        pomodoro.breakCounter = serverPomodoro.break_counter;
    }
})

// this.syncWithServer('').then(serverPomodoro => {
//     if (!serverPomodoro["_exists"]) {
//         updatePomodoro();
//         this.updateDisplay();
//         return;
//     }
//     this.startTime = serverPomodoro["start_time"];
//     this.elapsedTime = serverPomodoro["elapsed_time"];
//     this.sessionDuration = serverPomodoro["session_duration"];
//     this.remainingDuration = serverPomodoro["remaining_duration"];
//     this.pausedAt = serverPomodoro["paused_at"];
//     this.breakTime = serverPomodoro["break_time"];
//     if (!serverPomodoro["paused"]) {
//         if (!serverPomodoro["break_time"]) {
//             this.startSession();
//         } else {
//             this.startBreak();
//         }
//         updateClockOptions();
//     }
//     this.updateDisplay();
//     return;
// });

const pomodoroSettingsButton = document.getElementById('pomodoro-settings-button');
const pomodoroSettingsMenu = document.getElementById('pomodoro-settings-menu');
const pomodoroSettingsMenuCloseButton = document.getElementById('pomodoro-settings-menu-close-button');
pomodoroSettingsButton.addEventListener('click', () => {
    pomodoroSettingsMenu.style.display = 'block';
});
pomodoroSettingsMenuCloseButton.addEventListener('click', () => {
    pomodoroSettingsMenu.style.display= 'none';
});

