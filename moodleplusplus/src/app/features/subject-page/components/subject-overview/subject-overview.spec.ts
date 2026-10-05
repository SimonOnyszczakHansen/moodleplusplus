import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubjectOverview } from './subject-overview';

describe('SubjectOverview', () => {
  let component: SubjectOverview;
  let fixture: ComponentFixture<SubjectOverview>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SubjectOverview],
    }).compileComponents();

    fixture = TestBed.createComponent(SubjectOverview);
    component = fixture.componentInstance;
    component.subject.set({
      id: 'subject-1',
      name: 'Programmering',
      createdAt: '2026-01-01T12:00:00Z',
      createdBy: 'teacher-1',
    });
    component.goals.set([
      { id: 'goal-1', subjectId: 'subject-1', content: 'Kan forklare API-design' },
    ]);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render the subject title and learning goals', () => {
    const heading = fixture.nativeElement.querySelector('h1');
    expect(heading?.textContent).toContain('Programmering');
    expect(fixture.nativeElement.textContent).toContain('Målpinde');
    expect(fixture.nativeElement.textContent).toContain('Kan forklare API-design');
  });
});
