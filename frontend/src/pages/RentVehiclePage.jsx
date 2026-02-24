import React, { useEffect, useState } from 'react';
import Layout from '../layouts/Layout';
import { Hero } from '../components/vehicle/Rent_vehicle/Hero';
import { Features } from '../components/vehicle/Rent_vehicle/Features';
import { Process } from '../components/vehicle/Rent_vehicle/Process';

export function RentVehiclePage() {
  return (
    <Layout>
      <div className="min-h-screen w-full bg-white">
        <Hero />
        <Features />
        <Process />
      </div>
    </Layout>
  );
}
