"""Tests for web action models."""

import pytest
from web_scripting_ai.models import WebAction, ActionType, WebScript


def test_web_action_creation():
    """Test creating a WebAction."""
    action = WebAction(
        action_type=ActionType.CLICK,
        selector="#submit-button",
        value=None
    )
    
    assert action.action_type == ActionType.CLICK
    assert action.selector == "#submit-button"
    assert action.value is None


def test_web_action_to_dict():
    """Test converting WebAction to dictionary."""
    action = WebAction(
        action_type=ActionType.TYPE,
        selector="input[name='email']",
        value="test@example.com"
    )
    
    action_dict = action.to_dict()
    
    assert action_dict["action_type"] == "type"
    assert action_dict["selector"] == "input[name='email']"
    assert action_dict["value"] == "test@example.com"


def test_web_action_from_dict():
    """Test creating WebAction from dictionary."""
    data = {
        "action_type": "navigate",
        "selector": None,
        "value": "https://example.com",
        "metadata": {}
    }
    
    action = WebAction.from_dict(data)
    
    assert action.action_type == ActionType.NAVIGATE
    assert action.value == "https://example.com"


def test_web_script_creation():
    """Test creating a WebScript."""
    actions = [
        WebAction(ActionType.NAVIGATE, value="https://example.com"),
        WebAction(ActionType.CLICK, selector="#button")
    ]
    
    script = WebScript(
        name="test_script",
        actions=actions,
        description="Test script"
    )
    
    assert script.name == "test_script"
    assert len(script.actions) == 2
    assert script.description == "Test script"


def test_web_script_to_dict():
    """Test converting WebScript to dictionary."""
    actions = [
        WebAction(ActionType.NAVIGATE, value="https://example.com"),
        WebAction(ActionType.CLICK, selector="#button")
    ]
    
    script = WebScript(name="test", actions=actions)
    script_dict = script.to_dict()
    
    assert script_dict["name"] == "test"
    assert len(script_dict["actions"]) == 2
    assert script_dict["actions"][0]["action_type"] == "navigate"


def test_web_script_from_dict():
    """Test creating WebScript from dictionary."""
    data = {
        "name": "test_script",
        "description": "Test",
        "actions": [
            {
                "action_type": "navigate",
                "selector": None,
                "value": "https://example.com",
                "metadata": {}
            }
        ]
    }
    
    script = WebScript.from_dict(data)
    
    assert script.name == "test_script"
    assert len(script.actions) == 1
    assert script.actions[0].action_type == ActionType.NAVIGATE


def test_action_types():
    """Test all action types are defined."""
    expected_types = [
        "NAVIGATE", "CLICK", "TYPE", "EXTRACT", 
        "WAIT", "SCROLL", "SELECT", "SUBMIT"
    ]
    
    for action_type in expected_types:
        assert hasattr(ActionType, action_type)
