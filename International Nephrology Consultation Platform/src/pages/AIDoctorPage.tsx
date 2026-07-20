import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Navigation } from '../components/Navigation';
import Footer from '../components/Footer';

export default function AIDoctorPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#0b0f19] flex flex-col">
      <Navigation 
        onLoginOpen={() => navigate('/?action=login')}
        onSignupOpen={() => navigate('/?action=signup')}
      />
      
      {/* Spacer for fixed navigation header (80px) */}
      <div className="h-20 shrink-0"></div>
      
      <div className="flex-1 w-full bg-[#0b0f19]">
        <iframe
          src="https://ai-assistant-frontend-lilac.vercel.app/assistant-embed?clinicId=nephroconsult-test"
          width="100%"
          style={{
            height: '750px',
            border: 'none',
            background: 'transparent',
            display: 'block'
          }}
          allow="microphone; speech-synthesis"
          title="AI Doctor Assistant"
        />
      </div>

      <Footer />
    </div>
  );
}
