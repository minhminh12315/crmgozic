import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfileVacationComponent } from './profile-vacation.component';

describe('ProfileVacationComponent', () => {
  let component: ProfileVacationComponent;
  let fixture: ComponentFixture<ProfileVacationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProfileVacationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProfileVacationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
