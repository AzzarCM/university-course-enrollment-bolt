import { CourseWithSchedules } from '../lib/supabase';
import { X, Clock, MapPin, Users, BookOpen, GraduationCap, Calendar } from 'lucide-react';

interface CourseDetailModalProps {
  course: CourseWithSchedules;
  isEnrolled: boolean;
  enrollmentCount: number;
  onClose: () => void;
  onEnroll: () => void;
  onDrop: () => void;
  loading: boolean;
}

const DAYS_FULL = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function formatTime(time: string): string {
  const [hours, minutes] = time.split(':');
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minutes} ${ampm}`;
}

export function CourseDetailModal({
  course,
  isEnrolled,
  enrollmentCount,
  onClose,
  onEnroll,
  onDrop,
  loading,
}: CourseDetailModalProps) {
  const spotsLeft = course.max_capacity - enrollmentCount;

  const scheduleByDay = course.course_schedules.reduce((acc, schedule) => {
    const day = DAYS_FULL[schedule.day_of_week];
    if (!acc[day]) {
      acc[day] = [];
    }
    acc[day].push(schedule);
    return acc;
  }, {} as Record<string, typeof course.course_schedules>);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div>
            <div className="text-sm font-semibold text-blue-600 mb-1">
              {course.code}
            </div>
            <h2 className="text-2xl font-bold text-gray-900">
              {course.title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {isEnrolled && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center mr-3">
                  <BookOpen className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="font-semibold text-blue-900">Currently Enrolled</div>
                  <div className="text-sm text-blue-700">You are registered for this course</div>
                </div>
              </div>
            </div>
          )}

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
            <p className="text-gray-700 leading-relaxed">{course.description}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center p-4 bg-gray-50 rounded-lg">
              <GraduationCap className="w-5 h-5 text-gray-400 mr-3" />
              <div>
                <div className="text-sm text-gray-600">Instructor</div>
                <div className="font-semibold text-gray-900">{course.instructor}</div>
              </div>
            </div>

            <div className="flex items-center p-4 bg-gray-50 rounded-lg">
              <BookOpen className="w-5 h-5 text-gray-400 mr-3" />
              <div>
                <div className="text-sm text-gray-600">Credits</div>
                <div className="font-semibold text-gray-900">{course.credits} Credits</div>
              </div>
            </div>

            <div className="flex items-center p-4 bg-gray-50 rounded-lg">
              <Users className="w-5 h-5 text-gray-400 mr-3" />
              <div>
                <div className="text-sm text-gray-600">Enrollment</div>
                <div className="font-semibold text-gray-900">
                  {enrollmentCount} / {course.max_capacity}
                </div>
              </div>
            </div>

            <div className="flex items-center p-4 bg-gray-50 rounded-lg">
              <Users className="w-5 h-5 text-gray-400 mr-3" />
              <div>
                <div className="text-sm text-gray-600">Spots Left</div>
                <div className={`font-semibold ${spotsLeft <= 5 ? 'text-orange-600' : 'text-gray-900'}`}>
                  {spotsLeft} Available
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
              <Calendar className="w-5 h-5 mr-2" />
              Class Schedule
            </h3>
            <div className="space-y-3">
              {Object.entries(scheduleByDay).map(([day, schedules]) => (
                <div key={day} className="flex items-start p-4 bg-gray-50 rounded-lg">
                  <div className="w-24 flex-shrink-0">
                    <div className="font-semibold text-gray-900">{day}</div>
                  </div>
                  <div className="flex-1 space-y-2">
                    {schedules.map((schedule, idx) => (
                      <div key={idx} className="flex items-center text-gray-700">
                        <Clock className="w-4 h-4 mr-2 text-gray-400" />
                        <span className="mr-4">
                          {formatTime(schedule.start_time)} - {formatTime(schedule.end_time)}
                        </span>
                        <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                        <span>{schedule.location}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            {isEnrolled ? (
              <button
                onClick={onDrop}
                disabled={loading}
                className="flex-1 bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Processing...' : 'Drop Course'}
              </button>
            ) : (
              <button
                onClick={onEnroll}
                disabled={loading || spotsLeft === 0}
                className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Processing...' : spotsLeft === 0 ? 'Course Full' : 'Enroll in Course'}
              </button>
            )}
            <button
              onClick={onClose}
              className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
