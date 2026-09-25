import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StudentObjectives } from './student-objectives';

describe('StudentObjectives', () => {
  let component: StudentObjectives;
  let fixture: ComponentFixture<StudentObjectives>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StudentObjectives]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StudentObjectives);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
