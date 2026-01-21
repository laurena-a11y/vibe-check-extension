import * as parser from '@babel/parser';
import traverse, { NodePath } from '@babel/traverse';
import * as t from '@babel/types';
import { ParsedComponent, ComponentProp, JSXNode } from '../models';
import { generateId } from '../utils/helpers';

export function parseReactFile(code: string, filePath: string): ParsedComponent[] {
    try {
        const ast = parser.parse(code, {
            sourceType: 'module',
            plugins: ['jsx', 'typescript', 'decorators-legacy'],
        });

        const components: ParsedComponent[] = [];

        traverse(ast, {
            // Function components (function declarations)
            FunctionDeclaration(path) {
                if (isReactComponent(path.node, path)) {
                    const component = extractFunctionComponent(path, code, filePath);
                    if (component) {
                        components.push(component);
                    }
                }
            },

            // Arrow function components (variable declarations)
            VariableDeclarator(path) {
                if (
                    path.node.init &&
                    (t.isArrowFunctionExpression(path.node.init) || t.isFunctionExpression(path.node.init))
                ) {
                    if (isReactComponent(path.node.init, path)) {
                        const component = extractArrowComponent(path, code, filePath);
                        if (component) {
                            components.push(component);
                        }
                    }
                }
            },

            // Class components
            ClassDeclaration(path) {
                if (isReactClassComponent(path.node)) {
                    const component = extractClassComponent(path, code, filePath);
                    if (component) {
                        components.push(component);
                    }
                }
            },
        });

        return components;
    } catch (error) {
        console.error('Error parsing React file:', error);
        return [];
    }
}

function isReactComponent(node: t.Node, path: NodePath<any>): boolean {
    // Check if function returns JSX
    let hasJSXReturn = false;

    if (t.isFunction(node)) {
        traverse(
            node,
            {
                ReturnStatement(returnPath) {
                    if (returnPath.node.argument && t.isJSXElement(returnPath.node.argument)) {
                        hasJSXReturn = true;
                        returnPath.stop();
                    }
                },
                JSXElement() {
                    hasJSXReturn = true;
                },
            },
            path.scope
        );
    }

    return hasJSXReturn;
}

function isReactClassComponent(node: t.ClassDeclaration): boolean {
    // Check if class extends React.Component or Component
    if (node.superClass) {
        if (t.isIdentifier(node.superClass) && node.superClass.name === 'Component') {
            return true;
        }
        if (
            t.isMemberExpression(node.superClass) &&
            t.isIdentifier(node.superClass.object) &&
            node.superClass.object.name === 'React' &&
            t.isIdentifier(node.superClass.property) &&
            node.superClass.property.name === 'Component'
        ) {
            return true;
        }
    }
    return false;
}

function extractFunctionComponent(
    path: NodePath<t.FunctionDeclaration>,
    code: string,
    filePath: string
): ParsedComponent | null {
    const node = path.node;
    if (!node.id) return null;

    const name = node.id.name;
    const props = extractPropsFromFunction(node);
    const jsxStructure = extractJSXStructure(node);
    const sourceCode = getNodeSource(node, code);
    const location = getNodeLocation(node, filePath);

    return {
        id: generateId(),
        name,
        type: 'FunctionComponent',
        props,
        children: [],
        jsxStructure,
        sourceCode,
        location,
        complexity: calculateComplexity(node),
        linesOfCode: location.endLine - location.startLine + 1,
    };
}

function extractArrowComponent(
    path: NodePath<t.VariableDeclarator>,
    code: string,
    filePath: string
): ParsedComponent | null {
    const node = path.node;
    if (!t.isIdentifier(node.id) || !node.init) return null;

    const name = node.id.name;
    const funcNode = node.init;
    if (!t.isFunction(funcNode)) return null;

    const props = extractPropsFromFunction(funcNode);
    const jsxStructure = extractJSXStructure(funcNode);
    const sourceCode = getNodeSource(node, code);
    const location = getNodeLocation(node, filePath);

    return {
        id: generateId(),
        name,
        type: 'FunctionComponent',
        props,
        children: [],
        jsxStructure,
        sourceCode,
        location,
        complexity: calculateComplexity(funcNode),
        linesOfCode: location.endLine - location.startLine + 1,
    };
}

function extractClassComponent(
    path: NodePath<t.ClassDeclaration>,
    code: string,
    filePath: string
): ParsedComponent | null {
    const node = path.node;
    if (!node.id) return null;

    const name = node.id.name;
    const props = extractPropsFromClass(node);
    const jsxStructure = extractJSXStructureFromClass(node);
    const sourceCode = getNodeSource(node, code);
    const location = getNodeLocation(node, filePath);

    return {
        id: generateId(),
        name,
        type: 'ClassComponent',
        props,
        children: [],
        jsxStructure,
        sourceCode,
        location,
        complexity: calculateComplexity(node),
        linesOfCode: location.endLine - location.startLine + 1,
    };
}

