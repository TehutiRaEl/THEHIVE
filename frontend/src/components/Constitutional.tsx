import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

interface ConstitutionLaw {
  id: string;
  title: string;
  content: string;
  category: string;
  priority: number;
}

const Constitutional: React.FC = () => {
  const [document, setDocument] = useState<any>(null);
  const [laws, setLaws] = useState<ConstitutionLaw[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'document' | 'laws'>('document');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [constResponse, lawsResponse] = await Promise.all([
          api.constitution.getConstitution(),
          api.constitution.getConstitutionLaws()
        ]);
        setDocument(constResponse.data);
        setLaws(lawsResponse.data);
      } catch (error) {
        console.error('Error fetching constitution:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div>Loading constitution...</div>;
  
  return (
    <div className="constitutional">
      <h2>Constitutional Framework</h2>
      <div className="view-selector">
        <button onClick={() => setViewMode('document')}>Document</button>
        <button onClick={() => setViewMode('laws')}>Laws ({laws.length})</button>
      </div>
      {viewMode === 'document' ? (
        <div className="document-view">
          <pre>{JSON.stringify(document, null, 2)}</pre>
        </div>
      ) : (
        <div className="laws-view">
          {laws.map(law => (
            <div key={law.id} className="law-card">
              <h3>{law.title}</h3>
              <p>{law.content}</p>
              <span>Category: {law.category}</span>
              <span>Priority: {law.priority}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Constitutional;
