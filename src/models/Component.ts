export interface ParsedComponent {
    id: string;
    name: string;
    type: 'FunctionComponent' | 'ClassComponent' | 'JSXElement';

    // Structural data
    props: ComponentProp[];
    children: ComponentChild[];
    jsxStructure: JSXNode;

    // Code information
    sourceCode: string;
    location: {
        file: string;
        startLine: number;
        endLine: number;
        startColumn: number;
        endColumn: number;
    };

    // Metadata
    complexity: number;
    linesOfCode: number;
}

export interface ComponentProp {
    name: string;
    type?: string;
    required: boolean;
    defaultValue?: any;
}

export interface ComponentChild {
    type: string;
    name?: string;
}

export interface JSXNode {
    type: string;
    name?: string;
    attributes: Record<string, any>;
    children: JSXNode[];
}

export interface DesignSystemComponent {
    id: string;
    name: string;
    source: string;

    // Description
    description?: string;
    category?: string;
    tags?: string[];

    // Structural signature (for matching)
    structure: {
        elementTypes: string[];
        propPatterns: string[];
        childrenPattern: string;
    };

    // Embedding for semantic matching
    embedding?: number[];

    // Documentation
    documentationUrl?: string;
    codeExample?: string;
    previewImageUrl?: string;

    // Usage
    usage?: {
        imports: string[];
        props: ComponentProp[];
        example: string;
    };
}
