// Test script for RAG enhancements
const testQuestions = [
  // Test query expansion
  {
    question: "What is Newton's law?",
    grade: 8,
    expectedBehavior:
      "Should expand to include 'Newton's three laws of motion' and find relevant physics content",
  },

  // Test partial answers
  {
    question: "Tell me about light refraction in daily life",
    grade: 10,
    expectedBehavior:
      "Should provide related information about refraction even if exact match not found",
  },

  // Test confidence-based answering
  {
    question: "What is the difference between speed and velocity?",
    grade: 8,
    expectedBehavior:
      "Should give confident answer from context with high confidence",
  },

  // Test out-of-syllabus handling
  {
    question: "Who invented the telephone?",
    grade: 8,
    expectedBehavior:
      "Should provide related information about communication technology",
  },

  // Test hybrid search
  {
    question: "How do plants make food?",
    grade: 6,
    expectedBehavior:
      "Should find photosynthesis content using both keyword and semantic search",
  },
];

async function testRAGEnhancements() {
  console.log("🧪 Testing RAG Enhancements...\n");

  for (const test of testQuestions) {
    console.log(`📝 Testing: "${test.question}" (Grade ${test.grade})`);
    console.log(`🎯 Expected: ${test.expectedBehavior}`);

    try {
      const response = await fetch("http://localhost:3000/api/ai/rag", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: test.question,
          grade: test.grade,
          language: "en",
          response_language: "en",
        }),
      });

      const result = await response.json();

      if (result.success) {
        console.log(`✅ Answer: ${result.data.answer.substring(0, 100)}...`);
        if (result.data.context && result.data.context.length > 0) {
          console.log(`📚 Context found: ${result.data.context.length} chunks`);
        }
      } else {
        console.log(`❌ Error: ${result.error}`);
      }
    } catch (error) {
      console.log(`❌ Request failed: ${error.message}`);
    }

    console.log("─".repeat(80));
  }
}

// Run tests if this script is executed directly
if (require.main === module) {
  testRAGEnhancements().catch(console.error);
}

module.exports = { testRAGEnhancements, testQuestions };
