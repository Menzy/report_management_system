import { useEffect, useState } from 'react';
import { supabase } from './lib/supabase';
import AuthForm from './components/AuthForm';
import OnboardingForm from './components/OnboardingForm';
import Dashboard from './components/Dashboard';
import LandingPage from './components/landing/LandingPage';
import GlobalModalProvider from './components/ui/GlobalModalProvider';
import { GraduationCap } from 'lucide-react';

function App() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState<boolean | null>(null);
  const [onboardingLoading, setOnboardingLoading] = useState(false);
  const [showLanding, setShowLanding] = useState(true);
  const [initialized, setInitialized] = useState(false);
  const [isLoginMode, setIsLoginMode] = useState(true);


  useEffect(() => {
    // Prevent multiple initializations
    if (initialized) return;

    // Check for an existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        setOnboardingLoading(true);
        checkOnboardingStatus(session.user.id);
        setShowLanding(false);
      }
      setLoading(false);
      setInitialized(true);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session);
        
        // Always update the session
        setSession(session);
        
        if (session) {
          // If we have a session, check onboarding status
          setOnboardingLoading(true);
          try {
            await checkOnboardingStatus(session.user.id);
          } finally {
            setOnboardingLoading(false);
          }
          setShowLanding(false);
        } else {
          // If no session, reset states
          setHasCompletedOnboarding(null);
          setShowLanding(true);
        }
      }
    );
    
    // Initial session check
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Initial session check:', session);
      setSession(session);
      if (session) {
        setOnboardingLoading(true);
        checkOnboardingStatus(session.user.id).finally(() => {
          setOnboardingLoading(false);
        });
        setShowLanding(false);
      }
      setLoading(false);
      setInitialized(true);
    });

    // Handle visibility change to prevent unnecessary refreshes
    const handleVisibilityChange = () => {
      // Do nothing when the page becomes visible again
      // This prevents re-authentication checks on tab focus
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      subscription.unsubscribe();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [initialized]);

  const checkOnboardingStatus = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('has_completed_onboarding')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error checking onboarding status:', error);
        setHasCompletedOnboarding(false);
      } else {
        setHasCompletedOnboarding(data?.has_completed_onboarding || false);
      }
    } catch (error) {
      console.error('Error checking onboarding status:', error);
      setHasCompletedOnboarding(false);
    } finally {
      setOnboardingLoading(false);
    }
  };

  const handleAuthSuccess = async () => {
    try {
      // Force a session refresh to ensure we have the latest data
      const { data: { session } } = await supabase.auth.getSession();
      console.log('Auth success, session:', session);
      
      if (session) {
        setSession(session);
        setOnboardingLoading(true);
        await checkOnboardingStatus(session.user.id);
        setShowLanding(false);
      }
    } catch (error) {
      console.error('Error in handleAuthSuccess:', error);
      // If there's an error, reset to login state
      setSession(null);
      setShowLanding(true);
    } finally {
      setOnboardingLoading(false);
    }
  };

  const handleOnboardingSuccess = () => {
    setHasCompletedOnboarding(true);
  };

  const handleSignOut = () => {
    setSession(null);
    setHasCompletedOnboarding(false);
    setShowLanding(true);
  };

  if (loading || onboardingLoading) {
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
      ) : hasCompletedOnboarding === false ? (
        <div className="flex flex-col items-center justify-center min-h-screen">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-gray-900">Welcome to School Report Management System</h1>
            <p className="mt-2 text-gray-600">Let's set up your school profile</p>
          </div>
          <OnboardingForm userId={session.user.id} onSuccess={handleOnboardingSuccess} />
        </div>
      ) : hasCompletedOnboarding === true ? (
        <Dashboard userId={session.user.id} onSignOut={handleSignOut} />
      ) : null}
      
      {/* Global Modal Provider - renders modals at the top level with highest z-index */}
      <GlobalModalProvider />
    </div>
  );
}

export default App;