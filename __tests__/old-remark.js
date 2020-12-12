const unified = require('unified');
const markdown = require('remark-parse-version-8');
const html = require('remark-html');
const build = require('unist-builder');
const { footers } = require('..');
const { tokenizeFooter } = require('../tokenize');

test('it sets up the new tokenizer', () => {
  function tokenizeParagraph() {}

  function Parser() {}
  Parser.prototype.blockTokenizers = { paragraph: tokenizeParagraph };
  Parser.prototype.blockMethods = ['a', 'b', 'paragraph', 'c'];
  Parser.prototype.interruptParagraph = [['a']];

  const context = {
    footers,
    Parser,
  };

  context.footers();

  expect(Parser.prototype.blockTokenizers).toEqual({
    paragraph: tokenizeParagraph,
    footer: tokenizeFooter,
  });

  expect(Parser.prototype.blockMethods).toEqual([
    'a',
    'b',
    'footer',
    'paragraph',
    'c',
  ]);

  expect(Parser.prototype.interruptFooter).toEqual([['a']]);
  expect(Parser.prototype.interruptParagraph).toEqual([['a'], ['footer']]);
});

describe('integration tests', () => {
  function nullCompiler() {
    this.Compiler = tree => tree;
  }

  function createProcessor() {
    return unified().use(markdown).use(footers).use(nullCompiler).freeze();
  }

  test('it parses a footer element', async () => {
    const processor = createProcessor();

    const { result } = await processor.process('^^ Just a footer.');

    expect(result).toMatchObject(
      build('root', [build('footer', [build('text', 'Just a footer.')])])
    );
  });

  test('it parses a multiline footer element', async () => {
    const processor = createProcessor();

    const { result } = await processor.process(
      '^^ Just a footer.\n^^ With a second line.'
    );

    expect(result).toMatchObject(
      build('root', [
        build('footer', [build('text', 'Just a footer.\nWith a second line.')]),
      ])
    );
  });

  test('it parses a footer within a blockquote', async () => {
    const processor = createProcessor();

    const { result } = await processor.process(`
> Inspiring quotation
>
> ^^ Source`);

    expect(result).toMatchObject(
      build('root', [
        build('blockquote', [
          build('paragraph', [build('text', 'Inspiring quotation')]),
          build('footer', [build('text', 'Source')]),
        ]),
      ])
    );
  });

  test('it allows the footer to interrupt the paragraph', async () => {
    const processor = createProcessor();

    const { result } = await processor.process(`
> Inspiring quotation
> ^^ Source`);

    expect(result).toMatchObject(
      build('root', [
        build('blockquote', [
          build('paragraph', [build('text', 'Inspiring quotation')]),
          build('footer', [build('text', 'Source')]),
        ]),
      ])
    );
  });

  test('it allows an immediately trailing bulleted list', async () => {
    const processor = createProcessor();

    const { result } = await processor.process(`
^^ Footer content
* A bullet`);

    expect(result).toMatchObject(
      build('root', [
        build('footer', [build('text', 'Footer content')]),
        build('list', { ordered: false }, [
          build('listItem', [build('paragraph', [build('text', 'A bullet')])]),
        ]),
      ])
    );
  });
});

describe('html generation integration tests', () => {
  function createProcessor() {
    return unified().use(markdown).use(footers).use(html).freeze();
  }

  test('it generates the correct html element', async () => {
    const processor = createProcessor();

    const { contents } = await processor.process('^^ A footer');

    expect(contents).toEqual('<footer>A footer</footer>\n');
  });
});
