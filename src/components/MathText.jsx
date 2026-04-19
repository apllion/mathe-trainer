import { useMemo } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

export default function MathText({ text, display = false }) {
  const html = useMemo(() => {
    // Replace inline $...$ with rendered KaTeX
    return text.replace(/\$(.+?)\$/g, (_, tex) => {
      try {
        return katex.renderToString(tex, { displayMode: display, throwOnError: false });
      } catch {
        return tex;
      }
    });
  }, [text, display]);

  return <span dangerouslySetInnerHTML={{ __html: html }} />;
}
