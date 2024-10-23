// src/components/TestPipeline.js
import React from 'react';
import '../styles/TestPipeline.css';

const TestPipeline = ({ requests, currentRequest, results, type }) => {
  const getAllSystems = () => ['CRM', 'BILLING', 'INVENTORY'];

  const getStages = (request) => {
    switch(request.endpoint) {
      case '/api/cicd/provision-test-data':
      case '/api/provision-test-data': {
        const systems = request.payload.systemComponents || getAllSystems();
        return systems.map(system => ({
          id: `${request.id}-${system}`,
          label: `Provision ${system}`,
          description: `Synchronizing ${system} system`,
          system: system,
          parentRequest: request
        }));
      }

      case '/api/customer/create': {
        return getAllSystems().map(system => ({
          id: `${request.id}-${system}`,
          label: `Create Customer in ${system}`,
          description: `Creating customer profile in ${system}`,
          system: system,
          parentRequest: request
        }));
      }

      case '/api/service/verify-integration': {
        const verificationPoints = request.payload.verificationPoints || [
          'BILLING_SYSTEM',
          'HLR_STATUS',
          'PROVISIONING_STATUS',
          'INVENTORY_STATUS'
        ];
        return verificationPoints.map(point => ({
          id: `${request.id}-${point}`,
          label: `Verify ${point.replace(/_/g, ' ')}`,
          description: `Checking integration status`,
          system: point,
          parentRequest: request
        }));
      }

      default:
        return [{
          id: request.id,
          label: request.endpoint.split('/').pop(),
          description: `${request.method} Request`,
          parentRequest: request
        }];
    }
  };

  const getStepStatus = (stage) => {
    const result = results.find(r => r.request.id === stage.parentRequest.id);
    if (!result) return 'pending';
    if (currentRequest && currentRequest.id === stage.parentRequest.id) return 'running';

    // For QualiTest requests
    if (type === 'qualitest') {
      if (stage.parentRequest.endpoint === '/api/cicd/provision-test-data') {
        const syncedSystems = result.request.expectedResponse.data.syncedSystems || [];
        return syncedSystems.includes(stage.system) ? 'passed' : 'failed';
      }

      if (stage.parentRequest.endpoint === '/api/customer/create') {
        const statuses = result.request.expectedResponse.data.systemStatuses || {};
        return statuses[stage.system.toLowerCase()] === 'SYNCED' ? 'passed' : 'failed';
      }

      if (stage.parentRequest.endpoint === '/api/service/verify-integration') {
        const integrationChecks = result.request.expectedResponse.data.integrationChecks;
        let checkKey;

        switch(stage.system) {
          case 'BILLING_SYSTEM':
            checkKey = 'billingSystem';
            break;
          case 'HLR_STATUS':
            checkKey = 'hlrStatus';
            break;
          case 'PROVISIONING_STATUS':
            checkKey = 'provisioningStatus';
            break;
          case 'INVENTORY_STATUS':
            checkKey = 'inventoryStatus';
            break;
          default:
            checkKey = stage.system.toLowerCase();
        }

        return integrationChecks[checkKey]?.status === 'VERIFIED' ? 'passed' : 'failed';
      }
    }

    // For regular API tests
    if (stage.parentRequest.endpoint === '/api/provision-test-data') {
      const syncedSystems = result.request.expectedResponse.data.syncedSystems || [];
      const pendingSystems = result.request.expectedResponse.data.pendingSystems || [];
      if (syncedSystems.includes(stage.system)) return 'passed';
      if (pendingSystems.includes(stage.system)) return 'failed';
      return 'pending';
    }

    if (stage.parentRequest.endpoint === '/api/customer/create') {
      const details = result.request.expectedResponse.data.details || {};
      const status = details[stage.system.toLowerCase()];
      switch(status) {
        case 'CREATED':
          return 'passed';
        case 'FAILED':
        case 'PENDING':
        case 'NOT_STARTED':
          return 'failed';
        default:
          return 'failed';
      }
    }

    if (stage.parentRequest.endpoint === '/api/service/verify-integration') {
      const checks = result.request.expectedResponse.data.integrationChecks || {};
      const systemKey = stage.system.toLowerCase().replace(/_status/i, '');
      const check = checks[systemKey];
      if (check?.status === 'NOT_CHECKED') return 'failed';
      return check?.status === 'VERIFIED' ? 'passed' : 'failed';
    }

    return result.passed ? 'passed' : 'failed';
  };

  const getErrorMessage = (stage, result) => {
    if (!result || !stage) return 'Validation failed';

    if (type === 'qualitest' && stage.parentRequest.endpoint === '/api/service/verify-integration') {
      const checks = result.request.expectedResponse.data.integrationChecks;
      let checkKey;

      switch(stage.system) {
        case 'BILLING_SYSTEM':
          checkKey = 'billingSystem';
          break;
        case 'HLR_STATUS':
          checkKey = 'hlrStatus';
          break;
        case 'PROVISIONING_STATUS':
          checkKey = 'provisioningStatus';
          break;
        case 'INVENTORY_STATUS':
          checkKey = 'inventoryStatus';
          break;
        default:
          checkKey = stage.system.toLowerCase();
      }

      return checks[checkKey]?.details || 'Verification complete';
    }

    if (stage.parentRequest.endpoint === '/api/provision-test-data') {
      return 'System synchronization pending';
    }

    if (stage.parentRequest.endpoint === '/api/customer/create') {
      const details = result.request.expectedResponse.data.details || {};
      const status = details[stage.system.toLowerCase()];
      switch(status) {
        case 'CREATED':
          return 'Customer created successfully';
        case 'FAILED':
          return 'Creation failed';
        case 'PENDING':
          return 'Creation pending';
        case 'NOT_STARTED':
          return 'Creation not started';
        default:
          return `Status: ${status || 'Unknown'}`;
      }
    }

    if (stage.parentRequest.endpoint === '/api/service/verify-integration') {
      const checks = result.request.expectedResponse.data.integrationChecks || {};
      const systemKey = stage.system.toLowerCase().replace(/_status/i, '');
      return checks[systemKey]?.error || 'Verification failed';
    }

    return result.validations.response.message || 'Validation failed';
  };

  const stages = requests.flatMap(getStages);

  return (
    <div className="test-pipeline">
      <div className="pipeline-steps">
        {stages.map((stage, index) => {
          const status = getStepStatus(stage);
          const result = results.find(r => r.request.id === stage.parentRequest.id);

          return (
            <div key={stage.id} className="pipeline-step-container">
              <div className={`pipeline-step ${status}`}>
                <div className="step-number">{index + 1}</div>
                <div className="step-content">
                  <div className="step-details">
                    <div className="step-label">{stage.label}</div>
                    <div className="step-description">{stage.description}</div>
                    {status === 'failed' && result && (
                      <div className="step-error">
                        {getErrorMessage(stage, result)}
                      </div>
                    )}
                  </div>
                  <div className="step-status">
                    {status === 'running' && <div className="loading-dot"></div>}
                    {status === 'passed' && '✓'}
                    {status === 'failed' && '✗'}
                  </div>
                </div>
              </div>
              {index < stages.length - 1 && (
                <div className="pipeline-connector">
                  <div className={`connector-line ${status !== 'pending' ? status : ''}`} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TestPipeline;