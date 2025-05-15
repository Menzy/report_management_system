import { useEffect, useState } from 'react';
import { supabase } from './lib/supabase';
import AuthForm from './components/AuthForm';
import OnboardingForm from './components/OnboardingForm';
import Dashboard from './components/Dashboard';
import LandingPage from './components/landing/LandingPage';
import { GraduationCap } from 'lucide-react';

function App() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  const [showLanding, setShowLanding] = useState(true);
  const [isLoginMode, setIsLoginMode] = useState(true); // true for sign-in, false for sign-up

  useEffect(() => {
    // Check for an existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        checkOnboardingStatus(session.user.id);
        setShowLanding(false);
      }
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        if (session) {
          checkOnboardingStatus(session.user.id);
          setShowLanding(false);
        } else {
          setHasCompletedOnboarding(false);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const checkOnboardingStatus = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('has_completed_onboarding')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error checking onboarding status:', error);
        return;
      }

      setHasCompletedOnboarding(data?.has_completed_onboarding || false);
    } catch (error) {
      console.error('Error checking onboarding status:', error);
    }
  };

  const handleAuthSuccess = () => {
    // The session will be updated by the auth state change listener
    setShowLanding(false);
  };

  const handleOnboardingSuccess = () => {
    setHasCompletedOnboarding(true);
  };

  const handleSignOut = () => {
    setSession(null);
    setHasCompletedOnboarding(false);
    setShowLanding(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="p-8 text-center">
          <div className="inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (showLanding) {
    return (
      <div className="min-h-screen">
        <LandingPage 
          onSignIn={() => {
            setIsLoginMode(true);
            setShowLanding(false);
          }} 
          onSignUp={() => {
            setIsLoginMode(false);
            setShowLanding(false);
          }} 
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {!session ? (
        <div className="flex flex-col items-center justify-center min-h-screen">
          <div className="mb-8 text-center">
            <div className="flex items-center justify-center mb-4">
              <GraduationCap className="w-16 h-16 text-blue-600" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900">School Report Management System</h1>
            <p className="mt-2 text-xl text-gray-600">Streamline your school reporting process</p>
          </div>
          <AuthForm onSuccess={handleAuthSuccess} initialIsLogin={isLoginMode} />
        </div>
      ) : !hasCompletedOnboarding ? (
        <div className="flex flex-col items-center justify-center min-h-screen">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-gray-900">Welcome to School Report Management System</h1>
            <p className="mt-2 text-gray-600">Let's set up your school profile</p>
          </div>
          <OnboardingForm userId={session.user.id} onSuccess={handleOnboardingSuccess} />
        </div>
      ) : (
        <Dashboard userId={session.user.id} onSignOut={handleSignOut} />
      )}
    </div>
  );
}

export default App;