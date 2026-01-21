export interface PatternLibrary {
    id: string;
    name: string;
    type: 'figma' | 'web';
    enabled: boolean;
    config: FigmaConfig | WebConfig;
    lastFetched?: Date;
    componentCount?: number;
}

export interface FigmaConfig {
    fileUrl: string;
    accessToken: string;
    fileKey: string;
    nodeIds?: string[];
}

export interface WebConfig {
    url: string;
    selectors: {
        componentCard?: string;
        componentName?: string;
        componentCode?: string;
        componentPreview?: string;
    };
    requiresJavaScript: boolean;
}
