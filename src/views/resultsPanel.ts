import * as vscode from 'vscode';
import { MatchResult } from '../models';

export class ResultsPanel {
    public static currentPanel: ResultsPanel | undefined;
    private readonly _panel: vscode.WebviewPanel;
    private _disposables: vscode.Disposable[] = [];

    private constructor(panel: vscode.WebviewPanel, extensionUri: vscode.Uri) {
        this._panel = panel;

        // Set the webview's initial html content
        this._update();

        // Listen for when the panel is disposed
        this._panel.onDidDispose(() => this.dispose(), null, this._disposables);
    }

    public static createOrShow(extensionUri: vscode.Uri, matches: MatchResult[]) {
        const column = vscode.window.activeTextEditor
            ? vscode.window.activeTextEditor.viewColumn
            : undefined;

        // If we already have a panel, show it
        if (ResultsPanel.currentPanel) {
            ResultsPanel.currentPanel._panel.reveal(column);
            ResultsPanel.currentPanel.updateMatches(matches);
            return;
        }

        // Otherwise, create a new panel
        const panel = vscode.window.createWebviewPanel(
            'vibeCheckResults',
            'Vibe Check Results',
            column || vscode.ViewColumn.One,
            {
                enableScripts: true,
                retainContextWhenHidden: true,
            }
        );

        ResultsPanel.currentPanel = new ResultsPanel(panel, extensionUri);
        ResultsPanel.currentPanel.updateMatches(matches);
    }

    public updateMatches(matches: MatchResult[]) {
        this._panel.webview.html = this._getHtmlForWebview(matches);
    }

    public dispose() {
        ResultsPanel.currentPanel = undefined;

        this._panel.dispose();

        while (this._disposables.length) {
            const disposable = this._disposables.pop();
            if (disposable) {
                disposable.dispose();
            }
        }
    }

    private _update() {
        this._panel.webview.html = this._getHtmlForWebview([]);
    }

    private _getHtmlForWebview(matches: MatchResult[]): string {
        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Vibe Check Results</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            padding: 24px;
            background: #f8f9fa;
            color: #1a1a1a;
            line-height: 1.6;
        }

