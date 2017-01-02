const md = require('markdown-it')();
const fs = require('fs');
const R = require('ramda');

md.render('“Is that his design in settling here?”\n');
md.renderInline('“Design! Nonsense, how can you talk so! But it is very likely that he _may_ fall in love with one of them, and therefore you must visit him as soon as he comes.”\n');

const text_md = fs.readFileSync('text.md', 'utf8').toString();
const text_conll = fs.readFileSync('text.conll', 'utf8').toString();


var conlluEntryToObj = R.pipe(
  R.split('\n'),
  R.map(
    R.pipe(
      R.split('\t'),
      R.addIndex(R.map)((elm, idx) => {
        return (idx == 0) || (idx == 6) ? parseInt(elm) : elm;
      })
    )
  )
);
conlluEntryToObj(text_conll.split('\n\n')[1000])
var conlluObjToLine = R.pipe(
  R.map(R.nth(1)),
  R.join(' ')
)

R.pipe(
  R.split('\n\n'),
  R.nth(0),
  conlluEntryToObj,
  conlluObjToLine
)(text_conll)

var tryLine = (data_conll, data_text, idx = 0) => {
  const conll = R.pipe(
    R.split('\n\n'),
    R.nth(idx),
    conlluEntryToObj,
    conlluObjToLine
  )(text_conll);

  const text_ = R.pipe(
    R.split('\n'),
    R.filter( x => x.length > 0),
    R.nth(idx)
  )(data_text);

  return {
    idx,
    text_,
    conll
  }
}

// tryLine(text_conll, text_md, 350)

R.map(
    i => tryLine(text_conll, text_md, i),
    R.pipe(
      R.range(640),
      R.map(R.multiply(1))
    )(680)
  )


conlluEntryToObj(text_conll.split('\n\n')[1000])

// text_md.split('\n').filter(x => x.length < 1).length
// text_md.split('\n').filter(x => x.length > 0)[0]
// text_md.split('\n').filter(x => x.length > 0)[4]
text_md.split('\n').filter(x => x.length > 0)[1000]
text_md.split('\n').filter(x => x.length > 0)[999]

// text_conll.split('\n\n').length
// text_conll.split('\n\n')[0]
// text_conll.split('\n\n')[4]
text_conll.split('\n\n')[1000].split('\n')
conlluEntryToObj(text_conll.split('\n\n')[1000])[0]
