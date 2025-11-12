// components/admin/MagicEditorExtensions.ts
import { Mark, mergeAttributes, RawCommands, CommandProps, Editor } from '@tiptap/core';
import { MarkType } from '@tiptap/pm/model';

// --- 1. IMPORT STARTERKIT'S PIECES MANUALLY ---
import { Blockquote } from '@tiptap/extension-blockquote';
import { BulletList } from '@tiptap/extension-bullet-list';
import { Code } from '@tiptap/extension-code';
import { CodeBlock } from '@tiptap/extension-code-block';
import { Document } from '@tiptap/extension-document';
import { Dropcursor } from '@tiptap/extension-dropcursor';
import { Gapcursor } from '@tiptap/extension-gapcursor';
import { HardBreak } from '@tiptap/extension-hard-break';
import { Heading } from '@tiptap/extension-heading';
import { History } from '@tiptap/extension-history';
import { Italic } from '@tiptap/extension-italic';
import { ListItem } from '@tiptap/extension-list-item';
import { OrderedList } from '@tiptap/extension-ordered-list';
import { Paragraph } from '@tiptap/extension-paragraph';
import { Strike } from '@tiptap/extension-strike';
import { Text } from '@tiptap/extension-text';
import { Bold } from '@tiptap/extension-bold';

// --- 2. IMPORT OUR OTHER EXTENSIONS ---
import { Link } from '@tiptap/extension-link';
import { Color } from '@tiptap/extension-color';
import { TextStyle } from '@tiptap/extension-text-style';
import { Underline } from '@tiptap/extension-underline';
import { Highlight } from '@tiptap/extension-highlight';
import { Subscript } from '@tiptap/extension-subscript';
import { Superscript } from '@tiptap/extension-superscript';
import { FontFamily } from '@tiptap/extension-font-family';
// --- END IMPORTS ---

// --- TYPE DECLARATION (Unchanged) ---
declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    hotspot: {
      setHotspot: (attributes: { type: string }) => ReturnType;
      toggleHotspot: (attributes: { type: string }) => ReturnType;
      unsetHotspot: () => ReturnType;
    };
  }
}

/**
 * Our original custom Tiptap Mark for "Hotspots".
 */
export const HotspotMark = Mark.create({
  name: 'hotspot',
  priority: 1001, // <-- This is the PARSER FIX

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
});
// --- END OF HOTSPOT MARK ---

// --- 3. CONFIGURE AND EXPORT THE FULL LIST ---
export const extensions = [
  // --- Core Extensions (replaces StarterKit) ---
  Document,
  Paragraph,
  Text,
  History,
  HardBreak,
  Bold,
  Italic,
  Strike,

  // --- Configured Core Extensions ---
  BulletList.configure({
    HTMLAttributes: {
      class: 'list-disc list-outside leading-3 -mt-2',
    },
  }),
  OrderedList.configure({
    HTMLAttributes: {
      class: 'list-decimal list-outside leading-3 -mt-2',
    },
  }),
  ListItem.configure({
    HTMLAttributes: {
      class: 'leading-normal -mb-2',
    },
  }),
  Blockquote.configure({
    HTMLAttributes: {
      class: 'border-l-4 border-gray-300 pl-4',
    },
  }),
  Code.configure({
    HTMLAttributes: {
      class: 'rounded-md bg-gray-200 px-1.5 py-1 font-mono font-medium',
      spellcheck: 'false',
    },
  }),
  CodeBlock.configure({
    HTMLAttributes: {
      class: 'rounded-sm bg-gray-100 p-5 font-mono font-medium',
    },
  }),
  Dropcursor.configure({
    color: '#DBEAFE',
    width: 4,
  }),
  Gapcursor,
  Heading,
  
  // --- Our Other Extensions (Order Matters!) ---
  HotspotMark, // Our custom Mark
  
  // Standard `span` extensions
  TextStyle,
  Color,
  FontFamily,

  Link.configure({
    HTMLAttributes: {
      class:
        'text-blue-600 underline underline-offset-2 hover:text-blue-700 transition-colors cursor-pointer',
    },
  }),
  Underline,
  Highlight.configure({
    multicolor: true,
  }),
  Subscript,
  Superscript,
];