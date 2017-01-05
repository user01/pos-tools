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
      R.replace(/[’‘]/g, '\''),
      R.replace(/[_\*]/g, ''),
      R.replace(/[^a-zA-Z\s\!\.\,\;\"\?]/g, ' '),
      R.replace(/[\;]/g, ','),
      R.replace(/\s+/g, ' '),
      R.trim
    )
  ),
  R.addIndex(R.map)((elm, idx) => [elm, idx]),
  R.filter(
    R.pipe(
      R.nth(0),
      R.length,
      R.gt(R.__, 0)
    )
  )
);

var clean_text_str = R.pipe(
  clean_text_lines,
  R.map(R.nth(0)),
  R.join('\n\n')
);
// fs.writeFileSync("fixed.text.txt", clean_text_str(text_md))

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
  R.filter(
    R.pipe(
      R.trim,
      R.length,
      R.gt(R.__, 0)
    )
  ),
  R.map(conllu_entry_to_obj)
);


var clean_str_to_chars = R.pipe(
  R.replace(/[^a-zA-Z]/g, ''),
  R.splitEvery(1),
  R.uniq,
  R.join('')
);
var conll_text_same = ([text, conll]) => {
  return R.equals(
    R.pipe(
      R.map(R.nth(1)),
      R.join(' '),
      clean_str_to_chars
    )(conll),
    R.pipe(
      R.nth(0),
      clean_str_to_chars
    )(text)
  );
};

var report_from_lines_objs = (lines, objs, omissions = []) => {
  // console.log(lines.length, objs.length, omissions.length);
  if (objs.length > lines.length) {
    console.error('Objects outnumber lines.');
    return [lines, objs, omissions];
  }
  const min_length = R.min(lines.length, objs.length);
  const pairs = R.zip(
    R.take(min_length, lines),
    R.take(min_length, objs)
  );

  // console.log(R.map(R.pipe(conll_text_same, R.not), pairs));
  const idx = R.findIndex(R.pipe(conll_text_same, R.not), pairs);
  // console.log(`Found index of ${idx}`);
  if (idx == -1) {
    // then they all match!
    return [lines, objs, omissions];
  }
  // idx shows where they differ.
  // idx text line must be removed, and recuse
  const text = lines[idx][0];
  const line = lines[idx][1] + 1; // Increment by 1, most editors count from 1
  const omissions_new = R.append({
    line,
    text
  }, omissions);
  return report_from_lines_objs(
    R.addIndex(R.filter)((elm, i) => i != idx, lines),
    objs,
    omissions_new);
};



var processText = (text, onComplete, warnOnOmissions = true) => {
  request.post({
    url: 'http://localhost:5005/text',
    timeout: 60 * 20 * 1000, // milliseconds of timeout
    body: clean_text_str(text)
  }, (error, response, body) => {
    if (error || response.statusCode != 200) {

      console.error("Error");
      console.error(response.statusCode);
      console.error(error);
      return;
    }
    const lines = clean_text_lines(text);
    const objs = conllu_file_to_objs(body);
    const [lines_final, objs_final, omissions] = report_from_lines_objs(lines, objs, []);
    if (omissions.length > 0) {
      R.pipe(
        R.map(R.prop('line')),
        R.join(', '),
        t => console.warn(`Warning: ${omissions.length} lines were omitted from final results: ${t}`)
      )(omissions);
    }
    onComplete(lines_final, objs_final, omissions);
  });
};

var t, c, o;
processText(text_md.substring(0,5000), (text, conllu, omissions) => {
  t = text;
  c = conllu;
  o = omissions;
  console.log('done');
});
