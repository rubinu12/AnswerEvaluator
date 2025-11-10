// components/admin/MagicEditorExtensions.ts
import StarterKit from '@tiptap/starter-kit';
import { Link } from '@tiptap/extension-link';
import { Color } from '@tiptap/extension-color';
import { TextStyle } from '@tiptap/extension-text-style';
import { Underline } from '@tiptap/extension-underline';
import { Highlight } from '@tiptap/extension-highlight';
import { Subscript } from '@tiptap/extension-subscript';
import { Superscript } from '@tiptap/extension-superscript';
import { FontFamily } from '@tiptap/extension-font-family';

// --- NEW IMPORTS FOR TYPES ---
import { Mark, mergeAttributes, RawCommands, CommandProps, Editor } from '@tiptap/core';
import { MarkType } from '@tiptap/pm/model'; // Correct import for MarkType
// --- END NEW IMPORTS ---

// --- NEW TYPE DECLARATION ---
// This extends Tiptap's types to make our custom commands type-safe
declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    hotspot: {
      setHotspot: (attributes: { type: string }) => ReturnType;
      toggleHotspot: (attributes: { type: string }) => ReturnType;
      unsetHotspot: () => ReturnType;
    };
  }
}
// --- END NEW TYPE DECLARATION ---

/**
 * Our custom Tiptap Mark for "Hotspots".
 */
export const HotspotMark = Mark.create({
  name: 'hotspot',

  parseHTML() {
    return [
      {
        tag: 'span.hotspot-mark[data-type]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'span',
      mergeAttributes(HTMLAttributes, { class: 'hotspot-mark' }),
      0,
    ];
  },

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

  // --- THIS BLOCK IS NOW FULLY TYPE-SAFE ---
  addCommands() {
    return {
      setHotspot:
        (attributes: { type: string }) =>
        ({ commands }: CommandProps) => {
          return commands.setMark(this.name, attributes);
        },
      toggleHotspot:
        (attributes: { type: string }) =>
        ({ commands }: CommandProps) => {
          return commands.toggleMark(this.name, attributes);
        },
      unsetHotspot:
        () =>
        ({ commands }: CommandProps) => {
          return commands.unsetMark(this.name);
        },
    };
  },
  // --- END OF FIX ---
});

// --- THIS IS YOUR ORIGINAL, CORRECT CONFIGURATION ---
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
// --- END OF YOUR ORIGINAL CONFIG ---

// This is the final, correct extensions array
export const extensions = [
  starterKit, // <-- This now includes your bulletList config
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
  HotspotMark, // <-- ADDED OUR NEW MARK
];