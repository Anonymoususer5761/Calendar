const pomodoroTimer = document.getElementById('pomodoro-timer');
const startButton = document.getElementById('start-button');
const pauseButton = document.getElementById('stop-button');
const resetButton = document.getElementById('reset-button');

const sessionDurationInputForm = document.getElementById('session_length');
const shortBreakDurationInputForm = document.getElementById('short_break');
const longBreakDurationInputForm = document.getElementById('long_break');
const longBreakIntervalInputForm = document.getElementById('long_break_interval');

const millisecondsInMinute = 60000;

class Pomodoro {
    constructor(pomodroDuration, shortBreakDuration, longBreakDuration, longBreakInterval) {
        this.pomodoroDuration = pomodroDuration;
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
                this.remainingDuration = this.sessionDuration - (this.elapsedTime * MultiplierForDebugging);
                if (this.remainingDuration <= 0) {
                    if (!this.breakTime) {
                        this.sessionCounter++;
                        this.sessionDuration = this.sessionCounter % this.longBreakInterval === 0 ? this.longBreakDuration : this.shortBreakDuration;
                        this.elapsedTime = 0;
                        this.breakTime = true;
                    } else {
                        this.breakCounter++;
                        this.sessionDuration = this.pomodoroDuration;
                        this.elapsedTime = 0;
                        this.breakTime = false;
                    }
                }
                this.updateTimer();
                this.syncWithServer('start');
            }, 25)
        }
    }
    updateTimer() {
        pomodoroTimer.innerHTML = pomodoro.remainingDuration;
    }
    // stopTimer: function() {
    //     if (!this.paused) {
    //         clearInterval(this.intervalId);
    //         this.paused = true;
    //         this.pausedAt = this.elapsedTime;
    //         this.syncWithServer('stop');
    //     }
    // },
    // startBreak: function() {
    //     if (this.paused) {
    //         this.intervalId = setInterval(() => {
    //             this.elapsedTime = Date.now() - this.startTime;
    //             this.remainingDuration = this.sessionDuration - (this.elapsedTime * timerMultiplierForDebugging);
    //             this.updateDisplay();
    //             if (this.remainingDuration <= 0) {
    //                 clearInterval(this.intervalId);
    //                 this.breakTime=false;
    //                 this.sessionCounter++;
    //                 this.updateDisplay();
    //                 updatePomodoro();
    //                 this.paused = true;
    //                 this.pausedAt = 0;
    //                 this.startSession();
    //                 return
    //             }
    //         }, clockUpdateInterval);
    //         this.paused = false;
    //         this.syncWithServer('start');
    //         return
    //     }
    // },
    // resetTimer: function() {
    //     this.remainingDuration = this.sessionDuration;
    //     clearInterval(this.intervalId);
    //     this.paused=true;
    //     this.pausedAt = 0;
    //     this.breakTime=false;
    //     this.sessionCounter = 0;
    //     this.updateDisplay(0);
    //     this.syncWithServer('reset');
    // },
    // updateDisplay: function() {
    //     pomodoroTimer.innerHTML = formatTimeValue(this.remainingDuration);
    // },
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
                await fetch(`/api/clock/pomodoro/${apiRoute}?elapsed_time=${this.elapsedTime}&remaining_duration=${this.remainingDuration}`, {
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

let pomodoro = Object.create(Pomodoro);

function updateClockOptions() {
    if (pomodoro.paused) {
        startButton.style.display = 'inline-block';
        pauseButton.style.display = 'none';
    } else {
        startButton.style.display = 'none';
        pauseButton.style.display = 'inline-block';
    }
}

startButton.addEventListener('click', () => {
    this.startTime = Date.now() - this.pausedAt;
    if (!this.breakTime) {
        this.startSession();
    } else {
        this.startBreak();
    }
    updateClockOptions();
});
pauseButton.addEventListener('click', () => {
    this.stopTimer();
    updateClockOptions()
});
resetButton.addEventListener('click', () => {
    this.resetTimer();
    updateClockOptions()
});

const pomodoroSettingsButton = document.getElementById('pomodoro-settings-button');
const pomodoroSettingsMenu = document.getElementById('pomodoro-settings-menu');
const pomodoroSettingsMenuCloseButton = document.getElementById('pomodoro-settings-menu-close-button');
pomodoroSettingsButton.addEventListener('click', () => {
    pomodoroSettingsMenu.style.display = 'block';
});
pomodoroSettingsMenuCloseButton.addEventListener('click', () => {
    pomodoroSettingsMenu.style.display= 'none';
});
this.syncWithServer('').then(serverPomodoro => {
    if (!serverPomodoro["_exists"]) {
        updatePomodoro();
        this.updateDisplay();
        return;
    }
    this.startTime = serverPomodoro["start_time"];
    this.elapsedTime = serverPomodoro["elapsed_time"];
    this.sessionDuration = serverPomodoro["session_duration"];
    this.remainingDuration = serverPomodoro["remaining_duration"];
    this.pausedAt = serverPomodoro["paused_at"];
    this.breakTime = serverPomodoro["break_time"];
    if (!serverPomodoro["paused"]) {
        if (!serverPomodoro["break_time"]) {
            this.startSession();
        } else {
            this.startBreak();
        }
        updateClockOptions();
    }
    this.updateDisplay();
    return;
});

