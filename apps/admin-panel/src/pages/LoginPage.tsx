import { useState } from 'react';

import {
  signInAdmin,
} from '../services/authService';

export default function LoginPage() {
  const [email, setEmail] =
    useState('');

  const [password, setPassword] =
    useState('');

  const [loading, setLoading] =
    useState(false);

  const handleLogin =
    async () => {
      try {
        setLoading(true);

        await signInAdmin(
          email,
          password
        );
      } catch (error: unknown) {
        const message =
          error instanceof Error
            ? error.message
            : 'Login failed';

        alert(message);
      } finally {
        setLoading(false);
      }
    };

  return (
    <div
      style={{
        padding: 40,
      }}
    >
      <h1>
        Admin Login
      </h1>

      <input
        placeholder="Email"
        value={email}
        onChange={(e) =>
          setEmail(e.target.value)
        }
        style={{
          display: 'block',
          marginBottom: 12,
          padding: 10,
          width: 300,
        }}
      />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) =>
          setPassword(
            e.target.value
          )
        }
        style={{
          display: 'block',
          marginBottom: 12,
          padding: 10,
          width: 300,
        }}
      />

      <button
        onClick={handleLogin}
      >
        {loading
          ? 'Logging In...'
          : 'Login'}
      </button>
    </div>
  );
}
