import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function GitHubCallbackPage() {
  const { completeOAuth } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    const params = new URLSearchParams(window.location.hash.slice(1));
    const token = params.get('token');
    window.history.replaceState(null, '', window.location.pathname);

    if (!token) {
      setError('GitHub sign-in did not return an authentication token. Please try again.');
      return;
    }

    completeOAuth(token)
      .then(() => navigate('/', { replace: true }))
      .catch((authError) => setError(authError.message || 'Could not complete GitHub sign-in.'));
  }, [completeOAuth, navigate]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center space-y-3">
        <p className="text-sm font-semibold text-slate-700">
          {error ? 'GitHub sign-in failed' : 'Signing you in with GitHub...'}
        </p>
        {error && (
          <>
            <p className="text-xs text-rose-600">{error}</p>
            <Link to="/login" className="inline-block text-xs font-bold text-brand-600 hover:underline">
              Return to sign in
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
