import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { vi } from 'vitest';

import { QuizPage } from './quiz-page';
import { AuthService } from '../../core/services/auth.service';
import { QuizService } from './services/quiz';

describe('QuizPage', () => {
  let component: QuizPage;
  let fixture: ComponentFixture<QuizPage>;

  beforeEach(async () => {
    const authService = { currentUser: { id: 'teacher-1', role: 'teacher' } };
    const quizService = {
      getQuizzesByUser: vi.fn(() => of([])),
      getQuizzesByStudent: vi.fn(() => of([])),
      getMyQuizStatus: vi.fn(() => of(null)),
    };

    await TestBed.configureTestingModule({
      imports: [QuizPage],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: authService },
        { provide: QuizService, useValue: quizService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(QuizPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
