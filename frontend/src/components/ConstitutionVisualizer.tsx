/**
 * ConstitutionVisualizer.tsx
 * 
 * Interactive visualization of the Sovereign Hive Constitution
 * Displays Fixed Laws, Cardinal Laws, and Mutable Laws from soul.md
 * Shows version history and constitutional compliance
 * 
 * Source data: /v11/constitution + /v11/constitution/history
 * 
 * Features:
 * - Three-tier law visualization (Fixed, Cardinal, Mutable)
 * - Interactive tree/flow layout
 * - Version history timeline
 * - Compliance status indicators
 * - Expandable law details
 * - Real API integration with fallback to mock data
 * 
 * Constitutional Compliance: F-001, F-002, F-004, F-006
 */

import React, { useState, useEffect, useMemo } from 'react';
import { useUiStore } from '../stores/uiStore';
import { getConstitutionLaws, getConstitutionHistory } from '../services/api';