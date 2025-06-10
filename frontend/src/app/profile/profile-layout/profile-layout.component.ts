import { Component, OnInit } from '@angular/core';
import { Router, RouterModule, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';

interface CalendarDay {
  date: number;
  isCurrentMonth: boolean;
  fullDate: Date;
}

@Component({
  selector: 'app-profile-layout',
  standalone: true,
  imports: [RouterOutlet, RouterModule, CommonModule],
  templateUrl: './profile-layout.component.html',
  styleUrls: ['./profile-layout.component.css']
})
export class ProfileLayoutComponent implements OnInit {
  constructor(private router: Router) { }

  activeNav: string = 'projects';
  activeAddRequest: string = 'days';
  isSetting: boolean = false;
  currentDate: Date = new Date();
  currentMonth: string = '';
  currentYear: number = 0;
  workDays: CalendarDay[] = [];
  weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  timeOptions: string[] = [];

  // Đối tượng cho khoảng chọn (range) gồm ngày bắt đầu và kết thúc
  selectedRange: { start: CalendarDay | null, end: CalendarDay | null } = { start: null, end: null };
  setActiveRequest(item: string) {
    this.activeAddRequest = item;
  }
  ngOnInit() {
    console.log(this.currentDate);
    this.router.events.subscribe(() => {
      const url = this.router.url;
      if (url.includes('project')) {
        this.activeNav = 'projects';
        this.isSetting = false;
      } else if (url.includes('team')) {
        this.activeNav = 'team';
        this.isSetting = false;
      } else if (url.includes('setting')) {
        this.isSetting = true;
      } else if (url.includes('vacations')) {
        this.activeNav = 'vacations';
        this.isSetting = false;
      }
    });
    this.setCurrentMonthAndYear();
    this.generateCalendarDays();
    this.generateTimeOptions();
  }

  // Xác định tháng và năm hiện tại từ currentDate
  setCurrentMonthAndYear() {
    this.currentMonth = this.currentDate.toLocaleString('en-US', { month: 'long' });
    this.currentYear = this.currentDate.getFullYear();
  }

  // Chuyển tháng trước
  previousMonth() {
    this.currentDate.setMonth(this.currentDate.getMonth() - 1);
    console.log("previous month: " + this.currentDate);
    this.setCurrentMonthAndYear();
    this.generateCalendarDays();
  }

  // Chuyển tháng sau
  nextMonth() {
    this.currentDate.setMonth(this.currentDate.getMonth() + 1);
    console.log("next month: " + this.currentDate);
    this.setCurrentMonthAndYear();
    this.generateCalendarDays();
  }

  generateCalendarDays() {
    const firstDayOfMonth = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), 1);
    const lastDayOfMonth = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, 0);

    console.log("generate month first: " + firstDayOfMonth)
    console.log("generate next month: " + lastDayOfMonth)

    let firstDayOfWeek = firstDayOfMonth.getDay();
    firstDayOfWeek = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;

    const previousMonthDays: CalendarDay[] = [];
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const date = new Date(firstDayOfMonth);
      date.setDate(0 - i);

      previousMonthDays.push({
        date: date.getDate(),
        isCurrentMonth: false,
        fullDate: new Date(date)
      });
    }

    const currentMonthDays: CalendarDay[] = [];
    for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
      const date = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), i);

      currentMonthDays.push({
        date: i,
        isCurrentMonth: true,
        fullDate: new Date(date)
      });
    }

    const totalWeekdays = previousMonthDays.length + currentMonthDays.length;
    const remainingWeekdays = 35 - totalWeekdays;
    const nextMonthDays: CalendarDay[] = [];
    let nextDate = 1;
    while (nextMonthDays.length < remainingWeekdays) {
      const date = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, nextDate);

      nextMonthDays.push({
        date: nextDate,
        isCurrentMonth: false,
        fullDate: new Date(date)
      });
      nextDate++;
    }

    this.workDays = [...previousMonthDays, ...currentMonthDays, ...nextMonthDays];
  }

  /* Logic chọn khoảng ngày:
     - Nếu chưa có ngày bắt đầu hoặc đã chọn đủ start & end thì reset lại và đặt start mới.
     - Nếu đã có start nhưng chưa có end, thì ngày được chọn tiếp theo sẽ là end.
  */
  selectDay(day: CalendarDay) {
    if (!this.selectedRange.start || (this.selectedRange.start && this.selectedRange.end)) {
      this.selectedRange = { start: day, end: null };
    } else if (!this.selectedRange.end) {
      if (day.fullDate < this.selectedRange.start.fullDate) {
        this.selectedRange = { start: day, end: this.selectedRange.start };
      } else if (day.fullDate.getTime() === this.selectedRange.start.fullDate.getTime()) {
        // Nếu click lại ngày bắt đầu, reset lựa chọn (tùy chọn logic)
        this.selectedRange = { start: null, end: null };
      } else {
        this.selectedRange.end = day;
      }
    }
  }

  // Kiểm tra xem một ngày có nằm trong khoảng được chọn không
  isInSelectedRange(day: CalendarDay): boolean {
    if (!this.selectedRange.start) return false;
    if (!this.selectedRange.end) {
      return day.fullDate.getTime() === this.selectedRange.start.fullDate.getTime();
    }
    return day.fullDate >= this.selectedRange.start.fullDate && day.fullDate <= this.selectedRange.end.fullDate;
  }

  // Hàm trả về các class cho ô được chọn, dựa vào vị trí trong hàng (grid có 7 cột)
  getRangeClasses(day: CalendarDay, index: number) {
    const classes: any = {};
    if (this.isInSelectedRange(day)) {
      classes['selected-range'] = true;
      // Nếu cả ngày bắt đầu và kết thúc trùng nhau (chỉ chọn 1 ngày)
      if (this.isRangeStart(day, index) && this.isRangeEnd(day, index)) {
        classes['range-single'] = true;
      } else if (this.isRangeStart(day, index)) {
        classes['range-start'] = true;
      } else if (this.isRangeEnd(day, index)) {
        classes['range-end'] = true;
      } else {
        classes['range-middle'] = true;
      }
    }
    return classes;
  }

  // Kiểm tra ô có phải là bắt đầu của khối liên tục không
  isRangeStart(day: CalendarDay, index: number): boolean {
    if (!this.isInSelectedRange(day)) return false;
    // Nếu là ô đầu tiên của hàng (index %7 = 0) thì chắc chắn là bắt đầu.
    if (index % 7 === 0) return true;
    const prevDay = this.workDays[index - 1];
    return !this.isInSelectedRange(prevDay);
  }

  // Kiểm tra ô có phải là kết thúc của khối liên tục không
  isRangeEnd(day: CalendarDay, index: number): boolean {
    if (!this.isInSelectedRange(day)) return false;
    if (index % 7 === 6) return true; // ô cuối hàng
    const nextDay = this.workDays[index + 1];
    return !this.isInSelectedRange(nextDay);
  }
  generateTimeOptions() {
    const periods = ['AM', 'PM'];
    for (let period of periods) {
      for (let hour = 1; hour <= 12; hour++) {
        for (let minute of [0, 30]) {
          const h = hour === 12 ? 12 : hour;
          const m = minute === 0 ? '00' : '30';
          this.timeOptions.push(`${h}:${m} ${period}`);
        }
      }
    }
  }
}