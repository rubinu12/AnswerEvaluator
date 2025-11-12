// components/admin/MagicEditor.tsx
'use client';
import React, { useEffect, useState } from 'react';
import {
  EditorContent,
  useEditor,
  Editor as TiptapEditor,

} from '@tiptap/react';
import { BubbleMenu } from '@tiptap/react/menus'
import { extensions } from './MagicEditorExtensions';
import {
  Bold,
  Italic,
  Underline,
  Link, // This is the icon for "Connect"
  Highlighter,
  List,
  ListOrdered,
} from 'lucide-react';

interface MagicEditorProps {
  content: string;
  onChange: (html: string) => void;
  onConnectClick?: (editor: TiptapEditor) => void; // <-- 💎 MADE OPTIONAL
  isEditable: boolean; // <-- The "Hybrid" mode prop
  autoFocus?: boolean;
}

// This is the actual Tiptap component.
const TiptapEditorComponent = ({
  content,
  onChange,
  onConnectClick, // <-- Can now be undefined
  isEditable,
  autoFocus,
}: MagicEditorProps) => {
  // 1. Use `useState` to hold the editor instance.
  const [editor, setEditor] = useState<TiptapEditor | null>(null);

  // 2. Initialize the editor inside `useEffect` to run ONLY on the client.
  useEffect(() => {
    const tiptapEditor = new TiptapEditor({
      extensions,
      content,
      editable: isEditable,

      editorProps: {
        attributes: {
          class: 'ProseMirror', // Your global styling class
        },
      },

      // 3. Update the parent component's state on every change.
      onUpdate: ({ editor }) => {
        onChange(editor.getHTML());
      },
    });

    setEditor(tiptapEditor);

    // 4. Clean up the editor instance when the component unmounts.
    return () => {
      tiptapEditor.destroy();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run only once on mount.

  // 5. This "Hybrid" hook ensures that if the `isEditable` prop changes,
  //    the editor's state is updated to match.
  useEffect(() => {
    if (editor && editor.isEditable !== isEditable) {
      editor.setEditable(isEditable);
      
      // --- 💎 FIX for flushSync error --- 💎
      // This is still needed for the main hybrid editors
      if (isEditable && autoFocus) {
        setTimeout(() => {
          editor.commands.focus();
        }, 0);
      }
    }
  }, [editor, isEditable, autoFocus]);

  // 6. This hook updates the editor's content if the `content` prop
  //    changes (e.g., after your "Parse" button is clicked).
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
        shouldShow={({ state, editor }) =>
          !state.selection.empty && editor.isEditable
        }
        className="bg-white shadow-lg border border-gray-200 rounded-lg p-1 flex items-center divide-x divide-gray-200"
      >
        {/* --- 💎 --- THIS IS THE FIX --- 💎 --- */}
        {/* Only show the "Connect" button if the prop is provided */}
        {onConnectClick && (
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => onConnectClick(editor)}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-md"
            title="Create/Edit Hotspot"
          >
            <Link className="w-4 h-4" />
          </button>
        )}
        {/* --- 💎 --- END OF FIX --- 💎 --- */}
        
        {/* Standard formatting buttons */}
        <div className="flex items-center px-1">
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`p-2 hover:bg-gray-100 rounded-md ${
              editor.isActive('bold') ? 'bg-gray-100 text-black' : 'text-gray-500'
            }`}
          >
            <Bold className="w-4 h-4" />
          </button>
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`p-2 hover:bg-gray-100 rounded-md ${
              editor.isActive('italic') ? 'bg-gray-100 text-black' : 'text-gray-500'
            }`}
          >
            <Italic className="w-4 h-4" />
          </button>
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className={`p-2 hover:bg-gray-100 rounded-md ${
              editor.isActive('underline')
                ? 'bg-gray-100 text-black'
                : 'text-gray-500'
            }`}
          >
            <Underline className="w-4 h-4" />
          </button>
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => editor.chain().focus().toggleHighlight().run()}
            className={`p-2 hover:bg-gray-100 rounded-md ${
              editor.isActive('highlight')
                ? 'bg-gray-100 text-black'
                : 'text-gray-500'
            }`}
          >
            <Highlighter className="w-4 h-4" />
          </button>
        </div>
        <div className="flex items-center px-1">
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`p-2 hover:bg-gray-100 rounded-md ${
              editor.isActive('bulletList')
                ? 'bg-gray-100 text-black'
                : 'text-gray-500'
            }`}
          >
            <List className="w-4 h-4" />
          </button>
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={`p-2 hover:bg-gray-100 rounded-md ${
              editor.isActive('orderedList')
                ? 'bg-gray-100 text-black'
                : 'text-gray-500'
            }`}
          >
            <ListOrdered className="w-4 h-4" />
          </button>
        </div>
      </BubbleMenu>

      <EditorContent editor={editor} />
    </>
  );
};

// The wrapper component is now just a simple pass-through.
export default function MagicEditor(props: MagicEditorProps) {
  return (
    <div className="magic-editor-wrapper relative">
      <TiptapEditorComponent {...props} />
    </div>
  );
}