import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface CalendarEvent {
  id: number;
  event_name: string;
  time: string;
  date: string;
  color: string;
  description?: string;
  event_category: string;
  priority: string;
  repeat_event: boolean;
  repeat_type?: 'Daily' | 'Weekly' | 'Monthly';
  repeat_days?: string;
  repeat_every_day?: boolean;
  repeat_time?: string;
  created_at: string;
  repeat_days_list?: string[];
}

@Injectable({
  providedIn: 'root'
})
export class CalendarService {
  private apiUrl = 'http://localhost:8000/api'; // Adjust this to match your backend URL

  constructor(private http: HttpClient) { }

  // GET /events/ - Lấy danh sách sự kiện của người dùng
  getEvents(): Observable<CalendarEvent[]> {
    return this.http.get<CalendarEvent[]>(`${this.apiUrl}/events/`);
  }

  // GET /events/<id>/ - Xem chi tiết sự kiện
  getEventById(id: number): Observable<CalendarEvent> {
    return this.http.get<CalendarEvent>(`${this.apiUrl}/events/${id}/`);
  }

  // POST /events/ - Tạo sự kiện mới
  addEvent(event: Omit<CalendarEvent, 'id'>): Observable<CalendarEvent> {
    return this.http.post<CalendarEvent>(`${this.apiUrl}/events/`, event);
  }

  // PUT /events/<id>/ - Cập nhật sự kiện
  updateEvent(id: number, event: Partial<CalendarEvent>): Observable<CalendarEvent> {
    return this.http.put<CalendarEvent>(`${this.apiUrl}/events/${id}/`, event);
  }

  // PATCH /events/<id>/ - Cập nhật một phần sự kiện
  patchEvent(id: number, event: Partial<CalendarEvent>): Observable<CalendarEvent> {
    return this.http.patch<CalendarEvent>(`${this.apiUrl}/events/${id}/`, event);
  }

  // DELETE /events/<id>/ - Xóa sự kiện
  deleteEvent(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/events/${id}/`);
  }

  // Phương thức này sẽ sử dụng getEvents() và lọc kết quả theo tháng
  getEventsByMonth(year: number, month: number): Observable<CalendarEvent[]> {
    return this.getEvents();
    // Nếu bạn muốn lọc ở phía client, có thể sử dụng pipe và map:
    // return this.getEvents().pipe(
    //   map(events => events.filter(event => {
    //     const eventDate = new Date(event.date);
    //     return eventDate.getFullYear() === year && eventDate.getMonth() + 1 === month;
    //   }))
    // );
  }
}
