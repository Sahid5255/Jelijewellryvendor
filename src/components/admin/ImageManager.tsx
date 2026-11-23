import { ImagePlus, Replace, Star, Trash2 } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { ALLOWED_IMAGE_TYPES, MAX_IMAGES_PER_PRODUCT, MAX_IMAGE_BYTES, validateImageFile } from '../../services/adminService';

/** One image in the editor: either already stored (url only) or newly picked (file + local preview). */
export interface ImageEntry {
  id: string;
  url: string;
  file?: File;
}

interface Props {
  images: ImageEntry[];
  onChange: (next: ImageEntry[]) => void;
  onError: (message: string) => void;
}

let counter = 0;
export const newImageId = () => `img-${Date.now()}-${counter++}`;

export default function ImageManager({ images, onChange, onError }: Props) {
  const addRef = useRef<HTMLInputElement>(null);
  const replaceRef = useRef<HTMLInputElement>(null);
  const replaceId = useRef<string | null>(null);
  const previews = useRef(new Set<string>());

  // Free blob URLs when the editor goes away.
  useEffect(() => {
    const set = previews.current;
    return () => set.forEach((u) => URL.revokeObjectURL(u));
  }, []);

  const toEntry = (file: File): ImageEntry => {
    const url = URL.createObjectURL(file);
    previews.current.add(url);
    return { id: newImageId(), url, file };
  };

  const addFiles = (list: FileList | null) => {
    if (!list) return;
    const accepted: ImageEntry[] = [];
    for (const file of Array.from(list)) {
      if (images.length + accepted.length >= MAX_IMAGES_PER_PRODUCT) {
        onError(`You can add up to ${MAX_IMAGES_PER_PRODUCT} images per product.`);
        break;
      }
      const problem = validateImageFile(file);
      if (problem) {
        onError(problem);
        continue;
      }
      accepted.push(toEntry(file));
    }
    if (accepted.length) onChange([...images, ...accepted]);
    if (addRef.current) addRef.current.value = '';
  };

  const replaceFile = (list: FileList | null) => {
    const file = list?.[0];
    const id = replaceId.current;
    if (replaceRef.current) replaceRef.current.value = '';
    if (!file || !id) return;
    const problem = validateImageFile(file);
    if (problem) return onError(problem);
    onChange(images.map((img) => (img.id === id ? { ...toEntry(file), id } : img)));
  };

  const makeMain = (id: string) => {
    const picked = images.find((i) => i.id === id);
    if (picked) onChange([picked, ...images.filter((i) => i.id !== id)]);
  };

  return (
    <div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {images.map((img, i) => (
          <div key={img.id} className="border border-beige bg-white">
            <div className="relative aspect-square bg-cream">
              <img src={img.url} alt={`Product image ${i + 1}`} className="h-full w-full object-cover" />
              {i === 0 && <span className="absolute left-1.5 top-1.5 bg-ink px-2 py-0.5 text-[9px] uppercase tracking-widest text-white">Main</span>}
              {img.file && <span className="absolute right-1.5 top-1.5 bg-champagne px-2 py-0.5 text-[9px] uppercase tracking-widest">New</span>}
            </div>
            <div className="flex justify-between px-1 py-1">
              <button type="button" onClick={() => makeMain(img.id)} disabled={i === 0} className="p-1.5 hover:text-champagne-dark disabled:opacity-30" aria-label="Make main image" title="Make main image">
                <Star size={15} aria-hidden />
              </button>
              <button
                type="button"
                onClick={() => {
                  replaceId.current = img.id;
                  replaceRef.current?.click();
                }}
                className="p-1.5 hover:text-champagne-dark"
                aria-label="Replace image"
                title="Replace image"
              >
                <Replace size={15} aria-hidden />
              </button>
              <button type="button" onClick={() => onChange(images.filter((x) => x.id !== img.id))} className="p-1.5 hover:text-red-700" aria-label="Remove image" title="Remove image">
                <Trash2 size={15} aria-hidden />
              </button>
            </div>
          </div>
        ))}
        {images.length < MAX_IMAGES_PER_PRODUCT && (
          <button
            type="button"
            onClick={() => addRef.current?.click()}
            className="flex aspect-square flex-col items-center justify-center gap-2 border border-dashed border-champagne text-xs uppercase tracking-widest text-champagne-dark transition hover:bg-champagne-soft/40"
          >
            <ImagePlus size={22} aria-hidden /> Add images
          </button>
        )}
      </div>
      <input ref={addRef} type="file" accept={ALLOWED_IMAGE_TYPES.join(',')} multiple className="hidden" onChange={(e) => addFiles(e.target.files)} />
      <input ref={replaceRef} type="file" accept={ALLOWED_IMAGE_TYPES.join(',')} className="hidden" onChange={(e) => replaceFile(e.target.files)} />
      <p className="mt-3 text-xs text-ink/60">
        JPG, PNG or WebP, up to {MAX_IMAGE_BYTES / 1024 / 1024} MB each, max {MAX_IMAGES_PER_PRODUCT} images. The first image is the main one. Images are uploaded when you save.
      </p>
    </div>
  );
}
