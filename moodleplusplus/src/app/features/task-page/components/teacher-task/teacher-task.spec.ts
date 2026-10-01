import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TeacherTask } from './teacher-task';

describe('TeacherTask', () => {
  let component: TeacherTask;
  let fixture: ComponentFixture<TeacherTask>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TeacherTask]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TeacherTask);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
