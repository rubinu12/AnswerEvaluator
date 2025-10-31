import { BookCopy, PenSquare, Landmark, TrendingUp, Target, FileClock, Sparkles } from 'lucide-react';

const evaluations = [
  {
    title: "GS-I Test #12",
    subject: "History & Culture",
    score: "23/55",
    percentage: 42,
    date: "Jan 15",
    Icon: BookCopy,
    iconBg: "bg-red-100",
    iconText: "text-red-600"
  },
  {
    title: "Essay Practice #8",
    subject: "Social Issues",
    score: "89/125",
    percentage: 71,
    date: "Jan 14",
    Icon: PenSquare,
    iconBg: "bg-orange-100",
    iconText: "text-orange-600"
  },
  {
    title: "GS-II Mock #5",
    subject: "Governance",
    score: "31/55",
    percentage: 56,
    date: "Jan 13",
    Icon: Landmark,
    iconBg: "bg-blue-100",
    iconText: "text-blue-600"
  }
];

export default function RecentEvaluations() {
  return (
    // [FIX] Responsive padding on the main card
    <div className="relative bg-white p-4 xs:p-6 rounded-2xl shadow-lg border border-gray-200/60 transition-transform duration-300 hover:scale-[1.02]">
      <Sparkles className="absolute -top-3 -left-3 h-8 w-8 text-yellow-400" fill="currentColor" />
      
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
           {/* [FIX] Responsive icon size */}
          <div className="flex h-9 w-9 xs:h-10 xs:w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600">
            <FileClock className="h-5 w-5 xs:h-6 xs:w-6 text-white" />
          </div>
           {/* [FIX] Responsive title font size */}
          <h2 className="text-lg xs:text-xl font-semibold text-gray-800">Recent Evaluations</h2>
        </div>
        <a href="#" className="text-sm font-semibold text-emerald-600 hover:text-emerald-800 flex-shrink-0">
          View All
        </a>
      </div>

      <div className="mt-4 space-y-2">
        {evaluations.map((item, index) => (
          // [FIX] Reduced padding on list items for smaller screens
          <div key={index} className="flex items-center justify-between p-2 xs:p-3 rounded-lg hover:bg-slate-50/80 transition-colors">
            <div className="flex items-center gap-3 xs:gap-4">
              <div className={`rounded-lg p-2 ${item.iconBg}`}>
                {/* [FIX] Responsive icon size */}
                <item.Icon className={`h-5 w-5 xs:h-6 xs:w-6 ${item.iconText}`} />
              </div>
              <div>
                {/* [FIX] Responsive font size for the title */}
                <p className="font-semibold text-gray-700 text-sm xs:text-base">{item.title}</p>
                <p className="text-xs text-gray-500">{item.subject}</p>
              </div>
            </div>
            <div className="text-right flex-shrink-0 ml-2">
              <div className="flex items-center gap-1 xs:gap-2">
                {/* [FIX] Responsive font size for the score */}
                <p className="font-bold text-gray-800 text-sm xs:text-base">{item.score}</p>
                <span className="text-[10px] xs:text-xs font-semibold text-green-600 bg-green-100 px-1.5 py-0.5 rounded-full">
                  {item.percentage}%
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-1">{item.date}</p>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-2 gap-x-2 xs:gap-x-4">
        <div className="flex items-center gap-2 xs:gap-3">
          <div className="p-2 bg-slate-100 rounded-lg">
            <Target className="h-5 w-5 text-slate-500" />
          </div>
          <div>
            <p className="font-bold text-gray-800 text-sm xs:text-base">4.2</p>
            <p className="text-xs text-gray-500">Avg. This Week</p>
          </div>
        </div>
        <div className="flex items-center gap-2 xs:gap-3">
          <div className="p-2 bg-slate-100 rounded-lg">
            <TrendingUp className="h-5 w-5 text-slate-500" />
          </div>
          <div>
            <p className="font-bold text-green-600 text-sm xs:text-base">+12%</p>
            <p className="text-xs text-gray-500">Improvement</p>
          </div>
        </div>
      </div>
    </div>
  );
}