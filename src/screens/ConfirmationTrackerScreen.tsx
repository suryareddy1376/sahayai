import React from 'react';
import { ApplicationTrackerData, LanguageCode } from '../types';
import { StatusTimeline } from '../components/StatusTimeline';
import { TrustBanner } from '../components/TrustBanner';

interface ConfirmationTrackerScreenProps {
  application: ApplicationTrackerData;
  language: LanguageCode;
  onStartNew: () => void;
}

export const ConfirmationTrackerScreen: React.FC<ConfirmationTrackerScreenProps> = ({
  application,
  language,
  onStartNew,
}) => {
  return (
    <div className="w-full max-w-xl mx-auto space-y-6 pt-2 pb-16">
      <TrustBanner language={language} variant="compact" />

      {/* Main UPI-like Status Timeline Receipt */}
      <StatusTimeline
        application={application}
        language={language}
        onStartNew={onStartNew}
      />
    </div>
  );
};
