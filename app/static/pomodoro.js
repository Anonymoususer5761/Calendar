const pomodoroTimer = document.getElementById('pomodoro-timer');
const startButton = document.getElementById('start-button');
const pauseButton = document.getElementById('stop-button');
const resetButton = document.getElementById('reset-button');

const millisecondsInMinute = 60000;

const pomodoro = {
    sessionDuration: 0,
    breakDuration: 0,
    remainingDuration: 0,
    pausedAt: 0,
    startTime: 0,
    elapsedTime: 0,
    paused: true,
    intervalId: 0,
    breakTime: false,
    sessionCounter: 1,
    breakCounter: 0,
    longBreakInterval: 0,
    startSession: () => {
        if (pomodoro.paused) {
            pomodoro.intervalId = setInterval(() => {
                pomodoro.elapsedTime = Date.now() - pomodoro.startTime;
                pomodoro.remainingDuration = pomodoro.sessionDuration - (pomodoro.elapsedTime * timerMultiplierForDebugging);
                pomodoro.updateDisplay();
                if (pomodoro.remainingDuration <= 0) {
                    clearInterval(pomodoro.intervalId);
                    pomodoro.breakTime = true;
                    pomodoro.breakCounter++;
                    pomodoro.updateDisplay();
                    updatePomodoro();
                    pomodoro.paused = true;
                    pomodoro.pausedAt = 0;
                    pomodoro.startBreak();
                    return;
                }
            }, clockUpdateInterval);
            pomodoro.paused = false;
            pomodoro.syncWithServer('start');
            return;
        }
    },
    stopTimer: () => {
        if (!pomodoro.paused) {
            clearInterval(pomodoro.intervalId);
            pomodoro.paused = true;
            pomodoro.pausedAt = pomodoro.elapsedTime;
            pomodoro.syncWithServer('stop');
        }
    },
    startBreak: () => {
        if (pomodoro.paused) {
            pomodoro.intervalId = setInterval(() => {
                pomodoro.elapsedTime = Date.now() - pomodoro.startTime;
                pomodoro.remainingDuration = pomodoro.breakDuration - (pomodoro.elapsedTime * timerMultiplierForDebugging);
                pomodoro.updateDisplay();
                if (pomodoro.remainingDuration <= 0) {
                    clearInterval(pomodoro.intervalId);
                    pomodoro.breakTime=false;
                    pomodoro.sessionCounter++;
                    pomodoro.updateDisplay();
                    updatePomodoro();
                    pomodoro.paused = true;
                    pomodoro.pausedAt = 0;
                    pomodoro.startSession();
                    return
                }
            }, clockUpdateInterval);
            pomodoro.paused = false;
            pomodoro.syncWithServer('start');
            return
        }
    },
    resetTimer: () => {
        pomodoro.remainingDuration = pomodoro.sessionDuration;
        clearInterval(pomodoro.intervalId);
        pomodoro.paused=true;
        pomodoro.pausedAt = 0;
        pomodoro.breakTime=false;
        pomodoro.sessionCounter = 0;
        pomodoro.updateDisplay(0);
        pomodoro.syncWithServer('reset');
    },
    updateDisplay: () => {
        pomodoroTimer.innerHTML = formatTimeValue(pomodoro.remainingDuration);
    },
    syncWithServer: async (api_route) => {
        if (api_route === 'start') {
            await fetch(`/api/clock/pomodoro/${api_route}?start_time=${pomodoro.startTime}&session_duration=${pomodoro.sessionDuration}&break_time=${pomodoro.breakTime}`, {
                headers: {
                    "Request-Source": "JS-AJAX",
                }
            });
            return;
        }
        if (api_route === 'stop') {
            await fetch(`/api/clock/pomodoro/${api_route}?elapsed_time=${pomodoro.elapsedTime}`, {
                headers: {
                    "Request-Source": "JS-AJAX",
                }
            });
            return;
        }
        if (api_route === 'reset') {
            await fetch(`/api/clock/pomodoro/${api_route}?`, {
                headers: {
                    "Request-Source": "JS-AJAX",
                }
            });
            return;
        }
        let response = await fetch('/api/clock/pomodoro/', {
            headers: {
                "Request-Source": "JS-AJAX",
            }
        });          
        serverPomodoro = await response.json();
        return serverPomodoro;
    }
}

const sessionDurationInputForm = document.getElementById('session_length');
const shortBreakDurationInputForm = document.getElementById('short_break');
const longBreakDurationInputForm = document.getElementById('long_break');
const longBreakIntervalInputForm = document.getElementById('long_break_interval');
function updatePomodoro() {
    pomodoro.longBreakInterval = parseInt(longBreakIntervalInputForm.value);
    let userDefinedSessionDuration = parseInt(sessionDurationInputForm.value) * millisecondsInMinute;
    pomodoro.sessionDuration = userDefinedSessionDuration;
    let userDefinedBreakDuration;
    if (pomodoro.breakCounter % pomodoro.longBreakInterval === 0) {
        userDefinedBreakDuration = parseInt(longBreakDurationInputForm.value) * millisecondsInMinute;
    } else {
        userDefinedBreakDuration = parseInt(shortBreakDurationInputForm.value) * millisecondsInMinute;
    }
    pomodoro.breakDuration = userDefinedBreakDuration;
    pomodoro.remainingDuration = pomodoro.sessionDuration;
    return
}
longBreakIntervalInputForm.addEventListener('change', () => {
    if (pomodoro.paused) {
        updatePomodoro();
    }
});
sessionDurationInputForm.addEventListener('change', () => {
    if (pomodoro.paused) {
        updatePomodoro();
    }
});
shortBreakDurationInputForm.addEventListener('change', () => {
    if (pomodoro.paused) {
        updatePomodoro();
    }
});
longBreakDurationInputForm.addEventListener('change', () => {
    if (pomodoro.paused) {
        updatePomodoro();
    }
});

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
    pomodoro.startTime = Date.now() - pomodoro.pausedAt;
    if (!pomodoro.breakTime) {
        pomodoro.startSession();
    } else {
        pomodoro.startBreak();
    }
    updateClockOptions();
});
pauseButton.addEventListener('click', () => {
    pomodoro.stopTimer();
    updateClockOptions()
});
resetButton.addEventListener('click', () => {
    pomodoro.resetTimer();
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
pomodoro.syncWithServer('').then(serverPomodoro => {
    if (!serverPomodoro) {
        updatePomodoro();
        pomodoro.updateDisplay();
        return;
    }
    pomodoro.startTime = serverPomodoro["start_time"];
    pomodoro.elapsedTime = serverPomodoro["elapsed_time"];
    pomodoro.sessionDuration = serverPomodoro["session_duration"];
    pomodoro.remainingDuration = serverPomodoro["remaining_duration"];
    pomodoro.pausedAt = serverPomodoro["paused_at"];
    pomodoro.breakTime = serverPomodoro["break_time"];
    if (!serverPomodoro["paused"]) {
        if (!serverPomodoro["break_time"]) {
            pomodoro.startSession();
        } else {
            pomodoro.startBreak();
        }
    }
    pomodoro.updateDisplay();
    updateClockOptions();
    return;
});