function extractPropsFromFunction(node: t.Function): ComponentProp[] {
    const props: ComponentProp[] = [];

    if (node.params.length > 0) {
        const firstParam = node.params[0];

        // Handle destructured props
        if (t.isObjectPattern(firstParam)) {
            firstParam.properties.forEach((prop) => {
                if (t.isObjectProperty(prop) && t.isIdentifier(prop.key)) {
                    props.push({
                        name: prop.key.name,
                        required: !t.isAssignmentPattern(prop.value),
                        defaultValue: t.isAssignmentPattern(prop.value) ? extractDefaultValue(prop.value.right) : undefined,
                    });
                }
            });
        }
        // Handle props object
        else if (t.isIdentifier(firstParam)) {
            // For now, we can't determine individual props without type info
            props.push({
                name: firstParam.name,
                required: true,
            });
        }
    }

    return props;
}

function extractPropsFromClass(node: t.ClassDeclaration): ComponentProp[] {
    // For class components, we'd need to analyze this.props usage
    // This is a simplified version
    return [];
}

function extractJSXStructure(node: t.Function): JSXNode {
    let rootJSX: t.JSXElement | null = null;

    traverse(
        node,
        {
            ReturnStatement(path) {
                if (path.node.argument && t.isJSXElement(path.node.argument)) {
                    rootJSX = path.node.argument;
                    path.stop();
                }
            },
        },
        node as any
    );

    if (rootJSX) {
        return convertJSXElementToNode(rootJSX);
    }

    return {
        type: 'unknown',
        attributes: {},
        children: [],
    };
}

function extractJSXStructureFromClass(node: t.ClassDeclaration): JSXNode {
    let rootJSX: t.JSXElement | null = null;

    // Find render method
    node.body.body.forEach((member) => {
        if (
            t.isClassMethod(member) &&
            t.isIdentifier(member.key) &&
            member.key.name === 'render'
        ) {
            traverse(
                member,
                {
                    ReturnStatement(path) {
                        if (path.node.argument && t.isJSXElement(path.node.argument)) {
                            rootJSX = path.node.argument;
                            path.stop();
                        }
                    },
                },
                member as any
            );
        }
    });

    if (rootJSX) {
        return convertJSXElementToNode(rootJSX);
    }

    return {
        type: 'unknown',
        attributes: {},
        children: [],
    };
}

function convertJSXElementToNode(element: t.JSXElement): JSXNode {
    const name = getJSXElementName(element.openingElement);
    const attributes = extractJSXAttributes(element.openingElement);
    const children = element.children
        .filter((child) => t.isJSXElement(child))
        .map((child) => convertJSXElementToNode(child as t.JSXElement));

    return {
        type: 'element',
        name,
        attributes,
        children,
    };
}

function getJSXElementName(opening: t.JSXOpeningElement): string {
    if (t.isJSXIdentifier(opening.name)) {
        return opening.name.name;
    }
    if (t.isJSXMemberExpression(opening.name)) {
        return getJSXMemberExpressionName(opening.name);
    }
    return 'unknown';
}

function getJSXMemberExpressionName(expr: t.JSXMemberExpression): string {
    const object = t.isJSXIdentifier(expr.object) ? expr.object.name : 'unknown';
    const property = expr.property.name;
    return `${object}.${property}`;
}

function extractJSXAttributes(opening: t.JSXOpeningElement): Record<string, any> {
    const attributes: Record<string, any> = {};

    opening.attributes.forEach((attr) => {
        if (t.isJSXAttribute(attr) && t.isJSXIdentifier(attr.name)) {
            const name = attr.name.name;
            attributes[name] = attr.value ? extractAttributeValue(attr.value) : true;
        }
    });

    return attributes;
}

function extractAttributeValue(value: t.JSXAttribute['value']): any {
    if (t.isStringLiteral(value)) {
        return value.value;
    }
    if (t.isJSXExpressionContainer(value) && t.isExpression(value.expression)) {
        return 'expression';
    }
    return 'unknown';
}

function extractDefaultValue(node: t.Expression): any {
    if (t.isStringLiteral(node)) {
        return node.value;
    }
    if (t.isNumericLiteral(node)) {
        return node.value;
    }
    if (t.isBooleanLiteral(node)) {
        return node.value;
    }
    return undefined;
}

function getNodeSource(node: t.Node, code: string): string {
    if (node.start !== null && node.end !== null && node.start !== undefined && node.end !== undefined) {
        return code.substring(node.start, node.end);
    }
    return '';
}

function getNodeLocation(node: t.Node, filePath: string) {
    return {
        file: filePath,
        startLine: node.loc?.start.line ?? 0,
        endLine: node.loc?.end.line ?? 0,
        startColumn: node.loc?.start.column ?? 0,
        endColumn: node.loc?.end.column ?? 0,
    };
}

function calculateComplexity(node: t.Node): number {
    let complexity = 1;

    traverse(
        node,
        {
            IfStatement() {
                complexity++;
            },
            ForStatement() {
                complexity++;
            },
            WhileStatement() {
                complexity++;
            },
            ConditionalExpression() {
                complexity++;
            },
            LogicalExpression() {
                complexity++;
            },
        },
        node as any
    );

    return complexity;
}