        .header {
            background: white;
            padding: 32px;
            border-radius: 12px;
            margin-bottom: 24px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.05);
        }

        .header h1 {
            font-size: 32px;
            font-weight: 700;
            margin-bottom: 8px;
            color: #000;
        }

        .header p {
            font-size: 16px;
            color: #666;
        }

        .stats {
            display: flex;
            gap: 16px;
            margin-top: 20px;
        }

        .stat {
            background: #f0f0f0;
            padding: 12px 20px;
            border-radius: 8px;
            font-size: 14px;
        }

        .stat strong {
            display: block;
            font-size: 24px;
            font-weight: 700;
            color: #000;
        }

        .match-card {
            background: white;
            border-radius: 12px;
            margin-bottom: 24px;
            overflow: hidden;
            box-shadow: 0 2px 8px rgba(0,0,0,0.05);
        }

        .match-header {
            padding: 24px;
            border-bottom: 1px solid #e5e5e5;
        }

        .match-title {
            font-size: 20px;
            font-weight: 600;
            margin-bottom: 12px;
            display: flex;
            align-items: center;
            gap: 12px;
        }

        .confidence-badge {
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .confidence-high {
            background: #d4edda;
            color: #155724;
        }

        .confidence-medium {
            background: #fff3cd;
            color: #856404;
        }

        .confidence-low {
            background: #f8d7da;
            color: #721c24;
        }

        .score {
            font-size: 14px;
            color: #666;
        }

        .score-bar {
            height: 8px;
            background: #e5e5e5;
            border-radius: 4px;
            overflow: hidden;
            margin-top: 8px;
        }

        .score-fill {
            height: 100%;
            background: linear-gradient(90deg, #4CAF50, #8BC34A);
            transition: width 0.3s ease;
        }

        .comparison {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 0;
        }

        .comparison-side {
            padding: 24px;
        }

        .comparison-side:first-child {
            border-right: 1px solid #e5e5e5;
        }

        .side-header {
            display: flex;
            align-items: center;
            gap: 8px;
            margin-bottom: 16px;
        }

        .side-label {
            font-size: 12px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            color: #666;
        }

        .component-name {
            font-size: 18px;
            font-weight: 600;
            color: #000;
            margin-bottom: 8px;
        }

        .component-type {
            font-size: 14px;
            color: #666;
            margin-bottom: 16px;
        }

        .code-block {
            background: #f6f8fa;
            border: 1px solid #e5e5e5;
            border-radius: 8px;
            padding: 16px;
            margin-top: 12px;
            font-family: 'Monaco', 'Menlo', 'Courier New', monospace;
            font-size: 13px;
            overflow-x: auto;
        }

        .code-block pre {
            margin: 0;
            white-space: pre-wrap;
            word-wrap: break-word;
        }

        .props-list {
            margin-top: 12px;
        }

        .props-list h4 {
            font-size: 14px;
            font-weight: 600;
            margin-bottom: 8px;
            color: #666;
        }

        .props-list ul {
            list-style: none;
            padding: 0;
        }

        .props-list li {
            padding: 4px 0;
            font-size: 13px;
            color: #333;
        }

        .props-list code {
            background: #f0f0f0;
            padding: 2px 6px;
            border-radius: 3px;
            font-size: 12px;
        }

        .reasons {
            padding: 24px;
            background: #f8f9fa;
            border-top: 1px solid #e5e5e5;
        }

        .reasons h3 {
            font-size: 16px;
            font-weight: 600;
            margin-bottom: 12px;
            color: #000;
        }

        .reasons ul {
            list-style: none;
            padding: 0;
        }

        .reasons li {
            padding: 8px 0;
            padding-left: 24px;
            position: relative;
            font-size: 14px;
            color: #333;
        }

        .reasons li:before {
            content: "✓";
            position: absolute;
            left: 0;
            color: #4CAF50;
            font-weight: bold;
        }

        .differences {
            padding: 24px;
            background: #fff9e6;
            border-top: 1px solid #e5e5e5;
        }

        .differences h3 {
            font-size: 16px;
            font-weight: 600;
            margin-bottom: 12px;
            color: #000;
        }

        .differences ul {
            list-style: none;
            padding: 0;
        }

        .differences li {
            padding: 8px 0;
            padding-left: 24px;
            position: relative;
            font-size: 14px;
            color: #666;
        }

        .differences li:before {
            content: "⚠";
            position: absolute;
            left: 0;
            color: #ff9800;
        }

        .severity-minor:before { content: "ℹ"; color: #2196F3; }
        .severity-moderate:before { content: "⚠"; color: #ff9800; }
        .severity-major:before { content: "✕"; color: #f44336; }

        .action-buttons {
            padding: 24px;
            border-top: 1px solid #e5e5e5;
            display: flex;
            gap: 12px;
        }

        .btn {
            padding: 12px 24px;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            border: none;
            transition: all 0.2s;
        }

        .btn-primary {
            background: #000;
            color: white;
        }

        .btn-primary:hover {
            background: #333;
        }

        .btn-secondary {
            background: white;
            color: #000;
            border: 1px solid #e5e5e5;
        }

        .btn-secondary:hover {
            background: #f8f9fa;
        }

        .documentation-link {
            margin-top: 16px;
            font-size: 14px;
        }

        .documentation-link a {
            color: #0066cc;
            text-decoration: none;
        }

        .documentation-link a:hover {
            text-decoration: underline;
        }

        .no-matches {
            text-align: center;
            padding: 64px 32px;
            background: white;
            border-radius: 12px;
        }

        .no-matches h2 {
            font-size: 24px;
            margin-bottom: 12px;
            color: #000;
        }

        .no-matches p {
            font-size: 16px;
            color: #666;
        }

        @media (max-width: 768px) {
            .comparison {
                grid-template-columns: 1fr;
            }

            .comparison-side:first-child {
                border-right: none;
                border-bottom: 1px solid #e5e5e5;
            }
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>🎨 Vibe Check Results</h1>
        <p>Component pattern matching analysis</p>
        <div class="stats">
            <div class="stat">
                <strong>${matches.length}</strong>
                Match${matches.length !== 1 ? 'es' : ''} Found
            </div>
        </div>
    </div>

    ${matches.length === 0 ? `
        <div class="no-matches">
            <h2>No Matches Found</h2>
            <p>Your components don't appear to match any patterns in the design system.</p>
        </div>
    ` : matches.map((match, index) => `
        <div class="match-card">
            <div class="match-header">
                <div class="match-title">
                    Match #${index + 1}
                    <span class="confidence-badge confidence-${match.confidence}">
                        ${match.confidence} confidence
                    </span>
                </div>
                <div class="score">
                    Similarity Score: ${match.scores.combined}%
                    <div class="score-bar">
                        <div class="score-fill" style="width: ${match.scores.combined}%"></div>
                    </div>
                </div>
            </div>

            <div class="comparison">
                <div class="comparison-side">
                    <div class="side-header">
                        <span class="side-label">❌ Your Component</span>
                    </div>
                    <div class="component-name">${match.userComponent.name}</div>
                    <div class="component-type">${match.userComponent.type}</div>

                    <div class="code-block">
                        <pre>${this._escapeHtml(match.userComponent.sourceCode.substring(0, 500))}${match.userComponent.sourceCode.length > 500 ? '...' : ''}</pre>
                    </div>

                    ${match.userComponent.props.length > 0 ? `
                        <div class="props-list">
                            <h4>Props:</h4>
                            <ul>
                                ${match.userComponent.props.map(prop => `
                                    <li><code>${prop.name}</code>${prop.required ? ' (required)' : ''}</li>
                                `).join('')}
                            </ul>
                        </div>
                    ` : ''}
                </div>

                <div class="comparison-side">
                    <div class="side-header">
                        <span class="side-label">✅ Design System</span>
                    </div>
                    <div class="component-name">${match.designSystemComponent.name}</div>
                    <div class="component-type">${match.designSystemComponent.category || 'Component'}</div>

                    ${match.designSystemComponent.description ? `
                        <p style="font-size: 14px; color: #666; margin-bottom: 12px;">
                            ${match.designSystemComponent.description}
                        </p>
                    ` : ''}

                    ${match.designSystemComponent.codeExample ? `
                        <div class="code-block">
                            <pre>${this._escapeHtml(match.designSystemComponent.codeExample)}</pre>
                        </div>
                    ` : ''}

                    ${match.designSystemComponent.usage?.props && match.designSystemComponent.usage.props.length > 0 ? `
                        <div class="props-list">
                            <h4>Expected Props:</h4>
                            <ul>
                                ${match.designSystemComponent.usage.props.map(prop => `
                                    <li><code>${prop.name}</code>${prop.type ? `: ${prop.type}` : ''}${prop.required ? ' (required)' : ''}</li>
                                `).join('')}
                            </ul>
                        </div>
                    ` : ''}

                    ${match.designSystemComponent.documentationUrl ? `
                        <div class="documentation-link">
                            <a href="${match.designSystemComponent.documentationUrl}" target="_blank">
                                📖 View Documentation →
                            </a>
                        </div>
                    ` : ''}
                </div>
            </div>

            ${match.matchReasons.length > 0 ? `
                <div class="reasons">
                    <h3>Why This Matches:</h3>
                    <ul>
                        ${match.matchReasons.map(reason => `
                            <li>${reason}</li>
                        `).join('')}
                    </ul>
                </div>
            ` : ''}

            ${match.differences.length > 0 ? `
                <div class="differences">
                    <h3>Differences:</h3>
                    <ul>
                        ${match.differences.map(diff => `
                            <li class="severity-${diff.severity}">${diff.description}</li>
                        `).join('')}
                    </ul>
                </div>
            ` : ''}

            <div class="action-buttons">
                <button class="btn btn-primary">Replace with Design System Component</button>
                <button class="btn btn-secondary">Ignore This Match</button>
            </div>
        </div>
    `).join('')}
</body>
</html>`;
    }

    private _escapeHtml(text: string): string {
        return text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }
}
