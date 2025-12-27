// app/admin/prelims/page.tsx
import { db } from "@/lib/db";
import { topics } from "@/lib/schema";
import { eq } from "drizzle-orm";
import PrelimStudioClient from "@/app/admin/components/PrelimStudioClient";

export const dynamic = "force-dynamic";

export default async function PrelimStudioPage() {
  /**
   * Fetch Level-2 topics (Subjects)
   * These define the hard boundary for topic search & attachment
   */
  const subjects = await db
    .select({
      id: topics.id,
      name: topics.name,
      slug: topics.slug,
    })
    .from(topics)
    .where(eq(topics.level, 2));

  return (
    <div className="w-full min-h-screen bg-slate-100">
      <PrelimStudioClient initialSubjects={subjects} />
    </div>
  );
}
