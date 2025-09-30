"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useEffect, useMemo, useState } from "react"
import { useProfile } from "@/lib/contexts/ProfileContext"
import { useGHLCoursesService, type GHLCourse } from "@/lib/services/ghlCoursesService"
import { Book, Loader2, Search, Calendar } from "lucide-react"

export default function CoursesPage() {
  const { profile, loading: profileLoading } = useProfile()
  const coursesService = useGHLCoursesService(
    profile?.ghl_pit_token,
    profile?.ghl_location_id
  )

  const [courses, setCourses] = useState<GHLCourse[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 6

  const filteredCourses = useMemo(() => {
    const term = searchTerm.trim().toLowerCase()
    if (!term) return courses
    return courses.filter(c =>
      (c.name || "").toLowerCase().includes(term) ||
      (c.description || "").toLowerCase().includes(term) ||
      (c.category || "").toLowerCase().includes(term)
    )
  }, [courses, searchTerm])

  const totalPages = Math.ceil(filteredCourses.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentItems = filteredCourses.slice(startIndex, endIndex)

  const fetchCourses = async () => {
    if (!coursesService) return
    setLoading(true)
    try {
      const data = await coursesService.listCourses({ limit: 100 })
      setCourses(data.courses || [])
      setCurrentPage(1)
    } catch (e) {
      console.error("Failed to fetch courses", e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (coursesService && !profileLoading) {
      fetchCourses()
    }
  }, [coursesService, profileLoading])

  useEffect(() => {
    const id = setTimeout(() => setCurrentPage(1), 300)
    return () => clearTimeout(id)
  }, [searchTerm])

  if (profileLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading profile...</span>
      </div>
    )
  }

  if (!profile?.ghl_pit_token || !profile?.ghl_location_id) {
    return (
      <div className="flex items-center justify-center h-96">
        <Card className="p-6">
          <CardHeader className="text-center">
            <CardTitle>GoHighLevel Not Connected</CardTitle>
          </CardHeader>
          <CardContent className="text-center text-muted-foreground">
            <p>Please connect your GoHighLevel account to view courses.</p>
            <p>Go to Settings to configure your GHL token and location ID.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const formatDate = (d?: string) => {
    if (!d) return ""
    try { return new Date(d).toLocaleDateString() } catch { return "" }
  }

  return (
    <>
      <div className="p-6 border-b">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Courses</p>
                  <p className="text-2xl font-bold">{courses.length}</p>
                </div>
                <Book className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Categories</p>
                  <p className="text-2xl font-bold">{Array.from(new Set(courses.map(c => c.category).filter(Boolean))).length}</p>
                </div>
                <Badge>Courses</Badge>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Recently Updated</p>
                  <p className="text-2xl font-bold">{courses.filter(c => !!c.updatedAt).slice(0, 10).length}</p>
                </div>
                <Calendar className="h-8 w-8 text-chart-4" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="flex-1 p-6 overflow-auto">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Courses</CardTitle>
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search courses..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8 w-64"
                  />
                </div>
                <Button variant="outline" size="sm" onClick={fetchCourses} disabled={loading}>
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Refresh"}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin" />
                <span className="ml-2">Loading courses...</span>
              </div>
            ) : currentItems.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Book className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No courses found</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {currentItems.map((course) => (
                  <div key={course.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                    <div className="flex items-start justify-between">
                      <h3 className="font-semibold leading-tight mr-2">{course.name}</h3>
                      {course.category && <Badge variant="secondary">{course.category}</Badge>}
                    </div>
                    {course.thumbnailUrl && (
                      <div className="mt-3">
                        <img src={course.thumbnailUrl} alt={course.name || "Course"} className="w-full h-32 object-cover rounded" />
                      </div>
                    )}
                    {course.description && (
                      <p className="text-sm text-muted-foreground mt-3 line-clamp-3">{course.description}</p>
                    )}
                    <div className="text-xs text-muted-foreground mt-3">
                      {course.updatedAt ? `Updated ${formatDate(course.updatedAt)}` : course.createdAt ? `Created ${formatDate(course.createdAt)}` : null}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {filteredCourses.length > 0 && (
              <div className="flex items-center justify-between px-4 py-3 border-t mt-4">
                <div className="text-sm text-muted-foreground">
                  Showing {startIndex + 1} to {Math.min(endIndex, filteredCourses.length)} of {filteredCourses.length} courses
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm" onClick={() => setCurrentPage(Math.max(1, currentPage - 1))} disabled={currentPage === 1}>
                    Previous
                  </Button>
                  {Array.from({ length: totalPages }).map((_, i) => (
                    <Button key={i} variant={currentPage === i + 1 ? "default" : "outline"} size="sm" onClick={() => setCurrentPage(i + 1)} className="w-8 h-8 p-0">
                      {i + 1}
                    </Button>
                  ))}
                  <Button variant="outline" size="sm" onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages}>
                    Next
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  )
}


