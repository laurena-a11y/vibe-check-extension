"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomButton = CustomButton;
exports.Card = Card;
exports.InputField = InputField;
const react_1 = __importDefault(require("react"));
function CustomButton({ label, onClick, variant = 'primary', disabled = false }) {
    return (<button className={`btn btn-${variant}`} onClick={onClick} disabled={disabled} type="button">
            {label}
        </button>);
}
function Card({ title, description, imageUrl, children }) {
    return (<div className="card">
            {imageUrl && (<div className="card-image">
                    <img src={imageUrl} alt={title}/>
                </div>)}
            <div className="card-content">
                <h3 className="card-title">{title}</h3>
                {description && <p className="card-description">{description}</p>}
                {children}
            </div>
        </div>);
}
function InputField({ label, value, onChange, placeholder }) {
    return (<div className="input-group">
            <label className="input-label">{label}</label>
            <input type="text" className="input-field" value={value} onChange={onChange} placeholder={placeholder}/>
        </div>);
}
//# sourceMappingURL=TestComponent.js.map