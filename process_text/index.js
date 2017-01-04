var md = require('markdown-it')();
var fs = require('fs');
var R = require('ramda');
var request = require('request');

var text_md = fs.readFileSync('text.md', 'utf8').toString();
var text_conll = fs.readFileSync('text.conll', 'utf8').toString();


var clean_text_lines = R.pipe(
  R.replace(/:\n\n/g, ', '),
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
}

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
  const line = lines[idx][1];
  const omissions_new = R.append({
    line,
    text
  }, omissions);
  return report_from_lines_objs(
    R.addIndex(R.filter)((elm, i) => i != idx, lines),
    objs,
    omissions_new);
};



var processText = (text, onComplete) => {
  request.post({
    url: 'http://localhost:5005/text',
    // timeout: 60 * 20 * 1000, // milliseconds of timeout
    body: clean_text_str(text)
  }, (error, response, body) => {
    if (error || response.statusCode != 200) {

      console.error("Error");
      console.error(response.statusCode);
      console.error(error);
      return;
    }
    // console.log(body)
    const lines = clean_text_lines(text);
    const objs = conllu_file_to_objs(body);
    if (lines.length != objs.length) {
      console.warn(`Length mismatch with text (${lines.length}) and pos (${objs.length})`);
    }
    onComplete(lines, objs, null)
    // const [lines_final, objs_final, omissions] = report_from_lines_objs(lines, objs, []);
    // onComplete(lines_final, objs_final, omissions);
  });
}

var t, c, o;
processText(text_md, (text, conllu, omissions) => {
  t = text;
  c = conllu;
  o = omissions;
  console.log('done');
});

// R.map(conll_text_same, R.zip(t,c))
// t.length
// c.length

// var [lines_final, objs_final, omissions] = report_from_lines_objs(t, c, []);

// processText(`
// “Believe me, my dear Miss Elizabeth, that your modesty, so far from doing you any disservice, rather adds to your other perfections. You would have been less amiable in my eyes had there _not_ been this little unwillingness; but allow me to assure you, that I have your respected mother’s permission for this address. You can hardly doubt the purport of my discourse, however your natural delicacy may lead you to dissemble; my attentions have been too marked to be mistaken. Almost as soon as I entered the house, I singled you out as the companion of my future life. But before I am run away with by my feelings on this subject, perhaps it would be advisable for me to state my reasons for marrying--and, moreover, for coming into Hertfordshire with the design of selecting a wife, as I certainly did.”
// `,
//   (text, conllu) => {
//     console.log('text', text);
//     console.log('conllu', conllu);
//   })






var tryLine = (data_conll, data_text, idx = 0) => {
  const conll = R.pipe(
    R.nth(idx),
    R.map(R.nth(1)),
    R.join(' ')
  )(data_conll);

  const text_ = R.pipe(
    R.filter(x => x.length > 0),
    R.nth(idx)
  )(data_text);

  if (!R.is(String, data_conll)) {
    console.error(data_conll);
  }
  const conll_list = clean_str_to_chars(conll);
  const text_list = clean_str_to_chars(text_);
  const match = R.equals(conll_list, text_list);

  return {
    idx,
    text_,
    conll,
    match
  }
}

var tryPair = (data_conll, data_text, idx = 0) => {
  const conll = R.pipe(
    // R.nth(idx),
    // R.map(R.nth(1)),
    R.join(' ')
  )(data_conll);

  const text_ = R.pipe(
    // R.filter(x => x.length > 0),
    // R.nth(idx)
    R.identity
  )(data_text);

  const conll_list = clean_str_to_chars(conll);
  const text_list = clean_str_to_chars(text_);
  const match = R.equals(conll_list, text_list);

  return {
    idx,
    text_,
    conll,
    match
  }
}



var first_bad_line = (cc, tt) => {
  const min_length = R.min(cc.length, tt.length);
  const pairs = R.zip(
    R.take(min_length, cc),
    R.take(min_length, tt)
  );
  console.log(`Length ${min_length}`);

  return R.find(([conll, text], idx) => {
    return !R.equals(
      R.pipe(
        R.map(R.nth(1)),
        R.join(' '),
        clean_str_to_chars
      )(conll),
      clean_str_to_chars(text)
    );
  }, pairs);
}

first_bad_line(c, t)

// tryLine(text_conll, text_md, 350)
var try_lines = (start, end, step) => {
  return R.map(
    i => tryLine(c, t, i),
    R.pipe(
      R.range(start),
      R.map(R.multiply(step))
    )(end)
  )
}
try_lines(40, 90, 10)
try_lines(790, 810, 1)









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
