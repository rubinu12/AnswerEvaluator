// components/admin/MagicEditor.tsx
'use client';
import React, { useEffect } from 'react';
import {
  EditorContent,
  useEditor,
  Editor as TiptapEditor,
} from '@tiptap/react';
// Your correct import path
import { BubbleMenu } from '@tiptap/react/menus';
import { extensions } from './MagicEditorExtensions';

interface MagicEditorProps {
  content: string;
  onChange: (html: string) => void;
  onConnectClick: (editor: TiptapEditor) => void;
  onBlur: () => void;
  autoFocus?: boolean;
  // --- 💎 NEW ARCHITECTURE UPGRADE 💎 ---
  // We can now control if the editor is in read-only mode
  isEditable?: boolean;
}

const TiptapEditorComponent = ({
  content,
  onChange,
  onConnectClick,
  onBlur,
  autoFocus,
  isEditable = true, // Default to true to avoid breaking existing code
}: MagicEditorProps) => {
  const editor = useEditor({
    extensions,
    content,
    immediatelyRender: false,
    
    // --- 💎 NEW ARCHITECTURE UPGRADE 💎 ---
    // The editor's editable state is now controlled by our prop
    editable: isEditable,

    onBlur: () => {
      if (onBlur) {
        // We still need the delay to prevent the bubble menu from breaking
        setTimeout(onBlur, 100); 
      }
    },

    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    
    // --- 💎 "CRAMPED UI" & "JUMP BUG" PERMANENT FIX 💎 ---
    // We remove all the custom classes and use "ProseMirror"
    // This will pull all styles (min-height, line-height, padding)
    // directly from your globals.css, ensuring it ALWAYS
    // matches the "Preview Mode" (which will also use this class).
    editorProps: {
      attributes: {
        class: 'ProseMirror', // This is the professional-grade fix
      },
    },
    
    autofocus: autoFocus,
  });

  // --- 💎 NEW ARCHITECTURE UPGRADE 💎 ---
  // This effect ensures that if the isEditable prop changes
  // (e.g., the user clicks), we update the editor.
  useEffect(() => {
    if (editor && editor.isEditable !== isEditable) {
      editor.setEditable(isEditable);
    }
  }, [editor, isEditable]);
  
  // This hook ensures content is updated from the parser
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content, { emitUpdate: false });
    }
  }, [content, editor]);

  if (!editor) {
    return null;
  }

  return (
    <>
      <BubbleMenu
        editor={editor}
        // --- 💎 NEW ARCHITECTURE UPGRADE 💎 ---
        // The bubble menu should only show when the editor
        // is actually editable.
        shouldShow={({ state, editor }) =>
          !state.selection.empty && editor.isEditable
        }
        className="bg-white shadow-lg border rounded-lg p-1 flex space-x-1 z-10"
      >
        {/* These buttons will now work */}
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => onConnectClick(editor)}
          className="p-2 text-blue-600 hover:bg-gray-100 rounded"
          title="Create/Edit Hotspot"
        >
          Connect
        </button>
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-2 hover:bg-gray-100 rounded ${
            editor.isActive('bold') ? 'bg-gray-200' : ''
          }`}
        >
          Bold
        </button>
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-2 hover:bg-gray-100 rounded ${
            editor.isActive('italic') ? 'bg-gray-200' : ''
          }`}
        >
          Italic
        </button>
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={`p-2 hover:bg-gray-100 rounded ${
            editor.isActive('underline') ? 'bg-gray-200' : ''
          }`}
        >
          Underline
        </button>
      </BubbleMenu>

      <EditorContent editor={editor} />
    </>
  );
};

export default function MagicEditor(props: MagicEditorProps) {
  // We wrap the editor in a div that gives it a container
  // The editor itself will have the .ProseMirror styles
  // for padding, min-height, and line-height.
  return (
    <div className="magic-editor-wrapper">
      <TiptapEditorComponent {...props} />
    </div>
  );
}