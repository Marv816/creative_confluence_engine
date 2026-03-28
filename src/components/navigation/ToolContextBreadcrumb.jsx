import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import Icon from '../AppIcon';

const ToolContextBreadcrumb = () => {
  const location = useLocation();

  const toolRoutes = {
    '/concept-explorer': {
      name: 'Concept Explorer',
      icon: 'Lightbulb',
      color: 'generator-indigo',
    },
    '/lyrical-prompt-machine': {
      name: 'Lyrical Prompt Machine',
      icon: 'Music',
      color: 'generator-purple',
    },
  };

  const currentTool = toolRoutes?.[location?.pathname];

  if (!currentTool) {
    return null;
  }

  return (
    <>
      <div className="tool-breadcrumb">
        <Link to="/creative-dashboard" className="breadcrumb-link flex items-center gap-2">
          <Icon name="LayoutDashboard" size={16} />
          <span>Dashboard</span>
        </Link>
        <Icon name="ChevronRight" size={16} className="breadcrumb-separator" />
        <div className="flex items-center gap-2 text-foreground">
          <Icon name={currentTool?.icon} size={16} />
          <span className="font-medium">{currentTool?.name}</span>
        </div>
      </div>
      <div className="tool-breadcrumb-mobile">
        <Link
          to="/creative-dashboard"
          className="flex flex-col items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
        >
          <Icon name="LayoutDashboard" size={20} />
          <span className="text-xs">Dashboard</span>
        </Link>
        <div className="flex flex-col items-center gap-1 text-foreground">
          <Icon name={currentTool?.icon} size={20} />
          <span className="text-xs font-medium">{currentTool?.name}</span>
        </div>
        <Link
          to="/writing-workspace"
          className="flex flex-col items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
        >
          <Icon name="PenTool" size={20} />
          <span className="text-xs">Workspace</span>
        </Link>
      </div>
    </>
  );
};

export default ToolContextBreadcrumb;