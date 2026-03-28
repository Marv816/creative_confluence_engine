import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Save, History, MessageSquare, Settings, UserPlus } from 'lucide-react';
import HeaderNavigation from '../../components/navigation/HeaderNavigation';
import { useAuth } from '../../contexts/AuthContext';
import {
  collaborativeProjectService,
  projectActivityService,
  projectPresenceService
} from '../../services/collaborationService';
import ContentEditor from './components/ContentEditor';
import CollaborationSidebar from './components/CollaborationSidebar';
import PresenceIndicators from './components/PresenceIndicators';
import VersionHistoryModal from './components/VersionHistoryModal';
import InviteCollaboratorModal from './components/InviteCollaboratorModal';
import ProjectSettingsModal from './components/ProjectSettingsModal';

const CollaborativeProjectWorkspace = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const projectId = searchParams?.get('id');
  
  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState(null);
  const [content, setContent] = useState({});
  const [activeUsers, setActiveUsers] = useState([]);
  const [activity, setActivity] = useState([]);
  const [saving, setSaving] = useState(false);
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  
  const realtimeChannelRef = useRef(null);
  const saveTimeoutRef = useRef(null);
  const presenceIntervalRef = useRef(null);

  // Add these handler functions for HeaderNavigation
  const handleAuthClick = () => {
    navigate('/login');
  };

  const handleLogout = () => {
    // Implement logout logic or navigate to logout
    navigate('/logout');
  };

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (!projectId) {
      navigate('/project-collaboration-hub');
      return;
    }
    loadProject();
    setupRealtimeSync();
    startPresenceUpdates();

    return () => {
      cleanup();
    };
  }, [isAuthenticated, projectId, navigate]);

  const loadProject = async () => {
    try {
      setLoading(true);
      const [projectData, activityData, presenceData] = await Promise.all([
        collaborativeProjectService?.getById(projectId),
        projectActivityService?.getActivity(projectId, 20),
        projectPresenceService?.getActiveUsers(projectId)
      ]);
      setProject(projectData);
      setContent(projectData?.content || {});
      setActivity(activityData || []);
      setActiveUsers(presenceData || []);
    } catch (error) {
      console.error('Load project error:', error);
      alert('Failed to load project');
      navigate('/project-collaboration-hub');
    } finally {
      setLoading(false);
    }
  };

  const setupRealtimeSync = () => {
    const channel = collaborativeProjectService?.subscribeToProject(
      projectId,
      (payload) => {
        if (payload?.type === 'project' && payload?.payload?.eventType === 'UPDATE') {
          setProject(prev => ({
            ...prev,
            ...payload?.payload?.new
          }));
          setContent(payload?.payload?.new?.content || {});
        } else if (payload?.type === 'activity') {
          loadActivity();
        } else if (payload?.type === 'presence') {
          loadPresence();
        }
      }
    );
    realtimeChannelRef.current = channel;
  };

  const startPresenceUpdates = () => {
    // Update presence every 30 seconds
    const updatePresence = async () => {
      try {
        await projectPresenceService?.updatePresence(projectId);
      } catch (error) {
        console.error('Update presence error:', error);
      }
    };
    
    updatePresence();
    presenceIntervalRef.current = setInterval(updatePresence, 30000);
  };

  const cleanup = () => {
    if (realtimeChannelRef?.current) {
      collaborativeProjectService?.unsubscribe(realtimeChannelRef?.current);
    }
    if (presenceIntervalRef?.current) {
      clearInterval(presenceIntervalRef?.current);
    }
    if (saveTimeoutRef?.current) {
      clearTimeout(saveTimeoutRef?.current);
    }
    // Mark as inactive
    projectPresenceService?.leave(projectId)?.catch(console.error);
  };

  const loadActivity = async () => {
    try {
      const activityData = await projectActivityService?.getActivity(projectId, 20);
      setActivity(activityData || []);
    } catch (error) {
      console.error('Load activity error:', error);
    }
  };

  const loadPresence = async () => {
    try {
      const presenceData = await projectPresenceService?.getActiveUsers(projectId);
      setActiveUsers(presenceData || []);
    } catch (error) {
      console.error('Load presence error:', error);
    }
  };

  const handleContentChange = (newContent) => {
    setContent(newContent);
    
    // Debounced auto-save
    if (saveTimeoutRef?.current) {
      clearTimeout(saveTimeoutRef?.current);
    }
    saveTimeoutRef.current = setTimeout(() => {
      handleSave(newContent);
    }, 2000);
  };

  const handleSave = async (contentToSave = content) => {
    try {
      setSaving(true);
      await collaborativeProjectService?.update(projectId, {
        content: contentToSave
      });
      
      // Log activity
      await projectActivityService?.logActivity({
        projectId,
        activityType: 'updated',
        changes: { field: 'content' }
      });
    } catch (error) {
      console.error('Save error:', error);
      alert('Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  const handleManualSave = () => {
    if (saveTimeoutRef?.current) {
      clearTimeout(saveTimeoutRef?.current);
    }
    handleSave();
  };

  const isOwner = project?.ownerId === user?.id;
  const userPermission = project?.permissions?.find(p => p?.user?.id === user?.id);
  const canEdit = isOwner || userPermission?.role === 'editor';

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-white text-lg">Loading project...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <HeaderNavigation onAuthClick={handleAuthClick} onLogout={handleLogout} />

      {/* Workspace Header */}
      <div className="fixed top-16 left-0 right-0 z-40 bg-black/95 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between gap-4">
            {/* Left Section */}
            <div className="flex items-center gap-4 flex-1 min-w-0">
              <button
                onClick={() => navigate('/project-collaboration-hub')}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors flex-shrink-0"
              >
                <ArrowLeft className="h-5 w-5 text-gray-400" />
              </button>
              <div className="min-w-0 flex-1">
                <h1 className="text-xl font-bold text-white truncate">
                  {project?.title}
                </h1>
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <span className={`px-2 py-0.5 text-xs font-bold rounded ${
                    canEdit ? 'bg-cyan-500/20 text-cyan-500' : 'bg-gray-500/20 text-gray-400'
                  }`}>
                    {isOwner ? 'Owner' : userPermission?.role || 'Viewer'}
                  </span>
                  {saving && <span className="text-yellow-500">Saving...</span>}
                  {!saving && <span className="text-green-500">Saved</span>}
                </div>
              </div>
            </div>

            {/* Center Section - Presence */}
            <PresenceIndicators activeUsers={activeUsers} currentUserId={user?.id} />

            {/* Right Section - Actions */}
            <div className="flex items-center gap-2 flex-shrink-0">
              {canEdit && (
                <button
                  onClick={handleManualSave}
                  disabled={saving}
                  className="flex items-center gap-2 px-4 py-2 bg-cyan-500 text-black font-bold rounded-lg hover:bg-cyan-400 transition-colors disabled:opacity-50"
                >
                  <Save className="h-4 w-4" />
                  <span className="hidden sm:inline">Save</span>
                </button>
              )}
              <button
                onClick={() => setShowVersionHistory(true)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                title="Version History"
              >
                <History className="h-5 w-5 text-gray-400" />
              </button>
              {isOwner && (
                <>
                  <button
                    onClick={() => setShowInviteModal(true)}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                    title="Invite Collaborator"
                  >
                    <UserPlus className="h-5 w-5 text-gray-400" />
                  </button>
                  <button
                    onClick={() => setShowSettings(true)}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                    title="Project Settings"
                  >
                    <Settings className="h-5 w-5 text-gray-400" />
                  </button>
                </>
              )}
              <button
                onClick={() => setShowSidebar(!showSidebar)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors lg:hidden"
                title="Toggle Sidebar"
              >
                <MessageSquare className="h-5 w-5 text-gray-400" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Workspace */}
      <div className="pt-36 pb-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-full mx-auto">
          <div className="flex gap-6">
            {/* Content Editor */}
            <div className={`flex-1 min-w-0 transition-all duration-300 ${
              showSidebar ? 'lg:mr-0' : ''
            }`}>
              <ContentEditor
                content={content}
                projectType={project?.projectType}
                canEdit={canEdit}
                onChange={handleContentChange}
                activeUsers={activeUsers}
              />
            </div>

            {/* Collaboration Sidebar */}
            <div className={`w-full lg:w-96 flex-shrink-0 transition-all duration-300 ${
              showSidebar ? 'block' : 'hidden lg:block'
            }`}>
              <CollaborationSidebar
                project={project}
                activity={activity}
                activeUsers={activeUsers}
                isOwner={isOwner}
                onRefresh={loadProject}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showVersionHistory && (
        <VersionHistoryModal
          projectId={projectId}
          versions={project?.versions || []}
          onClose={() => setShowVersionHistory(false)}
          onRestore={(version) => {
            setContent(version?.contentSnapshot);
            handleSave(version?.contentSnapshot);
            setShowVersionHistory(false);
          }}
        />
      )}

      {showInviteModal && (
        <InviteCollaboratorModal
          projectId={projectId}
          projectTitle={project?.title}
          onClose={() => setShowInviteModal(false)}
          onInvite={() => {
            setShowInviteModal(false);
            loadProject();
          }}
        />
      )}

      {showSettings && (
        <ProjectSettingsModal
          project={project}
          onClose={() => setShowSettings(false)}
          onUpdate={(updates) => {
            setProject({ ...project, ...updates });
            setShowSettings(false);
          }}
        />
      )}
    </div>
  );
};

export default CollaborativeProjectWorkspace;
