export default function FieldLabel({label, customClass = '', required = false}){
    return(
        <p className={`text-text-black font-medium text-sm ${required ? 'required-label' : ''} ${customClass}`}>{label}</p>
    )
}