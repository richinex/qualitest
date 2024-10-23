import React, { useState } from 'react';
import APITestScenario from './components/APITestScenario';
import { qualiTestRequests } from './data/mockQualiTestAPI';
import { regularAPIRequests } from './data/mockRegularAPI';
import './App.css';

function App() {
  const [qualiTestRunning, setQualiTestRunning] = useState(false);
  const [regularAPIRunning, setRegularAPIRunning] = useState(false);

  const handleQualiTestReset = () => {
    setQualiTestRunning(false);
    setTimeout(() => setQualiTestRunning(true), 100);
  };

  const handleRegularAPIReset = () => {
    setRegularAPIRunning(false);
    setTimeout(() => setRegularAPIRunning(true), 100);
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="header-content">
          <div className="logo">
            <img
              src="/logo512.png"
              alt="Swisscom Logo"
              className="swisscom-logo"
            />
          </div>
          <h1>Spicy Demo</h1>
        </div>
      </header>
      <main className="scenarios-container">
        <APITestScenario
          title="QualiTest API Workflow"
          type="qualitest"
          requests={qualiTestRequests}
          isRunning={qualiTestRunning}
          onReset={handleQualiTestReset}
          onStop={() => setQualiTestRunning(false)}
        />
        <APITestScenario
          title="RegularTest API Workflow"
          type="regular"
          requests={regularAPIRequests}
          isRunning={regularAPIRunning}
          onReset={handleRegularAPIReset}
          onStop={() => setRegularAPIRunning(false)}
        />
      </main>
      {/* <footer className="app-footer">
        <p>© 2024 QualiTest - API Quality Testing Platform</p>
      </footer> */}
    </div>
  );
}

export default App;