import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const result = await login(email, password);

    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.message);
    }
    setIsLoading(false);
  }

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      background: 'var(--sage-50)',
      padding: '24px',
    }}>
      <div style={{
        background: 'var(--cream)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-lg)',
        padding: '48px 40px',
        width: '100%',
        maxWidth: '420px',
      }}>
        {/* Logo / App name */}
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '56px',
            height: '56px',
            borderRadius: 'var(--radius-md)',
            background: 'var(--primary)',
            marginBottom: '16px',
          }}>
            <span style={{ color: '#fff', fontSize: '24px', fontWeight: 700, fontFamily: 'var(--font-display)' }}>N</span>
          </div>
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: '28px',
            fontWeight: 600,
            color: 'var(--charcoal)',
            margin: 0,
          }}>
            NutriFlow
          </h1>
          <p style={{ color: 'var(--muted)', fontSize: '14px', marginTop: '6px' }}>
            Sign in to your account
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: 500,
              color: 'var(--charcoal)',
              marginBottom: '8px',
            }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              disabled={isLoading}
              placeholder="example@email.com"
              style={{
                width: '100%',
                padding: '10px 14px',
                border: '1.5px solid var(--border)',
                borderRadius: 'var(--radius-sm)',
                fontSize: '15px',
                color: 'var(--charcoal)',
                background: '#fff',
                outline: 'none',
                transition: 'border-color 0.2s',
              }}
              onFocus={e => (e.target.style.borderColor = 'var(--primary)')}
              onBlur={e => (e.target.style.borderColor = 'var(--border)')}
            />
          </div>

          <div style={{ marginBottom: '28px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: 500,
              color: 'var(--charcoal)',
              marginBottom: '8px',
            }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              disabled={isLoading}
              placeholder="••••••••"
              style={{
                width: '100%',
                padding: '10px 14px',
                border: '1.5px solid var(--border)',
                borderRadius: 'var(--radius-sm)',
                fontSize: '15px',
                color: 'var(--charcoal)',
                background: '#fff',
                outline: 'none',
                transition: 'border-color 0.2s',
              }}
              onFocus={e => (e.target.style.borderColor = 'var(--primary)')}
              onBlur={e => (e.target.style.borderColor = 'var(--border)')}
            />
          </div>

          {error && (
            <div style={{
              background: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: 'var(--radius-sm)',
              padding: '10px 14px',
              marginBottom: '20px',
              fontSize: '14px',
              color: 'var(--danger)',
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            style={{
              width: '100%',
              padding: '12px',
              background: isLoading ? 'var(--primary-light)' : 'var(--primary)',
              color: '#fff',
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              fontSize: '15px',
              fontWeight: 600,
              cursor: isLoading ? 'not-allowed' : 'pointer',
              transition: 'background 0.2s',
            }}
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p style={{
          textAlign: 'center',
          marginTop: '24px',
          fontSize: '13px',
          color: 'var(--muted)',
        }}>
          Don't have an account? Contact your administrator.
        </p>
      </div>
    </div>
  );
}
