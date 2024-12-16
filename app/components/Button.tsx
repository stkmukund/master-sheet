type ButtonProps = {
    name: string;
    type?: "button" | "submit" | "reset";
    disabled?: boolean;
};

export default function Button({ name, type = "button", disabled = false }: ButtonProps) {
    return (
        <button disabled={disabled} type={type} className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg px-5 py-2.5 focus:outline-none">{name}</button>
    )
}
