import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { User } from '../../core/models/user.interface';

import { Login } from './login';

describe('Login', () => {
  let component: Login;
  let fixture: ComponentFixture<Login>;
  let request: Subject<User>;
  let auth: { login: ReturnType<typeof vi.fn>; hasAcceptedConsent: boolean; isAdmin: boolean };
  let navigate: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    request = new Subject<User>();
    auth = { login: vi.fn(() => request), hasAcceptedConsent: true, isAdmin: false };
    navigate = vi.fn();
    await TestBed.configureTestingModule({
      imports: [Login],
      providers: [
        { provide: AuthService, useValue: auth },
        { provide: Router, useValue: { navigate } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Login);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('renders an asynchronous login failure and clears it when retrying', async () => {
    component.loginForm.setValue({ email: 'student@example.com', password: 'test-password' });
    component.onSubmit();
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('button').disabled).toBe(true);

    component.onSubmit();
    expect(auth.login).toHaveBeenCalledOnce();

    request.error({ status: 401 });
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('[role="alert"]').textContent)
      .toContain('Forkert email eller kodeord.');
    expect(fixture.nativeElement.querySelector('button').disabled).toBe(false);
    expect(navigate).not.toHaveBeenCalled();

    request = new Subject<User>();
    component.onSubmit();
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('[role="alert"]')).toBeNull();
    expect(fixture.nativeElement.querySelector('button').disabled).toBe(true);
    expect(auth.login).toHaveBeenCalledTimes(2);
    request.complete();
  });

  it.each([
    [{ status: 500 }, 'Der opstod en serverfejl.'],
    [{ status: 400, error: { message: 'Login unavailable' } }, 'Login unavailable'],
  ])('renders server errors without another user interaction', async (error, message) => {
    component.loginForm.setValue({ email: 'student@example.com', password: 'test-password' });
    component.onSubmit();
    request.error(error);
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('[role="alert"]').textContent).toContain(message);
    expect(component.isLoggingIn()).toBe(false);
  });

  it.each([
    [false, true, '/dashboard'],
    [false, false, '/consent'],
    [true, true, '/admin/users'],
    [true, false, '/consent'],
  ])('navigates after login with admin=%s and consent=%s', async (isAdmin, consent, destination) => {
    auth.isAdmin = isAdmin;
    auth.hasAcceptedConsent = consent;
    component.loginForm.setValue({ email: 'student@example.com', password: 'test-password' });
    component.onSubmit();
    request.next({ name: 'User', role: isAdmin ? 'administrator' : 'student' });
    request.complete();
    await fixture.whenStable();
    expect(navigate).toHaveBeenCalledWith([destination]);
    expect(component.isLoggingIn()).toBe(false);
    expect(fixture.nativeElement.querySelector('[role="alert"]')).toBeNull();
  });

  it('does not send invalid credentials', () => {
    component.onSubmit();
    expect(auth.login).not.toHaveBeenCalled();
    expect(component.loginForm.touched).toBe(true);
  });
});
