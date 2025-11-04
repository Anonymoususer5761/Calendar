const pomodoroTimer = document.getElementById('pomodoro-timer');
const startButton = document.getElementById('start-button');
const pauseButton = document.getElementById('stop-button');
const resetButton = document.getElementById('reset-button');

const millisecondsInMinute = 60000;

const pomodoro = {
    sessionDuration: 0,
    remainingSessionDuration: 0,
    breakDuration: 0,
    remainingBreakDuration: 0,
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
            pomodoro.startTime = Date.now() - pomodoro.pausedAt;
            pomodoro.intervalId = setInterval(() => {
                pomodoro.elapsedTime = Date.now() - pomodoro.startTime;
                pomodoro.remainingSessionDuration = pomodoro.sessionDuration - (pomodoro.elapsedTime * timerMultiplierForDebugging);
                pomodoro.updateDisplay(pomodoro.remainingSessionDuration);
                if (pomodoro.remainingSessionDuration <= 0) {
                    clearInterval(pomodoro.intervalId);
                    pomodoro.breakTime = true;
                    pomodoro.breakCounter++;
                    pomodoro.updateDisplay(0);
                    let breakType = pomodoro.breakCounter % pomodoro.longBreakInterval === 0 ? 'long' : 'short';
                    updateBreakDuration(breakType);
                    alert(`Starting a ${pomodoro.remainingBreakDuration / millisecondsInMinute} minute ${breakType} break.\nSession: ${pomodoro.sessionCounter}\nBreak: ${pomodoro.breakCounter}`);
                    pomodoro.paused = true;
                    pomodoro.pausedAt = 0;
                    pomodoro.startBreak();
                    return;
                }
            }, clockUpdateInterval);
            pomodoro.paused = false;
            return;
        }
    },
    stopTimer: () => {
        if (!pomodoro.paused) {
            clearInterval(pomodoro.intervalId);
            pomodoro.paused = true;
            pomodoro.pausedAt = pomodoro.elapsedTime;
        }
    },
    startBreak: () => {
        if (pomodoro.paused) {
            pomodoro.startTime = Date.now() - pomodoro.pausedAt;
            pomodoro.intervalId = setInterval(() => {
                pomodoro.elapsedTime = Date.now() - pomodoro.startTime;
                pomodoro.remainingBreakDuration = pomodoro.breakDuration - (pomodoro.elapsedTime * timerMultiplierForDebugging);
                pomodoro.updateDisplay(pomodoro.remainingBreakDuration);
                if (pomodoro.remainingBreakDuration <= 0) {
                    clearInterval(pomodoro.intervalId);
                    pomodoro.breakTime=false;
                    pomodoro.sessionCounter++;
                    pomodoro.updateDisplay(0);
                    updateSessionDuration();
                    alert(`Break ended! Starting a ${pomodoro.remainingSessionDuration / millisecondsInMinute} minute pomodoro session.\nSession: ${pomodoro.sessionCounter}\nBreak: ${pomodoro.breakCounter}`);
                    pomodoro.paused = true;
                    pomodoro.pausedAt = 0;
                    pomodoro.startSession();
                }
            }, clockUpdateInterval);
            pomodoro.paused = false;
        }
    },
    resetTimer: () => {
        pomodoro.remainingSessionDuration = pomodoro.sessionDuration;
        clearInterval(pomodoro.intervalId);
        pomodoro.paused=true;
        pomodoro.pausedAt = 0;
        pomodoro.breakTime=false;
        pomodoro.sessionCounter = 0;
        pomodoro.updateDisplay(pomodoro.remainingSessionDuration);
    },
    updateDisplay: (timeValue) => {
        pomodoroTimer.innerHTML = formatTimeValue(timeValue);
    },
}

const sessionDurationInputForm = document.getElementById('session_length');
function updateSessionDuration() {
    userDefinedSessionDuration = parseInt(sessionDurationInputForm.value) * millisecondsInMinute;
    pomodoro.sessionDuration = userDefinedSessionDuration;
    pomodoro.remainingSessionDuration = userDefinedSessionDuration;
    pomodoro.updateDisplay(pomodoro.remainingSessionDuration);
}
updateSessionDuration();
sessionDurationInputForm.addEventListener('change', () => {
    if (pomodoro.paused) {
        updateSessionDuration();
    }
});

const shortBreakDurationInputForm = document.getElementById('short_break');
const longBreakDurationInputForm = document.getElementById('long_break');
function updateBreakDuration(breakType) {
    let userDefinedBreakDuration;
    if (breakType === 'short') {
        userDefinedBreakDuration = parseInt(shortBreakDurationInputForm.value) * millisecondsInMinute;
    } else {
        userDefinedBreakDuration = parseInt(longBreakDurationInputForm.value) * millisecondsInMinute;
    }
    pomodoro.breakDuration = userDefinedBreakDuration;
    pomodoro.remainingBreakDuration = userDefinedBreakDuration;
}
updateBreakDuration('short');

const longBreakIntervalInputForm = document.getElementById('long_break_interval');
function updateLongBreakInterval() {
    pomodoro.longBreakInterval = parseInt(longBreakIntervalInputForm.value);
}
updateLongBreakInterval();
longBreakIntervalInputForm.addEventListener('change', updateLongBreakInterval);

pomodoro.updateDisplay(pomodoro.remainingSessionDuration);
function updateDisplayedClockOptions() {
    if (pomodoro.paused) {
        startButton.style.display = 'inline-block';
        pauseButton.style.display = 'none';
    } else {
        startButton.style.display = 'none';
        pauseButton.style.display = 'inline-block';
    }
}

startButton.addEventListener('click', () => {
    if (!pomodoro.breakTime) {
        pomodoro.startSession();
    } else {
        pomodoro.startBreak();
    }
    updateDisplayedClockOptions();
});
pauseButton.addEventListener('click', () => {
    pomodoro.stopTimer();
    updateDisplayedClockOptions()
});
resetButton.addEventListener('click', () => {
    pomodoro.resetTimer();
    updateDisplayedClockOptions()
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


