import React from 'react';
import { motion } from 'framer-motion';
import HiveDashboard from './components/HiveDashboard/HiveDashboard';

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        <HiveDashboard />
      </motion.div>
    </div>
  );
}

export default App;
