import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubjectTasks } from './subject-tasks';

describe('SubjectTasks', () => {
  let component: SubjectTasks;
  let fixture: ComponentFixture<SubjectTasks>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SubjectTasks]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SubjectTasks);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
