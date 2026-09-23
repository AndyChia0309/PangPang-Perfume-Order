const quantityOptions = ["0", "1", "2", "3"];

function QuantitySelector({
  title,
  fieldName,
  otherFieldName,
  value,
  onChange,
}) {
  return (
    <div className="quantity-selector">
      <p className="quantity-title">{title}</p>

      <div className="quantity-options">
        {quantityOptions.map((option) => (
          <label key={option}>
            <input
              type="radio"
              name={fieldName}
              value={option}
              checked={value === option}
              onChange={(event) => onChange(event.target.value)}
            />
            {option}
          </label>
        ))}

        <label>
          <input
            type="radio"
            name={fieldName}
            value="other"
            checked={value === "other"}
            onChange={(event) => onChange(event.target.value)}
          />
          其他
        </label>

        {value === "other" && (
          <input
            className="other-quantity-input"
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
