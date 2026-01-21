import axios from 'axios';
import { DesignSystemComponent } from '../models';
import { FigmaConfig } from '../models/PatternLibrary';
import { generateId } from '../utils/helpers';

interface FigmaComponent {
    key: string;
    name: string;
    description: string;
    node_id: string;
}

interface FigmaComponentsResponse {
    meta: {
        components: FigmaComponent[];
    };
}

export class FigmaFetcher {
    private baseUrl = 'https://api.figma.com/v1';

    async fetchComponents(config: FigmaConfig): Promise<DesignSystemComponent[]> {
        try {
            const url = `${this.baseUrl}/files/${config.fileKey}/components`;

            const response = await axios.get<FigmaComponentsResponse>(url, {
                headers: {
                    'X-Figma-Token': config.accessToken,
                },
            });

            const figmaComponents = response.data.meta.components;

            // Transform Figma components to our format
            const components = await Promise.all(
                figmaComponents.map(async (comp) => {
                    return this.transformFigmaComponent(comp, config);
                })
            );

            return components;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                throw new Error(`Figma API error: ${error.response?.status} - ${error.message}`);
            }
            throw error;
        }
    }

    private async transformFigmaComponent(
        figmaComp: FigmaComponent,
        config: FigmaConfig
    ): Promise<DesignSystemComponent> {
        // Note: Figma API doesn't provide code implementation
        // We extract what we can from metadata

        return {
            id: generateId(),
            name: figmaComp.name,
            source: config.fileKey,
            description: figmaComp.description,
            category: this.extractCategory(figmaComp.name),
            tags: this.extractTags(figmaComp.name, figmaComp.description),
            structure: {
                elementTypes: this.inferElementTypes(figmaComp.name),
                propPatterns: [],
                childrenPattern: 'unknown',
            },
            documentationUrl: `https://www.figma.com/file/${config.fileKey}?node-id=${figmaComp.node_id}`,
            previewImageUrl: await this.getComponentImage(config.fileKey, figmaComp.node_id, config.accessToken),
        };
    }

    private extractCategory(name: string): string | undefined {
        const lowerName = name.toLowerCase();

        if (lowerName.includes('button')) return 'Button';
        if (lowerName.includes('input') || lowerName.includes('field')) return 'Form';
        if (lowerName.includes('card')) return 'Card';
        if (lowerName.includes('modal') || lowerName.includes('dialog')) return 'Overlay';
        if (lowerName.includes('nav') || lowerName.includes('menu')) return 'Navigation';
        if (lowerName.includes('header') || lowerName.includes('footer')) return 'Layout';

        return undefined;
    }

    private extractTags(name: string, description: string): string[] {
        const tags: string[] = [];
        const text = `${name} ${description}`.toLowerCase();

        const tagKeywords = [
            'primary',
            'secondary',
            'large',
            'small',
            'icon',
            'disabled',
            'loading',
            'error',
            'success',
            'warning',
        ];

        tagKeywords.forEach((keyword) => {
            if (text.includes(keyword)) {
                tags.push(keyword);
            }
        });

        return tags;
    }

    private inferElementTypes(name: string): string[] {
        const lowerName = name.toLowerCase();
        const types: string[] = [];

        if (lowerName.includes('button')) {
            types.push('button');
        }
        if (lowerName.includes('input')) {
            types.push('input');
        }
        if (lowerName.includes('card')) {
            types.push('div');
        }
        if (lowerName.includes('modal')) {
            types.push('div', 'dialog');
        }

        return types.length > 0 ? types : ['div'];
    }

    private async getComponentImage(
        fileKey: string,
        nodeId: string,
        accessToken: string
    ): Promise<string | undefined> {
        try {
            const url = `${this.baseUrl}/images/${fileKey}?ids=${nodeId}&format=png&scale=2`;

            const response = await axios.get<{ images: Record<string, string> }>(url, {
                headers: {
                    'X-Figma-Token': accessToken,
                },
            });

            return response.data.images[nodeId];
        } catch (error) {
            console.error('Error fetching component image:', error);
            return undefined;
        }
    }

    async testConnection(config: FigmaConfig): Promise<boolean> {
        try {
            const url = `${this.baseUrl}/files/${config.fileKey}`;

            await axios.get(url, {
                headers: {
                    'X-Figma-Token': config.accessToken,
                },
            });

            return true;
        } catch (error) {
            return false;
        }
    }
}
