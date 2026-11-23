import { Lock } from 'lucide-react';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import ImageManager, { newImageId, type ImageEntry } from '../../components/admin/ImageManager';
import PageLoader from '../../components/PageLoader';
import { useCatalog } from '../../context/CatalogContext';
import { useToast } from '../../context/ToastContext';
import { createProduct, listAllRemoteProducts, removeStoredImages, updateProduct, uploadImage } from '../../services/adminService';
import { localProducts } from '../../services/productService';
import type { Product, ProductInput, ProductSpec, ProductVariation } from '../../types';
import { parseCommaList } from '../../utils/format';

interface FormState {
  name: string;
  description: string;
  price: string;
  compareAtPrice: string;
  category: string;
  keywords: string;
  specs: string;
  variations: string;
  isFeatured: boolean;
  isNewArrival: boolean;
  isOnSale: boolean;
  isAvailable: boolean;
  isPublished: boolean;
}

const blank = (category: string): FormState => ({
  name: '',
  description: '',
  price: '',
  compareAtPrice: '',
  category,
  keywords: '',
  specs: '',
  variations: '',
  isFeatured: false,
  isNewArrival: true,
  isOnSale: false,
  isAvailable: true,
  isPublished: true,
});

const specsToText = (s: ProductSpec[]) => s.map((x) => `${x.label}: ${x.value}`).join('\n');
const textToSpecs = (t: string): ProductSpec[] =>
  t
    .split('\n')
    .map((line) => {
      const i = line.indexOf(':');
      return i > 0 ? { label: line.slice(0, i).trim(), value: line.slice(i + 1).trim() } : null;
    })
    .filter((s): s is ProductSpec => Boolean(s && s.label && s.value));

const variationsToText = (v: ProductVariation[]) => v.map((x) => `${x.label}: ${x.options.join(', ')}`).join('\n');
const textToVariations = (t: string): ProductVariation[] =>
  t
    .split('\n')
    .map((line) => {
      const i = line.indexOf(':');
      return i > 0 ? { label: line.slice(0, i).trim(), options: parseCommaList(line.slice(i + 1)) } : null;
    })
    .filter((v): v is ProductVariation => Boolean(v && v.label && v.options.length));

