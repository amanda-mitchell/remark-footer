const { tokenizeFooter } = require('./tokenize');
const syntax = require('@amanda-mitchell/micromark-extension-footer');

const fromMarkdown = {
  enter: {
    footer(token) {
      this.enter(
        { type: 'footer', data: { hName: 'footer' }, children: [] },
        token
      );
    },
  },
  exit: {
    footer(token) {
      this.exit(token);
    },
  },
};

function footers() {
  const Parser = this.Parser;

  const interruptParagraph = Parser.prototype.interruptParagraph;
  if (interruptParagraph) {
    // Support for remark-parse 8.0.2

    Parser.prototype.interruptFooter = [...interruptParagraph];
    interruptParagraph.push(['footer']);

    const tokenizers = Parser.prototype.blockTokenizers;
    tokenizers.footer = tokenizeFooter;

    const methods = Parser.prototype.blockMethods;
    methods.splice(methods.indexOf('paragraph'), 0, 'footer');
  } else {
    // Support for remark-parse 9.0.0
    const data = this.data();

    if (data.micromarkExtensions) {
      data.micromarkExtensions.push(syntax());
    } else {
      data.micromarkExtensions = [syntax()];
    }

    if (data.fromMarkdownExtensions) {
      data.fromMarkdownExtensions.push(fromMarkdown);
    } else {
      data.fromMarkdownExtensions = [fromMarkdown];
    }
  }
}

module.exports.footers = footers;
