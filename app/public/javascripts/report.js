/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
function setChart(data, day) {
  Chartist.Line('.ct-chart', {
    labels: day,
    series: Object.values(data),
  }, {
    fullWidth: true,
    high: 120,
    onlyInteger: true,
    lineSmooth: Chartist.Interpolation.cardinal({
      tension: 0.1,
    }),
  });
}

function getData() {
  const year = $('#year').val();
  const month = $('#month').val();
  $.post('/reportData', { year, month }, (res, _) => {
    if (res.success) {
      setChart(res.data, res.allDay);
      $('#month').val(res.resMonth);
      $('#year').val(res.resYear);
    }
  });
}

$(document).ready(() => {
  const currentYear = new Date().getFullYear();
  for (let i = currentYear; i >= currentYear - 10; i -= 1) {
    $('#year').append(`<option value=${i}>${i}</option>`);
  }
  $('#month').val($('#curmonth').val());
  $.post('/reportData', (res, _) => {
    if (res.success) {
      setChart(res.data, res.allDay);
    }
  });
});
