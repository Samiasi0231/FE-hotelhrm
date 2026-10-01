// src/hooks/useOnboardingGuard.ts
// Drop into DashboardLayout — redirects HOTEL_DIRECTOR to /onboarding if not complete

import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { onboardingApi } from '@/api/services';

const ONBOARDING_EXEMPT = ['/onboarding', '/login', '/register'];

export function useOnboardingGuard() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (
      !isAuthenticated ||
      user?.role !== 'HOTEL_DIRECTOR' ||
      ONBOARDING_EXEMPT.some((p) => location.pathname.startsWith(p))
    ) {
      return;
    }

    onboardingApi.getStatus().then(({ data }) => {
      const status = data?.data ?? data;
      // If hotel doesn't exist or onboarding is incomplete, redirect
      if (!status || !status.isOnboarded) {
        navigate('/onboarding', { replace: true });
      }
    });
  }, [isAuthenticated, user?.role, location.pathname]);
}