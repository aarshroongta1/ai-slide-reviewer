// Enhanced Google Slides Change Tracking Types

export interface EnhancedSlideChange {
  id: string;
  timestamp: Date;
  slideIndex: number;
  changeType: ChangeType;
  elementId: string;
  elementType: ElementType;
  details: ChangeDetails;
  metadata: ChangeMetadata;
}

export type ChangeType = 
  // Content Changes
  | 'text_content_changed'
  | 'text_formatting_changed'
  | 'text_style_changed'
  
  // Position & Size Changes
  | 'element_moved'
  | 'element_resized'
  | 'element_rotated'
  | 'element_scaled'
  
  // Style Changes
  | 'font_changed'
  | 'color_changed'
  | 'background_changed'
  | 'border_changed'
  
  // Structural Changes
  | 'element_added'
  | 'element_removed'
  | 'element_duplicated'
  | 'slide_added'
  | 'slide_removed'
  | 'slide_reordered'
  
  // Layout Changes
  | 'alignment_changed'
  | 'spacing_changed'
  | 'grouping_changed'
  | 'layering_changed';

export type ElementType = 
  | 'TEXT_BOX'
  | 'SHAPE'
  | 'IMAGE'
  | 'TABLE'
  | 'CHART'
  | 'VIDEO'
  | 'LINE'
  | 'GROUP';

export interface ChangeDetails {
  // Content Changes
  content?: {
    oldValue: string;
    newValue: string;
    textRange?: {
      startIndex: number;
      endIndex: number;
    };
  };
  
  // Position & Size
  position?: {
    oldPosition: ElementPosition;
    newPosition: ElementPosition;
  };
  
  // Style Changes
  style?: {
    oldStyle: ElementStyle;
    newStyle: ElementStyle;
  };
  
  // Formatting Changes
  formatting?: {
    oldFormatting: TextFormatting;
    newFormatting: TextFormatting;
  };
  
  // Element Properties
  properties?: {
    oldProperties: ElementProperties;
    newProperties: ElementProperties;
  };
}

export interface ElementPosition {
  x: number;           // Left position in EMU
  y: number;           // Top position in EMU
  width: number;       // Width in EMU
  height: number;      // Height in EMU
  rotation: number;   // Rotation in degrees
  scaleX: number;      // Horizontal scale factor
  scaleY: number;      // Vertical scale factor
}

export interface ElementStyle {
  // Text Styles
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: 'NORMAL' | 'BOLD';
  fontStyle?: 'NORMAL' | 'ITALIC';
  textColor?: string;
  
  // Background
  backgroundColor?: string;
  backgroundOpacity?: number;
  
  // Borders
  borderColor?: string;
  borderWidth?: number;
  borderStyle?: 'SOLID' | 'DASHED' | 'DOTTED';
  
  // Effects
  shadow?: ShadowStyle;
  reflection?: ReflectionStyle;
}

export interface TextFormatting {
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strikethrough?: boolean;
  superscript?: boolean;
  subscript?: boolean;
  textColor?: string;
  backgroundColor?: string;
  fontSize?: number;
  fontFamily?: string;
}

export interface ElementProperties {
  // Shape Properties
  shapeType?: string;
  fillType?: 'SOLID' | 'GRADIENT' | 'IMAGE';
  
  // Text Box Properties
  textAlignment?: 'LEFT' | 'CENTER' | 'RIGHT' | 'JUSTIFIED';
  verticalAlignment?: 'TOP' | 'MIDDLE' | 'BOTTOM';
  lineSpacing?: number;
  
  // Image Properties
  imageUrl?: string;
  imageCrop?: CropStyle;
  
  // Table Properties
  rowCount?: number;
  columnCount?: number;
  cellPadding?: number;
  
  // Animation Properties
  animationType?: string;
  animationDuration?: number;
}

export interface ShadowStyle {
  color: string;
  opacity: number;
  offsetX: number;
  offsetY: number;
  blurRadius: number;
}

export interface ReflectionStyle {
  opacity: number;
  distance: number;
}

export interface CropStyle {
  leftOffset: number;
  rightOffset: number;
  topOffset: number;
  bottomOffset: number;
}

export interface ChangeMetadata {
  // Change Context
  changeScope: 'SLIDE' | 'ELEMENT' | 'TEXT_RANGE';
  changeSeverity: 'LOW' | 'MEDIUM' | 'HIGH';
  
  // Element Hierarchy
  parentElementId?: string;
  elementPath?: string[]; // Path to element in hierarchy
  
  // Change Detection
  detectionMethod: 'POLLING' | 'EVENT' | 'MANUAL';
  confidence: number; // 0-1 confidence in change detection
  
  // User Context
  userId?: string;
  sessionId?: string;
  
  // Performance
  processingTime: number; // Time taken to detect change
}

// Specific change type interfaces for better type safety
export interface TextContentChange extends EnhancedSlideChange {
  changeType: 'text_content_changed';
  details: {
    content: {
      oldValue: string;
      newValue: string;
      textRange: {
        startIndex: number;
        endIndex: number;
      };
    };
  };
}

export interface PositionChange extends EnhancedSlideChange {
  changeType: 'element_moved' | 'element_resized' | 'element_rotated' | 'element_scaled';
  details: {
    position: {
      oldPosition: ElementPosition;
      newPosition: ElementPosition;
    };
  };
}

export interface StyleChange extends EnhancedSlideChange {
  changeType: 'font_changed' | 'color_changed' | 'background_changed' | 'border_changed';
  details: {
    style: {
      oldStyle: ElementStyle;
      newStyle: ElementStyle;
    };
  };
}

export interface FormattingChange extends EnhancedSlideChange {
  changeType: 'text_formatting_changed';
  details: {
    formatting: {
      oldFormatting: TextFormatting;
      newFormatting: TextFormatting;
    };
  };
}

// Utility types for change detection
export interface ElementSnapshot {
  id: string;
  type: ElementType;
  position: ElementPosition;
  style: ElementStyle;
  content?: string;
  properties: ElementProperties;
  timestamp: Date;
}

export interface SlideSnapshot {
  slideIndex: number;
  elements: ElementSnapshot[];
  timestamp: Date;
}

export interface ChangeDetectionResult {
  changes: EnhancedSlideChange[];
  snapshot: SlideSnapshot;
  detectionTime: number;
}
