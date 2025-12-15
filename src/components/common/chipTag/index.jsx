export default function ChipTag({
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
      className={`h-[40px] flex items-center py-[10px] px-5 cursor-pointer border border-border rounded-full
        ${checked ? "bg-light-purple" : "bg-transparent"}
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
        className={`text-sm leading-[24px] ${
          checked ? "font-medium" : ""
        } ${labelStyle}`}
      >
        {label}
      </span>
    </button>
  );
}
