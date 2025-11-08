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
  // --- THIS IS THE FIX ---
  // The onBlur prop is REQUIRED for our "Hybrid" model
  // to switch from "Edit Mode" back to "Preview Mode".
  onBlur: () => void;
  autoFocus?: boolean;
  // --- END OF FIX ---
}

const TiptapEditorComponent = ({
  content,
  onChange,
  onConnectClick,
  onBlur, // We now use this prop
  autoFocus,
}: MagicEditorProps) => {
  const editor = useEditor({
    extensions,
    content,
    immediatelyRender: false,
    
    // --- "BROKEN BUBBLEMENU" FIX ---
    // This is the race condition fix. It delays the blur event
    // so the BubbleMenu button's 'onClick' can fire *before*
    // the editor unmounts (by switching to "Preview Mode").
    onBlur: () => {
      if (onBlur) {
        setTimeout(onBlur, 100); // 100ms delay
      }
    },
    // --- END OF FIX ---

    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    
    // --- "NO JUMP" FIX ---
    // These classes will be identical to our "Preview" div.
    editorProps: {
      attributes: {
        class:
          'w-full min-h-[100px] text-lg leading-relaxed focus:outline-none p-4',
      },
    },
    
    // --- "CLUNKY WORKFLOW" FIX ---
    // This will be 'true' when we click to edit.
    autofocus: autoFocus,
  });
  
  // This hook ensures content is updated from the parser
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content, { emitUpdate: false });
    }
  }, [content, editor]);

  // This guard fixes the 'Editor | null' errors
  if (!editor) {
    return null;
  }

  return (
    <>
      <BubbleMenu
        editor={editor}
        shouldShow={({ state }) => !state.selection.empty}
        className="bg-white shadow-lg border rounded-lg p-1 flex space-x-1 z-10"
      >
        {/* These buttons will now work */}
        <button
          type="button"
          // We use onMouseDown to prevent the blur event from firing
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
  return (
    <div className="magic-editor">
      <TiptapEditorComponent {...props} />
    </div>
  );
}