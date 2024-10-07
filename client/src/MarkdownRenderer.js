import React from 'react';
import { marked} from 'marked';
import DOMPurify from 'dompurify';
import hljs from 'highlight.js';

// Set up marked to use highlight.js for code blocks
marked.setOptions({
  highlight: function (code, language) {
    const validLanguage = hljs.getLanguage(language) ? language : 'plaintext';
    return hljs.highlight(code, { language: validLanguage }).value;
  },
});

const MarkdownRenderer = ({ content }) => {
  // Convert markdown content to HTML and sanitize it
  const html = DOMPurify.sanitize(marked(content));

  return (
    <div
      className="markdown-body"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};

export default MarkdownRenderer;