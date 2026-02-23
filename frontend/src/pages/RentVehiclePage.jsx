import React, { useEffect, useState } from 'react';
import Header from '../layouts/Header';
import { Hero } from '../components/vehicle/Rent_vehicle/Hero';
import { Features } from '../components/vehicle/Rent_vehicle/Features';
import { Process } from '../components/vehicle/Rent_vehicle/Process';
import Footer from '../layouts/Footer';

export function RentVehiclePage() {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Get user from localStorage
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (token && storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setUser(userData);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Error parsing user data:', error);
        setIsAuthenticated(false);
      }
    } else {
      setIsAuthenticated(false);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setIsAuthenticated(false);
    window.location.href = '/login';
  };

  return (
    <div className="min-h-screen w-full bg-white">
      <Header 
        user={user}
        isAuthenticated={isAuthenticated}
        onLogout={handleLogout}
        role={user?.role || 1}
        notifications={0}
      />

      <main>
        <Hero />
        <Features />
        <Process />
      </main>
      <Footer />
    </div>
  );
}
