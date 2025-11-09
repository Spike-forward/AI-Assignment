# AI-Assignment-1: Web Scripting AI

A Python-based system for training AI models to perform web automation and scripting tasks. This project demonstrates how to train machine learning models to predict and execute web actions based on page context.

## Overview

This system allows you to:
- Define web scripting actions (navigate, click, type, extract, etc.)
- Execute web scripts using Selenium WebDriver
- Train AI models to learn web automation patterns
- Predict next actions based on page context

## Features

- **Action Models**: Structured representation of web actions
- **Script Executor**: Selenium-based execution engine for web automation
- **AI Trainer**: Machine learning model for action prediction
- **Training Data**: Sample datasets for training the AI
- **Examples**: Ready-to-use scripts demonstrating the system

## Installation

1. Clone the repository:
```bash
git clone https://github.com/Spike-forward/AI-Assignment-1.git
cd AI-Assignment-1
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Install Chrome/Chromium browser (required for Selenium):
```bash
# On Ubuntu/Debian
sudo apt-get install chromium-browser

# On macOS
brew install chromium
```

## Quick Start

### 1. Create a Web Script

```python
from web_scripting_ai import WebAction, ActionType
from web_scripting_ai.models import WebScript

# Define actions
actions = [
    WebAction(ActionType.NAVIGATE, value="https://www.google.com"),
    WebAction(ActionType.TYPE, selector="textarea[name='q']", value="Python web scraping"),
    WebAction(ActionType.SUBMIT, selector="textarea[name='q']"),
    WebAction(ActionType.WAIT, value="2"),
]

# Create script
script = WebScript(
    name="google_search",
    description="Search on Google",
    actions=actions
)
```

### 2. Execute a Script

```python
from web_scripting_ai import WebScriptExecutor

with WebScriptExecutor(headless=True) as executor:
    results = executor.execute_script(script)
    print(results)
```

### 3. Train the AI Model

```python
from web_scripting_ai import WebScriptTrainer

# Create training data
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
            "selector": "input[name='q']",
            "value": "search query"
        }
    },
    # Add more examples...
]

# Train the model
trainer = WebScriptTrainer()
trainer.train(training_data)

# Make predictions
context = {
    "url": "https://www.google.com",
    "title": "Google",
    "html_length": 50000,
    "previous_actions": []
}
predicted_action = trainer.predict_action(context)
print(f"Predicted action: {predicted_action}")

# Save the model
trainer.save_model("data/web_script_model.pkl")
```

## Action Types

The system supports the following web actions:

- **NAVIGATE**: Navigate to a URL
- **CLICK**: Click on an element
- **TYPE**: Type text into an input field
- **EXTRACT**: Extract text from an element
- **WAIT**: Wait for a specified time
- **SCROLL**: Scroll to an element or bottom of page
- **SELECT**: Select an option from a dropdown
- **SUBMIT**: Submit a form

## Examples

Run the provided examples:

```bash
# Create a search script
python examples/simple_search.py

# Train the AI model
python examples/train_model.py
```

## Testing

Run the test suite:

```bash
pytest tests/
```

Run tests with coverage:

```bash
pytest tests/ --cov=web_scripting_ai --cov-report=html
```

## Project Structure

```
AI-Assignment-1/
├── web_scripting_ai/       # Main package
│   ├── __init__.py         # Package initialization
│   ├── models.py           # Data models for actions and scripts
│   ├── executor.py         # Selenium-based script executor
│   └── trainer.py          # AI training and prediction
├── tests/                  # Unit tests
│   ├── __init__.py
│   ├── test_models.py
│   └── test_trainer.py
├── examples/               # Usage examples
│   ├── simple_search.py
│   └── train_model.py
├── data/                   # Training data and models
├── requirements.txt        # Python dependencies
└── README.md              # This file
```

## How It Works

### 1. Action Definition
Actions are defined using the `WebAction` class with an action type, selector, and value.

### 2. Script Execution
The `WebScriptExecutor` uses Selenium WebDriver to execute actions in a real browser environment.

### 3. AI Training
The `WebScriptTrainer` uses machine learning (Random Forest classifier) to learn patterns from:
- Page URLs
- Page titles
- HTML structure
- Previous actions

### 4. Action Prediction
Once trained, the AI can predict the next likely action based on the current page context.

## Use Cases

- **Automated Testing**: Create and execute test scripts
- **Web Scraping**: Extract data from websites systematically
- **Form Automation**: Automatically fill and submit forms
- **Data Collection**: Gather information from multiple pages
- **Repetitive Tasks**: Automate routine web interactions

## Technical Details

### Machine Learning Approach

The system uses:
- **TF-IDF Vectorization**: For text features (URLs, titles)
- **Random Forest Classifier**: For action prediction
- **Feature Engineering**: Combines text and numeric features

### Supported Selectors

- CSS Selectors: `#id`, `.class`, `tag[attribute='value']`
- XPath: `//div[@class='example']`

## Limitations

- Requires Chrome/Chromium browser
- Limited to synchronous execution
- Basic AI model (can be enhanced)
- No JavaScript execution tracking
- No dynamic content handling

## Future Enhancements

- [ ] Support for more browsers (Firefox, Safari)
- [ ] Advanced AI models (neural networks)
- [ ] Dynamic content detection
- [ ] Screenshot-based learning
- [ ] Parallel execution
- [ ] Better error handling
- [ ] Visual action recording

## Contributing

Contributions are welcome! Please feel free to submit pull requests or open issues.

## License

This project is for educational purposes as part of an AI assignment.

## Authors

Developed as part of AI Assignment 1 for demonstrating web automation and machine learning integration.