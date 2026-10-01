import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubjectStudents } from './subject-students';

describe('SubjectStudents', () => {
  let component: SubjectStudents;
  let fixture: ComponentFixture<SubjectStudents>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SubjectStudents]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SubjectStudents);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
