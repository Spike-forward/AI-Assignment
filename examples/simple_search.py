"""
Example: Simple search automation script.
"""

from web_scripting_ai import WebAction, ActionType, WebScriptExecutor
from web_scripting_ai.models import WebScript


def create_search_script():
    """Create a simple search script."""
    actions = [
        WebAction(
            action_type=ActionType.NAVIGATE,
            value="https://www.google.com"
        ),
        WebAction(
            action_type=ActionType.TYPE,
            selector="textarea[name='q']",
            value="web scraping with Python"
        ),
        WebAction(
            action_type=ActionType.SUBMIT,
            selector="textarea[name='q']"
        ),
        WebAction(
            action_type=ActionType.WAIT,
            value="2"
        ),
        WebAction(
            action_type=ActionType.EXTRACT,
            selector="h3"
        )
    ]
    
    return WebScript(
        name="google_search",
        description="Perform a Google search and extract results",
        actions=actions
    )


def main():
    """Run the search script example."""
    script = create_search_script()
    
    print(f"Executing script: {script.name}")
    print(f"Description: {script.description}")
    print(f"Total actions: {len(script.actions)}\n")
    
    # Note: This requires Chrome/Chromium to be installed
    # Uncomment to run:
    # with WebScriptExecutor(headless=True) as executor:
    #     results = executor.execute_script(script)
    #     print("Results:", results)
    
    print("Script created successfully!")
    print("\nScript JSON representation:")
    import json
    print(json.dumps(script.to_dict(), indent=2))


if __name__ == "__main__":
    main()
