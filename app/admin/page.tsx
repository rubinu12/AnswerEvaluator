// app/admin/page.tsx
// This file replaces your old admin page.
// This is the new "Dashboard" landing page, with placeholders
// that match your screenshot.
import {
  Users,
  BookCopy,
  FileText,
  Activity,
  PlusCircle,
  ListTree,
  UploadCloud,
} from 'lucide-react';

// Placeholder Stat Card Component
const StatCard = ({ title, value, icon: Icon, color }: any) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex items-center justify-between">
        <div className={`p-3 rounded-full ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div className="text-right">
          <p className="text-3xl font-bold text-gray-800">{value}</p>
          <p className="text-sm font-medium text-gray-500">{title}</p>
        </div>
      </div>
    </div>
  );
};

// Placeholder Quick Link Component
const QuickLink = ({ title, icon: Icon, href }: any) => {
  return (
    <a
      href={href}
      className="flex items-center p-3 -m-2 rounded-lg text-gray-700 hover:bg-gray-50"
    >
      <Icon className="w-5 h-5 mr-3 text-gray-400" />
      <span className="font-medium">{title}</span>
    </a>
  );
};

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>

      {/* 1. Stat Cards (from your image) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Prelims Questions"
          value="5,000+"
          icon={BookCopy}
          color="bg-blue-500"
        />
        <StatCard
          title="Total Mains Answers"
          value="1,200"
          icon={FileText}
          color="bg-green-500"
        />
        <StatCard
          title="Total Users"
          value="450"
          icon={Users}
          color="bg-indigo-500"
        />
        <StatCard
          title="Site Activity"
          value="High"
          icon={Activity}
          color="bg-red-500"
        />
      </div>

      {/* 2. Main Content (from your image) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Recent Activity */}
        <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
          <ul className="space-y-4">
            <li className="flex items-center">
              <div className="p-2 rounded-full bg-green-100 text-green-700">
                <PlusCircle className="w-5 h-5" />
              </div>
              <p className="ml-3 text-sm">
                You added <strong>50 new questions</strong> to the 'History'
                topic.
              </p>
              <span className="ml-auto text-xs text-gray-400">2h ago</span>
            </li>
            <li className="flex items-center">
              <div className="p-2 rounded-full bg-blue-100 text-blue-700">
                <Activity className="w-5 h-5" />
              </div>
              <p className="ml-3 text-sm">
                User <strong>aspirant_2025</strong> completed a 'Polity' quiz.
              </p>
              <span className="ml-auto text-xs text-gray-400">3h ago</span>
            </li>
            <li className="flex items-center">
              <div className="p-2 rounded-full bg-indigo-100 text-indigo-700">
                <FileText className="w-5 h-5" />
              </div>
              <p className="ml-3 text-sm">
                A new 'Mains Answer' was submitted for evaluation.
              </p>
              <span className="ml-auto text-xs text-gray-400">5h ago</span>
            </li>
          </ul>
        </div>

        {/* Right Column: Quick Links */}
        <div className="lg:col-span-1 bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Quick Links</h2>
          <div className="space-y-3">
            <QuickLink
              title="Build Master Topic Tree"
              icon={ListTree}
              href="/admin/topics"
            />
            <QuickLink
              title="Add New Prelims Questions"
              icon={PlusCircle}
              href="/admin/quiz"
            />
            <QuickLink
              title="Publish Live Content"
              icon={UploadCloud}
              href="/admin/publish"
            />
          </div>
        </div>
      </div>
    </div>
  );
}