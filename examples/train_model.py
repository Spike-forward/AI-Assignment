"""
Example: Training the AI model on web scripting patterns.
"""

from web_scripting_ai import WebScriptTrainer


def create_sample_training_data():
    """Create sample training data for the model."""
    training_data = [
        # Search page patterns
        {
            "context": {
                "url": "https://www.google.com",
                "title": "Google",
                "html_length": 50000,
                "previous_actions": []
            },
            "action": {
                "action_type": "type",
                "selector": "input[name='q']",
                "value": "search query"
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
                "action_type": "submit",
                "selector": "form",
                "value": None
            }
        },
        # Login page patterns
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
                "value": "user@example.com"
            }
        },
        {
            "context": {
                "url": "https://example.com/login",
                "title": "Login",
                "html_length": 30000,
                "previous_actions": ["type"]
            },
            "action": {
                "action_type": "type",
                "selector": "input[name='password']",
                "value": "password"
            }
        },
        {
            "context": {
                "url": "https://example.com/login",
                "title": "Login",
                "html_length": 30000,
                "previous_actions": ["type", "type"]
            },
            "action": {
                "action_type": "click",
                "selector": "button[type='submit']",
                "value": None
            }
        },
        # Navigation patterns
        {
            "context": {
                "url": "https://example.com",
                "title": "Home",
                "html_length": 40000,
                "previous_actions": []
            },
            "action": {
                "action_type": "click",
                "selector": "a[href='/about']",
                "value": None
            }
        },
        # Data extraction patterns
        {
            "context": {
                "url": "https://example.com/products",
                "title": "Products",
                "html_length": 60000,
                "previous_actions": ["navigate", "wait"]
            },
            "action": {
                "action_type": "extract",
                "selector": ".product-name",
                "value": None
            }
        },
        # Wait patterns
        {
            "context": {
                "url": "https://example.com/slow-page",
                "title": "Loading",
                "html_length": 20000,
                "previous_actions": ["navigate"]
            },
            "action": {
                "action_type": "wait",
                "selector": None,
                "value": "3"
            }
        }
    ]
    
    return training_data


def main():
    """Train the AI model."""
    print("Creating sample training data...")
    training_data = create_sample_training_data()
    print(f"Created {len(training_data)} training examples\n")
    
    print("Training the model...")
    trainer = WebScriptTrainer()
    trainer.train(training_data)
    print("Model trained successfully!\n")
    
    # Save the model
    model_path = "data/web_script_model.pkl"
    print(f"Saving model to {model_path}...")
    trainer.save_model(model_path)
    print("Model saved!\n")
    
    # Test prediction
    test_context = {
        "url": "https://www.google.com",
        "title": "Google",
        "html_length": 50000,
        "previous_actions": []
    }
    
    print("Testing prediction on Google homepage:")
    predicted_action = trainer.predict_action(test_context)
    print(f"Predicted action: {predicted_action}")
    
    # Save training data
    training_data_path = "data/training_data.json"
    print(f"\nSaving training data to {training_data_path}...")
    trainer.save_training_data(training_data, training_data_path)
    print("Training data saved!")


if __name__ == "__main__":
    main()
