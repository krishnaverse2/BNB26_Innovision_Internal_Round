import { useState, useRef, useEffect } from 'react';
import { RotateCcw, Copy, Check, Terminal, Maximize2, Type } from 'lucide-react';

export default function CodeEditor({
  code,
  onChange,
  onReset,
  language = 'javascript',
  fontSize = 14,
  onFontSizeChange,
  readOnly = false,
  minHeight = 360,
}) {
  const textareaRef = useRef(null);
  const gutterRef = useRef(null);
  const [copied, setCopied] = useState(false);

  // Split code into lines for gutter
  const lines = (code || '').replace(/\r\n/g, '\n').split('\n');
  const lineCount = Math.max(lines.length, 1);

  // Sync gutter scroll with textarea
  function handleScroll(e) {
    if (gutterRef.current) {
      gutterRef.current.scrollTop = e.target.scrollTop;
    }
  }

  // Handle Tab key and Auto-closing pairs
  function handleKeyDown(e) {
    if (readOnly) return;
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const val = textarea.value;

    // Handle Tab key indentation
    if (e.key === 'Tab') {
      e.preventDefault();
      const spaces = '    '; // 4 spaces
      const updated = val.substring(0, start) + spaces + val.substring(end);
      onChange(updated);
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 4;
      }, 0);
      return;
    }

    // Auto-closing brackets & quotes
    const PAIRS = {
      '(': ')',
      '[': ']',
      '{': '}',
      '"': '"',
      "'": "'",
      '`': '`',
    };

    if (PAIRS[e.key]) {
      e.preventDefault();
      const open = e.key;
      const close = PAIRS[e.key];
      const selectedText = val.substring(start, end);
      const updated = val.substring(0, start) + open + selectedText + close + val.substring(end);
      onChange(updated);
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 1;
      }, 0);
      return;
    }

    // Auto-indent on Enter
    if (e.key === 'Enter') {
      e.preventDefault();
      // Find current line indent
      const lineStart = val.lastIndexOf('\n', start - 1) + 1;
      const currentLine = val.substring(lineStart, start);
      const matchIndent = currentLine.match(/^(\s+)/);
      let indent = matchIndent ? matchIndent[1] : '';

      // If line ends with ':' or '{', add extra indent
      if (currentLine.trim().endsWith(':') || currentLine.trim().endsWith('{')) {
        indent += '    ';
      }

      const updated = val.substring(0, start) + '\n' + indent + val.substring(end);
      onChange(updated);
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 1 + indent.length;
      }, 0);
      return;
    }
  }

  function handleCopy() {
    navigator.clipboard.writeText(code || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  return (
    <div
      className="code-editor-container"
      style={{
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 12,
        overflow: 'hidden',
        border: '1px solid #2d3748',
        background: '#181a20',
        color: '#f8fafc',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.25)',
      }}
    >
      {/* Editor Toolbar */}
      <div
        className="row between"
        style={{
          padding: '8px 14px',
          background: '#121418',
          borderBottom: '1px solid #232733',
          fontSize: 12,
        }}
      >
        <div className="row" style={{ gap: 8, alignItems: 'center' }}>
          <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#ff5f57' }} />
          <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#febc2e' }} />
          <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#28c840' }} />
          <span
            style={{
              marginLeft: 10,
              color: '#8fa0b5',
              fontFamily: 'var(--mono)',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              fontWeight: 600,
            }}
          >
            {language}
          </span>
          <span style={{ color: '#4b5563' }}>•</span>
          <span style={{ color: '#64748b' }}>{lineCount} lines</span>
        </div>

        <div className="row" style={{ gap: 6, alignItems: 'center' }}>
          {/* Font Size Toggle */}
          {onFontSizeChange ? (
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              title="Toggle font size"
              style={{ padding: '4px 8px', color: '#94a3b8', fontSize: 11 }}
              onClick={() => onFontSizeChange(fontSize === 14 ? 16 : fontSize === 16 ? 13 : 14)}
            >
              <Type size={13} style={{ marginRight: 3 }} />
              {fontSize}px
            </button>
          ) : null}

          {/* Copy Code */}
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            title="Copy Code"
            style={{ padding: '4px 8px', color: copied ? '#4ade80' : '#94a3b8', fontSize: 11 }}
            onClick={handleCopy}
          >
            {copied ? <Check size={13} style={{ marginRight: 4 }} /> : <Copy size={13} style={{ marginRight: 4 }} />}
            {copied ? 'Copied' : 'Copy'}
          </button>

          {/* Reset Code */}
          {onReset ? (
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              title="Reset to starter template"
              style={{ padding: '4px 8px', color: '#94a3b8', fontSize: 11 }}
              onClick={onReset}
            >
              <RotateCcw size={13} style={{ marginRight: 4 }} />
              Reset
            </button>
          ) : null}
        </div>
      </div>

      {/* Editor Body */}
      <div
        style={{
          display: 'flex',
          position: 'relative',
          minHeight,
          background: '#181a20',
          fontFamily: 'var(--mono)',
          fontSize,
          lineHeight: '1.6',
        }}
      >
        {/* Line Numbers Gutter */}
        <div
          ref={gutterRef}
          style={{
            userSelect: 'none',
            padding: '12px 10px 12px 14px',
            textAlign: 'right',
            color: '#4b556b',
            background: '#13151b',
            borderRight: '1px solid #232733',
            overflow: 'hidden',
            minWidth: 44,
          }}
        >
          {Array.from({ length: lineCount }).map((_, i) => (
            <div key={i} style={{ height: '1.6em' }}>
              {i + 1}
            </div>
          ))}
        </div>

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={code}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onScroll={handleScroll}
          readOnly={readOnly}
          spellCheck={false}
          autoCapitalize="off"
          autoComplete="off"
          style={{
            flex: 1,
            padding: '12px 16px',
            margin: 0,
            border: 'none',
            outline: 'none',
            background: 'transparent',
            color: '#f8fafc',
            fontFamily: 'var(--mono)',
            fontSize,
            lineHeight: '1.6',
            resize: 'vertical',
            minHeight,
            whiteSpace: 'pre',
            wordWrap: 'normal',
            overflowX: 'auto',
            tabSize: 4,
          }}
        />
      </div>
    </div>
  );
}
