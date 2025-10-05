import Link from "next/link";

interface Action {
  label: string;
  onClick?: () => void;
  href?: string;
  isPrimary?: boolean;
}

interface QuickActionsProps {
  actions: Action[];
}

export default function QuickActions({ actions }: QuickActionsProps) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
      <div className="space-y-3">
        {actions.map((action, index) => {
          const buttonClass = `w-full text-left px-4 py-2 rounded-lg transition-colors ${
            action.isPrimary
              ? "bg-orange-50 text-orange-700 hover:bg-orange-100"
              : "bg-gray-50 text-gray-700 hover:bg-gray-100"
          }`;
          
          if (action.href) {
            return (
              <Link
                key={index}
                href={action.href}
                className={buttonClass}
              >
                {action.label}
              </Link>
            );
          }
          
          return (
            <button
              key={index}
              onClick={action.onClick}
              className={buttonClass}
            >
              {action.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
