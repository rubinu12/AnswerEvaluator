// components/admin/MagicEditorExtensions.ts
'use client';

import { Editor } from '@tiptap/react';
import { StarterKit } from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import {TextStyle} from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import Link from '@tiptap/extension-link';
// --- "PERFECT" FIX 1: Rename the "logic" import ---
import TiptapFloatingMenu from '@tiptap/extension-floating-menu'; 
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Palette,
  Link as LinkIcon,
  Image as ImageIcon,
  LucideProps,
} from 'lucide-react';
import React from 'react';

// --- "PERFECT" TIPTAP EXTENSIONS ---

/**
 * This is the "perfect" list of all extensions our editor will use.
 * It "perfectly" matches the npm packages we installed.
 */
export const tiptapExtensions = [
  StarterKit.configure({
    heading: false,
    blockquote: false,
    bulletList: false,
    orderedList: false,
    codeBlock: false,
    horizontalRule: false,
  }),
  Underline,
  TextStyle,
  Color,
  Link.configure({
    openOnClick: false,
    autolink: false,
  }),
  // --- "PERFECT" FIX 2: Use the "perfectly" renamed extension ---
  TiptapFloatingMenu, 
];

// --- "PERFECT" TOOLBAR CONFIGURATION ---

// This defines the "perfect" shape for our toolbar buttons
export interface ToolbarButton {
  id: string;
  label: string;
  icon: React.ElementType<LucideProps>;
  onClick: (editor: Editor) => void;
  isActive: (editor: Editor) => boolean;
  color?: string; 
}

/**
 * This is the "perfect" function that powers our floating toolbar.
 * It "perfectly" implements every button we designed.
 */
export const getToolbarButtons = (
  editor: Editor,
  onHotspotClick: () => void,
  onNoteClick: () => void
): ToolbarButton[] => [
  // --- [ B ], [ I ], [ U ] ---
  {
    id: 'bold',
    label: 'Bold',
    icon: Bold,
    onClick: (editor) => editor.chain().focus().toggleBold().run(),
    isActive: (editor) => editor.isActive('bold'),
  },
  {
    id: 'italic',
    label: 'Italic',
    icon: Italic,
    onClick: (editor) => editor.chain().focus().toggleItalic().run(),
    isActive: (editor) => editor.isActive('italic'),
  },
  {
    id: 'underline',
    label: 'Underline',
    icon: UnderlineIcon,
    onClick: (editor) => editor.chain().focus().toggleUnderline().run(),
    isActive: (editor) => editor.isActive('underline'),
  },

  // --- [ RED PEN ] ---
  {
    id: 'red-pen',
    label: 'Red Pen',
    icon: Palette,
    color: '#E00000', // Our "perfect" Red
    onClick: (editor) =>
      editor.chain().focus().setColor('#E00000').run(),
    isActive: (editor) => editor.isActive('textStyle', { color: '#E00000' }),
  },
  
  // --- [ GREEN PEN ] ---
  {
    id: 'green-pen',
    label: 'Green Pen',
    icon: Palette,
    color: '#00A000', // Our "perfect" Green
    onClick: (editor) =>
      editor.chain().focus().setColor('#00A000').run(),
    isActive: (editor) => editor.isActive('textStyle', { color: '#00A000' }),
  },
  
  // --- [ BLUE PEN ] ---
  {
    id: 'blue-pen',
    label: 'Blue Pen',
    icon: Palette,
    color: '#0000D0', // Our "perfect" Blue
    onClick: (editor) =>
      editor.chain().focus().setColor('#0000D0').run(),
    isActive: (editor) => editor.isActive('textStyle', { color: '#0000D0' }),
  },

  // --- [ 🔗 HOTSPOT ] ---
  {
    id: 'hotspot',
    label: 'Hotspot',
    icon: LinkIcon,
    onClick: onHotspotClick, // This will open our "perfect" Hotspot modal
    isActive: (editor) => editor.isActive('link'),
  },
  
  // --- [ 🖼️ HANDWRITTEN NOTE ] ---
  {
    id: 'note',
    label: 'Handwritten Note',
    icon: ImageIcon,
    onClick: onNoteClick, // This will open our "perfect" Note modal
    isActive: (editor) => editor.isActive('link', { class: 'handwritten-note' }),
  },
];