// app/admin/prelims/page.tsx
import { db } from "@/lib/db";
import { topics } from "@/lib/schema";
import { eq, isNull } from "drizzle-orm";
import PrelimStudioClient from "@/app/admin/components/PrelimStudioClient";

export const dynamic = 'force-dynamic';

export default async function PrelimStudioPage() {
  // Fetch initial L2 Subjects for the scoped searchable dropdown
  // Level 2 topics are 'Subjects' in your hierarchy
  const subjects = await db.select().from(topics).where(eq(topics.level, 2));

  return (
    <div className="w-full h-full min-h-screen bg-slate-100">
      <PrelimStudioClient initialSubjects={subjects} />
    </div>
  );
}