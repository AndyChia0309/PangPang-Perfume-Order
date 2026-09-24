import { Fragment } from "react";

const quantityOptions = ["0", "1", "2", "3", "other"];

// 5 個選項等寬排成一列、寬度不足時一起縮小，避免「其他」輸入框被擠到下一行
const slotClassName = "min-w-0 max-w-16 flex-1";

const optionClassName =
  `${slotClassName} inline-flex min-h-control cursor-pointer items-center justify-center rounded-field border border-line bg-white px-2 py-3 text-body leading-normal text-ink transition-colors duration-200 has-checked:border-brand has-checked:bg-brand has-checked:text-white has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-brand`;

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

      <div className="flex gap-2">
        {quantityOptions.map((option) => {
          const radio = (
            <input
              className="sr-only"
              type="radio"
              name={fieldName}
              value={option}
              checked={value === option}
              onChange={(event) => onChange(event.target.value)}
            />
          );

          // 選了「其他」時，按鈕本身直接變成數量輸入框
          if (option === "other" && value === "other") {
            return (
              <Fragment key={option}>
                {radio}
                <input
                  className={`${slotClassName} field border-brand px-2 text-center [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none`}
                  type="number"
                  name={otherFieldName}
                  inputMode="numeric"
                  min="1"
                  max="99"
                  step="1"
                  placeholder="數量"
                  aria-label="其他數量"
                  required
                  autoFocus
                />
              </Fragment>
            );
          }

          return (
            <label key={option} className={optionClassName}>
              {radio}
              {option === "other" ? "其他" : option}
            </label>
          );
        })}
      </div>
    </div>
  );
}

export default QuantitySelector;
