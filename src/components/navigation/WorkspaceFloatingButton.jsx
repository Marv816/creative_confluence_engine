import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Icon from '../AppIcon';

const WorkspaceFloatingButton = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const isWorkspacePage = location?.pathname === '/writing-workspace';

  if (isWorkspacePage) {
    return null;
  }

  const handleClick = () => {
    navigate('/writing-workspace');
  };

  return (
    <button
      onClick={handleClick}
      className="workspace-fab lg:hidden"
      aria-label="Open Writing Workspace"
    >
      <Icon name="PenTool" size={24} className="workspace-fab-icon" />
    </button>
  );
};

export default WorkspaceFloatingButton;