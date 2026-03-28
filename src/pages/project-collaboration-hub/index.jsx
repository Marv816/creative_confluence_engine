import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Plus, Search, Filter, Grid, List } from 'lucide-react';
import HeaderNavigation from '../../components/navigation/HeaderNavigation';
import WorkspaceFloatingButton from '../../components/navigation/WorkspaceFloatingButton';
import { useAuth } from '../../contexts/AuthContext';
import { collaborativeProjectService, collaborationInviteService } from '../../services/collaborationService';
import ProjectCard from './components/ProjectCard';
import CreateProjectModal from './components/CreateProjectModal';
import InvitationsPanel from './components/InvitationsPanel';
import FilterBar from './components/FilterBar';
import ProjectStats from './components/ProjectStats';

const ProjectCollaborationHub = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showInvitations, setShowInvitations] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    loadData();
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    applyFilters();
  }, [projects, searchQuery, filterType]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [projectsData, invitesData] = await Promise.all([
        collaborativeProjectService?.getAll(),
        collaborationInviteService?.getMyInvites()
      ]);
      setProjects(projectsData || []);
      setInvitations(invitesData || []);
    } catch (error) {
      console.error('Load data error:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...projects];

    // Search filter
    if (searchQuery) {
      filtered = filtered?.filter(p =>
        p?.title?.toLowerCase()?.includes(searchQuery?.toLowerCase()) ||
        p?.description?.toLowerCase()?.includes(searchQuery?.toLowerCase())
      );
    }

    // Type filter
    if (filterType === 'owned') {
      filtered = filtered?.filter(p => p?.ownerId === user?.id);
    } else if (filterType === 'shared') {
      filtered = filtered?.filter(p => p?.ownerId !== user?.id);
    } else if (filterType === 'recent') {
      filtered = filtered?.sort((a, b) => new Date(b?.updatedAt) - new Date(a?.updatedAt))?.slice(0, 10);
    }

    setFilteredProjects(filtered);
  };

  const handleCreateProject = async (projectData) => {
    try {
      const newProject = await collaborativeProjectService?.create(projectData);
      setProjects([newProject, ...projects]);
      setShowCreateModal(false);
      navigate(`/collaborative-project-workspace?id=${newProject?.id}`);
    } catch (error) {
      console.error('Create project error:', error);
      alert(error?.message || 'Failed to create project');
    }
  };

  const handleAcceptInvite = async (inviteId) => {
    try {
      await collaborationInviteService?.accept(inviteId);
      loadData();
    } catch (error) {
      console.error('Accept invite error:', error);
      alert(error?.message || 'Failed to accept invitation');
    }
  };

  const handleDeclineInvite = async (inviteId) => {
    try {
      await collaborationInviteService?.decline(inviteId);
      setInvitations(invitations?.filter(inv => inv?.id !== inviteId));
    } catch (error) {
      console.error('Decline invite error:', error);
      alert(error?.message || 'Failed to decline invitation');
    }
  };

  // Add this block - handler functions for HeaderNavigation
  const handleAuthClick = () => {
    navigate('/login');
  };

  const handleLogout = () => {
    // Implement logout logic or trigger logout from AuthContext
    navigate('/logout');
  };
  // End of added block

  const ownedProjects = projects?.filter(p => p?.ownerId === user?.id);
  const sharedProjects = projects?.filter(p => p?.ownerId !== user?.id);

  return (
    <div className="min-h-screen bg-black">
      <HeaderNavigation onAuthClick={handleAuthClick} onLogout={handleLogout} />
      <WorkspaceFloatingButton />

      {/* Hero Section */}
      <section className="pt-32 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <h1 className="text-4xl md:text-5xl font-black text-white mb-3">
                Project <span className="text-cyan-500">Collaboration Hub</span>
              </h1>
              <p className="text-lg text-gray-400">
                Manage shared projects, invite collaborators, and create together in real-time
              </p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-black font-bold rounded-lg hover:from-cyan-400 hover:to-blue-400 transition-all duration-300 shadow-lg shadow-cyan-500/30"
            >
              <Plus className="h-5 w-5" />
              Create Project
            </button>
          </div>
        </div>
      </section>

      {/* Statistics Panel */}
      <section className="pb-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <ProjectStats
            totalProjects={projects?.length}
            ownedProjects={ownedProjects?.length}
            sharedProjects={sharedProjects?.length}
            pendingInvites={invitations?.length}
            onShowInvites={() => setShowInvitations(true)}
          />
        </div>
      </section>

      {/* Filter and Search Bar */}
      <section className="pb-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <div className="relative w-full md:w-96">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500" />
              <input
                type="text"
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e?.target?.value)}
                className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition-colors"
              />
            </div>

            {/* Filters */}
            <FilterBar
              filterType={filterType}
              onFilterChange={setFilterType}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
            />
          </div>
        </div>
      </section>

      {/* Projects Grid/List */}
      <section className="pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <div className={`grid ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'} gap-6`}>
              {[1, 2, 3, 4, 5, 6]?.map((i) => (
                <div key={i} className="bg-white/5 rounded-lg h-64 animate-pulse" />
              ))}
            </div>
          ) : filteredProjects?.length === 0 ? (
            <div className="text-center py-20">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/5 mb-6">
                <Users className="h-10 w-10 text-gray-600" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">No Projects Found</h3>
              <p className="text-gray-400 mb-6">
                {searchQuery ? 'Try adjusting your search' : 'Create your first collaborative project to get started'}
              </p>
              {!searchQuery && (
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-cyan-500 text-black font-bold rounded-lg hover:bg-cyan-400 transition-colors"
                >
                  <Plus className="h-5 w-5" />
                  Create Project
                </button>
              )}
            </div>
          ) : (
            <div className={`grid ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'} gap-6`}>
              {filteredProjects?.map((project) => (
                <ProjectCard
                  key={project?.id}
                  project={project}
                  isOwner={project?.ownerId === user?.id}
                  viewMode={viewMode}
                  onRefresh={loadData}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Create Project Modal */}
      {showCreateModal && (
        <CreateProjectModal
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreateProject}
        />
      )}

      {/* Invitations Panel */}
      {showInvitations && (
        <InvitationsPanel
          invitations={invitations}
          onClose={() => setShowInvitations(false)}
          onAccept={handleAcceptInvite}
          onDecline={handleDeclineInvite}
        />
      )}
    </div>
  );
};

export default ProjectCollaborationHub;
