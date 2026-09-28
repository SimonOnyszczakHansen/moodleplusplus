import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { App } from './app';

describe('App', () => {
  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideHttpClient(), provideRouter([])],
    }).compileComponents();
  });

  afterEach(() => localStorage.clear());

  it('shows only user management and logout for administrators', async () => {
    localStorage.setItem('currentUser', JSON.stringify({ name: 'Admin', role: 1 }));
    localStorage.setItem('consentAccepted', 'true');
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const links: NodeListOf<HTMLAnchorElement> = fixture.nativeElement.querySelectorAll('nav a');
    expect(Array.from(links, (link) => link.getAttribute('href'))).toEqual(['/admin/users']);
    expect(fixture.nativeElement.querySelector('.logout-button')).toBeTruthy();
  });

  for (const role of [2, 3]) {
    it(`keeps teaching navigation for role ${role}`, async () => {
      localStorage.setItem('currentUser', JSON.stringify({ name: 'User', role }));
      localStorage.setItem('consentAccepted', 'true');
      const fixture = TestBed.createComponent(App);
      await fixture.whenStable();
      const links: NodeListOf<HTMLAnchorElement> = fixture.nativeElement.querySelectorAll('nav a');
      expect(Array.from(links, (link) => link.textContent?.trim())).toEqual([
        'Dashboard', 'Fag', 'Grupper', 'Opgaver', 'Quizzer',
      ]);
    });
  }

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });
});
