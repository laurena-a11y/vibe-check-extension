import * as vscode from 'vscode';
import { parseReactFile } from '../parsers';
import { FigmaFetcher } from '../fetchers';
import { MockFetcher } from '../fetchers/mockFetcher';
import { StructuralMatcher } from '../matchers';
import { ConfigService } from '../services';
import { DesignSystemComponent, FigmaConfig } from '../models';

let outputChannel: vscode.OutputChannel;

export async function checkCurrentFile(context: vscode.ExtensionContext): Promise<void> {
    const editor = vscode.window.activeTextEditor;

    if (!editor) {
        vscode.window.showErrorMessage('No active editor found');
        return;
    }

    const document = editor.document;
    const filePath = document.uri.fsPath;

    // Check if file is a React file
    if (!isReactFile(filePath)) {
        vscode.window.showWarningMessage('Current file is not a React/JSX file');
        return;
    }

    // Initialize output channel
    if (!outputChannel) {
        outputChannel = vscode.window.createOutputChannel('Vibe Check');
    }
    outputChannel.clear();
    outputChannel.show();

    try {
        outputChannel.appendLine('========================================');
        outputChannel.appendLine('Vibe Check: Analyzing file...');
        outputChannel.appendLine('========================================\n');

        // Parse React file
        const code = document.getText();
        const components = parseReactFile(code, filePath);

        if (components.length === 0) {
            outputChannel.appendLine('No React components found in current file');
            vscode.window.showInformationMessage('No React components found');
            return;
        }

        outputChannel.appendLine(`Found ${components.length} component(s):`);
        components.forEach((comp, i) => {
            outputChannel.appendLine(`  ${i + 1}. ${comp.name} (${comp.type})`);
        });
        outputChannel.appendLine('');

        // Get pattern libraries from configuration
        const configService = ConfigService.getInstance();
        const patternLibraries = configService.getPatternLibraries();

        // Fetch components from all enabled pattern libraries
        let allDesignSystemComponents: DesignSystemComponent[] = [];

        if (patternLibraries.length === 0) {
            outputChannel.appendLine('No pattern libraries configured.');
            outputChannel.appendLine('Using mock Square-style design system for demo...\n');

            const mockFetcher = new MockFetcher();
            allDesignSystemComponents = await mockFetcher.fetchComponents();
            outputChannel.appendLine(`Loaded ${allDesignSystemComponents.length} mock components from Square design system\n`);
        } else {
            outputChannel.appendLine('Fetching pattern libraries...');

            for (const library of patternLibraries) {
                if (!library.enabled) continue;

                try {
                    if (library.type === 'figma') {
                        outputChannel.appendLine(`  - Fetching from Figma: ${library.name}`);
                        const figmaFetcher = new FigmaFetcher();
                        const components = await figmaFetcher.fetchComponents(
                            library.config as FigmaConfig
                        );
                        allDesignSystemComponents.push(...components);
                        outputChannel.appendLine(`    Found ${components.length} components`);
                    }
                } catch (error) {
                    outputChannel.appendLine(`    Error: ${error}`);
                }
            }

            if (allDesignSystemComponents.length === 0) {
                outputChannel.appendLine('\nNo components found in pattern libraries.');
                outputChannel.appendLine('Using mock Square-style design system for demo...\n');

                const mockFetcher = new MockFetcher();
                allDesignSystemComponents = await mockFetcher.fetchComponents();
                outputChannel.appendLine(`Loaded ${allDesignSystemComponents.length} mock components from Square design system`);
            }
        }

        outputChannel.appendLine(`\nTotal design system components: ${allDesignSystemComponents.length}\n`);

        // Match components
        outputChannel.appendLine('Matching components...');
        const threshold = configService.getMatchingThreshold();
        const matcher = new StructuralMatcher(threshold);
        const matches = matcher.match(components, allDesignSystemComponents);

        if (matches.length === 0) {
            outputChannel.appendLine('\nNo matches found above threshold.');
            vscode.window.showInformationMessage('No similar components found in pattern libraries');
            return;
        }

        // Display results
        outputChannel.appendLine(`\nFound ${matches.length} match(es):\n`);
        outputChannel.appendLine('========================================');

        matches.forEach((match, i) => {
            outputChannel.appendLine(`\nMatch #${i + 1}`);
            outputChannel.appendLine('----------------------------------------');
            outputChannel.appendLine(`Your component: ${match.userComponent.name}`);
            outputChannel.appendLine(`Design system: ${match.designSystemComponent.name}`);
            outputChannel.appendLine(`Similarity: ${match.scores.combined}% (${match.confidence} confidence)`);
            outputChannel.appendLine(`\nReasons:`);
            match.matchReasons.forEach((reason) => {
                outputChannel.appendLine(`  - ${reason}`);
            });

            if (match.differences.length > 0) {
                outputChannel.appendLine(`\nDifferences:`);
                match.differences.forEach((diff) => {
                    outputChannel.appendLine(`  - [${diff.severity}] ${diff.description}`);
                });
            }

            if (match.designSystemComponent.documentationUrl) {
                outputChannel.appendLine(`\nDocumentation: ${match.designSystemComponent.documentationUrl}`);
            }
        });

        outputChannel.appendLine('\n========================================');
        outputChannel.appendLine('Analysis complete!');

        vscode.window.showInformationMessage(
            `Vibe Check found ${matches.length} match(es). Check output for details.`
        );
    } catch (error) {
        outputChannel.appendLine(`\nError: ${error}`);
        vscode.window.showErrorMessage(`Error analyzing file: ${error}`);
    }
}

function isReactFile(filePath: string): boolean {
    return /\.(tsx?|jsx?)$/.test(filePath);
}
