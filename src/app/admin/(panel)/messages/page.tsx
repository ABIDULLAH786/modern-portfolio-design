import { Inbox } from "@/components/admin/editors/inbox";
import { PageHeader } from "@/components/admin/page-header";
import { adminMessages } from "@/server/queries/admin";

export default async function MessagesPage({ searchParams }: PageProps<"/admin/messages">) {
  const sp = await searchParams;
  const status = sp.status === "all" || sp.status === "archived" ? sp.status : sp.id ? "all" : "new";
  const q = typeof sp.q === "string" ? sp.q.slice(0, 100) : "";
  const messages = await adminMessages({ status, q });
  return (
    <>
      <PageHeader title="Messages" description="Everything sent through your contact form." />
      <Inbox key={`${status}|${q}|${messages.map((m) => m.id + m.status).join(",")}`} messages={messages} status={status} q={q} openId={typeof sp.id === "string" ? sp.id : null} />
    </>
  );
}
