import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StudentTask } from './student-task';

describe('StudentTask', () => {
  let component: StudentTask;
  let fixture: ComponentFixture<StudentTask>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StudentTask]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StudentTask);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
