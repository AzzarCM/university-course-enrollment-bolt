import { CourseWithSchedules } from '../lib/supabase';
import { Clock, MapPin, Users, BookOpen, GraduationCap } from 'lucide-react';

interface CourseListProps {
  courses: CourseWithSchedules[];
  enrolledCourseIds: Set<string>;
  onCourseClick: (course: CourseWithSchedules) => void;
}

const DAYS_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function formatTime(time: string): string {
  const [hours, minutes] = time.split(':');
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minutes} ${ampm}`;
}

export function CourseList({ courses, enrolledCourseIds, onCourseClick }: CourseListProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {courses.map((course) => {
        const isEnrolled = enrolledCourseIds.has(course.id);
        const enrollmentCount = course.enrollments?.length || 0;
        const spotsLeft = course.max_capacity - enrollmentCount;

        const scheduleText = course.course_schedules
          .map((s) => `${DAYS_SHORT[s.day_of_week]} ${formatTime(s.start_time)}`)
          .join(', ');

        return (
          <button
            key={course.id}
            onClick={() => onCourseClick(course)}
            className={`text-left p-6 rounded-xl border-2 transition-all hover:shadow-lg ${
              isEnrolled
                ? 'border-blue-600 bg-blue-50'
                : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="text-sm font-semibold text-blue-600 mb-1">
                  {course.code}
                </div>
                <h3 className="text-lg font-bold text-gray-900 leading-snug">
                  {course.title}
                </h3>
              </div>
              {isEnrolled && (
                <div className="flex-shrink-0 px-3 py-1 bg-blue-600 text-white text-xs font-semibold rounded-full">
                  Enrolled
                </div>
              )}
            </div>

            <p className="text-sm text-gray-600 mb-4 line-clamp-2">
              {course.description}
            </p>

            <div className="space-y-2">
              <div className="flex items-center text-sm text-gray-700">
                <GraduationCap className="w-4 h-4 mr-2 text-gray-400" />
                <span className="font-medium">{course.instructor}</span>
              </div>

              <div className="flex items-center text-sm text-gray-600">
                <Clock className="w-4 h-4 mr-2 text-gray-400" />
                <span className="truncate">{scheduleText}</span>
              </div>

              {course.course_schedules[0] && (
                <div className="flex items-center text-sm text-gray-600">
                  <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                  <span className="truncate">{course.course_schedules[0].location}</span>
                </div>
              )}

              <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                <div className="flex items-center text-sm text-gray-600">
                  <BookOpen className="w-4 h-4 mr-2 text-gray-400" />
                  <span>{course.credits} Credits</span>
                </div>

                <div className="flex items-center text-sm">
                  <Users className="w-4 h-4 mr-2 text-gray-400" />
                  <span className={spotsLeft <= 5 ? 'text-orange-600 font-semibold' : 'text-gray-600'}>
                    {spotsLeft} spots left
                  </span>
                </div>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
