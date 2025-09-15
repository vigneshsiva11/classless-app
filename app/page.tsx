"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  BookOpen,
  MessageSquare,
  Phone,
  Users,
  Award,
  MapPin,
} from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { getTollFreeNumber } from "@/lib/config";

export default function HomePage() {
  const router = useRouter();
  const pathname = usePathname();

  const handleStartLearning = () => {
    try {
      const userData =
        typeof window !== "undefined"
          ? localStorage.getItem("classless_user")
          : null;
      if (userData) {
        router.push("/dashboard");
      } else {
        router.push("/auth/login");
      }
    } catch {
      router.push("/auth/login");
    }
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link
              href="/"
              className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
            >
              <BookOpen className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">Classless</h1>
            </Link>
            <nav className="flex space-x-4">
              <Link href="/dashboard">
                <Button variant="outline">Dashboard</Button>
              </Link>
              <Link href="/ask">
                <Button
                  variant={pathname === "/ask" ? "default" : "outline"}
                  className={pathname === "/ask" ? "bg-black text-white" : ""}
                >
                  Ask Question
                </Button>
              </Link>
              <Link href="/quiz">
                <Button variant="outline">Quiz</Button>
              </Link>
              <Link href="/career-guidance">
                <Button variant="outline">Career Guidance</Button>
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Inclusive AI Tutor
            <span className="block text-blue-600">for All Students</span>
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Breaking barriers to education with multilingual AI tutoring
            accessible via web, SMS, voice calls, and community stations.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="w-full sm:w-auto"
              onClick={handleStartLearning}
            >
              Start Learning Now
            </Button>
            <Link href="/stations">
              <Button
                variant="outline"
                size="lg"
                className="w-full sm:w-auto bg-transparent"
              >
                Find Learning Station
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Access Methods */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <h3 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Multiple Ways to Learn
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="text-center">
              <CardHeader>
                <BookOpen className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <CardTitle>Web & Mobile</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Full-featured app with AI tutoring, OCR for handwritten
                  questions, and progress tracking.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <MessageSquare className="h-12 w-12 text-green-600 mx-auto mb-4" />
                <CardTitle>SMS Mode</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Ask questions via text message from any phone. Perfect for
                  feature phone users.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <Phone className="h-12 w-12 text-purple-600 mx-auto mb-4" />
                <CardTitle>Voice Calls</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Interactive voice response system for audio-based learning and
                  questions.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <MapPin className="h-12 w-12 text-orange-600 mx-auto mb-4" />
                <CardTitle>Community Stations</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Physical learning stations in communities for collaborative
                  learning.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <h3 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Powerful Features
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="flex items-start space-x-4">
              <div className="bg-blue-100 p-3 rounded-lg">
                <BookOpen className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">
                  AI-Powered Tutoring
                </h4>
                <p className="text-gray-600">
                  Advanced AI understands questions in multiple languages and
                  provides personalized explanations.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="bg-green-100 p-3 rounded-lg">
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">
                  Teacher Network
                </h4>
                <p className="text-gray-600">
                  Connect with qualified teachers for complex questions and
                  personalized guidance.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="bg-purple-100 p-3 rounded-lg">
                <Award className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">
                  Scholarship Alerts
                </h4>
                <p className="text-gray-600">
                  Get notified about relevant scholarships and government
                  schemes for education.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="flex items-center justify-center space-x-2 mb-4">
                <BookOpen className="h-6 w-6" />
                <span className="text-xl font-bold">Classless</span>
              </div>
              <p className="text-gray-400">
                Making quality education accessible to everyone, everywhere.
              </p>
            </div>
            <div>
              <h5 className="font-semibold mb-4">Access Methods</h5>
              <ul className="space-y-2 text-gray-400">
                <li>Web Application</li>
                <li>SMS: Text to {getTollFreeNumber("sms")}</li>
                <li>Call: {getTollFreeNumber("voice")}</li>
                <li>Community Stations</li>
              </ul>
            </div>

            <div>
              <h5 className="font-semibold mb-4">Support</h5>
              <ul className="space-y-2 text-gray-400">
                <li>Help Center</li>
                <li>Contact Us</li>
                <li>Privacy Policy</li>
                <li>Terms of Service</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Classless. Bridging the digital education divide.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
