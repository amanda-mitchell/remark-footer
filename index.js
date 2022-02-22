import syntax from '@amanda-mitchell/micromark-extension-footer';

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

export function footers() {
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
