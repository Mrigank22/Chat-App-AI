import React from 'react';
import { marked} from 'marked';
import DOMPurify from 'dompurify';
import hljs from 'highlight.js';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import Prism from 'prismjs';
import 'prismjs/themes/prism.css';
import 'prismjs/themes/prism-okaidia.css';

// Set up marked to use highlight.js for code blocks
marked.setOptions({
  highlight: function (code, language) {
    const validLanguage = hljs.getLanguage(language) ? language : 'plaintext';
    return Prism.highlight(code, Prism.languages[validLanguage], validLanguage);
  },
});

const MarkdownRenderer = ({ content }) => {
  const html = DOMPurify.sanitize(marked(content));

  const handleCopy = (content) => {
    console.log('Copied to clipboard:', content);
  };

  return (
    <div className="markdown-body">
      <CopyToClipboard text={content}>
        <button className="copy-btn" onClick={handleCopy}>Copy</button>
      </CopyToClipboard>
      <div dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  );
};

export default MarkdownRenderer