import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubjectGoals } from './subject-goals';

describe('SubjectGoals', () => {
  let component: SubjectGoals;
  let fixture: ComponentFixture<SubjectGoals>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SubjectGoals]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SubjectGoals);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
