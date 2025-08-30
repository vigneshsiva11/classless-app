// Test script to verify hash uniqueness
function testHashUniqueness() {
  console.log('Testing hash uniqueness...\n');
  
  const results = new Set();
  const duplicates = [];
  
  for (let i = 0; i < 100; i++) {
    const fileSize = 50000 + Math.floor(Math.random() * 10000);
    const timestampValue = Date.now() + i;
    const randomSeed = Math.random() * 1000;
    
    // Use the same hash calculation as in the API
    const combinedHash = Math.abs((fileSize * 31 + timestampValue * 17 + randomSeed * 13) % 100000);
    
    if (results.has(combinedHash)) {
      duplicates.push({
        iteration: i,
        fileSize,
        timestampValue,
        randomSeed,
        hash: combinedHash
      });
    } else {
      results.add(combinedHash);
    }
  }
  
  console.log(`Generated ${results.size} unique hashes out of 100 attempts`);
  console.log(`Duplicate hashes: ${duplicates.length}`);
  
  if (duplicates.length > 0) {
    console.log('\nDuplicate examples:');
    duplicates.slice(0, 3).forEach(dup => {
      console.log(`  Hash: ${dup.hash}, Iteration: ${dup.iteration}`);
    });
  }
  
  // Test variation selection
  console.log('\nTesting variation selection...');
  const variations = [
    "What is the capital of France?",
    "What is the capital of France? Please explain in detail.",
    "I have a question: What is the capital of France?",
    "Can you help me understand: What is the capital of France?",
    "I'm curious about: What is the capital of France?",
    "Could you tell me more about: What is the capital of France?",
    "I'd like to learn about: What is the capital of France?",
    "Please explain: What is the capital of France?",
    "What can you tell me about: What is the capital of France?",
    "I need help with: What is the capital of France?"
  ];
  
  const variationResults = new Set();
  
  for (let i = 0; i < 50; i++) {
    const fileSize = 50000 + Math.floor(Math.random() * 10000);
    const timestampValue = Date.now() + i;
    const randomSeed = Math.random() * 1000;
    
    const combinedHash = Math.abs((fileSize * 31 + timestampValue * 17 + randomSeed * 13) % 100000);
    const variationIndex = Math.floor(combinedHash % variations.length);
    const selectedVariation = variations[variationIndex];
    
    variationResults.add(selectedVariation);
  }
  
  console.log(`Generated ${variationResults.size} unique variations out of 50 attempts`);
  console.log('Variations used:', Array.from(variationResults));
}

// Run the test
testHashUniqueness();
