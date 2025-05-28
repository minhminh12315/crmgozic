import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FormBuilder, FormGroup, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CalendarService, CalendarEvent } from '../services/calendar.service';

interface CalendarDay {
    date: number;
    isCurrentMonth: boolean;
    events: CalendarEvent[];
    fullDate: Date;
}

type NewCalendarEvent = Omit<CalendarEvent, 'id'>;

type EventCategory = 'Birthday' | 'Reminder' | 'Meeting' | 'Corporate Event';

@Component({
    selector: 'app-calendar',
    templateUrl: './calendar.component.html',
    styleUrls: ['./calendar.component.css'],
    standalone: true,
    imports: [
        CommonModule,
        HttpClientModule,
        ReactiveFormsModule,
        FormsModule
    ],
    providers: [CalendarService]
})
export class CalendarComponent implements OnInit {
    currentDate: Date = new Date();
    currentMonth: string = '';
    currentYear: number = 0;
    workDays: CalendarDay[] = [];
    isLoading: boolean = false;
    selectedDayEvents: CalendarEvent[] = [];
    selectedDate: Date | null = null;
    showAddEventModal = false;
    eventForm!: FormGroup;
    weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    selectedWeekDays: string[] = [];

    constructor(
        private calendarService: CalendarService,
        private formBuilder: FormBuilder
    ) {
        this.initializeForm();
    }

    private initializeForm() {
        this.eventForm = this.formBuilder.group({
            event_name: [''],
            event_category: ['Reminder'],
            priority: ['Low'],
            date: [''],
            time: [''],
            description: [''],
            repeat_event: [false],
            repeat_type: [''],
            repeat_days: [''],
            repeat_every_day: [false],
            repeat_time: [null],
            repeat_days_list: [[]]
        });
    }

    ngOnInit() {
        this.setCurrentMonthAndYear();
        this.generateCalendarDays();
        this.loadEvents();
    }

    setCurrentMonthAndYear() {
        this.currentMonth = this.currentDate.toLocaleString('default', { month: 'long' });
        this.currentYear = this.currentDate.getFullYear();
    }

