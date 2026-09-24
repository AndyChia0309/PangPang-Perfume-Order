import { productContent } from "../data/productContent";

function ProductInfo() {
  const { title, promotion, prices, notes } = productContent;

  return (
    <div>
      <h2 className="mb-4 text-heading font-semibold text-brand">
        {title}
      </h2>

      <div className="text-body text-ink-muted">
        <p>{promotion}</p>
        {prices.map((price) => (
          <p key={price}>{price}</p>
        ))}
      </div>

      <dl className="mt-5">
        {notes.map((note) => (
          <div key={note.name}>
            <dt className="text-body font-medium text-brand">{note.name}</dt>
            <dd className="text-body text-ink-muted">{note.description}</dd>
            <dd className="max-w-[34ch] break-words text-caption text-ink-subtle">
              {note.ingredients}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

export default ProductInfo;
