// components/admin/MagicEditor.tsx

'use client';
import React from 'react';
import {
  EditorContent,
  useEditor,
  Editor as TiptapEditor,
   // <-- FIXED: Correct import path
} from '@tiptap/react';
import { BubbleMenu } from '@tiptap/react/menus'
// import { EditorState } from '@tiptap/pm/state'; // <-- Removed: Unused import
import { extensions } from './MagicEditorExtensions';
// import { EditorProps } from '@tiptap/pm/view'; // <-- Removed: Unused import

// --- THIS IS THE FIX ---
// We are adding onBlur and autoFocus to the props
interface MagicEditorProps {
  content: string;
  onChange: (html: string) => void;
  onConnectClick: (editor: TiptapEditor) => void;
  onBlur?: () => void; // <-- ADDED
  autoFocus?: boolean; // <-- ADDED
}

/**
 * This is the "editable text box" for our Playground.
 */
const TiptapEditorComponent = ({
  content,
  onChange,
  onConnectClick,
  onBlur, // <-- ADDED
  autoFocus, // <-- ADDED
}: MagicEditorProps) => {
  const editor = useEditor({
    extensions,
    content,
    // This tells Tiptap to wait for the client to be ready
    immediatelyRender: false,

    // --- THIS IS THE FIX ---
    autofocus: autoFocus, // Pass autoFocus to Tiptap
    onBlur: () => {
      if (onBlur) {
        onBlur(); // Call the onBlur function from props
      }
    },
    // --- END OF FIX ---

    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      // This makes the editor look like plain text until clicked
      attributes: {
        class:
          'prose prose-sm sm:prose-base lg:prose-lg xl:prose-2xl m-5 focus:outline-none',
      },
    },
  });

  return (
    <>
      {editor && (
        <BubbleMenu
          editor={editor}
          // We removed the invalid 'tippyOptions' prop
          // FIXED: The 'state' prop is provided by shouldShow
          shouldShow={({ state }) => !state.selection.empty}
          className="bg-white shadow-lg border rounded-lg p-1 flex space-x-1"
        >
          {/* --- STEP 3b: Our new [Connect] button --- */}
          <button
            onClick={() => onConnectClick(editor)}
            className="p-2 text-blue-600 hover:bg-gray-100 rounded"
            title="Create/Edit Hotspot"
          >
            Connect
          </button>

          {/* Standard Tiptap buttons */}
          <button
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`p-2 hover:bg-gray-100 rounded ${
              editor.isActive('bold') ? 'bg-gray-200' : ''
            }`}
          >
            Bold
          </button>
          <button
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`p-2 hover:bg-gray-100 rounded ${
              editor.isActive('italic') ? 'bg-gray-200' : ''
            }`}
          >
            Italic
          </button>
          <button
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className={`p-2 hover:bg-gray-100 rounded ${
              editor.isActive('underline') ? 'bg-gray-200' : ''
            }`}
          >
            Underline
          </button>
        </BubbleMenu>
      )}

      <EditorContent editor={editor} />
    </>
  );
};

// This is the wrapper component that provides the editor context
export default function MagicEditor(props: MagicEditorProps) {
  return (
    <div className="magic-editor">
      {/* We fixed the name conflict here */}
      <TiptapEditorComponent {...props} />
    </div>
  );
}