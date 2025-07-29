import logging
import asyncio
from typing import AsyncGenerator

log_streams = {}

async def event_generator(surveyName: str) -> AsyncGenerator[str, None]:
    queue = asyncio.Queue()
    log_streams[surveyName] = queue

    try:
        while True:
            message = await queue.get()
            yield f"data: {message}\n\n"
    except asyncio.CancelledError:
        del log_streams[surveyName]
        raise

class SSELogHandler(logging.Handler):
    def __init__(self, loop=None):
        super().__init__()
        self.loop = loop or asyncio.get_event_loop()

    def emit(self, record):
        log_entry = self.format(record)
        for survey_id, queue in log_streams.items():
            # Schedule the coroutine safely from sync code
            asyncio.run_coroutine_threadsafe(queue.put(log_entry), self.loop)


logger = logging.getLogger("customlogger")

def setup_logger():
    logger = logging.getLogger("customlogger")
    logger.setLevel(logging.DEBUG)

    if not logger.handlers:
        loop = asyncio.get_event_loop()

        console_handler = logging.StreamHandler()
        console_handler.setLevel(logging.DEBUG)
        console_handler.setFormatter(logging.Formatter("[%(levelname)s] %(message)s"))

        sse_handler = SSELogHandler(loop=loop)
        sse_handler.setLevel(logging.INFO)
        sse_handler.setFormatter(logging.Formatter('%(asctime)s - %(message)s'))

        logger.addHandler(console_handler)
        logger.addHandler(sse_handler)

    return logger