const timer = document.getElementById('timer');
const startButton = document.getElementById('start-button');
const pauseButton = document.getElementById('pause-button');
const resetButton = document.getElementById('reset-button');

let startTime = 0;
let elapsedTime = 0;
let currentTime = 0;
let paused = true;
let intervalId;
let hours = 0;
let minutes = 0;
let seconds = 0;
let milliseconds = 0;

startButton.addEventListener('click', () => {
    if (paused) {
        startTime = Date.now() - currentTime;
        intervalId = setInterval(updateTime, 25);
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
    timer.innerHTML = '00:00:00.000'
    clearInterval(intervalId);
    startButton.style.display = 'inline-block';
    pauseButton.style.display = 'none';
    paused = true;

});
function updateTime() {
    elapsedTime = Date.now() - startTime;
    hours = Math.floor(elapsedTime / 3600000).toString().padStart(2, '0');
    minutes = Math.floor((elapsedTime / 60000) % 60).toString().padStart(2, '0');
    seconds = Math.floor((elapsedTime / 1000) % 60).toString().padStart(2, '0');
    milliseconds = Math.floor(elapsedTime % 1000).toString().padStart(3, '0');
    timer.innerHTML = `${hours}:${minutes}:${seconds}.${milliseconds}`;
}