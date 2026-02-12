// components/messaging/MessagingLayout.tsx

import MessagingMenu from "./MessagingMenu";

export default function MessagingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <MessagingMenu />

      {/* Zone droite */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Contenu principal */}
        <main className="flex-1 min-h-0 overflow-hidden">{children}</main>
      </div>
    </div>
  );
}
