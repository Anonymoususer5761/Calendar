import time
from threading import Thread

from flask import session

class Stopwatch():
    def __init__(self, elapsed_time: float=0., paused: bool=True, start_time: float=time.time() * 1000) -> None:
        self.elapsed_time: float = elapsed_time
        self.paused: bool = paused
        self.start_time: float = start_time
        self._thread = None

    # AI Usage Discalimer: Used AI to figure out how to use multithreading in Python.
    def start(self) -> None:
        self.paused = False
        interval = 0.025
        def timer() -> None:
            while not self.paused:
                now = time.time() * 1000
                self.elapsed_time += (now - self.start_time)
                # session["stopwatch"]["elapsed_time"] = self.elapsed_time

                next_call = self.start_time + ((now - self.start_time) // interval + 1) * interval
                time.sleep(max(0, next_call - time.time() * 1000))

        self._thread = Thread(target=timer, daemon=True)
        self._thread.start()

    def stop(self) ->None:
        self.paused: bool = True
