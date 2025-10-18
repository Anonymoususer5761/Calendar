const timer = document.getElementById('timer');
const startButton = document.getElementById('start-button');
const pauseButton = document.getElementById('pause-button');
const resetButton = document.getElementById('reset-button');

function formatTimeValue(timeValue, hideHours=true) {
    let hours = Math.floor(timeValue / 3600000).toString().padStart(2, '0');
    let minutes = Math.floor((timeValue / 60000) % 60).toString().padStart(2, '0');
    let seconds = Math.floor((timeValue / 1000) % 60).toString().padStart(2, '0');
    let milliseconds = Math.floor(timeValue % 1000).toString().padStart(3, '0');
    if (!hideHours) {
        return `${hours}:${minutes}:${seconds}.${milliseconds}`;
    }
    if (hours != '00') {
        return `${hours}:${minutes}:${seconds}.${milliseconds}`;
    }
    return `${minutes}:${seconds}.${milliseconds}`;
}

const stopwatch = {
    defaultStringValue: '00:00:00.000',
    displayStringValue: '00:00:00.000',
    elapsedTime: 0,
    startTime: 0,
    paused: true,
    intervalId: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    milliseconds: 0,
    currentTime: 0,
    updateTimer: () => {
        stopwatch.elapsedTime = Date.now() - stopwatch.startTime;
        stopwatch.displayStringValue = formatTimeValue(stopwatch.elapsedTime, hideHours=false)
        if (clockFunction === 'stopwatch') {
            timer.innerHTML = stopwatch.displayStringValue;
        }
    },
    startTimer: () => {
        if (stopwatch.paused) {
            stopwatch.startTime = Date.now() - stopwatch.currentTime;
            stopwatch.intervalId = setInterval(stopwatch.updateTimer);
            stopwatch.paused = false;
        }
    },
    stopTimer: () => {
        if (!stopwatch.paused) {
            clearInterval(stopwatch.intervalId);
            stopwatch.paused = true;
            stopwatch.currentTime = stopwatch.elapsedTime;
        }
    },
    resetTimer: () => {
        timer.innerHTML = stopwatch.defaultStringValue;
        clearInterval(stopwatch.intervalId);
        stopwatch.currentTime = 0;
        stopwatch.paused = true;
    }
}

const pomodoro = {
    startDuration: 1500000,
    defaultStringValue: "25:00.000",
    displayStringValue: "25:00.000",
    remainingDuration: 1500000,
    currentTime: 0,
    startTime: 0,
    elapsedTime: 0,
    paused: true,
    intervalId: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    milliseconds: 0,
    startTimer: () => {
        if (pomodoro.paused) {
            pomodoro.startTime = Date.now() - pomodoro.currentTime ;
            pomodoro.intervalId = setInterval(() => {
            pomodoro.elapsedTime = Date.now() - pomodoro.startTime;
                if (clockFunction === 'pomodoro') {
                    pomodoro.remainingDuration = pomodoro.startDuration - pomodoro.elapsedTime;
                    pomodoro.hours = Math.floor(pomodoro.remainingDuration / 3600000).toString().padStart(2, '0');
                    pomodoro.minutes = Math.floor((pomodoro.remainingDuration / 60000) % 60).toString().padStart(2, '0');
                    pomodoro.seconds = Math.floor((pomodoro.remainingDuration / 1000) % 60).toString().padStart(2, '0');
                    pomodoro.milliseconds = Math.floor(pomodoro.remainingDuration % 1000).toString().padStart(3, '0');
                    if (pomodoro.hours != 0) {
                        timer.innerHTML = `${pomodoro.hours}:${pomodoro.minutes}:${pomodoro.seconds}.${pomodoro.milliseconds}`;
                    } else {
                        timer.innerHTML = `${pomodoro.minutes}:${pomodoro.seconds}.${pomodoro.milliseconds}`;
                    }
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
        clearInterval(pomodoro.intervalId);
        pomodoro.paused=true;
        pomodoro.currentTime = 0;
        timer.innerHTML = pomodoro.defaultStringValue;
    }
}

let clockFunction = 'stopwatch';
const stopwatchSwitcher = document.getElementById('clock-options-stopwatch');
const pomodoroSwitcher = document.getElementById('clock-options-pomodoro');
stopwatchSwitcher.addEventListener('click', () => {
    timer.innerHTML = stopwatch.displayStringValue;
    clockFunction = 'stopwatch';
    if (stopwatch.paused) {
        startButton.style.display = 'inline-block';
        pauseButton.style.display = 'none';     
    } else {
        pauseButton.style.display = 'inline-block';
        startButton.style.display = 'none'; 
    }
});
pomodoroSwitcher.addEventListener('click', () => {
    timer.innerHTML = pomodoro.displayStringValue;
    clockFunction = 'pomodoro';
    if (pomodoro.paused) {
        startButton.style.display = 'inline-block';
        pauseButton.style.display = 'none';     
    } else {
        pauseButton.style.display = 'inline-block';
        startButton.style.display = 'none'; 
    }
});

startButton.addEventListener('click', () => {
    if (clockFunction === 'stopwatch') {
        stopwatch.startTimer();
    } else if (clockFunction === 'pomodoro') {
        pomodoro.startTimer();
    }
    pauseButton.style.display = 'inline-block';
    startButton.style.display = 'none'; 
});
pauseButton.addEventListener('click', () => {
    if (clockFunction === 'stopwatch') {
        stopwatch.stopTimer();
    } else if (clockFunction === 'pomodoro') {
        pomodoro.stopTimer();
    }
    startButton.style.display = 'inline-block';
    pauseButton.style.display = 'none';
});
resetButton.addEventListener('click', () => {
    if (clockFunction === 'stopwatch') {
        stopwatch.resetTimer();
    } else if (clockFunction === 'pomodoro') {
        pomodoro.resetTimer();
    }
    startButton.style.display = 'inline-block';
    pauseButton.style.display = 'none';
});