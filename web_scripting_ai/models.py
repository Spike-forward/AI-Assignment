"""
Data models for web scripting actions.
"""

from enum import Enum
from dataclasses import dataclass
from typing import Optional, Dict, Any


class ActionType(Enum):
    """Types of web actions that can be performed."""
    NAVIGATE = "navigate"
    CLICK = "click"
    TYPE = "type"
    EXTRACT = "extract"
    WAIT = "wait"
    SCROLL = "scroll"
    SELECT = "select"
    SUBMIT = "submit"


@dataclass
class WebAction:
    """Represents a single web action to be performed."""
    
    action_type: ActionType
    selector: Optional[str] = None
    value: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert action to dictionary format."""
        return {
            "action_type": self.action_type.value,
            "selector": self.selector,
            "value": self.value,
            "metadata": self.metadata or {}
        }
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "WebAction":
        """Create action from dictionary format."""
        return cls(
            action_type=ActionType(data["action_type"]),
            selector=data.get("selector"),
            value=data.get("value"),
            metadata=data.get("metadata", {})
        )


@dataclass
class WebScript:
    """Represents a sequence of web actions."""
    
    name: str
    actions: list[WebAction]
    description: Optional[str] = None
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert script to dictionary format."""
        return {
            "name": self.name,
            "description": self.description,
            "actions": [action.to_dict() for action in self.actions]
        }
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "WebScript":
        """Create script from dictionary format."""
        return cls(
            name=data["name"],
            description=data.get("description"),
            actions=[WebAction.from_dict(a) for a in data["actions"]]
        )
