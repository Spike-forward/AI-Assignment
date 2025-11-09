"""
AI trainer for learning web scripting patterns.
"""

import json
import pickle
from typing import List, Dict, Any, Optional
from pathlib import Path
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.feature_extraction.text import TfidfVectorizer

from .models import WebAction, WebScript, ActionType


class WebScriptTrainer:
    """Trains an AI model to predict web actions based on context."""
    
    def __init__(self):
        """Initialize the trainer."""
        self.action_classifier = RandomForestClassifier(n_estimators=100, random_state=42)
        self.text_vectorizer = TfidfVectorizer(max_features=100)
        self.selector_vectorizer = TfidfVectorizer(max_features=50)
        self.is_trained = False
        
    def prepare_features(self, context: Dict[str, Any]) -> np.ndarray:
        """
        Prepare features from context for model input.
        
        Args:
            context: Context dictionary containing page state
            
        Returns:
            Feature vector
        """
        features = []
        
        # URL features
        url = context.get("url", "")
        url_features = self.text_vectorizer.transform([url]).toarray()[0]
        features.extend(url_features)
        
        # Page title features
        title = context.get("title", "")
        title_features = self.text_vectorizer.transform([title]).toarray()[0]
        features.extend(title_features)
        
        # Additional numeric features
        features.append(context.get("html_length", 0) / 10000)  # Normalized
        features.append(len(context.get("previous_actions", [])))
        
        return np.array(features)
    
    def train(self, training_data: List[Dict[str, Any]]):
        """
        Train the model on labeled examples.
        
        Args:
            training_data: List of training examples with context and actions
        """
        if not training_data:
            raise ValueError("Training data cannot be empty")
        
        # First, fit vectorizers on all text data
        all_urls = [d["context"].get("url", "") for d in training_data]
        all_titles = [d["context"].get("title", "") for d in training_data]
        
        self.text_vectorizer.fit(all_urls + all_titles)
        
        # Prepare features and labels
        X = []
        y = []
        
        for example in training_data:
            context = example["context"]
            action = example["action"]
            
            features = self.prepare_features(context)
            X.append(features)
            y.append(action["action_type"])
        
        X = np.array(X)
        
        # Train classifier
        self.action_classifier.fit(X, y)
        self.is_trained = True
        
    def predict_action(self, context: Dict[str, Any]) -> str:
        """
        Predict next action based on context.
        
        Args:
            context: Current page context
            
        Returns:
            Predicted action type
        """
        if not self.is_trained:
            raise RuntimeError("Model not trained. Call train() first.")
        
        features = self.prepare_features(context)
        features = features.reshape(1, -1)
        
        prediction = self.action_classifier.predict(features)[0]
        return prediction
    
    def save_model(self, path: str):
        """Save trained model to disk."""
        model_data = {
            "action_classifier": self.action_classifier,
            "text_vectorizer": self.text_vectorizer,
            "selector_vectorizer": self.selector_vectorizer,
            "is_trained": self.is_trained
        }
        
        with open(path, "wb") as f:
            pickle.dump(model_data, f)
    
    def load_model(self, path: str):
        """Load trained model from disk."""
        with open(path, "rb") as f:
            model_data = pickle.load(f)
        
        self.action_classifier = model_data["action_classifier"]
        self.text_vectorizer = model_data["text_vectorizer"]
        self.selector_vectorizer = model_data["selector_vectorizer"]
        self.is_trained = model_data["is_trained"]
    
    @staticmethod
    def load_training_data(file_path: str) -> List[Dict[str, Any]]:
        """Load training data from JSON file."""
        with open(file_path, "r") as f:
            return json.load(f)
    
    @staticmethod
    def save_training_data(data: List[Dict[str, Any]], file_path: str):
        """Save training data to JSON file."""
        with open(file_path, "w") as f:
            json.dump(data, f, indent=2)