    generateCalendarDays() {
        const firstDayOfMonth = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), 1);
        const lastDayOfMonth = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, 0);

        // Get the day of week for the first day (0 = Sunday, 1 = Monday, etc.)
        let firstDayOfWeek = firstDayOfMonth.getDay();
        // Adjust for Monday as first day of week
        firstDayOfWeek = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;

        // Generate previous month's days (only weekdays)
        const previousMonthDays = [];
        for (let i = firstDayOfWeek - 1; i >= 0; i--) {
            const date = new Date(firstDayOfMonth);
            date.setDate(0 - i);
            if (date.getDay() !== 0 && date.getDay() !== 6) { // Skip weekends
                previousMonthDays.push({
                    date: date.getDate(),
                    isCurrentMonth: false,
                    events: [],
                    fullDate: new Date(date)
                });
            }
        }

        // Generate current month's days (only weekdays)
        const currentMonthDays = [];
        for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
            const date = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), i);
            if (date.getDay() !== 0 && date.getDay() !== 6) { // Skip weekends
                currentMonthDays.push({
                    date: i,
                    isCurrentMonth: true,
                    events: [],
                    fullDate: new Date(date)
                });
            }
        }

        // Generate next month's days (only weekdays)
        const totalWeekdays = previousMonthDays.length + currentMonthDays.length;
        const remainingWeekdays = 35 - totalWeekdays; // 7 weeks × 5 weekdays = 35 total grid cells
        const nextMonthDays = [];
        let nextDate = 1;
        while (nextMonthDays.length < remainingWeekdays) {
            const date = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, nextDate);
            if (date.getDay() !== 0 && date.getDay() !== 6) { // Skip weekends
                nextMonthDays.push({
                    date: nextDate,
                    isCurrentMonth: false,
                    events: [],
                    fullDate: new Date(date)
                });
            }
            nextDate++;
        }

        this.workDays = [...previousMonthDays, ...currentMonthDays, ...nextMonthDays];
    }

    loadEvents() {
        this.isLoading = true;
        this.calendarService.getEvents()
            .subscribe({
                next: (events) => {
                    // Reset all events
                    this.workDays.forEach(day => day.events = []);

                    // Distribute events to their respective days
                    events.forEach(event => {
                        const eventStartDate = new Date(event.date);

                        if (!event.repeat_event) {
                            // For non-repeating events, add them to their specific date
                            const matchingDay = this.workDays.find(day =>
                                this.isSameDay(day.fullDate, eventStartDate)
                            );
                            if (matchingDay) {
                                matchingDay.events.push(event);
                            }
                            return;
                        }
                        
                        // Handle repeating events
                        this.workDays.forEach(day => {
                            if (day.fullDate < new Date(eventStartDate.getTime() - 86400000)) { // Subtract one day (24 * 60 * 60 * 1000 ms)
                                return; // Skip days before the event start date
                            }

                            let shouldAddEvent = false;

                            switch (event.repeat_type) {
                                case 'Daily':
                                    if (event.repeat_every_day) {
                                        const isInSameWeek = this.isSameWeek(day.fullDate, eventStartDate);
                                        const isWeekday = day.fullDate.getDay() >= 1 && day.fullDate.getDay() <= 5; // 1=Mon, ..., 5=Fri
                                        shouldAddEvent = isInSameWeek && isWeekday && day.fullDate >= new Date(eventStartDate.getTime() - 86400000);
                                    } else {
                                        const isInSameWeek = this.isSameWeek(day.fullDate, eventStartDate);
                                        const dayName = this.getDayName(day.fullDate); // 'Mon', 'Tue', ...
                                        shouldAddEvent = isInSameWeek && day.fullDate >= eventStartDate && (event.repeat_days?.includes(dayName) ?? false);
                                    }
                                    break;

                                case 'Weekly':
                                    // Same month as start date and matches specified weekdays
                                    const isSameMonth = day.fullDate.getMonth() === eventStartDate.getMonth() &&
                                        day.fullDate.getFullYear() === eventStartDate.getFullYear();
                                    const dayName = this.getDayName(day.fullDate);
                                    shouldAddEvent = isSameMonth && (event.repeat_days?.includes(dayName) ?? false);
                                    break;

                                case 'Monthly':
                                    // Same day of month as start date
                                    shouldAddEvent = day.fullDate.getDate() === eventStartDate.getDate() &&
                                        day.fullDate >= new Date(eventStartDate.getTime() - 86400000);
                                    break;
                            }

                            if (shouldAddEvent) {
                                if (!day.events.some(e => e.id === event.id)) {
                                    day.events.push({ ...event });
                                }
                            }
                        });
                    });
                },
                error: (error) => {
                    console.error('Error loading events:', error);
                },
                complete: () => {
                    this.isLoading = false;
                }
            });
    }

    private isSameWeek(date1: Date, date2: Date): boolean {
        const getMonday = (d: Date) => {
            const day = d.getDay();
            const diff = day === 0 ? -6 : 1 - day;
            const monday = new Date(d);
            monday.setDate(d.getDate() + diff);
            monday.setHours(0,0,0,0);
            return monday;
        };
    
        const monday1 = getMonday(date1);
        const monday2 = getMonday(date2);
    
        return monday1.getTime() === monday2.getTime();
    }

    getDayName(date: Date): string {
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        return days[date.getDay()];
    }

    // Helper function to compare dates
    private isSameDay(date1: Date, date2: Date): boolean {
        return date1.getFullYear() === date2.getFullYear() &&
            date1.getMonth() === date2.getMonth() &&
            date1.getDate() === date2.getDate();
    }

    previousMonth() {
        this.currentDate.setMonth(this.currentDate.getMonth() - 1);
        this.setCurrentMonthAndYear();
        this.generateCalendarDays();
        this.loadEvents();
    }

    nextMonth() {
        this.currentDate.setMonth(this.currentDate.getMonth() + 1);
        this.setCurrentMonthAndYear();
        this.generateCalendarDays();
        this.loadEvents();
    }

    getEventColor(category: string): string {
        const colors: Record<EventCategory, string> = {
            'Birthday': '#FF69B4',  // Pink
            'Reminder': '#9C27B0',  // Purple
            'Meeting': '#4285f4',   // Blue
            'Corporate Event': '#4CAF50'  // Green
        };

        const formattedCategory = category
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(' ');

        return colors[formattedCategory as EventCategory] || '#4285f4';
    }



    showMoreEvents(day: CalendarDay) {
        this.selectedDayEvents = day.events;
        this.selectedDate = day.fullDate;
    }

    closeModal() {
        this.selectedDayEvents = [];
        this.selectedDate = null;
    }

    getFormattedDate(date: Date | null): string {
        if (!date) return '';
        return date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    openAddEventModal() {
        this.showAddEventModal = true;
    }

    closeAddEventModal() {
        this.showAddEventModal = false;
        this.eventForm.reset({
            event_category: 'Reminder',
            priority: 'Low',
            repeat_event: false,
            repeat_type: '',
            repeat_days: '',
            repeat_every_day: false,
            repeat_time: null,
            repeat_days_list: []
        });
    }

    toggleWeekday(day: string) {
        const currentDays = [...(this.eventForm.get('repeat_days_list')?.value || [])];
        const index = currentDays.indexOf(day);

        if (index === -1) {
            currentDays.push(day);
        } else {
            currentDays.splice(index, 1);
        }

        this.eventForm.patchValue({
            repeat_days_list: currentDays,
            repeat_days: currentDays.join(',')
        });
    }

    isWeekdaySelected(day: string): boolean {
        return (this.eventForm.get('repeat_days_list')?.value || []).includes(day);
    }



    saveEvent() {
        if (this.eventForm.valid) {
            const formData = this.eventForm.value;
            const defaultColor = '#4285f4';

            // Base event data
            const newEvent: Partial<NewCalendarEvent> = {
                event_name: formData.event_name,
                event_category: formData.event_category,
                priority: formData.priority,
                date: formData.date,
                time: formData.time,
                description: formData.description || '',
                color: this.getEventColor(formData.event_category) || defaultColor,
                repeat_event: formData.repeat_event
            };

            // Only add repeat-related fields if repeat_event is true
            if (formData.repeat_event) {
                // Ensure repeat_type is in the correct case format
                const repeat_type = formData.repeat_type.charAt(0).toUpperCase() + formData.repeat_type.slice(1).toLowerCase();

                Object.assign(newEvent, {
                    repeat_type: repeat_type,
                    repeat_days: formData.repeat_days_list.join(', '),
                    repeat_every_day: formData.repeat_every_day,
                    repeat_time: formData.repeat_time || formData.time,
                    repeat_days_list: formData.repeat_days_list
                });
            }

            this.calendarService.addEvent(newEvent as NewCalendarEvent).subscribe({
                next: (_response: CalendarEvent) => {
                    this.loadEvents();
                    this.closeAddEventModal();
                },
                error: (error: any) => {
                    console.error('Error creating event:', error);
                    if (error.error && Object.keys(error.error).length > 0) {
                        const errorMessages = Object.entries(error.error)
                            .map(([key, value]) => `${key}: ${value}`)
                            .join('\n');
                        alert(`Validation errors:\n${errorMessages}`);
                    } else {
                        alert('An error occurred while creating the event. Please try again.');
                    }
                }
            });
        }
    }
}