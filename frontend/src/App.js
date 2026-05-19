import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import FeaturePage from './pages/FeaturePage';
import DetailPage from './pages/DetailPage';
import AgentSearchPage from './pages/AgentSearchPage';
import FOIALetterPage from './pages/FOIALetterPage';
import EntityLinkPage from './pages/EntityLinkPage';
import WatchlistsPage from './pages/WatchlistsPage';
import TimelineReconstructionPage from './pages/TimelineReconstructionPage';
import ContradictionDetectionPage from './pages/ContradictionDetectionPage';
import CustomViewsPage from './pages/CustomViewsPage';
import Layout from './components/Layout';
import Toast from './components/Toast';

// === Batch 07 Gaps & Frontend Mounts ===
import CfEntityResolutionGraph from './pages/CfEntityResolutionGraph';
import CfLitigationTimeline from './pages/CfLitigationTimeline';
import CfPropertyOwnershipChain from './pages/CfPropertyOwnershipChain';
import CfRegulatoryComplianceHistory from './pages/CfRegulatoryComplianceHistory';
import CfFreedomOfInformationChecklist from './pages/CfFreedomOfInformationChecklist';
import CfWatchlistAlertFeed from './pages/CfWatchlistAlertFeed';
import GapNoDocumentocrExtractTextFromScannedDoc from './pages/GapNoDocumentocrExtractTextFromScannedDoc';
import GapNoPersonnetworkmapEntityConnectionGraph from './pages/GapNoPersonnetworkmapEntityConnectionGraph';
import GapNoTimelinereconstructionChronologicalNarr from './pages/GapNoTimelinereconstructionChronologicalNarr';
import GapNoContradictiondetectionCrossdocumentInco from './pages/GapNoContradictiondetectionCrossdocumentInco';
import GapNoImagehandwritingRecognitionPipeline from './pages/GapNoImagehandwritingRecognitionPipeline';
import GapNoSavedsearchAlertDeliveryNotifications from './pages/GapNoSavedsearchAlertDeliveryNotifications';
import GapNoBulkDownloadexportOfResults from './pages/GapNoBulkDownloadexportOfResults';
import GapNoExternalDatasourceIntegrationsCourtDo from './pages/GapNoExternalDatasourceIntegrationsCourtDo';
import GapNoFoiaRequestDeadlineTracking from './pages/GapNoFoiaRequestDeadlineTracking';
import GapNoOrganizationteamWorkspaceManagement from './pages/GapNoOrganizationteamWorkspaceManagement';
import GapNoAuditLogOfWhoSearchedWhatPiisensiti from './pages/GapNoAuditLogOfWhoSearchedWhatPiisensiti';
import GapNoFileUploadRouteForUsersuppliedPdfs from './pages/GapNoFileUploadRouteForUsersuppliedPdfs';
// === End Batch 07 ===

import './styles/App.css';

function App() {
  const [user, setUser] = useState(null);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem('user');
    if (saved) setUser(JSON.parse(saved));
  }, []);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  if (!user) {
    return (
      <>
        <Login onLogin={handleLogin} showToast={showToast} />
        {toast && <Toast message={toast.message} type={toast.type} />}
      </>
    );
  }

  return (
    <Router>
      <Layout user={user} onLogout={handleLogout}>
        <Routes>
          <Route path="/" element={<Dashboard showToast={showToast} />} />
          <Route path="/agent-search" element={<AgentSearchPage showToast={showToast} />} />
          <Route path="/foia-letter" element={<FOIALetterPage showToast={showToast} />} />
          <Route path="/entity-link" element={<EntityLinkPage showToast={showToast} />} />
          <Route path="/watchlists" element={<WatchlistsPage showToast={showToast} />} />
          <Route path="/timeline-reconstruction" element={<TimelineReconstructionPage showToast={showToast} />} />
          <Route path="/contradiction-detection" element={<ContradictionDetectionPage showToast={showToast} />} />
          <Route path="/custom-views" element={<CustomViewsPage showToast={showToast} />} />
          <Route path="/feature/:featureId" element={<FeaturePage showToast={showToast} />} />
          <Route path="/feature/:featureId/:id" element={<DetailPage showToast={showToast} />} />
          <Route path="*" element={<Navigate to="/" />} />
          // === Batch 07 Gaps & Frontend Mounts ===
          <Route path='/cf-entity-resolution-graph' element={<CfEntityResolutionGraph />} />
          <Route path='/cf-litigation-timeline' element={<CfLitigationTimeline />} />
          <Route path='/cf-property-ownership-chain' element={<CfPropertyOwnershipChain />} />
          <Route path='/cf-regulatory-compliance-history' element={<CfRegulatoryComplianceHistory />} />
          <Route path='/cf-freedom-of-information-checklist' element={<CfFreedomOfInformationChecklist />} />
          <Route path='/cf-watchlist-alert-feed' element={<CfWatchlistAlertFeed />} />
          <Route path='/gap-no-documentocr-extract-text-from-scanned-doc' element={<GapNoDocumentocrExtractTextFromScannedDoc />} />
          <Route path='/gap-no-personnetworkmap-entity-connection-graph' element={<GapNoPersonnetworkmapEntityConnectionGraph />} />
          <Route path='/gap-no-timelinereconstruction-chronological-narr' element={<GapNoTimelinereconstructionChronologicalNarr />} />
          <Route path='/gap-no-contradictiondetection-crossdocument-inco' element={<GapNoContradictiondetectionCrossdocumentInco />} />
          <Route path='/gap-no-imagehandwriting-recognition-pipeline' element={<GapNoImagehandwritingRecognitionPipeline />} />
          <Route path='/gap-no-savedsearch-alert-delivery-notifications' element={<GapNoSavedsearchAlertDeliveryNotifications />} />
          <Route path='/gap-no-bulk-downloadexport-of-results' element={<GapNoBulkDownloadexportOfResults />} />
          <Route path='/gap-no-external-datasource-integrations-court-do' element={<GapNoExternalDatasourceIntegrationsCourtDo />} />
          <Route path='/gap-no-foia-request-deadline-tracking' element={<GapNoFoiaRequestDeadlineTracking />} />
          <Route path='/gap-no-organizationteam-workspace-management' element={<GapNoOrganizationteamWorkspaceManagement />} />
          <Route path='/gap-no-audit-log-of-who-searched-what-piisensiti' element={<GapNoAuditLogOfWhoSearchedWhatPiisensiti />} />
          <Route path='/gap-no-file-upload-route-for-usersupplied-pdfs' element={<GapNoFileUploadRouteForUsersuppliedPdfs />} />
          // === End Batch 07 ===
        </Routes>
      </Layout>
      {toast && <Toast message={toast.message} type={toast.type} />}
    </Router>
  );
}

export default App;
