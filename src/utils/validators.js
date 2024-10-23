// src/utils/validators.js
export const validateEndpoint = (endpoint) => {
  const urlPattern = /^(\/[a-zA-Z0-9-_]+)+$/;
  return {
    valid: urlPattern.test(endpoint),
    message: 'Endpoint must start with / and contain valid characters'
  };
};

export const validateMethod = (method) => {
  const validMethods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];
  return {
    valid: validMethods.includes(method),
    message: 'Invalid HTTP method'
  };
};

export const validateHeaders = (headers) => {
  try {
    const isValidFormat = typeof headers === 'object' && headers !== null;
    const hasRequiredHeaders = headers['Authorization'] && headers['Content-Type'];
    return {
      valid: isValidFormat && hasRequiredHeaders,
      message: isValidFormat ?
        (hasRequiredHeaders ? 'Valid headers' : 'Missing required Authorization or Content-Type headers') :
        'Headers must be a valid object'
    };
  } catch (e) {
    return {
      valid: false,
      message: 'Invalid headers format'
    };
  }
};

export const validatePayload = (payload, method) => {
  if (['GET', 'DELETE'].includes(method)) {
    return {
      valid: payload === null || payload === undefined,
      message: 'GET/DELETE requests should not have a payload'
    };
  }

  try {
    const isValidObject = typeof payload === 'object' && payload !== null;
    const hasRequiredFields = payload && Object.keys(payload).length > 0;
    return {
      valid: isValidObject && hasRequiredFields,
      message: isValidObject ?
        (hasRequiredFields ? 'Valid payload' : 'Payload must contain data') :
        'Payload must be a valid object'
    };
  } catch (e) {
    return {
      valid: false,
      message: 'Invalid payload format'
    };
  }
};

export const validateResponse = (response) => {
  // Basic format validation
  const hasValidFormat = response && typeof response.status === 'number' && response.data;
  if (!hasValidFormat) {
    return {
      valid: false,
      message: 'Response must have a valid status code and data'
    };
  }

  // Check sync status for provision endpoints
  if (response.data.syncStatus) {
    const isFullySync = response.data.syncStatus === 'COMPLETED';
    return {
      valid: isFullySync,
      message: isFullySync ?
        'All systems synchronized' :
        'Incomplete system synchronization'
    };
  }

  // Check verification status for verify endpoints
  if (response.data.verificationStatus) {
    const isVerified = response.data.verificationStatus === 'PASSED';
    return {
      valid: isVerified,
      message: isVerified ?
        'All verifications passed' :
        'Verification checks failed'
    };
  }

  // For other endpoints, check if status is success (2xx)
  const isSuccessStatus = response.status >= 200 && response.status < 300;
  return {
    valid: isSuccessStatus,
    message: isSuccessStatus ?
      'Valid success response' :
      `Request failed with status ${response.status}`
  };
};

export const validateLatency = (latency) => {
  const isValidNumber = typeof latency === 'number' && latency >= 0;
  const isReasonableLatency = latency <= 5000; // 5 seconds threshold
  return {
    valid: isValidNumber && isReasonableLatency,
    message: isValidNumber ?
      (isReasonableLatency ? 'Acceptable latency' : 'Latency exceeds threshold') :
      'Latency must be a non-negative number'
  };
};

export const validateSystemSync = (data) => {
  if (!data || !data.systemStatuses) return {
    valid: false,
    message: 'Missing system status information'
  };

  const allSystemsSynced = Object.values(data.systemStatuses)
    .every(status => status === 'SYNCED');

  return {
    valid: allSystemsSynced,
    message: allSystemsSynced ?
      'All systems synchronized' :
      'Some systems not synchronized'
  };
};