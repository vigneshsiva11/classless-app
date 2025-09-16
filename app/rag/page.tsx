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
import { Loader2, Brain, ArrowLeft } from "lucide-react";

export default function RagTutorPage() {
  const router = useRouter();
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [languages, setLanguages] = useState<Record<string, string>>({
    en: "English",
    ta: "Tamil",
    hi: "Hindi",
    bn: "Bengali",
    te: "Telugu",
    mr: "Marathi",
    gu: "Gujarati",
    kn: "Kannada",
    ml: "Malayalam",
    pa: "Punjabi",
    ur: "Urdu",
    or: "Odia",
    as: "Assamese",
    sa: "Sanskrit",
  });
  const [lang, setLang] = useState("en");
  const [respLang, setRespLang] = useState("en");
  const [grade, setGrade] = useState<string>("");
  const suggested: Record<string, string[]> = {
    "6": [
      "What is photosynthesis?",
      "What are the three states of matter?",
      "How do you add fractions?",
      "Add 23 and 8",
    ],
    "8": [
      "What is motion?",
      "What is force?",
      "How do you multiply fractions?",
    ],
    "10": [
      "What is light?",
      "What is Ohm's law?",
      "What is a quadratic equation?",
    ],
    "12": [
      "What is angular momentum?",
      "What is the derivative of x^n?",
      "What are alkanes?",
    ],
  };

  useEffect(() => {
    try {
      const stored = localStorage.getItem("classless_user");
      if (!stored) {
        router.push("/auth/login");
        return;
      }
      const u = JSON.parse(stored);
      if (u.user_type !== "student") {
        router.push("/dashboard");
        return;
      }
      const pref = u.preferred_language || "en";
      setLang(pref);
      setRespLang(pref);
    } catch {}
  }, [router]);

  const askRag = async () => {
    if (!question.trim()) return;
    setIsLoading(true);
    setAnswer(null);
    try {
      const res = await fetch("/api/ai/rag", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question,
          language: lang,
          response_language: respLang,
          grade: grade ? Number(grade) : undefined,
        }),
      });
      const data = await res.json();
      if (data.success) setAnswer(data.data.answer);
      else setAnswer(data.error || "Failed to get RAG answer");
    } catch (e: any) {
      setAnswer(e?.message || "Failed to get RAG answer");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm" className="mr-4">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <div className="flex items-center space-x-2">
              <Brain className="h-6 w-6 text-indigo-600" />
              <h1 className="text-xl font-bold text-gray-900">RAG Tutor</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Ask syllabus-based questions</CardTitle>
            <CardDescription>
              RAG uses your syllabus notes as context. If the answer isn’t in
              the context, it says “I don’t know.”
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 mb-4">
              <div>
                <Label>Question Language</Label>
                <Select value={lang} onValueChange={setLang}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(languages).map(([code, name]) => (
                      <SelectItem key={code} value={code}>
                        {name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Select Your Standard</Label>
                <Select value={grade} onValueChange={setGrade}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose class (1-12)" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 12 }, (_, i) => String(i + 1)).map(
                      (g) => (
                        <SelectItem key={g} value={g}>
                          Class {g}
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Response Language</Label>
                <Select value={respLang} onValueChange={setRespLang}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(languages).map(([code, name]) => (
                      <SelectItem key={code} value={code}>
                        {name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="rag_q">Your Question</Label>
              <Textarea
                id="rag_q"
                placeholder="Ask a syllabus-based question..."
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                rows={5}
              />
            </div>

            {grade && suggested[grade] && (
              <div className="mt-3">
                <Label>Suggested for Class {grade}</Label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {suggested[grade].map((q) => (
                    <Button
                      key={q}
                      variant="outline"
                      size="sm"
                      onClick={() => setQuestion(q)}
                    >
                      {q}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end mt-4">
              <Button onClick={askRag} disabled={isLoading || !question.trim()}>
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Getting Answer...
                  </>
                ) : (
                  <>
                    <Brain className="h-4 w-4 mr-2" />
                    Ask RAG Tutor
                  </>
                )}
              </Button>
            </div>

            {answer && (
              <div className="mt-6">
                <Label>Answer</Label>
                <div className="mt-2 whitespace-pre-wrap text-gray-800 bg-white border rounded p-3">
                  {answer}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>What is RAG?</CardTitle>
            <CardDescription>
              Retrieval-Augmented Generation finds relevant syllabus context and
              uses it to answer your question.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ol className="list-decimal ml-5 space-y-1 text-sm text-gray-700">
              <li>
                Collect syllabus content and split into 200–400 word chunks
              </li>
              <li>
                Create embeddings for each chunk (Gemini or Sentence
                Transformers)
              </li>
              <li>
                Store text + embeddings in a vector database
                (Pinecone/Weaviate/Qdrant/FAISS)
              </li>
              <li>
                On question: embed query → retrieve top chunks → build RAG
                prompt
              </li>
              <li>Send prompt to Gemini → return answer</li>
              <li>
                In-syllabus → detailed answer; out-of-syllabus → “I don’t know.”
              </li>
            </ol>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
