import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { of } from 'rxjs';

import { jwtInterceptor } from './jwt-interceptor';
import { AuthService } from '../services/auth.service';

describe('jwtInterceptor', () => {
  let http: HttpClient;
  let httpTestingController: HttpTestingController;
  let refreshAccessToken: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    refreshAccessToken = vi.fn(() => of(undefined));
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([jwtInterceptor])),
        provideHttpClientTesting(),
        { provide: AuthService, useValue: { refreshAccessToken } },
      ],
    });
    http = TestBed.inject(HttpClient);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('refreshes after a 401 and retries the original request once', () => {
    let response: unknown;

    http.get('/api/protected').subscribe((result) => {
      response = result;
    });

    const initialRequest = httpTestingController.expectOne('/api/protected');
    expect(initialRequest.request.withCredentials).toBe(true);
    initialRequest.flush({}, { status: 401, statusText: 'Unauthorized' });

    expect(refreshAccessToken).toHaveBeenCalledOnce();
    const retryRequest = httpTestingController.expectOne('/api/protected');
    expect(retryRequest.request.withCredentials).toBe(true);
    retryRequest.flush({ ok: true });

    expect(response).toEqual({ ok: true });
  });

  it('does not try to refresh a failed auth request', () => {
    http.post('/api/v1/auth/refresh', {}).subscribe({ error: () => undefined });

    httpTestingController
      .expectOne('/api/v1/auth/refresh')
      .flush({}, { status: 401, statusText: 'Unauthorized' });

    expect(refreshAccessToken).not.toHaveBeenCalled();
  });
});
