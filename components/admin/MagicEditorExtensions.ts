// components/admin/MagicEditorExtensions.ts
import { Mark, mergeAttributes, RawCommands, CommandProps, Editor, Node } from '@tiptap/core';
import { MarkType } from '@tiptap/pm/model';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { HotspotNodeView } from './MagicEditor'; // We will create this component in MagicEditor.tsx

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

// --- TYPE DECLARATION ---
declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    hotspot: {
      // This is updated to insert a node
      setHotspot: (attributes: { term: string; type: string }) => ReturnType;
    };
  }
}

/**
 * --- 💎 THE NEW HOTSPOT NODE 💎 ---
 * We are switching from a Mark to a Node.
 * This lets us render a full React component.
 */
export const HotspotNode = Node.create({
  name: 'hotspot',
  group: 'inline',
  inline: true,
  atom: true, // Treat as a single "atomic" unit

  addAttributes() {
    return {
      term: {
        default: '',
        parseHTML: (element) => element.textContent,
        renderHTML: (attributes) => ({
          'data-term': attributes.term,
        }),
      },
      type: {
        default: 'green',
        parseHTML: (element) => element.getAttribute('data-type'),
        renderHTML: (attributes) => ({
          'data-type': attributes.type,
        }),
      },
    };
  },

  parseHTML() {
    return [
      {
        // This is crucial: it parses the *existing* HTML
        // that your `convertBracketsToSpans` function creates.
        tag: 'span.hotspot-mark[data-type]',
        getAttrs: (dom) => {
          const element = dom as HTMLElement;
          return {
            type: element.getAttribute('data-type'),
            term: element.textContent,
          };
        },
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    // This defines how it's saved to the database (and parsed back)
    return [
      'span',
      mergeAttributes(HTMLAttributes, { class: 'hotspot-mark' }),
      HTMLAttributes.term, // Render the term as the content
    ];
  },

  addNodeView() {
    // This is the magic: it tells Tiptap to render this
    // node using our React component.
    return ReactNodeViewRenderer(HotspotNodeView);
  },

  addCommands() {
    return {
      setHotspot:
        (attributes) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: attributes,
          });
        },
    };
  },
});
// --- END OF HOTSPOT NODE ---

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
  
  // Load our custom HotspotNode first
  HotspotNode,
  
  // Now load the standard `span` extensions
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