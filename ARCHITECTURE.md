# System Architecture

## High-Level Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                   AI Web Scripting System                        │
└─────────────────────────────────────────────────────────────────┘

┌────────────────────┐
│   User / Client    │
└─────────┬──────────┘
          │
          ├─────────────────────────┐
          │                         │
          ▼                         ▼
┌─────────────────┐       ┌─────────────────┐
│  WebScript API  │       │  AI Trainer API │
│                 │       │                 │
│ - Define Actions│       │ - Train Model   │
│ - Create Scripts│       │ - Predict       │
│ - Execute       │       │ - Save/Load     │
└────────┬────────┘       └────────┬────────┘
         │                         │
         │                         │
         ▼                         ▼
┌─────────────────┐       ┌─────────────────┐
│  Data Models    │       │  ML Trainer     │
│                 │       │                 │
│ - ActionType    │       │ - RF Classifier │
│ - WebAction     │       │ - TF-IDF        │
│ - WebScript     │       │ - Features      │
└────────┬────────┘       └────────┬────────┘
         │                         │
         │                         │
         ▼                         ▼
┌─────────────────┐       ┌─────────────────┐
│ Script Executor │       │  Training Data  │
│                 │       │                 │
│ - Selenium      │◄──────┤ - Context       │
│ - Browser       │       │ - Actions       │
│ - Actions       │       │ - Features      │
└────────┬────────┘       └─────────────────┘
         │
         ▼
┌─────────────────┐
│   Web Browser   │
│                 │
│ - Chrome/       │
│   Chromium      │
└─────────────────┘
```

## Component Details

### 1. Data Models Layer
**Purpose**: Define structure for actions and scripts

- **ActionType Enum**: 8 action types (NAVIGATE, CLICK, TYPE, etc.)
- **WebAction**: Individual action with selector and value
- **WebScript**: Sequence of actions with metadata

### 2. Script Executor Layer
**Purpose**: Execute web actions in browser

- **Selenium WebDriver**: Browser automation
- **Action Handlers**: Implement each action type
- **Selector Support**: CSS, XPath
- **State Extraction**: Capture page context

### 3. AI Training Layer
**Purpose**: Learn patterns from examples

- **Feature Engineering**:
  - URL vectorization (TF-IDF)
  - Title vectorization (TF-IDF)
  - HTML structure metrics
  - Action history

- **Machine Learning**:
  - Random Forest Classifier
  - 100 estimators
  - Action type prediction

- **Model Persistence**:
  - Save trained models
  - Load for inference

## Data Flow

### Script Execution Flow
```
User Code
   ↓
Define WebActions
   ↓
Create WebScript
   ↓
WebScriptExecutor.execute_script()
   ↓
For each action:
   ↓
Execute in Browser (Selenium)
   ↓
Return Results
```

### Training Flow
```
Collect Training Data
   ↓
{context, action} pairs
   ↓
WebScriptTrainer.train()
   ↓
Feature Extraction
   ↓
Train Random Forest
   ↓
Save Model
```

### Prediction Flow
```
Current Page Context
   ↓
Extract Features
   ↓
WebScriptTrainer.predict_action()
   ↓
Random Forest Prediction
   ↓
Predicted Action Type
```

## Key Design Decisions

### 1. Action-Based Design
- **Why**: Modular, extensible, easy to understand
- **Benefit**: Easy to add new action types

### 2. Selenium for Execution
- **Why**: Mature, well-tested, cross-browser support
- **Benefit**: Real browser interaction

### 3. Random Forest Classifier
- **Why**: Works well with mixed features, handles non-linearity
- **Benefit**: Good accuracy without complex tuning

### 4. TF-IDF Vectorization
- **Why**: Captures text patterns, dimension reduction
- **Benefit**: Efficient text feature representation

### 5. Context Manager Pattern
- **Why**: Ensures proper resource cleanup
- **Benefit**: Browser lifecycle management

## Extension Points

### Adding New Action Types
1. Add to `ActionType` enum
2. Implement handler in `WebScriptExecutor`
3. Update tests
4. Document in README

### Improving AI Model
1. Add more features (screenshots, DOM structure)
2. Try deep learning (LSTM, Transformer)
3. Increase training data
4. Fine-tune hyperparameters

### Browser Support
1. Add Firefox WebDriver
2. Add Safari WebDriver
3. Abstract browser interface
4. Configuration for browser selection

## Security Considerations

- ✅ No credential storage in code
- ✅ Secure browser options (no-sandbox)
- ✅ Input validation on selectors
- ✅ CodeQL scanning passed
- ⚠️ User responsible for sensitive data handling

## Performance Considerations

- **Bottleneck**: Browser operations (network, rendering)
- **Optimization**: 
  - Headless mode reduces overhead
  - Adjustable timeouts
  - Reusable browser sessions
  - Parallel execution (future)

## Testing Strategy

- **Unit Tests**: Models, trainer, features (14 tests)
- **Integration Tests**: End-to-end examples
- **No UI Tests**: Selenium requires actual browser
- **Coverage**: Core functionality covered

## Future Architecture Enhancements

1. **Microservices**: Split executor and trainer
2. **Queue System**: Async job processing
3. **API Layer**: REST API for remote execution
4. **Dashboard**: Web UI for monitoring
5. **Database**: Persistent training data storage
6. **Distributed**: Multiple browser instances
