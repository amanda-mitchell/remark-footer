import { unified } from 'unified';
import markdown from 'remark-parse';
import html from 'remark-html';
import { u as build } from 'unist-builder';
import { footers } from '../index.js';
import { defaultSchema } from 'hast-util-sanitize';

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
      build('root', [
        build('footer', [
          build('paragraph', [build('text', 'Just a footer.')]),
        ]),
      ]),
    );
  });

  test('it parses a multiline footer element', async () => {
    const processor = createProcessor();

    const { result } = await processor.process(
      '^^ Just a footer.\n^^ With a second line.',
    );

    expect(result).toMatchObject(
      build('root', [
        build('footer', [
          build('paragraph', [
            build('text', 'Just a footer.\nWith a second line.'),
          ]),
        ]),
      ]),
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
          build('footer', [build('paragraph', [build('text', 'Source')])]),
        ]),
      ]),
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
          build('footer', [build('paragraph', [build('text', 'Source')])]),
        ]),
      ]),
    );
  });

  test('it allows an immediately trailing bulleted list', async () => {
    const processor = createProcessor();

    const { result } = await processor.process(`
^^ Footer content
* A bullet`);

    expect(result).toMatchObject(
      build('root', [
        build('footer', [
          build('paragraph', [build('text', 'Footer content')]),
        ]),
        build('list', { ordered: false }, [
          build('listItem', [build('paragraph', [build('text', 'A bullet')])]),
        ]),
      ]),
    );
  });
});

describe('html generation integration tests', () => {
  function createProcessor() {
    return unified()
      .use(markdown)
      .use(footers)
      .use(html, {
        sanitize: {
          ...defaultSchema,
          tagNames: [...defaultSchema.tagNames, 'footer'],
        },
      })
      .freeze();
  }

  test('it generates the correct html element', async () => {
    const processor = createProcessor();

    const { value } = await processor.process('^^ A footer');

    expect(value).toEqual('<footer><p>A footer</p></footer>\n');
  });
});
