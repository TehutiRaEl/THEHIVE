import { Link } from 'react-router-dom'
import { useEffect } from 'react'

export default function NotFound() {
  useEffect(() => {
    document.title = '404 - Sovereign Hive'
  }, [])

  return (
    <div style={{
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'radial-gradient(circle at center, #0A0E2A 0%, #1A1E3A 100%)',
      color: '#F8F9FA',
      textAlign: 'center',
      padding: '2rem'
    }}>
      <h1 style={{
        fontSize: 'clamp(5rem, 15vw, 10rem)',
        fontWeight: 'bold',
        color: '#6B3FA0',
        marginBottom: '1rem',
        textShadow: '0 0 20px rgba(107, 63, 160, 0.5)',
        fontFamily: 'Orbitron, sans-serif'
      }}>
        404
      </h1>
      <h2 style={{ 
        fontSize: 'clamp(1.5rem, 4vw, 2.25rem)', 
        marginBottom: '1rem',
        fontFamily: 'Exo 2, sans-serif'
      }}>
        Lost in the Hive
      </h2>
      <p style={{ 
        fontSize: 'clamp(1rem, 2.5vw, 1.25rem)', 
        maxWidth: '600px', 
        marginBottom: '2rem',
        lineHeight: 1.6
      }}>
        The colony you seek does not exist or has been pruned by Mother Nanuet.
        All is not lost — the constitutional memory remains.
      </p>
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
        <Link 
          to="/"
          style={{
            padding: '0.75rem 1.5rem',
            background: 'rgba(107, 63, 160, 0.8)',
            border: '1px solid rgba(107, 63, 160, 0.5)',
            borderRadius: '8px',
            color: '#F8F9FA',
            textDecoration: 'none',
            fontFamily: 'Exo 2, sans-serif',
            fontWeight: 600,
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(107, 63, 160, 1)'
            e.currentTarget.style.boxShadow = '0 0 15px rgba(107, 63, 160, 0.5)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(107, 63, 160, 0.8)'
            e.currentTarget.style.boxShadow = 'none'
          }}
        >
          Return to Nexus
        </Link>
        <Link 
          to="/command-center"
          style={{
            padding: '0.75rem 1.5rem',
            background: 'rgba(255, 215, 0, 0.8)',
            border: '1px solid rgba(255, 215, 0, 0.5)',
            borderRadius: '8px',
            color: '#0A0E2A',
            textDecoration: 'none',
            fontFamily: 'Exo 2, sans-serif',
            fontWeight: 600,
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255, 215, 0, 1)'
            e.currentTarget.style.boxShadow = '0 0 15px rgba(255, 215, 0, 0.5)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255, 215, 0, 0.8)'
            e.currentTarget.style.boxShadow = 'none'
          }}
        >
          Command Center
        </Link>
      </div>
      <div style={{
        marginTop: '3rem',
        padding: '1.5rem',
        background: 'rgba(107, 63, 160, 0.1)',
        borderRadius: '8px',
        maxWidth: '500px',
        border: '1px solid rgba(107, 63, 160, 0.3)'
      }}>
        <p style={{ fontSize: '0.9rem', color: 'rgba(255, 255, 255, 0.7)' }}>
          <strong>Constitutional Rationale (F-004):</strong><br />
          This page does not exist because the requested resource was not found in the Hive's memory.
          Mother Nanuet has evaluated this path against Ma'at and determined it inadequate for retention.
        </p>
      </div>
    </div>
  )
}
