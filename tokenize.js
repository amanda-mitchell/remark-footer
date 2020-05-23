const prefix = '^^';

function tokenizeFooter(eat, value, silent) {
  if (!value.startsWith(prefix)) {
    return;
  }

  if (silent) {
    return true;
  }

  const footerStartIndex = skipWhitespace(value, prefix.length);
  const blockEnd = findBlockEnd(value, footerStartIndex, eat, this);

  const now = eat.now();

  return eat(value.substr(0, blockEnd))({
    type: 'footer',
    data: { hName: 'footer' },
    children: this.tokenizeInline(
      stripLinePrefixes(
        value.substr(footerStartIndex, blockEnd - footerStartIndex)
      ),
      now
    ),
  });
}

function stripLinePrefixes(str) {
  const components = [];

  let newLineIndex = str.indexOf('\n');
  let currentPosition = 0;
  while (newLineIndex !== -1) {
    const nextIndex = newLineIndex + 1;

    let skipLength = 0;
    if (str.startsWith(prefix, nextIndex)) {
      skipLength += prefix.length;
    }

    skipLength = skipWhitespace(str, nextIndex + skipLength) - nextIndex;

    if (skipLength !== 0) {
      components.push(str.substr(currentPosition, nextIndex - currentPosition));
      currentPosition = nextIndex + skipLength;
    }

    newLineIndex = str.indexOf('\n', nextIndex);
  }

  if (components.length === 0) {
    return str;
  }

  components.push(str.substr(currentPosition));

  return components.join('');
}

function skipWhitespace(str, index) {
  let firstNonWhitespaceIndex = index;

  let charAt = str.charAt(firstNonWhitespaceIndex);
  while (charAt == ' ' || charAt == '\t') {
    firstNonWhitespaceIndex++;
    charAt = str.charAt(firstNonWhitespaceIndex);
  }

  return firstNonWhitespaceIndex;
}

function findBlockEnd(str, index, eat, context) {
  let endIndex = str.indexOf('\n', index);
  const { interruptFooter, blockTokenizers } = context;

  function shouldBlockStartAtIndex(blockName, startIndex) {
    return blockTokenizers[blockName].apply(context, [
      eat,
      str.substr(startIndex),
      true,
    ]);
  }

  while (endIndex !== -1) {
    const nextIndex = endIndex + 1;
    if (str.length == nextIndex || str.charAt(nextIndex) == '\n') {
      return endIndex;
    }

    for (const interruptor of interruptFooter) {
      if (shouldBlockStartAtIndex(interruptor[0], nextIndex)) {
        return endIndex;
      }
    }

    endIndex = str.indexOf('\n', endIndex + 1);
  }

  return str.length;
}

module.exports.tokenizeFooter = tokenizeFooter;
