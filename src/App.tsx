import { useMemo, useState } from "react";
import { Link, Route, Routes, useParams, useSearchParams } from "react-router-dom";
import {
  categories,
  filterPieces,
  formatPrice,
  glazes,
  pieces,
  priceBands,
  toggleCompare,
  type CatalogQuery,
  type Category,
  type Glaze,
  type Piece,
  type PriceBand,
} from "./model";

function readQuery(params: URLSearchParams): CatalogQuery {
  const category = params.get("category");
  const glaze = params.get("glaze");
  const price = params.get("price");
  return {
    q: params.get("q") ?? "",
    category: categories.includes(category as Category) ? (category as Category) : "все",
    glaze: glazes.includes(glaze as Glaze) ? (glaze as Glaze) : "все",
    price: priceBands.includes(price as PriceBand) ? (price as PriceBand) : "все",
    stock: params.get("stock") === "1",
  };
}

function readCompare(params: URLSearchParams) {
  return (params.get("compare") ?? "").split(",").filter((id) => pieces.some((piece) => piece.id === id));
}

function useCatalogParams() {
  const [params, setParams] = useSearchParams();
  const query = readQuery(params);
  const compare = readCompare(params);

  function patch(next: Record<string, string | null>) {
    const updated = new URLSearchParams(params);
    for (const [key, value] of Object.entries(next)) {
      if (!value) updated.delete(key);
      else updated.set(key, value);
    }
    setParams(updated, { replace: true });
  }

  function setCompare(ids: string[]) {
    patch({ compare: ids.length ? ids.join(",") : null });
  }

  return { params, query, compare, patch, setCompare };
}

export function App() {
  return (
    <Routes>
      <Route path="/" element={<Catalog />} />
      <Route path="/p/:id" element={<Detail />} />
    </Routes>
  );
}

function Catalog() {
  const { params, query, compare, patch, setCompare } = useCatalogParams();
  const [notice, setNotice] = useState("");
  const found = useMemo(() => filterPieces(pieces, query), [query]);

  function onCompare(id: string) {
    const result = toggleCompare(compare, id);
    setCompare(result.selected);
    setNotice(result.rejected ? "В сравнении не больше трёх позиций." : "");
  }

  return (
    <div className="shop">
      <header className="top">
        <div>
          <p className="mark">Pole</p>
          <p className="sub">Мастерская посуды. Каталог, не витрина-одностраничник.</p>
        </div>
        <input
          value={query.q}
          placeholder="Название или глазурь"
          onChange={(event) => patch({ q: event.target.value || null })}
        />
      </header>
      <div className="layout">
        <aside>
          <Facet
            title="форма"
            value={query.category}
            options={["все", ...categories]}
            onChange={(value) => patch({ category: value === "все" ? null : value })}
          />
          <Facet
            title="глазурь"
            value={query.glaze}
            options={["все", ...glazes]}
            onChange={(value) => patch({ glaze: value === "все" ? null : value })}
          />
          <Facet
            title="цена"
            value={query.price}
            options={["все", ...priceBands]}
            onChange={(value) => patch({ price: value === "все" ? null : value })}
          />
          <label className="stock">
            <input
              type="checkbox"
              checked={query.stock}
              onChange={(event) => patch({ stock: event.target.checked ? "1" : null })}
            />
            только в наличии
          </label>
        </aside>
        <section>
          <p className="count">
            {found.length} из {pieces.length}
            {notice ? <span className="notice">{notice}</span> : null}
          </p>
          {found.length === 0 && <p className="empty">Такого сочетания нет. Снимите один фильтр.</p>}
          <div className="grid">
            {found.map((piece) => (
              <article key={piece.id} className="card">
                <Link to={{ pathname: `/p/${piece.id}`, search: params.toString() }}>
                  <span className={`swatch glaze-${piece.glaze}`} />
                  <h2>{piece.name}</h2>
                  <p>
                    {piece.category} · {piece.glaze}
                  </p>
                </Link>
                <footer>
                  <strong>{formatPrice(piece.price)}</strong>
                  <button type="button" onClick={() => onCompare(piece.id)}>
                    {compare.includes(piece.id) ? "убрать" : "сравнить"}
                  </button>
                </footer>
                {!piece.inStock && <em>под заказ {piece.leadDays} дн.</em>}
              </article>
            ))}
          </div>
        </section>
      </div>
      <CompareDock ids={compare} onRemove={(id) => setCompare(compare.filter((item) => item !== id))} />
    </div>
  );
}

function Detail() {
  const { id } = useParams();
  const { params, compare, setCompare } = useCatalogParams();
  const [notice, setNotice] = useState("");
  const piece = pieces.find((item) => item.id === id);
  if (!piece) return <p className="empty page">Такой позиции нет.</p>;

  function onCompare() {
    const result = toggleCompare(compare, piece!.id);
    setCompare(result.selected);
    setNotice(result.rejected ? "В сравнении не больше трёх позиций." : "");
  }

  return (
    <div className="page">
      <Link className="back" to={{ pathname: "/", search: params.toString() }}>
        ← в каталог
      </Link>
      <div className="detail">
        <span className={`swatch big glaze-${piece.glaze}`} />
        <div>
          <p className="sub">
            {piece.category} · глазурь «{piece.glaze}»
          </p>
          <h1>{piece.name}</h1>
          <p className="lead">{piece.note}</p>
          <dl>
            <div><dt>диаметр</dt><dd>{piece.diameter} см</dd></div>
            <div><dt>высота</dt><dd>{piece.height} см</dd></div>
            <div><dt>срок</dt><dd>{piece.inStock ? "на складе" : `${piece.leadDays} дней`}</dd></div>
            <div><dt>цена</dt><dd>{formatPrice(piece.price)}</dd></div>
          </dl>
          <button type="button" className="solid" onClick={onCompare}>
            {compare.includes(piece.id) ? "Убрать из сравнения" : "Добавить к сравнению"}
          </button>
          {notice && <p className="notice">{notice}</p>}
        </div>
      </div>
      <CompareDock ids={compare} onRemove={(item) => setCompare(compare.filter((value) => value !== item))} />
    </div>
  );
}

function Facet({
  title,
  value,
  options,
  onChange,
}: {
  title: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <fieldset>
      <legend>{title}</legend>
      {options.map((option) => (
        <label key={option}>
          <input
            type="radio"
            name={title}
            checked={value === option}
            onChange={() => onChange(option)}
          />
          {option}
        </label>
      ))}
    </fieldset>
  );
}

function CompareDock({ ids, onRemove }: { ids: string[]; onRemove: (id: string) => void }) {
  if (!ids.length) return null;
  const rows = ids
    .map((id) => pieces.find((piece) => piece.id === id))
    .filter((piece): piece is Piece => Boolean(piece));
  const specs: Array<[string, (piece: Piece) => string]> = [
    ["цена", (piece) => formatPrice(piece.price)],
    ["глазурь", (piece) => piece.glaze],
    ["диаметр", (piece) => `${piece.diameter} см`],
    ["срок", (piece) => (piece.inStock ? "склад" : `${piece.leadDays} дн.`)],
  ];
  return (
    <section className="dock">
      <table>
        <thead>
          <tr>
            <th />
            {rows.map((piece) => (
              <th key={piece.id}>
                {piece.name}
                <button type="button" onClick={() => onRemove(piece.id)}>
                  убрать
                </button>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {specs.map(([label, read]) => (
            <tr key={label}>
              <th>{label}</th>
              {rows.map((piece) => (
                <td key={piece.id}>{read(piece)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
