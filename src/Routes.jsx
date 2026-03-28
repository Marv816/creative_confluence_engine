import React from "react";
import { BrowserRouter, Routes as RouterRoutes, Route } from "react-router-dom";
import ScrollToTop from "components/ScrollToTop";
import ErrorBoundary from "components/ErrorBoundary";
import NotFound from "pages/NotFound";
import WritingWorkspace from './pages/writing-workspace';
import ConceptExplorer from './pages/concept-explorer';
import CreativeDashboard from './pages/creative-dashboard';
import Login from './pages/login';
import LyricalPromptMachine from './pages/lyrical-prompt-machine';
import MasterSunoPromptGenerator from './pages/master-suno-prompt-generator';
import MasterPromptEngine from './pages/master-prompt-engine';
import Register from './pages/register';
import LyricGenerator from './pages/lyric-generator';
import BeatBlueprint from './pages/beat-blueprint';
import LandingPage from './pages/landing-page';
import AIToolsPage from './pages/ai-tools';
import ArtistsShowcase from './pages/artists';
import MusicStore from './pages/store';
import CommunityBlog from './pages/blog';
import CollaborationHub from './pages/collaborations';
import UserContentDashboard from './pages/user-content-dashboard';
import DrumGenerator from './pages/drum-generator';
import CollaborativeProjectWorkspace from './pages/collaborative-project-workspace';
import ProjectCollaborationHub from './pages/project-collaboration-hub';
import ProjectInvitationPermissions from './pages/project-invitation-permissions';
import CommunitySoundMarketplace from './pages/community-sound-marketplace';
import ProducerUploadStudio from './pages/producer-upload-studio';
import ProducerProfileAnalytics from './pages/producer-profile-analytics';
import SecureCheckoutPaymentProcessing from './pages/secure-checkout-payment-processing';
import ProducerEarningsPayoutDashboard from './pages/producer-earnings-payout-dashboard';
import TransactionHistoryFinancialManagement from './pages/transaction-history-financial-management';

const Routes = () => {
  return (
    <BrowserRouter>
      <ErrorBoundary>
      <ScrollToTop />
      <RouterRoutes>
        {/* Define your route here */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/landing-page" element={<LandingPage />} />
        <Route path="/ai-tools" element={<AIToolsPage />} />
        <Route path="/artists" element={<ArtistsShowcase />} />
        <Route path="/store" element={<MusicStore />} />
        <Route path="/blog" element={<CommunityBlog />} />
        <Route path="/collaborations" element={<CollaborationHub />} />
        <Route path="/writing-workspace" element={<WritingWorkspace />} />
        <Route path="/concept-explorer" element={<ConceptExplorer />} />
        <Route path="/creative-dashboard" element={<CreativeDashboard />} />
        <Route path="/user-content-dashboard" element={<UserContentDashboard />} />
        <Route path="/login" element={<Login />} />
        <Route path="/lyrical-prompt-machine" element={<LyricalPromptMachine />} />
        <Route path="/master-suno-prompt-generator" element={<MasterSunoPromptGenerator />} />
        <Route path="/master-prompt-engine" element={<MasterPromptEngine />} />
        <Route path="/register" element={<Register />} />
        <Route path="/lyric-generator" element={<LyricGenerator />} />
        <Route path="/beat-blueprint" element={<BeatBlueprint />} />
        <Route path="/drum-generator" element={<DrumGenerator />} />
        <Route path="/project-collaboration-hub" element={<ProjectCollaborationHub />} />
        <Route path="/collaborative-project-workspace" element={<CollaborativeProjectWorkspace />} />
        <Route path="/project-invitation-permissions" element={<ProjectInvitationPermissions />} />
        <Route path="/community-sound-marketplace" element={<CommunitySoundMarketplace />} />
        <Route path="/producer-upload-studio" element={<ProducerUploadStudio />} />
        <Route path="/producer-profile-analytics/:producerId" element={<ProducerProfileAnalytics />} />
        <Route path="/secure-checkout-payment-processing" element={<SecureCheckoutPaymentProcessing />} />
        <Route path="/producer-earnings-payout-dashboard" element={<ProducerEarningsPayoutDashboard />} />
        <Route path="/transaction-history-financial-management" element={<TransactionHistoryFinancialManagement />} />
        <Route path="*" element={<NotFound />} />
      </RouterRoutes>
      </ErrorBoundary>
    </BrowserRouter>
  );
};

export default Routes;