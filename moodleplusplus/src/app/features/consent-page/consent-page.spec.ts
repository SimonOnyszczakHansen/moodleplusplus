import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Router, provideRouter } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { environment } from '../../../environments/environment';

import { ConsentPage } from './consent-page';

describe('ConsentPage', () => {
  let component: ConsentPage;
  let fixture: ComponentFixture<ConsentPage>;

  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [ConsentPage],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConsentPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  afterEach(() => {
    TestBed.inject(HttpTestingController).verify();
    localStorage.clear();
  });

  it.each([
    [true, '/admin/users'],
    [false, '/dashboard'],
  ])('returns to the correct home page after consent with admin=%s', (isAdmin, destination) => {
    vi.spyOn(TestBed.inject(AuthService), 'isAdmin', 'get').mockReturnValue(isAdmin);
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    component.onAcceptPP();
    expect(navigate).not.toHaveBeenCalled();
    TestBed.inject(HttpTestingController).expectOne(`${environment.apiHost}/auth/consent`).flush(null);
    expect(TestBed.inject(AuthService).hasAcceptedConsent).toBe(true);
    expect(navigate).toHaveBeenCalledWith([destination]);
  });
});
