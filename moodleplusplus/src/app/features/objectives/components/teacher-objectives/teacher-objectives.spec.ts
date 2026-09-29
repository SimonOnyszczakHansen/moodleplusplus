import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TeacherObjectives } from './teacher-objectives';

describe('TeacherObjectives', () => {
  let component: TeacherObjectives;
  let fixture: ComponentFixture<TeacherObjectives>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TeacherObjectives]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TeacherObjectives);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
