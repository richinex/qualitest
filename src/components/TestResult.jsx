import React from 'react';
import '../styles/TestResult.css';

const TestResult = ({ result }) => {
  const {
    timestamp,
    request,
    validations,
    passed,
    executionTime
  } = result;

  return (
    <div className={`test-result ${passed ? 'success' : 'failure'}`}>
      <div className="result-header">
        <span className="timestamp">{timestamp}</span>
        <span className={`status ${passed ? 'success' : 'failure'}`}>
          {passed ? 'PASSED' : 'FAILED'}
        </span>
      </div>

      <div className="request-details">
        <h4>Request Details</h4>
        <div className="detail-item">
          <span className="label">Endpoint:</span>
          <span className="value">{request.endpoint}</span>
        </div>
        <div className="detail-item">
          <span className="label">Method:</span>
          <span className="value">{request.method}</span>
        </div>
        <div className="detail-item">
          <span className="label">Execution Time:</span>
          <span className="value">{executionTime}ms</span>
        </div>
      </div>

      <div className="validations">
        <h4>Validations</h4>
        {Object.entries(validations).map(([key, validation]) => (
          <div key={key} className={`validation-item ${validation.valid ? 'valid' : 'invalid'}`}>
            <span className="validation-key">{key}:</span>
            <span className="validation-status">
              {validation.valid ? '✓' : '✗'}
            </span>
            {!validation.valid && (
              <span className="validation-message">{validation.message}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TestResult;