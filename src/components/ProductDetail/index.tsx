import { useParams } from "react-router-dom";

export default function ProductDetail() {
  const { id } = useParams();
  return (
    <div style={{ padding: "2rem" }}>
      <h1>Detalle del Producto</h1>
      <p>ID del producto: {id}</p>
    </div>
  );
}
