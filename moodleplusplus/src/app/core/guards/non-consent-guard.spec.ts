import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { nonConsentGuard } from './non-consent-guard';

describe('nonConsentGuardGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => nonConsentGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
