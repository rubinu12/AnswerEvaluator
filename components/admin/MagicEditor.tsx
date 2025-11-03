// components/admin/MagicEditor.tsx
'use client'; // --- "PERFECT" FIX 1: This is now a Client Component ---

import React, { useCallback, useState } from 'react';
import { useEditor, EditorContent, Editor } from '@tiptap/react';
import { FloatingMenu } from '@tiptap/react/menus';
import {
  tiptapExtensions,
  getToolbarButtons,
  ToolbarButton,
} from './MagicEditorExtensions';
import { X } from 'lucide-react';

// --- "PERFECT" HOTSPOT MODAL ---
// (This code is "perfectly" unchanged)
const HotspotModal: React.FC<{
  editor: Editor;
  onClose: () => void;
  isNote: boolean;
}> = ({ editor, onClose, isNote }) => {
  const [url, setUrl] = useState('');
  const [text, setText] = useState(
    editor.state.doc.textBetween(
      editor.state.selection.from,
      editor.state.selection.to
    )
  );

  const handleSave = () => {
    if (isNote) {
      editor
        .chain()
        .focus()
        .setLink({ href: url, class: 'handwritten-note' })
        .run();
    } else {
      editor.chain().focus().setLink({ href: url }).run();
    }
    onClose();
  };

  return (
    <div className="absolute z-10 top-0 left-0 w-full h-full bg-black/30 flex items-center justify-center p-4">
      <div className="bg-white p-4 rounded-lg shadow-xl w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">
            {isNote ? 'Add Handwritten Note' : 'Add Hotspot'}
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {!isNote && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Text to link (Selected)
            </label>
            <p className="p-2 border bg-gray-50 rounded-md mt-1">{text}</p>
          </div>
        )}

        <label htmlFor="url" className="block text-sm font-medium text-gray-700">
          {isNote ? 'Handwritten Note Image URL' : 'Hotspot Explanation URL'}
        </label>
        <input
          id="url"
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://..."
          className="w-full p-2 border border-gray-300 rounded-md shadow-sm text-sm mt-1"
        />
        <div className="flex justify-end gap-2 mt-4">
          <button
            onClick={onClose}
            className="btn bg-white text-gray-700 font-semibold px-4 py-2 rounded-lg border"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="btn bg-blue-600 text-white font-semibold px-4 py-2 rounded-lg shadow-md"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * ==================================================================
 * --- 💎 THIS IS THE "MAGIC EDITOR" COMPONENT 💎 ---
 * ==================================================================
 */
interface MagicEditorProps {
  content: string;
  onChange: (newContent: string) => void;
}

const MagicEditor: React.FC<MagicEditorProps> = ({ content, onChange }) => {
  const [isHotspotModalOpen, setIsHotspotModalOpen] = useState(false);
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);

  const editor = useEditor({
    extensions: tiptapExtensions,
    content: content,
    // --- "PERFECT" FIX 2: Follow the error's "perfect" instructions ---
    immediatelyRender: false,
    // ---
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class:
          'w-full p-2 border border-gray-300 rounded-md shadow-sm custom-scrollbar min-h-[150px] prose max-w-none',
      },
    },
  });

  if (!editor) {
    return null;
  }

  const handleHotspotClick = () => {
    setIsHotspotModalOpen(true);
  };

  const handleNoteClick = () => {
    setIsNoteModalOpen(true);
  };

  const buttons = getToolbarButtons(editor, handleHotspotClick, handleNoteClick);

  return (
    <div className="relative">
      {/* --- "PERFECT" FLOATING TOOLBAR --- */}
      <FloatingMenu
        editor={editor}
        className="bg-gray-800 text-white p-2 rounded-lg shadow-xl flex gap-1"
      >
        {buttons.map((btn) => (
          <button
            key={btn.id}
            title={btn.label}
            onClick={() => btn.onClick(editor)}
            className={`p-2 rounded hover:bg-gray-700 ${
              btn.isActive(editor) ? 'bg-gray-600' : ''
            }`}
          >
            <btn.icon
              className="w-4 h-4"
              style={{ color: btn.color || 'white' }}
            />
          </button>
        ))}
      </FloatingMenu>

      {/* --- "PERFECT" MODALS --- */}
      {isHotspotModalOpen && (
        <HotspotModal
          editor={editor}
          onClose={() => setIsHotspotModalOpen(false)}
          isNote={false}
        />
      )}
      {isNoteModalOpen && (
        <HotspotModal
          editor={editor}
          onClose={() => setIsNoteModalOpen(false)}
          isNote={true}
        />
      )}

      {/* --- "PERFECT" EDITOR CONTENT AREA --- */}
      <EditorContent editor={editor} />
    </div>
  );
};

export default MagicEditor;