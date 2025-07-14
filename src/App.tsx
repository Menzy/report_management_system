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
  const [isLoginMode, setIsLoginMode] = useState(true);




  useEffect(() => {
    let isMounted = true;

    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (!isMounted) return;

        if (error) {
          setLoading(false);
          setShowLanding(true);
          return;
        }

        setSession(session);

        if (session?.user?.id) {
          checkOnboardingStatusFast(session.user.id);
          setShowLanding(false);
        } else {
          setHasCompletedOnboarding(null);
          setShowLanding(true);
        }
      } catch (error) {
        setHasCompletedOnboarding(null);
        setShowLanding(true);
      } finally {
        setLoading(false);
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!isMounted) return;

        setSession(session);
        
        if (session?.user?.id) {
          checkOnboardingStatusFast(session.user.id);
          setShowLanding(false);
        } else {
          setHasCompletedOnboarding(null);
          setShowLanding(true);
        }
      }
    );

    initializeAuth();

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []); // Empty dependency array - only run once

  const checkOnboardingStatusFast = async (userId: string) => {
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Quick timeout')), 2000)
    );
    
    const checkPromise = supabase
      .from('profiles')
      .select('has_completed_onboarding')
      .eq('id', userId)
      .single();
    
    try {
      const { data, error } = await Promise.race([checkPromise, timeoutPromise]) as any;
      
      if (error) {
        setHasCompletedOnboarding(false);
      } else {
        const onboardingComplete = data?.has_completed_onboarding || false;
        setHasCompletedOnboarding(onboardingComplete);
      }
    } catch (error) {
      setHasCompletedOnboarding(false);
    }
    
    setOnboardingLoading(false);
  };

  const handleAuthSuccess = async () => {
    // Let onAuthStateChange handle the session update to prevent race conditions
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
      <div className="page-bg-primary flex items-center justify-center min-h-screen">
        <div className="glass-card p-8 text-center glass-fade-in">
          <div className="inline-block w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-2 text-text-glass-secondary">Loading...</p>
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
    <div className="page-bg-primary min-h-screen">
      {!session ? (
        <div className="flex flex-col items-center justify-center min-h-screen px-4">
          <div className="mb-8 text-center glass-fade-in">
            <div className="flex items-center justify-center mb-4">
              <div className="glass-bg-accent p-4 rounded-full">
                <GraduationCap className="w-16 h-16 text-white" />
              </div>
            </div>
            <h1 className="text-4xl font-bold text-text-glass-primary">School Report Management System</h1>
            <p className="mt-2 text-xl text-text-glass-secondary">Streamline your school reporting process</p>
          </div>
          <AuthForm onSuccess={handleAuthSuccess} initialIsLogin={isLoginMode} />
        </div>
      ) : hasCompletedOnboarding === false ? (
        <div className="flex flex-col items-center min-h-screen px-4 py-16">
          <div className="mb-8 text-center glass-fade-in">
            <h1 className="text-3xl font-bold text-text-glass-primary">Welcome to School Report Management System</h1>
            <p className="mt-2 text-text-glass-secondary">Let's set up your school profile</p>
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