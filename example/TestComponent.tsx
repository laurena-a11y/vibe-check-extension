import React from 'react';

interface ButtonProps {
    label: string;
    onClick?: () => void;
    variant?: 'primary' | 'secondary';
    disabled?: boolean;
}

export function CustomButton({ label, onClick, variant = 'primary', disabled = false }: ButtonProps) {
    return (
        <button
            className={`btn btn-${variant}`}
            onClick={onClick}
            disabled={disabled}
            type="button"
        >
            {label}
        </button>
    );
}

interface CardProps {
    title: string;
    description?: string;
    imageUrl?: string;
    children?: React.ReactNode;
}

export function Card({ title, description, imageUrl, children }: CardProps) {
    return (
        <div className="card">
            {imageUrl && (
                <div className="card-image">
                    <img src={imageUrl} alt={title} />
                </div>
            )}
            <div className="card-content">
                <h3 className="card-title">{title}</h3>
                {description && <p className="card-description">{description}</p>}
                {children}
            </div>
        </div>
    );
}

export function InputField({ label, value, onChange, placeholder }: any) {
    return (
        <div className="input-group">
            <label className="input-label">{label}</label>
            <input
                type="text"
                className="input-field"
                value={value}
                onChange={onChange}
                placeholder={placeholder}
            />
        </div>
    );
}
