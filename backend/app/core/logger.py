import logging
import sys
from collections import deque
from datetime import datetime
from backend.app.config import LOGS_DIR

LOG_FILE = LOGS_DIR / "app.log"

# Circular buffer to store the last 500 log records in memory for Admin UI
log_buffer = deque(maxlen=500)

class BufferHandler(logging.Handler):
    def emit(self, record):
        try:
            msg = self.format(record)
            log_buffer.append({
                "timestamp": datetime.fromtimestamp(record.created).strftime("%Y-%m-%d %H:%M:%S"),
                "level": record.levelname,
                "logger": record.name,
                "message": record.getMessage()
            })
        except Exception:
            self.handleError(record)

def setup_logger():
    logger = logging.getLogger("rag_chatbot")
    logger.setLevel(logging.INFO)

    # Formatter
    formatter = logging.Formatter(
        "[%(asctime)s] [%(levelname)s] [%(name)s]: %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S"
    )

    # Console Handler
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setFormatter(formatter)
    console_handler.setLevel(logging.INFO)

    # File Handler
    file_handler = logging.FileHandler(LOG_FILE, encoding="utf-8")
    file_handler.setFormatter(formatter)
    file_handler.setLevel(logging.INFO)

    # In-Memory Buffer Handler for Admin Dashboard
    buf_handler = BufferHandler()
    buf_handler.setFormatter(formatter)
    buf_handler.setLevel(logging.INFO)

    # Prevent duplicate handlers if re-initialized
    if not logger.handlers:
        logger.addHandler(console_handler)
        logger.addHandler(file_handler)
        logger.addHandler(buf_handler)

    return logger

logger = setup_logger()

def get_recent_logs(limit: int = 100):
    """Retrieve recent log items for admin monitoring"""
    logs = list(log_buffer)
    return logs[-limit:]
