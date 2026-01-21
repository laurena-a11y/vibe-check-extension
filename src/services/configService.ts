import * as vscode from 'vscode';
import { PatternLibrary, FigmaConfig } from '../models';

export class ConfigService {
    private static instance: ConfigService;

    private constructor() {}

    static getInstance(): ConfigService {
        if (!ConfigService.instance) {
            ConfigService.instance = new ConfigService();
        }
        return ConfigService.instance;
    }

    getConfig() {
        return vscode.workspace.getConfiguration('vibeCheck');
    }

    isEnabled(): boolean {
        return this.getConfig().get('enabled', true);
    }

    getPatternLibraries(): PatternLibrary[] {
        return this.getConfig().get('patternLibraries', []);
    }

    getMatchingThreshold(): number {
        return this.getConfig().get('matchingThreshold', 70);
    }

    getMatchingStrategy(): 'structural' | 'semantic' | 'hybrid' {
        return this.getConfig().get('matchingStrategy', 'hybrid');
    }

    getSemanticWeight(): number {
        return this.getConfig().get('semanticWeight', 40);
    }

    async addPatternLibrary(library: PatternLibrary): Promise<void> {
        const libraries = this.getPatternLibraries();
        libraries.push(library);
        await this.getConfig().update(
            'patternLibraries',
            libraries,
            vscode.ConfigurationTarget.Global
        );
    }

    async removePatternLibrary(id: string): Promise<void> {
        const libraries = this.getPatternLibraries().filter((lib) => lib.id !== id);
        await this.getConfig().update(
            'patternLibraries',
            libraries,
            vscode.ConfigurationTarget.Global
        );
    }

    async updatePatternLibrary(id: string, updates: Partial<PatternLibrary>): Promise<void> {
        const libraries = this.getPatternLibraries().map((lib) =>
            lib.id === id ? { ...lib, ...updates } : lib
        );
        await this.getConfig().update(
            'patternLibraries',
            libraries,
            vscode.ConfigurationTarget.Global
        );
    }
}
