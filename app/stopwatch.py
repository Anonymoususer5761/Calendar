import time
from threading import Thread

class Stopwatch():
    def __init__(self, elapsed_time=0., paused=True, start_time=time.time() * 1000):
        self.elapsed_time=elapsed_time
        self.paused=paused
        self.start_time = start_time
        self._thread = None

    # AI Usage Discalimer: Used AI to figure out how to use multithreading in Python.
    def start(self):
        self.paused = False
        interval = 0.025
        def timer():
            while not self.paused:
                now = time.time() * 1000
                self.elapsed_time += (now - self.start_time)

                next_call = self.start_time + ((now - self.start_time) // interval + 1) * interval
                time.sleep(max(0, next_call - time.time() * 1000))

        self._thread = Thread(target=timer, daemon=True)
        self._thread.start()

    def stop(self):
        self.paused = True
