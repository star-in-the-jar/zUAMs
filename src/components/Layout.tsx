import React, { useState, useEffect } from 'react';
import Assistant from '@/components/Assistant';
import AssistantIcon from '@mui/icons-material/Assistant';

interface LayoutProps {
  children: React.ReactNode;
  sidebarItems?: Array<{
    label: string;
    href?: string;
    onClick?: () => void;
  }>;
  drawerId?: string;
  openButtonText?: string;
  openButtonClassName?: string;
}

const Layout: React.FC<LayoutProps> = ({
  children,
  drawerId = 'my-drawer-assistant',
  openButtonText = 'Masz pytania?',
  openButtonClassName = 'btn btn-primary btn-circle btn-lg shadow-lg',
}) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  useEffect(() => {
    const checkbox = document.getElementById(drawerId) as HTMLInputElement;
    if (!checkbox) return;

    const handleChange = () => {
      setIsDrawerOpen(checkbox.checked);
    };

    // Initial state
    setIsDrawerOpen(checkbox.checked);

    // Listen for changes
    checkbox.addEventListener('change', handleChange);

    return () => {
      checkbox.removeEventListener('change', handleChange);
    };
  }, [drawerId]);

  return (
    <div className="m-0 p-0 drawer drawer-end">
      <input
        id={drawerId}
        type="checkbox"
        className="drawer-toggle"
      />
      <div className="relative drawer-content">
        {/* Page content here */}
        {children}

        {/* Floating Action Button - hidden when drawer is open */}
        {!isDrawerOpen && (
          <div className="right-6 bottom-6 z-50 fixed">
            <label
              htmlFor={drawerId}
              className={`${openButtonClassName} tooltip tooltip-left`}
              data-tip={openButtonText}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  const checkbox = document.getElementById(drawerId) as HTMLInputElement;
                  if (checkbox) {
                    checkbox.checked = !checkbox.checked;
                  }
                }
              }}
            >
              <AssistantIcon className="w-6 h-6" />
            </label>
          </div>
        )}
      </div>
      <div className="drawer-side">
        <label
          htmlFor={drawerId}
          aria-label="close sidebar"
          className="drawer-overlay"
        />
        <ul className="z-50 bg-base-200 p-4 w-80 h-full min-h-screen text-base-content menu">
            <Assistant chatName="Zeus" />
        </ul>
      </div>
    </div>
  );
};

export default Layout;
