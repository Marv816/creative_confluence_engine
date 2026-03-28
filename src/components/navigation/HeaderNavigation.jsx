import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Icon from '../AppIcon';
import Button from '../ui/Button';

const HeaderNavigation = ({ isAuthenticated = false, onAuthClick, onLogout }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path) => location?.pathname === path;

  const handleWorkspaceClick = () => {
    navigate('/writing-workspace');
    setIsMobileMenuOpen(false);
  };

  const handleDashboardClick = () => {
    navigate('/creative-dashboard');
    setIsMobileMenuOpen(false);
  };

  const handleContentDashboardClick = () => {
    navigate('/user-content-dashboard');
    setIsMobileMenuOpen(false);
  };

  const handleDrumGeneratorClick = () => {
    navigate('/drum-generator');
    setIsMobileMenuOpen(false);
  };

  const handleProjectCollaborationClick = () => {
    navigate('/project-invitation-permissions');
    setIsMobileMenuOpen(false);
  };

  const handleMarketplaceClick = () => {
    navigate('/community-sound-marketplace');
    setIsMobileMenuOpen(false);
  };

  const handleUploadStudioClick = () => {
    navigate('/producer-upload-studio');
    setIsMobileMenuOpen(false);
  };

  const handleAuthClick = () => {
    setIsMobileMenuOpen(false);
    if (onAuthClick) {
      onAuthClick();
    } else {
      navigate('/login');
    }
  };

  const handleLogoutClick = () => {
    setIsMobileMenuOpen(false);
    if (onLogout) {
      onLogout();
    }
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const navigationLinks = [
    { name: 'Home', path: '/' },
    { name: 'AI Tools', path: '/ai-tools' },
    { name: 'Artists', path: '/artists' },
    { name: 'Marketplace', path: '/community-sound-marketplace' },
    { name: 'Transactions', path: '/transaction-history-financial-management' },
    { name: 'Collaborations', path: '/collaborations' },
    { name: 'Blog', path: '/blog' },
  ];

  return (
    <>
      <header className="header-navigation">
        <div className="header-content">
          <Link to="/creative-dashboard" className="header-logo">
            <div className="header-logo-icon">
              <Icon name="Sparkles" size={20} color="white" />
            </div>
            <span className="text-lg font-semibold hidden sm:inline-block">
              Lyrical Metaverse
            </span>
          </Link>

          <nav className="header-nav-items">
            <button
              onClick={handleDashboardClick}
              className={`header-nav-link ${isActive('/creative-dashboard') ? 'active' : ''}`}
            >
              Dashboard
            </button>
            <button
              onClick={handleContentDashboardClick}
              className={`header-nav-link ${isActive('/user-content-dashboard') ? 'active' : ''}`}
            >
              Content
            </button>
            <button
              onClick={handleMarketplaceClick}
              className={`header-nav-link ${isActive('/community-sound-marketplace') ? 'active' : ''}`}
            >
              Marketplace
            </button>
            <button
              onClick={handleProjectCollaborationClick}
              className={`header-nav-link ${isActive('/project-invitation-permissions') ? 'active' : ''}`}
            >
              Collaborate
            </button>
            <button
              onClick={handleDrumGeneratorClick}
              className={`header-nav-link ${isActive('/drum-generator') ? 'active' : ''}`}
            >
              Drums
            </button>
            <button
              onClick={handleWorkspaceClick}
              className={`header-nav-link ${isActive('/writing-workspace') ? 'active' : ''}`}
            >
              Workspace
            </button>
          </nav>

          <div className="header-actions">
            <button
              onClick={handleWorkspaceClick}
              className="workspace-fab hidden lg:flex"
              aria-label="Open Writing Workspace"
            >
              <Icon name="PenTool" size={20} className="workspace-fab-icon" />
              <span className="workspace-fab-text">Workspace</span>
            </button>

            {isAuthenticated ? (
              <Button
                variant="ghost"
                size="sm"
                iconName="LogOut"
                iconPosition="left"
                onClick={handleLogoutClick}
                className="hidden lg:flex"
              >
                Logout
              </Button>
            ) : (
              <Button
                variant="default"
                size="sm"
                iconName="LogIn"
                iconPosition="left"
                onClick={handleAuthClick}
                className="hidden lg:flex"
              >
                Sign In
              </Button>
            )}

            <button
              onClick={toggleMobileMenu}
              className="mobile-menu-button"
              aria-label="Toggle mobile menu"
              aria-expanded={isMobileMenuOpen}
            >
              <Icon name={isMobileMenuOpen ? 'X' : 'Menu'} size={24} />
            </button>
          </div>
        </div>
      </header>

      {isMobileMenuOpen && (
        <>
          <div
            className="mobile-menu-overlay"
            onClick={toggleMobileMenu}
            aria-hidden="true"
          />
          <div className={`mobile-menu-panel ${isMobileMenuOpen ? 'mobile-menu-enter-active' : 'mobile-menu-enter'}`}>
            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="header-logo-icon">
                    <Icon name="Sparkles" size={20} color="white" />
                  </div>
                  <span className="text-lg font-semibold">Lyrical Metaverse</span>
                </div>
                <button
                  onClick={toggleMobileMenu}
                  className="p-2 rounded-lg hover:bg-muted/50 transition-colors"
                  aria-label="Close menu"
                >
                  <Icon name="X" size={24} />
                </button>
              </div>

              <nav className="space-y-2">
                <button
                  onClick={handleDashboardClick}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                    isActive('/creative-dashboard')
                      ? 'bg-muted/50 text-foreground' :'text-muted-foreground hover:text-foreground hover:bg-muted/30'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon name="LayoutDashboard" size={20} />
                    <span className="font-medium">Dashboard</span>
                  </div>
                </button>

                <button
                  onClick={handleContentDashboardClick}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                    isActive('/user-content-dashboard')
                      ? 'bg-muted/50 text-foreground' :'text-muted-foreground hover:text-foreground hover:bg-muted/30'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon name="FolderOpen" size={20} />
                    <span className="font-medium">Content Dashboard</span>
                  </div>
                </button>

                <button
                  onClick={handleMarketplaceClick}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                    isActive('/community-sound-marketplace')
                      ? 'bg-muted/50 text-foreground' :'text-muted-foreground hover:text-foreground hover:bg-muted/30'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon name="ShoppingBag" size={20} />
                    <span className="font-medium">Sound Marketplace</span>
                  </div>
                </button>

                <button
                  onClick={handleUploadStudioClick}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                    isActive('/producer-upload-studio')
                      ? 'bg-muted/50 text-foreground' :'text-muted-foreground hover:text-foreground hover:bg-muted/30'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon name="Upload" size={20} />
                    <span className="font-medium">Upload Studio</span>
                  </div>
                </button>

                <button
                  onClick={handleProjectCollaborationClick}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                    isActive('/project-invitation-permissions')
                      ? 'bg-muted/50 text-foreground' :'text-muted-foreground hover:text-foreground hover:bg-muted/30'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon name="Users" size={20} />
                    <span className="font-medium">Project Collaboration</span>
                  </div>
                </button>

                <button
                  onClick={handleDrumGeneratorClick}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                    isActive('/drum-generator')
                      ? 'bg-muted/50 text-foreground' :'text-muted-foreground hover:text-foreground hover:bg-muted/30'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon name="Music4" size={20} />
                    <span className="font-medium">Drum Generator</span>
                  </div>
                </button>

                <button
                  onClick={handleWorkspaceClick}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                    isActive('/writing-workspace')
                      ? 'bg-muted/50 text-foreground' :'text-muted-foreground hover:text-foreground hover:bg-muted/30'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon name="PenTool" size={20} />
                    <span className="font-medium">Workspace</span>
                  </div>
                </button>
              </nav>

              <div className="pt-6 border-t border-white/10">
                {isAuthenticated ? (
                  <Button
                    variant="ghost"
                    fullWidth
                    iconName="LogOut"
                    iconPosition="left"
                    onClick={handleLogoutClick}
                  >
                    Logout
                  </Button>
                ) : (
                  <Button
                    variant="default"
                    fullWidth
                    iconName="LogIn"
                    iconPosition="left"
                    onClick={handleAuthClick}
                  >
                    Sign In
                  </Button>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default HeaderNavigation;