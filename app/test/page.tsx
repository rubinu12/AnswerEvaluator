import {
  addTopic,
  getAllTopics,
  addQuestion,
  attachTopicToQuestion,
  addDemand,
  searchQuestions,
  getTopicById
} from './actions';

export default async function TestConsole({ searchParams }: any) {
  const params = await searchParams;
  const q = params?.q ?? '';

  const topics = await getAllTopics();
  const results = q ? await searchQuestions(q) : [];

  return (
    <div style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <h1 style={{ marginBottom: '2rem' }}>🔥 GS2 → Polity Pipeline Test Console</h1>

      {/* ======================================================
         ADD TOPIC (SUPER SIMPLE)
      ======================================================= */}
      <section style={{ border: '1px solid #ddd', padding: '1rem', borderRadius: '6px', marginBottom: '2rem' }}>
        <h2 style={{ marginBottom: '1rem' }}>➕ Add Topic (GS2 → Polity)</h2>

        <form
          action={async (fd) => {
            'use server';

            const name = fd.get('name') as string;
            const parentId = fd.get('parent') as string || null;

            const paper = 'GS2';
            const subject = 'Polity';

            let level = 2; // default = subject

            if (parentId) {
              const parent = await getTopicById(parentId);

              if (parent.level === 2) level = 3; // parent = Polity -> Anchor
              if (parent.level === 3) level = 4; // parent = Anchor -> Operable
            }

            await addTopic(name, paper, subject, level, parentId);
          }}
          style={{ display: 'grid', gap: '0.5rem' }}
        >
          <input
            name="name"
            placeholder="Topic Name (e.g., Executive, President)"
            required
            style={{ padding: '0.5rem' }}
          />

          <label>Parent (optional)</label>
          <select name="parent" style={{ padding: '0.5rem' }}>
            <option value="">(No Parent)</option>
            {topics.map((t: any) => (
              <option key={t.id} value={t.id}>
                {t.ancestry_path}
              </option>
            ))}
          </select>

          <button type="submit" style={{ marginTop: '0.5rem', padding: '0.5rem' }}>
            Add Polity Topic
          </button>
        </form>
      </section>

      {/* ======================================================
         ADD QUESTION (SUPER SIMPLE)
      ======================================================= */}
      <section style={{ border: '1px solid #ddd', padding: '1rem', borderRadius: '6px', marginBottom: '2rem' }}>
        <h2 style={{ marginBottom: '1rem' }}>📝 Add Question (GS2 → Polity)</h2>

        <form
          action={async (fd) => {
            'use server';

            const questionText = fd.get('question_text') as string;
            const marks = Number(fd.get('marks'));
            const directive = fd.get('directive') as string;

            // Hardcode GS2 now
            const qid = await addQuestion('GS2', 'Polity', questionText, directive, marks);

            const primary = fd.get('primary_topic') as string;
            if (primary) await attachTopicToQuestion(qid, primary, 'PRIMARY');

            const secondary = fd.getAll('secondary_topic') as string[];
            for (const sid of secondary) {
              await attachTopicToQuestion(qid, sid, 'SECONDARY');
            }

            // auto test demands
            await addDemand(qid, 1, 'Core Explanation', 'Explain main idea', 5);
            await addDemand(qid, 2, 'Critical Analysis', 'Analyze critically', 5);
          }}
          style={{ display: 'grid', gap: '0.5rem' }}
        >
          <input
            name="directive"
            placeholder="Directive (Discuss, Examine)"
            required
            style={{ padding: '0.5rem' }}
          />

          <input
            name="marks"
            type="number"
            placeholder="Marks (10, 15)"
            required
            style={{ padding: '0.5rem' }}
          />

          <textarea
            name="question_text"
            placeholder="Enter UPSC mains question"
            rows={3}
            required
            style={{ width: '100%', padding: '0.5rem' }}
          />

          <label>Primary Topic</label>
          <select name="primary_topic" required style={{ padding: '0.5rem' }}>
            <option value="">Select</option>
            {topics.map((t: any) => (
              <option key={t.id} value={t.id}>
                {t.ancestry_path}
              </option>
            ))}
          </select>

          <label>Secondary Topics (multi-select)</label>
          <select name="secondary_topic" multiple size={5} style={{ padding: '0.5rem' }}>
            {topics.map((t: any) => (
              <option key={t.id} value={t.id}>
                {t.ancestry_path}
              </option>
            ))}
          </select>

          <button type="submit" style={{ marginTop: '0.5rem', padding: '0.5rem' }}>
            Add Question
          </button>
        </form>
      </section>

      {/* ======================================================
         SEARCH
      ======================================================= */}
      <section style={{ border: '1px solid #ddd', padding: '1rem', borderRadius: '6px' }}>
        <h2 style={{ marginBottom: '1rem' }}>🔍 Search Questions</h2>

        <form method="GET" style={{ display: 'flex', gap: '0.5rem' }}>
          <input
            name="q"
            defaultValue={q}
            placeholder="Search by keyword..."
            style={{ flex: 1, padding: '0.5rem' }}
          />
          <button type="submit" style={{ padding: '0.5rem 1rem' }}>Search</button>
        </form>

        <div style={{ marginTop: '1rem' }}>
          {results.map((r: any) => (
            <div key={r.id} style={{ padding: '0.5rem 0', borderBottom: '1px solid #eee' }}>
              <b>{r.paper}</b> — {r.question_text}

              <div>
                <i>Topics:</i>
                <ul>
                  {r.topics?.map((t: any, i: number) => (
                    <li key={i}>{t.topic} <small>({t.role})</small></li>
                  ))}
                </ul>
              </div>

              <div>
                <i>Demands:</i>
                <ul>
                  {r.demands?.map((d: any, i: number) => (
                    <li key={i}>D{d.order}: {d.title} ({d.marks} marks)</li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
