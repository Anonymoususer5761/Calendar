const pomodoroTimer = document.getElementById('pomodoro-timer');
const startButton = document.getElementById('start-button');
const pauseButton = document.getElementById('stop-button');
const resetButton = document.getElementById('reset-button');

const pomodoro = {
    sessionDuration: 1500000,
    sessionDurationDefualtStringValue: "25:00.000",
    sessionDurationCurrentStringValue: "25:00.000",
    remainingDuration: 1500000,
    currentTime: 0,
    startTime: 0,
    elapsedTime: 0,
    paused: true,
    intervalId: 0,
    startTimer: () => {
        if (pomodoro.paused) {
            pomodoro.startTime = Date.now() - pomodoro.currentTime ;
            pomodoro.intervalId = setInterval(() => {
                pomodoro.elapsedTime = Date.now() - pomodoro.startTime;
                pomodoro.remainingDuration = pomodoro.sessionDuration - pomodoro.elapsedTime;
                pomodoro.sessionDurationCurrentStringValue = formatTimeValue(pomodoro.remainingDuration)
                if (clockFunction === 'pomodoro') {
                    mainTimer.innerHTML = pomodoro.sessionDurationCurrentStringValue;
                }
            }, 25);
            pomodoro.paused = false;
        }
    },
    stopTimer: () => {
        if (!pomodoro.paused) {
            clearInterval(pomodoro.intervalId);
            pomodoro.paused = true;
            pomodoro.currentTime = pomodoro.elapsedTime;
        }
    },
    resetTimer: () => {
        mainTimer.innerHTML = pomodoro.sessionDurationDefualtStringValue
        clearInterval(pomodoro.intervalId);
        pomodoro.paused=true;
        pomodoro.currentTime = 0;
        pomodoro.sessionDurationCurrentStringValue = pomodoro.sessionDurationDefualtStringValue;
    }
}

startButton.addEventListener('click', () => {
    if (paused) {
        sessionStartTime = Date.now();
        intervalId = setInterval(updateSession, 25);
        paused = false;
        pauseButton.style.display = 'inline-block';
        startButton.style.display = 'none';
    }
});
pauseButton.addEventListener('click', () => {
    if (!paused) {
        clearInterval(intervalId);
        paused = true;
        startButton.style.display = 'inline-block';
        pauseButton.style.display = 'none';
    }
    currentTime = elapsedTime;
});
resetButton.addEventListener('click', () => {
    pomodoroTimer.innerHTML = '25:00.000'
    clearInterval(intervalId);
    startButton.style.display = 'inline-block';
    pauseButton.style.display = 'none';
    paused = true;

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
