import React, { useEffect, useState } from 'react';
import { Plus, Save, Trash2, Loader2, RefreshCw } from 'lucide-react';
import { fetchArticlesOrThrow, createArticle, updateArticle, deleteArticle } from '../services/api';

const MAX_ARTICLES = 12; // must match MAX_ARTICLES in Ecommerce/api_views.py
const NEW_KEY = 'new';

const headingStyle = { fontFamily: 'var(--font-display)', fontSize: '18px', letterSpacing: '0.06em' };

export default function ArticlesPanel() {
  const [articles, setArticles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  // Edits stay as drafts until that card's Save button is pressed. Key = article id, or NEW_KEY for an unsaved card.
  const [drafts, setDrafts] = useState({});
  const [status, setStatus] = useState({});

  const load = async () => {
    setIsLoading(true);
    setLoadError('');
    try {
      setArticles(await fetchArticlesOrThrow());
    } catch (err) {
      setLoadError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const draftFor = (key, saved) => ({
    title: saved?.title || '',
    subtitle: saved?.subtitle || '',
    image: saved?.image || '',
    file: null,
    previewUrl: '',
    ...(drafts[key] || {}),
  });

  const setDraft = (key, saved, patch) => {
    setDrafts((prev) => ({ ...prev, [key]: { ...draftFor(key, saved), ...patch } }));
    setStatus((prev) => ({ ...prev, [key]: undefined }));
  };

  const isDirty = (key, saved) => {
    const d = drafts[key];
    if (!d) return false;
    if (key === NEW_KEY) return Boolean(d.title?.trim()) && Boolean(d.file || d.image?.trim());
    return Boolean(d.file) || d.title !== saved.title || d.subtitle !== saved.subtitle || d.image !== saved.image;
  };

  const clearDraft = (key) => {
    const previewUrl = drafts[key]?.previewUrl;
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setDrafts((prev) => {
      const { [key]: _removed, ...rest } = prev;
      return rest;
    });
  };

  const handleFileChosen = (key, saved, file) => {
    if (!file) return;
    const previous = drafts[key]?.previewUrl;
    if (previous) URL.revokeObjectURL(previous);
    setDraft(key, saved, { file, previewUrl: URL.createObjectURL(file) });
  };

  const handleSave = async (key, saved) => {
    const d = draftFor(key, saved);
    setStatus((prev) => ({ ...prev, [key]: { state: 'saving' } }));
    try {
      if (key === NEW_KEY) {
        const created = await createArticle({ title: d.title, subtitle: d.subtitle, image: d.image }, d.file);
        setArticles((prev) => [...prev, created]);
      } else {
        const updated = await updateArticle(
          saved.id,
          { title: d.title, subtitle: d.subtitle, image: d.image !== saved.image ? d.image : undefined },
          d.file
        );
        setArticles((prev) => prev.map((a) => (a.id === saved.id ? updated : a)));
      }
      clearDraft(key);
      // A new article becomes a normal card, so its form just disappears
      setStatus((prev) => ({ ...prev, [key]: key === NEW_KEY ? undefined : { state: 'saved' } }));
    } catch (err) {
      setStatus((prev) => ({ ...prev, [key]: { state: 'error', message: err.message } }));
    }
  };

  const handleDelete = async (saved) => {
    if (!window.confirm(`Delete the article "${saved.title}"? This cannot be undone.`)) return;
    setStatus((prev) => ({ ...prev, [saved.id]: { state: 'saving' } }));
    try {
      await deleteArticle(saved.id);
      clearDraft(saved.id);
      setArticles((prev) => prev.filter((a) => a.id !== saved.id));
    } catch (err) {
      setStatus((prev) => ({ ...prev, [saved.id]: { state: 'error', message: err.message } }));
    }
  };

  const renderCard = (key, saved) => {
    const d = draftFor(key, saved);
    const dirty = isDirty(key, saved);
    const st = status[key];
    const saving = st?.state === 'saving';
    const isNew = key === NEW_KEY;
    const fieldId = (name) => `article-${key}-${name}`;

    return (
      <div key={key} style={{ border: `1px solid ${dirty || isNew ? 'var(--color-gold)' : 'var(--border-light)'}`, padding: '18px', borderRadius: '6px', background: '#FAFAFA' }}>
        <div style={{ position: 'relative', height: '160px', borderRadius: '2px', overflow: 'hidden', background: '#111', marginBottom: '14px' }}>
          {(d.previewUrl || d.image) && (
            <img src={d.previewUrl || d.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.9 }} />
          )}
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,0,0,0.1) 40%, rgba(0,0,0,0.85) 100%)' }} />
          <div style={{ position: 'absolute', left: '14px', right: '14px', bottom: '12px', color: '#FFF' }}>
            <span style={{ display: 'block', fontSize: '9px', letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--color-gold-light)' }}>{d.subtitle || 'Subtitle'}</span>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: '14px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{d.title || 'Title'}</span>
          </div>
        </div>

        <div className="form-group" style={{ marginBottom: '12px' }}>
          <label className="form-label" htmlFor={fieldId('title')} style={{ fontSize: '10px' }}>Title:</label>
          <input id={fieldId('title')} className="form-input" maxLength={255} value={d.title} placeholder="e.g. The Alpine Glacial Sanctuary"
            onChange={(e) => setDraft(key, saved, { title: e.target.value })} />
        </div>

        <div className="form-group" style={{ marginBottom: '12px' }}>
          <label className="form-label" htmlFor={fieldId('subtitle')} style={{ fontSize: '10px' }}>Subtitle:</label>
          <input id={fieldId('subtitle')} className="form-input" maxLength={255} value={d.subtitle} placeholder="Short line shown above the title"
            onChange={(e) => setDraft(key, saved, { subtitle: e.target.value })} />
        </div>

        <div className="form-group" style={{ marginBottom: '12px' }}>
          <label className="form-label" htmlFor={fieldId('file')} style={{ fontSize: '10px' }}>Upload Image:</label>
          <input id={fieldId('file')} type="file" accept="image/*" className="form-input" style={{ padding: '6px', fontSize: '11px' }}
            onChange={(e) => handleFileChosen(key, saved, e.target.files[0])} />
        </div>

        <div className="form-group" style={{ marginBottom: '14px' }}>
          <label className="form-label" htmlFor={fieldId('url')} style={{ fontSize: '10px' }}>Or Image URL:</label>
          <input id={fieldId('url')} className="form-input" style={{ fontSize: '11px' }} value={d.file ? '' : d.image}
            placeholder={d.file ? 'Using the uploaded file' : 'https://…'} disabled={Boolean(d.file)}
            onChange={(e) => setDraft(key, saved, { image: e.target.value })} />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <button type="button" className="btn-save" disabled={!dirty || saving} onClick={() => handleSave(key, saved)}
            style={{ padding: '9px 18px', display: 'flex', alignItems: 'center', gap: '6px', opacity: !dirty || saving ? 0.55 : 1 }}>
            {saving ? <Loader2 size={14} className="spinning" /> : <Save size={14} />}
            {saving ? 'SAVING…' : isNew ? 'ADD ARTICLE' : 'SAVE CHANGES'}
          </button>
          {isNew ? (
            <button type="button" onClick={() => { clearDraft(NEW_KEY); setStatus((prev) => ({ ...prev, [NEW_KEY]: undefined })); }}
              style={{ padding: '9px 14px', fontSize: '11px', fontWeight: 700, letterSpacing: '0.06em', border: '1px solid var(--border-light)', background: '#FFF', borderRadius: '2px' }}>
              CANCEL
            </button>
          ) : (
            <button type="button" onClick={() => handleDelete(saved)} disabled={saving} title="Delete this article"
              style={{ padding: '9px 12px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: 700, letterSpacing: '0.06em', color: '#b91c1c', border: '1px solid #fca5a5', background: '#fef2f2', borderRadius: '2px' }}>
              <Trash2 size={13} /> DELETE
            </button>
          )}
          {dirty && !isNew && !saving && <span style={{ fontSize: '11px', color: '#B26A00', fontWeight: 600 }}>Unsaved changes</span>}
          {!dirty && st?.state === 'saved' && <span style={{ fontSize: '11px', color: '#2E7D32', fontWeight: 600 }}>✓ Saved</span>}
        </div>
        {st?.state === 'error' && (
          <div style={{ marginTop: '10px', background: '#FDECEA', color: '#B3261E', fontSize: '12px', padding: '8px 10px', borderRadius: '2px' }}>
            Not saved: {st.message}
          </div>
        )}
      </div>
    );
  };

  const atLimit = articles.length >= MAX_ARTICLES;

  return (
    <div className="dashboard-panel">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '8px' }}>
        <div>
          <h2 style={headingStyle}>ARTICLES</h2>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            The cards in the “Articles” section of your store. Edit the title, subtitle or image, then press <strong>Save changes</strong> on that card.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button type="button" onClick={load} disabled={isLoading} title="Reload articles"
            style={{ padding: '9px 12px', border: '1px solid var(--border-light)', background: '#FFF', borderRadius: '2px', display: 'flex', alignItems: 'center' }}>
            <RefreshCw size={15} className={isLoading ? 'spinning' : ''} />
          </button>
          <button type="button" className="btn-discover" disabled={atLimit || drafts[NEW_KEY] !== undefined}
            onClick={() => setDraft(NEW_KEY, null, {})}
            title={atLimit ? `Up to ${MAX_ARTICLES} articles` : 'Add a new article'}
            style={{ background: '#0B0C0E', color: 'var(--color-gold)', borderColor: 'var(--color-gold)', display: 'flex', alignItems: 'center', gap: '6px', opacity: atLimit || drafts[NEW_KEY] !== undefined ? 0.5 : 1 }}>
            <Plus size={14} />
            <span>ADD ARTICLE</span>
          </button>
        </div>
      </div>
      <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '22px' }}>
        {articles.length} of {MAX_ARTICLES} articles
      </p>

      {loadError && (
        <div style={{ background: '#FDECEA', color: '#B3261E', fontSize: '13px', padding: '12px 14px', borderRadius: '2px', marginBottom: '16px' }}>
          Could not load articles: {loadError}
        </div>
      )}

      {!isLoading && !loadError && articles.length === 0 && !drafts[NEW_KEY] && (
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', padding: '24px 0', textAlign: 'center' }}>
          No articles yet — the Articles section is hidden on your store until you add one.
        </p>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '22px' }}>
        {articles.map((article) => renderCard(article.id, article))}
        {drafts[NEW_KEY] !== undefined && renderCard(NEW_KEY, null)}
      </div>
    </div>
  );
}
