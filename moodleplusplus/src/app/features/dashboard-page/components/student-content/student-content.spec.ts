import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StudentContent } from './student-content';

describe('StudentContent', () => {
  let component: StudentContent;
  let fixture: ComponentFixture<StudentContent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StudentContent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StudentContent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
