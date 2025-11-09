"""
Web script executor using Selenium WebDriver.
"""

import time
from typing import Optional, List, Dict, Any
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
from selenium.common.exceptions import TimeoutException, NoSuchElementException

from .models import WebAction, ActionType, WebScript


class WebScriptExecutor:
    """Executes web scripting actions using Selenium."""
    
    def __init__(self, headless: bool = True, timeout: int = 10):
        """
        Initialize the executor.
        
        Args:
            headless: Whether to run browser in headless mode
            timeout: Default timeout for element waits in seconds
        """
        self.headless = headless
        self.timeout = timeout
        self.driver: Optional[webdriver.Chrome] = None
        
    def start(self):
        """Start the browser."""
        chrome_options = Options()
        if self.headless:
            chrome_options.add_argument("--headless")
        chrome_options.add_argument("--no-sandbox")
        chrome_options.add_argument("--disable-dev-shm-usage")
        
        self.driver = webdriver.Chrome(options=chrome_options)
        
    def stop(self):
        """Stop the browser."""
        if self.driver:
            self.driver.quit()
            self.driver = None
    
    def __enter__(self):
        """Context manager entry."""
        self.start()
        return self
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        """Context manager exit."""
        self.stop()
    
    def execute_action(self, action: WebAction) -> Optional[Any]:
        """
        Execute a single web action.
        
        Args:
            action: The action to execute
            
        Returns:
            Result of the action (if any)
        """
        if not self.driver:
            raise RuntimeError("Executor not started. Call start() first.")
        
        if action.action_type == ActionType.NAVIGATE:
            return self._navigate(action.value)
        elif action.action_type == ActionType.CLICK:
            return self._click(action.selector)
        elif action.action_type == ActionType.TYPE:
            return self._type(action.selector, action.value)
        elif action.action_type == ActionType.EXTRACT:
            return self._extract(action.selector)
        elif action.action_type == ActionType.WAIT:
            return self._wait(float(action.value) if action.value else 1.0)
        elif action.action_type == ActionType.SCROLL:
            return self._scroll(action.selector)
        elif action.action_type == ActionType.SELECT:
            return self._select(action.selector, action.value)
        elif action.action_type == ActionType.SUBMIT:
            return self._submit(action.selector)
        else:
            raise ValueError(f"Unknown action type: {action.action_type}")
    
    def execute_script(self, script: WebScript) -> List[Any]:
        """
        Execute a complete web script.
        
        Args:
            script: The script to execute
            
        Returns:
            List of results from each action
        """
        results = []
        for action in script.actions:
            try:
                result = self.execute_action(action)
                results.append(result)
            except Exception as e:
                results.append({"error": str(e)})
        return results
    
    def _navigate(self, url: str) -> None:
        """Navigate to a URL."""
        self.driver.get(url)
        
    def _click(self, selector: str) -> None:
        """Click an element."""
        element = self._wait_for_element(selector)
        element.click()
        
    def _type(self, selector: str, text: str) -> None:
        """Type text into an element."""
        element = self._wait_for_element(selector)
        element.clear()
        element.send_keys(text)
        
    def _extract(self, selector: str) -> str:
        """Extract text from an element."""
        element = self._wait_for_element(selector)
        return element.text
        
    def _wait(self, seconds: float) -> None:
        """Wait for a specified time."""
        time.sleep(seconds)
        
    def _scroll(self, selector: Optional[str] = None) -> None:
        """Scroll to an element or to bottom of page."""
        if selector:
            element = self._wait_for_element(selector)
            self.driver.execute_script("arguments[0].scrollIntoView();", element)
        else:
            self.driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
            
    def _select(self, selector: str, value: str) -> None:
        """Select an option from a dropdown."""
        from selenium.webdriver.support.ui import Select
        element = self._wait_for_element(selector)
        select = Select(element)
        select.select_by_visible_text(value)
        
    def _submit(self, selector: str) -> None:
        """Submit a form."""
        element = self._wait_for_element(selector)
        element.submit()
    
    def _wait_for_element(self, selector: str):
        """Wait for element to be present and return it."""
        wait = WebDriverWait(self.driver, self.timeout)
        
        # Determine selector type
        if selector.startswith("//"):
            by = By.XPATH
        elif selector.startswith("#"):
            by = By.CSS_SELECTOR
        elif selector.startswith("."):
            by = By.CSS_SELECTOR
        else:
            # Default to CSS selector
            by = By.CSS_SELECTOR
            
        return wait.until(EC.presence_of_element_located((by, selector)))
    
    def get_page_state(self) -> Dict[str, Any]:
        """Get current page state for AI training."""
        if not self.driver:
            return {}
        
        return {
            "url": self.driver.current_url,
            "title": self.driver.title,
            "html_length": len(self.driver.page_source),
        }
