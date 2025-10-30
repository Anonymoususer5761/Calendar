const mainTimer = document.getElementById('main-timer');
const splitTimer = document.getElementById('split-timer');
const startButton = document.getElementById('start-button');
const pauseButton = document.getElementById('pause-button');
const resetButton = document.getElementById('reset-button');

const lapCounter = document.getElementById('lap-counter');

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

const defaultStopwatchString = '00:00:00.000';

const stopwatch = {
    defaultPrimaryTimerString: defaultStopwatchString,
    primaryTimerString: defaultStopwatchString,
    defaultSecondaryTimerString: defaultStopwatchString,
    secondaryTimerString: defaultStopwatchString,
    elapsedTime: 0,
    currentLapTime: 0,
    lapCount: 0,
    lapTimes: [ {
            lapTime: 0,
            totalTime: 0,
        },
    ],
    startTime: 0,
    paused: true,
    intervalId: 0,
    pausedAt: 0,
    startTimer: () => {
        if (stopwatch.paused) {
            stopwatch.intervalId = setInterval(() => {
                stopwatch.elapsedTime = Date.now() - stopwatch.startTime;
                stopwatch.currentLapTime = stopwatch.elapsedTime - stopwatch.lapTimes[stopwatch.lapTimes.length - 1].totalTime;
                stopwatch.primaryTimerString = formatTimeValue(stopwatch.elapsedTime, hideHours=false);
                stopwatch.secondaryTimerString = formatTimeValue(stopwatch.currentLapTime, hideHours=false);
                if (clockFunction === 'stopwatch') {
                    stopwatch.updateDisplay();
                }
            }, 25);
            stopwatch.paused = false;
            stopwatch.syncWithServer('start');
        }
    },
    lapTimer: () => {
        if (!stopwatch.paused) {
            stopwatch.lapTimes.push({
                lapTime: stopwatch.currentLapTime,
                totalTime: stopwatch.elapsedTime,
            });
            lapCounter.style.display = 'block';
        }
    },
    stopTimer: () => {
        if (!stopwatch.paused) {
            clearInterval(stopwatch.intervalId);
            stopwatch.paused = true;
            stopwatch.pausedAt = stopwatch.elapsedTime;
            stopwatch.syncWithServer('stop');
        }
    },
    resetTimer: () => {
        stopwatch.primaryTimerString = defaultStopwatchString;
        stopwatch.secondaryTimerString = defaultStopwatchString;
        stopwatch.updateDisplay();
        clearInterval(stopwatch.intervalId);
        stopwatch.pausedAt = 0;
        stopwatch.lapTimes = [{
            lapTime: 0,
            totalTime: 0,
        },];
        stopwatch.elapsedTime = 0;
        stopwatch.paused = true;
        lapTableBody.innerHTML = '';
        lapCounter.style.display = 'none';
        stopwatch.lapCount = 0;
        stopwatch.syncWithServer('reset');
    },
    updateDisplay: () => {
        mainTimer.innerHTML = stopwatch.primaryTimerString;
        splitTimer.innerHTML = stopwatch.secondaryTimerString;
    },
    syncWithServer: async (api_route) => {
        if (api_route === 'start'){
            await fetch(`/api/clock/stopwatch/${api_route}?start_time=${stopwatch.startTime}`, {
                headers: {
                    "Request-Source": "JS-AJAX",
                }
            });
            return;
        }
        if (api_route === 'stop') {
            await fetch(`/api/clock/stopwatch/${api_route}?elapsed_time=${stopwatch.elapsedTime}`, {
                headers: {
                    "Request-Source": "JS-AJAX",
                }
            });
            return;
        }
        if (api_route === 'reset') {
            await fetch(`/api/clock/stopwatch/${api_route}`, {
                headers: {
                    "Request-Source": "JS-AJAX",
                }
            });
            return;
        }
        if (api_route === 'elapsed_time') {
            let response = await fetch(`/api/clock/stopwatch/${api_route}`, {
                headers: {
                    "Request-Source": "JS-AJAX",
                }
            });
            let elapsedTime = await response.json()
            return elapsedTime;
        }
        let response = await fetch(`/api/clock/stopwatch?update=True`, {
            headers: {
                "Request-Source": "JS-AJAX",
            }
        });
        serverStopwatch = await response.json()
        return serverStopwatch;
    },
}

