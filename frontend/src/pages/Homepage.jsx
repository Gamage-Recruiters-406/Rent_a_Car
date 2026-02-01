import React from 'react'
import Layout from '../layouts/Layout'
import { Hero } from '../layouts/Hero'
import { Stats } from '../layouts/Stats'
import { Features } from '../layouts/Features'

export const Homepage = () => {
  return (
    <div className="min-h-screen bg-white font-sans overflow-x-hidden">
        <Layout>
            
            <Hero />
            <Stats />
            <Features/>
        </Layout>
        </div>
  )
}
