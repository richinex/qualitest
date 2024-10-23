// src/data/regularAPIRequests.js
export const regularAPIRequests = [
    {
      id: 1,
      endpoint: '/api/provision-test-data',
      method: 'POST',
      headers: {
        'Authorization': 'Bearer test-token-123',
        'Content-Type': 'application/json'
      },
      payload: {
        testDataSet: 'TELCO_CUSTOMER_001',
        environment: 'TEST'
      },
      expectedResponse: {
        status: 200,
        data: {
          syncStatus: 'PARTIAL',
          testDataId: 'TD-002',
          syncedSystems: ['CRM'],
          pendingSystems: ['BILLING', 'NETWORK']
        }
      },
      expectedLatency: 3000
    },
    {
      id: 2,
      endpoint: '/api/customer/create',
      method: 'POST',
      headers: {
        'Authorization': 'Bearer test-token-123',
        'Content-Type': 'application/json'
      },
      payload: {
        customerProfile: {
          msisdn: '254700000002',
          idNumber: 'TEST123457',
          name: 'Test Customer',
          accountType: 'POSTPAID',
          tariffPlan: 'CORPORATE_5G'
        }
      },
      expectedResponse: {
        status: 409,
        data: {
          error: 'DATA_SYNC_ERROR',
          message: 'Billing system synchronization pending',
          details: {
            crm: 'CREATED',
            billing: 'FAILED',
            network: 'NOT_STARTED'
          }
        }
      },
      expectedLatency: 5000
    },
    {
      id: 3,
      endpoint: '/api/service/verify-integration',
      method: 'POST',
      headers: {
        'Authorization': 'Bearer test-token-123',
        'Content-Type': 'application/json'
      },
      payload: {
        customerId: 'CUS-TEST-002',
        msisdn: '254700000002',
        verificationPoints: [
          'BILLING_SYSTEM',
        ]
      },
      expectedResponse: {
        status: 424,
        data: {
          verificationStatus: 'FAILED',
          integrationChecks: {
            billingSystem: {
              status: 'FAILED',
              error: 'Customer not found in billing system'
            },
          }
        }
      },
      expectedLatency: 4000
    }
  ];