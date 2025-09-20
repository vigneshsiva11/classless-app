// Test script for Enhanced OpenAI RAG implementation with Vector Database
const testQuestions = [
  // Test the enhanced flow with vector database
  {
    question: "What is Newton's law?",
    grade: 9,
    expectedBehavior:
      "Should use vector database to find relevant physics content and provide detailed explanation",
  },
  {
    question: "How do plants make food?",
    grade: 6,
    expectedBehavior:
      "Should find photosynthesis content from vector database and explain in simple terms",
  },
  {
    question: "What is calculus?",
    grade: 12,
    expectedBehavior:
      "Should retrieve advanced mathematics content and provide comprehensive explanation",
  },
  {
    question: "Explain the water cycle",
    grade: 5,
    expectedBehavior:
      "Should find environmental science content and explain the water cycle process",
  },
  {
    question: "What are integers?",
    grade: 6,
    expectedBehavior:
      "Should find mathematics content about integers and provide clear explanation",
  },
  {
    question: "How does photosynthesis work?",
    grade: 8,
    expectedBehavior:
      "Should find detailed biology content and explain the photosynthesis process",
  },
  {
    question: "What is the solar system?",
    grade: 3,
    expectedBehavior:
      "Should find astronomy content appropriate for grade 3 and explain planets",
  },
  {
    question: "Explain quadratic equations",
    grade: 10,
    expectedBehavior:
      "Should find advanced algebra content and explain quadratic equations with examples",
  },
];

async function testEnhancedRAG() {
  console.log(
    "🧪 Testing Enhanced OpenAI RAG Implementation with Vector Database...\n"
  );

  for (const test of testQuestions) {
    console.log(`📝 Testing: "${test.question}" (Grade ${test.grade})`);
    console.log(`🎯 Expected: ${test.expectedBehavior}`);

    try {
      const response = await fetch(
        "http://localhost:3000/api/ai/rag-openai-enhanced",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            question: test.question,
            grade: test.grade,
            language: "en",
          }),
        }
      );

      const result = await response.json();

      if (result.success) {
        console.log(`✅ Answer: ${result.data.answer.substring(0, 150)}...`);
        console.log(`🔍 Source: ${result.data.source || "unknown"}`);
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

        if (result.data.context && result.data.context.length > 0) {
          console.log(`📖 Retrieved Context (first result):`);
          const firstContext = result.data.context[0];
          console.log(`   ID: ${firstContext.id}`);
          console.log(
            `   Subject: ${firstContext.metadata?.subject} Grade ${firstContext.metadata?.grade}`
          );
          console.log(`   Chapter: ${firstContext.metadata?.chapter}`);
          console.log(`   Score: ${firstContext.score?.toFixed(3) || "N/A"}`);
          console.log(`   Text: ${firstContext.text}...`);
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

// Test content management API
async function testContentManagement() {
  console.log("🔧 Testing Content Management API...\n");

  try {
    // Test statistics
    console.log("📊 Testing content statistics...");
    const statsResponse = await fetch(
      "http://localhost:3000/api/content/management?action=stats"
    );
    const statsResult = await statsResponse.json();

    if (statsResult.success) {
      console.log("✅ Content Statistics:");
      console.log(
        `   Total content: ${statsResult.data.statistics.totalContent}`
      );
      console.log(
        `   Available subjects: ${statsResult.data.availableSubjects.join(
          ", "
        )}`
      );
      console.log(
        `   Available grades: ${statsResult.data.availableGrades.join(", ")}`
      );
    } else {
      console.log(`❌ Statistics error: ${statsResult.error}`);
    }

    // Test content search
    console.log("\n🔍 Testing content search...");
    const searchResponse = await fetch(
      "http://localhost:3000/api/content?query=photosynthesis&grade=6&topK=3"
    );
    const searchResult = await searchResponse.json();

    if (searchResult.success) {
      console.log(`✅ Search Results (${searchResult.data.count} found):`);
      searchResult.data.results.forEach((result, index) => {
        console.log(
          `   ${index + 1}. ${result.id} - ${result.metadata?.subject} Grade ${
            result.metadata?.grade
          }`
        );
        console.log(`      Chapter: ${result.metadata?.chapter}`);
        console.log(`      Text: ${result.text.substring(0, 100)}...`);
      });
    } else {
      console.log(`❌ Search error: ${searchResult.error}`);
    }

    // Test content suggestions
    console.log("\n💡 Testing content suggestions...");
    const suggestionsResponse = await fetch(
      "http://localhost:3000/api/content/management?action=suggestions&grade=6&subject=science"
    );
    const suggestionsResult = await suggestionsResponse.json();

    if (suggestionsResult.success) {
      console.log("✅ Content Suggestions:");
      console.log(
        `   Missing chapters: ${suggestionsResult.data.missingChapters.join(
          ", "
        )}`
      );
      console.log(
        `   Suggested topics: ${suggestionsResult.data.suggestedTopics.join(
          ", "
        )}`
      );
    } else {
      console.log(`❌ Suggestions error: ${suggestionsResult.error}`);
    }
  } catch (error) {
    console.log(`❌ Content management test failed: ${error.message}`);
  }
}

// Test health check
async function testHealthCheck() {
  console.log("🏥 Testing Enhanced RAG Health Check...\n");

  try {
    const response = await fetch(
      "http://localhost:3000/api/ai/rag-openai-enhanced"
    );
    const result = await response.json();

    if (result.success) {
      console.log("✅ Enhanced RAG Service is healthy");
      console.log(`📊 Statistics:`);
      console.log(`   Total content: ${result.data.statistics.totalContent}`);
      console.log(
        `   Grades covered: ${
          Object.keys(result.data.statistics.byGrade).length
        }`
      );
      console.log(
        `   Subjects covered: ${
          Object.keys(result.data.statistics.bySubject).length
        }`
      );
      console.log(`   Timestamp: ${result.data.timestamp}`);
    } else {
      console.log(`❌ Health check failed: ${result.error}`);
    }
  } catch (error) {
    console.log(`❌ Health check request failed: ${error.message}`);
  }
}

// Interactive test function
async function interactiveTest() {
  console.log("🎮 Interactive Enhanced RAG Test");
  console.log(
    "Enter questions to test the enhanced RAG system. Type 'quit' to exit.\n"
  );

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
          "http://localhost:3000/api/ai/rag-openai-enhanced",
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
            `\n📚 Retrieved ${result.data.retrievedCount} document chunks from ${result.data.source}`
          );

          if (result.data.context && result.data.context.length > 0) {
            console.log(`\n📖 Top Retrieved Document:`);
            const topDoc = result.data.context[0];
            console.log(
              `   Subject: ${topDoc.metadata?.subject} Grade ${topDoc.metadata?.grade}`
            );
            console.log(`   Chapter: ${topDoc.metadata?.chapter}`);
            console.log(`   Score: ${topDoc.score?.toFixed(3)}`);
            console.log(`   Text: ${topDoc.text}...`);
          }
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
  } else if (args.includes("--content-management") || args.includes("-c")) {
    testContentManagement().catch(console.error);
  } else if (args.includes("--health") || args.includes("-h")) {
    testHealthCheck().catch(console.error);
  } else {
    // Run all tests
    Promise.all([
      testHealthCheck(),
      testContentManagement(),
      testEnhancedRAG(),
    ]).catch(console.error);
  }
}

module.exports = {
  testEnhancedRAG,
  testContentManagement,
  testHealthCheck,
  interactiveTest,
  testQuestions,
};
