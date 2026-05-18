import { useCallback, useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { clearStoredToken, getStoredToken } from './backend/storage';
import { BackendContext } from './backend/context';
import {
  COMPANY_ACCESS_UNAVAILABLE_CODE,
  COMPANY_APPROVAL_PENDING_CODE,
  loadBackendData,
  login as loginRequest,
  logout as logoutRequest,
  logoutAllDevices as logoutAllDevicesRequest,
  registerManager,
  requestVerificationCode,
  verifyEmail as verifyEmailRequest,
  resetPassword as resetPasswordRequest,
  joinCompany as joinCompanyRequest,
} from './backend/services';
import { getStoreVersion, subscribeStore } from './backend/store';
import { useNavigate } from 'react-router-dom';

function isUnauthorized(error) {
  return error?.status === 401 || error?.statusCode === 401;
}

function isApprovalPending(error) {
  return error?.code === COMPANY_APPROVAL_PENDING_CODE;
}

function isAccessUnavailable(error) {
  return error?.code === COMPANY_ACCESS_UNAVAILABLE_CODE;
}

function getAuthNotice(error) {
  if (isApprovalPending(error)) {
    return {
      type: 'pending',
      title: 'Waiting for owner approval',
      message:
        'Your company request is created, but an owner must accept it before you can sign in to this workspace.',
    };
  }

  if (isAccessUnavailable(error)) {
    return {
      type: 'unavailable',
      title: 'Company access unavailable',
      message:
        'Your company access was removed or your join request was declined. Contact the company owner if this is a mistake.',
    };
  }

  return null;
}

export function BackendProvider({ children }) {
  const [token, setToken] = useState(() => getStoredToken());
  const [status, setStatus] = useState(token ? 'loading' : 'unauthenticated');
  const [error, setError] = useState(null);
  const [authNotice, setAuthNotice] = useState(null);
  const [dataVersion, setDataVersion] = useState(() => getStoreVersion());
  const navigate = useNavigate();

  useEffect(
    () =>
      subscribeStore(() => {
        setDataVersion(getStoreVersion());
      }),
    []
  );

  const refreshData = useCallback(
    async (options = {}) => {
      const { throwOnError = false } = options;
      const storedToken = getStoredToken();
      if (!storedToken) {
        setToken('');
        setStatus('unauthenticated');
        return null;
      }

      setStatus('loading');
      setError(null);

      try {
        const snapshot = await loadBackendData();
        setToken(storedToken);
        setStatus('ready');
        setAuthNotice(null);
        return snapshot;
      } catch (err) {
        setError(err);
        const notice = getAuthNotice(err);
        if (isUnauthorized(err) || isApprovalPending(err) || isAccessUnavailable(err)) {
          clearStoredToken();
          setToken('');
          setStatus('unauthenticated');
          if (notice) {
            setAuthNotice(notice);
            if (
              !throwOnError &&
              typeof window !== 'undefined' &&
              window.location.pathname !== '/login'
            ) {
              navigate('/login', { replace: true, state: { from: window.location.pathname } });
            }
          }
        } else {
          setStatus('error');
        }
        if (throwOnError) throw err;
        return null;
      }
    },
    [navigate]
  );

  useEffect(() => {
    if (!token) return undefined;

    const refresh = () => {
      void refreshData();
    };
    const timer = window.setTimeout(refresh, 0);
    const interval = window.setInterval(refresh, 30000);
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') refresh();
    };

    window.addEventListener('focus', refresh);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.clearTimeout(timer);
      window.clearInterval(interval);
      window.removeEventListener('focus', refresh);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [token, refreshData]);

  const login = useCallback(
    async (credentials) => {
      const response = await loginRequest(credentials);
      await refreshData({ throwOnError: true });
      return response;
    },
    [refreshData]
  );

  const verifyEmail = useCallback(
    async (input) => {
      const response = await verifyEmailRequest(input);
      await refreshData();
      return response;
    },
    [refreshData]
  );

  const logout = useCallback(async () => {
    try {
      await logoutRequest();
    } finally {
      setAuthNotice(null);
      setToken('');
      setStatus('unauthenticated');
      navigate('/login', { replace: true });
    }
  }, [navigate]);

  const logoutAllDevices = useCallback(async () => {
    try {
      await logoutAllDevicesRequest();
    } finally {
      setAuthNotice(null);
      setToken('');
      setStatus('unauthenticated');
      navigate('/login', { replace: true });
    }
  }, [navigate]);

  const joinCompany = useCallback(async (companyId, input = {}) => {
    return joinCompanyRequest(companyId, input);
  }, []);

  const clearAuthNotice = useCallback(() => {
    setAuthNotice(null);
  }, []);

  const value = useMemo(
    () => ({
      token,
      status,
      error,
      authNotice,
      dataVersion,
      isAuthenticated: Boolean(token),
      isLoading: status === 'loading',
      isReady: status === 'ready',
      login,
      logout,
      logoutAllDevices,
      refreshData,
      registerManager,
      requestVerificationCode,
      resetPassword: resetPasswordRequest,
      verifyEmail,
      joinCompany,
      clearAuthNotice,
    }),
    [
      authNotice,
      clearAuthNotice,
      dataVersion,
      error,
      joinCompany,
      login,
      logout,
      logoutAllDevices,
      refreshData,
      status,
      token,
      verifyEmail,
    ]
  );

  return <BackendContext.Provider value={value}>{children}</BackendContext.Provider>;
}

BackendProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
