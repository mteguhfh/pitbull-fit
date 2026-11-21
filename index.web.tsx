import './src/compiled.css';
import '@zakisheriff/liquid-glass/styles.css';
import { setGlassQuality } from '@zakisheriff/liquid-glass';
import React from 'react';
import App from './src/App';
import { registerRootComponent } from 'expo';

// Optimize liquid glass rendering pipeline for 60-120fps fluid physics
try {
  setGlassQuality('auto');
} catch {}

registerRootComponent(App);

export default App;
