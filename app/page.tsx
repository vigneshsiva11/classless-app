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
import { t } from "@/lib/i18n";
import { useLanguage, setStoredLanguage } from "@/hooks/use-language";

export default function HomePage() {
  const router = useRouter();
  const pathname = usePathname();
  const lang = useLanguage()

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
              <h1 className="text-2xl font-bold text-gray-900">{t(lang,'app_name')}</h1>
            </Link>
            <nav className="flex space-x-4 items-center">
              <Link href="/dashboard">
                <Button variant="outline">{t(lang,'navbar_dashboard','Dashboard')}</Button>
              </Link>
              <Link href="/auth/register/student">
                <Button
                  variant={pathname === "/ask" ? "default" : "outline"}
                  className={pathname === "/ask" ? "bg-black text-white" : ""}
                >
                  Ask Question
                </Button>
              </Link>
              <Link href="/quiz">
                <Button variant="outline">{t(lang,'navbar_quiz','Quiz')}</Button>
              </Link>
              <Link href="/career-guidance">
                <Button variant="outline">{t(lang,'navbar_career','Career Guidance')}</Button>
              </Link>
              <div className="relative">
                <select
                  aria-label="Language selector"
                  className="border rounded px-3 py-2 text-sm"
                  onChange={(e) => setStoredLanguage(e.target.value as any)}
                  defaultValue={typeof window !== 'undefined' ? (localStorage.getItem('classless_lang') || 'en') : 'en'}
                >
                  <option value="pa">Punjabi</option>
                  <option value="en">English</option>
                  <option value="hi">Hindi</option>
                  <option value="ta">Tamil</option>
                </select>
              </div>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            {t(lang,'hero_title1')}
            <span className="block text-blue-600">{t(lang,'hero_title2')}</span>
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            {t(lang,'hero_desc')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="w-full sm:w-auto"
              onClick={handleStartLearning}
            >
              {t(lang,'start_learning_now')}
            </Button>
            <Link href="/stations">
              <Button
                variant="outline"
                size="lg"
                className="w-full sm:w-auto bg-transparent"
              >
                {t(lang,'find_learning_station')}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Access Methods */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <h3 className="text-3xl font-bold text-center text-gray-900 mb-12">
            {t(lang,'ways_title')}
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="text-center">
              <CardHeader>
                <BookOpen className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <CardTitle>{t(lang,'web_mobile')}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>{t(lang,'web_mobile_desc')}</CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <MessageSquare className="h-12 w-12 text-green-600 mx-auto mb-4" />
                <CardTitle>{t(lang,'sms_mode')}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>{t(lang,'sms_mode_desc')}</CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <Phone className="h-12 w-12 text-purple-600 mx-auto mb-4" />
                <CardTitle>{t(lang,'voice_calls')}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>{t(lang,'voice_calls_desc')}</CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <MapPin className="h-12 w-12 text-orange-600 mx-auto mb-4" />
                <CardTitle>{t(lang,'community_stations')}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>{t(lang,'community_stations_desc')}</CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <h3 className="text-3xl font-bold text-center text-gray-900 mb-12">
            {t(lang,'features_title')}
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="flex items-start space-x-4">
              <div className="bg-blue-100 p-3 rounded-lg">
                <BookOpen className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">{t(lang,'feature_ai')}</h4>
                <p className="text-gray-600">{t(lang,'feature_ai_desc')}</p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="bg-green-100 p-3 rounded-lg">
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">{t(lang,'feature_teachers')}</h4>
                <p className="text-gray-600">{t(lang,'feature_teachers_desc')}</p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="bg-purple-100 p-3 rounded-lg">
                <Award className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">{t(lang,'feature_scholar')}</h4>
                <p className="text-gray-600">{t(lang,'feature_scholar_desc')}</p>
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
