"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function OpenAIRagTutorPage() {
  const router = useRouter();
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [grade, setGrade] = useState<string>("");
  const [expandedQueries, setExpandedQueries] = useState<string[]>([]);
  const [retrievedDocs, setRetrievedDocs] = useState<any[]>([]);

  const suggested: Record<string, string[]> = {
    "6": [
      "What is photosynthesis?",
      "How do plants make food?",
      "What are the three states of matter?",
    ],
    "8": [
      "What is Newton's law?",
      "What is the difference between speed and velocity?",
      "How do you multiply fractions?",
    ],
    "9": [
      "Explain Newton's three laws of motion",
      "What is algebra?",
      "How do you solve quadratic equations?",
    ],
    "10": [
      "What is Ohm's law?",
      "How does light work?",
      "What is a quadratic equation?",
    ],
    "12": [
      "What is calculus?",
      "What is angular momentum?",
      "What are derivatives?",
    ],
  };

  const handleSubmit = async () => {
    if (!question.trim()) return;

    setIsLoading(true);
    setAnswer(null);
    setExpandedQueries([]);
    setRetrievedDocs([]);

    try {
      const response = await fetch("/api/ai/rag-openai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: question.trim(),
          grade: grade ? parseInt(grade) : undefined,
          language: "en",
        }),
      });

      const result = await response.json();

      if (result.success) {
        setAnswer(result.data.answer);
        setExpandedQueries(result.data.expandedQueries || []);
        setRetrievedDocs(result.data.context || []);
      } else {
        setAnswer(`Error: ${result.error}`);
      }
    } catch (error) {
      setAnswer(
        `Error: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuestion(suggestion);
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">OpenAI RAG Tutor</h1>
        <p className="text-gray-600">
          Ask questions and get AI-powered answers using OpenAI with
          retrieval-augmented generation.
        </p>
        <Link href="/rag" className="text-blue-600 hover:underline">
          ← Back to Gemini RAG Tutor
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Ask a Question</CardTitle>
            <CardDescription>
              Enter your question and select your grade level for personalized
              answers.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="grade">Grade Level</Label>
              <Select value={grade} onValueChange={setGrade}>
                <SelectTrigger>
                  <SelectValue placeholder="Select grade (optional)" />
                </SelectTrigger>
                <SelectContent>
                  {Object.keys(suggested).map((g) => (
                    <SelectItem key={g} value={g}>
                      Class {g}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="question">Your Question</Label>
              <Textarea
                id="question"
                placeholder="What is Newton's law?"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                rows={3}
              />
            </div>

            <Button
              onClick={handleSubmit}
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? "Thinking..." : "Ask Question"}
            </Button>

            {grade && suggested[grade] && (
              <div>
                <Label className="text-sm font-medium">
                  Suggested Questions
                </Label>
                <div className="mt-2 space-y-1">
                  {suggested[grade].map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="block w-full text-left p-2 text-sm text-blue-600 hover:bg-blue-50 rounded border border-blue-200"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Answer</CardTitle>
            <CardDescription>
              AI-generated answer based on retrieved educational content.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading && (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                <span>Processing your question...</span>
              </div>
            )}

            {answer && (
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="whitespace-pre-wrap">{answer}</p>
                </div>

                {expandedQueries.length > 1 && (
                  <div>
                    <h4 className="font-medium mb-2">Query Expansions:</h4>
                    <ul className="space-y-1">
                      {expandedQueries.map((query, index) => (
                        <li key={index} className="text-sm text-gray-600">
                          {index + 1}. {query}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {retrievedDocs.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">
                      Retrieved Documents ({retrievedDocs.length}):
                    </h4>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {retrievedDocs.map((doc, index) => (
                        <div
                          key={index}
                          className="p-2 bg-blue-50 rounded text-xs"
                        >
                          <div className="font-medium">
                            {doc.metadata?.subject} - Class{" "}
                            {doc.metadata?.grade}
                          </div>
                          <div className="text-gray-600">{doc.text}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>OpenAI RAG Flow</CardTitle>
          <CardDescription>
            How the OpenAI RAG system processes your questions.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ol className="list-decimal ml-5 space-y-2 text-sm text-gray-700">
            <li>
              <strong>Query Expansion:</strong> Your question is expanded into
              multiple variations to improve retrieval accuracy.
            </li>
            <li>
              <strong>Document Retrieval:</strong> The system searches the
              knowledge base using embeddings to find relevant educational
              content.
            </li>
            <li>
              <strong>Context Construction:</strong> Retrieved documents are
              combined with your question to create a comprehensive prompt.
            </li>
            <li>
              <strong>OpenAI Generation:</strong> GPT-4o-mini generates a
              natural language answer that references the retrieved content.
            </li>
            <li>
              <strong>Response Delivery:</strong> You receive an accurate,
              context-aware answer with information about the retrieval process.
            </li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}
