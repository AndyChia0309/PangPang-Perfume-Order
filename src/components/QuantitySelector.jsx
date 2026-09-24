const quantityOptions = ["0", "1", "2", "3", "other"];

const optionClassName =
  "inline-flex min-h-control min-w-control cursor-pointer items-center justify-center rounded-md border border-line bg-white px-3.5 py-3 text-body leading-normal text-ink transition-colors duration-200 has-checked:border-brand has-checked:bg-brand has-checked:text-white has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-brand";

function QuantitySelector({
  title,
  fieldName,
  otherFieldName,
  value,
  onChange,
}) {
  return (
    <div className="flex flex-col gap-2">
      <p className="field-label">{title}</p>

      <div className="flex flex-wrap gap-2">
        {quantityOptions.map((option) => (
          <label key={option} className={optionClassName}>
            <input
              className="sr-only"
              type="radio"
              name={fieldName}
              value={option}
              checked={value === option}
              onChange={(event) => onChange(event.target.value)}
            />
            {option === "other" ? "其他" : option}
          </label>
        ))}

        {value === "other" && (
          <input
            className="field w-[88px] px-3"
            type="number"
            name={otherFieldName}
            inputMode="numeric"
            min="1"
            max="99"
            step="1"
            placeholder="數量"
            required
          />
        )}
      </div>
    </div>
  );
}

export default QuantitySelector;
