import { Lock, Pencil, Trash2 } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import SmartImage from '../../components/SmartImage';
import { useCatalog } from '../../context/CatalogContext';
import { useToast } from '../../context/ToastContext';
import { deleteCategory, saveCategory, uploadImage, validateImageFile } from '../../services/adminService';
import type { Category } from '../../types';
import { slugify } from '../../utils/format';

interface Draft {
  slug: string;
  name: string;
  description: string;
  image: string;
  sortOrder: number;
  isNew: boolean;
}

export default function AdminCategories() {
  const { categories, refresh, status } = useCatalog();
  const { notify } = useToast();
  const [draft, setDraft] = useState<Draft | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const startNew = () => {
    setFile(null);
    setError('');
    setDraft({ slug: '', name: '', description: '', image: '', sortOrder: 100 + categories.length, isNew: true });
  };
  const startEdit = (c: Category) => {
    setFile(null);
    setError('');
    setDraft({ slug: c.slug, name: c.name, description: c.description, image: c.image, sortOrder: c.sortOrder, isNew: false });
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!draft) return;
    const slug = draft.isNew ? slugify(draft.name) : draft.slug;
    if (!draft.name.trim() || !slug) return setError('Please enter a category name.');
    if (draft.isNew && categories.some((c) => c.slug === slug)) return setError('A category with that name already exists.');
    setSaving(true);
    setError('');
    try {
      let image = draft.image;
      if (file) image = await uploadImage(file, 'categories');
      await saveCategory({ ...draft, slug, image }, draft.isNew);
      notify('Category saved');
      setDraft(null);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save the category.');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (c: Category) => {
    if (!window.confirm(`Delete the category “${c.name}”?`)) return;
    try {
      await deleteCategory(c.slug);
      notify('Category deleted');
      await refresh();
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Could not delete the category', 'error');
    }
  };

  return (
    <div className="max-w-4xl">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl">Categories</h1>
          <p className="mt-2 text-sm text-ink/60">
            <Lock size={12} className="mr-1 inline" aria-hidden /> The five built-in categories are protected. Add more for future jewellery types.
          </p>
        </div>
        <button type="button" className="btn-primary" onClick={startNew} disabled={status !== 'ok'}>Add category</button>
      </div>

      {status !== 'ok' && <p className="mt-6 text-sm text-ink/60">Connect to Supabase to add or edit categories.</p>}

      {draft && (
        <form onSubmit={submit} className="mt-8 space-y-5 border border-beige bg-white p-6" noValidate>
          <h2 className="font-serif text-2xl">{draft.isNew ? 'New category' : `Edit ${draft.name}`}</h2>
          <div>
            <label htmlFor="c-name" className="label">Name</label>
            <input id="c-name" className="input" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
            {draft.isNew && draft.name && <p className="mt-1 text-xs text-ink/50">URL: /category/{slugify(draft.name)}</p>}
          </div>
          <div>
            <label htmlFor="c-desc" className="label">Description</label>
            <textarea id="c-desc" rows={2} className="input" value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} />
          </div>
          <div>
            <label htmlFor="c-img" className="label">Image (JPG, PNG or WebP, max 5 MB)</label>
            <input
              id="c-img"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(e) => {
                const f = e.target.files?.[0] ?? null;
                const problem = f ? validateImageFile(f) : null;
                if (problem) {
                  setError(problem);
                  e.target.value = '';
                  return;
                }
                setError('');
                setFile(f);
              }}
              className="text-sm"
            />
            {(file || draft.image) && <img src={file ? URL.createObjectURL(file) : draft.image} alt="Category preview" className="mt-3 h-24 w-20 object-cover" />}
          </div>
          <div>
            <label htmlFor="c-order" className="label">Sort order</label>
            <input id="c-order" type="number" className="input max-w-[140px]" value={draft.sortOrder} onChange={(e) => setDraft({ ...draft, sortOrder: Number(e.target.value) || 0 })} />
          </div>
          {error && <p className="text-sm text-red-700" role="alert">{error}</p>}
          <div className="flex gap-3">
            <button type="submit" className="btn-primary" disabled={saving}>{saving ? 'Saving…' : 'Save category'}</button>
            <button type="button" className="btn-outline" onClick={() => setDraft(null)}>Cancel</button>
          </div>
        </form>
      )}

      <ul className="mt-8 divide-y divide-beige border border-beige bg-white">
        {categories.map((c) => (
          <li key={c.slug} className="flex items-center gap-4 px-4 py-3">
            <SmartImage src={c.image} alt="" className="h-14 w-11 object-cover" />
            <div className="flex-1">
              <p className="font-medium">{c.name}</p>
              <p className="text-xs text-ink/60">/category/{c.slug}</p>
            </div>
            {c.source === 'local' ? (
              <span className="inline-flex items-center gap-1 text-xs text-ink/50"><Lock size={12} aria-hidden /> Built-in</span>
            ) : (
              <div className="flex">
                <button type="button" className="p-2 hover:text-champagne-dark" onClick={() => startEdit(c)} aria-label={`Edit ${c.name}`}><Pencil size={16} aria-hidden /></button>
                <button type="button" className="p-2 hover:text-red-700" onClick={() => void remove(c)} aria-label={`Delete ${c.name}`}><Trash2 size={16} aria-hidden /></button>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
