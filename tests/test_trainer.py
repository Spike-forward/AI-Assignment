"""Tests for AI trainer."""

import pytest
import tempfile
import os
from web_scripting_ai.trainer import WebScriptTrainer


def test_trainer_creation():
    """Test creating a trainer."""
    trainer = WebScriptTrainer()
    assert trainer.is_trained is False


def test_trainer_with_sample_data():
    """Test training with sample data."""
    trainer = WebScriptTrainer()
    
    training_data = [
        {
            "context": {
                "url": "https://www.google.com",
                "title": "Google",
                "html_length": 50000,
                "previous_actions": []
            },
            "action": {
                "action_type": "type",
                "selector": "input",
                "value": "search"
            }
        },
        {
            "context": {
                "url": "https://www.google.com",
                "title": "Google",
                "html_length": 50000,
                "previous_actions": ["type"]
            },
            "action": {
                "action_type": "click",
                "selector": "button",
                "value": None
            }
        },
        {
            "context": {
                "url": "https://example.com/login",
                "title": "Login",
                "html_length": 30000,
                "previous_actions": []
            },
            "action": {
                "action_type": "type",
                "selector": "input[name='username']",
                "value": "user"
            }
        }
    ]
    
    trainer.train(training_data)
    assert trainer.is_trained is True


def test_trainer_prediction():
    """Test making predictions after training."""
    trainer = WebScriptTrainer()
    
    training_data = [
        {
            "context": {
                "url": "https://www.google.com",
                "title": "Google",
                "html_length": 50000,
                "previous_actions": []
            },
            "action": {
                "action_type": "type",
                "selector": "input",
                "value": "search"
            }
        },
        {
            "context": {
                "url": "https://example.com/login",
                "title": "Login",
                "html_length": 30000,
                "previous_actions": []
            },
            "action": {
                "action_type": "click",
                "selector": "button",
                "value": None
            }
        }
    ]
    
    trainer.train(training_data)
    
    test_context = {
        "url": "https://www.google.com",
        "title": "Google",
        "html_length": 50000,
        "previous_actions": []
    }
    
    prediction = trainer.predict_action(test_context)
    assert isinstance(prediction, str)
    assert prediction in ["type", "click"]


def test_trainer_save_load():
    """Test saving and loading a trained model."""
    trainer = WebScriptTrainer()
    
    training_data = [
        {
            "context": {
                "url": "https://example.com",
                "title": "Example",
                "html_length": 40000,
                "previous_actions": []
            },
            "action": {
                "action_type": "navigate",
                "selector": None,
                "value": "https://example.com"
            }
        }
    ]
    
    trainer.train(training_data)
    
    # Save model
    with tempfile.NamedTemporaryFile(delete=False, suffix=".pkl") as tmp:
        tmp_path = tmp.name
    
    try:
        trainer.save_model(tmp_path)
        
        # Load model
        new_trainer = WebScriptTrainer()
        new_trainer.load_model(tmp_path)
        
        assert new_trainer.is_trained is True
    finally:
        os.unlink(tmp_path)


def test_prepare_features():
    """Test feature preparation."""
    trainer = WebScriptTrainer()
    
    # Need to fit vectorizers first
    training_data = [
        {
            "context": {
                "url": "https://example.com",
                "title": "Example",
                "html_length": 40000,
                "previous_actions": []
            },
            "action": {
                "action_type": "click",
                "selector": "button",
                "value": None
            }
        }
    ]
    
    trainer.train(training_data)
    
    context = {
        "url": "https://example.com",
        "title": "Example",
        "html_length": 40000,
        "previous_actions": []
    }
    
    features = trainer.prepare_features(context)
    assert len(features) > 0
    assert isinstance(features[0], (int, float))


def test_empty_training_data():
    """Test that training with empty data raises an error."""
    trainer = WebScriptTrainer()
    
    with pytest.raises(ValueError):
        trainer.train([])


def test_prediction_without_training():
    """Test that prediction without training raises an error."""
    trainer = WebScriptTrainer()
    
    context = {
        "url": "https://example.com",
        "title": "Example",
        "html_length": 40000,
        "previous_actions": []
    }
    
    with pytest.raises(RuntimeError):
        trainer.predict_action(context)
