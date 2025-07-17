import logging

uvicorn_logger = logging.getLogger("uvicorn")
uvicorn_logger.setLevel(logging.DEBUG)
uvicorn_logger.handlers.clear()
uvicorn_logger.addHandler(logging.StreamHandler())

logger = logging.getLogger("customlogger")
logger.setLevel(logging.DEBUG)  # or INFO in production

# Console handler
console_handler = logging.StreamHandler()
console_handler.setLevel(logging.DEBUG)

# Formatter
formatter = logging.Formatter("[%(levelname)s] %(message)s")
console_handler.setFormatter(formatter)

# Avoid duplicate handlers
if not logger.handlers:
    logger.addHandler(console_handler)
