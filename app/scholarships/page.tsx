"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Bell, Search, Filter, Calendar, MapPin, GraduationCap, IndianRupee } from "lucide-react"

interface Scholarship {
  id: string
  name: string
  provider: string
  amount: number
  category: string
  description: string
  eligibleStates: string[]
  minGrade: number
  maxGrade: number
  deadline: string
  requirements: string[]
  applicationUrl: string
}

export default function ScholarshipsPage() {
  const [scholarships, setScholarships] = useState<Scholarship[]>([])
  const [filteredScholarships, setFilteredScholarships] = useState<Scholarship[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("All Categories")
  const [stateFilter, setStateFilter] = useState("All States")
  const [gradeFilter, setGradeFilter] = useState("All Grades")

  useEffect(() => {
    fetchScholarships()
  }, [])

  useEffect(() => {
    filterScholarships()
  }, [scholarships, searchTerm, categoryFilter, stateFilter, gradeFilter])

  const fetchScholarships = async () => {
    try {
      const response = await fetch("/api/scholarships")
      const data = await response.json()
      setScholarships(data.scholarships || [])
    } catch (error) {
      console.error("Failed to fetch scholarships:", error)
    } finally {
      setLoading(false)
    }
  }

  const filterScholarships = () => {
    let filtered = scholarships

    if (searchTerm) {
      filtered = filtered.filter(
        (s) =>
          s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          s.provider.toLowerCase().includes(searchTerm.toLowerCase()) ||
          s.description.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (categoryFilter !== "All Categories") {
      filtered = filtered.filter((s) => s.category === categoryFilter)
    }

    if (stateFilter !== "All States") {
      filtered = filtered.filter((s) => s.eligibleStates.includes(stateFilter) || s.eligibleStates.includes("All"))
    }

    if (gradeFilter !== "All Grades") {
      const grade = Number.parseInt(gradeFilter)
      filtered = filtered.filter((s) => grade >= s.minGrade && grade <= s.maxGrade)
    }

    setFilteredScholarships(filtered)
  }

  const applyForScholarship = async (scholarshipId: string) => {
    const user = JSON.parse(localStorage.getItem("user") || "{}")

    try {
      const response = await fetch("/api/scholarships", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, scholarshipId }),
      })

      if (response.ok) {
        alert("Application submitted successfully!")
      }
    } catch (error) {
      console.error("Failed to apply:", error)
      alert("Failed to submit application")
    }
  }

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const isDeadlineNear = (deadline: string) => {
    const deadlineDate = new Date(deadline)
    const today = new Date()
    const diffTime = deadlineDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays <= 30 && diffDays > 0
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading scholarships...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <GraduationCap className="h-8 w-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900">Scholarships & Government Schemes</h1>
        </div>
        <p className="text-gray-600 text-lg">Discover financial aid opportunities to support your education journey</p>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filter Scholarships
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search scholarships..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All Categories">All Categories</SelectItem>
                <SelectItem value="Merit">Merit-based</SelectItem>
                <SelectItem value="Need">Need-based</SelectItem>
                <SelectItem value="Minority">Minority</SelectItem>
                <SelectItem value="SC/ST">SC/ST</SelectItem>
                <SelectItem value="OBC">OBC</SelectItem>
              </SelectContent>
            </Select>

            <Select value={stateFilter} onValueChange={setStateFilter}>
              <SelectTrigger>
                <SelectValue placeholder="State" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All States">All States</SelectItem>
                <SelectItem value="All">Pan India</SelectItem>
                <SelectItem value="Maharashtra">Maharashtra</SelectItem>
                <SelectItem value="Karnataka">Karnataka</SelectItem>
                <SelectItem value="Tamil Nadu">Tamil Nadu</SelectItem>
                <SelectItem value="Gujarat">Gujarat</SelectItem>
                <SelectItem value="Rajasthan">Rajasthan</SelectItem>
              </SelectContent>
            </Select>

            <Select value={gradeFilter} onValueChange={setGradeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Grade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All Grades">All Grades</SelectItem>
                <SelectItem value="6">Grade 6</SelectItem>
                <SelectItem value="7">Grade 7</SelectItem>
                <SelectItem value="8">Grade 8</SelectItem>
                <SelectItem value="9">Grade 9</SelectItem>
                <SelectItem value="10">Grade 10</SelectItem>
                <SelectItem value="11">Grade 11</SelectItem>
                <SelectItem value="12">Grade 12</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Scholarships Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredScholarships.map((scholarship) => (
          <Card key={scholarship.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <CardTitle className="text-xl mb-2">{scholarship.name}</CardTitle>
                  <CardDescription className="text-base">by {scholarship.provider}</CardDescription>
                </div>
                {isDeadlineNear(scholarship.deadline) && (
                  <Badge variant="destructive" className="ml-2">
                    <Bell className="h-3 w-3 mr-1" />
                    Deadline Soon
                  </Badge>
                )}
              </div>
            </CardHeader>

            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <IndianRupee className="h-4 w-4 text-green-600" />
                    <span className="font-semibold text-green-600">{formatAmount(scholarship.amount)}</span>
                  </div>
                  <Badge variant="secondary">{scholarship.category}</Badge>
                </div>

                <p className="text-gray-600 text-sm">{scholarship.description}</p>

                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    <span>{scholarship.eligibleStates.join(", ")}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <GraduationCap className="h-4 w-4" />
                    <span>
                      Grade {scholarship.minGrade}-{scholarship.maxGrade}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-red-500" />
                  <span className="text-red-600">Deadline: {new Date(scholarship.deadline).toLocaleDateString()}</span>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Requirements:</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {scholarship.requirements.slice(0, 3).map((req, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-blue-600 mt-1">•</span>
                        <span>{req}</span>
                      </li>
                    ))}
                    {scholarship.requirements.length > 3 && (
                      <li className="text-blue-600 text-xs">
                        +{scholarship.requirements.length - 3} more requirements
                      </li>
                    )}
                  </ul>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button onClick={() => applyForScholarship(scholarship.id)} className="flex-1">
                    Apply Now
                  </Button>
                  <Button variant="outline" onClick={() => window.open(scholarship.applicationUrl, "_blank")}>
                    Learn More
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredScholarships.length === 0 && (
        <div className="text-center py-12">
          <GraduationCap className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-gray-900 mb-2">No scholarships found</h3>
          <p className="text-gray-600">Try adjusting your filters or search terms to find relevant opportunities.</p>
        </div>
      )}
    </div>
  )
}
