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

const stopwatch = {
    defaultMainStringValue: '00:00:00.000',
    displayMainTimerStringValue: '00:00:00.000',
    defaultSplitTimerStringValue: '00:00:00.000',
    displaySplitTimerStringValue: '00:00:00.000',
    totalTimeElapsed: 0,
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
    currentTime: 0,
    startTimer: () => {
        if (stopwatch.paused) {
            stopwatch.startTime = Date.now() - stopwatch.currentTime;
            stopwatch.intervalId = setInterval(() => {
                stopwatch.totalTimeElapsed = Date.now() - stopwatch.startTime;
                stopwatch.currentLapTime = stopwatch.totalTimeElapsed - stopwatch.lapTimes[stopwatch.lapTimes.length - 1].totalTime;
                stopwatch.displayMainTimerStringValue = formatTimeValue(stopwatch.totalTimeElapsed, hideHours=false);
                stopwatch.displaySplitTimerStringValue = formatTimeValue(stopwatch.currentLapTime, hideHours=false);
                if (clockFunction === 'stopwatch') {
                    mainTimer.innerHTML = stopwatch.displayMainTimerStringValue;
                    splitTimer.innerHTML = stopwatch.displaySplitTimerStringValue;
                }

            });
            stopwatch.paused = false;
            stopwatch.syncTimeToServer();
        }
    },
    lapTimer: () => {
        if (!stopwatch.paused) {
            stopwatch.lapTimes.push({
                lapTime: stopwatch.currentLapTime,
                totalTime: stopwatch.totalTimeElapsed,
            });
            lapCounter.style.display = 'block';
        }
    },
    stopTimer: () => {
        if (!stopwatch.paused) {
            clearInterval(stopwatch.intervalId);
            stopwatch.paused = true;
            stopwatch.currentTime = stopwatch.totalTimeElapsed;
            stopwatch.syncTimeToServer();
        }
    },
    resetTimer: () => {
        stopwatch.displayStringValue = stopwatch.defaultMainStringValue;
        stopwatch.displaySplitTimerStringValue = stopwatch.defaultSplitTimerStringValue;
        mainTimer.innerHTML = stopwatch.displayStringValue;
        splitTimer.innerHTML = stopwatch.displaySplitTimerStringValue;
        clearInterval(stopwatch.intervalId);
        stopwatch.currentTime = 0;
        stopwatch.lapTimes = [{
            lapTime: 0,
            totalTime: 0,
        },];
        stopwatch.totalTimeElapsed = 0;
        stopwatch.paused = true;
        lapTableBody.innerHTML = '';
        lapCounter.style.display = 'none';
        stopwatch.lapCount = 0;
        stopwatch.syncTimeToServer();
    },
    syncTimeToServer: async () => {
        response = await fetch(`/api/clock/stopwatch?elapsed_time=${stopwatch.totalTimeElapsed}&paused=${stopwatch.paused}&start_time=${stopwatch.startTime}`, {
            headers: {
                "Request-Source": "JS-AJAX",
            }
        });
        return;
    },
    syncTimeFromServer: async () => {
        let response = await fetch(`/api/clock/stopwatch/from`, {
            header: {
                "Request-Source": "JS-AJAX",
            }
        });
        let stopwatchData = await response.json();
        stopwatch.paused = stopwatchData["paused"];
        stopwatch.totalTimeElapsed = stopwatchData["elapsed_time"];
        stopwatch.paused = stopwatchData["elapsed_time"];
    }
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
    mainTimer.innerHTML = stopwatch.displayMainTimerStringValue;
    splitTimer.innerHTML = stopwatch.displaySplitTimerStringValue;
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
