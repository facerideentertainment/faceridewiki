
"use client";

import React, { useEffect, useRef, useState } from 'react';
import { Bold, Italic, Underline } from 'lucide-react';
import { Button } from './ui/button';
import { Separator } from './ui/separator';
import { cn } from '@/lib/utils';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  actions?: React.ReactNode;
}

const RichTextEditor = React.forwardRef<HTMLDivElement, RichTextEditorProps>(
  ({ value, onChange, actions, ...props }, forwardedRef) => {
    const editorRef = useRef<HTMLDivElement | null>(null);
    const [isBold, setIsBold] = useState(false);
    const [isItalic, setIsItalic] = useState(false);
    const [isUnderline, setIsUnderline] = useState(false);

    useEffect(() => {
        if (editorRef.current && value !== editorRef.current.innerHTML) {
            editorRef.current.innerHTML = value;
        }
    }, [value]);

    const setRefs = (el: HTMLDivElement | null) => {
      editorRef.current = el;
      if (typeof forwardedRef === 'function') {
        forwardedRef(el);
      } else if (forwardedRef) {
        (forwardedRef as React.MutableRefObject<HTMLDivElement | null>).current = el;
      }
    };
    
    const updateToolbar = () => {
        setIsBold(document.queryCommandState('bold'));
        setIsItalic(document.queryCommandState('italic'));
        setIsUnderline(document.queryCommandState('underline'));
    };

    useEffect(() => {
        const handleSelectionChange = () => {
            if (editorRef.current?.contains(document.getSelection()?.anchorNode || null)) {
                updateToolbar();
            }
        };

        document.addEventListener('selectionchange', handleSelectionChange);
        return () => document.removeEventListener('selectionchange', handleSelectionChange);
    }, []);

    const handleFormat = (command: string) => {
      editorRef.current?.focus();
      document.execCommand(command, false);
      if (editorRef.current) {
        onChange(editorRef.current.innerHTML);
        updateToolbar();
      }
    };

    const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
      onChange((e.target as HTMLDivElement).innerHTML);
    };

    return (
      <div className="rounded-md border border-input bg-background">
        <div className="flex items-center justify-between border-b p-2">
          <div className='flex items-center gap-1'>
            <Button
              type='button'
              variant={isBold ? "secondary" : "outline"}
              size="sm"
              onMouseDown={(e) => { e.preventDefault(); handleFormat('bold'); }}
              title="Bold"
            >
              <Bold className="h-4 w-4" />
            </Button>
            <Button
              type='button'
              variant={isItalic ? "secondary" : "outline"}
              size="sm"
              onMouseDown={(e) => { e.preventDefault(); handleFormat('italic'); }}
              title="Italic"
            >
              <Italic className="h-4 w-4" />
            </Button>
            <Button
              type='button'
              variant={isUnderline ? "secondary" : "outline"}
              size="sm"
              onMouseDown={(e) => { e.preventDefault(); handleFormat('underline'); }}
              title="Underline"
            >
              <Underline className="h-4 w-4" />
            </Button>
          </div>
          {actions}
        </div>
        <div
          ref={setRefs}
          contentEditable
          suppressContentEditableWarning={true}
          onInput={handleInput}
          onMouseUp={updateToolbar}
          onKeyUp={updateToolbar}
          className="prose-base md:prose-lg dark:prose-invert max-w-none font-body text-foreground/90 whitespace-pre-wrap min-h-[400px] resize-y p-4 focus-visible:outline-none"
          {...props}
        />
      </div>
    );
  }
);

RichTextEditor.displayName = 'RichTextEditor';

export { RichTextEditor };
