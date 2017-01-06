$('#main-text').html(`<h3>Boo!</h3>`);

const markup_str = (conllu) => {
  return R.pipe(
    R.map(arr => `<span class="type-${arr[3]} token">${arr[1]}</span>`),
    R.join(' ')
  )(conllu);
}

const wrap_str_html = (elm, idx) => `<p class="line" index="${idx}">
    ${markup_str(elm[2])}
  </p>`;
const write_data_to_doc = R.pipe(
  R.addIndex(R.map)((elm, idx) => wrap_str_html(elm, idx)),
  R.join(`\n\n`),
  s => $('#main-text').html(s)
);
const conll_arr_to_str = R.pipe(
  R.map(R.join('\t')),
  R.append(''),
  R.join('\n')
);
const conll_arr_to_styles = R.pipe(
  R.addIndex(R.map)((elm, idx) => {
    const id = elm[3];
    return `# visual-style ${idx + 1}	bgColor:${conll_to_style(id,false)}
# visual-style ${idx + 1}	fgColor:${conll_to_style(id,true)}`;
  }),
  R.join('\n')
);
const conll_to_style = (id, foreground) => {
  switch (id) {
    case 'VERB':
      return foreground ? 'white' : '#33a02c';
    case 'PRON':
      return foreground ? 'black' : 'pink';
    case 'DET':
      return foreground ? 'black' : '#ff7f00';
    case 'NOUN':
      return foreground ? 'white' : '#e31a1c';
    case 'ADV':
      return foreground ? 'black' : '#b2df8a';
    case '.':
      return foreground ? 'white' : 'brown';
    case 'ADP':
      return foreground ? 'white' : '#984ea3';
    case 'ADJ':
      return foreground ? 'white' : '#1f78b4';
    case 'NUM':
      return foreground ? 'black' : '#cab2d6';
    case 'CONJ':
      return foreground ? 'black' : '#fdbf6f';
    default:
  }
  return foreground ? 'yellow' : 'pink';
};

$.ajax({
  url: 'text.json',
  success: (data) => {
    write_data_to_doc(data);

    $('.line').click((elm) => {

      const conll_arr = R.pipe(
        parseInt,
        R.nth(R.__, data),
        R.nth(2)
      )($(elm.srcElement).attr('index'));

      const payload = conll_arr_to_str(conll_arr);
      const header = conll_arr_to_styles(conll_arr);

      $('#input').val(`${header}\n${payload}`);
      $('#input').trigger('keyup');
    });

  }
});
