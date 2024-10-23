// src/data/mockQualiTestAPI.js
export const qualiTestRequests = [
    {
      id: 1,
      endpoint: '/api/cicd/provision-test-data',
      method: 'POST',
      headers: {
        'Authorization': 'Bearer test-env-token-123',
        'Content-Type': 'application/json',
        'X-Pipeline-ID': 'PIPE-123'
      },
      payload: {
        testDataSet: 'TELCO_CUSTOMER_001',
        environment: 'TEST',
        systemComponents: [
          'CRM',
          'BILLING',
          'INVENTORY'
        ]
      },
      expectedResponse: {
        status: 200,
        data: {
          syncStatus: 'COMPLETED',
          testDataId: 'TD-001',
          syncedSystems: [
            'CRM',
            'BILLING',
            'INVENTORY'
          ]
        }
      },
      expectedLatency: 500
    },
    {
      id: 2,
      endpoint: '/api/customer/create',
      method: 'POST',
      headers: {
        'Authorization': 'Bearer test-env-token-123',
        'Content-Type': 'application/json',
        'X-Test-Data-ID': 'TD-001',
        'X-Pipeline-ID': 'PIPE-123'
      },
      payload: {
        customerProfile: {
          msisdn: '254700000001',
          idNumber: 'TEST123456',
          name: 'Test Customer',
          accountType: 'POSTPAID',
          tariffPlan: 'CORPORATE_5G'
        },
        services: {
          voice: true,
          data: {
            plan: '100GB',
            speedLimit: '100Mbps'
          },
          addOns: ['ROAMING', 'VAS']
        }
      },
      expectedResponse: {
        status: 201,
        data: {
          customerId: 'CUS-TEST-001',
          provisioningStatus: 'SUCCESS',
          systemStatuses: {
            crm: 'SYNCED',
            billing: 'SYNCED',
            provisioning: 'SYNCED',
            network: 'SYNCED',
            inventory: 'SYNCED'
          }
        }
      },
      expectedLatency: 800
    },
    {
      id: 3,
      endpoint: '/api/service/verify-integration',
      method: 'POST',
      headers: {
        'Authorization': 'Bearer test-env-token-123',
        'Content-Type': 'application/json',
        'X-Test-Data-ID': 'TD-001',
        'X-Pipeline-ID': 'PIPE-123'
      },
      payload: {
        customerId: 'CUS-TEST-001',
        msisdn: '254700000001',
        verificationPoints: [
          'BILLING_SYSTEM',
        ]
      },
      expectedResponse: {
        status: 200,
        data: {
          verificationStatus: 'PASSED',
          integrationChecks: {
            billingSystem: {
              status: 'VERIFIED',
              details: 'Customer properly tagged as test account'
            },
          }
        }
      },
      expectedLatency: 600
    }
  ];