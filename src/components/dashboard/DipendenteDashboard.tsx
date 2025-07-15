import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { richiesteAPI, categorieAPI } from '../../services/api';
import type { RichiestaAcquisto, CategoriaAcquisto, CreateRichiestaDto } from '../../types';

const DipendenteDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [richieste, setRichieste] = useState<RichiestaAcquisto[]>([]);
  const [categorie, setCategorie] = useState<CategoriaAcquisto[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingRichiesta, setEditingRichiesta] = useState<RichiestaAcquisto | null>(null);
  const [formData, setFormData] = useState<CreateRichiestaDto>({
    idCategoria: '',
    quantita: 1,
    costo: 0,
    motivazione: ''
  });

  // Calcola il costo automaticamente basato su categoria e quantità
  const calculateCosto = (idCategoria: string, quantita: number): number => {
    const categoria = categorie.find(c => (c._id || c.id) === idCategoria);
    if (categoria && categoria.costo) {
      return categoria.costo * quantita;
    }
    return 0;
  };

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [richiesteData, categorieData] = await Promise.all([
        richiesteAPI.getAll(),
        categorieAPI.getAll()
      ]);
      setRichieste(richiesteData);
      setCategorie(categorieData);
    } catch (error) {
      console.error('Errore nel caricamento dei dati:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRichiestaId = (richiesta: RichiestaAcquisto): string => {
    return richiesta._id || richiesta.id || '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingRichiesta) {
        const richiestaId = getRichiestaId(editingRichiesta);
        await richiesteAPI.update(richiestaId, formData);
      } else {
        await richiesteAPI.create(formData);
      }
      setFormData({ idCategoria: '', quantita: 1, costo: 0, motivazione: '' });
      setShowForm(false);
      setEditingRichiesta(null);
      loadData();
    } catch (error) {
      console.error('Errore nel salvataggio:', error);
    }
  };

  const handleEdit = (richiesta: RichiestaAcquisto) => {
    setEditingRichiesta(richiesta);
    const costoCalcolato = calculateCosto(richiesta.idCategoria, richiesta.quantita);
    setFormData({
      idCategoria: richiesta.idCategoria,
      quantita: richiesta.quantita,
      costo: costoCalcolato,
      motivazione: richiesta.motivazione
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Sei sicuro di voler eliminare questa richiesta?')) {
      try {
        await richiesteAPI.delete(id);
        loadData();
      } catch (error) {
        console.error('Errore nell\'eliminazione:', error);
      }
    }
  };

  const getStatoBadge = (stato: string) => {
    switch (stato) {
      case 'In attesa': return 'badge bg-warning text-dark';
      case 'Approvata': return 'badge bg-success';
      case 'Rifiutata': return 'badge bg-danger';
      default: return 'badge bg-secondary';
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Caricamento...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-vh-100 bg-light">
      <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
        <div className="container">
          <span className="navbar-brand">Dashboard Dipendente</span>
          <div className="navbar-nav ms-auto">
            <span className="navbar-text me-3">
              Benvenuto, {user?.firstName} {user?.lastName}
            </span>
            <button
              onClick={logout}
              className="btn btn-outline-light btn-sm"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="container py-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2>Le mie richieste</h2>
          <button
            onClick={() => setShowForm(true)}
            className="btn btn-primary"
          >
            Nuova Richiesta
          </button>
        </div>

        {showForm && (
          <div className="card mb-4">
            <div className="card-body">
              <h5 className="card-title mb-3">
                {editingRichiesta ? 'Modifica Richiesta' : 'Nuova Richiesta'}
              </h5>
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label">Categoria</label>
                  <select
                    required
                    value={formData.idCategoria}
                    onChange={(e) => {
                      const newIdCategoria = e.target.value;
                      const newCosto = calculateCosto(newIdCategoria, formData.quantita);
                      setFormData({ 
                        ...formData, 
                        idCategoria: newIdCategoria,
                        costo: newCosto
                      });
                    }}
                    className="form-select"
                  >
                    <option value="">Seleziona categoria</option>
                    {categorie.map((cat) => (
                      <option key={cat._id || cat.id} value={cat._id || cat.id}>
                        {cat.descrizione}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Quantità</label>
                    <input
                      type="number"
                      min="1"
                      required
                      value={formData.quantita}
                      onChange={(e) => {
                        const newQuantita = parseInt(e.target.value);
                        const newCosto = calculateCosto(formData.idCategoria, newQuantita);
                        setFormData({ 
                          ...formData, 
                          quantita: newQuantita,
                          costo: newCosto
                        });
                      }}
                      className="form-control"
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Costo</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      required
                      value={formData.costo}
                      readOnly
                      className="form-control bg-light"
                    />
                  </div>
                </div>
                <div className="mb-3">
                  <label className="form-label">Motivazione</label>
                  <textarea
                    required
                    minLength={10}
                    value={formData.motivazione}
                    onChange={(e) => setFormData({ ...formData, motivazione: e.target.value })}
                    className="form-control"
                    rows={3}
                  />
                </div>
                <div className="d-flex gap-2 justify-content-end">
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      setEditingRichiesta(null);
                      setFormData({ idCategoria: '', quantita: 1, costo: 0, motivazione: '' });
                    }}
                    className="btn btn-secondary"
                  >
                    Annulla
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                  >
                    {editingRichiesta ? 'Aggiorna' : 'Crea'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="card">
          <div className="card-body p-0">
            <div className="list-group list-group-flush">
              {richieste.map((richiesta) => {
                const richiestaId = getRichiestaId(richiesta);
                return (
                  <div key={richiestaId} className="list-group-item">
                    <div className="d-flex justify-content-between align-items-start">
                      <div className="flex-grow-1">
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <h6 className="mb-0">
                            {categorie.find(c => (c._id || c.id) === richiesta.idCategoria)?.descrizione}
                          </h6>
                          <span className={getStatoBadge(richiesta.stato)}>
                            {richiesta.stato}
                          </span>
                        </div>
                        <p className="text-muted mb-1">
                          Quantità: {richiesta.quantita} - Costo: €{richiesta.costo}
                        </p>
                        <p className="mb-1">{richiesta.motivazione}</p>
                        <small className="text-muted">
                          Data: {new Date(richiesta.dataRichiesta).toLocaleDateString('it-IT')}
                        </small>
                      </div>
                      {richiesta.stato === 'In attesa' && (
                        <div className="d-flex gap-2 ms-3">
                          <button
                            onClick={() => handleEdit(richiesta)}
                            className="btn btn-outline-primary btn-sm"
                          >
                            Modifica
                          </button>
                          <button
                            onClick={() => handleDelete(richiestaId)}
                            className="btn btn-outline-danger btn-sm"
                          >
                            Elimina
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            {richieste.length === 0 && (
              <div className="text-center py-5 text-muted">
                Nessuna richiesta trovata
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DipendenteDashboard; 