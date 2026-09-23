import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsentPage } from './consent-page';

describe('ConsentPage', () => {
  let component: ConsentPage;
  let fixture: ComponentFixture<ConsentPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConsentPage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConsentPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
