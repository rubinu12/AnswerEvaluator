// lib/adminTypes.ts
// This is a new file to hold types specific to the admin panel.

// This defines the structure for our "Master Topic Tree"
export interface TopicNode {
  id: string; // A unique ID for this topic (e.g., 'gs1', 'modern-history')
  name: string; // The display name (e.g., 'Modern History')
  children: TopicNode[]; // A list of sub-topics (Level 2 or Level 3)
}

// The entire tree is an array of Level 1 nodes (e.g., [GS1, GS2, GS3, GS4])
export type TopicTree = TopicNode[];