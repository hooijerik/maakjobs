import { Container } from "@/components/ui";
import type { LegalDoc } from "@/lib/legal";

export function LegalPage({ doc }: { doc: LegalDoc }) {
  return (
    <Container className="py-12">
      <article className="mx-auto max-w-2xl">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">{doc.title}</h1>
        <div className="mt-4 space-y-3 text-slate-600">
          {doc.intro.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
        <div className="mt-8 space-y-8">
          {doc.sections.map((s, i) => (
            <section key={i}>
              <h2 className="text-lg font-bold text-slate-900">{s.h}</h2>
              {s.body?.map((p, j) => (
                <p key={j} className="mt-2 leading-relaxed text-slate-600">
                  {p}
                </p>
              ))}
              {s.list && (
                <ul className="mt-2 list-disc space-y-1.5 pl-5 text-slate-600">
                  {s.list.map((li, j) => (
                    <li key={j}>{li}</li>
                  ))}
                </ul>
              )}
            </section>
          ))}
        </div>
      </article>
    </Container>
  );
}
