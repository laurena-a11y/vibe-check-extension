import { ParsedComponent, DesignSystemComponent, MatchResult, Difference } from '../models';
import { generateId } from '../utils/helpers';

export class StructuralMatcher {
    private threshold: number;

    constructor(threshold: number = 70) {
        this.threshold = threshold;
    }

    match(
        userComponents: ParsedComponent[],
        designSystemComponents: DesignSystemComponent[]
    ): MatchResult[] {
        const results: MatchResult[] = [];

        for (const userComp of userComponents) {
            for (const dsComp of designSystemComponents) {
                const score = this.calculateStructuralSimilarity(userComp, dsComp);

                if (score >= this.threshold) {
                    const matchResult = this.createMatchResult(userComp, dsComp, score);
                    results.push(matchResult);
                }
            }
        }

        // Sort by combined score (descending)
        results.sort((a, b) => b.scores.combined - a.scores.combined);

        return results;
    }

    calculateStructuralSimilarity(
        userComp: ParsedComponent,
        dsComp: DesignSystemComponent
    ): number {
        let score = 0;
        let totalWeight = 0;

        // 1. Name similarity (20% weight)
        const nameScore = this.compareNames(userComp.name, dsComp.name);
        score += nameScore * 20;
        totalWeight += 20;

        // 2. Element type similarity (40% weight)
        const elementScore = this.compareElementTypes(
            userComp.jsxStructure,
            dsComp.structure.elementTypes
        );
        score += elementScore * 40;
        totalWeight += 40;

        // 3. Props similarity (30% weight)
        const propsScore = this.compareProps(userComp.props, dsComp.structure.propPatterns);
        score += propsScore * 30;
        totalWeight += 30;

        // 4. Complexity similarity (10% weight)
        const complexityScore = this.compareComplexity(
            userComp.complexity,
            this.estimateComplexity(dsComp)
        );
        score += complexityScore * 10;
        totalWeight += 10;

        return totalWeight > 0 ? score / totalWeight : 0;
    }

    private compareNames(name1: string, name2: string): number {
        const n1 = name1.toLowerCase().replace(/[^a-z0-9]/g, '');
        const n2 = name2.toLowerCase().replace(/[^a-z0-9]/g, '');

        // Exact match
        if (n1 === n2) return 100;

        // Contains match
        if (n1.includes(n2) || n2.includes(n1)) return 80;

        // Levenshtein distance based similarity
        const distance = this.levenshteinDistance(n1, n2);
        const maxLength = Math.max(n1.length, n2.length);
        const similarity = maxLength > 0 ? (1 - distance / maxLength) * 100 : 0;

        return Math.max(0, similarity);
    }

    private compareElementTypes(jsx: any, dsElementTypes: string[]): number {
        const userElementTypes = this.extractElementTypes(jsx);

        if (userElementTypes.length === 0 || dsElementTypes.length === 0) {
            return 0;
        }

        // Calculate intersection
        const intersection = userElementTypes.filter((type) => dsElementTypes.includes(type));
        const union = new Set([...userElementTypes, ...dsElementTypes]);

        // Jaccard similarity
        return (intersection.length / union.size) * 100;
    }

    private extractElementTypes(jsx: any, types: string[] = []): string[] {
        if (!jsx) return types;

        if (jsx.name && !types.includes(jsx.name)) {
            types.push(jsx.name);
        }

        if (jsx.children && Array.isArray(jsx.children)) {
            for (const child of jsx.children) {
                this.extractElementTypes(child, types);
            }
        }

        return types;
    }

    private compareProps(
        userProps: any[],
        dsPropPatterns: string[]
    ): number {
        if (userProps.length === 0 && dsPropPatterns.length === 0) {
            return 100;
        }

        if (userProps.length === 0 || dsPropPatterns.length === 0) {
            return 0;
        }

        const userPropNames = userProps.map((p) => p.name.toLowerCase());
        const dsPatterns = dsPropPatterns.map((p) => p.toLowerCase());

        // Calculate intersection
        const matches = userPropNames.filter((name) =>
            dsPatterns.some((pattern) => name.includes(pattern) || pattern.includes(name))
        );

        return (matches.length / Math.max(userPropNames.length, dsPatterns.length)) * 100;
    }

