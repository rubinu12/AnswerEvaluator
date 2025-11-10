// components/admin/MagicEditor.tsx
'use client';
import React, { useEffect, useState } from 'react';
import {
  EditorContent,
  useEditor,
  Editor as TiptapEditor,
  NodeViewWrapper,
  NodeViewProps,
  ReactNodeViewRenderer,
} from '@tiptap/react';
import { BubbleMenu } from '@tiptap/react/menus';
import { extensions } from './MagicEditorExtensions';
import {
  Bold,
  Italic,
  Underline,
  Link, // This is the icon for "Connect"
  Highlighter,
  List,
  ListOrdered,
  Paintbrush,
} from 'lucide-react';
import { Hotspot } from '@/lib/quizTypes';
import HotspotTooltip from '../quiz/HotspotTooltip';
import { HotspotModalData } from './HotspotModal';

// (The broken `declare module` block has been REMOVED from here)

// --- Hotspot Node View Component ---
export const HotspotNodeView: React.FC<NodeViewProps> = ({
  node,
  editor,
  getPos,
}) => {
  const { term, type } = node.attrs;

  // Retrieve props from the editor
  // These errors will now be gone.
  const { hotspotBank, onHotspotClick } = editor.options.editorProps;

  // Find the full hotspot data from the bank
  const hotspotData = (hotspotBank as Hotspot[])?.find(
    (h: Hotspot) => h.term === term
  );

  // If the editor is in read-only mode...
  if (!editor.isEditable) {
    if (!hotspotData) {
      // Data not found, just render the term
      return <span className={`hotspot-mark-broken`}>{term}</span>;
    }
    // ...render the text wrapped in the real Tooltip.
    // THIS FIXES THE BUG.
    return (
      <HotspotTooltip hotspot={hotspotData}>
        <span className={`hotspot-mark`} data-type={type}>
          {term}
        </span>
      </HotspotTooltip>
    );
  }

  // If the editor is editable...
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    // ...call the handler to open the modal.
    // THIS IS THE NEW "click-to-edit" WORKFLOW.
    if (onHotspotClick) {
      const modalData: HotspotModalData = hotspotData || { term, type, definition: '' };
      // We pass the editor, position, and data
      onHotspotClick(modalData, getPos, editor);
    }
  };

  // ...render a simple span that is clickable.
  return (
    <span
      className={`hotspot-mark editable`}
      data-type={type}
      onClick={handleClick}
      contentEditable={false}
    >
      {term}
    </span>
  );
};
// --- END: Hotspot Node View Component ---


interface MagicEditorProps {
  content: string;
  onChange: (html: string) => void;
  // This prop is now ONLY for CREATING new hotspots
  onConnectClick: (editor: TiptapEditor) => void;
  isEditable: boolean;
  autoFocus?: boolean;

  // --- NEW PROPS ---
  hotspotBank: Hotspot[];
  onHotspotClick: (
    data: HotspotModalData,
    getPos: () => number | undefined,
    editor: TiptapEditor
  ) => void;
  // --- END NEW PROPS ---
}

// This is the actual Tiptap component.
const TiptapEditorComponent = ({
  content,
  onChange,
  onConnectClick,
  isEditable,
  autoFocus,
  hotspotBank,
  onHotspotClick,
}: MagicEditorProps) => {
  const [editor, setEditor] = useState<TiptapEditor | null>(null);

  // 2. Initialize the editor
  useEffect(() => {
    const tiptapEditor = new TiptapEditor({
      extensions,
      content,
      editable: isEditable,

      editorProps: {
        attributes: {
          class: 'ProseMirror',
        },
        // --- Pass props to NodeViews ---
        // This error will now be gone.
        hotspotBank: hotspotBank,
        onHotspotClick: onHotspotClick,
      },

      onUpdate: ({ editor }) => {
        onChange(editor.getHTML());
      },
    });

    setEditor(tiptapEditor);

    return () => {
      tiptapEditor.destroy();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run only once on mount.

  // 5. This hook updates editable state
  useEffect(() => {
    if (editor && editor.isEditable !== isEditable) {
      editor.setEditable(isEditable);
      if (isEditable && autoFocus) {
        editor.commands.focus();
      }
    }
  }, [editor, isEditable, autoFocus]);

  // 6. This hook updates content (e.g., on "Parse")
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content, { emitUpdate: false });
    }
  }, [content, editor]);

  // --- NEW: This hook updates editorProps ---
  useEffect(() => {
    if (editor) {
      editor.setOptions({
        editorProps: {
          attributes: {
            class: 'ProseMirror',
          },
          // This error will now be gone.
          hotspotBank: hotspotBank,
          onHotspotClick: onHotspotClick,
        },
      });
    }
  }, [editor, hotspotBank, onHotspotClick]);


  if (!editor) {
    return null;
  }

  return (
    <>
      <BubbleMenu
        editor={editor}
        shouldShow={({ state, editor }) =>
          // Show menu if selection is not empty AND editor is editable
          !state.selection.empty && editor.isEditable
        }
        className="bg-white shadow-lg border border-gray-200 rounded-lg p-1 flex items-center divide-x divide-gray-200"
      >
        {/* "Connect" button (for CREATING new hotspots) */}
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => onConnectClick(editor)}
          className="p-2 text-blue-600 hover:bg-blue-50 rounded-md"
          title="Create/Edit Hotspot"
        >
          <Link className="w-4 h-4" />
        </button>

        {/* --- NEW: Color Picker --- */}
        <div className="flex items-center px-1 relative">
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => editor.chain().focus().unsetColor().run()}
            className="p-2 hover:bg-gray-100 rounded-md text-gray-500"
            title="Remove color"
          >
            <Paintbrush className="w-4 h-4" />
          </button>
          {/* This is a simple HTML color picker */}
          <input
            type="color"
            onInput={(e) => editor.chain().focus().setColor(e.currentTarget.value).run()}
            value={editor.getAttributes('textStyle').color || '#000000'}
            className="w-6 h-6 p-0 border-none bg-transparent cursor-pointer"
            title="Set text color"
          />
        </div>
        
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