import axios from 'axios';

async function testTenant001() {
  try {
    console.log('Testing tenant_001 user login and services...');
    
    // First, try to login as Bob (tenant_001 user)
    const loginResponse = await axios.post('http://localhost:5000/auth/client_login', {
      email: 'bob@example.com',
      password: 'password123'  // Assuming this is the password
    });
    
    console.log('Login response:', loginResponse.data);
    
    if (loginResponse.data.successful) {
      const token = loginResponse.data.accessToken;
      const user = loginResponse.data.user;
      
      console.log(`Logged in as: ${user.name} (${user.email})`);
      console.log(`Tenant ID: ${user.tenant_id}`);
      
      // Now try to get services for this user
      const servicesResponse = await axios.get('http://localhost:5000/services', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-Tenant-ID': user.tenant_id || 'default-tenant'
        }
      });
      
      console.log('Services response:', servicesResponse.data);
      console.log(`Found ${servicesResponse.data.data.length} services for tenant_001`);
      servicesResponse.data.data.forEach(service => {
        console.log(`  - ${service.service_name} (${service.tenant_id})`);
      });
      
    }
  } catch (error) {
    console.error('Error during test:', error.response?.data || error.message);
  }
}

testTenant001();