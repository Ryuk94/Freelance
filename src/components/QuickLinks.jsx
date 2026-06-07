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
      title: typeof link.title === 'string' && link.title.trim() ? link.title.trim() : link.url ?? 'LINK',
      url: typeof link.url === 'string' ? link.url : '',
    };
  }

  return { title: 'LINK', url: '' };
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
    <section className="space-y-3 bg-white/[0.04] p-4">
      <div>
        <div className="text-[10px] uppercase tracking-[0.7em] text-neutral-500">[ QUICK LINKS ]</div>
        <p className="mt-2 text-[11px] uppercase tracking-[0.3em] text-neutral-500">
          launch points for files, references, and shared workspaces
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {links.length > 0 ? (
          links.map((link) => (
            <a
              key={`${link.title}-${link.url}`}
              href={link.url}
              target="_blank"
              rel="noreferrer"
              className="bg-black/40 px-4 py-3 transition hover:bg-white/[0.1]"
            >
              <div className="text-xs font-bold uppercase tracking-[0.35em] text-neon-green">{link.title}</div>
              <div className="mt-1 truncate text-[10px] uppercase tracking-[0.35em] text-neutral-500">{link.url}</div>
            </a>
          ))
        ) : (
          <div className="bg-black/40 px-4 py-3 text-[10px] uppercase tracking-[0.45em] text-neutral-500">
            no quick links yet
          </div>
        )}
      </div>

      <form onSubmit={handleAddLink} className="grid gap-2 bg-black/55 p-3 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.3fr)_auto]">
        <input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="TITLE"
          className="w-full bg-black/70 px-3 py-3 text-xs uppercase tracking-[0.35em] text-neon-green outline-none placeholder:text-neutral-600"
        />
        <input
          value={url}
          onChange={(event) => setUrl(event.target.value)}
          placeholder="URL"
          className="w-full bg-black/70 px-3 py-3 text-xs uppercase tracking-[0.35em] text-neon-green outline-none placeholder:text-neutral-600"
        />
        <button
          type="submit"
          className="bg-neon-green px-4 py-3 text-xs font-bold uppercase tracking-[0.55em] text-black transition hover:bg-neon-green/90"
          aria-label="Add quick link"
        >
          +
        </button>
      </form>
    </section>
  );
}
