// Test script for OpenAI RAG implementation
const testQuestions = [
  // Test the exact flow from the specification
  {
    question: "What is Newton's law?",
    grade: 9,
    expectedBehavior:
      "Should expand to 'Explain Newton's three laws of motion for Class 9 Physics' and find relevant content",
  },

  // Test query expansion
  {
    question: "How do plants make food?",
    grade: 6,
    expectedBehavior:
      "Should expand to include photosynthesis concepts and find relevant content",
  },

  // Test document retrieval
  {
    question: "What is the difference between speed and velocity?",
    grade: 8,
    expectedBehavior:
      "Should retrieve motion-related documents and provide accurate answer",
  },

  // Test grade-specific content
  {
    question: "What is calculus?",
    grade: 12,
    expectedBehavior:
      "Should find Class 12 calculus content and provide appropriate explanation",
  },

  // Test out-of-syllabus handling
  {
    question: "What is quantum physics?",
    grade: 8,
    expectedBehavior: "Should handle gracefully and provide helpful response",
  },
];

async function testOpenAIRAG() {
  console.log("🧪 Testing OpenAI RAG Implementation...\n");

  for (const test of testQuestions) {
    console.log(`📝 Testing: "${test.question}" (Grade ${test.grade})`);
    console.log(`🎯 Expected: ${test.expectedBehavior}`);

    try {
      const response = await fetch("http://localhost:3000/api/ai/rag-openai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: test.question,
          grade: test.grade,
          language: "en",
        }),
      });

      const result = await response.json();

      if (result.success) {
        console.log(`✅ Answer: ${result.data.answer.substring(0, 150)}...`);
        console.log(
          `🔍 Expanded Queries: ${
            result.data.expandedQueries?.length || 0
          } variations`
        );
        console.log(
          `📚 Retrieved Documents: ${result.data.retrievedCount || 0} chunks`
        );

        if (
          result.data.expandedQueries &&
          result.data.expandedQueries.length > 1
        ) {
          console.log(`📝 Query Expansions:`);
          result.data.expandedQueries.forEach((query, index) => {
            console.log(`   ${index + 1}. ${query}`);
          });
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

// Interactive test function
async function interactiveTest() {
  console.log("🎮 Interactive OpenAI RAG Test");
  console.log("Enter questions to test the RAG system. Type 'quit' to exit.\n");

  const readline = require("readline");
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const askQuestion = () => {
    rl.question('Enter your question (or "quit"): ', async (input) => {
      if (input.toLowerCase() === "quit") {
        rl.close();
        return;
      }

      const grade = await new Promise((resolve) => {
        rl.question(
          "Enter grade (1-12, or press Enter for no grade): ",
          (gradeInput) => {
            resolve(gradeInput ? parseInt(gradeInput) : undefined);
          }
        );
      });

      try {
        console.log(`\n🔍 Processing: "${input}" (Grade: ${grade || "Any"})`);

        const response = await fetch(
          "http://localhost:3000/api/ai/rag-openai",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              question: input,
              grade: grade,
              language: "en",
            }),
          }
        );

        const result = await response.json();

        if (result.success) {
          console.log(`\n✅ Answer:`);
          console.log(result.data.answer);

          if (
            result.data.expandedQueries &&
            result.data.expandedQueries.length > 1
          ) {
            console.log(`\n🔍 Query Expansions:`);
            result.data.expandedQueries.forEach((query, index) => {
              console.log(`   ${index + 1}. ${query}`);
            });
          }

          console.log(
            `\n📚 Retrieved ${result.data.retrievedCount} document chunks`
          );
        } else {
          console.log(`❌ Error: ${result.error}`);
        }
      } catch (error) {
        console.log(`❌ Request failed: ${error.message}`);
      }

      console.log("\n" + "─".repeat(80) + "\n");
      askQuestion();
    });
  };

  askQuestion();
}

// Run tests if this script is executed directly
if (require.main === module) {
  const args = process.argv.slice(2);

  if (args.includes("--interactive") || args.includes("-i")) {
    interactiveTest().catch(console.error);
  } else {
    testOpenAIRAG().catch(console.error);
  }
}

module.exports = { testOpenAIRAG, interactiveTest, testQuestions };
