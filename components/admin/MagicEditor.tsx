// components/admin/MagicEditor.tsx
'use client';
import React, { useEffect } from 'react';
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
  Link,
  Highlighter,
  List,
  ListOrdered,
} from 'lucide-react';

interface MagicEditorProps {
  content: string;
  onChange: (html: string) => void;
  onConnectClick: (editor: TiptapEditor) => void;
  isEditable: boolean; // <-- The new "Hybrid" mode prop
  autoFocus?: boolean;
}

const TiptapEditorComponent = ({
  content,
  onChange,
  onConnectClick,
  isEditable,
  autoFocus,
}: MagicEditorProps) => {
  const editor = useEditor({
    extensions,
    content,
    editable: isEditable,

    // --- 💎 THIS IS THE FIX 💎 ---
    // This explicitly tells Tiptap to wait for the client
    // to render, avoiding the SSR hydration error.
    immediatelyRender: false,
    // --- 💎 END OF FIX 💎 ---

    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },

    editorProps: {
      attributes: {
        class: 'ProseMirror',
      },
    },

    autofocus: autoFocus,
  });

  // This "Hybrid" hook ensures that if the isEditable prop changes
  useEffect(() => {
    if (editor && editor.isEditable !== isEditable) {
      editor.setEditable(isEditable);
      if (isEditable) {
        editor.commands.focus();
      }
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
        shouldShow={({ state, editor }) =>
          !state.selection.empty && editor.isEditable
        }
        className="bg-white shadow-lg border border-gray-200 rounded-lg p-1 flex items-center divide-x divide-gray-200"
      >
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => onConnectClick(editor)}
          className="p-2 text-blue-600 hover:bg-blue-50 rounded-md"
          title="Create/Edit Hotspot"
        >
          <Link className="w-4 h-4" />
        </button>
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

export default function MagicEditor(props: MagicEditorProps) {
  return (
    <div className="magic-editor-wrapper relative">
      <TiptapEditorComponent {...props} />
    </div>
  );
}