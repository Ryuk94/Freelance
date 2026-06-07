import React, { useMemo, useState } from 'react';
import { db } from '../db';

function normalizeQuickLink(link) {
  if (typeof link === 'string') {
    return {
      title: (() => {
        try {
          return new URL(link).hostname.replace(/^www\./, '');
        } catch {
          return link;
        }
      })(),
      url: link,
    };
  }

  if (link && typeof link === 'object') {
    return {
      title: typeof link.title === 'string' && link.title.trim() ? link.title.trim() : link.url ?? 'Link',
      url: typeof link.url === 'string' ? link.url : '',
    };
  }

  return { title: 'Link', url: '' };
}

function normalizeQuickLinks(links) {
  return Array.isArray(links) ? links.map(normalizeQuickLink).filter((link) => link.url) : [];
}

function inferTitleFromUrl(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

export function QuickLinks({ client }) {
  const links = useMemo(() => normalizeQuickLinks(client?.quickLinks), [client?.quickLinks]);
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');

  const handleAddLink = async (event) => {
    event.preventDefault();
    if (!client?.id) {
      return;
    }

    const nextUrl = url.trim();
    if (!nextUrl) {
      return;
    }

    const nextTitle = title.trim() || inferTitleFromUrl(nextUrl);
    const nextLinks = [...links, { title: nextTitle, url: nextUrl }];

    try {
      await db.clients.update(client.id, {
        quickLinks: nextLinks,
        updatedAt: Date.now(),
      });
      setTitle('');
      setUrl('');
    } catch (error) {
      console.error('[FreelanceOS] Failed to add quick link', error);
    }
  };

  return (
    <section className="space-y-3">
      <div>
        <div className="text-xs uppercase tracking-[0.35em] text-neutral-500">Quick Links</div>
        <p className="mt-2 text-sm text-neutral-400">Simple launch points for files, references, and shared workspaces.</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {links.length > 0 ? (
          links.map((link) => (
            <a
              key={`${link.title}-${link.url}`}
              href={link.url}
              target="_blank"
              rel="noreferrer"
              className="rounded-2xl border border-white/5 bg-white/5 px-4 py-3 transition hover:bg-white/10"
            >
              <div className="text-sm font-semibold text-neutral-100">{link.title}</div>
              <div className="mt-1 truncate text-xs text-neutral-500">{link.url}</div>
            </a>
          ))
        ) : (
          <div className="rounded-2xl border border-dashed border-white/10 bg-white/5 px-4 py-3 text-sm text-neutral-400">
            No quick links yet.
          </div>
        )}
      </div>

      <form onSubmit={handleAddLink} className="grid gap-3 rounded-3xl border border-white/5 bg-neutral-950/60 p-4 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.3fr)_auto]">
        <input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Title"
          className="w-full rounded-2xl border border-white/5 bg-neutral-900 px-4 py-3 text-sm text-neutral-100 outline-none placeholder:text-neutral-600 focus:border-violet-400/40"
        />
        <input
          value={url}
          onChange={(event) => setUrl(event.target.value)}
          placeholder="URL"
          className="w-full rounded-2xl border border-white/5 bg-neutral-900 px-4 py-3 text-sm text-neutral-100 outline-none placeholder:text-neutral-600 focus:border-violet-400/40"
        />
        <button
          type="submit"
          className="rounded-2xl bg-emerald-400 px-4 py-3 text-lg font-black text-neutral-950 transition hover:bg-emerald-300"
          aria-label="Add quick link"
        >
          +
        </button>
      </form>
    </section>
  );
}
