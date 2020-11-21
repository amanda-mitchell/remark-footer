const { tokenizeFooter } = require('../tokenize');

function tokenizeWithContext(
  eat,
  value,
  silent,
  tokenizeInline = () => [],
  interruptFooter = [],
  tokenizers = {}
) {
  const context = {
    tokenizeFooter,
    tokenizeInline,
    interruptFooter,
    tokenizers,
  };

  return context.tokenizeFooter(eat, value, silent);
}

test('it skips lines that do not have the prefix.', () => {
  const eat = jest.fn(() => node => node);

  const result = tokenizeWithContext(eat, 'A normal paragraph.', false);

  expect(result).toBeFalsy();
  expect(eat.mock.calls.length).toEqual(0);
});

test('it eats a line that begins with ^^', () => {
  const eat = jest.fn(() => node => node);
  const nowResult = Symbol();
  eat.now = () => nowResult;

  const tokenizeInlineResult = Symbol();
  const tokenizeInline = jest.fn(() => tokenizeInlineResult);

  const result = tokenizeWithContext(eat, '^^A footer.', false, tokenizeInline);
  expect(result).toEqual({
    type: 'footer',
    data: { hName: 'footer' },
    children: tokenizeInlineResult,
  });

  expect(eat.mock.calls).toEqual([['^^A footer.']]);
  expect(tokenizeInline.mock.calls).toEqual([['A footer.', nowResult]]);
});

test('it skips spaces and tabs after ^^', () => {
  const eat = jest.fn(() => node => node);
  const nowResult = Symbol();
  eat.now = () => nowResult;

  const tokenizeInlineResult = Symbol();
  const tokenizeInline = jest.fn(() => tokenizeInlineResult);

  const result = tokenizeWithContext(
    eat,
    '^^ \tA footer.',
    false,
    tokenizeInline
  );
  expect(result).toEqual({
    type: 'footer',
    data: { hName: 'footer' },
    children: tokenizeInlineResult,
  });

  expect(eat.mock.calls).toEqual([['^^ \tA footer.']]);
  expect(tokenizeInline.mock.calls).toEqual([['A footer.', nowResult]]);
});

test('it does not consume a trailing newline.', () => {
  const eat = jest.fn(() => node => node);
  const nowResult = Symbol();
  eat.now = () => nowResult;

  const tokenizeInlineResult = Symbol();
  const tokenizeInline = jest.fn(() => tokenizeInlineResult);

  const result = tokenizeWithContext(
    eat,
    '^^A footer.\n',
    false,
    tokenizeInline
  );
  expect(result).toEqual({
    type: 'footer',
    data: { hName: 'footer' },
    children: tokenizeInlineResult,
  });

  expect(eat.mock.calls).toEqual([['^^A footer.']]);
  expect(tokenizeInline.mock.calls).toEqual([['A footer.', nowResult]]);
});

test('it consumes multiple lines.', () => {
  const eat = jest.fn(() => node => node);
  const nowResult = Symbol();
  eat.now = () => nowResult;

  const tokenizeInlineResult = Symbol();
  const tokenizeInline = jest.fn(() => tokenizeInlineResult);

  const result = tokenizeWithContext(
    eat,
    '^^A footer.\nExtra footer content.\nA third line.',
    false,
    tokenizeInline
  );
  expect(result).toEqual({
    type: 'footer',
    data: { hName: 'footer' },
    children: tokenizeInlineResult,
  });

  expect(eat.mock.calls).toEqual([
    ['^^A footer.\nExtra footer content.\nA third line.'],
  ]);
  expect(tokenizeInline.mock.calls).toEqual([
    ['A footer.\nExtra footer content.\nA third line.', nowResult],
  ]);
});

test('it stops at multiple newlines.', () => {
  const eat = jest.fn(() => node => node);
  const nowResult = Symbol();
  eat.now = () => nowResult;

  const tokenizeInlineResult = Symbol();
  const tokenizeInline = jest.fn(() => tokenizeInlineResult);

  const result = tokenizeWithContext(
    eat,
    '^^A footer.\n\nPost footer content.\nA third line.',
    false,
    tokenizeInline
  );
  expect(result).toEqual({
    type: 'footer',
    data: { hName: 'footer' },
    children: tokenizeInlineResult,
  });

  expect(eat.mock.calls).toEqual([['^^A footer.']]);
  expect(tokenizeInline.mock.calls).toEqual([['A footer.', nowResult]]);
});

test('it strips prefixes from trailing lines.', () => {
  const eat = jest.fn(() => node => node);
  const nowResult = Symbol();
  eat.now = () => nowResult;

  const tokenizeInlineResult = Symbol();
  const tokenizeInline = jest.fn(() => tokenizeInlineResult);

  const result = tokenizeWithContext(
    eat,
    '^^A footer.\n^^Line two\n^^ Line three\n  Line four',
    false,
    tokenizeInline
  );
  expect(result).toEqual({
    type: 'footer',
    data: { hName: 'footer' },
    children: tokenizeInlineResult,
  });

  expect(eat.mock.calls).toEqual([
    ['^^A footer.\n^^Line two\n^^ Line three\n  Line four'],
  ]);
  expect(tokenizeInline.mock.calls).toEqual([
    ['A footer.\nLine two\nLine three\nLine four', nowResult],
  ]);
});

test('it returns true when silent.', () => {
  const eat = jest.fn(() => node => node);
  const nowResult = Symbol();
  eat.now = () => nowResult;

  const tokenizeInlineResult = Symbol();
  const tokenizeInline = jest.fn(() => tokenizeInlineResult);

  const result = tokenizeWithContext(
    eat,
    '^^A footer.\n^^Line two\n^^ Line three\n  Line four',
    true,
    tokenizeInline
  );
  expect(result).toStrictEqual(true);

  expect(eat.mock.calls).toEqual([]);
  expect(tokenizeInline.mock.calls).toEqual([]);
});
