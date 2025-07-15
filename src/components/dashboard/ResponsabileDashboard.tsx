import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { richiesteAPI, categorieAPI } from '../../services/api';
import type { RichiestaAcquisto, CategoriaAcquisto, CreateCategoriaDto, CreateRichiestaDto } from '../../types';

const ResponsabileDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [richieste, setRichieste] = useState<RichiestaAcquisto[]>([]);
  const [richiesteProcessate, setRichiesteProcessate] = useState<RichiestaAcquisto[]>([]);
  const [categorie, setCategorie] = useState<CategoriaAcquisto[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'richieste' | 'richiesteProcessate' | 'categorie'>('richieste');
  const [showCategoriaForm, setShowCategoriaForm] = useState(false);
  const [showRichiestaForm, setShowRichiestaForm] = useState(false);
  const [editingCategoria, setEditingCategoria] = useState<CategoriaAcquisto | null>(null);
  const [categoriaForm, setCategoriaForm] = useState<CreateCategoriaDto>({
    descrizione: '',
    costo: undefined
  });
  const [richiestaForm, setRichiestaForm] = useState<CreateRichiestaDto>({
    idCategoria: '',
    quantita: 1,
    costo: 0,
    motivazione: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [richiesteData, richiesteProcessateData, categorieData] = await Promise.all([
        richiesteAPI.getPending(),
        richiesteAPI.getProcessed(),
        categorieAPI.getAll()
      ]);
      console.log('Richieste ricevute:', richiesteData); // Debug log
      setRichieste(richiesteData);
      setRichiesteProcessate(richiesteProcessateData);
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

  // Calcola il costo automaticamente basato su categoria e quantità
  const calculateCosto = (idCategoria: string, quantita: number): number => {
    const categoria = categorie.find(c => (c._id || c.id) === idCategoria);
    if (categoria && categoria.costo) {
      return categoria.costo * quantita;
    }
    return 0;
  };

  const handleApprove = async (id: string) => {
    console.log('Tentativo di approvazione per ID:', id); // Debug log
    if (!id) {
      console.error('ID mancante per l\'approvazione');
      return;
    }
    try {
      await richiesteAPI.approve(id);
      loadData();
    } catch (error) {
      console.error('Errore nell\'approvazione:', error);
    }
  };

  const handleReject = async (id: string) => {
    console.log('Tentativo di rifiuto per ID:', id); // Debug log
    if (!id) {
      console.error('ID mancante per il rifiuto');
      return;
    }
    try {
      await richiesteAPI.reject(id);
      loadData();
    } catch (error) {
      console.error('Errore nel rifiuto:', error);
    }
  };

  const handleCategoriaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCategoria) {
        const categoriaId = editingCategoria._id || editingCategoria.id;
        await categorieAPI.update(categoriaId!, categoriaForm);
        setEditingCategoria(null);
      } else {
        await categorieAPI.create(categoriaForm);
      }
      setCategoriaForm({ descrizione: '', costo: undefined });
      setShowCategoriaForm(false);
      loadData();
    } catch (error) {
      console.error('Errore nella gestione della categoria:', error);
    }
  };

  const handleEditCategoria = (categoria: CategoriaAcquisto) => {
    setEditingCategoria(categoria);
    setCategoriaForm({
      descrizione: categoria.descrizione,
      costo: categoria.costo
    });
    setShowCategoriaForm(true);
  };

  const handleDeleteCategoria = async (id: string) => {
    if (window.confirm('Sei sicuro di voler eliminare questa categoria?')) {
      try {
        await categorieAPI.delete(id);
        loadData();
      } catch (error) {
        console.error('Errore nell\'eliminazione della categoria:', error);
        // Mostra un messaggio di errore più specifico
        if (error && typeof error === 'object' && 'response' in error) {
          const apiError = error as { response?: { data?: { message?: string } } };
          alert(apiError.response?.data?.message || 'Errore nell\'eliminazione della categoria');
        }
      }
    }
  };

  const handleChangeStatus = async (id: string, nuovoStato: 'In attesa' | 'Approvata' | 'Rifiutata') => {
    try {
      await richiesteAPI.changeStatus(id, nuovoStato);
      loadData();
    } catch (error) {
      console.error('Errore nel cambio stato:', error);
    }
  };

  const handleDeleteRichiesta = async (id: string) => {
    if (window.confirm('Sei sicuro di voler eliminare questa richiesta?')) {
      try {
        await richiesteAPI.delete(id);
        loadData();
      } catch (error) {
        console.error('Errore nell\'eliminazione della richiesta:', error);
      }
    }
  };

  const handleRichiestaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await richiesteAPI.create(richiestaForm);
      setRichiestaForm({ idCategoria: '', quantita: 1, costo: 0, motivazione: '' });
      setShowRichiestaForm(false);
      loadData();
    } catch (error) {
      console.error('Errore nella creazione della richiesta:', error);
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
          <span className="navbar-brand">Dashboard Responsabile</span>
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
        <ul className="nav nav-tabs mb-4">
          <li className="nav-item">
            <button
              onClick={() => setActiveTab('richieste')}
              className={`nav-link ${activeTab === 'richieste' ? 'active' : ''}`}
            >
              Richieste in Attesa
            </button>
          </li>
          <li className="nav-item">
            <button
              onClick={() => setActiveTab('richiesteProcessate')}
              className={`nav-link ${activeTab === 'richiesteProcessate' ? 'active' : ''}`}
            >
              Richieste Processate
            </button>
          </li>
          <li className="nav-item">
            <button
              onClick={() => setActiveTab('categorie')}
              className={`nav-link ${activeTab === 'categorie' ? 'active' : ''}`}
            >
              Gestione Categorie
            </button>
          </li>
        </ul>

        {activeTab === 'richieste' && (
          <div>
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h2>Richieste in Attesa di Approvazione</h2>
              <button
                onClick={() => setShowRichiestaForm(true)}
                className="btn btn-primary"
              >
                Nuova Richiesta
              </button>
            </div>

            {showRichiestaForm && (
              <div className="card mb-4">
                <div className="card-body">
                  <h5 className="card-title mb-3">Nuova Richiesta</h5>
                  <form onSubmit={handleRichiestaSubmit}>
                    <div className="mb-3">
                      <label className="form-label">Categoria</label>
                      <select
                        required
                        value={richiestaForm.idCategoria}
                        onChange={(e) => {
                          const newIdCategoria = e.target.value;
                          const newCosto = calculateCosto(newIdCategoria, richiestaForm.quantita);
                          setRichiestaForm({ 
                            ...richiestaForm, 
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
                          value={richiestaForm.quantita}
                          onChange={(e) => {
                            const newQuantita = parseInt(e.target.value);
                            const newCosto = calculateCosto(richiestaForm.idCategoria, newQuantita);
                            setRichiestaForm({ 
                              ...richiestaForm, 
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
                          value={richiestaForm.costo}
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
                        value={richiestaForm.motivazione}
                        onChange={(e) => setRichiestaForm({ ...richiestaForm, motivazione: e.target.value })}
                        className="form-control"
                        rows={3}
                      />
                    </div>
                    <div className="d-flex gap-2 justify-content-end">
                      <button
                        type="button"
                        onClick={() => {
                          setShowRichiestaForm(false);
                          setRichiestaForm({ idCategoria: '', quantita: 1, costo: 0, motivazione: '' });
                        }}
                        className="btn btn-secondary"
                      >
                        Annulla
                      </button>
                      <button
                        type="submit"
                        className="btn btn-primary"
                      >
                        Crea
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
                            <br />
                            <small className="text-muted">
                              Richiedente: {typeof richiesta.idUtente === 'string' 
                                ? richiesta.idUtente 
                                : `${richiesta.idUtente.firstName} ${richiesta.idUtente.lastName}`
                              }
                            </small>
                          </div>
                          <div className="d-flex gap-2 ms-3">
                            <button
                              onClick={() => handleApprove(richiestaId)}
                              className="btn btn-success btn-sm"
                            >
                              Approva
                            </button>
                            <button
                              onClick={() => handleReject(richiestaId)}
                              className="btn btn-danger btn-sm"
                            >
                              Rifiuta
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                {richieste.length === 0 && (
                  <div className="text-center py-5 text-muted">
                    Nessuna richiesta in attesa di approvazione
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'richiesteProcessate' && (
          <div>
            <h2 className="mb-4">Richieste Approvate e Rifiutate</h2>
            <div className="card">
              <div className="card-body p-0">
                <div className="list-group list-group-flush">
                  {richiesteProcessate.map((richiesta) => {
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
                              Data Richiesta: {new Date(richiesta.dataRichiesta).toLocaleDateString('it-IT')}
                            </small>
                            {richiesta.dataapprovazione && (
                              <>
                                <br />
                                <small className="text-muted">
                                  Data {richiesta.stato === 'Approvata' ? 'Approvazione' : 'Rifiuto'}: {new Date(richiesta.dataapprovazione).toLocaleDateString('it-IT')}
                                </small>
                              </>
                            )}
                            <br />
                            <small className="text-muted">
                              Richiedente: {typeof richiesta.idUtente === 'string' 
                                ? richiesta.idUtente 
                                : `${richiesta.idUtente.firstName} ${richiesta.idUtente.lastName}`
                              }
                            </small>
                            {richiesta.idapprovatore && typeof richiesta.idapprovatore !== 'string' && (
                              <>
                                <br />
                                <small className="text-muted">
                                  {richiesta.stato === 'Approvata' ? 'Approvata da' : 'Rifiutata da'}: {richiesta.idapprovatore.firstName} {richiesta.idapprovatore.lastName}
                                </small>
                              </>
                            )}
                          </div>
                          <div className="d-flex gap-2 ms-3">
                            <div className="dropdown">
                              <button
                                className="btn btn-outline-secondary btn-sm dropdown-toggle"
                                type="button"
                                data-bs-toggle="dropdown"
                                aria-expanded="false"
                              >
                                Cambia Stato
                              </button>
                              <ul className="dropdown-menu">
                                <li>
                                  <button
                                    className="dropdown-item"
                                    onClick={() => handleChangeStatus(richiestaId, 'In attesa')}
                                  >
                                    In Attesa
                                  </button>
                                </li>
                                <li>
                                  <button
                                    className="dropdown-item"
                                    onClick={() => handleChangeStatus(richiestaId, 'Approvata')}
                                  >
                                    Approvata
                                  </button>
                                </li>
                                <li>
                                  <button
                                    className="dropdown-item"
                                    onClick={() => handleChangeStatus(richiestaId, 'Rifiutata')}
                                  >
                                    Rifiutata
                                  </button>
                                </li>
                              </ul>
                            </div>
                            <button
                              onClick={() => handleDeleteRichiesta(richiestaId)}
                              className="btn btn-danger btn-sm"
                            >
                              Elimina
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                {richiesteProcessate.length === 0 && (
                  <div className="text-center py-5 text-muted">
                    Nessuna richiesta processata trovata
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'categorie' && (
          <div>
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h2>Gestione Categorie</h2>
              <button
                onClick={() => setShowCategoriaForm(true)}
                className="btn btn-primary"
              >
                Nuova Categoria
              </button>
            </div>

            {showCategoriaForm && (
              <div className="card mb-4">
                <div className="card-body">
                  <h5 className="card-title mb-3">
                    {editingCategoria ? 'Modifica Categoria' : 'Nuova Categoria'}
                  </h5>
                  <form onSubmit={handleCategoriaSubmit}>
                    <div className="mb-3">
                      <label className="form-label">Descrizione</label>
                      <input
                        type="text"
                        required
                        value={categoriaForm.descrizione}
                        onChange={(e) => setCategoriaForm({ ...categoriaForm, descrizione: e.target.value })}
                        className="form-control"
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Costo</label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={categoriaForm.costo || ''}
                        onChange={(e) => setCategoriaForm({ 
                          ...categoriaForm, 
                          costo: e.target.value ? parseFloat(e.target.value) : undefined 
                        })}
                        className="form-control"
                      />
                    </div>
                    <div className="d-flex gap-2 justify-content-end">
                      <button
                        type="button"
                        onClick={() => {
                          setShowCategoriaForm(false);
                          setEditingCategoria(null);
                          setCategoriaForm({ descrizione: '', costo: undefined });
                        }}
                        className="btn btn-secondary"
                      >
                        Annulla
                      </button>
                      <button
                        type="submit"
                        className="btn btn-primary"
                      >
                        {editingCategoria ? 'Aggiorna' : 'Crea'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            <div className="card">
              <div className="card-body p-0">
                <div className="list-group list-group-flush">
                  {categorie.map((categoria) => (
                    <div key={categoria._id || categoria.id} className="list-group-item">
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <h6 className="mb-0">{categoria.descrizione}</h6>
                          {categoria.costo && (
                            <small className="text-muted">
                              Costo: €{categoria.costo}
                            </small>
                          )}
                        </div>
                        <div className="d-flex gap-2">
                          <button
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => handleEditCategoria(categoria)}
                          >
                            Modifica
                          </button>
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => handleDeleteCategoria(categoria._id || categoria.id!)}
                          >
                            Elimina
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {categorie.length === 0 && (
                  <div className="text-center py-5 text-muted">
                    Nessuna categoria trovata
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResponsabileDashboard; 