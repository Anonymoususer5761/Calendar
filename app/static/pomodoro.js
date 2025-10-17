const pomodoroTimer = document.getElementById('pomodoro-timer');
const startButton = document.getElementById('pomodoro-start');
const pauseButton = document.getElementById('pomodoro-stop');
const resetButton = document.getElementById('pomodoro-reset');

const sessionMaxLength = 1500000;
let currentSessionDuration = 1500000;
let sessionStartTime = 0;
let sessionCurrentLength = sessionMaxLength;
let paused = true;
let elapsedTime = 0;
let intervalID;
let hours = 0;
let minutes = 0;
let seconds = 0;
let milliseconds = 0;

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