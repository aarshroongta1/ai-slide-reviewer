/**
 * Cedar Spell Bridge - External API for Cedar Spells
 * 
 * This module provides external API access to Cedar spell functions
 * while maintaining explicit Cedar spell calls. It bridges between
 * Google Apps Script and your Cedar spell implementations.
 */

import { callGoogleAppsScript } from '@/app/config/google-apps-script';

export interface CedarSpellContext {
  slideId?: string;
  slideIndex: number;
  presentationId: string;
  changeData?: any;
  userAction?: string;
}

export interface CedarSpellResult {
  success: boolean;
  type: string;
  data: any;
  feedback: string;
  timestamp: string;
}

/**
 * External API for triggering Cedar spells from Google Apps Script
 * This maintains explicit Cedar spell function calls while providing
 * external access via HTTP API
 */
export class CedarSpellBridge {
  private baseUrl: string;

  constructor(baseUrl: string = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000') {
    this.baseUrl = baseUrl;
  }

  /**
   * Trigger a Cedar spell from external source (Google Apps Script)
   * This is the main entry point that maintains explicit Cedar spell calls
   */
  async triggerCedarSpell(
    spellType: string,
    context: CedarSpellContext,
    spellData?: any
  ): Promise<CedarSpellResult> {
    try {
      console.log(`🎯 Triggering Cedar Spell: ${spellType}`, context);

      // Call your React app's Cedar spell API endpoint
      const response = await fetch(`${this.baseUrl}/api/cedar-spell`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          spellType,
          spellData,
          slideContext: context,
        }),
      });

      if (!response.ok) {
        throw new Error(`Cedar spell API error: ${response.status}`);
      }

      const result = await response.json();
      console.log(`✅ Cedar Spell ${spellType} completed:`, result);

      return {
        success: true,
        type: spellType,
        data: result.result,
        feedback: `Cedar spell ${spellType} executed successfully`,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error(`❌ Cedar Spell ${spellType} failed:`, error);
      return {
        success: false,
        type: spellType,
        data: null,
        feedback: `Cedar spell ${spellType} failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Direct Cedar spell execution for specific spell types
   * These maintain explicit Cedar spell function calls
   */
  async executeAnalyzeSlideSpell(context: CedarSpellContext): Promise<CedarSpellResult> {
    return this.triggerCedarSpell('analyzeSlide', context);
  }

  async executeGenerateInsightSpell(context: CedarSpellContext, changeData: any): Promise<CedarSpellResult> {
    return this.triggerCedarSpell('generateInsight', context, changeData);
  }

  async executeMonitorChangesSpell(context: CedarSpellContext): Promise<CedarSpellResult> {
    return this.triggerCedarSpell('monitorChanges', context);
  }

  async executeSearchContentSpell(context: CedarSpellContext, searchQuery: string): Promise<CedarSpellResult> {
    return this.triggerCedarSpell('searchContent', context, { searchQuery });
  }

  /**
   * Write Cedar spell results back to Google Slides
   * This completes the feedback loop
   */
  async writeResultToSlides(result: CedarSpellResult, context: CedarSpellContext): Promise<void> {
    try {
      await callGoogleAppsScript('writeAIFeedback', 'POST', {
        result,
        slideContext: context,
      });
      console.log('✅ Cedar spell result written to Google Slides');
    } catch (error) {
      console.error('❌ Failed to write Cedar spell result to slides:', error);
      throw error;
    }
  }
}

/**
 * Google Apps Script Integration Functions
 * These functions can be called from Google Apps Script to trigger Cedar spells
 */

// Global instance for Google Apps Script integration
const cedarSpellBridge = new CedarSpellBridge();

/**
 * Google Apps Script can call this function to trigger Cedar spells
 * Usage in Google Apps Script:
 * 
 * const result = triggerCedarSpellFromSlides('analyzeSlide', {
 *   slideIndex: 0,
 *   presentationId: 'your-presentation-id'
 * });
 */
export async function triggerCedarSpellFromSlides(
  spellType: string,
  context: CedarSpellContext,
  spellData?: any
): Promise<CedarSpellResult> {
  const result = await cedarSpellBridge.triggerCedarSpell(spellType, context, spellData);
  
  // Write result back to slides
  await cedarSpellBridge.writeResultToSlides(result, context);
  
  return result;
}

/**
 * Convenience functions for specific Cedar spell types
 * These maintain explicit Cedar spell calls while providing external access
 */

export async function analyzeSlideFromSlides(
  slideIndex: number,
  presentationId: string,
  slideId?: string
): Promise<CedarSpellResult> {
  return triggerCedarSpellFromSlides('analyzeSlide', {
    slideIndex,
    presentationId,
    slideId,
  });
}

export async function generateInsightFromSlides(
  slideIndex: number,
  presentationId: string,
  changeData: any,
  slideId?: string
): Promise<CedarSpellResult> {
  return triggerCedarSpellFromSlides('generateInsight', {
    slideIndex,
    presentationId,
    slideId,
    changeData,
  }, changeData);
}

export async function monitorChangesFromSlides(
  presentationId: string
): Promise<CedarSpellResult> {
  return triggerCedarSpellFromSlides('monitorChanges', {
    slideIndex: 0, // Not applicable for monitoring
    presentationId,
  });
}

export async function searchContentFromSlides(
  presentationId: string,
  searchQuery: string
): Promise<CedarSpellResult> {
  return triggerCedarSpellFromSlides('searchContent', {
    slideIndex: 0, // Not applicable for search
    presentationId,
  }, { searchQuery });
}

/**
 * Utility function to create Cedar spell context from Google Slides data
 */
export function createCedarSpellContext(
  slideData: any,
  presentationId: string,
  changeData?: any
): CedarSpellContext {
  return {
    slideId: slideData?.id,
    slideIndex: slideData?.index || 0,
    presentationId,
    changeData,
    userAction: changeData?.type || 'manual',
  };
}

// Export the bridge instance for direct use
export { cedarSpellBridge };
