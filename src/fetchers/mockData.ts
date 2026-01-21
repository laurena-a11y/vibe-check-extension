import { DesignSystemComponent } from '../models';
import { generateId } from '../utils/helpers';

/**
 * Mock design system components based on Square's design style
 * Clean, modern, professional UI with rounded corners and bold CTAs
 */
export const squareStyleComponents: DesignSystemComponent[] = [
    {
        id: generateId(),
        name: 'Button',
        source: 'square-design-system',
        description: 'Primary action button with rounded corners and bold text',
        category: 'Button',
        tags: ['primary', 'cta', 'rounded'],
        structure: {
            elementTypes: ['button'],
            propPatterns: ['onClick', 'label', 'disabled', 'variant', 'size'],
            childrenPattern: 'text',
        },
        documentationUrl: 'https://squareup.com',
        codeExample: `<Button variant="primary" size="large" onClick={handleClick}>
  Get Started
</Button>`,
        usage: {
            imports: ['import { Button } from "@square/design-system"'],
            props: [
                { name: 'variant', type: 'string', required: false },
                { name: 'size', type: 'string', required: false },
                { name: 'onClick', type: 'function', required: false },
                { name: 'disabled', type: 'boolean', required: false },
            ],
            example: '<Button variant="primary">Click me</Button>',
        },
    },
    {
        id: generateId(),
        name: 'PrimaryButton',
        source: 'square-design-system',
        description: 'Bold primary button for main actions with high contrast',
        category: 'Button',
        tags: ['primary', 'action', 'emphasis'],
        structure: {
            elementTypes: ['button'],
            propPatterns: ['onClick', 'children', 'label', 'disabled'],
            childrenPattern: 'text',
        },
        documentationUrl: 'https://squareup.com',
        codeExample: `<PrimaryButton onClick={handleSubmit}>
  Sign Up
</PrimaryButton>`,
    },
    {
        id: generateId(),
        name: 'SecondaryButton',
        source: 'square-design-system',
        description: 'Secondary button for less prominent actions',
        category: 'Button',
        tags: ['secondary', 'outline', 'subtle'],
        structure: {
            elementTypes: ['button'],
            propPatterns: ['onClick', 'children', 'label'],
            childrenPattern: 'text',
        },
        documentationUrl: 'https://squareup.com',
        codeExample: `<SecondaryButton onClick={handleCancel}>
  Learn More
</SecondaryButton>`,
    },
    {
        id: generateId(),
        name: 'Card',
        source: 'square-design-system',
        description: 'Content card with subtle shadow and rounded corners',
        category: 'Card',
        tags: ['container', 'surface', 'elevation'],
        structure: {
            elementTypes: ['div', 'article'],
            propPatterns: ['title', 'description', 'children', 'image', 'imageUrl'],
            childrenPattern: 'mixed',
        },
        documentationUrl: 'https://squareup.com',
        codeExample: `<Card title="Point of Sale" description="Accept payments in person">
  <CardContent>...</CardContent>
</Card>`,
        usage: {
            imports: ['import { Card } from "@square/design-system"'],
            props: [
                { name: 'title', type: 'string', required: true },
                { name: 'description', type: 'string', required: false },
                { name: 'children', type: 'ReactNode', required: false },
            ],
            example: '<Card title="Feature">Content</Card>',
        },
    },
    {
        id: generateId(),
        name: 'FeatureCard',
        source: 'square-design-system',
        description: 'Card showcasing product features with icon and description',
        category: 'Card',
        tags: ['feature', 'icon', 'marketing'],
        structure: {
            elementTypes: ['div', 'article'],
            propPatterns: ['title', 'description', 'icon', 'image'],
            childrenPattern: 'structured',
        },
        documentationUrl: 'https://squareup.com',
        codeExample: `<FeatureCard
  icon="payments"
  title="Accept Payments"
  description="Take payments anywhere"
/>`,
    },
    {
        id: generateId(),
        name: 'Input',
        source: 'square-design-system',
        description: 'Text input field with label and validation states',
        category: 'Form',
        tags: ['input', 'form', 'text'],
        structure: {
            elementTypes: ['input', 'div', 'label'],
            propPatterns: ['value', 'onChange', 'label', 'placeholder', 'type', 'error'],
            childrenPattern: 'none',
        },
        documentationUrl: 'https://squareup.com',
        codeExample: `<Input
  label="Email address"
  type="email"
  placeholder="you@example.com"
  value={email}
  onChange={handleChange}
/>`,
        usage: {
            imports: ['import { Input } from "@square/design-system"'],
            props: [
                { name: 'label', type: 'string', required: true },
                { name: 'value', type: 'string', required: true },
                { name: 'onChange', type: 'function', required: true },
                { name: 'placeholder', type: 'string', required: false },
                { name: 'error', type: 'string', required: false },
            ],
            example: '<Input label="Name" value={name} onChange={setName} />',
        },
    },
    {
        id: generateId(),
        name: 'TextField',
        source: 'square-design-system',
        description: 'Single-line text input with label',
        category: 'Form',
        tags: ['input', 'text', 'form-field'],
        structure: {
            elementTypes: ['input', 'label', 'div'],
            propPatterns: ['value', 'onChange', 'label', 'placeholder'],
            childrenPattern: 'none',
        },
        documentationUrl: 'https://squareup.com',
        codeExample: `<TextField
  label="Business name"
  value={businessName}
  onChange={handleChange}
/>`,
    },
    {
        id: generateId(),
        name: 'InputField',
        source: 'square-design-system',
        description: 'Form input with label and helper text',
        category: 'Form',
        tags: ['input', 'form', 'field'],
        structure: {
            elementTypes: ['input', 'label', 'div'],
            propPatterns: ['label', 'value', 'onChange', 'placeholder', 'helperText'],
            childrenPattern: 'structured',
        },
        documentationUrl: 'https://squareup.com',
        codeExample: `<InputField
  label="Phone number"
  value={phone}
  onChange={handlePhoneChange}
  helperText="We'll send you a verification code"
/>`,
    },
    {
        id: generateId(),
        name: 'Hero',
        source: 'square-design-system',
        description: 'Large hero section with headline, description, and CTA',
        category: 'Layout',
        tags: ['hero', 'banner', 'marketing'],
        structure: {
            elementTypes: ['section', 'div', 'h1', 'p', 'button'],
            propPatterns: ['title', 'subtitle', 'description', 'cta', 'image'],
            childrenPattern: 'structured',
        },
        documentationUrl: 'https://squareup.com',
        codeExample: `<Hero
  title="Run your business with Square"
  subtitle="Everything you need to start selling"
  ctaText="Get Started"
  ctaLink="/signup"
/>`,
    },
    {
        id: generateId(),
        name: 'NavigationBar',
        source: 'square-design-system',
        description: 'Top navigation bar with logo and menu items',
        category: 'Navigation',
        tags: ['nav', 'header', 'menu'],
        structure: {
            elementTypes: ['nav', 'div', 'ul', 'li', 'a'],
            propPatterns: ['logo', 'items', 'links', 'children'],
            childrenPattern: 'structured',
        },
        documentationUrl: 'https://squareup.com',
        codeExample: `<NavigationBar
  logo={<Logo />}
  items={menuItems}
/>`,
    },
    {
        id: generateId(),
        name: 'Modal',
        source: 'square-design-system',
        description: 'Overlay modal dialog for important actions',
        category: 'Overlay',
        tags: ['modal', 'dialog', 'overlay'],
        structure: {
            elementTypes: ['div', 'dialog'],
            propPatterns: ['isOpen', 'onClose', 'title', 'children'],
            childrenPattern: 'mixed',
        },
        documentationUrl: 'https://squareup.com',
        codeExample: `<Modal
  isOpen={showModal}
  onClose={handleClose}
  title="Confirm Action"
>
  <ModalContent>...</ModalContent>
</Modal>`,
    },
    {
        id: generateId(),
        name: 'ProductCard',
        source: 'square-design-system',
        description: 'Card displaying product information with image and pricing',
        category: 'Card',
        tags: ['product', 'ecommerce', 'card'],
        structure: {
            elementTypes: ['div', 'img', 'h3', 'p'],
            propPatterns: ['title', 'price', 'image', 'description'],
            childrenPattern: 'structured',
        },
        documentationUrl: 'https://squareup.com',
        codeExample: `<ProductCard
  title="Square Terminal"
  price="$299"
  image="/terminal.jpg"
  description="All-in-one card machine"
/>`,
    },
    {
        id: generateId(),
        name: 'IconButton',
        source: 'square-design-system',
        description: 'Compact button with icon only',
        category: 'Button',
        tags: ['icon', 'button', 'compact'],
        structure: {
            elementTypes: ['button'],
            propPatterns: ['icon', 'onClick', 'ariaLabel', 'size'],
            childrenPattern: 'icon',
        },
        documentationUrl: 'https://squareup.com',
        codeExample: `<IconButton
  icon="menu"
  onClick={toggleMenu}
  ariaLabel="Open menu"
/>`,
    },
    {
        id: generateId(),
        name: 'Badge',
        source: 'square-design-system',
        description: 'Small label or status indicator',
        category: 'Display',
        tags: ['badge', 'label', 'status'],
        structure: {
            elementTypes: ['span', 'div'],
            propPatterns: ['text', 'variant', 'color', 'children'],
            childrenPattern: 'text',
        },
        documentationUrl: 'https://squareup.com',
        codeExample: `<Badge variant="success">Active</Badge>`,
    },
    {
        id: generateId(),
        name: 'Checkbox',
        source: 'square-design-system',
        description: 'Checkbox input with label',
        category: 'Form',
        tags: ['checkbox', 'form', 'input'],
        structure: {
            elementTypes: ['input', 'label', 'div'],
            propPatterns: ['checked', 'onChange', 'label', 'disabled'],
            childrenPattern: 'structured',
        },
        documentationUrl: 'https://squareup.com',
        codeExample: `<Checkbox
  label="I agree to the terms"
  checked={agreed}
  onChange={handleChange}
/>`,
    },
];
