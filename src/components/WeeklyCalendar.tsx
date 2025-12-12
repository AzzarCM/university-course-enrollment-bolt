import { CourseWithSchedules } from '../lib/supabase';

interface WeeklyCalendarProps {
  courses: CourseWithSchedules[];
  enrolledCourseIds: Set<string>;
  onCourseClick: (course: CourseWithSchedules) => void;
}

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const TIME_SLOTS = [
  '08:00', '09:00', '10:00', '11:00', '12:00',
  '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'
];

interface CalendarEvent {
  course: CourseWithSchedules;
  dayOfWeek: number;
  startMinutes: number;
  durationMinutes: number;
  location: string;
  isEnrolled: boolean;
}

function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}




export function WeeklyCalendar({ courses, enrolledCourseIds, onCourseClick }: WeeklyCalendarProps) {
  console.log("courses", courses)
  const events: CalendarEvent[] = [];

  courses.forEach((course) => {
    course.course_schedules.forEach((schedule) => {
      const startMinutes = timeToMinutes(schedule.start_time);
      const endMinutes = timeToMinutes(schedule.end_time);

      events.push({
        course,
        dayOfWeek: schedule.day_of_week,
        startMinutes,
        durationMinutes: endMinutes - startMinutes,
        location: schedule.location,
        isEnrolled: enrolledCourseIds.has(course.id),
      });
    });
  });

  const getEventPosition = (startMinutes: number, durationMinutes: number) => {
    const startHour = 8;
    const pixelsPerMinute = 80 / 60;

    const top = (startMinutes - startHour * 60) * pixelsPerMinute;
    const height = durationMinutes * pixelsPerMinute;

    return { top, height };
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="grid grid-cols-8 border-b border-gray-200">
        <div className="p-4 bg-gray-50 border-r border-gray-200">
          <span className="text-sm font-medium text-gray-600">Time</span>
        </div>
        {DAYS.slice(1, 6).map((day) => (
          <div key={day} className="p-4 bg-gray-50 border-r border-gray-200 last:border-r-0">
            <span className="text-sm font-semibold text-gray-900">{day}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-8 relative">
        <div className="border-r border-gray-200">
          {TIME_SLOTS.map((time) => (
            <div key={time} className="h-20 px-3 py-2 text-xs text-gray-500 border-b border-gray-100">
              {time}
            </div>
          ))}
        </div>

        {DAYS.slice(1, 6).map((day, dayIndex) => {
          const dayOfWeek = dayIndex + 1;
          const dayEvents = events.filter((e) => e.dayOfWeek === dayOfWeek);

          return (
            <div key={day} className="relative border-r border-gray-200 last:border-r-0">
              {TIME_SLOTS.map((time) => (
                <div
                  key={time}
                  className="h-20 border-b border-gray-100"
                />
              ))}

              {dayEvents.map((event, idx) => {
                const { top, height } = getEventPosition(
                  event.startMinutes,
                  event.durationMinutes
                );

                return (
                  <button
                    key={idx}
                    onClick={() => onCourseClick(event.course)}
                    className={`absolute left-1 right-1 rounded-lg p-2 text-left transition-all hover:shadow-lg hover:scale-[1.02] ${
                      event.isEnrolled
                        ? 'bg-blue-600 text-white'
                        : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                    }`}
                    style={{
                      top: `${top}px`,
                      height: `${height}px`,
                    }}
                  >
                    <div className="text-xs font-semibold truncate">
                      {event.course.code}
                    </div>
                    <div className="text-xs truncate opacity-90">
                      {event.course.title}
                    </div>
                    <div className="text-xs truncate mt-1 opacity-75">
                      {event.location}
                    </div>
                  </button>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}
