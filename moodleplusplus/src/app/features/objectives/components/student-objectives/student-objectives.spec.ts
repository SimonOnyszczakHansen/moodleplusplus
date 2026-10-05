import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { of } from 'rxjs';
import { Objectives as ObjectivesService } from '../../services/objectives';

import { StudentObjectives } from './student-objectives';

describe('StudentObjectives', () => {
  let component: StudentObjectives;
  let fixture: ComponentFixture<StudentObjectives>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StudentObjectives],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: convertToParamMap({ subjectId: 'subject-1' }) } },
        },
        {
          provide: ObjectivesService,
          useValue: { getObjectivesBySubject: () => of([]) },
        },
      ],
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
