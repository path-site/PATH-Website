import React from 'react';

export default function RichTextSection({ config = {}, title }) {
  const content = config.html || config.content || '';

  return (
    <section className="py-16 bg-white border-b border-stone-200/60">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {title && (
          <h2 className="font-serif-heading text-3xl font-bold text-stone-900 mb-6 pb-3 border-b border-stone-200">
            {title}
          </h2>
        )}
        <div 
          className="prose prose-stone max-w-none text-stone-700 leading-relaxed space-y-4"
          dangerouslySetInnerHTML={{ __html: content }}
        />
      </div>
    </section>
  );
}