export default function AdminProductForm() {
  const { id } = useParams<{ id: string }>();
  const isNew = !id;
  const navigate = useNavigate();
  const { categories, refresh } = useCatalog();
  const { notify } = useToast();

  const [form, setForm] = useState<FormState>(() => blank(categories[0]?.slug ?? ''));
  const [images, setImages] = useState<ImageEntry[]>([]);
  const originalUrls = useRef<string[]>([]);
  const [loading, setLoading] = useState(!isNew);
  const [loadError, setLoadError] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const isReactId = Boolean(id && localProducts.some((p) => p.id === id));

  useEffect(() => {
    if (isNew || isReactId) {
      setLoading(false);
      return;
    }
    let active = true;
    listAllRemoteProducts()
      .then((all) => {
        if (!active) return;
        const p: Product | undefined = all.find((x) => x.remoteId === id);
        if (!p) {
          setLoadError('That product could not be found.');
          return;
        }
        originalUrls.current = p.images;
        setImages(p.images.filter((u) => u !== '/images/placeholder.svg').map((url) => ({ id: newImageId(), url })));
        setForm({
          name: p.name,
          description: p.description,
          price: String(p.price),
          compareAtPrice: p.compareAtPrice ? String(p.compareAtPrice) : '',
          category: p.category,
          keywords: p.keywords.join(', '),
          specs: specsToText(p.specs),
          variations: variationsToText(p.variations),
          isFeatured: p.isFeatured,
          isNewArrival: p.isNewArrival,
          isOnSale: p.isOnSale,
          isAvailable: p.isAvailable,
          isPublished: p.isPublished,
        });
      })
      .catch(() => active && setLoadError('Could not load the product from Supabase.'))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [id, isNew, isReactId]);

  if (isReactId) {
    return (
      <div className="max-w-xl">
        <h1 className="text-4xl">Protected product</h1>
        <p className="mt-4 flex items-start gap-2 text-ink/70">
          <Lock size={18} className="mt-1 shrink-0" aria-hidden />
          This product is part of the built-in React catalogue and can’t be edited or deleted from the dashboard. To manage it here, copy it to Supabase first (Products → “Copy React products to Supabase”).
        </p>
        <Link to="/admin/products" className="btn-outline mt-6">Back to products</Link>
      </div>
    );
  }
  if (loading) return <PageLoader />;
  if (loadError) {
    return (
      <div>
        <p className="text-red-700" role="alert">{loadError}</p>
        <Link to="/admin/products" className="btn-outline mt-6">Back to products</Link>
      </div>
    );
  }

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => setForm((f) => ({ ...f, [key]: value }));

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'Name is required.';
    const price = Number(form.price);
    if (form.price === '' || !Number.isFinite(price) || price < 0) e.price = 'Enter a valid price.';
    if (form.compareAtPrice !== '') {
      const c = Number(form.compareAtPrice);
      if (!Number.isFinite(c) || c < 0) e.compareAtPrice = 'Enter a valid original price.';
    }
    if (!form.category) e.category = 'Choose a category.';
    if (images.length === 0) e.images = 'Add at least one image.';
    return e;
  };

  const onSubmit = async (ev: FormEvent) => {
    ev.preventDefault();
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length > 0) return;
    setSaving(true);
    try {
      // Upload newly picked files; keep already-stored URLs as they are. Order is preserved.
      const urls: string[] = [];
      for (const img of images) urls.push(img.file ? await uploadImage(img.file) : img.url);

      const input: ProductInput = {
        name: form.name,
        description: form.description,
        price: Number(form.price),
        compareAtPrice: form.compareAtPrice === '' ? null : Number(form.compareAtPrice),
        category: form.category,
        images: urls,
        keywords: parseCommaList(form.keywords),
        specs: textToSpecs(form.specs),
        variations: textToVariations(form.variations),
        isFeatured: form.isFeatured,
        isNewArrival: form.isNewArrival,
        isOnSale: form.isOnSale,
        isAvailable: form.isAvailable,
        isPublished: form.isPublished,
      };

      if (isNew) await createProduct(input);
      else {
        await updateProduct(id as string, input);
        // Clean up uploaded images the admin removed or replaced.
        const removed = originalUrls.current.filter((u) => !urls.includes(u));
        await removeStoredImages(removed).catch(() => undefined);
      }
      notify(isNew ? 'Product created' : 'Product saved');
      await refresh();
      navigate('/admin/products');
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Could not save the product', 'error');
    } finally {
      setSaving(false);
    }
  };

  const err = (k: string) =>
    errors[k] ? (
      <p className="field-error" role="alert">
        {errors[k]}
      </p>
    ) : null;

  const check = (k: keyof FormState, label: string) => (
    <label className="flex cursor-pointer items-center gap-3 text-sm">
      <input type="checkbox" className="h-4 w-4 accent-champagne-dark" checked={Boolean(form[k])} onChange={(e) => set(k, e.target.checked as FormState[typeof k])} />
      {label}
    </label>
  );

  return (
    <form onSubmit={onSubmit} noValidate className="max-w-4xl">
      <h1 className="text-4xl">{isNew ? 'Add product' : 'Edit product'}</h1>

      <div className="mt-8 space-y-8">
        <section className="space-y-5 border border-beige bg-white p-6">
          <h2 className="font-serif text-2xl">Details</h2>
          <div>
            <label htmlFor="p-name" className="label">Name</label>
            <input id="p-name" className="input" value={form.name} onChange={(e) => set('name', e.target.value)} maxLength={160} />
            {err('name')}
          </div>
          <div>
            <label htmlFor="p-desc" className="label">Description</label>
            <textarea id="p-desc" rows={4} className="input" value={form.description} onChange={(e) => set('description', e.target.value)} />
          </div>
          <div className="grid gap-5 sm:grid-cols-3">
            <div>
              <label htmlFor="p-price" className="label">Price</label>
              <input id="p-price" inputMode="decimal" className="input" value={form.price} onChange={(e) => set('price', e.target.value)} />
              {err('price')}
            </div>
            <div>
              <label htmlFor="p-compare" className="label">Original price (optional)</label>
              <input id="p-compare" inputMode="decimal" className="input" value={form.compareAtPrice} onChange={(e) => set('compareAtPrice', e.target.value)} placeholder="Shown struck through" />
              {err('compareAtPrice')}
            </div>
            <div>
              <label htmlFor="p-cat" className="label">Category</label>
              <select id="p-cat" className="input" value={form.category} onChange={(e) => set('category', e.target.value)}>
                {categories.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
              </select>
              {err('category')}
            </div>
          </div>
          <div>
            <label htmlFor="p-kw" className="label">Search keywords (comma separated)</label>
            <input id="p-kw" className="input" value={form.keywords} onChange={(e) => set('keywords', e.target.value)} placeholder="pearl, bridal, gold" />
          </div>
        </section>

        <section className="border border-beige bg-white p-6">
          <h2 className="mb-4 font-serif text-2xl">Images</h2>
          <ImageManager images={images} onChange={setImages} onError={(m) => notify(m, 'error')} />
          {err('images')}
        </section>

        <section className="space-y-5 border border-beige bg-white p-6">
          <h2 className="font-serif text-2xl">Options &amp; specifications</h2>
          <div>
            <label htmlFor="p-var" className="label">Variations (one per line)</label>
            <textarea id="p-var" rows={3} className="input font-mono text-xs" value={form.variations} onChange={(e) => set('variations', e.target.value)} placeholder={'Ring size (US): 5, 6, 7, 8\nLength: 16 in, 18 in'} />
          </div>
          <div>
            <label htmlFor="p-spec" className="label">Specifications (one per line)</label>
            <textarea id="p-spec" rows={4} className="input font-mono text-xs" value={form.specs} onChange={(e) => set('specs', e.target.value)} placeholder={'Metal: Gold-tone plated\nStone: Cubic zirconia'} />
          </div>
        </section>

        <section className="grid gap-3 border border-beige bg-white p-6 sm:grid-cols-2">
          <h2 className="font-serif text-2xl sm:col-span-2">Visibility</h2>
          {check('isAvailable', 'Available to buy')}
          {check('isPublished', 'Published (visible in store)')}
          {check('isFeatured', 'Featured on homepage')}
          {check('isNewArrival', 'New arrival')}
          {check('isOnSale', 'On sale')}
        </section>
      </div>

      <div className="mt-8 flex gap-3">
        <button type="submit" className="btn-primary" disabled={saving}>{saving ? 'Saving…' : isNew ? 'Create product' : 'Save changes'}</button>
        <Link to="/admin/products" className="btn-outline">Cancel</Link>
      </div>
    </form>
  );
}
