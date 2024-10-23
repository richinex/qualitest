// import React, { useState, useEffect, useCallback } from 'react';
// import LoadingSpinner from './LoadingSpinner';
// import TestResult from './TestResult';
// import {
//   validateEndpoint,
//   validateMethod,
//   validateHeaders,
//   validatePayload,
//   validateResponse,
//   validateLatency
// } from '../utils/validators';
// import '../styles/APITestScenario.css';

// const APITestScenario = ({
//   title,
//   type,
//   requests,
//   isRunning,
//   onReset,
//   onStop
// }) => {
//   const [results, setResults] = useState([]);
//   const [status, setStatus] = useState('idle');
//   const [currentRequest, setCurrentRequest] = useState(null);

//   const validateRequest = useCallback((request) => {
//     const validations = {
//       endpoint: validateEndpoint(request.endpoint),
//       method: validateMethod(request.method),
//       headers: validateHeaders(request.headers),
//       payload: validatePayload(request.payload, request.method),
//       response: validateResponse(request.expectedResponse),
//       latency: validateLatency(request.expectedLatency)
//     };
//     const passed = Object.values(validations).every(v => v.valid);
//     return {
//       passed,
//       validations,
//       timestamp: new Date().toLocaleTimeString(),
//       request,
//       executionTime: request.expectedLatency || 0
//     };
//   }, []);

//   const runTests = useCallback(async () => {
//     let allPassed = true;
//     for (let request of requests) {
//       setCurrentRequest(request);
//       const result = validateRequest(request);
//       if (!result.passed) {
//         allPassed = false;
//       }
//       await new Promise(resolve => setTimeout(resolve, 1000));
//       setResults(prev => [...prev, result]);
//     }
//     setStatus(allPassed ? 'completed' : 'failed');
//     setCurrentRequest(null);
//   }, [requests, validateRequest]);

//   useEffect(() => {
//     let mounted = true;

//     if (isRunning && status === 'idle' && mounted) {
//       setStatus('running');
//       setResults([]);
//       runTests();
//     } else if (!isRunning && status === 'running' && mounted) {
//       setStatus('stopped');
//     }

//     return () => {
//       mounted = false;
//     };
//   }, [isRunning, status, runTests]);

//   const handleReset = () => {
//     setStatus('idle');
//     onReset();
//   };

//   const getStatusColor = () => {
//     switch (status) {
//       case 'running': return 'blue';
//       case 'completed': return type === 'qualitest' ? 'green' : 'red';
//       case 'failed': return 'red';
//       case 'stopped': return 'orange';
//       default: return 'gray';
//     }
//   };

//   return (
//     <div className={`api-test-scenario ${status}`}>
//       <div className="scenario-header">
//         <h2>{title}</h2>
//         <div className={`status-badge ${getStatusColor()}`}>
//           {status.toUpperCase()}
//         </div>
//       </div>
//       <div className="control-panel">
//         {!isRunning && status === 'idle' && (
//           <button
//             className="control-button start"
//             onClick={handleReset}
//           >
//             Start Test
//           </button>
//         )}
//         {isRunning && status === 'running' && (
//           <button
//             className="control-button stop"
//             onClick={onStop}
//           >
//             Stop Test
//           </button>
//         )}
//         {(status === 'completed' || status === 'failed' || status === 'stopped') && (
//           <button
//             className="control-button replay"
//             onClick={handleReset}
//           >
//             Replay Test
//           </button>
//         )}
//       </div>
//       <div className="test-progress">
//         {currentRequest && (
//           <div className="current-request">
//             <LoadingSpinner />
//             <p>Testing: {currentRequest.endpoint}</p>
//           </div>
//         )}
//       </div>
//       <div className="results-container">
//         {results.map((result, index) => (
//           <TestResult
//             key={`${result.request.id}-${index}`}
//             result={result}
//           />
//         ))}
//       </div>
//     </div>
//   );
// };

// export default APITestScenario;

// src/components/APITestScenario.jsx
// src/components/APITestScenario.jsx
// src/components/APITestScenario.jsx
import React, { useState, useEffect, useCallback } from 'react';
import TestPipeline from './TestPipeline';
import {
  validateEndpoint,
  validateMethod,
  validateHeaders,
  validatePayload,
  validateResponse,
  validateLatency
} from '../utils/validators';
import '../styles/APITestScenario.css';

