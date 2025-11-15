// app/admin/components/TopicTreeManager.tsx
// This component has been UPDATED to include a
// "Bulk Add" modal and the logic to parse indented text.
'use client';

import React,
{
  useState,
  useEffect,
  useCallback
} from 'react';
import {
  doc,
  getDoc,
  setDoc
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { TopicTree, TopicNode } from '@/lib/adminTypes';
import {
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  Loader2,
  AlertCircle,
  Upload, // New icon
} from 'lucide-react';

// The specific Firestore document we will use to store the tree
const topicTreeDocRef = doc(db, 'admin', 'topic_tree');

// Helper function to create a new, unique ID for topics
const createTopicId = (name: string, parentId: string = '') => {
  const safeName = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  return parentId ? `${parentId}-${safeName}` : safeName;
};

/**
 * ==================================================================
 * --- The Recursive Node Component ---
 * (No changes from the previous version)
 * ==================================================================
 */
interface NodeProps {
  node: TopicNode;
  level: number;
  onUpdate: (nodeId: string, newName: string) => void;
  onDelete: (nodeId: string) => void;
  onAddChild: (parentId: string, newNode: TopicNode) => void;
}

const TopicNodeComponent: React.FC<NodeProps> = ({ node, level, onUpdate, onDelete, onAddChild }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [editName, setEditName] = useState(node.name);
  const [newName, setNewName] = useState('');

  const handleUpdate = () => {
    if (editName.trim() === '') return alert('Topic name cannot be empty.');
    onUpdate(node.id, editName.trim());
    setIsEditing(false);
  };

  const handleAddChild = () => {
    if (newName.trim() === '') return alert('Topic name cannot be empty.');
    const newId = createTopicId(newName.trim(), node.id);
    onAddChild(node.id, { id: newId, name: newName.trim(), children: [] });
    setNewName('');
    setIsAdding(false);
  };

  // We allow 3 levels: 0 (GS1), 1 (History), 2 (Modern)
  const isMaxDepth = level >= 2; 

  return (
    <div className={`ml-${level * 4} p-3 border-l border-gray-200`}>
      <div className="flex items-center justify-between group">
        {isEditing ? (
          // --- Edit Mode ---
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="px-2 py-1 border rounded-md"
              autoFocus
            />
            <button
              onClick={handleUpdate}
              className="p-1 text-green-600 hover:text-green-800"
            >
              <Save className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsEditing(false)}
              className="p-1 text-gray-500 hover:text-gray-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          // --- View Mode ---
          <span className="font-medium text-gray-800">{node.name}</span>
        )}

        {/* --- Action Buttons (only show on hover in view mode) --- */}
        {!isEditing && (
          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => setIsEditing(true)}
              className="p-1 text-blue-600 hover:text-blue-800"
              title="Edit"
            >
              <Edit className="w-4 h-4" />
            </button>
            {/* Only allow adding children if not at max depth */}
            {!isMaxDepth && (
              <button
                onClick={() => setIsAdding(true)}
                className="p-1 text-green-600 hover:text-green-800"
                title="Add Sub-topic"
              >
                <Plus className="w-4 h-4" />
              </button>
            )}
            {/* Only allow deleting if it has no children */}
            {node.children.length === 0 && (
              <button
                onClick={() => {
                  if (window.confirm(`Are you sure you want to delete "${node.name}"?`)) {
                    onDelete(node.id);
                  }
                }}
                className="p-1 text-red-600 hover:text-red-800"
                title="Delete"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* --- "Add New Child" Form --- */}
      {isAdding && (
        <div className="flex items-center gap-2 mt-2 ml-4">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="px-2 py-1 border rounded-md"
            placeholder={`New Sub-topic...`}
            autoFocus
          />
          <button
            onClick={handleAddChild}
            className="p-1 text-green-600 hover:text-green-800"
          >
            <Save className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsAdding(false)}
            className="p-1 text-gray-500 hover:text-gray-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* --- Render Children Recursively --- */}
      {node.children && (
        <div className="mt-2">
          {node.children.map((child) => (
            <TopicNodeComponent
              key={child.id}
              node={child}
              level={level + 1}
              onUpdate={onUpdate}
              onDelete={onDelete}
              onAddChild={onAddChild}
            />
          ))}
        </div>
      )}
    </div>
  );
};


/**
 * ==================================================================
 * --- 虫 NEW: Bulk Add Modal Component 虫 ---
 * ==================================================================
 */
interface BulkAddModalProps {
  onClose: () => void;
  onSave: (newTree: TopicTree) => void;
  existingTree: TopicTree;
}

const BulkAddModal: React.FC<BulkAddModalProps> = ({ onClose, onSave, existingTree }) => {
  const [text, setText] = useState('');
  const [isParsing, setIsParsing] = useState(false);

  // --- This is the new parser logic ---
  const parseIndentedTextToTree = (text: string): TopicTree => {
    const lines = text.split('\n').filter(line => line.trim() !== '');
    const tree: TopicTree = [];
    const parentStack: (TopicNode | null)[] = [null, null, null]; // For Levels 0, 1, 2

    lines.forEach(line => {
      const indentation = line.match(/^(\s*)/)?.[1].length || 0;
      const name = line.trim();
      
      // Determine level (2 spaces = 1 level)
      const level = Math.floor(indentation / 2); // 0, 1, 2
      
      if (level > 2) {
        console.warn(`Line "${line}" has too much indentation. Max 2 levels (4 spaces).`);
        return; // Skip this line
      }

      const parent = parentStack[level];
      const parentId = parent ? parent.id : '';
      
      const newNode: TopicNode = {
        id: createTopicId(name, parentId),
        name: name,
        children: [],
      };

      if (level === 0) {
        tree.push(newNode);
        parentStack[0] = newNode;
        parentStack[1] = null;
        parentStack[2] = null;
      } else if (level === 1 && parentStack[0]) {
        parentStack[0].children.push(newNode);
        parentStack[1] = newNode;
        parentStack[2] = null;
      } else if (level === 2 && parentStack[1]) {
        parentStack[1].children.push(newNode);
        parentStack[2] = newNode;
      }
    });

    return tree;
  };
  
  // --- This is the new merge logic ---
  const mergeTrees = (existing: TopicTree, newFragment: TopicTree): TopicTree => {
    const newTree = [...existing];
    
    // Create a map of existing root nodes for fast lookup
    const existingMap = new Map<string, TopicNode>(existing.map(node => [node.id, node]));

    newFragment.forEach(newNode => {
      if (existingMap.has(newNode.id)) {
        // Node exists, merge children
        const existingNode = existingMap.get(newNode.id)!;
        existingNode.children = mergeTrees(existingNode.children, newNode.children);
      } else {
        // Node is new, just add it
        newTree.push(newNode);
      }
    });

    return newTree;
  };

  const handleParseAndSave = () => {
    if (text.trim() === '') return alert('Paste your text first.');
    setIsParsing(true);
    
    try {
      // 1. Parse the new text into a tree fragment
      const newTreeFragment = parseIndentedTextToTree(text);
      
      // 2. Merge this fragment with the existing tree
      const newFullTree = mergeTrees(existingTree, newTreeFragment);
      
      // 3. Call the onSave function from the parent
      onSave(newFullTree);
      onClose();

    } catch (err) {
      console.error(err);
      alert('Failed to parse text. Check console for errors.');
    } finally {
      setIsParsing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-semibold">Bulk Add Topics</h2>
          <button onClick={onClose} className="p-1 rounded-full text-gray-500 hover:bg-gray-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4 overflow-y-auto">
          <p className="text-sm text-gray-600">
            Paste your syllabus below. Use <strong>2 spaces</strong> for Level 2 and <strong>4 spaces</strong> for Level 3.
          </p>
          <pre className="text-xs p-2 bg-gray-100 rounded">
            {`GS 1
  Modern History
    Gandhian Phase
  Ancient History
GS 2
  Polity`}
          </pre>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={15}
            className="w-full p-2 border rounded-md font-mono text-sm"
            placeholder="GS 1
  Modern History
    ...etc"
          />
        </div>

        <div className="flex items-center justify-end p-4 border-t bg-gray-50">
          <button onClick={onClose} disabled={isParsing} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border rounded-md mr-2 disabled:opacity-50">
            Cancel
          </button>
          <button
            onClick={handleParseAndSave}
            disabled={isParsing}
            className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {isParsing ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Parse & Save Tree
          </button>
        </div>
      </div>
    </div>
  );
};


/**
 * ==================================================================
 * --- The Main Tree Manager Component ---
 * (Updated to include bulk add button and state)
 * ==================================================================
 */
export default function TopicTreeManager() {
  const [tree, setTree] = useState<TopicTree>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newRootName, setNewRootName] = useState('');
  
  // --- NEW STATE ---
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);

  // --- 1. Fetch Tree from Firestore (unchanged) ---
  const fetchTree = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const docSnap = await getDoc(topicTreeDocRef);
      if (docSnap.exists()) {
        setTree(docSnap.data().tree || []);
      } else {
        setTree([]);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to fetch topic tree. Please check console.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTree();
  }, [fetchTree]);

  // --- 2. Save Tree to Firestore (unchanged) ---
  const saveTree = async (newTree: TopicTree) => {
    setIsSaving(true);
    setError(null);
    try {
      await setDoc(topicTreeDocRef, { tree: newTree });
      setTree(newTree); // Update local state
    } catch (err) {
      console.error(err);
      setError('Failed to save tree. Please check console.');
    } finally {
      setIsSaving(false);
    }
  };

  // --- 3. Recursive Helper Functions (unchanged) ---
  const updateNodeName = (nodes: TopicNode[], nodeId: string, newName: string): TopicNode[] => {
    return nodes.map((node) => {
      if (node.id === nodeId) {
        return { ...node, name: newName };
      }
      if (node.children) {
        return { ...node, children: updateNodeName(node.children, nodeId, newName) };
      }
      return node;
    });
  };

  const deleteNode = (nodes: TopicNode[], nodeId: string): TopicNode[] => {
    return nodes.filter(node => node.id !== nodeId).map(node => {
      if (node.children) {
        return { ...node, children: deleteNode(node.children, nodeId) };
      }
      return node;
    });
  };

  const addChildNode = (nodes: TopicNode[], parentId: string, newNode: TopicNode): TopicNode[] => {
    return nodes.map((node) => {
      if (node.id === parentId) {
        return { ...node, children: [...node.children, newNode] };
      }
      if (node.children) {
        return { ...node, children: addChildNode(node.children, parentId, newNode) };
      }
      return node;
    });
  };

  // --- 4. Event Handlers (unchanged) ---
  const handleUpdate = (nodeId: string, newName: string) => {
    const newTree = updateNodeName(tree, nodeId, newName);
    saveTree(newTree);
  };

  const handleDelete = (nodeId: string) => {
    const newTree = deleteNode(tree, nodeId);
    saveTree(newTree);
  };

  const handleAddChild = (parentId: string, newNode: TopicNode) => {
    const newTree = addChildNode(tree, parentId, newNode);
    saveTree(newTree);
  };

  const handleAddRootNode = () => {
    if (newRootName.trim() === '') return alert('Topic name cannot be empty.');
    const newId = createTopicId(newRootName.trim());
    if (tree.some(node => node.id === newId)) {
      return alert('A root topic with this ID already exists.');
    }
    const newNode: TopicNode = {
      id: newId,
      name: newRootName.trim(),
      children: [],
    };
    const newTree = [...tree, newNode];
    saveTree(newTree);
    setNewRootName('');
  };

  // --- 5. Render Logic (Updated) ---
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-40">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <>
      <div className="border border-gray-200 rounded-lg p-4">
        {/* --- Error Display --- */}
        {error && (
          <div className="flex items-center p-3 mb-4 text-sm text-red-700 bg-red-100 rounded-lg">
            <AlertCircle className="w-5 h-5 mr-2" />
            <strong>Error:</strong> {error}
          </div>
        )}

        {/* --- The Tree Renderer --- */}
        <div className="space-y-2">
          {tree.length === 0 && !isLoading && (
            <p className="text-gray-500">
              No topics found. Start by adding a new root topic (e.g., "GS 1").
            </p>
          )}
          {tree.map((rootNode) => (
            <TopicNodeComponent
              key={rootNode.id}
              node={rootNode}
              level={0}
              onUpdate={handleUpdate}
              onDelete={handleDelete}
              onAddChild={handleAddChild}
            />
          ))}
        </div>

        {/* --- Action Buttons (UPDATED) --- */}
        <div className="flex items-center gap-2 mt-6 border-t pt-4">
          <input
            type="text"
            value={newRootName}
            onChange={(e) => setNewRootName(e.target.value)}
            className="px-3 py-2 border rounded-md"
            placeholder="New Root Topic (e.g., GS 1)"
          />
          <button
            onClick={handleAddRootNode}
            className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-1" />
            Add Root Topic
          </button>
          
          {/* --- NEW BULK ADD BUTTON --- */}
          <button
            onClick={() => setIsBulkModalOpen(true)}
            className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
          >
            <Upload className="w-4 h-4 mr-1" />
            Bulk Add...
          </button>
        </div>
        
        {/* --- Save Status Indicator --- */}
        {isSaving && (
          <div className="flex items-center mt-4 text-sm text-gray-500">
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Saving...
          </div>
        )}
      </div>

      {/* --- NEW BULK ADD MODAL RENDER --- */}
      {isBulkModalOpen && (
        <BulkAddModal
          onClose={() => setIsBulkModalOpen(false)}
          existingTree={tree}
          onSave={(newTree) => {
            // This just calls the same save function
            saveTree(newTree); 
          }}
        />
      )}
    </>
  );
}