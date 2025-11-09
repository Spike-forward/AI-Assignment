"""
Web Scripting AI - A system for training AI to perform web automation tasks.
"""

__version__ = "0.1.0"

from .models import WebAction, ActionType
from .executor import WebScriptExecutor
from .trainer import WebScriptTrainer

__all__ = [
    "WebAction",
    "ActionType",
    "WebScriptExecutor",
    "WebScriptTrainer",
]
