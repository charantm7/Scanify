type TypeProps = 'text' | 'email' | 'password'

interface InputFormProps {
    type: TypeProps;
    value: string;
    placeholder?: string;
    onChange: (value: string) => void;
    error?: string;
    onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}

export function InputForm(
    {
        type = "text",
        value,
        placeholder,
        error,
        onChange,
        onKeyDown,
    }: InputFormProps
) {
    return (
        <input
            type={type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder={placeholder}
            className={`w-full pl-10 pr-4 py-3 bg-auth-input border rounded-xl outline-none transition-all ${error ? 'border-red-500' : 'border-theme'} focus:ring-2 focus:ring-[var(--accent)]`}
        />
    )
}