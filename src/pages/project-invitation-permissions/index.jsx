import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import HeaderNavigation from '../../components/navigation/HeaderNavigation';
import { useAuth } from '../../contexts/AuthContext';
import { projectCollaborationService } from '../../services/projectCollaborationService';
import InvitationForm from './components/InvitationForm';
import MemberManagement from './components/MemberManagement';
import PendingInvitations from './components/PendingInvitations';
import PermissionMatrix from './components/PermissionMatrix';
import Icon from '../../components/AppIcon';

const ProjectInvitationPermissions = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [members, setMembers] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [activeTab, setActiveTab] = useState('invite');

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    loadData();
  }, [isAuthenticated, navigate]);

  const loadData = async () => {
    try {
      setLoading(true);
      const projectsData = await projectCollaborationService?.getAllProjects();
      setProjects(projectsData || []);
      
      if (projectsData?.length > 0) {
        setSelectedProject(projectsData?.[0]);
        await loadProjectDetails(projectsData?.[0]?.id);
      }
    } catch (error) {
      console.error('[ProjectInvitationPermissions] Load error:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadProjectDetails = async (projectId) => {
    try {
      const [membersData, invitationsData] = await Promise.all([
        projectCollaborationService?.getProjectMembers(projectId),
        projectCollaborationService?.getProjectInvitations(projectId)
      ]);
      setMembers(membersData || []);
      setInvitations(invitationsData || []);
    } catch (error) {
      console.error('[ProjectInvitationPermissions] Load project details error:', error);
    }
  };

  const handleProjectChange = async (projectId) => {
    const project = projects?.find(p => p?.id === projectId);
    setSelectedProject(project);
    if (project) {
      await loadProjectDetails(project?.id);
    }
  };

  const handleInvitationSent = async () => {
    if (selectedProject) {
      await loadProjectDetails(selectedProject?.id);
    }
  };

  const handleMemberUpdated = async () => {
    if (selectedProject) {
      await loadProjectDetails(selectedProject?.id);
    }
  };

  const handleInvitationAction = async () => {
    if (selectedProject) {
      await loadProjectDetails(selectedProject?.id);
    }
  };

  // Add handleAuthClick function
  const handleAuthClick = () => {
    navigate('/login');
  };

  // Add handleLogout function
  const handleLogout = () => {
    // Logout logic will be handled by AuthContext
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading collaboration settings...</p>
        </div>
      </div>
    );
  }

  if (!selectedProject) {
    return (
      <div className="min-h-screen bg-black">
        <HeaderNavigation isAuthenticated={isAuthenticated} onAuthClick={handleAuthClick} onLogout={handleLogout} />
        <div className="pt-24 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center py-16">
            <div className="w-16 h-16 bg-cyan-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Icon name="Users" size={32} className="text-cyan-500" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-4">No Projects Yet</h2>
            <p className="text-gray-400 mb-8">Create your first project to start collaborating with others.</p>
            <button
              onClick={() => navigate('/creative-dashboard')}
              className="px-6 py-3 bg-cyan-500 text-black font-semibold rounded-lg hover:bg-cyan-400 transition-colors"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isOwner = selectedProject?.ownerId === user?.id;

  return (
    <div className="min-h-screen bg-black">
      <HeaderNavigation isAuthenticated={isAuthenticated} onAuthClick={handleAuthClick} onLogout={handleLogout} />
      
      <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl md:text-5xl font-black text-white mb-4">
              Project <span className="text-cyan-500">Collaboration</span>
            </h1>
            <p className="text-gray-400 text-lg">
              Manage team members, send invitations, and control project permissions
            </p>
          </div>

          {/* Project Selector */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Select Project
            </label>
            <select
              value={selectedProject?.id}
              onChange={(e) => handleProjectChange(e?.target?.value)}
              className="w-full md:w-96 px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
              {projects?.map(project => (
                <option key={project?.id} value={project?.id} className="bg-gray-900">
                  {project?.name} {project?.ownerId === user?.id ? '(Owner)' : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Tabs */}
          <div className="mb-8 border-b border-white/10">
            <div className="flex gap-6 overflow-x-auto">
              <button
                onClick={() => setActiveTab('invite')}
                className={`pb-4 px-2 font-medium transition-colors whitespace-nowrap ${
                  activeTab === 'invite' ?'text-cyan-500 border-b-2 border-cyan-500' :'text-gray-400 hover:text-white'
                }`}
              >
                Send Invitations
              </button>
              <button
                onClick={() => setActiveTab('members')}
                className={`pb-4 px-2 font-medium transition-colors whitespace-nowrap ${
                  activeTab === 'members' ?'text-cyan-500 border-b-2 border-cyan-500' :'text-gray-400 hover:text-white'
                }`}
              >
                Manage Members ({members?.length})
              </button>
              <button
                onClick={() => setActiveTab('pending')}
                className={`pb-4 px-2 font-medium transition-colors whitespace-nowrap ${
                  activeTab === 'pending' ?'text-cyan-500 border-b-2 border-cyan-500' :'text-gray-400 hover:text-white'
                }`}
              >
                Pending Invitations ({invitations?.filter(i => i?.status === 'pending')?.length})
              </button>
              <button
                onClick={() => setActiveTab('permissions')}
                className={`pb-4 px-2 font-medium transition-colors whitespace-nowrap ${
                  activeTab === 'permissions' ?'text-cyan-500 border-b-2 border-cyan-500' :'text-gray-400 hover:text-white'
                }`}
              >
                Permission Matrix
              </button>
            </div>
          </div>

          {/* Tab Content */}
          <div className="space-y-6">
            {activeTab === 'invite' && (
              <InvitationForm
                projectId={selectedProject?.id}
                isOwner={isOwner}
                onInvitationSent={handleInvitationSent}
              />
            )}

            {activeTab === 'members' && (
              <MemberManagement
                projectId={selectedProject?.id}
                members={members}
                isOwner={isOwner}
                currentUserId={user?.id}
                onMemberUpdated={handleMemberUpdated}
              />
            )}

            {activeTab === 'pending' && (
              <PendingInvitations
                invitations={invitations}
                isOwner={isOwner}
                onInvitationAction={handleInvitationAction}
              />
            )}

            {activeTab === 'permissions' && (
              <PermissionMatrix />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectInvitationPermissions;