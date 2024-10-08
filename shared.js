function merge(old, replaceObj) {
  return ({ ...old, ...replaceObj });
}

// As codificações podem ser aninhadas como [[1-1, 1-2], 2, [3-1, 3-2]
// Converte para [1-1, 1-2, 2, 3-1, 3-2]
function linearizeEncodings(encodings) {
  const linearEncodings = [];
  function nextLevel(encoded) {
    if (Array.isArray(encoded)) {
      for (let i = 0; i < encoded.length; i++) {
        nextLevel(encoded[i]);
      }
    } else {
      // eslint-disable-next-line no-param-reassign
      encoded.text = encoded.text || '';
      // eslint-disable-next-line no-param-reassign
      encoded.data = encoded.data || '';
      linearEncodings.push(encoded);
    }
  }
  nextLevel(encodings);

  return linearEncodings;
}

export {
  merge,
  linearizeEncodings,
};
