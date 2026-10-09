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

  it('logs out before returning to the login page when consent is declined', () => {
    localStorage.setItem('accessToken', 'test-token');
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);

    component.onDecline();

    expect(navigate).not.toHaveBeenCalled();
    TestBed.inject(HttpTestingController).expectOne(`${environment.apiHost}/auth/logout`).flush(null);
    expect(TestBed.inject(AuthService).isAuthenticated).toBe(false);
    expect(navigate).toHaveBeenCalledWith(['/login']);
  });

  it('clears the local session and returns to login when logout fails', () => {
    localStorage.setItem('accessToken', 'test-token');
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);

    component.onDecline();

    TestBed.inject(HttpTestingController)
      .expectOne(`${environment.apiHost}/auth/logout`)
      .flush(null, { status: 500, statusText: 'Server Error' });
    expect(TestBed.inject(AuthService).isAuthenticated).toBe(false);
    expect(navigate).toHaveBeenCalledWith(['/login']);
  });
});
