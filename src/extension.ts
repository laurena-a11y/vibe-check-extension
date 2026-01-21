import * as vscode from 'vscode';
import { checkCurrentFile } from './commands/checkCurrentFile';
import { configurePatterns } from './commands/configurePatterns';
import { refreshCache } from './commands/refreshCache';

export function activate(context: vscode.ExtensionContext) {
    console.log('Vibe Check extension is now active!');

    // Register commands
    const checkCommand = vscode.commands.registerCommand(
        'vibeCheck.checkCurrentFile',
        () => checkCurrentFile(context)
    );

    const configureCommand = vscode.commands.registerCommand(
        'vibeCheck.configurePatterns',
        () => configurePatterns(context)
    );

    const refreshCommand = vscode.commands.registerCommand(
        'vibeCheck.refreshCache',
        () => refreshCache(context)
    );

    context.subscriptions.push(checkCommand, configureCommand, refreshCommand);
}

export function deactivate() {
    console.log('Vibe Check extension is now deactivated');
}
