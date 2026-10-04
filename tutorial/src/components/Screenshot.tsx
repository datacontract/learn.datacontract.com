import { useState, type ComponentProps } from 'react'

// Markdown images: framed like a browser window, click to view full size
export function Screenshot({ src, alt, title }: ComponentProps<'img'>) {
  const [zoomed, setZoomed] = useState(false)
  return (
    <>
      <figure className="not-prose my-6">
        <button
          type="button"
          onClick={() => setZoomed(true)}
          className="block w-full cursor-zoom-in overflow-hidden rounded-xl border border-slate-200 bg-slate-50 shadow-sm transition hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
        >
          <div className="flex gap-1.5 border-b border-slate-200 px-3 py-2 dark:border-slate-800" aria-hidden="true">
            <span className="h-2.5 w-2.5 rounded-full bg-slate-300 dark:bg-slate-700" />
            <span className="h-2.5 w-2.5 rounded-full bg-slate-300 dark:bg-slate-700" />
            <span className="h-2.5 w-2.5 rounded-full bg-slate-300 dark:bg-slate-700" />
          </div>
          <img src={src} alt={alt} loading="lazy" className="block w-full" />
        </button>
        {(title ?? alt) && <figcaption className="mt-2 text-center text-sm text-slate-500">{title ?? alt}</figcaption>}
      </figure>
      {zoomed && (
        <div
          role="dialog"
          aria-label={alt}
          onClick={() => setZoomed(false)}
          className="fixed inset-0 z-50 flex cursor-zoom-out items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm"
        >
          <img src={src} alt={alt} className="max-h-full max-w-full rounded-lg shadow-2xl" />
        </div>
      )}
    </>
  )
}