function formatLapTable(lapCount, lapTime, totalTime) {
    const row = document.createElement('tr');
    row.classList.add('tr-laps')

    const cell1 = document.createElement('td');
    cell1.textContent = lapCount;
    row.classList.add('td-laps')

    const cell2 = document.createElement('td');
    cell2.textContent = lapTime;
    row.classList.add('tr-laps')

    const cell3 = document.createElement('td');
    cell3.textContent = totalTime;
    row.classList.add('tr-laps')

    row.append(cell1);
    row.append(cell2);
    row.append(cell3);
    return row
}

const lapButton = document.getElementById('lap-button');
const lapTableBody = document.getElementById('lap-counter-table-body');
lapButton.addEventListener('click', () => {
    stopwatch.lapTimer();
    stopwatch.lapCount++
    lapTableBody.prepend(
        formatLapTable(
            stopwatch.lapCount,
            formatTimeValue(stopwatch.lapTimes[stopwatch.lapCount].lapTime),
            formatTimeValue(stopwatch.lapTimes[stopwatch.lapCount].totalTime),
        )
    );
});


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

let clockFunction = 'stopwatch';
const stopwatchSwitcher = document.getElementById('clock-options-stopwatch');
const pomodoroSwitcher = document.getElementById('clock-options-pomodoro');
function updateDisplayedClockOptions() {
    if (clockFunction === 'stopwatch') {
        if (stopwatch.paused) {
            startButton.style.display = 'inline-block';
            pauseButton.style.display = 'none';
            lapButton.style.display = 'none';
        } else {
            pauseButton.style.display = 'inline-block';
            startButton.style.display = 'none';
            lapButton.style.display = 'inline-block';
        }
    } else if (clockFunction === 'pomodoro') {
        if (pomodoro.paused) {
            startButton.style.display = 'inline-block';
            pauseButton.style.display = 'none';
        } else {
            pauseButton.style.display = 'inline-block';
            startButton.style.display = 'none';
        }
    }
}

stopwatchSwitcher.classList.add('current-clock-option');
stopwatchSwitcher.addEventListener('click', () => {
    mainTimer.innerHTML = stopwatch.primaryTimerString;
    splitTimer.innerHTML = stopwatch.secondaryTimerString;
    stopwatchSwitcher.classList.add('current-clock-option');
    pomodoroSwitcher.classList.remove('current-clock-option');
    clockFunction = 'stopwatch';
    updateDisplayedClockOptions()
});
pomodoroSwitcher.addEventListener('click', () => {
    mainTimer.innerHTML = pomodoro.sessionDurationCurrentStringValue;
    pomodoroSwitcher.classList.add('current-clock-option');
    stopwatchSwitcher.classList.remove('current-clock-option');
    clockFunction = 'pomodoro';
    updateDisplayedClockOptions()
});

startButton.addEventListener('click', () => {
    if (clockFunction === 'stopwatch') {
        stopwatch.startTime = Date.now() - stopwatch.pausedAt;
        stopwatch.startTimer();
    } else if (clockFunction === 'pomodoro') {
        pomodoro.startTimer();
    }
    updateDisplayedClockOptions()
});
pauseButton.addEventListener('click', () => {
    if (clockFunction === 'stopwatch') {
        stopwatch.stopTimer();
    } else if (clockFunction === 'pomodoro') {
        pomodoro.stopTimer();
    }
    updateDisplayedClockOptions()
});
resetButton.addEventListener('click', () => {
    if (clockFunction === 'stopwatch') {
        stopwatch.resetTimer();
    } else if (clockFunction === 'pomodoro') {
        pomodoro.resetTimer();
    }
    updateDisplayedClockOptions()
});
const syncButton = document.getElementById('sync-button');
syncButton.addEventListener('click', async () => {
    await stopwatch.syncTimeFromServer();
});

document.addEventListener('DOMContentLoaded', () => {
    stopwatch.syncWithServer('').then(serverStopwatch => {
        if (serverStopwatch) {
            stopwatch.startTime = serverStopwatch["start_time"];
            stopwatch.elapsedTime = serverStopwatch["elapsed_time"]
            stopwatch.primaryTimerString = formatTimeValue(serverStopwatch["elapsed_time"], hideHours=false);
            stopwatch.secondaryTimerString = formatTimeValue(serverStopwatch["elapsed_time"], hideHours=false);
            stopwatch.updateDisplay()
            stopwatch.pausedAt = serverStopwatch["current_time"];
            if (!serverStopwatch["paused"]) {
                stopwatch.startTimer();
                updateDisplayedClockOptions();
            }
        }
    });
});
