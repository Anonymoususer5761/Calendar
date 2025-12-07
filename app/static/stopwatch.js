const mainTimer = document.getElementById('main-timer');
const splitTimer = document.getElementById('split-timer');
const startButton = document.getElementById('start-button');
const pauseButton = document.getElementById('stop-button');
const resetButton = document.getElementById('reset-button');

const lapCounter = document.getElementById('lap-counter');

const defaultStopwatchString = '00:00:00';

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
                stopwatch.primaryTimerString = formatTimeValue(stopwatch.elapsedTime, '%H:%M:%S');
                stopwatch.secondaryTimerString = formatTimeValue(stopwatch.currentLapTime, '%H:%M:%S');
                stopwatch.updateDisplay();
            }, clockUpdateInterval);
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
            lapCounter.style.display = 'table';
            stopwatch.syncWithServer('lap');
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
        if (api_route === 'start') {
            await fetch(`/api/clock/stopwatch/${api_route}?start_time=${stopwatch.startTime}`, {
                headers: {
                    "Request-Source": "JS-AJAX",
                }
            });
            return;
        }
        // AI Usage Disclaimer: I used ChatGPT to send POST requests using fetch api.
        if (api_route === 'lap'){
            await fetch(`/api/clock/stopwatch/${api_route}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Request-Source": "JS-AJAX",
                },
                body: JSON.stringify({
                    lap_time: {
                        lapTime: stopwatch.currentLapTime,
                        totalTime: stopwatch.elapsedTime,
                    },
                }),
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
        let response = await fetch(`/api/clock/stopwatch`, {
            headers: {
                "Request-Source": "JS-AJAX",
            }
        });
        let serverStopwatch = await response.json();
        return serverStopwatch;
    },
}

function formatLapTable(lapCount, lapTime, totalTime) {
    const row = document.createElement('tr');
    row.classList.add('tr-laps');

    const cell1 = document.createElement('th');
    cell1.textContent = lapCount;
    cell1.setAttribute('scope', 'col');
    cell1.classList.add('td-laps', 'colmn');

    const cell2 = document.createElement('td');
    cell2.textContent = lapTime;
    cell2.classList.add('td-laps', 'colmn');

    const cell3 = document.createElement('td');
    cell3.textContent = totalTime;
    cell3.classList.add('td-laps', 'colmn');

    row.append(cell1);
    row.append(cell2);
    row.append(cell3);
    return row;
}

const lapButton = document.getElementById('lap-button');
const lapTableBody = document.getElementById('lap-counter-table-body');
lapButton.addEventListener('click', () => {
    stopwatch.lapTimer();
    stopwatch.lapCount++
    lapTableBody.prepend(
        formatLapTable(
            stopwatch.lapCount,
            formatTimeValue(stopwatch.lapTimes[stopwatch.lapCount].lapTime, '%H:%M:%S'),
            formatTimeValue(stopwatch.lapTimes[stopwatch.lapCount].totalTime, '%H:%M:%S'),
        )
    );
});

function updateClockOptions() {
    if (stopwatch.paused) {
        startButton.style.display = 'inline-block';
        lapButton.style.display = 'none';
        pauseButton.style.display = 'none';
    } else {
        startButton.style.display = 'none';
        lapButton.style.display = 'inline-block';
        pauseButton.style.display = 'inline-block';
    }
}

startButton.addEventListener('click', () => {
    stopwatch.startTime = Date.now() - stopwatch.pausedAt;
    stopwatch.startTimer();
    updateClockOptions()
});
pauseButton.addEventListener('click', () => {
    stopwatch.stopTimer();
    updateClockOptions();
});
resetButton.addEventListener('click', () => {
    stopwatch.resetTimer();
    updateClockOptions();
});

document.addEventListener('DOMContentLoaded', () => {
    stopwatch.syncWithServer('').then(serverStopwatch => {
        if (serverStopwatch) {
            stopwatch.startTime = serverStopwatch["start_time"];
            stopwatch.elapsedTime = serverStopwatch["elapsed_time"]
            stopwatch.primaryTimerString = formatTimeValue(serverStopwatch["elapsed_time"], '%H:%M:%S');
            stopwatch.pausedAt = serverStopwatch["paused_at"];
            if (!serverStopwatch["paused"]) {
                stopwatch.startTimer();
                updateClockOptions();
            }
            stopwatch.lapTimes = serverStopwatch.lap_times;
            stopwatch.lapCount = serverStopwatch.lap_times.length - 1;
            stopwatch.currentLapTime = serverStopwatch.lap_times[stopwatch.lapCount].lapTime;
            stopwatch.secondaryTimerString = formatTimeValue(stopwatch.elapsedTime - serverStopwatch.lap_times[stopwatch.lapCount].totalTime, '%H:%M:%S');
            if (serverStopwatch.lap_times.length > 1) {
                lapCounter.style.display = 'table';
                for (let i = 1; i < serverStopwatch.lap_times.length; i++) {
                    lapTableBody.prepend(
                        formatLapTable(
                            i,
                            formatTimeValue(stopwatch.lapTimes[i].lapTime, '%H:%M:%S'),
                            formatTimeValue(stopwatch.lapTimes[i].totalTime, '%H:%M:%S'),
                        )
                    );
                }
            }
            updateClockOptions();
            stopwatch.updateDisplay();
        }
    });
});
