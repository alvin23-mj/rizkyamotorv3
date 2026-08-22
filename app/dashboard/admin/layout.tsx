import type { Metadata } from 'next';
import AdminSidebar from '@/components/layout/AdminSidebar';
import AdminTopHeader from '@/components/layout/AdminTopHeader';

export const metadata: Metadata = {
  title: 'Admin | Rizkya Motor',
  description: 'Dashboard pengelolaan showroom Rizkya Motor.',
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-slate-100 text-slate-900 overflow-hidden">
      <AdminSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar Header with User Profile & Logout */}
        <AdminTopHeader />

        {/* Scrollable Main Content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