const APITestScenario = ({
  title,
  type,
  requests,
  isRunning,
  onReset,
  onStop
}) => {
  const [results, setResults] = useState([]);
  const [status, setStatus] = useState('idle');
  const [currentRequest, setCurrentRequest] = useState(null);

  const validateRequest = useCallback((request) => {
    let validations = {
      endpoint: validateEndpoint(request.endpoint),
      method: validateMethod(request.method),
      headers: validateHeaders(request.headers),
      payload: validatePayload(request.payload, request.method),
      response: validateResponse(request.expectedResponse),
      latency: validateLatency(request.expectedLatency)
    };

    // Special validation for QualiTest requests
    if (type === 'qualitest') {
      if (request.endpoint === '/api/cicd/provision-test-data') {
        validations.response.valid = request.expectedResponse.data.syncStatus === 'COMPLETED';
        validations.response.message = validations.response.valid ?
          'Systems synchronized successfully' :
          'System synchronization incomplete';
      }
      else if (request.endpoint === '/api/customer/create') {
        const allSynced = Object.values(request.expectedResponse.data.systemStatuses)
          .every(status => status === 'SYNCED');
        validations.response.valid = allSynced;
        validations.response.message = allSynced ?
          'Customer created in all systems' :
          'Customer creation incomplete';
      }
      else if (request.endpoint === '/api/service/verify-integration') {
        const allVerified = request.expectedResponse.data.verificationStatus === 'PASSED' &&
          Object.values(request.expectedResponse.data.integrationChecks)
            .every(check => check.status === 'VERIFIED');
        validations.response.valid = allVerified;
        validations.response.message = allVerified ?
          'All integration checks passed' :
          'Integration verification failed';
      }
    }

    const passed = Object.values(validations).every(v => v.valid);

    return {
      passed,
      validations,
      timestamp: new Date().toLocaleTimeString(),
      request,
      executionTime: request.expectedLatency || 0
    };
  }, [type]);

  const runTests = useCallback(async () => {
    let allPassed = true;
    for (let request of requests) {
      setCurrentRequest(request);
      const result = validateRequest(request);
      if (!result.passed) {
        allPassed = false;
      }
      await new Promise(resolve => setTimeout(resolve, 1000));
      setResults(prev => [...prev, result]);
    }
    setStatus(allPassed ? 'completed' : 'failed');
    setCurrentRequest(null);
  }, [requests, validateRequest]);

  useEffect(() => {
    let mounted = true;
    if (isRunning && status === 'idle' && mounted) {
      setStatus('running');
      setResults([]);
      runTests();
    } else if (!isRunning && status === 'running' && mounted) {
      setStatus('stopped');
    }
    return () => {
      mounted = false;
    };
  }, [isRunning, status, runTests]);

  const handleReset = () => {
    setStatus('idle');
    onReset();
  };

  const getStatusColor = () => {
    switch (status) {
      case 'running': return 'blue';
      case 'completed': return type === 'qualitest' ? 'green' : 'red';
      case 'failed': return 'red';
      case 'stopped': return 'orange';
      default: return 'gray';
    }
  };

  return (
    <div className={`api-test-scenario ${status}`}>
      <div className="scenario-header">
        <h2>{title}</h2>
        <div className={`status-badge ${getStatusColor()}`}>
          {status.toUpperCase()}
        </div>
      </div>
      <TestPipeline
        requests={requests}
        currentRequest={currentRequest}
        results={results}
        type={type}
        status={status}
      />
      <div className="control-panel">
        {!isRunning && status === 'idle' && (
          <button
            className="control-button start"
            onClick={handleReset}
          >
            Start Test
          </button>
        )}
        {isRunning && status === 'running' && (
          <button
            className="control-button stop"
            onClick={onStop}
          >
            Stop Test
          </button>
        )}
        {(status === 'completed' || status === 'failed' || status === 'stopped') && (
          <button
            className="control-button replay"
            onClick={handleReset}
          >
            Replay Test
          </button>
        )}
      </div>
    </div>
  );
};

export default APITestScenario;
