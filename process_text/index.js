var md = require('markdown-it')();
var fs = require('fs');
var R = require('ramda');
var request = require('request');

var text_md = fs.readFileSync('text.md', 'utf8').toString();
var text_conll = fs.readFileSync('text.conll', 'utf8').toString();

var clean_text_lines = R.pipe(
  R.split('\n'),
  R.map(
    R.pipe(
      R.trim,
      R.replace(/["“”]/g, '"'),
      R.replace(/[_]/g, ''),
      R.replace(/[^a-zA-Z\s\!\.\,\;\"\?]/g, ' '),
      R.replace(/[\;]/g, ','),
      R.replace(/:^/g, '.'),
      R.replace(/\s+/g, ' ')
    )
  ),
  R.filter(
    R.pipe(
      R.length,
      R.gt(R.__, 0)
    )
  ),
  // R.join('\n\n')
  R.identity
);

var clean_text_str = R.pipe(
  clean_text_lines,
  R.join('\n\n')
);

var conllu_entry_to_obj = R.pipe(
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

var conllu_file_to_objs = R.pipe(
  R.split('\n\n'),
  R.map(conllu_entry_to_obj)
);


var processText = (text, onComplete) => {
  request.post({
    url: 'http://localhost:5005/text',
    body: clean_text_str(text)
  }, (error, response, body) => {
    if (error || response.statusCode != 200) {

      console.error("Error");
      console.error(error);
      return;
    }
    // console.log(body)
    const lines = clean_text_lines(text);
    const objs = conllu_file_to_objs(body);
    if (lines.length != objs.length) {
      console.warn(`Length mismatch with text (${lines.length}) and pos (${objs.length})`);
    }
    onComplete(
      lines,
      objs
    );
  });
}

var t, c;
processText(text_md, (text,conllu) => {
  t = text;
  c = conllu;
  console.log('done');
})


t
c

t.length
c.length

var conlluObjToLine = R.pipe(
  R.map(R.nth(1)),
  R.join(' ')
)






var tryLine = (data_conll, data_text, idx = 0) => {
  const conll = R.pipe(
    R.nth(idx),
    conlluObjToLine
  )(data_conll);

  const text_ = R.pipe(
    R.filter(x => x.length > 0),
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
  i => tryLine(c, t, i),
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
