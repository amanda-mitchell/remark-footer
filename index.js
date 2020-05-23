const { tokenizeFooter } = require('./tokenize');

function footers() {
  const Parser = this.Parser;

  const interruptParagraph = Parser.prototype.interruptParagraph;
  Parser.prototype.interruptFooter = [...interruptParagraph];
  interruptParagraph.push(['footer']);

  const tokenizers = Parser.prototype.blockTokenizers;
  tokenizers.footer = tokenizeFooter;

  const methods = Parser.prototype.blockMethods;
  methods.splice(methods.indexOf('paragraph'), 0, 'footer');
}

module.exports.footers = footers;
