import { useState } from 'react';
import { supabase } from '../src/lib/supabaseClient';

export default function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('ngo');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Signup with Supabase Auth
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) {
      setError(error.message);
      return;
    }

    // Insert role into your 'profiles' table, after successful signup
    const user = data.user;
    if (user) {
      const { error: profileError } = await supabase.from('profiles').insert([
        { id: user.id, email, role }
      ]);
      if (profileError) setError(profileError.message);
      else setSuccess('Registration successful! Please check your email to confirm.');
    }
  };

  return (
    <div>
      <h2>Sign Up (Admin / NGO / Temple)</h2>
      <form onSubmit={handleSignup}>
        <input
          type="email"
          placeholder="Email"
          required
          value={email}
          onChange={e => setEmail(e.target.value)}
        /><br />
        <input
          type="password"
          placeholder="Password"
          required
          value={password}
          onChange={e => setPassword(e.target.value)}
        /><br />
        <select value={role} onChange={e => setRole(e.target.value)}>
          <option value="ngo">NGO</option>
          <option value="admin">Admin</option>
          <option value="temple">Temple</option>
        </select><br />
        <button type="submit">Sign Up</button>
      </form>
      {error && <div style={{ color: 'red' }}>{error}</div>}
      {success && <div style={{ color: 'green' }}>{success}</div>}
    </div>
  );
}
