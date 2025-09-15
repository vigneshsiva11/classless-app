"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BookOpen,
  Briefcase,
  GraduationCap,
  Target,
  Users,
  TrendingUp,
  MapPin,
  ArrowRight,
  Lightbulb,
  Star,
} from "lucide-react";

export default function CareerGuidancePage() {
  const [selectedInterest, setSelectedInterest] = useState<string>("");
  const [selectedEducation, setSelectedEducation] = useState<string>("");
  const pathname = usePathname();

  const interests = [
    {
      id: "technology",
      name: "Technology & IT",
      icon: "💻",
      color: "bg-blue-100 text-blue-800",
    },
    {
      id: "healthcare",
      name: "Healthcare",
      icon: "🏥",
      color: "bg-green-100 text-green-800",
    },
    {
      id: "business",
      name: "Business & Finance",
      icon: "💼",
      color: "bg-purple-100 text-purple-800",
    },
    {
      id: "arts",
      name: "Arts & Design",
      icon: "🎨",
      color: "bg-pink-100 text-pink-800",
    },
    {
      id: "engineering",
      name: "Engineering",
      icon: "⚙️",
      color: "bg-orange-100 text-orange-800",
    },
    {
      id: "education",
      name: "Education",
      icon: "📚",
      color: "bg-indigo-100 text-indigo-800",
    },
  ];

  const educationLevels = [
    {
      id: "high-school",
      name: "High School",
      color: "bg-green-100 text-green-800",
    },
    { id: "diploma", name: "Diploma", color: "bg-blue-100 text-blue-800" },
    {
      id: "bachelor",
      name: "Bachelor's Degree",
      color: "bg-purple-100 text-purple-800",
    },
    {
      id: "master",
      name: "Master's Degree",
      color: "bg-orange-100 text-orange-800",
    },
    { id: "phd", name: "PhD", color: "bg-red-100 text-red-800" },
  ];

  const careerServices = [
    {
      id: "assessment",
      name: "Career Assessment",
      description:
        "Take our comprehensive career assessment to discover your strengths and interests",
      icon: Target,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      id: "counseling",
      name: "Career Counseling",
      description: "One-on-one sessions with experienced career counselors",
      icon: Users,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      id: "pathways",
      name: "Career Pathways",
      description:
        "Explore different career paths and educational requirements",
      icon: MapPin,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      id: "market",
      name: "Job Market Analysis",
      description:
        "Stay updated with current job market trends and opportunities",
      icon: TrendingUp,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
  ];

  const trendingCareers = [
    {
      name: "Data Scientist",
      growth: "+31%",
      salary: "$120,000",
      education: "Bachelor's+",
      icon: "📊",
    },
    {
      name: "AI Engineer",
      growth: "+28%",
      salary: "$130,000",
      education: "Bachelor's+",
      icon: "🤖",
    },
    {
      name: "Cybersecurity Analyst",
      growth: "+25%",
      salary: "$95,000",
      education: "Bachelor's+",
      icon: "🔒",
    },
    {
      name: "Digital Marketing",
      growth: "+22%",
      salary: "$65,000",
      education: "High School+",
      icon: "📱",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100">
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
                <Button>Career Guidance</Button>
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Career Guidance & Planning
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Discover your potential, explore career paths, and plan your future
            with expert guidance
          </p>
        </div>

        {/* Interest Selection */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Lightbulb className="h-5 w-5 text-yellow-600" />
              <span>What Interests You?</span>
            </CardTitle>
            <CardDescription>
              Select areas that spark your curiosity and passion
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {interests.map((interest) => (
                <button
                  key={interest.id}
                  onClick={() => setSelectedInterest(interest.id)}
                  className={`p-4 rounded-lg border-2 transition-all hover:scale-105 ${
                    selectedInterest === interest.id
                      ? "border-green-500 bg-green-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="text-3xl mb-2">{interest.icon}</div>
                  <div className="text-sm font-medium text-gray-900">
                    {interest.name}
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Education Level Selection */}
        {selectedInterest && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <GraduationCap className="h-5 w-5 text-blue-600" />
                <span>Your Education Level</span>
              </CardTitle>
              <CardDescription>
                Select your current or target education level
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                {educationLevels.map((level) => (
                  <button
                    key={level.id}
                    onClick={() => setSelectedEducation(level.id)}
                    className={`p-4 rounded-lg border-2 transition-all hover:scale-105 ${
                      selectedEducation === level.id
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="text-center">
                      <div className="text-sm font-medium text-gray-900 mb-1">
                        {level.name}
                      </div>
                      <Badge className={level.color}>{level.id}</Badge>
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Career Services */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {careerServices.map((service) => (
            <Card
              key={service.id}
              className="hover:shadow-lg transition-shadow cursor-pointer"
            >
              <CardHeader>
                <div className={`p-3 rounded-lg ${service.bgColor} w-fit mb-3`}>
                  <service.icon className={`h-6 w-6 ${service.color}`} />
                </div>
                <CardTitle className="text-lg">{service.name}</CardTitle>
                <CardDescription>{service.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" variant="outline">
                  Get Started
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Trending Careers */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              <span>Trending Careers in 2024</span>
            </CardTitle>
            <CardDescription>
              High-growth career opportunities with promising futures
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {trendingCareers.map((career, index) => (
                <div
                  key={index}
                  className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="text-2xl">{career.icon}</div>
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        {career.name}
                      </h4>
                      <Badge variant="secondary" className="text-xs">
                        {career.growth}
                      </Badge>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex justify-between">
                      <span>Salary:</span>
                      <span className="font-medium text-green-600">
                        {career.salary}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Education:</span>
                      <span className="font-medium">{career.education}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="bg-green-100 p-3 rounded-lg">
                  <Briefcase className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">0</div>
                  <div className="text-sm text-gray-600">
                    Career Assessments
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="bg-blue-100 p-3 rounded-lg">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">0</div>
                  <div className="text-sm text-gray-600">
                    Counseling Sessions
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="bg-purple-100 p-3 rounded-lg">
                  <Star className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">0</div>
                  <div className="text-sm text-gray-600">
                    Career Paths Explored
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Call to Action */}
        {selectedInterest && selectedEducation && (
          <Card className="text-center bg-gradient-to-r from-green-500 to-blue-600 text-white">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold mb-4">
                Ready to Plan Your Career?
              </h3>
              <p className="text-green-100 mb-6">
                You've shown interest in{" "}
                {interests.find((i) => i.id === selectedInterest)?.name} with{" "}
                {educationLevels.find((e) => e.id === selectedEducation)?.name}{" "}
                education
              </p>
              <Button
                size="lg"
                className="bg-white text-green-600 hover:bg-gray-100"
              >
                Start Career Assessment
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Additional Resources */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BookOpen className="h-5 w-5 text-purple-600" />
              <span>Additional Resources</span>
            </CardTitle>
            <CardDescription>
              Explore more tools and resources for your career development
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900">
                  Learning Resources
                </h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Online courses and certifications</li>
                  <li>• Industry-specific training programs</li>
                  <li>• Skill development workshops</li>
                  <li>• Mentorship opportunities</li>
                </ul>
              </div>
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900">Career Tools</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Resume builder and templates</li>
                  <li>• Interview preparation guides</li>
                  <li>• Salary negotiation tips</li>
                  <li>• Networking strategies</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
