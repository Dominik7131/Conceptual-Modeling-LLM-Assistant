import os
import time


TIMESTAMP = time.strftime("%Y-%m-%d-%H-%M-%S")
LOG_DIRECTORY = "logs"
LOG_FILE_PATH = os.path.join(LOG_DIRECTORY, f"{TIMESTAMP}-log.txt")
LOGGER_NAME = "llm_logger"