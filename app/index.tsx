import React, { useContext, useEffect, useState } from 'react';
import { Redirect } from 'expo-router';
import { AuthContext } from '../context/AuthContext';

export default function Index() {
  const { user } = useContext(AuthContext); // Access user object from AuthContext
  const [loading, setLoading] = useState(true); // Track loading state
  const [redirectPath, setRedirectPath] = useState(null); // Redirect path state

  useEffect(() => {
    if (user) {
      // Ensure user is authenticated and decide redirect path
      const { userType, professional } = user;

      switch (userType) {
        case 'client':
          setRedirectPath('/client/home');
          break;
        case 'professional':
          if (professional && professional.profession === 'doctor') {
            setRedirectPath(professional.attachedToClinic ? '/doctor' : '/addclinic');
          } else if (professional && professional.profession === 'pharmacist' && !professional.attachedToPharmacy) {
            setRedirectPath('/addpharmacy');
          } else if (professional && professional.profession === 'pharmacist') {
            setRedirectPath('/pharmacist/tabs');
          } else {
            setRedirectPath('/professional');
          }
          break;
        case 'pharmacist':
          setRedirectPath('/pharmacist/tabs');
          break;
        default:
          setRedirectPath('/(routes)/onboarding'); // Default fallback
          break;
      }
    } else {
      setRedirectPath('/(routes)/onboarding'); // Redirect to onboarding if no user
    }
    setLoading(false); // Mark loading as complete
  }, [user]);

  return (
    <>
      {loading ? (
        <></> // Show nothing while loading
      ) : (
        <Redirect href={redirectPath} /> // Redirect to the resolved path
      )}
    </>
  );
}
