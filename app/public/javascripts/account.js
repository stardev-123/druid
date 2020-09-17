$(() => {
  $('#edit-profile').ajaxForm(res => {
    if (res.success) window.location.href = '/account';
  });
  $('#save-card').ajaxForm(res => {
    if (res.success) window.location.href = '/account';
  });
});
function addd() {
  if ($('#password').val() === '') {
    $('#password').addClass('is-invalid');
  } else if ($('#password').val() !== $('#confirm-password').val()) {
    $('#confirm-password').addClass('is-invalid');
  } else {
    $('#edit-password').ajaxForm(res => {
      if (res.success)window.location.href = '/account';
    });
  }
}

$(document).ready(() => {
  $('#btn-password').click(addd);
  $('#remove').click(() => {
    const cardNumber = $('#cardNumber').val();
    $.post('/removeCard', [cardNumber], (res, _status) => {
      if (res.success) {
        window.location.href = '/account';
      }
    });
  });
});
