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


$.ajax({
  url: 'text.json',
  success: (data) => {
    write_data_to_doc(data);

    $('.line').click((elm) => {

      const payload = R.pipe(
        parseInt,
        R.nth(R.__, data),
        R.nth(2),
        conll_arr_to_str
      )($(elm.srcElement).attr('index'));

      $('#input').val(payload);
      $('#input').trigger('keyup');
    });

  }
});
