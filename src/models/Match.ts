import { ParsedComponent, DesignSystemComponent } from './Component';

export interface MatchResult {
    id: string;
    userComponent: ParsedComponent;
    designSystemComponent: DesignSystemComponent;

    // Matching scores
    scores: {
        structural: number;
        semantic: number;
        combined: number;
    };

    // Reasoning
    matchReasons: string[];
    differences: Difference[];

    // Confidence
    confidence: 'high' | 'medium' | 'low';

    // Suggestions
    replacement?: {
        code: string;
        imports: string[];
        explanation: string;
    };
}

export interface Difference {
    type: 'prop' | 'structure' | 'behavior';
    description: string;
    severity: 'minor' | 'moderate' | 'major';
}