    private compareComplexity(userComplexity: number, dsComplexity: number): number {
        if (userComplexity === 0 || dsComplexity === 0) {
            return 50;
        }

        const ratio = Math.min(userComplexity, dsComplexity) / Math.max(userComplexity, dsComplexity);
        return ratio * 100;
    }

    private estimateComplexity(dsComp: DesignSystemComponent): number {
        // Estimate complexity based on structure
        let complexity = 1;

        complexity += dsComp.structure.elementTypes.length;
        complexity += dsComp.structure.propPatterns.length;

        return complexity;
    }

    private levenshteinDistance(str1: string, str2: string): number {
        const matrix: number[][] = [];

        for (let i = 0; i <= str2.length; i++) {
            matrix[i] = [i];
        }

        for (let j = 0; j <= str1.length; j++) {
            matrix[0][j] = j;
        }

        for (let i = 1; i <= str2.length; i++) {
            for (let j = 1; j <= str1.length; j++) {
                if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
                    matrix[i][j] = matrix[i - 1][j - 1];
                } else {
                    matrix[i][j] = Math.min(
                        matrix[i - 1][j - 1] + 1,
                        matrix[i][j - 1] + 1,
                        matrix[i - 1][j] + 1
                    );
                }
            }
        }

        return matrix[str2.length][str1.length];
    }

    private createMatchResult(
        userComp: ParsedComponent,
        dsComp: DesignSystemComponent,
        structuralScore: number
    ): MatchResult {
        const confidence = this.determineConfidence(structuralScore);
        const matchReasons = this.generateMatchReasons(userComp, dsComp, structuralScore);
        const differences = this.identifyDifferences(userComp, dsComp);

        return {
            id: generateId(),
            userComponent: userComp,
            designSystemComponent: dsComp,
            scores: {
                structural: Math.round(structuralScore),
                semantic: 0,
                combined: Math.round(structuralScore),
            },
            matchReasons,
            differences,
            confidence,
        };
    }

    private determineConfidence(score: number): 'high' | 'medium' | 'low' {
        if (score >= 85) return 'high';
        if (score >= 70) return 'medium';
        return 'low';
    }

    private generateMatchReasons(
        userComp: ParsedComponent,
        dsComp: DesignSystemComponent,
        score: number
    ): string[] {
        const reasons: string[] = [];

        const nameScore = this.compareNames(userComp.name, dsComp.name);
        if (nameScore > 70) {
            reasons.push(`Similar component name: "${userComp.name}" ≈ "${dsComp.name}"`);
        }

        const userElementTypes = this.extractElementTypes(userComp.jsxStructure);
        const commonElements = userElementTypes.filter((type) =>
            dsComp.structure.elementTypes.includes(type)
        );
        if (commonElements.length > 0) {
            reasons.push(`Shared element types: ${commonElements.join(', ')}`);
        }

        if (score >= 85) {
            reasons.push('Very high structural similarity');
        } else if (score >= 70) {
            reasons.push('Moderate structural similarity');
        }

        return reasons;
    }

    private identifyDifferences(
        userComp: ParsedComponent,
        dsComp: DesignSystemComponent
    ): Difference[] {
        const differences: Difference[] = [];

        // Compare props
        const userPropNames = userComp.props.map((p) => p.name);
        const dsPropNames = dsComp.structure.propPatterns;

        const missingProps = dsPropNames.filter((dp) =>
            !userPropNames.some((up) => up.toLowerCase().includes(dp.toLowerCase()))
        );
        const extraProps = userPropNames.filter((up) =>
            !dsPropNames.some((dp) => up.toLowerCase().includes(dp.toLowerCase()))
        );

        if (missingProps.length > 0) {
            differences.push({
                type: 'prop',
                description: `Missing props from design system: ${missingProps.join(', ')}`,
                severity: 'moderate',
            });
        }

        if (extraProps.length > 0) {
            differences.push({
                type: 'prop',
                description: `Extra props not in design system: ${extraProps.join(', ')}`,
                severity: 'minor',
            });
        }

        // Compare structure
        const userElementTypes = this.extractElementTypes(userComp.jsxStructure);
        const differentElements = userElementTypes.filter(
            (type) => !dsComp.structure.elementTypes.includes(type)
        );

        if (differentElements.length > 0) {
            differences.push({
                type: 'structure',
                description: `Different HTML elements used: ${differentElements.join(', ')}`,
                severity: 'moderate',
            });
        }

        return differences;
    }
}
