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
  Menu,
  X,
} from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { getTollFreeNumber } from "@/lib/config";
import { t } from "@/lib/i18n";
import { useLanguage, setStoredLanguage } from "@/hooks/use-language";
import { useEffect, useState } from "react";

export default function HomePage() {
  const router = useRouter();
  const pathname = usePathname();
  const lang = useLanguage();
  const [refreshKey, setRefreshKey] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    setRefreshKey(prev => prev + 1);
  }, [lang]);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

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
    <div key={refreshKey} className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 overflow-x-hidden">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link
              href="/"
              className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
            >
              <BookOpen className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
              <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">{t(lang,'app_name')}</h1>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex space-x-2 xl:space-x-4 items-center">
              <Link href="/dashboard">
                <Button variant="outline" size="sm" className="text-xs xl:text-sm">
                  {t(lang,'navbar_dashboard','Dashboard')}
                </Button>
              </Link>
              <Link href="/auth/register/student">
                <Button
                  variant={pathname === "/ask" ? "default" : "outline"}
                  size="sm"
                  className={`text-xs xl:text-sm ${pathname === "/ask" ? "bg-black text-white" : ""}`}
                >
                  {t(lang,'navbar_ask','Ask Question')}
                </Button>
              </Link>
              <Link href="/quiz">
                <Button variant="outline" size="sm" className="text-xs xl:text-sm">
                  {t(lang,'navbar_quiz','Quiz')}
                </Button>
              </Link>
              <Link href="/career-guidance">
                <Button variant="outline" size="sm" className="text-xs xl:text-sm">
                  {t(lang,'navbar_career','Career Guidance')}
                </Button>
              </Link>
              <div className="relative">
                <select
                  aria-label="Language selector"
                  className="border rounded px-2 py-1.5 text-xs xl:text-sm"
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

            {/* Mobile Menu Button */}
            <div className="flex items-center space-x-2 lg:hidden">
              <div className="relative">
                <select
                  aria-label="Language selector"
                  className="border rounded px-2 py-1.5 text-xs"
                  onChange={(e) => setStoredLanguage(e.target.value as any)}
                  defaultValue={typeof window !== 'undefined' ? (localStorage.getItem('classless_lang') || 'en') : 'en'}
                >
                  <option value="pa">PA</option>
                  <option value="en">EN</option>
                  <option value="hi">HI</option>
                  <option value="ta">TA</option>
                </select>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleMobileMenu}
                className="h-10 w-10"
                aria-label="Toggle mobile menu"
              >
                {isMobileMenuOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </Button>
            </div>
          </div>

          {/* Mobile Navigation Menu */}
          {isMobileMenuOpen && (
            <div className="lg:hidden border-t bg-white">
              <div className="px-2 pt-2 pb-3 space-y-1">
                <Link
                  href="/dashboard"
                  className="block px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-100 rounded-md"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {t(lang,'navbar_dashboard','Dashboard')}
                </Link>
                <Link
                  href="/auth/register/student"
                  className="block px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-100 rounded-md"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {t(lang,'navbar_ask','Ask Question')}
                </Link>
                <Link
                  href="/quiz"
                  className="block px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-100 rounded-md"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {t(lang,'navbar_quiz','Quiz')}
                </Link>
                <Link
                  href="/career-guidance"
                  className="block px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-100 rounded-md"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {t(lang,'navbar_career','Career Guidance')}
                </Link>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 sm:mb-6 leading-tight">
            {t(lang,'hero_title1')}
            <span className="block text-blue-600 mt-2">{t(lang,'hero_title2')}</span>
          </h2>
          <p className="text-base sm:text-lg lg:text-xl text-gray-600 mb-6 sm:mb-8 max-w-2xl mx-auto leading-relaxed px-2">
            {t(lang,'hero_desc')}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center max-w-md sm:max-w-none mx-auto">
            <Button
              size="lg"
              className="w-full sm:w-auto min-h-[44px] text-sm sm:text-base font-semibold"
              onClick={handleStartLearning}
            >
              {t(lang,'start_learning_now')}
            </Button>
            <Link href="/stations" className="w-full sm:w-auto">
              <Button
                variant="outline"
                size="lg"
                className="w-full sm:w-auto bg-transparent min-h-[44px] text-sm sm:text-base font-semibold"
              >
                {t(lang,'find_learning_station')}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Access Methods */}
      <section className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-center text-gray-900 mb-8 sm:mb-12">
            {t(lang,'ways_title')}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <Card className="text-center hover:shadow-lg transition-shadow duration-300">
              <CardHeader className="pb-4">
                <BookOpen className="h-10 w-10 sm:h-12 sm:w-12 text-blue-600 mx-auto mb-3 sm:mb-4" />
                <CardTitle className="text-lg sm:text-xl">{t(lang,'web_mobile')}</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <CardDescription className="text-sm sm:text-base leading-relaxed">
                  {t(lang,'web_mobile_desc')}
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow duration-300">
              <CardHeader className="pb-4">
                <MessageSquare className="h-10 w-10 sm:h-12 sm:w-12 text-green-600 mx-auto mb-3 sm:mb-4" />
                <CardTitle className="text-lg sm:text-xl">{t(lang,'sms_mode')}</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <CardDescription className="text-sm sm:text-base leading-relaxed">
                  {t(lang,'sms_mode_desc')}
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow duration-300">
              <CardHeader className="pb-4">
                <Phone className="h-10 w-10 sm:h-12 sm:w-12 text-purple-600 mx-auto mb-3 sm:mb-4" />
                <CardTitle className="text-lg sm:text-xl">{t(lang,'voice_calls')}</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <CardDescription className="text-sm sm:text-base leading-relaxed">
                  {t(lang,'voice_calls_desc')}
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow duration-300">
              <CardHeader className="pb-4">
                <MapPin className="h-10 w-10 sm:h-12 sm:w-12 text-orange-600 mx-auto mb-3 sm:mb-4" />
                <CardTitle className="text-lg sm:text-xl">{t(lang,'community_stations')}</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <CardDescription className="text-sm sm:text-base leading-relaxed">
                  {t(lang,'community_stations_desc')}
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-center text-gray-900 mb-8 sm:mb-12">
            {t(lang,'features_title')}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            <div className="flex items-start space-x-3 sm:space-x-4 p-4 sm:p-0">
              <div className="bg-blue-100 p-2 sm:p-3 rounded-lg flex-shrink-0">
                <BookOpen className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
              </div>
              <div className="min-w-0">
                <h4 className="font-semibold text-gray-900 mb-2 text-base sm:text-lg">{t(lang,'feature_ai')}</h4>
                <p className="text-gray-600 text-sm sm:text-base leading-relaxed">{t(lang,'feature_ai_desc')}</p>
              </div>
            </div>

            <div className="flex items-start space-x-3 sm:space-x-4 p-4 sm:p-0">
              <div className="bg-green-100 p-2 sm:p-3 rounded-lg flex-shrink-0">
                <Users className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
              </div>
              <div className="min-w-0">
                <h4 className="font-semibold text-gray-900 mb-2 text-base sm:text-lg">{t(lang,'feature_teachers')}</h4>
                <p className="text-gray-600 text-sm sm:text-base leading-relaxed">{t(lang,'feature_teachers_desc')}</p>
              </div>
            </div>

            <div className="flex items-start space-x-3 sm:space-x-4 p-4 sm:p-0 md:col-span-2 lg:col-span-1">
              <div className="bg-purple-100 p-2 sm:p-3 rounded-lg flex-shrink-0">
                <Award className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" />
              </div>
              <div className="min-w-0">
                <h4 className="font-semibold text-gray-900 mb-2 text-base sm:text-lg">{t(lang,'feature_scholar')}</h4>
                <p className="text-gray-600 text-sm sm:text-base leading-relaxed">{t(lang,'feature_scholar_desc')}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 sm:py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 text-center sm:text-left">
            <div className="sm:col-span-2 lg:col-span-1">
              <div className="flex items-center justify-center sm:justify-start space-x-2 mb-4">
                <BookOpen className="h-5 w-5 sm:h-6 sm:w-6" />
                <span className="text-lg sm:text-xl font-bold">{t(lang,'app_name','Classless')}</span>
              </div>
              <p className="text-gray-400 text-sm sm:text-base leading-relaxed">
                {t(lang,'footer_tagline','Making quality education accessible to everyone, everywhere.')}
              </p>
            </div>
            <div>
              <h5 className="font-semibold mb-3 sm:mb-4 text-base sm:text-lg">{t(lang,'footer_access_methods','Access Methods')}</h5>
              <ul className="space-y-2 text-gray-400 text-sm sm:text-base">
                <li>{t(lang,'footer_web_app','Web Application')}</li>
                <li className="break-words">{t(lang,'footer_sms_text','SMS: Text to')} {getTollFreeNumber("sms")}</li>
                <li className="break-words">{t(lang,'footer_call_text','Call:')} {getTollFreeNumber("voice")}</li>
                <li>{t(lang,'footer_community_stations','Community Stations')}</li>
              </ul>
            </div>

            <div>
              <h5 className="font-semibold mb-3 sm:mb-4 text-base sm:text-lg">{t(lang,'footer_support','Support')}</h5>
              <ul className="space-y-2 text-gray-400 text-sm sm:text-base">
                <li>{t(lang,'footer_help_center','Help Center')}</li>
                <li>{t(lang,'footer_contact_us','Contact Us')}</li>
                <li>{t(lang,'footer_privacy_policy','Privacy Policy')}</li>
                <li>{t(lang,'footer_terms_of_service','Terms of Service')}</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-6 sm:mt-8 pt-6 sm:pt-8 text-center text-gray-400">
            <p className="text-xs sm:text-sm">&copy; 2024 {t(lang,'app_name','Classless')}. {t(lang,'footer_copyright','Bridging the digital education divide.')}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
