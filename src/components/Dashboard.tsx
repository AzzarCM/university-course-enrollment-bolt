import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase, CourseWithSchedules, Enrollment } from '../lib/supabase';
import { WeeklyCalendar } from './WeeklyCalendar';
import { CourseList } from './CourseList';
import { CourseDetailModal } from './CourseDetailModal';
import { LogOut, Calendar, List, BookOpen, User } from 'lucide-react';

export function Dashboard() {
  const { user, student, signOut } = useAuth();
  const [courses, setCourses] = useState<CourseWithSchedules[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<CourseWithSchedules | null>(null);
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showEnrolledOnly, setShowEnrolledOnly] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);

      const [coursesRes, enrollmentsRes] = await Promise.all([
        supabase
          .from('courses')
          .select(`
            *,
            course_schedules (*),
            enrollments (*)
          `)
          .order('code'),
        supabase
          .from('enrollments')
          .select('*')
          .eq('student_id', user?.id || '')
          .eq('status', 'enrolled'),
      ]);

      if (coursesRes.error) throw coursesRes.error;
      if (enrollmentsRes.error) throw enrollmentsRes.error;

      setCourses(coursesRes.data || []);
      setEnrollments(enrollmentsRes.data || []);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleEnroll(courseId: string) {
    if (!user) return;

    try {
      setActionLoading(true);

      const { error } = await supabase.from('enrollments').insert([
        {
          student_id: user.id,
          course_id: courseId,
          status: 'enrolled',
        },
      ]);

      if (error) throw error;

      await loadData();
      setSelectedCourse(null);
    } catch (error: any) {
      console.error('Error enrolling:', error);
      alert(error.message || 'Failed to enroll in course');
    } finally {
      setActionLoading(false);
    }
  }

  async function handleDrop(courseId: string) {
    if (!user) return;

    try {
      setActionLoading(true);

      const { error } = await supabase
        .from('enrollments')
        .update({ status: 'dropped' })
        .eq('student_id', user.id)
        .eq('course_id', courseId);

      if (error) throw error;

      await loadData();
      setSelectedCourse(null);
    } catch (error: any) {
      console.error('Error dropping course:', error);
      alert(error.message || 'Failed to drop course');
    } finally {
      setActionLoading(false);
    }
  }

  const enrolledCourseIds = new Set(enrollments.map((e) => e.course_id));
  const displayCourses = showEnrolledOnly
    ? courses.filter((c) => enrolledCourseIds.has(c.id))
    : courses;

  const totalCredits = courses
    .filter((c) => enrolledCourseIds.has(c.id))
    .reduce((sum, c) => sum + c.credits, 0);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-slate-100">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading courses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Course Enrollment</h1>
                <p className="text-sm text-gray-600">University Course Management System</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right mr-4">
                <div className="flex items-center text-sm text-gray-600">
                  <User className="w-4 h-4 mr-1" />
                  {student?.full_name}
                </div>
                <div className="text-xs text-gray-500">{student?.email}</div>
              </div>
              <button
                onClick={() => signOut()}
                className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Enrolled Courses</p>
                <p className="text-3xl font-bold text-blue-600">{enrollments.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Credits</p>
                <p className="text-3xl font-bold text-emerald-600">{totalCredits}</p>
              </div>
              <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Available Courses</p>
                <p className="text-3xl font-bold text-gray-900">{courses.length}</p>
              </div>
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                <List className="w-6 h-6 text-gray-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode('calendar')}
                className={`flex items-center px-4 py-2 rounded-lg font-medium transition ${
                  viewMode === 'calendar'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Calendar className="w-4 h-4 mr-2" />
                Calendar View
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`flex items-center px-4 py-2 rounded-lg font-medium transition ${
                  viewMode === 'list'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <List className="w-4 h-4 mr-2" />
                List View
              </button>
            </div>

            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={showEnrolledOnly}
                onChange={(e) => setShowEnrolledOnly(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm font-medium text-gray-700">
                Show enrolled courses only
              </span>
            </label>
          </div>
        </div>

        {viewMode === 'calendar' ? (
          <WeeklyCalendar
            courses={displayCourses}
            enrolledCourseIds={enrolledCourseIds}
            onCourseClick={setSelectedCourse}
          />
        ) : (
          <CourseList
            courses={displayCourses}
            enrolledCourseIds={enrolledCourseIds}
            onCourseClick={setSelectedCourse}
          />
        )}
      </main>

      {selectedCourse && (
        <CourseDetailModal
          course={selectedCourse}
          isEnrolled={enrolledCourseIds.has(selectedCourse.id)}
          enrollmentCount={selectedCourse.enrollments?.length || 0}
          onClose={() => setSelectedCourse(null)}
          onEnroll={() => handleEnroll(selectedCourse.id)}
          onDrop={() => handleDrop(selectedCourse.id)}
          loading={actionLoading}
        />
      )}
    </div>
  );
}
