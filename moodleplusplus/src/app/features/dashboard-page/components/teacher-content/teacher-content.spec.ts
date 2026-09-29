import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TeacherContent } from './teacher-content';

describe('TeacherContent', () => {
  let component: TeacherContent;
  let fixture: ComponentFixture<TeacherContent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TeacherContent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TeacherContent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
