import React, { useState } from 'react';

function SignIn({ onSignIn }) {
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSignIn = () => {
    onSignIn({ name, password });
  };

  return (
    <div className="card">
      <h1 className="heading">Sign In</h1>
      {error && <p className="text-red-500">{error}</p>}
      <div>
        <label>
          Name:
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="border p-2 m-2"
          />
        </label>
      </div>
      <div>
        <label>
          Password:
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border p-2 m-2"
          />
        </label>
      </div>
      <button onClick={handleSignIn} className="button">
        Sign In
      </button>
    </div>
  );
}

export default SignIn;