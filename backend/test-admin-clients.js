import axios from 'axios';

async function testAdminClientsEndpoint() {
  const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImJvYkBleGFtcGxlLmNvbSIsIm5hbWUiOiJCb2IgU2lsdmEiLCJyb2xlIjoiY2xpZW50IiwidGVuYW50X2lkIjoidGVuYW50XzAwMSIsImlhdCI6MTc1ODUzNzAyNywiZXhwIjoxNzU4NTQwNjI3fQ.2Rr6nrVecZbd3gpju_kOHzsrORc_1a-2ha4c22kNRew';
  
  const headers = {
    'Authorization': `Bearer ${token}`,
    'X-Tenant-ID': 'tenant_001',
    'Content-Type': 'application/json'
  };

  console.log('🧪 Testing admin clients endpoint for tenant_001...\n');

  try {
    console.log('📋 Testing /clients endpoint with authentication...');
    const response = await axios.get('http://localhost:5000/clients', { headers });
    const clients = response.data;
    
    console.log(`✅ Found ${clients.length} client(s):`);
    clients.forEach(client => {
      console.log(`   - ${client.name} (${client.email}) - Tenant: ${client.tenant_id}`);
    });
    
    const hasOnlyTenant001Clients = clients.every(client => client.tenant_id === 'tenant_001');
    console.log(`✅ All clients belong to tenant_001: ${hasOnlyTenant001Clients}`);
    
    if (!hasOnlyTenant001Clients) {
      console.log('❌ VIOLATION: Found clients from other tenants!');
    }
  } catch (error) {
    console.log('❌ Error testing clients endpoint:', error.response?.status, error.response?.data || error.message);
  }
}

testAdminClientsEndpoint();