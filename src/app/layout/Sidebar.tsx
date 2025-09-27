import { FileText, Monitor, TrendingUp, Settings } from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
}

export function Sidebar({ isOpen }: SidebarProps) {
  const menuItems = [
    { icon: Monitor, label: 'Monitor', active: true },
    { icon: FileText, label: 'Slides', active: false },
    { icon: TrendingUp, label: 'Insights', active: false },
    { icon: Settings, label: 'Settings', active: false },
  ];

  return (
    <aside
      className={`${
        isOpen ? 'w-64' : 'w-0'
      } transition-all duration-300 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 overflow-hidden`}
    >
      <div className="p-4">
        <nav className="space-y-2">
          {menuItems.map((item, index) => (
            <a
              key={index}
              href="#"
              className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                item.active
                  ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </a>
          ))}
        </nav>
      </div>
    </aside>
  );
}
