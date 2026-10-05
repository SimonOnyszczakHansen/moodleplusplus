import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { of } from 'rxjs';
import { Objectives as ObjectivesService } from '../../services/objectives';

import { TeacherObjectives } from './teacher-objectives';

describe('TeacherObjectives', () => {
  let component: TeacherObjectives;
  let fixture: ComponentFixture<TeacherObjectives>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TeacherObjectives],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: convertToParamMap({ subjectId: 'subject-1' }) } },
        },
        {
          provide: ObjectivesService,
          useValue: {
            getObjectivesBySubject: () => of([]),
          },
        },
      ],
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
