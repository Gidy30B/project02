import React, { useContext, useEffect, useState } from 'react';
import { Redirect } from 'expo-router';
import { AuthContext } from '../context/AuthContext';
import RootLayout from './_layout'; // Import RootLayout

export default function Index() {
  const { user } = useContext(AuthContext); // Access user object from AuthContext
  const [loading, setLoading] = useState(true); // Track loading state
  const [isAuthenticated, setIsAuthenticated] = useState(false); // Authentication state

  useEffect(() => {
    if (user) {
      setIsAuthenticated(true); // User is authenticated
    } else {
      setIsAuthenticated(false); // User is not authenticated
    }
    setLoading(false); // Mark loading as complete
  }, [user]);

  if (loading) {
    return null; // Show nothing while loading
  }

  return isAuthenticated ? <RootLayout /> : <Redirect href="/(routes)/onboarding" />; // Render RootLayout or redirect to onboarding
}
