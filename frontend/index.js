$('#main-text').html(`<h3>Boo!</h3>`);

const wrap_str_html = (str, idx) => `<p class="line" index="${idx}">${str}</p>`;
const write_data_to_doc = R.pipe(
  R.addIndex(R.map)((elm, idx) => wrap_str_html(elm[1], idx)),
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
