import { useEffect, useRef } from 'react';
import JsBarcode from 'jsbarcode';

export default function BarcodeGenerator({ value, width = 2, height = 50, fontSize = 14 }) {
  const svgRef = useRef(null);

  useEffect(() => {
    if (svgRef.current && value) {
      JsBarcode(svgRef.current, value, {
        format: 'CODE128',
        width,
        height,
        displayValue: true,
        fontSize,
        margin: 5,
        background: '#ffffff',
        lineColor: '#000000',
      });
    }
  }, [value, width, height, fontSize]);

  return <svg ref={svgRef} />;
}