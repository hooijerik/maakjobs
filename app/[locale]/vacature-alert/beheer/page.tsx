import type { Metadata } from "next";
import { Container, Card } from "@/components/ui";
import { getSubscriberByToken } from "@/lib/mutations";
import { AlertManager } from "@/components/AlertManager";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Alert beheren", robots: { index: false, follow: false } };

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; actie?: string }>;
}) {
  const { token, actie } = await searchParams;
  const sub = token ? getSubscriberByToken(token) : null;

  return (
    <Container className="py-12">
      <div className="mx-auto max-w-lg">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Je vacature-alert</h1>
        {!sub ? (
          <Card className="mt-4 p-6">
            <p className="text-slate-600">
              Deze link is ongeldig of verlopen. Stel desgewenst een nieuwe vacature-alert in via de website.
            </p>
          </Card>
        ) : (
          <AlertManager
            token={token!}
            email={sub.email}
            frequency={sub.frequency}
            startUnsub={actie === "uitschrijven"}
          />
        )}
      </div>
    </Container>
  );
}
