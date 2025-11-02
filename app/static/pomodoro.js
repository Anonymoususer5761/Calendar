const pomodoroTimer = document.getElementById('pomodoro-timer');
const startButton = document.getElementById('start-button');
const pauseButton = document.getElementById('stop-button');
const resetButton = document.getElementById('reset-button');

const sessionDurationInputForm = document.getElementById('session_length');
let userDefinedSessionDuration = parseInt(sessionDurationInputForm.value * 60000);
sessionDurationInputForm.addEventListener('change', () => {
    userDefinedSessionDuration = parseInt(sessionDurationInputForm.value) * 60000;
    pomodoro.sessionDuration = userDefinedSessionDuration;
    pomodoro.remainingSessionDuration = userDefinedSessionDuration;
    pomodoro.updateDisplay()
});

const pomodoro = {
    sessionDuration: userDefinedSessionDuration,
    remainingSessionDuration: userDefinedSessionDuration,
    sessionDurationStringValue: formatTimeValue(userDefinedSessionDuration),
    remainingSessionDurationStringValue: formatTimeValue(userDefinedSessionDuration),
    pausedAt: 0,
    sessionStartTime: 0,
    elapsedTime: 0,
    paused: true,
    intervalId: 0,
    startTimer: () => {
        if (pomodoro.paused) {
            pomodoro.intervalId = setInterval(() => {
                pomodoro.elapsedTime = Date.now() - pomodoro.sessionStartTime;
                pomodoro.remainingSessionDuration = pomodoro.sessionDuration - pomodoro.elapsedTime;
                pomodoro.updateDisplay();
            }, 25);
            pomodoro.paused = false;
        }
    },
    stopTimer: () => {
        if (!pomodoro.paused) {
            clearInterval(pomodoro.intervalId);
            pomodoro.paused = true;
            pomodoro.pausedAt = pomodoro.elapsedTime;
        }
    },
    resetTimer: () => {
        pomodoro.remainingSessionDuration = pomodoro.sessionDuration;
        clearInterval(pomodoro.intervalId);
        pomodoro.paused=true;
        pomodoro.pausedAt = 0;
        pomodoro.updateDisplay();
    },
    updateDisplay: () => {
        pomodoroTimer.innerHTML = formatTimeValue(pomodoro.remainingSessionDuration);
    },
}

pomodoroTimer.innerHTML = pomodoro.remainingSessionDurationStringValue;
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
    pomodoro.sessionStartTime = Date.now() - pomodoro.pausedAt;
    pomodoro.startTimer();
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

function updateSession() {
    elapsedTime = Date.now() - sessionStartTime;
    sessionCurrentLength = sessionMaxLength - elapsedTime;
    hours = Math.floor(sessionCurrentLength / 3600000).toString().padStart(2, '0');
    minutes = Math.floor((sessionCurrentLength / 60000) % 60).toString().padStart(2, '0');
    seconds = Math.floor((sessionCurrentLength / 1000) % 60).toString().padStart(2, '0');
    milliseconds = Math.floor(sessionCurrentLength % 1000).toString().padStart(3, '0');
    if (hours == 0) {
        pomodoroTimer.innerHTML = `${minutes}:${seconds}.${milliseconds}`;
    } else {
        pomodoroTimer.innerHTML = `${hours}:${minutes}:${seconds}.${milliseconds}`;
    }
}

const pomodoroSettingsButton = document.getElementById('pomodoro-settings-button');
const pomodoroSettingsMenu = document.getElementById('pomodoro-settings-menu');
const pomodoroSettingsMenuCloseButton = document.getElementById('pomodoro-settings-menu-close-button');
pomodoroSettingsButton.addEventListener('click', () => {
    pomodoroSettingsMenu.style.display = 'block';
});
pomodoroSettingsMenuCloseButton.addEventListener('click', () => {
    pomodoroSettingsMenu.style.display= 'none';
});


