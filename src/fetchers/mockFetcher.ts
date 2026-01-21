import { DesignSystemComponent } from '../models';
import { squareStyleComponents } from './mockData';

/**
 * Mock fetcher for testing without requiring real Figma/web sources
 * Returns Square-style design system components
 */
export class MockFetcher {
    async fetchComponents(): Promise<DesignSystemComponent[]> {
        // Simulate network delay
        await new Promise((resolve) => setTimeout(resolve, 500));

        return squareStyleComponents;
    }
}
