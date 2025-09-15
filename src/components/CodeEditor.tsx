import { useEffect, useRef } from 'react';
import { EditorView, keymap, highlightActiveLine, highlightActiveLineGutter, lineNumbers } from '@codemirror/view';
import { EditorState } from '@codemirror/state';
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands';
import { searchKeymap, highlightSelectionMatches } from '@codemirror/search';
import { autocompletion, completionKeymap, closeBrackets, closeBracketsKeymap } from '@codemirror/autocomplete';
import { oneDark } from '@codemirror/theme-one-dark';
import { javascript } from '@codemirror/lang-javascript';
import { python } from '@codemirror/lang-python';
import { cpp } from '@codemirror/lang-cpp';

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  language: string;
  placeholder?: string;
}

const getLanguageExtension = (language: string) => {
  switch (language) {
    case 'javascript':
      return javascript();
    case 'python':
      return python();
    case 'cpp':
      return cpp();
    default:
      return javascript();
  }
};

const CodeEditor = ({ value, onChange, language, placeholder }: CodeEditorProps) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);

  useEffect(() => {
    if (!editorRef.current) return;

    const extensions = [
      lineNumbers(),
      highlightActiveLineGutter(),
      highlightActiveLine(),
      history(),
      autocompletion(),
      closeBrackets(),
      highlightSelectionMatches(),
      keymap.of([
        ...defaultKeymap,
        ...historyKeymap,
        ...completionKeymap,
        ...closeBracketsKeymap,
        ...searchKeymap,
      ]),
      oneDark,
      getLanguageExtension(language),
      EditorView.updateListener.of((update) => {
        if (update.docChanged) {
          onChange(update.state.doc.toString());
        }
      }),
      EditorView.theme({
        '&': {
          height: '100%',
          fontSize: '14px',
        },
        '.cm-editor': {
          height: '100%',
        },
        '.cm-scroller': {
          height: '100%',
        },
        '.cm-content': {
          padding: '16px',
          minHeight: '100%',
        },
        '.cm-focused': {
          outline: 'none',
        },
        '.cm-editor.cm-focused .cm-selectionBackground': {
          backgroundColor: 'hsl(217 92% 76% / 0.2)',
        },
        '.cm-cursor': {
          borderLeftColor: 'hsl(217 92% 76%)',
        },
      }),
    ];

    const state = EditorState.create({
      doc: value,
      extensions,
    });

    const view = new EditorView({
      state,
      parent: editorRef.current,
    });

    viewRef.current = view;

    return () => {
      view.destroy();
      viewRef.current = null;
    };
  }, [language]);

  useEffect(() => {
    if (viewRef.current && viewRef.current.state.doc.toString() !== value) {
      viewRef.current.dispatch({
        changes: {
          from: 0,
          to: viewRef.current.state.doc.length,
          insert: value,
        },
      });
    }
  }, [value]);

  return (
    <div className="h-full bg-editor-bg rounded-lg overflow-hidden">
      <div ref={editorRef} className="h-full" />
      {!value && placeholder && (
        <div className="absolute top-4 left-4 text-muted-foreground pointer-events-none text-sm">
          {placeholder}
        </div>
      )}
    </div>
  );
};

export default CodeEditor;