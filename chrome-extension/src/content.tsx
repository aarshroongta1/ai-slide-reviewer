/**
 * Cedar Spells Content Script using RxJS
 * Injects a React-based radial menu into Google Slides
 */

import React from 'react';
import { createRoot } from 'react-dom/client';
import { fromEvent, merge, Subject, BehaviorSubject } from 'rxjs';
import { filter, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { FileText, Monitor, Search, TrendingUp } from 'lucide-react';

// RxJS Subjects for managing state
const menuToggle$ = new Subject<boolean>();
const spellActions$ = new Subject<string>();
const destroy$ = new Subject<void>();

// BehaviorSubject for menu state
const isMenuActive$ = new BehaviorSubject<boolean>(false);

// Cedar Spell Menu Item Interface
interface CedarSpellMenuItem {
  id: string;
  title: string;
  icon: React.ComponentType<any>;
  action: string;
}

// Cedar Spells Menu Component
function CedarSpellsMenu() {
  const [isActive, setIsActive] = React.useState(false);

  // Menu items
  const menuItems: CedarSpellMenuItem[] = [
    {
      id: 'analyze',
      title: 'Analyze Slide',
      icon: FileText,
      action: 'analyze'
    },
    {
      id: 'insight',
      title: 'Generate Insights',
      icon: TrendingUp,
      action: 'insight'
    },
    {
      id: 'monitor',
      title: 'Monitor Changes',
      icon: Monitor,
      action: 'monitor'
    },
    {
      id: 'search',
      title: 'Search Content',
      icon: Search,
      action: 'search'
    }
  ];

  // Subscribe to menu state changes
  React.useEffect(() => {
    const subscription = isMenuActive$.subscribe(setIsActive);
    return () => subscription.unsubscribe();
  }, []);

  // Handle menu item clicks
  const handleItemClick = (action: string) => {
    console.log(`🎯 Cedar Spell triggered: ${action}`);
    spellActions$.next(action);
    isMenuActive$.next(false);
    showFeedback(`Cedar Spell: ${action}`);
  };

  // Handle backdrop click
  const handleBackdropClick = () => {
    isMenuActive$.next(false);
  };

  if (!isActive) return null;

  return (
    <div className="cedar-spells-overlay">
      <div className="cedar-backdrop" onClick={handleBackdropClick} />
      <div className="cedar-radial-menu">
        <div className="cedar-menu-header">
          <h3>Cedar Spells</h3>
        </div>
        <div className="cedar-menu-items">
          {menuItems.map((item) => (
            <div
              key={item.id}
              className="cedar-menu-item"
              onClick={() => handleItemClick(item.action)}
            >
              <item.icon className="cedar-icon" size={20} />
              <span className="cedar-label">{item.title}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Show feedback message
function showFeedback(message: string) {
  const feedback = document.createElement('div');
  feedback.className = 'cedar-feedback';
  feedback.innerHTML = `
    <div class="cedar-feedback-content">
      <span class="cedar-feedback-icon">✨</span>
      <span class="cedar-feedback-text">${message}</span>
    </div>
  `;
  
  document.body.appendChild(feedback);
  
  // Auto remove after 3 seconds
  setTimeout(() => {
    if (feedback.parentNode) {
      feedback.parentNode.removeChild(feedback);
    }
  }, 3000);
}

// Initialize Cedar Spells with RxJS
function initializeCedarSpells() {
  console.log('🚀 Initializing Cedar Spells with RxJS...');

  // Create container for React app
  const container = document.createElement('div');
  container.id = 'cedar-spells-container';
  document.body.appendChild(container);

  // Mount React app
  const root = createRoot(container);
  root.render(<CedarSpellsMenu />);

  // RxJS Streams for keyboard events
  const keyDown$ = fromEvent<KeyboardEvent>(document, 'keydown');
  const keyUp$ = fromEvent<KeyboardEvent>(document, 'keyup');

  // P key hold detection
  const pKeyDown$ = keyDown$.pipe(
    filter(event => event.key === 'p' || event.key === 'P'),
    debounceTime(150)
  );

  const pKeyUp$ = keyUp$.pipe(
    filter(event => event.key === 'p' || event.key === 'P')
  );

  // ESC key detection
  const escapeKey$ = keyDown$.pipe(
    filter(event => event.key === 'Escape')
  );

  // Combine all keyboard events
  const keyboardEvents$ = merge(
    pKeyDown$.pipe(filter(() => !isMenuActive$.value)),
    pKeyUp$,
    escapeKey$
  );

  // Subscribe to keyboard events
  const keyboardSubscription = keyboardEvents$.subscribe(event => {
    if (event.key === 'p' || event.key === 'P') {
      if (event.type === 'keydown') {
        console.log('🔑 P key pressed - showing Cedar radial menu');
        isMenuActive$.next(true);
      } else if (event.type === 'keyup') {
        // Only hide if it was a quick press, not a hold
        setTimeout(() => {
          if (isMenuActive$.value) {
            isMenuActive$.next(false);
          }
        }, 100);
      }
    } else if (event.key === 'Escape') {
      isMenuActive$.next(false);
    }
  });

  // Subscribe to spell actions
  const spellSubscription = spellActions$.subscribe(action => {
    console.log(`✨ Cedar Spell executed: ${action}`);
    
    // Here you would integrate with your actual Cedar spells
    // For now, just show feedback
    switch (action) {
      case 'analyze':
        showFeedback('Analyzing slide content...');
        break;
      case 'insight':
        showFeedback('Generating AI insights...');
        break;
      case 'monitor':
        showFeedback('Starting change monitoring...');
        break;
      case 'search':
        showFeedback('Searching slide content...');
        break;
    }
  });

  // Cleanup function
  const cleanup = () => {
    keyboardSubscription.unsubscribe();
    spellSubscription.unsubscribe();
    destroy$.next();
    destroy$.complete();
    
    // Unmount React app
    if (container.parentNode) {
      container.parentNode.removeChild(container);
    }
  };

  // Handle page navigation (Google Slides is SPA)
  let lastUrl = location.href;
  const urlObserver = new MutationObserver(() => {
    const url = location.href;
    if (url !== lastUrl) {
      lastUrl = url;
      console.log('🔄 Google Slides navigation detected, reinitializing...');
      
      // Cleanup and reinitialize
      cleanup();
      setTimeout(initializeCedarSpells, 1000);
    }
  });

  urlObserver.observe(document, { subtree: true, childList: true });

  console.log('✅ Cedar Spells initialized with RxJS!');
  console.log('🎯 Hold P key to activate radial menu');

  return cleanup;
}

// Initialize when page is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeCedarSpells);
} else {
  initializeCedarSpells();
}
