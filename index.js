import barcodes from 'jsbarcode/src/barcodes';
import { linearizeEncodings, merge } from './shared';

// Este encode() lida com a chamada do Encoder e constrói a string binária a ser renderizada
const encode = (text, Encoder, options) => {
  // Se o texto não for uma string não vazia, gera erro.
  if (typeof text !== 'string' || text.length === 0) {
    throw new Error('Barcode value must be a non-empty string');
  }

  let encoder;
  try {
    encoder = new Encoder(text, options);
  } catch (error) {
    // Se o codificador não puder ser instanciado, gerará erro.
    throw new Error('Invalid barcode format.');
  }

  // Se a entrada não for válida para o codificador, gera erro.
  if (!encoder.valid()) {
    throw new Error('Invalid barcode for selected format.');
  }

  // Faz uma solicitação dos dados binários (e outras informações) que devem ser renderizados
  // a estrutura codificada é {
  // texto: 'texto de amostra',
  // dados: '110100100001....',
  // opções: {...}
  // }
  const encoded = encoder.encode();

  // As codificações podem ser aninhadas como [[1-1, 1-2], 2, [3-1, 3-2]
  // Converte para [1-1, 1-2, 2, 3-1, 3-2]
  const linearEncodings = linearizeEncodings(encoded);

  // Mesclar
  for (let i = 0; i < linearEncodings.length; i++) {
    // linearEncodings[i].key = `bar-group-encoding-${i}`;
    linearEncodings[i].options = merge(options, linearEncodings[i].options);
  }

  return linearEncodings;
};

const drawRect = (x, y, rectWidth, height) => `M${x},${y}h${rectWidth}v${height}h-${rectWidth}z`;

const drawSvgBar = (encoding, paddingLeft = 0, options = {}) => {
  const rects = [];
  //dados binários do código de barras
  const binary = encoding.data;

  let singleBarWidth = options.singleBarWidth ? options.singleBarWidth : 2
  let height = options.height ? options.height : 100
  let barWidth = 0;
  let x = 0;
  const yFrom = 0;

  for (let b = 0; b < binary.length; b++) {
    x = b * singleBarWidth + paddingLeft;
    if (binary[b] === '1') {
      // eslint-disable-next-line no-plusplus
      barWidth++;
    } else if (barWidth > 0) {
      rects[rects.length] = drawRect(
        x - singleBarWidth * barWidth,
        yFrom,
        singleBarWidth * barWidth,
        height,
      );
      barWidth = 0;
    }
  }

  //É necessário o último sorteio já que o código de barras termina com 1
  if (barWidth > 0) {
    rects[rects.length] = drawRect(
      x - 2 * (barWidth - 1),
      yFrom,
      2 * barWidth,
      100,
    );
  }
  return rects;
};

const drawSvgBars = (encodings, options = {}) => {
  const results = [];
  let barPaddingLeft = 0;

  Array.from(encodings).forEach((encoding) => {
    const bar = drawSvgBar(encoding, barPaddingLeft, options);
    results.push(bar);
    barPaddingLeft += encoding.data.length * 2;
  });
  return results.flat();
};

export default function BarcodeGerarSVG(props) {
  const { value, format, singleBarWidth, maxWidth, height, } = props;

  const encoder = barcodes[format];
  const linearEncodings = encode(value, encoder, props);
  const theBars = drawSvgBars(linearEncodings, props);

  if (linearEncodings.length > 0) {

    return theBars.join(' ')

  }
}



