// components/admin/MagicEditorExtensions.ts

// --- Imports from your original file ---
import StarterKit from '@tiptap/starter-kit';
import { Link } from '@tiptap/extension-link';
import { Color } from '@tiptap/extension-color';
import { TextStyle } from '@tiptap/extension-text-style';
import { Underline } from '@tiptap/extension-underline';
import { Highlight } from '@tiptap/extension-highlight'; // This will now work after the npm install
import { Subscript } from '@tiptap/extension-subscript';
import { Superscript } from '@tiptap/extension-superscript';
import { FontFamily } from '@tiptap/extension-font-family';
// --- FIXED: Removed the './fontSize' import ---

// --- NEW HOTSPOT MARK (PHASE 3) ---
import { Mark, mergeAttributes, MarkType } from '@tiptap/core';
// We also need these types for our (upcoming) button logic
import { Editor } from '@tiptap/react';

/**
 * Our custom Tiptap Mark for "Hotspots".
 * This allows us to "mark" text with a data-type, which we
 * can then style with CSS and make interactive.
 */
export const HotspotMark = Mark.create({
  name: 'hotspot',

  // This allows us to store the 'type' (red/green/blue)
  addAttributes() {
    return {
      type: {
        default: 'green',
        parseHTML: (element) => element.getAttribute('data-type'),
        renderHTML: (attributes) => ({
          'data-type': attributes.type,
        }),
      },
    };
  },

  // This defines how the mark is parsed from HTML
  parseHTML() {
    return [
      {
        tag: 'span[data-type]',
      },
    ];
  },

  // This defines how the mark is rendered back to HTML
  renderHTML({ HTMLAttributes }) {
    // We add a 'hotspot-mark' class for styling and click detection
    return [
      'span',
      mergeAttributes(HTMLAttributes, { class: 'hotspot-mark' }),
      0,
    ];
  },

  // --- FIXED: Removed the broken `addCommands` block entirely ---
  // We will use the built-in `editor.commands.toggleMark()`
  // in the MagicEditor component itself.
});
// --- END OF NEW HOTSPOT MARK ---

// Tiptap Extensions
const starterKit = StarterKit.configure({
  bulletList: {
    HTMLAttributes: {
      class: 'list-disc list-outside leading-3 -mt-2',
    },
  },
  orderedList: {
    HTMLAttributes: {
      class: 'list-decimal list-outside leading-3 -mt-2',
    },
  },
  listItem: {
    HTMLAttributes: {
      class: 'leading-normal -mb-2',
    },
  },
  blockquote: {
    HTMLAttributes: {
      class: 'border-l-4 border-gray-300 pl-4',
    },
  },
  codeBlock: {
    HTMLAttributes: {
      class: 'rounded-sm bg-gray-100 p-5 font-mono font-medium',
    },
  },
  code: {
    HTMLAttributes: {
      class: 'rounded-md bg-gray-200 px-1.5 py-1 font-mono font-medium',
      spellcheck: 'false',
    },
  },
  horizontalRule: false,
  dropcursor: {
    color: '#DBEAFE',
    width: 4,
  },
  gapcursor: false,
});

// This is the final, correct extensions array
export const extensions = [
  starterKit,
  Link.configure({
    HTMLAttributes: {
      class:
        'text-blue-600 underline underline-offset-2 hover:text-blue-700 transition-colors cursor-pointer',
    },
  }),
  TextStyle,
  Color,
  Underline,
  Highlight.configure({
    multicolor: true,
  }),
  Subscript,
  Superscript,
  FontFamily,
  // --- FIXED: Removed 'FontSize' ---
  HotspotMark, // <-- ADDED OUR NEW MARK
];