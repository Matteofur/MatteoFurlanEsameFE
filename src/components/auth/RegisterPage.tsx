import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import type { RegisterRequest } from '../../types';

const RegisterPage: React.FC = () => {
  const [formData, setFormData] = useState<RegisterRequest>({
    firstName: '',
    lastName: '',
    username: '',
    password: '',
    role: 'Dipendente'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Assicuriamoci che il ruolo sia sempre "Dipendente"
      const registrationData = {
        ...formData,
        role: 'Dipendente' as const
      };
      await register(registrationData);
      navigate('/dashboard');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Errore durante la registrazione');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container d-flex align-items-center justify-content-center min-vh-100">
      <div className="col-12 col-md-8 col-lg-6">
        <div className="card shadow-sm p-4">
          <h2 className="mb-4 text-center">Crea il tuo account</h2>
          <form onSubmit={handleSubmit}>
            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label">Nome</label>
                <input
                  name="firstName"
                  type="text"
                  required
                  className="form-control"
                  placeholder="Nome"
                  value={formData.firstName}
                  onChange={handleChange}
                />
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label">Cognome</label>
                <input
                  name="lastName"
                  type="text"
                  required
                  className="form-control"
                  placeholder="Cognome"
                  value={formData.lastName}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div className="mb-3">
              <label className="form-label">Username</label>
              <input
                name="username"
                type="text"
                required
                className="form-control"
                placeholder="Username"
                value={formData.username}
                onChange={handleChange}
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Password</label>
              <input
                name="password"
                type="password"
                required
                className="form-control"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
              />
            </div>

            {error && (
              <div className="alert alert-danger text-center py-2">{error}</div>
            )}
            <div className="d-grid mb-2">
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary"
              >
                {loading ? 'Registrazione in corso...' : 'Registrati'}
              </button>
            </div>
            <div className="text-center">
              <Link to="/login">Hai già un account? Accedi</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage; 