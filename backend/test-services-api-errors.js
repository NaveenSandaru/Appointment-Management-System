import axios from 'axios';

async function testServicesAPI() {
  console.log('🔍 Testing services API call without authentication...');
  
  try {
    const response = await axios.get('http://localhost:5000/services');
    console.log('✅ Success:', response.data);
  } catch (error) {
    console.log('❌ Error details:');
    console.log('Status:', error.response?.status);
    console.log('Status Text:', error.response?.statusText);
    console.log('Data:', error.response?.data);
    console.log('Headers:', error.response?.headers);
  }

  console.log('\n🔍 Testing with empty Authorization header...');
  try {
    const response = await axios.get('http://localhost:5000/services', {
      headers: {
        'Authorization': '',
        'Content-Type': 'application/json'
      }
    });
    console.log('✅ Success:', response.data);
  } catch (error) {
    console.log('❌ Error details:');
    console.log('Status:', error.response?.status);
    console.log('Data:', error.response?.data);
  }

  console.log('\n🔍 Testing with malformed token...');
  try {
    const response = await axios.get('http://localhost:5000/services', {
      headers: {
        'Authorization': 'Bearer invalid-token',
        'Content-Type': 'application/json'
      }
    });
    console.log('✅ Success:', response.data);
  } catch (error) {
    console.log('❌ Error details:');
    console.log('Status:', error.response?.status);
    console.log('Data:', error.response?.data);
  }
}

testServicesAPI();