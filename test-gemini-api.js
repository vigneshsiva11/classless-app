// Test script to verify Gemini API key setup
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function testGeminiAPI() {
  console.log('Testing Gemini API setup...\n');
  
  // Check if API key is available
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    console.log('❌ No GEMINI_API_KEY found in environment variables');
    console.log('Please create a .env.local file with:');
    console.log('GEMINI_API_KEY=your_actual_api_key_here');
    return;
  }
  
  console.log('✅ GEMINI_API_KEY found:', apiKey.substring(0, 10) + '...');
  
  try {
    // Initialize Gemini AI
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
    
    console.log('✅ Gemini AI initialized successfully');
    
    // Test with a simple text prompt
    console.log('Testing with a simple text prompt...');
    const result = await model.generateContent("Say 'Hello, Gemini API is working!'");
    const response = await result.response;
    const text = response.text();
    
    console.log('✅ API test successful!');
    console.log('Response:', text);
    
    console.log('\n🎉 Your Gemini API key is working correctly!');
    console.log('You can now use real audio transcription in your app.');
    
  } catch (error) {
    console.log('❌ API test failed:');
    console.log('Error:', error.message);
    
    if (error.message.includes('429')) {
      console.log('\n💡 This is a rate limit error. Your API key is valid but you\'ve hit the usage limits.');
      console.log('Solutions:');
      console.log('1. Wait for quota reset (usually daily)');
      console.log('2. Upgrade to a paid plan');
      console.log('3. Create a new API key');
    } else if (error.message.includes('400') || error.message.includes('401')) {
      console.log('\n💡 This appears to be an authentication error.');
      console.log('Please check that your API key is correct.');
    }
  }
}

// Run the test
testGeminiAPI();
