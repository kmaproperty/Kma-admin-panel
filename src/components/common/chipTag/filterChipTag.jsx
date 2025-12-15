export default function FilterChipTag({
  isIcon = false,
  checked,
  label,
  value,
  iconSrc,
  containerStyle = "",
  iconStyle = "",
  labelStyle = "",
  onChagne,
}) {
  return (
    <button
      key={value}
      className={`h-[35px] flex items-center py-[5px] px-[10px] cursor-pointer border border-border rounded-[5px]
            ${checked ? "bg-blue" : "bg-transparent"}
           ${containerStyle}`}
      onClick={() => onChagne("")}
    >
      {isIcon && (
        <img
          alt=""
          src={iconSrc}
          width={20}
          height={20}
          className={iconStyle}
        />
      )}

      <span
        className={`text-[14px] leading-[24px] ${
          checked ? "text-white" : "text-text-gray"
        } ${labelStyle}`}
      >
        {label}
      </span>
    </button>
  );
}
